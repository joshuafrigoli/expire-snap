import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from '@/locales/en.json';
import it from '@/locales/it.json';

const SUPPORTED = ['en', 'it'];

function detectLng() {
  const locales = getLocales();
  for (const locale of locales) {
    const lang = locale.languageCode;
    if (SUPPORTED.includes(lang)) return lang;
  }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, it: { translation: it } },
  lng: detectLng(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
