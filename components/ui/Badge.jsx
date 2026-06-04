import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const variantStyles = {
  danger: { bg: '#fca5a5', text: '#dc2626' },
  warning: { bg: '#fde68a', text: '#b45309' },
  safe: { bg: '#bbf7d0', text: '#15803d' },
  neutral: { bg: '#e2e8f0', text: '#475569' },
};

export function Badge({ label, variant = 'neutral' }) {
  const colors = variantStyles[variant] || variantStyles.neutral;

  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Badge;
