import { translations as enTranslations } from './locales/en';
import { TranslationKey } from '../contexts/LanguageContext'; // Assuming this type will be defined there

// Function to get English translation, useful for prompts to Gemini API
export const getEnglishTranslation = (key: TranslationKey, params?: Record<string, string | number>): string => {
  let str = enTranslations[key as keyof typeof enTranslations] || String(key);
  if (params) {
    Object.keys(params).forEach(paramKey => {
      str = str.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
    });
  }
  return str;
};
