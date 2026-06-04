import React from 'react';
import { View, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';
import { Select } from '@/components/ui';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();

  return (
    <View testID="screen-settings">
      <Select
        testID="settings-ai-provider"
        value={settings.aiProvider}
        options={[
          { label: 'OpenAI', value: 'openai' },
          { label: 'Google Gemini', value: 'gemini' },
          { label: 'Anthropic Claude', value: 'anthropic' },
        ]}
        onChange={(v) => updateSettings({ aiProvider: v })}
      />

      <TextInput
        testID="settings-api-key"
        value={settings.apiKey || ''}
        onChangeText={(v) => updateSettings({ apiKey: v })}
        secureTextEntry={true}
      />

      <Select
        testID="settings-auto-delete"
        value={String(settings.autoDeleteDays)}
        options={[
          { label: '7 days', value: '7' },
          { label: '14 days', value: '14' },
          { label: '30 days', value: '30' },
          { label: '60 days', value: '60' },
          { label: 'Never', value: 'never' },
        ]}
        onChange={(v) => updateSettings({ autoDeleteDays: v === 'never' ? 'never' : Number(v) })}
      />

      <Select
        testID="settings-language"
        value={settings.language}
        options={[
          { label: 'English', value: 'en' },
          { label: 'Italiano', value: 'it' },
        ]}
        onChange={(v) => updateSettings({ language: v })}
      />
    </View>
  );
}
