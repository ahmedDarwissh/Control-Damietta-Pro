import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { COMPANY_LOGO_URL } from '../constants';

// Notice Icon SVG (More generic than just warning)
const NoticeIconSvg: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-12 h-12 text-csp-accent-dark dark:text-csp-accent"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);


interface DisclaimerScreenProps {
  onAgree: () => void;
  onExit: () => void;
}

const DisclaimerScreen: React.FC<DisclaimerScreenProps> = ({ onAgree, onExit }) => {
  const { translate, language } = useLocalization();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-csp-secondary-bg dark:bg-csp-primary-dark p-4 transition-colors duration-300`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-csp-primary dark:bg-csp-secondary-dark-bg shadow-xl rounded-lg p-5 sm:p-6 max-w-lg w-full border-t-4 border-csp-accent dark:border-csp-accent-dark">
        <div className="flex flex-col items-center mb-5">
          <NoticeIconSvg className="w-10 h-10 text-csp-accent dark:text-csp-accent-dark mb-3"/>
          <img src={COMPANY_LOGO_URL} alt={translate('appName')} className="w-36 h-auto mb-3 rounded-md" />
          <h1 className={`text-xl font-bold text-csp-primary-text dark:text-csp-primary-dark-text text-center ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>
            {translate('mandatoryDisclaimerTitle')}
          </h1>
        </div>

        <div className={`disclaimer-content text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text space-y-3 mb-5 max-h-[50vh] overflow-y-auto px-1 ${language === 'ar' ? 'font-tajawal text-right' : 'font-poppins text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <p>{translate('mandatoryDisclaimerWelcome')}</p>
          
          <h3 className="text-csp-primary-text dark:text-csp-accent-dark !text-base !font-semibold">{translate('mandatoryDisclaimerNoticeHeading')}</h3>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm">
            <li>{translate('mandatoryDisclaimerPoint1')}</li>
            <li>{translate('mandatoryDisclaimerPoint2')}</li>
            <li>{translate('mandatoryDisclaimerPoint3')}</li>
          </ul>
          <p>{translate('mandatoryDisclaimerAppreciation')}</p>
          <hr className="my-3 border-csp-secondary-text/20 dark:border-csp-primary-dark-text/20"/>
          <p className="font-semibold text-csp-primary-text dark:text-csp-primary-dark-text text-sm">{translate('mandatoryDisclaimerAcknowledgement')}</p>
        </div>

        <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 rtl:sm:space-x-reverse">
          <button
            onClick={onExit}
            className={`w-full px-6 py-3 rounded-lg text-sm font-semibold border border-csp-secondary-text dark:border-csp-secondary-dark-text text-csp-secondary-text dark:text-csp-secondary-dark-text hover:bg-csp-secondary-bg/70 dark:hover:bg-csp-primary-dark/70 transition-colors duration-150 focus:outline-none focus:ring-2 ring-offset-2 dark:ring-offset-csp-secondary-dark-bg focus:ring-csp-secondary-text dark:focus:ring-csp-secondary-dark-text`}
          >
            {translate('exit')}
          </button>
          <button
            onClick={onAgree}
            className={`w-full px-6 py-3 rounded-lg text-sm font-semibold bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90 transition-opacity duration-150 focus:outline-none focus:ring-2 ring-offset-2 dark:ring-offset-csp-secondary-dark-bg focus:ring-csp-accent dark:focus:ring-csp-accent-dark shadow-md hover:shadow-lg button-glow-effect`}
          >
            {translate('agreeAndContinue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerScreen;
