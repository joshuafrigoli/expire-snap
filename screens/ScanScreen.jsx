import React, { useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker';
import { validateImage } from '@/utils/validateImage';
import { compressImage } from '@/utils/compressImage';
import { mockScanReceipt } from '@/utils/mockScanReceipt';

export default function ScanScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [scanning, setScanning] = useState(false);
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
      const scanResult = await mockScanReceipt(base64);
      navigation.navigate('Review', { scanResult });
    } catch (err) {
      // handle error silently for now
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
      const scanResult = await mockScanReceipt(base64);
      navigation.navigate('Review', { scanResult });
    } catch (err) {
      // handle error silently for now
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
    </View>
  );
}
