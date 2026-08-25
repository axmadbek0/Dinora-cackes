import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uz from './locales/uz.json';
import uzCyrl from './locales/uz-Cyrl.json';
import ru from './locales/ru.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
  { code: 'uz-Cyrl', name: 'Ўзбекча', flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
] as const;

export type AppLanguage = 'uz' | 'uz-Cyrl' | 'ru';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      'uz-Cyrl': { translation: uzCyrl },
      ru: { translation: ru },
    },
    fallbackLng: 'uz',
    lng: localStorage.getItem('dinora_admin_lang') || 'uz',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'dinora_admin_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
