import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, Pressable, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import InventoryList from '@/components/InventoryList';
import { FloatingActionButton, ProfileButton } from '@/components/ui';
import { usePortal } from '@/context/PortalContext';
import { useTheme } from '@/theme';

export default function FridgeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { clearInventory } = useInventory();
  const [showConfirm, setShowConfirm] = useState(false);
  const colors = useTheme();
  const styles = makeStyles(colors);
  const portal = usePortal();
  const portalKey = 'fridge-confirm';

  const handleClear = useCallback(async () => {
    await clearInventory();
    setShowConfirm(false);
  }, [clearInventory]);

  useEffect(() => {
    if (!showConfirm) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowConfirm(false);
      return true;
    });
    return () => sub.remove();
  }, [showConfirm]);

  useEffect(() => {
    if (!showConfirm) {
      portal.unmount(portalKey);
      return;
    }
    const s = makeStyles(colors);
    portal.mount(
      portalKey,
      <View key={portalKey} style={s.backdrop}>
        <View style={s.dialog}>
          <Text style={s.dialogTitle}>{t('fridge.clearConfirmTitle')}</Text>
          <Text style={s.dialogMessage}>{t('fridge.clearConfirmMessage')}</Text>
          <View style={s.dialogButtons}>
            <Pressable
              testID="fridge-clear-cancel"
              onPress={() => setShowConfirm(false)}
              style={s.cancelBtn}
            >
              <Text style={s.cancelBtnText}>{t('fridge.clearCancel')}</Text>
            </Pressable>
            <Pressable
              testID="fridge-clear-confirm"
              onPress={handleClear}
              style={s.confirmBtn}
            >
              <Text style={s.confirmBtnText}>{t('fridge.clearConfirm')}</Text>
            </Pressable>
          </View>
        </View>
      </View>,
    );
    return () => portal.unmount(portalKey);
  }, [showConfirm, colors, t, handleClear]);

  return (
    <SafeAreaView testID="screen-fridge" style={styles.root}>
      <View style={styles.header}>
        <ProfileButton testID="fridge-profile-btn" />
        <Text style={styles.title}>{t('fridge.title')}</Text>
        <Pressable
          testID="fridge-clear-btn"
          onPress={() => setShowConfirm(true)}
          style={styles.clearBtn}
        >
          <Text style={styles.clearBtnText}>🗑️</Text>
        </Pressable>
      </View>

      <InventoryList style={styles.list} />
      <FloatingActionButton testID="fridge-fab" onPress={() => navigation.navigate('Scan')} style={styles.fab} />


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
      flex: 1,
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    clearBtn: {
      width: 40,
      height: 40,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    clearBtnText: {
      fontSize: 16,
    },
    list: {
      flex: 1,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
    },
    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    dialog: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      gap: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
    dialogTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    dialogMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    dialogButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 9999,
      paddingVertical: 12,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    cancelBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    confirmBtn: {
      flex: 1,
      backgroundColor: colors.danger,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 9999,
      paddingVertical: 12,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    confirmBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryFg,
    },
  });
}
