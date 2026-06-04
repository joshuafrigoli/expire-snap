import React, { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { updateSettings } = useSettings();
  const [name, setName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('');

  async function handleSubmit() {
    await updateSettings({ profile: { name: name.trim(), avatarEmoji } });
    navigation.navigate('Home');
  }

  return (
    <View testID="screen-onboarding">
      <TextInput
        testID="onboarding-name-input"
        placeholder={t('onboarding.namePlaceholder')}
        value={name}
        onChangeText={setName}
      />
      <Pressable
        testID="onboarding-submit-btn"
        disabled={!name.trim()}
        accessibilityState={{ disabled: !name.trim() }}
        onPress={handleSubmit}
      >
        <Text>{t('onboarding.submit')}</Text>
      </Pressable>
    </View>
  );
}
