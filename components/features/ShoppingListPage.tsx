
import React, { useState, useEffect, FormEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingList, ShoppingListItem } from '../../types';
import { 
  addShoppingList, 
  getShoppingListsForUser, 
  updateShoppingList, 
  deleteShoppingList 
} from '../../services/firestoreService';
import firebase from 'firebase/compat/app';

const ShoppingListPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();

  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showListForm, setShowListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [showItemFormForListId, setShowItemFormForListId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  useEffect(() => {
    if (currentUser) {
      const fetchLists = async () => {
        setIsLoading(true);
        try {
          const userLists = await getShoppingListsForUser(currentUser.uid);
          setShoppingLists(userLists);
          handleFirestoreOutcome(null);
        } catch (err) {
          console.error("Error fetching shopping lists:", err);
          handleFirestoreOutcome(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchLists();
    }
  }, [currentUser, handleFirestoreOutcome]);

  const handleAddOrUpdateList = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!currentUser || !newListName.trim()) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }
    
    setIsLoading(true);
    try {
      if (editingList) { // Update existing list name
        const updatedListData = { ...editingList, name: newListName, updatedAt: firebase.firestore.Timestamp.now() };
        await updateShoppingList(editingList.id, { name: newListName });
        setShoppingLists(prev => prev.map(l => l.id === editingList.id ? updatedListData : l));
      } else { // Add new list
        const listData: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'> = {
          userId: currentUser.uid,
          name: newListName,
          items: [],
        };
        const newList = await addShoppingList(listData);
        setShoppingLists(prev => [newList, ...prev]);
      }
      setNewListName('');
      setShowListForm(false);
      setEditingList(null);
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error saving shopping list:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm(translate('confirmDeleteList'))) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }
    setIsLoading(true);
    try {
      await deleteShoppingList(listId);
      setShoppingLists(prev => prev.filter(l => l.id !== listId));
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error deleting shopping list:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItemToList = async (listId: string) => {
    if (!currentUser || !newItemName.trim()) return;
    const listIndex = shoppingLists.findIndex(l => l.id === listId);
    if (listIndex === -1) return;

    const newItem: ShoppingListItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Simple unique ID
      name: newItemName,
      quantity: newItemQuantity.trim() || undefined,
      isPurchased: false,
    };
    
    const updatedList = { ...shoppingLists[listIndex] };
    updatedList.items = [...updatedList.items, newItem];
    updatedList.updatedAt = firebase.firestore.Timestamp.now();

    setIsLoading(true);
    try {
      await updateShoppingList(listId, { items: updatedList.items });
      setShoppingLists(prev => prev.map(l => l.id === listId ? updatedList : l));
      setNewItemName('');
      setNewItemQuantity('');
      setShowItemFormForListId(null); // Close item form
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error adding item to list:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItemPurchased = async (listId: string, itemId: string) => {
    const listIndex = shoppingLists.findIndex(l => l.id === listId);
    if (listIndex === -1) return;
    
    const updatedList = { ...shoppingLists[listIndex] };
    updatedList.items = updatedList.items.map(item => 
      item.id === itemId ? { ...item, isPurchased: !item.isPurchased } : item
    );
    updatedList.updatedAt = firebase.firestore.Timestamp.now();

    // Optimistic update UI first
    setShoppingLists(prev => prev.map(l => l.id === listId ? updatedList : l));

    try {
      await updateShoppingList(listId, { items: updatedList.items });
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error updating item status:", err);
      // Revert optimistic update if Firebase fails
      setShoppingLists(prev => prev.map(l => l.id === listId ? shoppingLists[listIndex] : l));
      handleFirestoreOutcome(err);
    }
  };
  
  const handleDeleteItem = async (listId: string, itemId: string) => {
    const listIndex = shoppingLists.findIndex(l => l.id === listId);
    if (listIndex === -1) return;

    const originalList = shoppingLists[listIndex];
    const updatedItems = originalList.items.filter(item => item.id !== itemId);
    const updatedList = { ...originalList, items: updatedItems, updatedAt: firebase.firestore.Timestamp.now() };
    
    setShoppingLists(prev => prev.map(l => l.id === listId ? updatedList : l));

    try {
      await updateShoppingList(listId, { items: updatedItems });
      handleFirestoreOutcome(null);
    } catch (err) {
       console.error("Error deleting item:", err);
       setShoppingLists(prev => prev.map(l => l.id === listId ? originalList : l)); // Revert
       handleFirestoreOutcome(err);
    }
  };


  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;
  const secondaryButtonClasses = `${buttonClasses} bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text hover:bg-opacity-80`;


  return (
    <div className="space-y-6" dir={language}>
      <button 
        onClick={() => { setShowListForm(!showListForm); setEditingList(null); if(showListForm) setNewListName(''); }} 
        className={`${primaryButtonClasses} w-full`}
      >
        {showListForm ? translate('cancel') : translate('addShoppingList')}
      </button>

      {showListForm && (
        <form onSubmit={handleAddOrUpdateList} className={`${cardClasses} space-y-3`}>
          <h3 className={`text-md font-semibold text-csp-primary-text dark:text-csp-accent-dark ${language==='ar'?'font-cairo':'font-poppins'}`}>
            {editingList ? translate('edit') : translate('addShoppingList')}
          </h3>
          <div>
            <label htmlFor="newListName" className={labelBaseClasses}>{translate('newListNamePlaceholder')}</label>
            <input type="text" id="newListName" value={newListName} onChange={e => setNewListName(e.target.value)} className={inputBaseClasses} required />
          </div>
          <button type="submit" className={primaryButtonClasses} disabled={isFirestoreOffline || isLoading}>
            {isLoading ? translate('loading') : (editingList ? translate('saveChanges') : translate('addShoppingList'))}
          </button>
        </form>
      )}

      {isLoading && shoppingLists.length === 0 && <p className="text-center">{translate('loading')}</p>}
      {!isLoading && shoppingLists.length === 0 && <p className="text-center">{translate('noShoppingLists')}</p>}

      <div className="space-y-4">
        {shoppingLists.map(list => (
          <div key={list.id} className={cardClasses}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-accent-dark ${language==='ar'?'font-cairo':'font-poppins'}`}>{list.name}</h3>
              <div className="space-x-2 rtl:space-x-reverse">
                <button onClick={() => { setShowListForm(true); setEditingList(list); setNewListName(list.name); }} className="text-blue-500 hover:underline text-xs">✏️ {translate('edit')}</button>
                <button onClick={() => handleDeleteList(list.id)} className="text-red-500 hover:underline text-xs">🗑️ {translate('deleteList')}</button>
              </div>
            </div>
            
            <ul className="space-y-2 mb-3">
              {list.items.map(item => (
                <li key={item.id} className={`flex items-center justify-between p-2 rounded-md ${item.isPurchased ? 'bg-csp-success/10 opacity-70' : 'bg-csp-secondary-bg dark:bg-csp-primary-dark'}`}>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input 
                      type="checkbox" 
                      checked={item.isPurchased} 
                      onChange={() => handleToggleItemPurchased(list.id, item.id)} 
                      className="form-checkbox h-5 w-5 text-csp-accent rounded focus:ring-csp-accent"
                      disabled={isFirestoreOffline}
                    />
                    <div>
                      <span className={`text-sm ${item.isPurchased ? 'line-through text-gray-500' : 'text-csp-primary-text dark:text-csp-primary-dark-text'}`}>{item.name}</span>
                      {item.quantity && <span className="text-xs text-gray-400 ml-1 rtl:mr-1">({item.quantity})</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteItem(list.id, item.id)} className="text-red-400 hover:text-red-600 text-xs p-1" disabled={isFirestoreOffline}>✕</button>
                </li>
              ))}
               {list.items.length === 0 && <p className="text-xs text-center text-gray-400 py-2">{language === 'ar' ? 'لا توجد عناصر في هذه القائمة.' : 'No items in this list.'}</p>}
            </ul>

            {showItemFormForListId === list.id ? (
              <form onSubmit={(e) => { e.preventDefault(); handleAddItemToList(list.id); }} className="space-y-2 border-t pt-3 mt-3 border-csp-secondary-text/10">
                <div className="flex gap-2">
                    <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder={translate('itemNamePlaceholder')} className={`${inputBaseClasses} flex-grow`} required />
                    <input type="text" value={newItemQuantity} onChange={e => setNewItemQuantity(e.target.value)} placeholder={translate('itemQuantityPlaceholder')} className={`${inputBaseClasses} w-1/3`} />
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setShowItemFormForListId(null)} className={`${secondaryButtonClasses} flex-grow`}>{translate('cancel')}</button>
                    <button type="submit" className={`${primaryButtonClasses} flex-grow`} disabled={isFirestoreOffline || isLoading}>{translate('addItemToList')}</button>
                </div>
              </form>
            ) : (
              <button onClick={() => {setShowItemFormForListId(list.id); setNewItemName(''); setNewItemQuantity('');}} className={`${secondaryButtonClasses} w-full text-xs mt-2`}>+ {translate('addItemToList')}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingListPage;
