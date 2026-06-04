import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { exportData, importData } from '@/utils/dataTransfer';

const mockState = {
  inventory: [{ id: 'uuid-001', name: 'Milk', status: 'active' }],
  settings: { aiProvider: 'openai', language: 'en' },
};

describe('dataTransfer', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('exportData reads inventory + settings from AsyncStorage and calls expo-sharing', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(mockState.inventory));
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify(mockState.settings));
    await exportData();
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
    const [filePath] = Sharing.shareAsync.mock.calls[0];
    expect(filePath).toContain('expiresnap-backup');
    expect(filePath).toContain('.json');
  });

  it('importData parses valid JSON and writes to AsyncStorage', async () => {
    const json = JSON.stringify(mockState);
    await importData(json);
    const inventory = JSON.parse(await AsyncStorage.getItem('expiresnap_inventory'));
    const settings = JSON.parse(await AsyncStorage.getItem('expiresnap_settings'));
    expect(inventory[0].name).toBe('Milk');
    expect(settings.language).toBe('en');
  });

  it('importData throws on invalid JSON', async () => {
    await expect(importData('not-json')).rejects.toThrow();
  });

  it('importData throws when inventory field missing', async () => {
    await expect(importData(JSON.stringify({ settings: {} }))).rejects.toThrow(/invalid/i);
  });

  it('importData throws when settings field missing', async () => {
    await expect(importData(JSON.stringify({ inventory: [] }))).rejects.toThrow(/invalid/i);
  });
});
