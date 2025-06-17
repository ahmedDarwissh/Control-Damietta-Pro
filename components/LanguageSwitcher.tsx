import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Language } from '../types';

// Globe Icon SVG
const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 mr-1.5 rtl:ml-1.5 rtl:mr-0"> {/* Slightly larger icon */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C13.186 7.05 13 7.5 13 8c0 .5.186 1 .432 1.636m-1.414-1.414A3.939 3.939 0 0112 6c.995 0 1.921.356 2.607.936m0 0A3.913 3.913 0 0116.5 6c1.328 0 2.555.722 3.235 1.833m-2.822 4.675A3.91 3.91 0 0015 12c-1.328 0-2.555-.722-3.235-1.833M12 18.75a4.5 4.5 0 01-4.5-4.5H3m14.25 4.5a4.5 4.5 0 00-4.5-4.5H12m0 0V15" />
    </svg>
);

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, translate } = useLocalization();

  const toggleLanguage = () => {
    setLanguage(language === Language.EN ? Language.AR : Language.EN);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-csp-secondary dark:text-csp-base-dark-content hover:bg-csp-base-200 dark:hover:bg-csp-base-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-csp-base-100 dark:focus:ring-offset-csp-base-dark-200 focus:ring-csp-accent transition-colors duration-150 flex items-center"
      title={translate('language')}
    >
      <GlobeIcon />
      <span className={`font-semibold ${language === Language.EN ? 'text-csp-accent' : 'text-csp-primary dark:text-csp-base-dark-content'}`}>{language === Language.EN ? 'AR' : 'EN'}</span>
    </button>
  );
};

export default LanguageSwitcher;