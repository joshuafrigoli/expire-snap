import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.safeArea}>
      <View testID="screen-scan" style={styles.container}>
        <Text style={styles.title}>Scan Receipt</Text>
        <Text style={styles.subtitle}>Point your camera at a grocery receipt</Text>

        <Pressable
          testID="scan-camera-btn"
          onPress={handleCamera}
          disabled={scanning}
          accessibilityState={{ disabled: scanning }}
          style={[styles.buttonPrimary, scanning && styles.buttonDisabled]}
        >
          <Text style={styles.buttonPrimaryText}>{'📷  ' + t('scan.camera')}</Text>
        </Pressable>

        <Pressable
          testID="scan-gallery-btn"
          onPress={handleGallery}
          disabled={scanning}
          accessibilityState={{ disabled: scanning }}
          style={[styles.buttonSecondary, scanning && styles.buttonDisabled]}
        >
          <Text style={styles.buttonSecondaryText}>{'🖼️  ' + t('scan.gallery')}</Text>
        </Pressable>

        {scanning && (
          <Text style={styles.scanningText}>Scanning...</Text>
        )}

        <Snackbar
          message={snackbarMessage}
          visible={!!snackbarMessage}
          onDismiss={() => setSnackbarMessage('')}
          variant="error"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    backgroundColor: '#eff6ff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#005bc4',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#005bc4',
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    width: '100%',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#005bc4',
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    width: '100%',
  },
  buttonSecondaryText: {
    color: '#005bc4',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  scanningText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
