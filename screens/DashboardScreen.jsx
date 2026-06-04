import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useInventory } from '@/context/InventoryContext';
import StatCard from '@/components/StatCard';

export default function DashboardScreen() {
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

    if (daysLeft < 0) {
      expired += 1;
    } else if (daysLeft <= 3) {
      expiring += 1;
    } else {
      safe += 1;
    }
  }

  return (
    <View testID="screen-home">
      <Text>ExpireSnap</Text>
      <StatCard
        label="Expired"
        count={expired}
        variant="danger"
        testID="card-expired"
        countTestID="stat-expired"
      />
      <StatCard
        label="Expiring Soon"
        count={expiring}
        variant="warning"
        testID="card-expiring"
        countTestID="stat-expiring"
      />
      <StatCard
        label="Safe"
        count={safe}
        variant="safe"
        testID="card-safe"
        countTestID="stat-safe"
      />
      <Pressable onPress={() => navigation.navigate('Scan')}>
        <Text>Scan Receipt</Text>
      </Pressable>
    </View>
  );
}
