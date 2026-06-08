import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from '@/utils/i18n';

const STORAGE_KEY = 'expiresnap_settings';
const SUPPORTED_LANGUAGES = ['en', 'it'];

function detectLanguage() {
  const locales = getLocales();
  for (const locale of locales) {
    if (SUPPORTED_LANGUAGES.includes(locale.languageCode)) return locale.languageCode;
  }
  return 'en';
}

const DEFAULT_SETTINGS = {
  aiProvider: 'openrouter',
  apiKey: '',
  autoDeleteDays: 30,
  language: detectLanguage(),
  languageLockedByUser: false,
  theme: 'system',
  profile: { name: '', avatarEmoji: '' },
};

export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        const parsed = JSON.parse(raw);
        // If user never explicitly chose a language, always follow device locale.
        // This handles upgrades where 'en' was stored as the old hardcoded default.
        const lang = parsed.languageLockedByUser ? parsed.language : detectLanguage();
        setSettings((prev) => ({ ...prev, ...parsed, language: lang }));
        i18n.changeLanguage(lang);
      }
    });
  }, []);

  async function updateSettings(partial) {
    const next = { ...settings, ...partial };
    if ('language' in partial) {
      next.languageLockedByUser = true;
      i18n.changeLanguage(partial.language);
    }
    setSettings(next);
    // TODO: migrate apiKey storage to expo-secure-store for encryption at rest
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
