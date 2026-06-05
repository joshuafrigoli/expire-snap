import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Snackbar from '@/components/ui/Snackbar';

const SnackbarContext = createContext(null);

function GlobalSnackbar({ snack, onDismiss }) {
  const insets = useSafeAreaInsets();
  return (
    <Snackbar
      message={snack.message}
      visible={snack.visible}
      variant={snack.variant}
      onDismiss={onDismiss}
      bottom={insets.bottom + 16}
    />
  );
}

export function SnackbarProvider({ children }) {
  const [snack, setSnack] = useState({ message: '', variant: 'info', visible: false });

  const showSnackbar = useCallback((message, variant = 'info') => {
    setSnack({ message, variant, visible: true });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnack(s => ({ ...s, visible: false }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      <View style={styles.root}>
        {children}
        <GlobalSnackbar snack={snack} onDismiss={hideSnackbar} />
      </View>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be inside SnackbarProvider');
  return ctx;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
