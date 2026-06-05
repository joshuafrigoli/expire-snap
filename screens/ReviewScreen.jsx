import React, { useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import ReviewItem from '@/components/ReviewItem';
import { Snackbar } from '@/components/ui';

export default function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { addItem } = useInventory();

  const [items, setItems] = useState(route.params.scanResult.items);
  const [snackbar, setSnackbar] = useState('');

  function handleChange(id, changes) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleConfirm() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      if (item.name.trim() === '') {
        setSnackbar('Item name cannot be empty');
        return;
      }
      const expiry = new Date(item.estimated_expiry_date);
      console.log('[Review] item:', item.name, 'expiry:', item.estimated_expiry_date, 'parsed:', expiry, 'today:', today);
      if (isNaN(expiry.getTime())) {
        setSnackbar('Invalid date for "' + item.name + '" — tap the date to fix it');
        return;
      }
      expiry.setHours(0, 0, 0, 0);
      if (expiry < today) {
        setSnackbar('"' + item.name + '" expiry is in the past — tap the date to fix it');
        return;
      }
    }

    const now = new Date().toISOString();
    try {
      for (const item of items) {
        await addItem({ ...item, status: 'active', createdAt: now, updatedAt: now });
      }
      console.log('[Review] added', items.length, 'items to fridge');
    } catch (err) {
      console.error('[Review] addItem error:', err);
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

        <Snackbar
          message={snackbar}
          visible={!!snackbar}
          onDismiss={() => setSnackbar('')}
          variant="error"
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
