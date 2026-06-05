import './utils/i18n';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from '@/navigation/AppNavigator';
import { SnackbarProvider } from '@/context/SnackbarContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <SnackbarProvider>
        <AppNavigator />
      </SnackbarProvider>
    </SafeAreaProvider>
  );
}
