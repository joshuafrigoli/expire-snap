import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const name = settings.profile?.name || '';
  const avatarEmoji = settings.profile?.avatarEmoji;
  const avatarLabel = avatarEmoji || (name ? name.charAt(0).toUpperCase() : '?');
  const avatarIsEmoji = !!avatarEmoji;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={avatarIsEmoji ? styles.avatarEmoji : styles.avatarLetter}>
            {avatarLabel}
          </Text>
        </View>

        {/* Name */}
        <Text style={styles.nameText}>{name}</Text>

        {/* Section: Data */}
        <Text style={styles.sectionLabel}>{t('profile.dataSection')}</Text>

        <View style={styles.buttonGroup}>
          {/* Export */}
          <Pressable
            testID="profile-export-btn"
            style={({ pressed }) => [styles.outlineBtn, pressed && styles.btnPressed]}
            onPress={async () => {
              try {
                await exportData();
              } catch (e) {
                setSnackbarMsg(t('errors.importFailed'));
              }
            }}
          >
            <Text style={styles.outlineBtnText}>📤 {t('profile.export')}</Text>
          </Pressable>

          {/* Import */}
          <Pressable
            testID="profile-import-btn"
            style={({ pressed }) => [styles.outlineBtn, pressed && styles.btnPressed]}
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
            <Text style={styles.outlineBtnText}>📥 {t('profile.import')}</Text>
          </Pressable>

          {/* History */}
          <Pressable
            testID="profile-history-btn"
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.primaryBtnText}>📋 {t('profile.history')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Snackbar
        message={snackbarMsg}
        visible={!!snackbarMsg}
        onDismiss={() => setSnackbarMsg('')}
        variant="info"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },

  // Avatar
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#bfdbfe',
    borderWidth: 2,
    borderColor: '#001a3d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '700',
    color: '#001a3d',
  },

  // Name
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#001a3d',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },

  // Section label
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Button group
  buttonGroup: {
    width: '100%',
    gap: 12,
  },

  // Outline button (Export / Import)
  outlineBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#005bc4',
  },

  // Primary button (History)
  primaryBtn: {
    backgroundColor: '#005bc4',
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // Pressed state (slight lift)
  btnPressed: {
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
});
