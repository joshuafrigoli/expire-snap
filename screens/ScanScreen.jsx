import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';
import { validateImage } from '@/utils/validateImage';
import { compressImage } from '@/utils/compressImage';
import { scanReceipt } from '@/utils/scanReceipt';
import { useSettings } from '@/context/SettingsContext';
import { Snackbar } from '@/components/ui';

function ScanOverlay({ t }) {
  const scale = useSharedValue(1);
  const lineY = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    lineY.value = withRepeat(
      withTiming(96, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lineY.value }] }));

  return (
    <View style={styles.overlayBackdrop}>
      <View style={styles.overlayCard}>
        <View style={styles.receiptBox}>
          <Animated.Text style={[styles.receiptIcon, iconStyle]}>🧾</Animated.Text>
          <Animated.View style={[styles.scanLine, lineStyle]} />
        </View>
        <Text style={styles.overlayTitle}>{t('scan.processing')}</Text>
        <Text style={styles.overlaySubtitle}>{t('scan.processingSubtitle')}</Text>
      </View>
    </View>
  );
}

export default function ScanScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { settings } = useSettings();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const scanningRef = useRef(false);

  const handleCamera = async () => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setScanning(true);
    try {
      const { granted } = await requestCameraPermissionsAsync();
      if (!granted) { setSnackbarMessage(t('errors.permissionDenied')); return; }
      const result = await launchCameraAsync({ mediaTypes: 'Images', quality: 1 });
      if (result.canceled || !result.assets?.[0]) return;
      setProcessing(true);
      const asset = result.assets[0];
      validateImage({ mimeType: asset.mimeType, fileSize: asset.fileSize });
      const { base64 } = await compressImage(asset.uri);
      const scanResult = await scanReceipt(base64, settings.aiProvider, settings.apiKey);
      if (!scanResult.items.length) {
        setSnackbarMessage(t('errors.noItemsFound'));
        return;
      }
      navigation.navigate('Review', { scanResult });
    } catch (err) {
      if (err.name === 'RateLimitError') {
        setSnackbarMessage(err.message);
      } else {
        setSnackbarMessage(t('errors.scanFailed'));
      }
    } finally {
      scanningRef.current = false;
      setScanning(false);
      setProcessing(false);
    }
  };

  const handleGallery = async () => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setScanning(true);
    try {
      const { granted } = await requestMediaLibraryPermissionsAsync();
      if (!granted) { setSnackbarMessage(t('errors.permissionDenied')); return; }
      const result = await launchImageLibraryAsync({ mediaTypes: 'Images', quality: 1 });
      if (result.canceled || !result.assets?.[0]) return;
      setProcessing(true);
      const asset = result.assets[0];
      validateImage({ mimeType: asset.mimeType, fileSize: asset.fileSize });
      const { base64 } = await compressImage(asset.uri);
      const scanResult = await scanReceipt(base64, settings.aiProvider, settings.apiKey);
      if (!scanResult.items.length) {
        setSnackbarMessage(t('errors.noItemsFound'));
        return;
      }
      navigation.navigate('Review', { scanResult });
    } catch (err) {
      if (err.name === 'RateLimitError') {
        setSnackbarMessage(err.message);
      } else {
        setSnackbarMessage(t('errors.scanFailed'));
      }
    } finally {
      scanningRef.current = false;
      setScanning(false);
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View testID="screen-scan" style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>{t('scan.title')}</Text>
        </View>

        <View style={styles.buttonArea}>
          <Text style={styles.hint}>{t('scan.hint')}</Text>
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
        </View>

        {processing && <ScanOverlay t={t} />}

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
    backgroundColor: '#eff6ff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005bc4',
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center',
  },
  buttonArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
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
    opacity: 0.4,
  },

  // Scanning overlay
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,26,61,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#001a3d',
    padding: 32,
    alignItems: 'center',
    gap: 12,
    width: 260,
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  receiptBox: {
    width: 80,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  receiptIcon: {
    fontSize: 40,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#005bc4',
    opacity: 0.8,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001a3d',
  },
  overlaySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
