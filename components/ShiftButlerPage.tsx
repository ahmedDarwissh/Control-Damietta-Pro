import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';

const ShiftButlerPage: React.FC = () => {
  const { translate, language } = useLocalization();

  return (
    <div className="space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}> {/* Increased spacing */}
      <h1 className={`text-3xl sm:text-4xl font-bold text-csp-primary dark:text-csp-base-100 mb-8 pb-3 border-b-4 border-csp-accent ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>
        {translate('shiftButler')}
      </h1>
      <div className="bg-csp-base-100 dark:bg-csp-base-dark-200 p-6 sm:p-10 rounded-xl shadow-xl text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mx-auto mb-6 text-csp-accent">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9.75 0h10.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6.75 21Z" />
        </svg>
        <p className="text-xl text-csp-primary dark:text-csp-base-dark-content mb-3">
          {translate('butlerIntro')}
        </p>
        <p className="mt-4 text-csp-secondary dark:text-gray-400 max-w-md mx-auto">
          {language === 'ar' ? 'سيقوم "فهلوي الوردية" بمساعدتك في معرفة معلومات ورديتك الحالية، ترتيب المهام، والحصول على اقتراحات ذكية لتنظيم يومك. قريباً بالذكاء الاصطناعي!' : 'The "Shift Butler" will assist you with information about your current shift, task organization, and smart suggestions to plan your day. Coming soon with AI!'}
        </p>
         <div className="mt-8 p-5 border border-dashed border-csp-base-300 dark:border-csp-secondary rounded-lg max-w-lg mx-auto">
            <textarea 
                placeholder={language === 'ar' ? "اسأل فهلوي الوردية... (مثال: مين الوردية اللي شغالة دلوقتي؟)" : "Ask the Shift Butler... (e.g., Which shift is currently active?)"}
                className="w-full p-3 border border-csp-base-300 dark:border-csp-secondary bg-csp-base-100 dark:bg-csp-base-dark-300 text-csp-base-content dark:text-csp-base-dark-content rounded-lg focus:ring-2 focus:ring-csp-accent focus:border-csp-accent resize-none transition-shadow"
                rows={3}
                disabled
            />
            <button className="mt-3 w-full py-3 px-4 bg-csp-primary dark:bg-csp-accent text-white dark:text-csp-primary font-semibold rounded-lg shadow-md hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all opacity-60 cursor-not-allowed">
                {language === 'ar' ? 'اسأل (قريباً)' : 'Ask (Coming Soon)'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftButlerPage;