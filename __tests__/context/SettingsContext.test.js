import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { Text, Pressable } from 'react-native';

const TestConsumer = ({ onRender }) => {
  const { settings, updateSettings } = useSettings();
  onRender(settings);
  return (
    <Pressable testID="update-btn" onPress={() => updateSettings({ language: 'it' })}>
      <Text>{settings.language}</Text>
    </Pressable>
  );
};

describe('SettingsContext', () => {
  beforeEach(() => AsyncStorage.clear());

  it('returns default settings when AsyncStorage is empty', async () => {
    let captured;
    render(
      <SettingsProvider>
        <TestConsumer onRender={s => { captured = s; }} />
      </SettingsProvider>
    );
    await waitFor(() => {
      expect(captured.aiProvider).toBe('openai');
      expect(captured.autoDeleteDays).toBe(30);
      expect(captured.language).toBe('en');
      expect(captured.profile).toEqual({ name: '', avatarEmoji: '' });
    });
  });

  it('persists updated settings to AsyncStorage under expiresnap_settings key', async () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestConsumer onRender={() => {}} />
      </SettingsProvider>
    );
    await act(async () => {
      fireEvent.press(getByTestId('update-btn'));
    });
    const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_settings'));
    expect(stored.language).toBe('it');
  });

  it('loads persisted settings on mount', async () => {
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({
      aiProvider: 'anthropic', apiKey: 'sk-test', autoDeleteDays: 7,
      language: 'it', profile: { name: 'Josh', avatarEmoji: '🍕' }
    }));
    let captured;
    render(
      <SettingsProvider>
        <TestConsumer onRender={s => { captured = s; }} />
      </SettingsProvider>
    );
    await waitFor(() => {
      expect(captured.aiProvider).toBe('anthropic');
      expect(captured.profile.name).toBe('Josh');
    });
  });

  it('stores apiKey in expiresnap_settings (never in plain top-level key)', async () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestConsumer onRender={() => {}} />
      </SettingsProvider>
    );
    await act(async () => {
      fireEvent.press(getByTestId('update-btn'));
    });
    const topLevelKeys = await AsyncStorage.getAllKeys();
    expect(topLevelKeys).not.toContain('apiKey');
    expect(topLevelKeys).toContain('expiresnap_settings');
  });
});
