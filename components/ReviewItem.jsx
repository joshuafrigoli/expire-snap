import React from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import DatePicker from '@/components/ui/DatePicker';
import { CATEGORY_I18N_KEY } from '@/constants/categories';
import { useTheme } from '@/theme';

const CATEGORIES = ['Dairy', 'Meat & Fish', 'Fruits & Veggies', 'Frozen', 'Pantry'];

function computeDaysLeft(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry - today) / 86400000);
}

export default function ReviewItem({ item, onChange, onDelete }) {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = makeStyles(colors);
  const dateValue = item.estimated_expiry_date ? new Date(item.estimated_expiry_date) : null;
  const daysLeft = computeDaysLeft(item.estimated_expiry_date);

  function handleCategoryPress() {
    const idx = CATEGORIES.indexOf(item.category);
    const next = CATEGORIES[(idx + 1) % CATEGORIES.length];
    onChange(item.id, { category: next });
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <TextInput
          testID={"review-item-name-" + item.id}
          style={styles.nameInput}
          value={item.name}
          onChangeText={(text) => onChange(item.id, { name: text })}
          placeholderTextColor={colors.textMuted}
        />
        <Pressable
          testID={"review-item-delete-" + item.id}
          onPress={() => onDelete(item.id)}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.bottomRow}>
        <Pressable
          testID={"review-item-category-" + item.id}
          onPress={handleCategoryPress}
          style={styles.categoryBadge}
        >
          <Text style={styles.categoryText}>
            {t(CATEGORY_I18N_KEY[item.category] ?? `categories.${item.category}`, { defaultValue: item.category ?? 'Pantry' })}
            {' ▾'}
          </Text>
        </Pressable>

        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>📅</Text>
          <DatePicker
            testID={"review-item-date-" + item.id}
            value={dateValue}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                onChange(item.id, { estimated_expiry_date: selectedDate.toISOString().split('T')[0] });
              }
            }}
          />
        </View>
      </View>

      {daysLeft !== null && (
        <Text style={styles.confidence}>
          {daysLeft < 0
            ? t('days.expired')
            : daysLeft === 0
            ? t('days.today')
            : daysLeft === 1
            ? t('days.tomorrow')
            : t('days.daysLeft', { n: daysLeft })}
        </Text>
      )}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      gap: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    nameInput: {
      flex: 1,
      backgroundColor: colors.bg,
      borderWidth: 2,
      borderColor: colors.borderLight,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    deleteBtn: {
      width: 36,
      height: 36,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteBtnText: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: '700',
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    categoryBadge: {
      backgroundColor: colors.surfaceAlt2,
      borderWidth: 2,
      borderColor: colors.borderLight,
      borderRadius: 9999,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dateLabel: {
      fontSize: 14,
    },
    confidence: {
      fontSize: 11,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
  });
}
