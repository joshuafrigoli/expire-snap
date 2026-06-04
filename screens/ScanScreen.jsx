import React, { useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker';
import { validateImage } from '@/utils/validateImage';
import { compressImage } from '@/utils/compressImage';
import { scanReceipt } from '@/utils/scanReceipt';
import { useSettings } from '@/context/SettingsContext';
import { Snackbar } from '@/components/ui';

export default function ScanScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { settings } = useSettings();
  const [scanning, setScanning] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const scanningRef = useRef(false);

  const handleCamera = async () => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setScanning(true);
    try {
      const result = await launchCameraAsync({ mediaTypes: 'Images', quality: 1 });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      validateImage({ mimeType: asset.mimeType, fileSize: asset.fileSize });
      const { base64 } = await compressImage(asset.uri);
      const scanResult = await scanReceipt(base64, settings.aiProvider, settings.apiKey);
      navigation.navigate('Review', { scanResult });
    } catch (err) {
      if (err.name === 'RateLimitError') {
        setSnackbarMessage(err.message);
      }
    } finally {
      scanningRef.current = false;
      setScanning(false);
    }
  };

  const handleGallery = async () => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setScanning(true);
    try {
      const result = await launchImageLibraryAsync({ mediaTypes: 'Images', quality: 1 });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      validateImage({ mimeType: asset.mimeType, fileSize: asset.fileSize });
      const { base64 } = await compressImage(asset.uri);
      const scanResult = await scanReceipt(base64, settings.aiProvider, settings.apiKey);
      navigation.navigate('Review', { scanResult });
    } catch (err) {
      if (err.name === 'RateLimitError') {
        setSnackbarMessage(err.message);
      }
    } finally {
      scanningRef.current = false;
      setScanning(false);
    }
  };

  return (
    <View testID="screen-scan">
      <Pressable
        testID="scan-camera-btn"
        onPress={handleCamera}
        disabled={scanning}
        accessibilityState={{ disabled: scanning }}
      >
        <Text>{t('scan.camera')}</Text>
      </Pressable>
      <Pressable
        testID="scan-gallery-btn"
        onPress={handleGallery}
        disabled={scanning}
        accessibilityState={{ disabled: scanning }}
      >
        <Text>{t('scan.gallery')}</Text>
      </Pressable>
      <Snackbar
        message={snackbarMessage}
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage('')}
        variant="error"
      />
    </View>
  );
}
