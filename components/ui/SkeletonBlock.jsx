import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme';

function SkeletonBlock({ testID, width, height, style }) {
  const colors = useTheme();
  const styles = makeStyles(colors);

  const resolvedWidth = width !== undefined ? width : '100%';
  const resolvedHeight = height !== undefined ? height : 16;

  return (
    <View
      testID={testID}
      style={[
        styles.block,
        { width: resolvedWidth, height: resolvedHeight },
        style,
      ]}
    />
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    block: {
      backgroundColor: colors.inactive,
      borderRadius: 8,
    },
  });
}

export { SkeletonBlock };
export default SkeletonBlock;
