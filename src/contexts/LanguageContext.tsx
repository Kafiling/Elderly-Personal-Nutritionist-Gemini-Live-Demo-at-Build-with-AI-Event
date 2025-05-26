
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
// Statically import all language files
import { translations as enTranslationsStatic } from '../i18n/locales/en.ts';
import { translations as thTranslationsStatic } from '../i18n/locales/th.ts';

export type Locale = 'en' | 'th';
// TranslationKey and TranslationsType are based on the structure of English translations,
// assuming it's the base or at least representative.
export type TranslationKey = keyof typeof enTranslationsStatic;
export type TranslationsType = typeof enTranslationsStatic;

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void; // No longer async for internal logic
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get the initial language from localStorage or default to 'en'
const getInitialLanguage = (): Locale => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('language') as Locale) || 'en';
  }
  return 'en';
};

const availableTranslations: Record<Locale, TranslationsType> = {
  en: enTranslationsStatic,
  th: thTranslationsStatic,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialLang = getInitialLanguage();
  const [currentLanguage, setCurrentLanguage] = useState<Locale>(initialLang);
  const [translations, setTranslations] = useState<TranslationsType>(
    () => availableTranslations[initialLang] || enTranslationsStatic
  );

  // Effect for ensuring state consistency if initialLang was not 'en' and th failed (hypothetically)
  // or just to correctly initialize from localStorage.
  useEffect(() => {
    const langFromStorage = getInitialLanguage();
    const newTranslations = availableTranslations[langFromStorage] || enTranslationsStatic;
    const actualLang = availableTranslations[langFromStorage] ? langFromStorage : 'en';

    if (currentLanguage !== actualLang || translations !== newTranslations) {
        setTranslations(newTranslations);
        setCurrentLanguage(actualLang);
        // No need to set localStorage here, as getInitialLanguage reads it.
        // Explicit setLanguage call will handle localStorage update.
    }
  }, []); // Runs once on mount to synchronize with localStorage

  const setLanguage = useCallback((newLang: Locale) => {
    const newTranslations = availableTranslations[newLang] || enTranslationsStatic;
    const actualLang = availableTranslations[newLang] ? newLang : 'en';
    
    setTranslations(newTranslations);
    setCurrentLanguage(actualLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', actualLang);
    }
  }, []); // Dependencies are stable

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    let str = translations[key as keyof TranslationsType];
    
    if (str === undefined) { // Fallback to static English if key not in current language
      str = enTranslationsStatic[key as keyof typeof enTranslationsStatic];
    }
    
    if (str === undefined) { // Fallback to the key itself if not found anywhere
      str = String(key);
    }
    
    if (params) {
      Object.keys(params).forEach(paramKey => {
        str = str.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
      });
    }
    return str;
  }, [translations]); // Depends on the `translations` state

  return (
    <LanguageContext.Provider value={{ language: currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
