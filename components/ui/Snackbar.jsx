import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const VARIANT_COLORS = {
  info: '#bfdbfe',
  success: '#bbf7d0',
  error: '#fca5a5',
};

function Snackbar({ message, visible, variant = 'info', onDismiss }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => { onDismiss && onDismiss(); }, 3000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  if (!visible) return null;

  const backgroundColor = VARIANT_COLORS[variant] || VARIANT_COLORS.info;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text testID="snackbar-message" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
  },
});

export { Snackbar };
export default Snackbar;
