import React, { useState, useEffect, FormEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { EquipmentLogEntry } from '../../types';
import { addEquipmentLogEntry, getEquipmentLogEntries, updateEquipmentLogEntry } from '../../services/firestoreService';
import firebase from 'firebase/compat/app';

const EquipmentLogPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome, isFirestoreOffline } = useAuth();

  const [logEntries, setLogEntries] = useState<EquipmentLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [equipmentName, setEquipmentName] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [editingEntry, setEditingEntry] = useState<EquipmentLogEntry | null>(null);

  useEffect(() => {
    const fetchLogEntries = async () => {
      setIsLoading(true);
      try {
        const entries = await getEquipmentLogEntries();
        setLogEntries(entries);
        handleFirestoreOutcome(null);
      } catch (err) {
        console.error("Error fetching equipment log entries:", err);
        handleFirestoreOutcome(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogEntries();
  }, [handleFirestoreOutcome]);

  const resetForm = () => {
    setEquipmentName('');
    setIssueDescription('');
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleSubmitIssue = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !equipmentName.trim() || !issueDescription.trim()) return;
    if (isFirestoreOffline) {
        alert(translate('internetRequiredError'));
        return;
    }

    const entryData = {
      equipmentName,
      issueDescription,
      reportedByUid: currentUser.uid,
      reporterName: currentUser.name,
      status: 'reported' as 'reported', // Default status
    };
    
    setIsLoading(true);
    try {
      if (editingEntry) { // This part is for admin update, simplified for now
        await updateEquipmentLogEntry(editingEntry.id, { ...entryData, status: editingEntry.status });
        setLogEntries(prev => prev.map(item => item.id === editingEntry.id ? { ...item, ...entryData, status: editingEntry.status, reportedAt: editingEntry.reportedAt } : item));
      } else {
        const newEntry = await addEquipmentLogEntry(entryData);
        setLogEntries(prev => [newEntry, ...prev]);
      }
      resetForm();
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error submitting equipment log:", err);
      handleFirestoreOutcome(err);
    } finally {
        setIsLoading(false);
    }
  };

  const getStatusColor = (status: EquipmentLogEntry['status']) => {
    if (status === 'resolved') return 'bg-csp-success/20 text-green-700 dark:text-green-300';
    if (status === 'in_progress') return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  };
  
  const getStatusText = (status: EquipmentLogEntry['status']) => {
    if (status === 'resolved') return translate('statusResolved');
    if (status === 'in_progress') return translate('statusInProgress');
    return translate('statusReported');
  }

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;
  const secondaryButtonClasses = `${buttonClasses} bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text hover:bg-opacity-80`;

  return (
    <div className="space-y-6" dir={language}>
      <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className={`${primaryButtonClasses} w-full`}>
        {showForm ? translate('cancel') : translate('reportNewIssue')}
      </button>

      {showForm && (
        <form onSubmit={handleSubmitIssue} className={`${cardClasses} space-y-4`}>
          <div>
            <label htmlFor="equipmentName" className={labelBaseClasses}>{translate('equipmentNameLabel')}</label>
            <input type="text" id="equipmentName" value={equipmentName} onChange={e => setEquipmentName(e.target.value)} className={inputBaseClasses} required />
          </div>
          <div>
            <label htmlFor="issueDescription" className={labelBaseClasses}>{translate('issueDescriptionLabel')}</label>
            <textarea id="issueDescription" value={issueDescription} onChange={e => setIssueDescription(e.target.value)} className={`${inputBaseClasses} min-h-[100px]`} required />
          </div>
          <button type="submit" className={primaryButtonClasses} disabled={isFirestoreOffline || isLoading}>
            {isLoading ? translate('loading') : translate('submitIssue')}
          </button>
        </form>
      )}

      {isLoading && logEntries.length === 0 && <p className="text-center">{translate('loading')}</p>}
      {!isLoading && logEntries.length === 0 && <p className="text-center">{translate('noEquipmentIssues')}</p>}

      <div className="space-y-4">
        {logEntries.map(entry => (
          <div key={entry.id} className={`${cardClasses}`}>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-csp-primary-text dark:text-csp-primary-dark-text">{entry.equipmentName}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                {getStatusText(entry.status)}
              </span>
            </div>
            <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1">{entry.issueDescription}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {translate('issueReportedByLabel')}: {entry.reporterName} - {new Date(entry.reportedAt.toDate()).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
            </p>
            {entry.adminNotes && <p className="text-xs italic mt-1 text-csp-accent dark:text-csp-accent-dark">Admin: {entry.adminNotes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentLogPage;