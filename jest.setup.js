let mockAsyncStore = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) => Promise.resolve(mockAsyncStore[key] ?? null)),
  setItem: jest.fn((key, value) => { mockAsyncStore[key] = value; return Promise.resolve(); }),
  removeItem: jest.fn((key) => { delete mockAsyncStore[key]; return Promise.resolve(); }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockAsyncStore))),
  clear: jest.fn(() => { mockAsyncStore = {}; return Promise.resolve(); }),
  multiGet: jest.fn((keys) => Promise.resolve(keys.map((k) => [k, mockAsyncStore[k] ?? null]))),
  multiSet: jest.fn((pairs) => { pairs.forEach(([k, v]) => { mockAsyncStore[k] = v; }); return Promise.resolve(); }),
  multiRemove: jest.fn((keys) => { keys.forEach((k) => { delete mockAsyncStore[k]; }); return Promise.resolve(); }),
}));
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id-123'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
}));
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ testID, onChange, value, ...props }) =>
    React.createElement(View, { testID, onChange, ...props });
});
jest.mock('expo-file-system', () => ({
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  cacheDirectory: 'file://cache/',
  documentDirectory: 'file://documents/',
  EncodingType: { UTF8: 'utf8' },
}));
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: 'RNSScreen',
  ScreenContainer: 'RNSScreenContainer',
  ScreenStack: 'RNSScreenStack',
  ScreenStackHeaderConfig: 'RNSScreenStackHeaderConfig',
  NativeScreen: 'RNSNativeScreen',
  NativeScreenContainer: 'RNSNativeScreenContainer',
  FullWindowOverlay: 'RNSFullWindowOverlay',
  ScreenContentWrapper: 'RNSScreenContentWrapper',
}));
require('react-native-gesture-handler/jestSetup');
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ testID, children, ...props }) =>
      React.createElement(View, { testID, ...props }, children),
  };
});
jest.mock('react-native-shadow-2', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Shadow: ({ children, ...props }) => React.createElement(View, props, children),
  };
});
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://doc.json', name: 'backup.json', mimeType: 'application/json' }],
  }),
}));
