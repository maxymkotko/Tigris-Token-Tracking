import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationCN from './translate/chinese.json';
import translateEN from './translate/english.json';
import translateJP from './translate/japanese.json';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'English',
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    resources: {
      English: {
        translation: translateEN
      },
      Japanese: {
        translation: translateJP
      },
      Chinese: {
        translation: translationCN
      }
    }
  });

export default i18n;
