import React, { useState, useEffect, FormEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { SafetyChecklistSubmission, SafetyChecklistItemDef, SafetyChecklistSubmissionItem } from '../../types';
import { SAFETY_CHECKLIST_ITEMS_DEF } from '../../constants';
import { addSafetyChecklistSubmission, getSafetyChecklistSubmissions } from '../../services/firestoreService';
import firebase from 'firebase/compat/app';

const SafetyChecklistPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();
  
  const [submissions, setSubmissions] = useState<SafetyChecklistSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentChecklistItems, setCurrentChecklistItems] = useState<SafetyChecklistSubmissionItem[]>([]);
  const [overallNotes, setOverallNotes] = useState('');

  useEffect(() => {
    if (currentUser) {
      const fetchSubmissions = async () => {
        setIsLoading(true);
        try {
          const userSubmissions = await getSafetyChecklistSubmissions(currentUser.uid);
          setSubmissions(userSubmissions);
          handleFirestoreOutcome(null);
        } catch (err) {
          console.error("Error fetching safety checklist submissions:", err);
          handleFirestoreOutcome(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [currentUser, handleFirestoreOutcome]);

  const startNewChecklist = () => {
    const initialItems = SAFETY_CHECKLIST_ITEMS_DEF.map(def => ({
      itemId: def.id,
      text: translate(def.textKey as any), // Store translated text for record keeping
      isChecked: false,
      notes: '',
    }));
    setCurrentChecklistItems(initialItems);
    setOverallNotes('');
    setIsCompleting(true);
  };

  const handleItemToggle = (itemId: string) => {
    setCurrentChecklistItems(prev => prev.map(item => item.itemId === itemId ? { ...item, isChecked: !item.isChecked } : item));
  };
  
  const handleItemNotesChange = (itemId: string, notes: string) => {
    setCurrentChecklistItems(prev => prev.map(item => item.itemId === itemId ? { ...item, notes } : item));
  };

  const handleSubmitChecklist = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentChecklistItems.length === 0) return;
    if (isFirestoreOffline) {
      alert(translate('internetRequiredError'));
      return;
    }

    const submissionData: Omit<SafetyChecklistSubmission, 'id'|'completedAt'> = {
      userId: currentUser.uid,
      userName: currentUser.name,
      // shiftId: currentUser.currentShiftId, // Assuming this exists or is selected
      date: new Date().toISOString().split('T')[0],
      items: currentChecklistItems,
      overallNotes: overallNotes.trim() || undefined,
    };
    
    setIsLoading(true);
    try {
      const newSubmission = await addSafetyChecklistSubmission(submissionData);
      setSubmissions(prev => [newSubmission, ...prev]);
      setIsCompleting(false);
      handleFirestoreOutcome(null);
      alert(translate('safetyChecklistCompleted'));
    } catch (err) {
      console.error("Error submitting checklist:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  if (isLoading && !isCompleting) return <p className="text-center">{translate('loading')}</p>;

  if (isCompleting) {
    const groupedItems = SAFETY_CHECKLIST_ITEMS_DEF.reduce((acc, itemDef) => {
        const category = translate(`checklistCategory${itemDef.category}` as any) || itemDef.category;
        if (!acc[category]) acc[category] = [];
        const currentItemState = currentChecklistItems.find(ci => ci.itemId === itemDef.id);
        if (currentItemState) acc[category].push(currentItemState);
        return acc;
    }, {} as Record<string, SafetyChecklistSubmissionItem[]>);

    return (
      <form onSubmit={handleSubmitChecklist} className={`${cardClasses} space-y-6`} dir={language}>
        <h2 className={`text-xl font-bold text-center mb-4 text-csp-primary-text dark:text-csp-accent-dark ${language==='ar' ? 'font-cairo' : 'font-poppins'}`}>{translate('safetyChecklistTitle')}</h2>
        {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-4">
                <h3 className={`text-lg font-semibold text-csp-accent dark:text-csp-accent mb-2 border-b border-csp-secondary-text/20 pb-1 ${language==='ar' ? 'font-cairo' : 'font-poppins'}`}>{category}</h3>
                {items.map(item => (
                    <div key={item.itemId} className="py-2 border-b border-csp-secondary-text/10 last:border-b-0">
                        <div className="flex items-center justify-between">
                            <label htmlFor={item.itemId} className="text-sm flex-grow text-csp-primary-text dark:text-csp-primary-dark-text">{item.text}</label>
                            <input type="checkbox" id={item.itemId} checked={item.isChecked} onChange={() => handleItemToggle(item.itemId)} className="form-checkbox h-5 w-5 text-csp-accent rounded focus:ring-csp-accent ml-3 rtl:mr-3"/>
                        </div>
                        <input type="text" value={item.notes || ''} onChange={(e)=> handleItemNotesChange(item.itemId, e.target.value)} placeholder={translate('taskNotes')} className={`${inputBaseClasses} mt-1 text-xs p-1.5`} />
                    </div>
                ))}
            </div>
        ))}
        <div>
          <label htmlFor="overallNotes" className={labelBaseClasses}>{translate('checklistOverallNotes')}</label>
          <textarea id="overallNotes" value={overallNotes} onChange={e => setOverallNotes(e.target.value)} className={`${inputBaseClasses} min-h-[80px]`} />
        </div>
        <button type="submit" className={`${primaryButtonClasses} w-full`} disabled={isFirestoreOffline || isLoading}>
          {isLoading ? translate('loading') : translate('completeChecklist')}
        </button>
        <button type="button" onClick={() => setIsCompleting(false)} className="w-full mt-2 py-2 text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text hover:underline">{translate('cancel')}</button>
      </form>
    );
  }

  return (
    <div className="space-y-6" dir={language}>
      <button onClick={startNewChecklist} className={`${primaryButtonClasses} w-full`}>
        {translate('startChecklist')}
      </button>
      
      {submissions.length === 0 && !isLoading && <p className="text-center">{translate('noSafetyChecklists')}</p>}
      
      <div className="space-y-4">
        {submissions.map(sub => (
          <div key={sub.id} className={`${cardClasses}`}>
            <p className="font-semibold text-csp-primary-text dark:text-csp-primary-dark-text">{translate('checklistForShift')} {new Date(sub.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed by: {sub.userName} on {new Date(sub.completedAt.toDate()).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
            {/* Could add a button to view details */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyChecklistPage;