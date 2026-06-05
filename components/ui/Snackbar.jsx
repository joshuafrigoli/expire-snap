import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { useTheme } from '@/theme';

function makeVariants(colors) {
  return {
    info:    { bg: colors.snackbarInfo,    text: colors.snackbarText, border: colors.border, icon: 'ℹ️  ' },
    success: { bg: colors.snackbarSuccess, text: colors.snackbarText, border: colors.border, icon: '✅  ' },
    error:   { bg: colors.snackbarError,   text: colors.snackbarText, border: colors.border, icon: '⚠️  ' },
  };
}

function Snackbar({ message, visible, variant = 'info', onDismiss, bottom = 16 }) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const VARIANTS = makeVariants(colors);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => { onDismiss && onDismiss(); }, 3000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  const v = VARIANTS[variant] || VARIANTS.info;

  return (
    <Animated.View
      entering={SlideInLeft.duration(280)}
      exiting={SlideOutLeft.duration(250)}
      pointerEvents="none"
      style={[styles.container, { backgroundColor: v.bg, borderColor: v.border, bottom }]}
    >
      <Text testID="snackbar-message" style={[styles.message, { color: v.text }]}>
        {v.icon + message}
      </Text>
    </Animated.View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: 16,
      right: 16,
      borderRadius: 12,
      borderWidth: 2,
      paddingVertical: 14,
      paddingHorizontal: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: {
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
      flexShrink: 1,
    },
  });
}

export { Snackbar };
export default Snackbar;
