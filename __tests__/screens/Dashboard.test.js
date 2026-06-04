import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardScreen from '@/screens/DashboardScreen';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const today = new Date();
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

const items = [
  { id: '1', name: 'Milk', status: 'active', estimated_expiry_date: daysFromNow(-1) },  // expired
  { id: '2', name: 'Yogurt', status: 'active', estimated_expiry_date: daysFromNow(2) }, // expiring soon
  { id: '3', name: 'Rice', status: 'active', estimated_expiry_date: daysFromNow(60) },  // safe
];

describe('Dashboard stats', () => {
  it('shows correct Expired / Expiring Soon / Safe counts', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId } = render(
      <SettingsProvider><InventoryProvider><DashboardScreen /></InventoryProvider></SettingsProvider>
    );
    await waitFor(() => {
      expect(Number(getByTestId('stat-expired').props.children)).toBe(1);
      expect(Number(getByTestId('stat-expiring').props.children)).toBe(1);
      expect(Number(getByTestId('stat-safe').props.children)).toBe(1);
    });
  });
});
