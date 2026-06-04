import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '@/screens/OnboardingScreen';
import { SettingsProvider } from '@/context/SettingsContext';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, replace: mockNavigate }),
}));

describe('OnboardingScreen', () => {
  beforeEach(() => { AsyncStorage.clear(); mockNavigate.mockClear(); });

  it('disables "Let\'s Go" button when name is empty', () => {
    const { getByTestId } = render(<SettingsProvider><OnboardingScreen /></SettingsProvider>);
    expect(getByTestId('onboarding-submit-btn').props.accessibilityState?.disabled).toBe(true);
  });

  it('enables submit after name entered', () => {
    const { getByTestId } = render(<SettingsProvider><OnboardingScreen /></SettingsProvider>);
    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Josh');
    expect(getByTestId('onboarding-submit-btn').props.accessibilityState?.disabled).toBeFalsy();
  });

  it('saves profile to expiresnap_settings and navigates to Home on submit', async () => {
    const { getByTestId } = render(<SettingsProvider><OnboardingScreen /></SettingsProvider>);
    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Josh');
    fireEvent.press(getByTestId('onboarding-submit-btn'));
    await waitFor(async () => {
      const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_settings'));
      expect(stored.profile.name).toBe('Josh');
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });
});
