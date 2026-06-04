import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsScreen from '@/screens/SettingsScreen';
import { SettingsProvider } from '@/context/SettingsContext';

describe('SettingsScreen', () => {
  beforeEach(() => AsyncStorage.clear());

  it('renders provider selector, API key input, auto-delete selector, language selector', () => {
    const { getByTestId } = render(<SettingsProvider><SettingsScreen /></SettingsProvider>);
    expect(getByTestId('settings-ai-provider')).toBeTruthy();
    expect(getByTestId('settings-api-key')).toBeTruthy();
    expect(getByTestId('settings-auto-delete')).toBeTruthy();
    expect(getByTestId('settings-language')).toBeTruthy();
  });

  it('API key input is masked (secureTextEntry)', () => {
    const { getByTestId } = render(<SettingsProvider><SettingsScreen /></SettingsProvider>);
    expect(getByTestId('settings-api-key').props.secureTextEntry).toBe(true);
  });

  it('persists API key change to expiresnap_settings immediately', async () => {
    const { getByTestId } = render(<SettingsProvider><SettingsScreen /></SettingsProvider>);
    fireEvent.changeText(getByTestId('settings-api-key'), 'sk-new-key');
    await waitFor(async () => {
      const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_settings'));
      expect(stored.apiKey).toBe('sk-new-key');
    });
  });
});
