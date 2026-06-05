import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
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
    <View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReviewItem
            item={item}
            onChange={handleChange}
            onDelete={handleDelete}
          />
        )}
      />
      <Pressable testID="review-confirm-btn" onPress={handleConfirm}>
        <Text>{t('review.confirm')}</Text>
      </Pressable>
    </View>
  );
}
