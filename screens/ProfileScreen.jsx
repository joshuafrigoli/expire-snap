import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/context/SettingsContext';
import { useInventory } from '@/context/InventoryContext';
import { exportData, importData } from '@/utils/dataTransfer';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTheme } from '@/theme';

const EMOJIS = ['🥦', '🍕', '🍎', '🥩', '🧀', '🥛', '🐟', '🥚', '🥕', '🍌', '🍇', '🥑', '🍞', '🧁', '☕'];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { settings, updateSettings } = useSettings();
  const { items } = useInventory();

  const insets = useSafeAreaInsets();
  const { showSnackbar } = useSnackbar();
  const colors = useTheme();
  const styles = makeStyles(colors);
  const [name, setName] = useState(settings.profile?.name || '');
  const [avatarEmoji, setAvatarEmoji] = useState(settings.profile?.avatarEmoji || '🥦');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    setName(settings.profile?.name || '');
    setAvatarEmoji(settings.profile?.avatarEmoji || '🥦');
  }, [settings.profile?.name, settings.profile?.avatarEmoji]);

  const isDirty =
    name !== (settings.profile?.name || '') ||
    avatarEmoji !== (settings.profile?.avatarEmoji || '🥦');

  const totalScanned = items.length;
  const savedFromWaste = items.filter((i) => i.status === 'consumed').length;

  async function handleSave() {
    if (!name.trim()) return;
    Keyboard.dismiss();
    setEditingName(false);
    await updateSettings({ profile: { name: name.trim(), avatarEmoji } });
    showSnackbar('Saved!', 'success');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable
            testID="profile-back-btn"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.pageTitleContainer} pointerEvents="none">
            <Text style={styles.pageTitle}>{t('profile.title')}</Text>
          </View>
          {isDirty ? (
            <Pressable
              testID="profile-save-btn"
              onPress={handleSave}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>{t('actions.save')}</Text>
            </Pressable>
          ) : <View style={styles.saveBtnSpacer} />}
        </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <Pressable
              testID="profile-avatar-btn"
              onPress={() => setShowEmojiPicker((v) => !v)}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>✏️</Text>
              </View>
            </Pressable>

            {showEmojiPicker && (
              <View style={styles.emojiPicker}>
                <View style={styles.emojiGrid}>
                  {EMOJIS.map((e) => (
                    <Pressable
                      key={e}
                      onPress={() => { setAvatarEmoji(e); setShowEmojiPicker(false); }}
                      style={[styles.emojiBtn, avatarEmoji === e && styles.emojiBtnActive]}
                    >
                      <Text style={styles.emojiText}>{e}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {editingName ? (
              <TextInput
                testID="profile-name-input"
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                onBlur={() => setEditingName(false)}
                placeholder={t('onboarding.namePlaceholder')}
                placeholderTextColor={colors.textMuted}
                textAlign="center"
                autoFocus
              />
            ) : (
              <Pressable onPress={() => setEditingName(true)} style={styles.nameDisplay}>
                <Text style={styles.nameText}>{name || t('onboarding.namePlaceholder')}</Text>
                <Text style={styles.nameEditHint}>✏️</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalScanned}</Text>
              <Text style={styles.statLabel}>{t('profile.totalScanned')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{savedFromWaste}</Text>
              <Text style={styles.statLabel}>{t('profile.savedFromWaste')}</Text>
            </View>
          </View>

          <View style={styles.dataSection}>
            <Text style={styles.sectionLabel}>{t('profile.dataSection')}</Text>
            <View style={styles.buttonGroup}>
            <Pressable
              testID="profile-export-btn"
              style={styles.outlineBtn}
              onPress={async () => {
                try { await exportData(); }
                catch (e) { console.error('[exportData]', e); showSnackbar(t('errors.exportFailed'), 'error'); }
              }}
            >
              <Text style={styles.outlineBtnText}>📤  {t('profile.export')}</Text>
            </Pressable>

            <Pressable
              testID="profile-import-btn"
              style={styles.outlineBtn}
              onPress={async () => {
                const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
                if (result.canceled) return;
                const uri = result.assets[0].uri;
                let content;
                try { content = await FileSystem.readAsStringAsync(uri); }
                catch { showSnackbar(t('errors.importFailed'), 'error'); return; }
                try {
                  await importData(content);
                  showSnackbar(t('errors.importSuccess'), 'success');
                } catch {
                  showSnackbar(t('errors.importFailed'), 'error');
                }
              }}
            >
              <Text style={styles.outlineBtnText}>📥  {t('profile.import')}</Text>
            </Pressable>

            <Pressable
              testID="profile-history-btn"
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('History')}
            >
              <Text style={styles.primaryBtnText}>📋  {t('profile.history')}</Text>
            </Pressable>
          </View>
          </View>
        </ScrollView>

      </KeyboardAvoidingView>

      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bg },
    flex: { flex: 1 },

    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    backBtnText: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, includeFontPadding: false, textAlignVertical: 'center', lineHeight: 22 },
    pageTitleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    saveBtnSpacer: { width: 72 },
    saveBtn: {
      paddingHorizontal: 16,
      height: 36,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    saveBtnText: { fontSize: 14, fontWeight: '700', color: colors.primaryFg },

    scrollContent: { padding: 16, gap: 20 },

    avatarSection: { alignItems: 'center', gap: 12 },
    avatarCircle: {
      width: 96,
      height: 96,
      borderRadius: 9999,
      backgroundColor: colors.surfaceAlt2,
      borderWidth: 3,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 5,
    },
    avatarEmoji: { fontSize: 48 },
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 26,
      height: 26,
      borderRadius: 9999,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editBadgeText: { fontSize: 12 },

    emojiPicker: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      width: '100%',
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    emojiBtn: {
      padding: 8,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    emojiBtnActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
    emojiText: { fontSize: 26 },

    nameDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderBottomWidth: 2,
      borderBottomColor: colors.borderLight,
    },
    nameText: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    nameEditHint: { fontSize: 14 },
    nameInput: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      paddingVertical: 4,
      paddingHorizontal: 8,
      width: '70%',
      textAlign: 'center',
    },

    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    statValue: { fontSize: 28, fontWeight: '700', color: colors.primary },
    statLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', textAlign: 'center', marginTop: 2 },

    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    dataSection: { gap: 8 },
    buttonGroup: { gap: 10 },
    outlineBtn: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 9999,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    outlineBtnText: { fontSize: 15, fontWeight: '700', color: colors.primary },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 9999,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    primaryBtnText: { fontSize: 15, fontWeight: '700', color: colors.primaryFg },
  });
}
