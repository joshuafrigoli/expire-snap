import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InventoryList from '@/components/InventoryList';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';

const today = new Date();
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

const makeItem = (id, name, category, status = 'active') => ({
  id, name, category, status,
  estimated_expiry_date: daysFromNow(5),
  confidence_days: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const items = [
  makeItem('1', 'Milk', 'Dairy'),
  makeItem('2', 'Chicken', 'Meat & Fish'),
  makeItem('3', 'Consumed Item', 'Dairy', 'consumed'),
];

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

describe('InventoryList', () => {
  beforeEach(() => AsyncStorage.clear());

  it('renders only active items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByText, queryByText } = render(<Wrapper><InventoryList /></Wrapper>);
    await waitFor(() => {
      expect(getByText('Milk')).toBeTruthy();
      expect(queryByText('Consumed Item')).toBeNull();
    });
  });

  it('renders search input', async () => {
    const { getByTestId } = render(<Wrapper><InventoryList /></Wrapper>);
    await waitFor(() => expect(getByTestId('inventory-search')).toBeTruthy());
  });

  it('filters items by search text', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId, queryByText, getByText } = render(<Wrapper><InventoryList /></Wrapper>);
    await waitFor(() => expect(getByText('Milk')).toBeTruthy());
    fireEvent.changeText(getByTestId('inventory-search'), 'Chicken');
    await waitFor(() => expect(queryByText('Milk')).toBeNull());
  });

  it('filters items by category tab', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId, queryByText, getByText } = render(<Wrapper><InventoryList /></Wrapper>);
    await waitFor(() => expect(getByText('Milk')).toBeTruthy());
    fireEvent.press(getByTestId('filter-tab-Meat & Fish'));
    await waitFor(() => expect(queryByText('Milk')).toBeNull());
  });
});
