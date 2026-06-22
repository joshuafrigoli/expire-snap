import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FridgeScreen from '@/screens/FridgeScreen';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { PortalProvider } from '@/context/PortalContext';
import { SnackbarProvider } from '@/context/SnackbarContext';

const today = new Date();
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

const Wrapper = ({ children }) => (
  <SnackbarProvider>
    <SettingsProvider>
      <InventoryProvider>
        <PortalProvider>
          {children}
        </PortalProvider>
      </InventoryProvider>
    </SettingsProvider>
  </SnackbarProvider>
);

beforeEach(() => AsyncStorage.clear());

describe('FridgeScreen clean modal', () => {
  it('opens choice modal when trash button pressed', async () => {
    const { getByTestId } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByTestId('fridge-clear-btn')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-btn'));
    await waitFor(() => {
      expect(getByTestId('fridge-clear-expired-btn')).toBeTruthy();
      expect(getByTestId('fridge-clear-all-btn')).toBeTruthy();
    });
  });

  it('cancel on choice modal closes modal entirely', async () => {
    const { getByTestId, queryByTestId } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByTestId('fridge-clear-btn')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-btn'));
    await waitFor(() => expect(getByTestId('fridge-clear-cancel')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-cancel'));
    await waitFor(() => expect(queryByTestId('fridge-clear-expired-btn')).toBeNull());
  });

  it('pressing clear expired shows confirmation without executing', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify([
      { id: '1', name: 'OldMilk', status: 'active', estimated_expiry_date: daysFromNow(-2), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]));
    const { getByTestId, queryByTestId } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByTestId('item-consume-btn-1')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-btn'));
    await waitFor(() => expect(getByTestId('fridge-clear-expired-btn')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-expired-btn'));
    await waitFor(() => expect(getByTestId('fridge-confirm-proceed')).toBeTruthy());
    const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_inventory'));
    expect(stored[0].status).toBe('active');
    expect(queryByTestId('fridge-clear-expired-btn')).toBeNull();
  });

  it('pressing clear all shows confirmation without executing', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify([
      { id: '1', name: 'Milk', status: 'active', estimated_expiry_date: daysFromNow(5), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]));
    const { getByTestId, queryByTestId } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByTestId('item-consume-btn-1')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-btn'));
    await waitFor(() => expect(getByTestId('fridge-clear-all-btn')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-all-btn'));
    await waitFor(() => expect(getByTestId('fridge-confirm-proceed')).toBeTruthy());
    const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_inventory'));
    expect(stored[0].status).toBe('active');
    expect(queryByTestId('fridge-clear-all-btn')).toBeNull();
  });

  it('cancel from confirmation returns to choice modal', async () => {
    const { getByTestId } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByTestId('fridge-clear-btn')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-btn'));
    await waitFor(() => expect(getByTestId('fridge-clear-expired-btn')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-expired-btn'));
    await waitFor(() => expect(getByTestId('fridge-confirm-proceed')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-cancel'));
    await waitFor(() => {
      expect(getByTestId('fridge-clear-expired-btn')).toBeTruthy();
      expect(getByTestId('fridge-clear-all-btn')).toBeTruthy();
    });
  });

  it('confirming clear expired marks only expired items as wasted', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify([
      { id: '1', name: 'OldMilk', status: 'active', estimated_expiry_date: daysFromNow(-2), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'FreshYogurt', status: 'active', estimated_expiry_date: daysFromNow(5), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]));
    const { getByTestId } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByTestId('item-consume-btn-1')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-btn'));
    await waitFor(() => expect(getByTestId('fridge-clear-expired-btn')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-expired-btn'));
    await waitFor(() => expect(getByTestId('fridge-confirm-proceed')).toBeTruthy());
    await act(async () => { fireEvent.press(getByTestId('fridge-confirm-proceed')); });
    const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_inventory'));
    expect(stored.find(i => i.id === '1').status).toBe('wasted');
    expect(stored.find(i => i.id === '2').status).toBe('active');
  });

  it('confirming clear everything removes all active items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify([
      { id: '1', name: 'OldMilk', status: 'active', estimated_expiry_date: daysFromNow(-2), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'FreshYogurt', status: 'active', estimated_expiry_date: daysFromNow(5), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]));
    const { getByTestId } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByTestId('item-consume-btn-1')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-btn'));
    await waitFor(() => expect(getByTestId('fridge-clear-all-btn')).toBeTruthy());
    fireEvent.press(getByTestId('fridge-clear-all-btn'));
    await waitFor(() => expect(getByTestId('fridge-confirm-proceed')).toBeTruthy());
    await act(async () => { fireEvent.press(getByTestId('fridge-confirm-proceed')); });
    const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_inventory'));
    expect(stored.filter(i => i.status === 'active')).toHaveLength(0);
  });
});
