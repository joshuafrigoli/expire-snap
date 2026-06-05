import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, lightColors } from '@/theme';

// Badges always use light-palette vivid colors so they pop on both light and dark backgrounds
const VARIANTS = {
  danger: { bg: lightColors.dangerBg, text: lightColors.danger },
  warning: { bg: lightColors.warningBg, text: lightColors.warningText },
  safe: { bg: lightColors.successBg, text: lightColors.success },
  neutral: { bg: lightColors.inactive, text: lightColors.textBody },
};

export function Badge({ label, variant = 'neutral', testID }) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const variantColor = VARIANTS[variant] || VARIANTS.neutral;

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
