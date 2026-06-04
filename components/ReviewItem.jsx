import React from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import DatePicker from '@/components/ui/DatePicker';

export default function ReviewItem({ item, onChange, onDelete }) {
  const { t } = useTranslation();
  const dateValue = item.estimated_expiry_date ? new Date(item.estimated_expiry_date) : null;

  return (
    <View>
      <TextInput
        testID={"review-item-name-" + item.id}
        value={item.name}
        onChangeText={(text) => onChange(item.id, { name: text })}
      />
      <DatePicker
        testID={"review-item-date-" + item.id}
        value={dateValue}
        onChange={(event, selectedDate) => {
          if (selectedDate) {
            onChange(item.id, { estimated_expiry_date: selectedDate.toISOString().split('T')[0] });
          }
        }}
      />
      <Text>{"± " + item.confidence_days + " days"}</Text>
      <Pressable
        testID={"review-item-delete-" + item.id}
        onPress={() => onDelete(item.id)}
      >
        <Text>{t('actions.delete')}</Text>
      </Pressable>
    </View>
  );
}
