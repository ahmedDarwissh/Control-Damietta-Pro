import React, { useState, useEffect, FormEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { PersonalGoal } from '../../types';
import { addPersonalGoal, getPersonalGoalsForUser, updatePersonalGoal, deletePersonalGoal } from '../../services/firestoreService';
import { GOAL_CATEGORIES_LIST } from '../../constants';
import firebase from 'firebase/compat/app';

const GoalSettingPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();

  const [goals, setGoals] = useState<PersonalGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<'personal' | 'professional' | 'health' | 'finance' | 'learning'>(GOAL_CATEGORIES_LIST[0].id as any);
  const [editingGoal, setEditingGoal] = useState<PersonalGoal | null>(null);

  useEffect(() => {
    if (currentUser) {
      const fetchGoals = async () => {
        setIsLoading(true);
        try {
          const userGoals = await getPersonalGoalsForUser(currentUser.uid);
          setGoals(userGoals.sort((a,b) => (a.isAchieved ? 1 : -1) - (b.isAchieved ? 1 : -1) || new Date(a.targetDate || 0).getTime() - new Date(b.targetDate || 0).getTime() ));
          handleFirestoreOutcome(null);
        } catch (err) {
          console.error("Error fetching goals:", err);
          handleFirestoreOutcome(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGoals();
    }
  }, [currentUser, handleFirestoreOutcome]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setTargetDate(''); 
    setCategory(GOAL_CATEGORIES_LIST[0].id as any);
    setEditingGoal(null); setShowForm(false);
  };

  const handleEditGoal = (goal: PersonalGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTargetDate(goal.targetDate || '');
    setCategory(goal.category);
    setShowForm(true);
  };

  const handleSubmitGoal = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim()) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }

    const goalData = {
      userId: currentUser.uid,
      title,
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
      category,
      isAchieved: editingGoal ? editingGoal.isAchieved : false,
    };
    
    setIsLoading(true);
    try {
      if (editingGoal) {
        await updatePersonalGoal(editingGoal.id, goalData);
        setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...editingGoal, ...goalData, updatedAt: firebase.firestore.Timestamp.now() } : g).sort((a,b) => (a.isAchieved ? 1 : -1) - (b.isAchieved ? 1 : -1) || new Date(a.targetDate || 0).getTime() - new Date(b.targetDate || 0).getTime() ));
      } else {
        const newGoal = await addPersonalGoal(goalData);
        setGoals(prev => [newGoal, ...prev].sort((a,b) => (a.isAchieved ? 1 : -1) - (b.isAchieved ? 1 : -1) || new Date(a.targetDate || 0).getTime() - new Date(b.targetDate || 0).getTime() ));
      }
      resetForm();
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error saving goal:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm(translate('confirmDeleteGoal'))) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }
    setIsLoading(true);
    try {
      await deletePersonalGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error deleting goal:", err);
      handleFirestoreOutcome(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAchieved = async (goal: PersonalGoal) => {
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }
    setIsLoading(true);
    try {
        await updatePersonalGoal(goal.id, { isAchieved: !goal.isAchieved });
        setGoals(prev => prev.map(g => g.id === goal.id ? {...g, isAchieved: !g.isAchieved, updatedAt: firebase.firestore.Timestamp.now()} : g).sort((a,b) => (a.isAchieved ? 1 : -1) - (b.isAchieved ? 1 : -1) || new Date(a.targetDate || 0).getTime() - new Date(b.targetDate || 0).getTime() ));
        handleFirestoreOutcome(null);
    } catch (err) {
        console.error("Error toggling goal status:", err);
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

  return (
    <div className="space-y-6" dir={language}>
      <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className={`${primaryButtonClasses} w-full`}>
        {showForm ? translate('cancel') : translate('addGoal')}
      </button>

      {showForm && (
        <form onSubmit={handleSubmitGoal} className={`${cardClasses} space-y-4`}>
          <h3 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-accent-dark ${language==='ar'?'font-cairo':'font-poppins'}`}>{editingGoal ? translate('editGoal') : translate('addGoal')}</h3>
          <div><label htmlFor="title" className={labelBaseClasses}>{translate('goalTitleLabel')}</label><input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputBaseClasses} required /></div>
          <div><label htmlFor="description" className={labelBaseClasses}>{translate('goalDescriptionLabel')}</label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className={`${inputBaseClasses} min-h-[80px]`} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="targetDate" className={labelBaseClasses}>{translate('goalTargetDateLabel')}</label><input type="date" id="targetDate" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputBaseClasses} /></div>
            <div><label htmlFor="category" className={labelBaseClasses}>{translate('goalCategoryLabel')}</label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value as any)} className={inputBaseClasses}>
                    {GOAL_CATEGORIES_LIST.map(cat => <option key={cat.id} value={cat.id}>{translate(cat.labelKey as any)}</option>)}
                </select>
            </div>
          </div>
          <button type="submit" className={primaryButtonClasses} disabled={isFirestoreOffline || isLoading}>{isLoading ? translate('loading') : translate('saveGoal')}</button>
        </form>
      )}

      {isLoading && goals.length === 0 && <p className="text-center">{translate('loading')}</p>}
      {!isLoading && goals.length === 0 && <p className="text-center">{translate('noGoals')}</p>}

      <div className="space-y-3">
        {goals.map(goal => (
          <div key={goal.id} className={`${cardClasses} ${goal.isAchieved ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`font-semibold ${goal.isAchieved ? 'line-through' : ''} text-csp-primary-text dark:text-csp-primary-dark-text`}>{goal.title}</h4>
                <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text">{translate(GOAL_CATEGORIES_LIST.find(c=>c.id===goal.category)?.labelKey as any || goal.category)}</p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right rtl:text-left">
                {goal.targetDate && <p>{translate('goalTargetDateLabel')}: {new Date(goal.targetDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA')}</p>}
                <p className={`font-medium ${goal.isAchieved ? 'text-csp-success' : 'text-yellow-500'}`}>{goal.isAchieved ? translate('statusAchieved') : translate('statusInProgressGoal')}</p>
              </div>
            </div>
            {goal.description && <p className="text-sm italic text-gray-400 dark:text-gray-500 mt-1">"{goal.description}"</p>}
            <div className="mt-3 flex space-x-2 rtl:space-x-reverse justify-end items-center">
                <button onClick={() => handleToggleAchieved(goal)} className={`text-xs px-2 py-1 rounded ${goal.isAchieved ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-csp-success/80 text-white'}`}>{goal.isAchieved ? translate('markAsInProgress') : translate('markAsAchieved')}</button>
                {!goal.isAchieved && <button onClick={() => handleEditGoal(goal)} className="text-blue-500 hover:underline text-xs">✏️ {translate('edit')}</button>}
                <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-500 hover:underline text-xs">🗑️ {translate('delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalSettingPage;