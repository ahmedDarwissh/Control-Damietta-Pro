import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';

const SavingsPage: React.FC = () => {
  const { translate, language } = useLocalization();

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title handled by main Header */}
      <div className="bg-csp-base-100 dark:bg-csp-base-dark-200 p-4 sm:p-6 rounded-xl shadow-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-csp-accent">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-xl text-csp-primary dark:text-csp-base-dark-content mb-3">
          {translate('savingsIntro')}
        </p>
        <p className="mt-4 text-csp-secondary dark:text-gray-400 max-w-md mx-auto">
          {language === 'ar' ? 'هذه الميزة قيد التطوير لتمكين الزملاء من تنظيم جمعياتهم الشهرية بسهولة وأمان. ترقبوا التحديثات!' : 'This feature is under development to enable colleagues to organize their monthly savings pools easily and securely. Stay tuned for updates!'}
        </p>
         <div className="mt-8 p-5 border border-dashed border-csp-base-300 dark:border-csp-secondary rounded-lg max-w-lg mx-auto">
             <button className="w-full py-3 px-4 bg-csp-primary dark:bg-csp-accent text-white dark:text-csp-primary font-semibold rounded-lg shadow-md hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all opacity-60 cursor-not-allowed">
                {language === 'ar' ? 'إنشاء جمعية جديدة (قريباً)' : 'Create New Pool (Coming Soon)'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SavingsPage;