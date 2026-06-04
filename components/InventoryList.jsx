import React, { useState } from 'react';
import { FlatList, TextInput, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import { FilterTabs } from '@/components/ui/FilterTabs';
import InventoryItem from '@/components/InventoryItem';

const CATEGORIES = ['All', 'Dairy', 'Meat & Fish', 'Fruits & Veggies', 'Frozen', 'Pantry'];

function InventoryList() {
  const { t } = useTranslation();
  const { items, markConsumed, markWasted } = useInventory();
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
      <TextInput
        testID="inventory-search"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
        placeholder={t('fridge.search')}
      />
      <FilterTabs
        tabs={CATEGORIES}
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
  searchInput: {
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#001a3d',
  },
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
