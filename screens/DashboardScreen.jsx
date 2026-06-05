import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import StatCard from '@/components/StatCard';
import { ProfileButton } from '@/components/ui';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { items } = useInventory();
  const navigation = useNavigation();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeItems = items.filter((item) => item.status === 'active');

  let expired = 0;
  let expiring = 0;
  let safe = 0;

  for (const item of activeItems) {
    const expiry = new Date(item.estimated_expiry_date);
    expiry.setHours(0, 0, 0, 0);
    const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / 86400000);
    if (daysLeft < 0) expired += 1;
    else if (daysLeft <= 3) expiring += 1;
    else safe += 1;
  }

  return (
    <SafeAreaView testID="screen-home" style={styles.safe}>
      <View style={styles.header}>
        <ProfileButton testID="dashboard-profile-btn" />
        <Text style={styles.title}>{t('dashboard.title')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cards}>
          <StatCard label={t('dashboard.expired')} count={expired} variant="danger" testID="card-expired" countTestID="stat-expired" />
          <StatCard label={t('dashboard.expiring')} count={expiring} variant="warning" testID="card-expiring" countTestID="stat-expiring" />
          <StatCard label={t('dashboard.safe')} count={safe} variant="safe" testID="card-safe" countTestID="stat-safe" />
        </View>
        <Pressable style={styles.scanBtn} onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.scanBtnText}>📷  {t('dashboard.scan')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eff6ff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#005bc4', flex: 1 },
  content: { padding: 16, gap: 12 },
  cards: { gap: 10 },
  scanBtn: {
    backgroundColor: '#005bc4', borderRadius: 9999, paddingVertical: 16,
    alignItems: 'center', borderWidth: 2, borderColor: '#001a3d',
    marginTop: 8,
    shadowColor: '#001a3d', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
    elevation: 4,
  },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
