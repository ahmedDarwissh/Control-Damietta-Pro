
import React from 'react';
import { APP_NAME, COMPANY_LOGO_URL } from '../constants';
import { useLocalization } from '../contexts/LocalizationContext';

interface OilRigAndFlameIconProps {
  className?: string;
  style?: React.CSSProperties; // Added style prop
}

const OilRigAndFlameIcon: React.FC<OilRigAndFlameIconProps> = ({className, style}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className || "w-24 h-24 mx-auto mb-4"} style={style} fill="none" stroke="currentColor" strokeWidth="2">
        {/* Flame */}
        <path d="M50 15 Q 55 25, 50 35 Q 45 25, 50 15 Z" fill="hsl(var(--theme-csp-accent-hsl))" stroke="hsl(var(--theme-csp-accent-hsl))" className="animate-[pulse_1.5s_ease-in-out_infinite]" style={{animationDelay: '0.2s'}} />
        <path d="M47 20 Q 50 30, 47 40 Q 44 30, 47 20 Z" fill="hsl(var(--theme-csp-accent-hsl)/0.7)" stroke="hsl(var(--theme-csp-accent-hsl)/0.7)" className="animate-[pulse_1.5s_ease-in-out_infinite]" style={{animationDelay: '0.4s'}}/>
        <path d="M53 20 Q 50 30, 53 40 Q 56 30, 53 20 Z" fill="hsl(var(--theme-csp-accent-hsl)/0.7)" stroke="hsl(var(--theme-csp-accent-hsl)/0.7)" className="animate-[pulse_1.5s_ease-in-out_infinite]" style={{animationDelay: '0.6s'}}/>
        
        {/* Derrick Structure */}
        <path d="M50 35 L 40 85 L 60 85 Z" stroke="hsl(var(--theme-csp-primary-dark-text-hsl)/0.8)" />
        <line x1="40" y1="85" x2="60" y2="85" stroke="hsl(var(--theme-csp-primary-dark-text-hsl)/0.8)" />
        <line x1="50" y1="35" x2="45" y2="60" stroke="hsl(var(--theme-csp-primary-dark-text-hsl)/0.5)" />
        <line x1="50" y1="35" x2="55" y2="60" stroke="hsl(var(--theme-csp-primary-dark-text-hsl)/0.5)" />
        <line x1="45" y1="60" x2="55" y2="60" stroke="hsl(var(--theme-csp-primary-dark-text-hsl)/0.5)" />
        <line x1="42.5" y1="72.5" x2="57.5" y2="72.5" stroke="hsl(var(--theme-csp-primary-dark-text-hsl)/0.5)" />

        {/* Workers - Simplified Silhouettes */}
        <circle cx="35" cy="80" r="3" fill="hsl(var(--theme-csp-primary-dark-text-hsl)/0.6)" />
        <rect x="33" y="83" width="4" height="7" fill="hsl(var(--theme-csp-primary-dark-text-hsl)/0.6)" />
        
        <circle cx="65" cy="80" r="3" fill="hsl(var(--theme-csp-primary-dark-text-hsl)/0.6)" />
        <rect x="63" y="83" width="4" height="7" fill="hsl(var(--theme-csp-primary-dark-text-hsl)/0.6)" />
        <style>
            {`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
            `}
        </style>
    </svg>
);

interface SplashScreenProps {
  messageKey?: keyof typeof import('../constants').translations['en']; // Allow messageKey for translation
  introLine1Key?: keyof typeof import('../constants').translations['en'];
  introLine2Key?: keyof typeof import('../constants').translations['en'];
}

const SplashScreen: React.FC<SplashScreenProps> = ({ messageKey, introLine1Key, introLine2Key }) => {
  const { translate, language } = useLocalization();

  return (
    <div className={`flex flex-col items-center justify-center h-screen bg-gradient-to-br from-csp-primary-dark to-csp-secondary-dark-bg text-csp-primary-dark-text p-6 overflow-hidden`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <img src={COMPANY_LOGO_URL} alt="Company Logo" className="w-36 h-auto mb-4 rounded-lg shadow-xl animate-fadeIn" style={{animationDelay: '0.2s'}} />
      
      <OilRigAndFlameIcon className="w-28 h-28 mx-auto mb-5 animate-fadeIn" style={{animationDelay: '0.5s'}}/>

      <div className="text-center animate-fadeInUp" style={{animationDelay: '0.8s'}}>
        <h1 className="text-2xl lg:text-3xl font-bold mb-1 text-csp-accent-dark font-cairo">
          {translate(introLine1Key || 'splashWelcome')}
        </h1>
        <p className="text-md lg:text-lg text-csp-primary-dark-text opacity-90 font-tajawal mb-3">
          {translate(introLine2Key || 'appName')}
        </p>
        <p className="text-sm lg:text-md mt-3 font-tajawal text-csp-secondary-dark-text opacity-80 max-w-sm mx-auto">
           {translate('splashMoto')}
        </p>
      </div>

      <div className="absolute bottom-10 text-center w-full animate-fadeIn" style={{animationDelay: '1.2s'}}>
        <div className="flex justify-center space-x-2 mb-2">
            <span className="h-2.5 w-2.5 bg-csp-accent-dark rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-2.5 w-2.5 bg-csp-accent-dark rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-2.5 w-2.5 bg-csp-accent-dark rounded-full animate-bounce"></span>
        </div>
        <p className="text-xs font-tajawal text-csp-secondary-dark-text opacity-70">
            {messageKey ? translate(messageKey) : translate('loading')}
        </p>
      </div>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SplashScreen;
