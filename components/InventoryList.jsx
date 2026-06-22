import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import { FilterTabs, Input, DatePicker } from '@/components/ui';
import InventoryItem from '@/components/InventoryItem';
import { usePortal } from '@/context/PortalContext';
import { useTheme } from '@/theme';

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
  const { items, markConsumed, markWasted, updateItem } = useInventory();
  const categories = CATEGORY_KEYS.map(c => ({ value: c.value, label: t(c.key) }));
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [editingItem, setEditingItem] = useState(null);
  const [pendingDate, setPendingDate] = useState(null);
  const portal = usePortal();
  const colors = useTheme();
  const portalKey = 'inventory-edit-date';

  const handleEditOpen = useCallback((id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setEditingItem(item);
    setPendingDate(new Date(item.estimated_expiry_date));
  }, [items]);

  const handleEditSave = useCallback(async () => {
    if (!editingItem || !pendingDate) return;
    await updateItem(editingItem.id, {
      estimated_expiry_date: pendingDate.toISOString().split('T')[0],
    });
    setEditingItem(null);
  }, [editingItem, pendingDate, updateItem]);

  const handleEditCancel = useCallback(() => {
    setEditingItem(null);
  }, []);

  useEffect(() => {
    if (!editingItem) {
      portal.unmount(portalKey);
      return;
    }
    const s = makeModalStyles(colors);
    portal.mount(
      portalKey,
      <View key={portalKey} style={s.backdrop}>
        <View style={s.dialog}>
          <Text style={s.dialogTitle}>{t('fridge.editDateTitle')}</Text>
          <Text style={s.itemName}>{editingItem.name}</Text>
          <DatePicker
            testID="edit-date-picker"
            value={pendingDate}
            onChange={(_, selected) => selected && setPendingDate(selected)}
          />
          <View style={s.dialogButtons}>
            <Pressable testID="edit-date-cancel" onPress={handleEditCancel} style={s.cancelBtn}>
              <Text style={s.cancelBtnText}>{t('actions.cancel')}</Text>
            </Pressable>
            <Pressable testID="edit-date-save" onPress={handleEditSave} style={s.saveBtn}>
              <Text style={s.saveBtnText}>{t('actions.save')}</Text>
            </Pressable>
          </View>
        </View>
      </View>,
    );
    return () => portal.unmount(portalKey);
  }, [editingItem, pendingDate, colors, t, handleEditSave, handleEditCancel]);

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
            onEdit={handleEditOpen}
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
    paddingTop: 12,
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

function makeModalStyles(colors) {
  return StyleSheet.create({
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
    itemName: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    dialogButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    cancelBtn: {
      flex: 1,
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
    saveBtn: {
      flex: 1,
      backgroundColor: colors.primary,
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
    saveBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primaryFg,
    },
  });
}

export { InventoryList };
export default InventoryList;
