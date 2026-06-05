import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import Animated, { SlideInLeft, SlideOutLeft } from 'react-native-reanimated';

const VARIANTS = {
  info:    { bg: '#005bc4', text: '#ffffff', border: '#001a3d', icon: 'ℹ️  ' },
  success: { bg: '#15803d', text: '#ffffff', border: '#001a3d', icon: '✅  ' },
  error:   { bg: '#dc2626', text: '#ffffff', border: '#001a3d', icon: '⚠️  ' },
};

function Snackbar({ message, visible, variant = 'info', onDismiss }) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = React.useContext(BottomTabBarHeightContext);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => { onDismiss && onDismiss(); }, 3000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  const v = VARIANTS[variant] || VARIANTS.info;
  const bottomPad = (tabBarHeight ?? insets.bottom) + 16;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <View style={[styles.overlay, { paddingBottom: bottomPad }]} pointerEvents="box-none">
        <Animated.View
          entering={SlideInLeft.duration(280)}
          exiting={SlideOutLeft.duration(250)}
          style={[styles.container, { backgroundColor: v.bg, borderColor: v.border }]}
        >
          <Text testID="snackbar-message" style={[styles.message, { color: v.text }]}>
            {v.icon + message}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  container: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
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

export { Snackbar };
export default Snackbar;
