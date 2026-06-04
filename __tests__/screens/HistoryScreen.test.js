import React from 'react';
import { render, waitFor, within } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HistoryScreen from '@/screens/HistoryScreen';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

const items = [
  { id: '1', name: 'Old Milk', category: 'Dairy', status: 'consumed', estimated_expiry_date: '2026-05-01', confidence_days: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Spoiled Meat', category: 'Meat & Fish', status: 'wasted', estimated_expiry_date: '2026-05-15', confidence_days: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Active Rice', category: 'Pantry', status: 'active', estimated_expiry_date: '2026-12-01', confidence_days: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

describe('HistoryScreen', () => {
  beforeEach(() => AsyncStorage.clear());

  it('renders consumed and wasted items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByText } = render(<Wrapper><HistoryScreen /></Wrapper>);
    await waitFor(() => {
      expect(getByText('Old Milk')).toBeTruthy();
      expect(getByText('Spoiled Meat')).toBeTruthy();
    });
  });

  it('does not render active items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { queryByText } = render(<Wrapper><HistoryScreen /></Wrapper>);
    await waitFor(() => expect(queryByText('Active Rice')).toBeNull());
  });

  it('renders consumed badge on consumed items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId } = render(<Wrapper><HistoryScreen /></Wrapper>);
    await waitFor(() =>
      expect(within(getByTestId('history-badge-1')).getByText(/consumed/i)).toBeTruthy()
    );
  });

  it('renders wasted badge on wasted items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId } = render(<Wrapper><HistoryScreen /></Wrapper>);
    await waitFor(() =>
      expect(within(getByTestId('history-badge-2')).getByText(/wasted/i)).toBeTruthy()
    );
  });
});
