import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/theme';

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { updateSettings } = useSettings();
  const [name, setName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🥦');
  const colors = useTheme();
  const styles = makeStyles(colors);

  async function handleSubmit() {
    await updateSettings({ profile: { name: name.trim(), avatarEmoji } });
    try { navigation.navigate('Home'); } catch {}
  }

  const EMOJIS = ['🥦', '🍕', '🍎', '🥩', '🧀', '🥛', '🐟', '🥚', '🥕', '🍌'];

  return (
    <SafeAreaView testID="screen-onboarding" style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <Text style={styles.title}>ExpireSnap</Text>
        <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>

        <Input
          testID="onboarding-name-input"
          placeholder={t('onboarding.namePlaceholder')}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.emojiLabel}>{t('onboarding.pickAvatar')}</Text>
        <View style={styles.emojiRow}>
          {EMOJIS.map(e => (
            <Pressable key={e} onPress={() => setAvatarEmoji(e)} style={[styles.emojiBtn, avatarEmoji === e && styles.emojiBtnActive]}>
              <Text style={styles.emoji}>{e}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          testID="onboarding-submit-btn"
          disabled={!name.trim()}
          accessibilityState={{ disabled: !name.trim() }}
          onPress={handleSubmit}
          style={[styles.btn, !name.trim() && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>{t('onboarding.submit')}</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
    title: { fontSize: 32, fontWeight: '700', color: colors.primary, textAlign: 'center' },
    subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 8 },
    emojiLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
    emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    emojiBtn: { padding: 8, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
    emojiBtnActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
    emoji: { fontSize: 24 },
    btn: {
      backgroundColor: colors.primary, borderRadius: 9999, paddingVertical: 14,
      alignItems: 'center', borderWidth: 2, borderColor: colors.border,
      marginTop: 8,
    },
    btnDisabled: { backgroundColor: colors.surfaceAlt, borderColor: colors.borderLight },
    btnText: { color: colors.primaryFg, fontSize: 16, fontWeight: '700' },
  });
}
