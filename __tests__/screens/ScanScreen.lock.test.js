import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import * as compressImageModule from '@/utils/compressImage';
import * as mockScanModule from '@/utils/mockScanReceipt';
import ScanScreen from '@/screens/ScanScreen';
import { SettingsProvider } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';

jest.mock('@/utils/compressImage');
jest.mock('@/utils/mockScanReceipt');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
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
    mockScanModule.mockScanReceipt.mockImplementation(() => new Promise(() => {}));
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
      expect(mockScanModule.mockScanReceipt).toHaveBeenCalledTimes(1);
    });
  });

  it('re-enables buttons after scan completes', async () => {
    mockScanModule.mockScanReceipt.mockResolvedValue({ transaction_date: '2026-06-03', items: [] });
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(getByTestId('scan-camera-btn').props.accessibilityState?.disabled).toBeFalsy();
    });
  });
});
