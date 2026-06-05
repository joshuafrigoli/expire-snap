import React from 'react';
import { View, Text } from 'react-native';

const VARIANT_BG = {
  danger: '#fca5a5',
  warning: '#fde68a',
  safe: '#bbf7d0',
  info: '#bfdbfe',
};

const VARIANT_COUNT_COLOR = {
  danger: '#dc2626',
  warning: '#b45309',
  safe: '#15803d',
  info: '#1d4ed8',
};

export function StatCard({ label, count, variant, testID, countTestID }) {
  const backgroundColor = VARIANT_BG[variant] ?? VARIANT_BG.safe;
  const countColor = VARIANT_COUNT_COLOR[variant] ?? VARIANT_COUNT_COLOR.safe;

  return (
    <View
      testID={testID}
      style={{
        backgroundColor,
        borderWidth: 2,
        borderColor: '#001a3d',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#001a3d',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: '#001a3d',
        }}
      >
        {label}
      </Text>
      <Text
        testID={countTestID}
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: countColor,
        }}
      >
        {count}
      </Text>
    </View>
  );
}

export default StatCard;
