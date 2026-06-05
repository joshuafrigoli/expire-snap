import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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

describe('ScanScreen compression wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://raw-photo.jpg', mimeType: 'image/jpeg', fileSize: 8 * 1024 * 1024 }],
    });
    compressImageModule.compressImage.mockResolvedValue({ uri: 'file://compressed.jpg', base64: 'b64==' });
    mockScanModule.scanReceipt.mockResolvedValue({ transaction_date: '2026-06-03', items: [] });
  });

  it('compresses image before passing to scan utility', async () => {
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(compressImageModule.compressImage).toHaveBeenCalledWith('file://raw-photo.jpg');
      expect(mockScanModule.scanReceipt).toHaveBeenCalledWith('b64==', expect.any(String), expect.any(String));
    });
  });

  it('never passes uncompressed base64 to scan utility', async () => {
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      const calls = mockScanModule.scanReceipt.mock.calls;
      const callArg = calls[calls.length - 1][0];
      expect(callArg).toBe('b64==');
      expect(callArg).not.toContain('raw');
    });
  });
});
