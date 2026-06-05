import React, { useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import { FilterTabs, Input } from '@/components/ui';
import InventoryItem from '@/components/InventoryItem';

const CATEGORY_KEYS = [
  { value: 'All', key: 'categories.all' },
  { value: 'Dairy', key: 'categories.dairy' },
  { value: 'Meat & Fish', key: 'categories.meat' },
  { value: 'Fruits & Veggies', key: 'categories.produce' },
  { value: 'Frozen', key: 'categories.frozen' },
  { value: 'Pantry', key: 'categories.pantry' },
];

function InventoryList() {
  const { t } = useTranslation();
  const { items, markConsumed, markWasted } = useInventory();
  const categories = CATEGORY_KEYS.map(c => ({ value: c.value, label: t(c.key) }));
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = items
    .filter((item) => item.status === 'active')
    .filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((item) =>
      activeCategory === 'All' ? true : item.category === activeCategory
    );

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <Input
          testID="inventory-search"
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('fridge.search')}
        />
      </View>
      <FilterTabs
        tabs={categories}
        activeTab={activeCategory}
        onTabPress={setActiveCategory}
      />
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('fridge.empty')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <InventoryItem
            id={item.id}
            name={item.name}
            category={item.category}
            estimated_expiry_date={item.estimated_expiry_date}
            onConsume={markConsumed}
            onWaste={markWasted}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrapper: { marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
});

export { InventoryList };
export default InventoryList;
