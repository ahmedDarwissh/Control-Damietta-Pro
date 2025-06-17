
import React, { useState } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTasksForUser, getUserNotes } from '../../services/firestoreService'; // Assuming getUserNotes exists

const DataExportImportPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, handleFirestoreOutcome } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handleExportData = async () => {
    if (!currentUser) return;
    setIsExporting(true);
    setExportMessage(null);
    try {
      const tasks = await getTasksForUser(currentUser.uid);
      const notes = await getUserNotes(currentUser.uid); // Assuming this function exists
      
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        userId: currentUser.uid,
        tasks,
        notes,
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `control_shift_pro_export_${currentUser.uid}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      link.remove();

      setExportMessage(translate('dataExportedSuccessfully'));
      handleFirestoreOutcome(null);
    } catch (err) {
      console.error("Error exporting data:", err);
      setExportMessage(translate('errorExportingData'));
      handleFirestoreOutcome(err);
    } finally {
      setIsExporting(false);
    }
  };

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const buttonClasses = "py-2.5 px-5 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  return (
    <div className={`${cardClasses} space-y-6`} dir={language}>
      <div>
        <h3 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-accent-dark mb-2 ${language==='ar'?'font-cairo':'font-poppins'}`}>{translate('exportMyData')}</h3>
        <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text mb-3">
          {language === 'ar' ? 'قم بتصدير مهامك وملاحظاتك كملف JSON.' : 'Export your tasks and notes as a JSON file.'}
        </p>
        <button onClick={handleExportData} className={`${primaryButtonClasses} w-full sm:w-auto`} disabled={isExporting}>
          {isExporting ? translate('loading') : translate('exportMyData')}
        </button>
        {exportMessage && <p className={`text-xs mt-2 ${exportMessage === translate('dataExportedSuccessfully') ? 'text-csp-success' : 'text-csp-error'}`}>{exportMessage}</p>}
      </div>

      <hr className="border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10" />

      <div>
        <h3 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-accent-dark mb-2 ${language==='ar'?'font-cairo':'font-poppins'}`}>{translate('importMyData')}</h3>
        <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text mb-3">
          {language === 'ar' ? 'هذه الميزة قيد التطوير. قريباً ستتمكن من استيراد بياناتك.' : 'This feature is under development. Soon you will be able to import your data.'}
        </p>
        <input type="file" accept=".json" className="block w-full text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-csp-accent/10 file:text-csp-accent dark:file:bg-csp-accent-dark/20 dark:file:text-csp-accent-dark hover:file:bg-csp-accent/20 dark:hover:file:bg-csp-accent-dark/30 mb-3" disabled />
        <button className={`${primaryButtonClasses} w-full sm:w-auto opacity-50 cursor-not-allowed`} disabled>
          {translate('importMyData')}
        </button>
      </div>
    </div>
  );
};

export default DataExportImportPage;
