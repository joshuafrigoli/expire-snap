import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export async function exportData() {
  const [inventoryRaw, settingsRaw] = await Promise.all([
    AsyncStorage.getItem('expiresnap_inventory'),
    AsyncStorage.getItem('expiresnap_settings'),
  ]);

  const payload = JSON.stringify({
    inventory: inventoryRaw ? JSON.parse(inventoryRaw) : [],
    settings: settingsRaw ? JSON.parse(settingsRaw) : {},
  }, null, 2);

  const filePath = `${FileSystem.cacheDirectory}expiresnap-backup.json`;
  await FileSystem.writeAsStringAsync(filePath, payload, {
    encoding: 'utf8',
  });

  await Sharing.shareAsync(filePath, {
    mimeType: 'application/json',
    dialogTitle: 'Export ExpireSnap Data',
  });
}

export async function importData(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON');
  }

  if (!parsed || !Array.isArray(parsed.inventory)) {
    throw new Error('Invalid backup: missing inventory field');
  }
  if (!parsed || typeof parsed.settings !== 'object' || parsed.settings === null) {
    throw new Error('Invalid backup: missing settings field');
  }

  await Promise.all([
    AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(parsed.inventory)),
    AsyncStorage.setItem('expiresnap_settings', JSON.stringify(parsed.settings)),
  ]);
}
