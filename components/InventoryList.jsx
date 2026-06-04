import React, { useState } from 'react';
import { FlatList, TextInput, View, StyleSheet } from 'react-native';
import { useInventory } from '@/context/InventoryContext';
import { FilterTabs } from '@/components/ui/FilterTabs';
import InventoryItem from '@/components/InventoryItem';

const CATEGORIES = ['All', 'Dairy', 'Meat & Fish', 'Fruits & Veggies', 'Frozen', 'Pantry'];

function InventoryList() {
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
        placeholder="Search..."
      />
      <FilterTabs
        tabs={CATEGORIES}
        activeTab={activeCategory}
        onTabPress={setActiveCategory}
      />
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
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
  container: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
  },
});

export { InventoryList };
export default InventoryList;
