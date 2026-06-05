import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

function makeVariants(colors) {
  return {
    danger: { bg: colors.dangerBg, text: colors.danger },
    warning: { bg: colors.warningBg, text: colors.warningText },
    safe: { bg: colors.successBg, text: colors.success },
    neutral: { bg: colors.inactive, text: colors.textBody },
  };
}

export function Badge({ label, variant = 'neutral', testID }) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const variantStyles = makeVariants(colors);
  const variantColor = variantStyles[variant] || variantStyles.neutral;

  return (
    <View testID={testID} style={[styles.pill, { backgroundColor: variantColor.bg }]}>
      <Text style={[styles.label, { color: variantColor.text }]}>{label}</Text>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
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
}

export default Badge;
