import './utils/i18n';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from '@/navigation/AppNavigator';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { PortalProvider } from '@/context/PortalContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <SnackbarProvider>
        <PortalProvider>
          <AppNavigator />
        </PortalProvider>
      </SnackbarProvider>
    </SafeAreaProvider>
  );
}
