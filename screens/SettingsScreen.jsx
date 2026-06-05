import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '@/context/SettingsContext';
import { Select, Input, ProfileButton } from '@/components/ui';
import { useTheme } from '@/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const navigation = useNavigation();
  const colors = useTheme();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.root} testID="screen-settings">
      <View style={styles.header}>
        <ProfileButton testID="settings-profile-btn" />
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>{t('settings.aiProvider')}</Text>
            <TouchableOpacity
              testID="settings-provider-info-btn"
              onPress={() => navigation.navigate('ProviderInfo', { provider: settings.aiProvider })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Select
            testID="settings-ai-provider"
            value={settings.aiProvider}
            options={[
              { label: t('settings.providers.openrouter'), value: 'openrouter' },
              { label: t('settings.providers.openai'), value: 'openai' },
              { label: t('settings.providers.gemini'), value: 'gemini' },
              { label: t('settings.providers.anthropic'), value: 'anthropic' },
            ]}
            onChange={(v) => updateSettings({ aiProvider: v })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.apiKey')}</Text>
          <Input
            testID="settings-api-key"
            value={settings.apiKey || ''}
            onChangeText={(v) => updateSettings({ apiKey: v })}
            variant="password"
            placeholder={t('settings.apiKeyPlaceholder')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.autoDelete')}</Text>
          <Select
            testID="settings-auto-delete"
            value={String(settings.autoDeleteDays)}
            options={[
              { label: t('settings.autoDeleteOptions.days', { n: 7 }), value: '7' },
              { label: t('settings.autoDeleteOptions.days', { n: 14 }), value: '14' },
              { label: t('settings.autoDeleteOptions.days', { n: 30 }), value: '30' },
              { label: t('settings.autoDeleteOptions.days', { n: 60 }), value: '60' },
              { label: t('settings.autoDeleteOptions.never'), value: 'never' },
            ]}
            onChange={(v) =>
              updateSettings({ autoDeleteDays: v === 'never' ? 'never' : Number(v) })
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
          <Select
            testID="settings-language"
            value={settings.language}
            options={[
              { label: t('settings.languages.en'), value: 'en' },
              { label: t('settings.languages.it'), value: 'it' },
            ]}
            onChange={(v) => updateSettings({ language: v })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.theme')}</Text>
          <Select
            testID="settings-theme"
            value={settings.theme ?? 'system'}
            options={[
              { label: t('settings.themes.system'), value: 'system' },
              { label: t('settings.themes.light'), value: 'light' },
              { label: t('settings.themes.dark'), value: 'dark' },
            ]}
            onChange={(v) => updateSettings({ theme: v })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 0,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 16,
    },
    section: {
      gap: 4,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    apiKeyInput: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      backgroundColor: colors.surface,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
  });
}
