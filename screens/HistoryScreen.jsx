import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import { Badge } from '@/components/ui';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { items } = useInventory();

  const historyItems = items.filter(
    (item) => item.status === 'consumed' || item.status === 'wasted'
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('history.title')}</Text>
        <FlatList
          data={historyItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No history yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDate}>{item.estimated_expiry_date}</Text>
              </View>
              <Badge
                testID={'history-badge-' + item.id}
                label={item.status}
                variant={item.status === 'consumed' ? 'safe' : 'danger'}
              />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005bc4',
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 8,
    paddingTop: 0,
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#001a3d',
    margin: 8,
    marginBottom: 0,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardLeft: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#001a3d',
  },
  itemDate: {
    fontSize: 12,
    color: '#64748b',
  },
});
