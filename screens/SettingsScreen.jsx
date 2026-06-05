import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';
import { Select, Input } from '@/components/ui';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();

  return (
    <SafeAreaView style={styles.root} testID="screen-settings">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('settings.title')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI Provider</Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>API Key</Text>
          <Input
            testID="settings-api-key"
            value={settings.apiKey || ''}
            onChangeText={(v) => updateSettings({ apiKey: v })}
            variant="password"
            placeholder="Enter API key"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Auto-Delete Period</Text>
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
            onChange={(v) =>
              updateSettings({ autoDeleteDays: v === 'never' ? 'never' : Number(v) })
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Language</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005bc4',
    marginBottom: 8,
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#001a3d',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  apiKeyInput: {
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});
