import React from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import DatePicker from '@/components/ui/DatePicker';

export default function ReviewItem({ item, onChange, onDelete }) {
  const { t } = useTranslation();
  const dateValue = item.estimated_expiry_date ? new Date(item.estimated_expiry_date) : null;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <TextInput
          testID={"review-item-name-" + item.id}
          style={styles.nameInput}
          value={item.name}
          onChangeText={(text) => onChange(item.id, { name: text })}
          placeholderTextColor="#94a3b8"
        />
        <Pressable
          testID={"review-item-delete-" + item.id}
          onPress={() => onDelete(item.id)}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </Pressable>
      </View>

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

      {item.confidence_days != null && (
        <Text style={styles.confidence}>
          {t('review.confidenceDays', { n: item.confidence_days })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#001a3d',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#dc2626',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 16,
  },
  confidence: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
});
