import React, { useState } from 'react';
import { Text, View, Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import InventoryList from '@/components/InventoryList';
import { FloatingActionButton, ProfileButton } from '@/components/ui';

export default function FridgeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { clearInventory } = useInventory();
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleClear() {
    await clearInventory();
    setShowConfirm(false);
  }

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

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>{t('fridge.clearConfirmTitle')}</Text>
            <Text style={styles.dialogMessage}>{t('fridge.clearConfirmMessage')}</Text>
            <View style={styles.dialogButtons}>
              <Pressable
                testID="fridge-clear-cancel"
                onPress={() => setShowConfirm(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>{t('fridge.clearCancel')}</Text>
              </Pressable>
              <Pressable
                testID="fridge-clear-confirm"
                onPress={handleClear}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmBtnText}>{t('fridge.clearConfirm')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eff6ff',
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
    color: '#005bc4',
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#dc2626',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#001a3d',
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
    backgroundColor: 'rgba(0,26,61,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 12,
    shadowColor: '#001a3d',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#001a3d',
  },
  dialogMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#001a3d',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
