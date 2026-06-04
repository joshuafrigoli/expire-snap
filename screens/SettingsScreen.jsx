import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { t } = useTranslation();
  return (
    <View testID="screen-settings">
      <Text>{t('settings.title')}</Text>
    </View>
  );
}
