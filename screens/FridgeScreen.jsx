import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import InventoryList from '@/components/InventoryList';
import { FloatingActionButton, ProfileButton } from '@/components/ui';
import { usePortal } from '@/context/PortalContext';
import { useTheme } from '@/theme';

// cleanStep: null | 'choose' | 'confirm-expired' | 'confirm-all'
export default function FridgeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { clearInventory, clearExpired } = useInventory();
  const [cleanStep, setCleanStep] = useState(null);
  const colors = useTheme();
  const styles = makeStyles(colors);
  const portal = usePortal();
  const portalKey = 'fridge-confirm';

  useEffect(() => {
    if (!cleanStep) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setCleanStep(cleanStep === 'choose' ? null : 'choose');
      return true;
    });
    return () => sub.remove();
  }, [cleanStep]);

  useEffect(() => {
    if (!cleanStep) {
      portal.unmount(portalKey);
      return;
    }
    const s = makeStyles(colors);

    const confirmAction = async () => {
      if (cleanStep === 'confirm-expired') await clearExpired();
      else if (cleanStep === 'confirm-all') await clearInventory();
      setCleanStep(null);
    };

    const node = cleanStep === 'choose' ? (
      <View key={portalKey} style={s.backdrop}>
        <View style={s.dialog}>
          <Text style={s.dialogTitle}>{t('fridge.cleanModalTitle')}</Text>
          <Pressable
            testID="fridge-clear-expired-btn"
            onPress={() => setCleanStep('confirm-expired')}
            style={s.expiredBtn}
          >
            <Text style={s.expiredBtnText}>{t('fridge.clearExpiredLabel')}</Text>
            <Text style={s.optionDesc}>{t('fridge.clearExpiredDesc')}</Text>
          </Pressable>
          <Pressable
            testID="fridge-clear-all-btn"
            onPress={() => setCleanStep('confirm-all')}
            style={s.dangerBtn}
          >
            <Text style={s.dangerBtnText}>{t('fridge.clearAllLabel')}</Text>
            <Text style={s.optionDescDanger}>{t('fridge.clearAllDesc')}</Text>
          </Pressable>
          <Pressable
            testID="fridge-clear-cancel"
            onPress={() => setCleanStep(null)}
            style={s.cancelBtn}
          >
            <Text style={s.cancelBtnText}>{t('fridge.clearCancel')}</Text>
          </Pressable>
        </View>
      </View>
    ) : (
      <View key={portalKey} style={s.backdrop}>
        <View style={s.dialog}>
          <Text style={s.dialogTitle}>
            {t(cleanStep === 'confirm-expired' ? 'fridge.confirmExpiredTitle' : 'fridge.confirmAllTitle')}
          </Text>
          <Text style={s.dialogMessage}>
            {t(cleanStep === 'confirm-expired' ? 'fridge.confirmExpiredMessage' : 'fridge.confirmAllMessage')}
          </Text>
          <Pressable
            testID="fridge-confirm-proceed"
            onPress={confirmAction}
            style={cleanStep === 'confirm-expired' ? s.expiredBtn : s.dangerBtn}
          >
            <Text style={cleanStep === 'confirm-expired' ? s.expiredBtnText : s.dangerBtnText}>
              {t('fridge.confirmProceed')}
            </Text>
          </Pressable>
          <Pressable
            testID="fridge-clear-cancel"
            onPress={() => setCleanStep('choose')}
            style={s.cancelBtn}
          >
            <Text style={s.cancelBtnText}>{t('fridge.clearCancel')}</Text>
          </Pressable>
        </View>
      </View>
    );

    portal.mount(portalKey, node);
    return () => portal.unmount(portalKey);
  }, [cleanStep, colors, t, clearExpired, clearInventory]);

  return (
    <SafeAreaView testID="screen-fridge" style={styles.root}>
      <View style={styles.header}>
        <ProfileButton testID="fridge-profile-btn" />
        <Text style={styles.title}>{t('fridge.title')}</Text>
        <Pressable
          testID="fridge-clear-btn"
          onPress={() => setCleanStep('choose')}
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
    cancelBtn: {
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
    expiredBtn: {
      backgroundColor: colors.warning,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    expiredBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    dangerBtn: {
      backgroundColor: colors.danger,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    dangerBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryFg,
    },
    optionDesc: {
      fontSize: 12,
      color: colors.textPrimary,
      marginTop: 2,
      opacity: 0.75,
    },
    optionDescDanger: {
      fontSize: 12,
      color: colors.primaryFg,
      marginTop: 2,
      opacity: 0.75,
    },
  });
}
