import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';
import { useInventory } from '@/context/InventoryContext';
import { exportData, importData } from '@/utils/dataTransfer';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Snackbar } from '@/components/ui';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { settings } = useSettings();
  const { items } = useInventory();
  const [snackbarMsg, setSnackbarMsg] = useState('');

  return (
    <View>
      <Text>{settings.profile?.name || ''}</Text>
      <Pressable
        testID="profile-export-btn"
        onPress={async () => {
          try {
            await exportData();
          } catch (e) {
            setSnackbarMsg(t('errors.importFailed'));
          }
        }}
      >
        <Text>{t('profile.export')}</Text>
      </Pressable>
      <Pressable
        testID="profile-import-btn"
        onPress={async () => {
          const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
          if (result.canceled) return;
          const uri = result.assets[0].uri;
          let content;
          try {
            content = await FileSystem.readAsStringAsync(uri);
          } catch {
            setSnackbarMsg(t('errors.importFailed'));
            return;
          }
          try {
            await importData(content);
            setSnackbarMsg(t('errors.importSuccess'));
          } catch (e) {
            setSnackbarMsg(t('errors.importFailed'));
          }
        }}
      >
        <Text>{t('profile.import')}</Text>
      </Pressable>
      <Pressable
        testID="profile-history-btn"
        onPress={() => navigation.navigate('History')}
      >
        <Text>{t('profile.history')}</Text>
      </Pressable>
      <Snackbar
        message={snackbarMsg}
        visible={!!snackbarMsg}
        onDismiss={() => setSnackbarMsg('')}
        variant="info"
      />
    </View>
  );
}
