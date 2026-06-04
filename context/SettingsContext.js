import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'expiresnap_settings';

const DEFAULT_SETTINGS = {
  aiProvider: 'openai',
  apiKey: '',
  autoDeleteDays: 30,
  language: 'en',
  profile: { name: '', avatarEmoji: '' },
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
      }
    });
  }, []);

  async function updateSettings(partial) {
    const next = { ...settings, ...partial };
    setSettings(next);
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
