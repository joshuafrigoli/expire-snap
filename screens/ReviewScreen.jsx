import React, { useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@/context/InventoryContext';
import ReviewItem from '@/components/ReviewItem';
import { ProfileButton } from '@/components/ui';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTheme } from '@/theme';

export default function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { addItems } = useInventory();

  const { showSnackbar } = useSnackbar();
  const [items, setItems] = useState(route.params.scanResult.items);

  const colors = useTheme();
  const styles = makeStyles(colors);

  function handleChange(id, changes) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleAddItem() {
    const today = new Date();
    const defaultExpiry = new Date(today);
    defaultExpiry.setDate(defaultExpiry.getDate() + 7);
    const isoExpiry = defaultExpiry.toISOString().split('T')[0];
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: '',
        category: 'Pantry',
        estimated_expiry_date: isoExpiry,
        confidence_days: 0,
      },
    ]);
  }

  async function handleConfirm() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      if (item.name.trim() === '') {
        showSnackbar('Item name cannot be empty', 'error');
        return;
      }
      const expiry = new Date(item.estimated_expiry_date);
      console.log('[Review] item:', item.name, 'expiry:', item.estimated_expiry_date, 'parsed:', expiry, 'today:', today);
      if (isNaN(expiry.getTime())) {
        showSnackbar('Invalid date for "' + item.name + '" — tap the date to fix it', 'error');
        return;
      }
      expiry.setHours(0, 0, 0, 0);
      if (expiry < today) {
        showSnackbar('"' + item.name + '" expiry is in the past — tap the date to fix it', 'error');
        return;
      }
    }

    const now = new Date().toISOString();
    try {
      await addItems(items.map((item) => ({ ...item, status: 'active', createdAt: now, updatedAt: now })));
      console.log('[Review] added', items.length, 'items to fridge');
    } catch (err) {
      console.error('[Review] addItems error:', err);
    }

    navigation.navigate('BottomTabs', { screen: 'Fridge' });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ProfileButton testID="review-profile-btn" />
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('review.title')}</Text>
            <Text style={styles.subtitle}>{t('review.itemCount', { n: items.length })}</Text>
          </View>
          <Pressable
            testID="review-add-btn"
            onPress={handleAddItem}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>{'+'}</Text>
          </Pressable>
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

function makeStyles(colors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 4,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    list: {
      padding: 16,
      gap: 12,
    },
    footer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      paddingTop: 8,
      backgroundColor: colors.bg,
    },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    addBtnText: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.primary,
      lineHeight: 26,
    },
    confirmBtn: {
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 9999,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    confirmBtnText: {
      color: colors.primaryFg,
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
