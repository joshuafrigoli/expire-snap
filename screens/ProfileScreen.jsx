import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';
import { useInventory } from '@/context/InventoryContext';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { settings } = useSettings();
  const { items } = useInventory();

  return (
    <View>
      <Text>{settings.profile?.name || ''}</Text>
      <Pressable testID="profile-export-btn">
        <Text>{t('profile.export')}</Text>
      </Pressable>
      <Pressable testID="profile-import-btn">
        <Text>{t('profile.import')}</Text>
      </Pressable>
      <Pressable
        testID="profile-history-btn"
        onPress={() => navigation.navigate('History')}
      >
        <Text>{t('profile.history')}</Text>
      </Pressable>
    </View>
  );
}
