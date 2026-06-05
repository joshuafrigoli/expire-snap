jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', regionCode: 'US' }],
  locale: 'en-US',
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaView: ({ children, style, ...props }) => React.createElement(View, { style, ...props }, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } },
  };
});

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const ref = { current: null, isReady: () => false, canGoBack: () => false, goBack: jest.fn() };
  return {
    NavigationContainer: ({ children }) => React.createElement(React.Fragment, null, children),
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() }),
    useRoute: () => ({ params: {} }),
    useFocusEffect: () => {},
    useIsFocused: () => true,
    createNavigationContainerRef: () => ref,
    useNavigationContainerRef: () => ref,
  };
});

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }) => {
        const arr = React.Children.toArray(children);
        return arr.length ? arr[0] : null;
      },
      Screen: ({ component: Component }) =>
        React.createElement(Component, {
          navigation: { navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() },
          route: { params: {} },
        }),
    }),
    TransitionPresets: {},
    CardStyleInterpolators: {},
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  return {
    useBottomTabBarHeight: () => 56,
    BottomTabBarHeightContext: React.createContext(undefined),
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => {
        const arr = React.Children.toArray(children);
        return arr.length ? arr[0] : null;
      },
      Screen: ({ component: Component }) =>
        React.createElement(Component, {
          navigation: { navigate: jest.fn(), goBack: jest.fn() },
          route: { params: {} },
        }),
    }),
  };
});

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
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, opts) => opts?.defaultValue ?? key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  const noop = () => {};
  const useSharedValue = (val) => ({ value: val });
  const useAnimatedStyle = (fn) => fn();
  const withSpring = (val) => val;
  const withTiming = (val) => val;
  const withDelay = (_, val) => val;
  const withSequence = (...vals) => vals[vals.length - 1];
  const withRepeat = (val) => val;
  const interpolate = (val) => val;
  const Extrapolation = { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' };
  const useAnimatedScrollHandler = () => noop;
  const useAnimatedRef = () => ({ current: null });
  const useAnimatedReaction = noop;
  const runOnJS = (fn) => fn;
  const runOnUI = (fn) => fn;
  const Easing = { linear: noop, ease: noop, bezier: () => noop, in: () => noop, out: () => noop, inOut: () => noop };
  const animBuilder = () => { const b = { springify: () => b, damping: () => b, duration: () => b, delay: () => b, easing: () => b, withInitialValues: () => b, withCallback: () => b, reduceMotion: () => b }; return b; };
  const SlideInDown = animBuilder(); const SlideInUp = animBuilder(); const SlideOutDown = animBuilder();
  const SlideInLeft = animBuilder(); const SlideOutLeft = animBuilder(); const SlideInRight = animBuilder(); const SlideOutRight = animBuilder();
  const FadeIn = animBuilder(); const FadeOut = animBuilder(); const FadeInRight = animBuilder(); const FadeOutLeft = animBuilder();
  const AnimatedView = ({ children, style, ...props }) => React.createElement(View, { style, ...props }, children);
  const createAnimatedComponent = (Component) => {
    const Wrapped = ({ children, style, ...props }) => React.createElement(Component, { style, ...props }, children);
    return Wrapped;
  };
  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      Text: ({ children, style, ...props }) => React.createElement(require('react-native').Text, { style, ...props }, children),
      ScrollView: ({ children, style, ...props }) => React.createElement(require('react-native').ScrollView, { style, ...props }, children),
      Image: ({ style, ...props }) => React.createElement(require('react-native').Image, { style, ...props }),
      FlatList: ({ style, ...props }) => React.createElement(require('react-native').FlatList, { style, ...props }),
      createAnimatedComponent,
    },
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    withRepeat,
    interpolate,
    Extrapolation,
    useAnimatedScrollHandler,
    useAnimatedRef,
    useAnimatedReaction,
    runOnJS,
    runOnUI,
    Easing,
    createAnimatedComponent,
    SlideInDown, SlideInUp, SlideOutDown,
    SlideInLeft, SlideOutLeft, SlideInRight, SlideOutRight,
    FadeIn, FadeOut, FadeInRight, FadeOutLeft,
    Animated: {
      View: AnimatedView,
      createAnimatedComponent,
    },
  };
});
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
