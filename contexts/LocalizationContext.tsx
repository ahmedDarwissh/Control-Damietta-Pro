
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../constants';

type LocalizationContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: keyof typeof translations[Language.EN], ...args: (string | number)[]) => string; // Key type for better safety
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Attempt to get language from localStorage or default to Arabic
    const storedLang = localStorage.getItem('appLanguage');
    return (storedLang === Language.EN || storedLang === Language.AR) ? storedLang : Language.AR;
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('appLanguage', lang);
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === Language.AR ? 'rtl' : 'ltr';
  };

  // Set initial document attributes
  React.useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === Language.AR ? 'rtl' : 'ltr';
  }, [language]);


  const translate = useCallback((key: keyof typeof translations[Language.EN], ...args: (string | number)[]) => {
    const langTranslations = translations[language] || translations[Language.EN];
    let translation = langTranslations[key] || key;
    
    if (args.length > 0) {
      args.forEach((arg, index) => {
        const placeholder = `{${index}}`;
        // Ensure translation is a string before calling replace
        if (typeof translation === 'string') {
          translation = translation.replace(placeholder, String(arg));
        }
      });
    }
    return String(translation); // Ensure return is always string
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
