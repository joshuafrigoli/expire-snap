import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { usePortal } from '@/context/PortalContext';
import { useTheme } from '@/theme';

let _seq = 0;

function Modal({ visible, children }) {
  const colors = useTheme();
  const portal = usePortal();
  const key = useRef(`modal-${_seq++}`).current;

  useEffect(() => {
    if (!visible) {
      portal.unmount(key);
      return;
    }
    const s = makeStyles(colors);
    portal.mount(key, (
      <View key={key} style={s.overlay}>
        <View style={s.container}>
          {children}
        </View>
      </View>
    ));
    return () => portal.unmount(key);
  }, [visible, colors]);

  return null;
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
