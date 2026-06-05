import React from 'react';
import { Modal as RNModal, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme';

function Modal({ visible, children }) {
  const colors = useTheme();
  const styles = makeStyles(colors);

  if (!visible) return null;

  return (
    <RNModal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {children}
        </View>
      </View>
    </RNModal>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.backdrop,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 24,
      minWidth: 280,
      maxWidth: '90%',
    },
  });
}

export { Modal };
export default Modal;
