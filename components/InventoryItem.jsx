import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, ProgressBar } from '@/components/ui';

function computeDaysLeft(estimated_expiry_date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(estimated_expiry_date);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry - today) / 86400000);
}

function getProgressColor(daysLeft) {
  if (daysLeft < 0) return 'danger';
  if (daysLeft <= 3) return 'warning';
  return 'safe';
}

export function InventoryItem({ id, name, category, estimated_expiry_date, onConsume, onWaste }) {
  const { t } = useTranslation();
  const daysLeft = computeDaysLeft(estimated_expiry_date);
  const progressColor = getProgressColor(daysLeft);

  return (
    <View>
      <Text>{name}</Text>
      <Badge label={category} variant={progressColor} />
      <Text testID="item-countdown">{daysLeft}</Text>
      <ProgressBar
        testID="item-progress"
        color={progressColor}
        value={Math.max(0, daysLeft)}
        max={30}
        fillTestID="item-progress-fill"
      />
      <Pressable
        testID={"item-consume-btn-" + id}
        onPress={() => onConsume && onConsume(id)}
      >
        <Text>{t('actions.consume')}</Text>
      </Pressable>
      <Pressable
        testID={"item-waste-btn-" + id}
        onPress={() => onWaste && onWaste(id)}
      >
        <Text>{t('actions.waste')}</Text>
      </Pressable>
    </View>
  );
}

export default InventoryItem;
