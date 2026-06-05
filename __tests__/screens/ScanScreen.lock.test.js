import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import * as compressImageModule from '@/utils/compressImage';
import * as mockScanModule from '@/utils/scanReceipt';
import ScanScreen from '@/screens/ScanScreen';
import { SettingsProvider } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { SnackbarProvider } from '@/context/SnackbarContext';

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

const Wrapper = ({ children }) => (
  <SnackbarProvider><SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider></SnackbarProvider>
);

describe('ScanScreen button lock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://raw.jpg', mimeType: 'image/jpeg', fileSize: 1024 }],
    });
    compressImageModule.compressImage.mockResolvedValue({ uri: 'file://c.jpg', base64: 'b64==' });
    // scan takes a while — don't resolve immediately
    mockScanModule.scanReceipt.mockImplementation(() => new Promise(() => {}));
  });

  it('disables camera button while scan is in progress', async () => {
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(getByTestId('scan-camera-btn').props.accessibilityState?.disabled).toBe(true);
    });
  });

  it('disables gallery button while scan is in progress', async () => {
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(getByTestId('scan-gallery-btn').props.accessibilityState?.disabled).toBe(true);
    });
  });

  it('scan utility called only once even if button tapped multiple times', async () => {
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    fireEvent.press(getByTestId('scan-camera-btn'));
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(mockScanModule.scanReceipt).toHaveBeenCalledTimes(1);
    });
  });

  it('re-enables buttons after scan completes', async () => {
    mockScanModule.scanReceipt.mockResolvedValue({ transaction_date: '2026-06-03', items: [] });
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(getByTestId('scan-camera-btn').props.accessibilityState?.disabled).toBeFalsy();
    });
  });
});
