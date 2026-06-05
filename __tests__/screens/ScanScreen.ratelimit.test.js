import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import * as compressImageModule from '@/utils/compressImage';
import * as scanReceiptModule from '@/utils/scanReceipt';
import ScanScreen from '@/screens/ScanScreen';
import { SettingsProvider } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';

jest.mock('@/utils/compressImage');
jest.mock('@/utils/scanReceipt');
jest.mock('@/context/SettingsContext', () => ({
  SettingsProvider: ({ children }) => children,
  useSettings: () => ({ settings: { apiKey: 'test-key', aiProvider: 'openai', autoDeleteDays: 30, language: 'en', profile: { name: 'Test', avatarEmoji: '' } }, updateSettings: jest.fn() }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

class RateLimitError extends Error {
  constructor() { super('Too Many Requests'); this.name = 'RateLimitError'; }
}

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

describe('ScanScreen 429 rate limit handling', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    ImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://raw.jpg', mimeType: 'image/jpeg', fileSize: 1024 }],
    });
    compressImageModule.compressImage.mockResolvedValue({ uri: 'file://c.jpg', base64: 'b64==' });
  });

  it('shows rate limit snackbar message on RateLimitError', async () => {
    scanReceiptModule.scanReceipt.mockRejectedValueOnce(new RateLimitError());
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(getByTestId('snackbar-message').props.children).toMatch(/troppe richieste|too many requests/i);
    });
  });

  it('re-enables scan buttons after rate limit error', async () => {
    scanReceiptModule.scanReceipt.mockRejectedValueOnce(new RateLimitError());
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(getByTestId('scan-camera-btn').props.accessibilityState?.disabled).toBeFalsy();
    });
  });

  it('does not navigate to Review screen on rate limit error', async () => {
    scanReceiptModule.scanReceipt.mockRejectedValueOnce(new RateLimitError());
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith('Review');
    });
  });
});
