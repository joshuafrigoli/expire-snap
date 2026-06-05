import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileScreen from '@/screens/ProfileScreen';
import { SettingsProvider } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { SnackbarProvider } from '@/context/SnackbarContext';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const Wrapper = ({ children }) => (
  <SnackbarProvider><SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider></SnackbarProvider>
);

describe('ProfileScreen', () => {
  beforeEach(() => { AsyncStorage.clear(); mockNavigate.mockClear(); });

  it('renders user name from settings', async () => {
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({
      profile: { name: 'Josh', avatarEmoji: '🍕' }
    }));
    const { getByText } = render(<Wrapper><ProfileScreen /></Wrapper>);
    await waitFor(() => expect(getByText('Josh')).toBeTruthy());
  });

  it('renders Export Data and Import Data buttons', () => {
    const { getByTestId } = render(<Wrapper><ProfileScreen /></Wrapper>);
    expect(getByTestId('profile-export-btn')).toBeTruthy();
    expect(getByTestId('profile-import-btn')).toBeTruthy();
  });

  it('renders History link button', () => {
    const { getByTestId } = render(<Wrapper><ProfileScreen /></Wrapper>);
    expect(getByTestId('profile-history-btn')).toBeTruthy();
  });

  it('navigates to History on history link press', () => {
    const { getByTestId } = render(<Wrapper><ProfileScreen /></Wrapper>);
    fireEvent.press(getByTestId('profile-history-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('History');
  });
});
