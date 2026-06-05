import React, { useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import ReviewItem from '@/components/ReviewItem';

export default function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { addItem } = useInventory();

  const [items, setItems] = useState(route.params.scanResult.items);

  function handleChange(id, changes) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleConfirm() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      if (item.name.trim() === '') return;

      const expiry = new Date(item.estimated_expiry_date);
      expiry.setHours(0, 0, 0, 0);

      if (expiry < today) return;
    }

    const now = new Date().toISOString();
    for (const item of items) {
      addItem({ ...item, status: 'active', createdAt: now, updatedAt: now });
    }

    navigation.navigate('BottomTabs', { screen: 'Fridge' });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('review.title')}</Text>
          <Text style={styles.subtitle}>{items.length} {t('days.unit').replace('days', 'items').replace('giorni', 'prodotti')}</Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ReviewItem
              item={item}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          )}
        />

        <View style={styles.footer}>
          <Pressable
            testID="review-confirm-btn"
            onPress={handleConfirm}
            style={styles.confirmBtn}
          >
            <Text style={styles.confirmBtnText}>{'✅  ' + t('review.confirm')}</Text>
          </Pressable>
        </View>
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
    backgroundColor: '#eff6ff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#bfdbfe',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005bc4',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  confirmBtn: {
    backgroundColor: '#005bc4',
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
