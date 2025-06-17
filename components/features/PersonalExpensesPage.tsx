import React, { useState, useEffect, FormEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { PersonalExpense } from '../../types';
import { addPersonalExpense, getPersonalExpensesForUser, updatePersonalExpense, deletePersonalExpense } from '../../services/firestoreService';
import { EXPENSE_CATEGORIES_LIST } from '../../constants';
import firebase from 'firebase/compat/app';

const PersonalExpensesPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();

  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>(''); // Use string for input
  const [category, setCategory] = useState(EXPENSE_CATEGORIES_LIST[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [editingExpense, setEditingExpense] = useState<PersonalExpense | null>(null);

  useEffect(() => {
    if (currentUser) {
      const fetchExpenses = async () => {
        setIsLoading(true);
        try {
          const userExpenses = await getPersonalExpensesForUser(currentUser.uid);
          setExpenses(userExpenses);
          handleFirestoreOutcome(null);
        } catch (err) {
          console.error("Error fetching expenses:", err);
          handleFirestoreOutcome(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchExpenses();
    }
  }, [currentUser, handleFirestoreOutcome]);

  const resetForm = () => {
    setDescription(''); setAmount(''); setCategory(EXPENSE_CATEGORIES_LIST[0].id);
    setDate(new Date().toISOString().split('T')[0]); setNotes('');
    setEditingExpense(null); setShowForm(false);
  };

  const handleEditExpense = (expense: PersonalExpense) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDate(expense.date);
    setNotes(expense.notes || '');
    setShowForm(true);
  };

  const handleSubmitExpense = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !description.trim() || !amount.trim() || isNaN(parseFloat(amount))) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }

    const expenseData = {
      userId: currentUser.uid,
      description,
      amount: parseFloat(amount),
      category,
      date,
      notes: notes.trim() || undefined,
    };
    
    setIsLoading(true);
    try {
      if (editingExpense) {
        await updatePersonalExpense(editingExpense.id, expenseData);
        setExpenses(prev => prev.map(ex => ex.id === editingExpense.id ? { ...editingExpense, ...expenseData } : ex));
      } else {
        const newExpense = await addPersonalExpense(expenseData);
        setExpenses(prev => [newExpense, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      resetForm();
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error saving expense:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm(translate('confirmDeleteExpense'))) return;
    if (isFirestoreOffline) {
      alert(translate('internetRequiredError'));
      return;
    }
    setIsLoading(true);
    try {
      await deletePersonalExpense(expenseId);
      setExpenses(prev => prev.filter(ex => ex.id !== expenseId));
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error deleting expense:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalThisMonth = expenses
    .filter(ex => new Date(ex.date).getMonth() === new Date().getMonth() && new Date(ex.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, ex) => sum + ex.amount, 0);

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  return (
    <div className="space-y-6" dir={language}>
      <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className={`${primaryButtonClasses} w-full`}>
        {showForm ? translate('cancel') : translate('addExpense')}
      </button>

      {showForm && (
        <form onSubmit={handleSubmitExpense} className={`${cardClasses} space-y-4`}>
          <h3 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-accent-dark ${language==='ar'?'font-cairo':'font-poppins'}`}>{editingExpense ? translate('editExpense') : translate('addExpense')}</h3>
          <div><label htmlFor="description" className={labelBaseClasses}>{translate('expenseDescriptionLabel')}</label><input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className={inputBaseClasses} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="amount" className={labelBaseClasses}>{translate('expenseAmountLabel')}</label><input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className={inputBaseClasses} step="0.01" required /></div>
            <div><label htmlFor="category" className={labelBaseClasses}>{translate('expenseCategoryLabel')}</label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputBaseClasses}>
                    {EXPENSE_CATEGORIES_LIST.map(cat => <option key={cat.id} value={cat.id}>{translate(cat.labelKey as any)}</option>)}
                </select>
            </div>
          </div>
          <div><label htmlFor="date" className={labelBaseClasses}>{translate('expenseDateLabel')}</label><input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={inputBaseClasses} required /></div>
          <div><label htmlFor="notes" className={labelBaseClasses}>{translate('taskNotes')}</label><input type="text" id="notes" value={notes} onChange={e => setNotes(e.target.value)} className={inputBaseClasses} /></div>
          <button type="submit" className={primaryButtonClasses} disabled={isFirestoreOffline || isLoading}>{isLoading ? translate('loading') : translate('saveExpense')}</button>
        </form>
      )}
      
      <div className={`${cardClasses} text-center`}>
        <p className="text-md font-semibold text-csp-primary-text dark:text-csp-primary-dark-text">{translate('totalExpenses', totalThisMonth.toFixed(2))}</p>
      </div>

      {isLoading && expenses.length === 0 && <p className="text-center">{translate('loading')}</p>}
      {!isLoading && expenses.length === 0 && <p className="text-center">{translate('noExpenses')}</p>}

      <div className="space-y-3">
        {expenses.map(exp => (
          <div key={exp.id} className={`${cardClasses}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-csp-primary-text dark:text-csp-primary-dark-text">{exp.description}</h4>
                <p className="text-sm text-csp-accent dark:text-csp-accent-dark">EGP {exp.amount.toFixed(2)}</p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right rtl:text-left">
                <p>{new Date(exp.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA')}</p>
                <p>{translate(EXPENSE_CATEGORIES_LIST.find(c=>c.id === exp.category)?.labelKey as any || exp.category)}</p>
              </div>
            </div>
            {exp.notes && <p className="text-xs italic text-gray-400 mt-1">"{exp.notes}"</p>}
            <div className="mt-2 flex space-x-2 rtl:space-x-reverse justify-end">
                <button onClick={() => handleEditExpense(exp)} className="text-blue-500 hover:underline text-xs">✏️ {translate('edit')}</button>
                <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-500 hover:underline text-xs">🗑️ {translate('delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalExpensesPage;