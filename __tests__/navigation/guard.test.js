import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from '@/navigation/AppNavigator';

describe('Navigation guard', () => {
  beforeEach(() => AsyncStorage.clear());

  it('redirects to Onboarding when profile name missing', async () => {
    const { getByTestId } = render(<AppNavigator />);
    await waitFor(() => expect(getByTestId('screen-onboarding')).toBeTruthy());
  });

  it('renders Home when profile name exists', async () => {
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({
      profile: { name: 'Josh', avatarEmoji: '🍕' }
    }));
    const { getByTestId } = render(<AppNavigator />);
    await waitFor(() => expect(getByTestId('screen-home')).toBeTruthy());
  });
});
