import React from 'react';
import { View, Text, FlatList } from 'react-native';
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
    <View>
      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Badge
              testID={'history-badge-' + item.id}
              label={item.status}
              variant={item.status === 'consumed' ? 'safe' : 'danger'}
            />
          </View>
        )}
      />
    </View>
  );
}
