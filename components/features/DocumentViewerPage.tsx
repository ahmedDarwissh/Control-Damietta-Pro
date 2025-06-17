
import React from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';

const DocumentViewerPage: React.FC = () => {
  const { translate, language } = useLocalization();
  
  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";

  return (
    <div className={`${cardClasses} text-center`} dir={language}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-csp-accent dark:text-csp-accent-dark opacity-50">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      <p className="text-lg font-semibold text-csp-primary-text dark:text-csp-primary-dark-text">
        {translate('documentViewerTitle')}
      </p>
      <p className="mt-2 text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text">
        {language === 'ar' ? 'سيتم تطوير هذه الميزة لعرض المستندات المختلفة (PDF، Word، إلخ) مباشرة داخل التطبيق.' : 'This feature will be developed to display various documents (PDF, Word, etc.) directly within the app.'}
      </p>
       <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">({language === 'ar' ? 'قيد الإنشاء' : 'Under Construction'})</p>
    </div>
  );
};

export default DocumentViewerPage;
