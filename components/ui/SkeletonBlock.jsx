import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function SkeletonBlock({ testID, width, height, style }) {
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

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
});

export { SkeletonBlock };
export default SkeletonBlock;
