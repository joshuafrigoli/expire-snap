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
import { ProfileButton } from '@/components/ui';
import { useSnackbar } from '@/context/SnackbarContext';
import { useTheme } from '@/theme';

function ScanOverlay({ t }) {
  const colors = useTheme();
  const styles = makeStyles(colors);
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
  const { showSnackbar } = useSnackbar();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const scanningRef = useRef(false);
  const colors = useTheme();
  const styles = makeStyles(colors);

  const handleCamera = async () => {
    if (scanningRef.current) return;
    if (!settings.apiKey?.trim()) { showSnackbar(t('errors.noApiKey'), 'error'); return; }
    scanningRef.current = true;
    setScanning(true);
    try {
      console.log('[Scan] requesting camera permission...');
      const { granted } = await requestCameraPermissionsAsync();
      console.log('[Scan] camera permission:', granted);
      if (!granted) { showSnackbar(t('errors.permissionDenied'), 'error'); return; }
      const result = await launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets?.[0]) { console.log('[Scan] camera cancelled'); return; }
      setProcessing(true);
      const asset = result.assets[0];
      console.log('[Scan] image picked — mime:', asset.mimeType, 'size:', asset.fileSize, 'bytes');
      validateImage({ mimeType: asset.mimeType, fileSize: asset.fileSize });
      const { base64 } = await compressImage(asset.uri);
      console.log('[Scan] compressed — base64 length:', base64?.length);
      console.log('[Scan] calling AI provider:', settings.aiProvider, '— key length:', settings.apiKey?.length);
      const scanResult = await scanReceipt(base64, settings.aiProvider, settings.apiKey);
      console.log('[Scan] AI response — items:', scanResult.items.length, JSON.stringify(scanResult.items, null, 2));
      if (!scanResult.items.length) {
        showSnackbar(t('errors.noItemsFound'), 'error');
        return;
      }
      navigation.navigate('Review', { scanResult });
    } catch (err) {
      console.error('[Scan] error:', err.name, err.message);
      if (err.name === 'RateLimitError') {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar(t('errors.scanFailed'), 'error');
      }
    } finally {
      scanningRef.current = false;
      setScanning(false);
      setProcessing(false);
    }
  };

  const handleGallery = async () => {
    if (scanningRef.current) return;
    if (!settings.apiKey?.trim()) { showSnackbar(t('errors.noApiKey'), 'error'); return; }
    scanningRef.current = true;
    setScanning(true);
    try {
      console.log('[Scan] requesting media library permission...');
      const { granted } = await requestMediaLibraryPermissionsAsync();
      console.log('[Scan] media library permission:', granted);
      if (!granted) { showSnackbar(t('errors.permissionDenied'), 'error'); return; }
      const result = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets?.[0]) { console.log('[Scan] gallery cancelled'); return; }
      setProcessing(true);
      const asset = result.assets[0];
      console.log('[Scan] image picked — mime:', asset.mimeType, 'size:', asset.fileSize, 'bytes');
      validateImage({ mimeType: asset.mimeType, fileSize: asset.fileSize });
      const { base64 } = await compressImage(asset.uri);
      console.log('[Scan] compressed — base64 length:', base64?.length);
      console.log('[Scan] calling AI provider:', settings.aiProvider, '— key length:', settings.apiKey?.length);
      const scanResult = await scanReceipt(base64, settings.aiProvider, settings.apiKey);
      console.log('[Scan] AI response — items:', scanResult.items.length, JSON.stringify(scanResult.items, null, 2));
      if (!scanResult.items.length) {
        showSnackbar(t('errors.noItemsFound'), 'error');
        return;
      }
      navigation.navigate('Review', { scanResult });
    } catch (err) {
      console.error('[Scan] error:', err.name, err.message);
      if (err.name === 'RateLimitError') {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar(t('errors.scanFailed'), 'error');
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
          <ProfileButton testID="scan-profile-btn" />
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

      </View>
      {processing && <ScanOverlay t={t} />}
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      flex: 1,
    },
    hint: {
      fontSize: 14,
      color: colors.textSecondary,
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
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 9999,
      paddingVertical: 16,
      paddingHorizontal: 40,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
      width: '100%',
    },
    buttonPrimaryText: {
      color: colors.primaryFg,
      fontSize: 16,
      fontWeight: '700',
    },
    buttonSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 9999,
      paddingVertical: 16,
      paddingHorizontal: 40,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
      width: '100%',
    },
    buttonSecondaryText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.4,
    },

    // Scanning overlay
    overlayBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.backdrop,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlayCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 32,
      alignItems: 'center',
      gap: 12,
      width: 260,
      shadowColor: colors.shadow,
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
      borderColor: colors.borderLight,
      backgroundColor: colors.bg,
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
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.primary,
      opacity: 0.8,
    },
    overlayTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    overlaySubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
