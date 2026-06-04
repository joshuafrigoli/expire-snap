import React from 'react';
import { View, Text } from 'react-native';

const VARIANT_COLORS = {
  danger: '#fca5a5',
  warning: '#fde68a',
  safe: '#bbf7d0',
};

export function StatCard({ label, count, variant, testID, countTestID }) {
  const backgroundColor = VARIANT_COLORS[variant] ?? VARIANT_COLORS.safe;

  return (
    <View
      testID={testID}
      style={{ backgroundColor, borderRadius: 12, padding: 16 }}
    >
      <Text>{label}</Text>
      <Text testID={countTestID}>{count}</Text>
    </View>
  );
}

export default StatCard;
