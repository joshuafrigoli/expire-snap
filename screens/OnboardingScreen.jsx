import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { updateSettings } = useSettings();
  const [name, setName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🥦');

  async function handleSubmit() {
    await updateSettings({ profile: { name: name.trim(), avatarEmoji } });
    try { navigation.navigate('Home'); } catch {}
  }

  const EMOJIS = ['🥦', '🍕', '🍎', '🥩', '🧀', '🥛', '🐟', '🥚', '🥕', '🍌'];

  return (
    <SafeAreaView testID="screen-onboarding" style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <Text style={styles.title}>ExpireSnap</Text>
        <Text style={styles.subtitle}>Track food. Waste less.</Text>

        <Input
          testID="onboarding-name-input"
          placeholder={t('onboarding.namePlaceholder')}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.emojiLabel}>Pick an avatar</Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eff6ff' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#005bc4', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 8 },
  emojiLabel: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: { padding: 8, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  emojiBtnActive: { borderColor: '#005bc4', backgroundColor: '#bfdbfe' },
  emoji: { fontSize: 24 },
  btn: {
    backgroundColor: '#005bc4', borderRadius: 9999, paddingVertical: 14,
    alignItems: 'center', borderWidth: 2, borderColor: '#001a3d',
    marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#bfdbfe', borderColor: '#93c5fd' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
