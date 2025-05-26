import React from 'react';
import { useLanguage, Locale } from '../src/contexts/LanguageContext'; // Adjust path as needed

interface HeaderProps {
  title: string; // This will now be a translation key
}

const Header: React.FC<HeaderProps> = ({ title: titleKey }) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: Locale) => {
    setLanguage(lang);
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mr-3 text-blue-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.002 9.002 0 0 0 6.944-3.524M12 3a9.002 9.002 0 0 0-6.944 3.524" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V15m0-6.75V6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12H6m9 0h-2.25" />
          </svg>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t(titleKey as any)}</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                        ${language === 'en' ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-400 text-blue-100'}`}
            aria-pressed={language === 'en'}
          >
            {t('langEn')}
          </button>
          <button
            onClick={() => handleLanguageChange('th')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                        ${language === 'th' ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-400 text-blue-100'}`}
            aria-pressed={language === 'th'}
          >
            {t('langTh')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;