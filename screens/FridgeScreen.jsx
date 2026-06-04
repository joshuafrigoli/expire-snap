import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import InventoryList from '@/components/InventoryList';
import { FloatingActionButton } from '@/components/ui';

export default function FridgeScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView testID="screen-fridge" style={styles.root}>
      <Text style={styles.title}>{t('fridge.title', 'My Fridge')}</Text>
      <InventoryList style={styles.list} />
      <FloatingActionButton testID="fridge-fab" onPress={() => {}} style={styles.fab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005bc4',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  list: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});
