import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme';

function Card({ children, style }) {
  const colors = useTheme();
  const styles = makeStyles(colors);

  return (
    <Shadow offset={[4, 4]} startColor={colors.shadow} distance={0}>
      <View style={[styles.card, style]}>
        {children}
      </View>
    </Shadow>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 16,
    },
  });
}

export { Card };
export default Card;
