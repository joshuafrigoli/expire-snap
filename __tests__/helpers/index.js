import React from 'react';
import { SettingsProvider } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { SnackbarProvider } from '@/context/SnackbarContext';

export const today = new Date();
export const daysFromNow = (n) =>
  new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

export const mockItem = (overrides = {}) => ({
  id: 'uuid-001',
  name: 'Fresh Milk',
  category: 'Dairy',
  estimated_expiry_date: daysFromNow(5),
  confidence_days: 1,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const Wrapper = ({ children }) => (
  <SnackbarProvider>
    <SettingsProvider>
      <InventoryProvider>{children}</InventoryProvider>
    </SettingsProvider>
  </SnackbarProvider>
);

// Navigation mock: CANNOT be exported — jest.mock() is hoisted by babel-jest.
// Copy this block verbatim to the top of every screen test file:
//
// const mockNavigate = jest.fn();
// jest.mock('@react-navigation/native', () => ({
//   useNavigation: () => ({ navigate: mockNavigate, replace: mockNavigate, goBack: jest.fn() }),
//   useRoute: () => ({ params: {} }),
// }));
// beforeEach(() => { AsyncStorage.clear(); mockNavigate.mockClear(); });
