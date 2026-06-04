# Tests — ExpireSnap TDD

Tests are written before implementation. Each test corresponds to a task in PLAN.md. All tests must pass before a phase is considered complete.

---

## Shared Test Helpers — `__tests__/helpers/index.js`

**MANDATORY**: never redefine `daysFromNow`, `Wrapper`, `mockItem`, or `today` inline. Import from `@testHelpers`.

```js
import { daysFromNow, Wrapper, mockItem } from '@testHelpers';
```

File content (created in Phase 0):

```js
import React from 'react';
import { SettingsProvider } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';

export const today = new Date();
export const daysFromNow = (n) =>
  new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

export const mockItem = (overrides = {}) => ({
  id: 'uuid-001',
  name: 'Fresh Milk',
  category: 'Dairy',
  estimated_expiry_date: daysFromNow(5),
  confidence_days: 1,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const Wrapper = ({ children }) => (
  <SettingsProvider>
    <InventoryProvider>{children}</InventoryProvider>
  </SettingsProvider>
);

// Navigation mock: CANNOT be exported — jest.mock() is hoisted by babel-jest.
// Copy this block verbatim to the top of every screen test file:
//
// const mockNavigate = jest.fn();
// jest.mock('@react-navigation/native', () => ({
//   useNavigation: () => ({ navigate: mockNavigate, replace: mockNavigate, goBack: jest.fn() }),
//   useRoute: () => ({ params: {} }),
// }));
// beforeEach(() => { AsyncStorage.clear(); mockNavigate.mockClear(); });
```

---

## Test Stack

```bash
# Already included with Expo
jest + @types/jest

# Install
npx expo install @testing-library/react-native @testing-library/jest-native
npm install --save-dev jest-expo
```

`package.json` jest config:
```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["@testing-library/jest-native/extend-expect", "./jest.setup.js"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1",
      "^@testHelpers$": "<rootDir>/__tests__/helpers/index.js"
    }
  }
}
```

Global mocks in `__mocks__/` or `jest.setup.js`:
```js
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
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
// Use the official jest setup provided by the package
require('react-native-gesture-handler/jestSetup');
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ testID, children, ...props }) =>
      React.createElement(View, { testID, ...props }, children),
  };
});
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [{ uri: 'file://doc.json', name: 'backup.json', mimeType: 'application/json' }] }),
}));
```

---

## Phase 0: Project Setup & State Architecture

### `context/SettingsContext` — `__tests__/context/SettingsContext.test.js`

```js
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { Text, Pressable } from 'react-native';

const TestConsumer = ({ onRender }) => {
  const { settings, updateSettings } = useSettings();
  onRender(settings);
  return (
    <Pressable testID="update-btn" onPress={() => updateSettings({ language: 'it' })}>
      <Text>{settings.language}</Text>
    </Pressable>
  );
};

describe('SettingsContext', () => {
  beforeEach(() => AsyncStorage.clear());

  it('returns default settings when AsyncStorage is empty', async () => {
    let captured;
    render(
      <SettingsProvider>
        <TestConsumer onRender={s => { captured = s; }} />
      </SettingsProvider>
    );
    await waitFor(() => {
      expect(captured.aiProvider).toBe('openai');
      expect(captured.autoDeleteDays).toBe(30);
      expect(captured.language).toBe('en');
      expect(captured.profile).toEqual({ name: '', avatarEmoji: '' });
    });
  });

  it('persists updated settings to AsyncStorage under expiresnap_settings key', async () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestConsumer onRender={() => {}} />
      </SettingsProvider>
    );
    await act(async () => {
      fireEvent.press(getByTestId('update-btn'));
    });
    const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_settings'));
    expect(stored.language).toBe('it');
  });

  it('loads persisted settings on mount', async () => {
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({
      aiProvider: 'anthropic', apiKey: 'sk-test', autoDeleteDays: 7,
      language: 'it', profile: { name: 'Josh', avatarEmoji: '🍕' }
    }));
    let captured;
    render(
      <SettingsProvider>
        <TestConsumer onRender={s => { captured = s; }} />
      </SettingsProvider>
    );
    await waitFor(() => {
      expect(captured.aiProvider).toBe('anthropic');
      expect(captured.profile.name).toBe('Josh');
    });
  });

  it('stores apiKey in expiresnap_settings (never in plain top-level key)', async () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestConsumer onRender={() => {}} />
      </SettingsProvider>
    );
    await act(async () => {
      fireEvent.press(getByTestId('update-btn'));
    });
    const topLevelKeys = await AsyncStorage.getAllKeys();
    expect(topLevelKeys).not.toContain('apiKey');
    expect(topLevelKeys).toContain('expiresnap_settings');
  });
});
```

---

### `context/InventoryContext` — `__tests__/context/InventoryContext.test.js`

```js
import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryProvider, useInventory } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';

const mockItem = (overrides = {}) => ({
  id: 'uuid-001',
  name: 'Fresh Milk',
  category: 'Dairy',
  estimated_expiry_date: '2026-06-10',
  confidence_days: 1,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

const TestConsumer = ({ onRender }) => {
  const ctx = useInventory();
  onRender(ctx);
  return null;
};

describe('InventoryContext', () => {
  beforeEach(() => AsyncStorage.clear());

  it('starts with empty inventory', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx.items).toEqual([]));
  });

  it('addItem appends item and persists to AsyncStorage', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_inventory'));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Fresh Milk');
  });

  it('deleteItem removes item by id', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await act(async () => { ctx.deleteItem('uuid-001'); });
    await waitFor(() => expect(ctx.items).toHaveLength(0));
  });

  it('markConsumed sets status to consumed and updates updatedAt', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    const originalUpdatedAt = ctx.items[0].updatedAt;
    await act(async () => { ctx.markConsumed('uuid-001'); });
    await waitFor(() => {
      expect(ctx.items[0].status).toBe('consumed');
      expect(ctx.items[0].updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  it('markWasted sets status to wasted', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await act(async () => { ctx.markWasted('uuid-001'); });
    await waitFor(() => expect(ctx.items[0].status).toBe('wasted'));
  });

  it('updateItem modifies fields on matching id', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await act(async () => { ctx.updateItem('uuid-001', { name: 'Whole Milk' }); });
    await waitFor(() => expect(ctx.items[0].name).toBe('Whole Milk'));
  });

  it('auto-delete purges consumed/wasted items older than autoDeleteDays on load', async () => {
    const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({ autoDeleteDays: 7 }));
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify([
      mockItem({ id: 'old-consumed', status: 'consumed', updatedAt: oldDate }),
      mockItem({ id: 'recent-consumed', status: 'consumed', updatedAt: recentDate }),
      mockItem({ id: 'active-item', status: 'active', updatedAt: oldDate }),
    ]));
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => {
      const ids = ctx.items.map(i => i.id);
      expect(ids).not.toContain('old-consumed');
      expect(ids).toContain('recent-consumed');
      expect(ids).toContain('active-item');
    });
  });

  it('auto-delete skips purge when autoDeleteDays is never', async () => {
    const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({ autoDeleteDays: 'never' }));
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify([
      mockItem({ id: 'old-consumed', status: 'consumed', updatedAt: oldDate }),
    ]));
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => {
      expect(ctx.items.map(i => i.id)).toContain('old-consumed');
    });
  });
});
```

---

### `utils/dataTransfer` — `__tests__/utils/dataTransfer.test.js`

```js
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
```

---

## Phase 1: Base UI Component Kit

### `components/ui/Button` — `__tests__/components/ui/Button.test.js`

```js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui';

describe('Button', () => {
  it('renders label text', () => {
    const { getByText } = render(<Button label="Add Item" />);
    expect(getByText('Add Item')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Tap me" onPress={onPress} />);
    fireEvent.press(getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<Button testID="btn" label="Tap" onPress={onPress} disabled />);
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it.each(['primary', 'secondary', 'ghost'])('renders variant %s without crash', (variant) => {
    const { getByText } = render(<Button label="X" variant={variant} />);
    expect(getByText('X')).toBeTruthy();
  });

  it.each(['sm', 'md', 'lg'])('renders size %s without crash', (size) => {
    const { getByText } = render(<Button label="X" size={size} />);
    expect(getByText('X')).toBeTruthy();
  });
});
```

---

### `components/ui/Badge` — `__tests__/components/ui/Badge.test.js`

```js
import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '@/components/ui';

describe('Badge', () => {
  it.each(['danger', 'warning', 'safe', 'neutral'])('renders %s variant', (variant) => {
    const { getByText } = render(<Badge label="Dairy" variant={variant} />);
    expect(getByText('Dairy')).toBeTruthy();
  });
});
```

---

### `components/ui/ProgressBar` — `__tests__/components/ui/ProgressBar.test.js`

```js
import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '@/components/ui';

describe('ProgressBar', () => {
  it('renders with height >= 16', () => {
    const { getByTestId } = render(<ProgressBar testID="pb" value={50} max={100} color="safe" />);
    const style = getByTestId('pb').props.style;
    const height = Array.isArray(style) ? style.find(s => s?.height)?.height : style?.height;
    expect(height).toBeGreaterThanOrEqual(16);
  });

  it('fill width equals value/max ratio', () => {
    const { getByTestId } = render(
      <ProgressBar value={25} max={100} color="safe" fillTestID="fill" />
    );
    const fill = getByTestId('fill');
    expect(fill.props.style).toMatchObject(expect.objectContaining({ width: '25%' }));
  });
});
```

---

### `components/ui/Input` — `__tests__/components/ui/Input.test.js`

```js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/ui';

describe('Input', () => {
  it('renders placeholder', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Type here" value="" onChangeText={() => {}} />);
    expect(getByPlaceholderText('Type here')).toBeTruthy();
  });

  it('calls onChangeText with new value', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<Input testID="input" value="" onChangeText={onChange} />);
    fireEvent.changeText(getByTestId('input'), 'hello');
    expect(onChange).toHaveBeenCalledWith('hello');
  });
});
```

---

### `components/ui/TopAppBar` — `__tests__/components/ui/TopAppBar.test.js`

```js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TopAppBar } from '@/components/ui';

describe('TopAppBar', () => {
  it('renders page title', () => {
    const { getByText } = render(<TopAppBar title="Dashboard" />);
    expect(getByText('Dashboard')).toBeTruthy();
  });

  it('renders profile avatar button', () => {
    const { getByTestId } = render(<TopAppBar title="X" avatarEmoji="🍕" />);
    expect(getByTestId('topbar-profile-btn')).toBeTruthy();
  });

  it('fires onProfilePress when avatar button tapped', () => {
    const onProfilePress = jest.fn();
    const { getByTestId } = render(
      <TopAppBar title="X" avatarEmoji="🍕" onProfilePress={onProfilePress} />
    );
    fireEvent.press(getByTestId('topbar-profile-btn'));
    expect(onProfilePress).toHaveBeenCalledTimes(1);
  });

  it('renders back button only when onBack provided', () => {
    const { queryByTestId, rerender } = render(<TopAppBar title="X" />);
    expect(queryByTestId('topbar-back-btn')).toBeNull();
    rerender(<TopAppBar title="X" onBack={() => {}} />);
    expect(queryByTestId('topbar-back-btn')).toBeTruthy();
  });

  it('does not render hamburger or extra nav items', () => {
    const { queryByTestId } = render(<TopAppBar title="X" />);
    expect(queryByTestId('topbar-hamburger')).toBeNull();
  });
});
```

---

### `components/ui/BottomNav` — `__tests__/components/ui/BottomNav.test.js`

```js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BottomNav } from '@/components/ui';

const TABS = ['Home', 'Scan', 'Fridge', 'Settings'];

describe('BottomNav', () => {
  it('renders exactly 4 tabs: Home, Scan, Fridge, Settings', () => {
    const { getByText } = render(<BottomNav activeTab="Home" onTabPress={() => {}} />);
    TABS.forEach(tab => expect(getByText(tab)).toBeTruthy());
  });

  it('does not render History tab', () => {
    const { queryByText } = render(<BottomNav activeTab="Home" onTabPress={() => {}} />);
    expect(queryByText('History')).toBeNull();
  });

  it('calls onTabPress with correct tab name', () => {
    const onTabPress = jest.fn();
    const { getByText } = render(<BottomNav activeTab="Home" onTabPress={onTabPress} />);
    fireEvent.press(getByText('Fridge'));
    expect(onTabPress).toHaveBeenCalledWith('Fridge');
  });
});
```

---

### `components/ui/Snackbar` — `__tests__/components/ui/Snackbar.test.js`

```js
import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Snackbar } from '@/components/ui';

describe('Snackbar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders message when visible', () => {
    const { getByText } = render(<Snackbar message="Item saved" visible variant="success" />);
    expect(getByText('Item saved')).toBeTruthy();
  });

  it('calls onDismiss after 3 seconds', () => {
    const onDismiss = jest.fn();
    render(<Snackbar message="Done" visible variant="info" onDismiss={onDismiss} />);
    act(() => jest.advanceTimersByTime(3000));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(<Snackbar message="Hidden" visible={false} variant="info" />);
    expect(queryByText('Hidden')).toBeNull();
  });
});
```

---

### `components/ui/Avatar` — `__tests__/components/ui/Avatar.test.js`

```js
import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '@/components/ui';

describe('Avatar', () => {
  it('renders emoji', () => {
    const { getByText } = render(<Avatar emoji="🍕" size="md" />);
    expect(getByText('🍕')).toBeTruthy();
  });

  it('renders initials when no emoji', () => {
    const { getByText } = render(<Avatar name="Josh Frigoli" size="md" />);
    expect(getByText('JF')).toBeTruthy();
  });

  it.each(['sm', 'md', 'lg'])('renders size %s', (size) => {
    const { getByTestId } = render(<Avatar testID="avatar" emoji="🧑" size={size} />);
    expect(getByTestId('avatar')).toBeTruthy();
  });
});
```

---

### Visual-only components (smoke tests) — `__tests__/components/ui/VisualComponents.test.js`

```js
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Card, Select, DatePicker, FloatingActionButton, FilterTabs, Spinner, Modal, SkeletonBlock } from '@/components/ui';

describe('Card', () => {
  it('renders children without crash', () => {
    const { getByText } = render(<Card><Text>content</Text></Card>);
    expect(getByText('content')).toBeTruthy();
  });
});

describe('Select', () => {
  it('renders selected value without crash', () => {
    const { getByText } = render(
      <Select label="Provider" value="openai" options={[{ label: 'OpenAI', value: 'openai' }, { label: 'Gemini', value: 'gemini' }]} onChange={() => {}} />
    );
    expect(getByText('OpenAI')).toBeTruthy();
  });
  it('renders testID without crash', () => {
    const { getByTestId } = render(
      <Select testID="sel" label="Provider" value="openai" options={[{ label: 'OpenAI', value: 'openai' }, { label: 'Gemini', value: 'gemini' }]} onChange={() => {}} />
    );
    expect(getByTestId('sel')).toBeTruthy();
  });
});

describe('DatePicker', () => {
  it('renders without crash', () => {
    const { getByTestId } = render(
      <DatePicker testID="dp" value={new Date('2026-06-10')} onChange={() => {}} />
    );
    expect(getByTestId('dp')).toBeTruthy();
  });
});

describe('FloatingActionButton', () => {
  it('renders and fires onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<FloatingActionButton testID="fab" onPress={onPress} />);
    fireEvent.press(getByTestId('fab'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('FilterTabs', () => {
  const tabs = ['All', 'Dairy', 'Meat & Fish'];
  it('renders all tab labels', () => {
    const { getByTestId } = render(
      <FilterTabs tabs={tabs} activeTab="All" onTabPress={() => {}} />
    );
    tabs.forEach(tab => expect(getByTestId(`filter-tab-${tab}`)).toBeTruthy());
  });
  it('fires onTabPress with tab name', () => {
    const onTabPress = jest.fn();
    const { getByTestId } = render(
      <FilterTabs tabs={tabs} activeTab="All" onTabPress={onTabPress} />
    );
    fireEvent.press(getByTestId('filter-tab-Dairy'));
    expect(onTabPress).toHaveBeenCalledWith('Dairy');
  });
});

describe('Spinner', () => {
  it('renders without crash', () => {
    const { getByTestId } = render(<Spinner testID="spinner" />);
    expect(getByTestId('spinner')).toBeTruthy();
  });
});

describe('Modal', () => {
  it('renders children when visible', () => {
    const { getByText } = render(<Modal visible><Text>Loading</Text></Modal>);
    expect(getByText('Loading')).toBeTruthy();
  });
  it('does not render children when not visible', () => {
    const { queryByText } = render(<Modal visible={false}><Text>Hidden</Text></Modal>);
    expect(queryByText('Hidden')).toBeNull();
  });
});

describe('SkeletonBlock', () => {
  it('renders without crash', () => {
    const { getByTestId } = render(<SkeletonBlock testID="skeleton" />);
    expect(getByTestId('skeleton')).toBeTruthy();
  });
});
```

---

## Phase 2: Screen Development

### Navigation guard — `__tests__/navigation/guard.test.js`

```js
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from '@/navigation/AppNavigator';

describe('Navigation guard', () => {
  beforeEach(() => AsyncStorage.clear());

  it('redirects to Onboarding when profile name missing', async () => {
    const { getByTestId } = render(<AppNavigator />);
    await waitFor(() => expect(getByTestId('screen-onboarding')).toBeTruthy());
  });

  it('renders Home when profile name exists', async () => {
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({
      profile: { name: 'Josh', avatarEmoji: '🍕' }
    }));
    const { getByTestId } = render(<AppNavigator />);
    await waitFor(() => expect(getByTestId('screen-home')).toBeTruthy());
  });
});
```

---

### Onboarding screen — `__tests__/screens/Onboarding.test.js`

```js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '@/screens/OnboardingScreen';
import { SettingsProvider } from '@/context/SettingsContext';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, replace: mockNavigate }),
}));

describe('OnboardingScreen', () => {
  beforeEach(() => { AsyncStorage.clear(); mockNavigate.mockClear(); });

  it('disables "Let\'s Go" button when name is empty', () => {
    const { getByTestId } = render(<SettingsProvider><OnboardingScreen /></SettingsProvider>);
    expect(getByTestId('onboarding-submit-btn').props.accessibilityState?.disabled).toBe(true);
  });

  it('enables submit after name entered', () => {
    const { getByTestId } = render(<SettingsProvider><OnboardingScreen /></SettingsProvider>);
    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Josh');
    expect(getByTestId('onboarding-submit-btn').props.accessibilityState?.disabled).toBeFalsy();
  });

  it('saves profile to expiresnap_settings and navigates to Home on submit', async () => {
    const { getByTestId } = render(<SettingsProvider><OnboardingScreen /></SettingsProvider>);
    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Josh');
    fireEvent.press(getByTestId('onboarding-submit-btn'));
    await waitFor(async () => {
      const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_settings'));
      expect(stored.profile.name).toBe('Josh');
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });
});
```

---

### StatCard — `__tests__/components/StatCard.test.js`

```js
import React from 'react';
import { render } from '@testing-library/react-native';
import StatCard from '@/components/StatCard';

describe('StatCard', () => {
  it('renders label and count', () => {
    const { getByText } = render(<StatCard label="Expired" count={3} variant="danger" />);
    expect(getByText('Expired')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it.each(['danger', 'warning', 'safe'])('renders variant %s', (variant) => {
    const { getByTestId } = render(<StatCard testID="card" label="X" count={0} variant={variant} />);
    expect(getByTestId('card')).toBeTruthy();
  });
});
```

---

### Dashboard stats computation — `__tests__/screens/Dashboard.test.js`

```js
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardScreen from '@/screens/DashboardScreen';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const today = new Date();
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

const items = [
  { id: '1', name: 'Milk', status: 'active', estimated_expiry_date: daysFromNow(-1) },  // expired
  { id: '2', name: 'Yogurt', status: 'active', estimated_expiry_date: daysFromNow(2) }, // expiring soon
  { id: '3', name: 'Rice', status: 'active', estimated_expiry_date: daysFromNow(60) },  // safe
];

describe('Dashboard stats', () => {
  it('shows correct Expired / Expiring Soon / Safe counts', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId } = render(
      <SettingsProvider><InventoryProvider><DashboardScreen /></InventoryProvider></SettingsProvider>
    );
    await waitFor(() => {
      expect(Number(getByTestId('stat-expired').props.children)).toBe(1);
      expect(Number(getByTestId('stat-expiring').props.children)).toBe(1);
      expect(Number(getByTestId('stat-safe').props.children)).toBe(1);
    });
  });
});
```

---

### InventoryItem — `__tests__/components/InventoryItem.test.js`

```js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InventoryItem from '@/components/InventoryItem';

const today = new Date();
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

describe('InventoryItem', () => {
  it('renders name and category badge', () => {
    const { getByText } = render(
      <InventoryItem name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} />
    );
    expect(getByText('Milk')).toBeTruthy();
    expect(getByText('Dairy')).toBeTruthy();
  });

  it('renders days remaining countdown', () => {
    const { getByTestId } = render(
      <InventoryItem name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} />
    );
    expect(getByTestId('item-countdown')).toHaveTextContent('5');
  });

  it('shows danger color when expired', () => {
    const { getByTestId } = render(
      <InventoryItem name="Meat" category="Meat & Fish" estimated_expiry_date={daysFromNow(-1)} />
    );
    expect(getByTestId('item-progress').props.color).toBe('danger');
  });

  it('shows warning color when expiring within 3 days', () => {
    const { getByTestId } = render(
      <InventoryItem name="Meat" category="Meat & Fish" estimated_expiry_date={daysFromNow(2)} />
    );
    expect(getByTestId('item-progress').props.color).toBe('warning');
  });

  it('shows safe color when more than 3 days remaining', () => {
    const { getByTestId } = render(
      <InventoryItem name="Rice" category="Pantry" estimated_expiry_date={daysFromNow(60)} />
    );
    expect(getByTestId('item-progress').props.color).toBe('safe');
  });

  it('renders consume and waste action buttons', () => {
    const { getByTestId } = render(
      <InventoryItem id="1" name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} onConsume={() => {}} onWaste={() => {}} />
    );
    expect(getByTestId('item-consume-btn-1')).toBeTruthy();
    expect(getByTestId('item-waste-btn-1')).toBeTruthy();
  });

  it('fires onConsume with item id when consume button pressed', () => {
    const onConsume = jest.fn();
    const { getByTestId } = render(
      <InventoryItem id="1" name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} onConsume={onConsume} onWaste={() => {}} />
    );
    fireEvent.press(getByTestId('item-consume-btn-1'));
    expect(onConsume).toHaveBeenCalledWith('1');
  });

  it('fires onWaste with item id when waste button pressed', () => {
    const onWaste = jest.fn();
    const { getByTestId } = render(
      <InventoryItem id="1" name="Milk" category="Dairy" estimated_expiry_date={daysFromNow(5)} onConsume={() => {}} onWaste={onWaste} />
    );
    fireEvent.press(getByTestId('item-waste-btn-1'));
    expect(onWaste).toHaveBeenCalledWith('1');
  });
});
```

---

### Profile screen — `__tests__/screens/ProfileScreen.test.js`

```js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileScreen from '@/screens/ProfileScreen';
import { SettingsProvider } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

describe('ProfileScreen', () => {
  beforeEach(() => { AsyncStorage.clear(); mockNavigate.mockClear(); });

  it('renders user name from settings', async () => {
    await AsyncStorage.setItem('expiresnap_settings', JSON.stringify({
      profile: { name: 'Josh', avatarEmoji: '🍕' }
    }));
    const { getByText } = render(<Wrapper><ProfileScreen /></Wrapper>);
    await waitFor(() => expect(getByText('Josh')).toBeTruthy());
  });

  it('renders Export Data and Import Data buttons', () => {
    const { getByTestId } = render(<Wrapper><ProfileScreen /></Wrapper>);
    expect(getByTestId('profile-export-btn')).toBeTruthy();
    expect(getByTestId('profile-import-btn')).toBeTruthy();
  });

  it('renders History link button', () => {
    const { getByTestId } = render(<Wrapper><ProfileScreen /></Wrapper>);
    expect(getByTestId('profile-history-btn')).toBeTruthy();
  });

  it('navigates to History on history link press', () => {
    const { getByTestId } = render(<Wrapper><ProfileScreen /></Wrapper>);
    fireEvent.press(getByTestId('profile-history-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('History');
  });
});
```

---

### InventoryList — `__tests__/components/InventoryList.test.js`

```js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InventoryList from '@/components/InventoryList';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';

const today = new Date();
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

const makeItem = (id, name, category, status = 'active') => ({
  id, name, category, status,
  estimated_expiry_date: daysFromNow(5),
  confidence_days: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const items = [
  makeItem('1', 'Milk', 'Dairy'),
  makeItem('2', 'Chicken', 'Meat & Fish'),
  makeItem('3', 'Consumed Item', 'Dairy', 'consumed'),
];

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

describe('InventoryList', () => {
  beforeEach(() => AsyncStorage.clear());

  it('renders only active items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByText, queryByText } = render(<Wrapper><InventoryList /></Wrapper>);
    await waitFor(() => {
      expect(getByText('Milk')).toBeTruthy();
      expect(queryByText('Consumed Item')).toBeNull();
    });
  });

  it('renders search input', async () => {
    const { getByTestId } = render(<Wrapper><InventoryList /></Wrapper>);
    await waitFor(() => expect(getByTestId('inventory-search')).toBeTruthy());
  });

  it('filters items by search text', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId, queryByText, getByText } = render(<Wrapper><InventoryList /></Wrapper>);
    await waitFor(() => expect(getByText('Milk')).toBeTruthy());
    fireEvent.changeText(getByTestId('inventory-search'), 'Chicken');
    await waitFor(() => expect(queryByText('Milk')).toBeNull());
  });

  it('filters items by category tab', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId, queryByText, getByText } = render(<Wrapper><InventoryList /></Wrapper>);
    await waitFor(() => expect(getByText('Milk')).toBeTruthy());
    fireEvent.press(getByTestId('filter-tab-Meat & Fish'));
    await waitFor(() => expect(queryByText('Milk')).toBeNull());
  });
});
```

---

### FridgeScreen — `__tests__/screens/FridgeScreen.test.js`

```js
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FridgeScreen from '@/screens/FridgeScreen';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

const today = new Date();
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];

const items = [
  { id: '1', name: 'Milk', category: 'Dairy', status: 'active', estimated_expiry_date: daysFromNow(5), confidence_days: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Consumed', category: 'Dairy', status: 'consumed', estimated_expiry_date: daysFromNow(5), confidence_days: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

describe('FridgeScreen', () => {
  beforeEach(() => AsyncStorage.clear());

  it('renders with testID screen-fridge', async () => {
    const { getByTestId } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByTestId('screen-fridge')).toBeTruthy());
  });

  it('renders active inventory items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByText } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByText('Milk')).toBeTruthy());
  });

  it('does not render consumed items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { queryByText } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(queryByText('Consumed')).toBeNull());
  });

  it('renders FloatingActionButton with testID fridge-fab', async () => {
    const { getByTestId } = render(<Wrapper><FridgeScreen /></Wrapper>);
    await waitFor(() => expect(getByTestId('fridge-fab')).toBeTruthy());
  });
});
```

---

### History screen — `__tests__/screens/HistoryScreen.test.js`

```js
import React from 'react';
import { render, waitFor, within } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HistoryScreen from '@/screens/HistoryScreen';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

const items = [
  { id: '1', name: 'Old Milk', category: 'Dairy', status: 'consumed', estimated_expiry_date: '2026-05-01', confidence_days: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Spoiled Meat', category: 'Meat & Fish', status: 'wasted', estimated_expiry_date: '2026-05-15', confidence_days: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Active Rice', category: 'Pantry', status: 'active', estimated_expiry_date: '2026-12-01', confidence_days: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

describe('HistoryScreen', () => {
  beforeEach(() => AsyncStorage.clear());

  it('renders consumed and wasted items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByText } = render(<Wrapper><HistoryScreen /></Wrapper>);
    await waitFor(() => {
      expect(getByText('Old Milk')).toBeTruthy();
      expect(getByText('Spoiled Meat')).toBeTruthy();
    });
  });

  it('does not render active items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { queryByText } = render(<Wrapper><HistoryScreen /></Wrapper>);
    await waitFor(() => expect(queryByText('Active Rice')).toBeNull());
  });

  it('renders consumed badge on consumed items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId } = render(<Wrapper><HistoryScreen /></Wrapper>);
    await waitFor(() =>
      expect(within(getByTestId('history-badge-1')).getByText(/consumed/i)).toBeTruthy()
    );
  });

  it('renders wasted badge on wasted items', async () => {
    await AsyncStorage.setItem('expiresnap_inventory', JSON.stringify(items));
    const { getByTestId } = render(<Wrapper><HistoryScreen /></Wrapper>);
    await waitFor(() =>
      expect(within(getByTestId('history-badge-2')).getByText(/wasted/i)).toBeTruthy()
    );
  });
});
```

---

## Phase 3: Camera & Mock API Setup

### Image compression — `__tests__/utils/compressImage.test.js`

```js
import { compressImage } from '@/utils/compressImage';
import * as ImageManipulator from 'expo-image-manipulator';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));

const mockManipulateResult = { uri: 'file://compressed.jpg', base64: 'base64string==' };

describe('compressImage', () => {
  beforeEach(() => {
    ImageManipulator.manipulateAsync.mockResolvedValue(mockManipulateResult);
  });

  it('calls manipulateAsync with resize to max 1200px width', async () => {
    await compressImage('file://original.jpg');
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file://original.jpg',
      expect.arrayContaining([
        expect.objectContaining({ resize: expect.objectContaining({ width: 1200 }) }),
      ]),
      expect.any(Object)
    );
  });

  it('calls manipulateAsync with JPEG format and quality 0.8', async () => {
    await compressImage('file://original.jpg');
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({ compress: 0.8, format: 'jpeg', base64: true })
    );
  });

  it('returns compressed uri and base64', async () => {
    const result = await compressImage('file://original.jpg');
    expect(result.uri).toBe('file://compressed.jpg');
    expect(result.base64).toBe('base64string==');
  });

  it('throws if manipulateAsync fails', async () => {
    ImageManipulator.manipulateAsync.mockRejectedValueOnce(new Error('disk full'));
    await expect(compressImage('file://original.jpg')).rejects.toThrow('disk full');
  });
});
```

---

### Scan flow wires compression before AI — `__tests__/screens/ScanScreen.test.js`

```js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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

describe('ScanScreen compression wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://raw-photo.jpg', mimeType: 'image/jpeg', fileSize: 8 * 1024 * 1024 }],
    });
    compressImageModule.compressImage.mockResolvedValue({ uri: 'file://compressed.jpg', base64: 'b64==' });
    mockScanModule.mockScanReceipt.mockResolvedValue({ transaction_date: '2026-06-03', items: [] });
  });

  it('compresses image before passing to scan utility', async () => {
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(compressImageModule.compressImage).toHaveBeenCalledWith('file://raw-photo.jpg');
      expect(mockScanModule.mockScanReceipt).toHaveBeenCalledWith('b64==');
    });
  });

  it('never passes uncompressed base64 to scan utility', async () => {
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      const calls = mockScanModule.mockScanReceipt.mock.calls;
      const callArg = calls[calls.length - 1][0];
      expect(callArg).toBe('b64==');
      expect(callArg).not.toContain('raw');
    });
  });
});
```

---

### Scan button lock (prevent multi-tap) — `__tests__/screens/ScanScreen.lock.test.js`

```js
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
```

---

### File validation — `__tests__/utils/validateImage.test.js`

```js
import { validateImage } from '@/utils/validateImage';

describe('validateImage', () => {
  it('accepts jpeg image under 10MB', () => {
    expect(() => validateImage({ mimeType: 'image/jpeg', fileSize: 5 * 1024 * 1024 })).not.toThrow();
  });

  it('accepts png image under 10MB', () => {
    expect(() => validateImage({ mimeType: 'image/png', fileSize: 1024 })).not.toThrow();
  });

  it('rejects non-image mime type', () => {
    expect(() => validateImage({ mimeType: 'application/pdf', fileSize: 100 })).toThrow(/image/i);
  });

  it('rejects file over 10MB', () => {
    expect(() => validateImage({ mimeType: 'image/jpeg', fileSize: 11 * 1024 * 1024 })).toThrow(/10/);
  });
});
```

---

### Mock scan utility — `__tests__/utils/mockScanReceipt.test.js`

```js
import { mockScanReceipt } from '@/utils/mockScanReceipt';

describe('mockScanReceipt', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('resolves after 2 seconds', async () => {
    const promise = mockScanReceipt('base64data');
    jest.advanceTimersByTime(2000);
    const result = await promise;
    expect(result).toBeDefined();
  });

  it('returns transaction_date and items array', async () => {
    const promise = mockScanReceipt('base64data');
    jest.advanceTimersByTime(2000);
    const result = await promise;
    expect(result.transaction_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('each item has required schema fields', async () => {
    const promise = mockScanReceipt('base64data');
    jest.advanceTimersByTime(2000);
    const { items } = await promise;
    items.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('estimated_expiry_date');
      expect(item).toHaveProperty('confidence_days');
      expect(typeof item.confidence_days).toBe('number');
    });
  });
});
```

---

## Phase 4: Review Screen (Validation UI)

### ReviewItem — `__tests__/components/ReviewItem.test.js`

```js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReviewItem from '@/components/ReviewItem';

const baseItem = {
  id: 'uuid-001',
  name: 'Fresh Milk',
  estimated_expiry_date: '2026-06-15',
  confidence_days: 2,
};

describe('ReviewItem', () => {
  it('renders item name in editable field', () => {
    const { getByDisplayValue } = render(
      <ReviewItem item={baseItem} onChange={() => {}} onDelete={() => {}} />
    );
    expect(getByDisplayValue('Fresh Milk')).toBeTruthy();
  });

  it('renders confidence_days as ± N days label', () => {
    const { getByText } = render(
      <ReviewItem item={baseItem} onChange={() => {}} onDelete={() => {}} />
    );
    expect(getByText('± 2 days')).toBeTruthy();
  });

  it('calls onChange when name edited', () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = render(
      <ReviewItem item={baseItem} onChange={onChange} onDelete={() => {}} />
    );
    fireEvent.changeText(getByDisplayValue('Fresh Milk'), 'Whole Milk');
    expect(onChange).toHaveBeenCalledWith('uuid-001', { name: 'Whole Milk' });
  });

  it('calls onDelete when delete pressed', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <ReviewItem item={baseItem} onChange={() => {}} onDelete={onDelete} />
    );
    fireEvent.press(getByTestId('review-item-delete-uuid-001'));
    expect(onDelete).toHaveBeenCalledWith('uuid-001');
  });
});
```

---

### Review screen validation — `__tests__/screens/ReviewScreen.test.js`

```js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ReviewScreen from '@/screens/ReviewScreen';
import { InventoryProvider } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({
    params: {
      scanResult: {
        transaction_date: '2026-06-03',
        items: [
          { id: 'a', name: 'Milk', category: 'Dairy', estimated_expiry_date: '2026-06-10', confidence_days: 1 },
          { id: 'b', name: 'Meat', category: 'Meat & Fish', estimated_expiry_date: '2026-06-06', confidence_days: 1 },
        ],
      },
    },
  }),
}));

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

describe('ReviewScreen validation', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('blocks confirm when an item name is empty', () => {
    const { getAllByTestId, getByTestId } = render(<Wrapper><ReviewScreen /></Wrapper>);
    fireEvent.changeText(getAllByTestId(/review-item-name/)[0], '');
    fireEvent.press(getByTestId('review-confirm-btn'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('blocks confirm when an expiry date is in the past', () => {
    const { getAllByTestId, getByTestId } = render(<Wrapper><ReviewScreen /></Wrapper>);
    const pastDate = new Date('2020-01-01');
    fireEvent(getAllByTestId(/review-item-date/)[0], 'onChange', { nativeEvent: { timestamp: pastDate.getTime() } }, pastDate);
    fireEvent.press(getByTestId('review-confirm-btn'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('dispatches items to InventoryContext and navigates to Fridge on valid confirm', async () => {
    const { getByTestId } = render(<Wrapper><ReviewScreen /></Wrapper>);
    fireEvent.press(getByTestId('review-confirm-btn'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('Fridge'));
  });
});
```

---

## Phase 5: Real API Integration, Notifications & Polish

### `utils/scanReceipt` service — `__tests__/utils/scanReceipt.test.js`

```js
import { scanReceipt } from '@/utils/scanReceipt';

global.fetch = jest.fn();

const mockValidResponse = {
  transaction_date: '2026-06-03',
  items: [{ id: 'uuid-001', name: 'Milk', category: 'Dairy', estimated_expiry_date: '2026-06-09', confidence_days: 1 }],
};

describe('scanReceipt', () => {
  beforeEach(() => fetch.mockClear());

  it('calls correct OpenAI endpoint for openai provider', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(mockValidResponse) } }] }) });
    await scanReceipt('base64img', 'openai', 'sk-test');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('openai.com'), expect.any(Object));
  });

  it('calls correct Gemini endpoint for gemini provider', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(mockValidResponse) }] } }] }) });
    await scanReceipt('base64img', 'gemini', 'key-test');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('googleapis.com'), expect.any(Object));
  });

  it('calls correct Anthropic endpoint for anthropic provider', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ content: [{ text: JSON.stringify(mockValidResponse) }] }) });
    await scanReceipt('base64img', 'anthropic', 'sk-ant-test');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('anthropic.com'), expect.any(Object));
  });

  it('throws on unknown provider', async () => {
    await expect(scanReceipt('base64img', 'unknown', 'key')).rejects.toThrow(/provider/i);
  });

  it('throws descriptive error on malformed AI response (missing items)', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ transaction_date: '2026-06-03' }) } }] }) });
    await expect(scanReceipt('base64img', 'openai', 'sk-test')).rejects.toThrow(/invalid/i);
  });

  it('throws on HTTP error response', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) });
    await expect(scanReceipt('base64img', 'openai', 'sk-test')).rejects.toThrow(/401/);
  });

  it('throws RateLimitError on HTTP 429', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ error: 'Too Many Requests' }) });
    let err;
    try { await scanReceipt('base64img', 'openai', 'sk-test'); } catch (e) { err = e; }
    expect(err).toBeDefined();
    expect(err.name).toBe('RateLimitError');
  });
});
```

---

### 429 UI handling — `__tests__/screens/ScanScreen.ratelimit.test.js`

```js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import * as compressImageModule from '@/utils/compressImage';
import * as scanReceiptModule from '@/utils/scanReceipt';
import ScanScreen from '@/screens/ScanScreen';
import { SettingsProvider } from '@/context/SettingsContext';
import { InventoryProvider } from '@/context/InventoryContext';

jest.mock('@/utils/compressImage');
jest.mock('@/utils/scanReceipt');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

class RateLimitError extends Error {
  constructor() { super('Too Many Requests'); this.name = 'RateLimitError'; }
}

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

describe('ScanScreen 429 rate limit handling', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    ImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://raw.jpg', mimeType: 'image/jpeg', fileSize: 1024 }],
    });
    compressImageModule.compressImage.mockResolvedValue({ uri: 'file://c.jpg', base64: 'b64==' });
  });

  it('shows rate limit snackbar message on RateLimitError', async () => {
    scanReceiptModule.scanReceipt.mockRejectedValueOnce(new RateLimitError());
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(getByTestId('snackbar-message').props.children).toMatch(/troppe richieste|too many requests/i);
    });
  });

  it('re-enables scan buttons after rate limit error', async () => {
    scanReceiptModule.scanReceipt.mockRejectedValueOnce(new RateLimitError());
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(getByTestId('scan-camera-btn').props.accessibilityState?.disabled).toBeFalsy();
    });
  });

  it('does not navigate to Review screen on rate limit error', async () => {
    scanReceiptModule.scanReceipt.mockRejectedValueOnce(new RateLimitError());
    const { getByTestId } = render(<Wrapper><ScanScreen /></Wrapper>);
    fireEvent.press(getByTestId('scan-camera-btn'));
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith('Review');
    });
  });
});
```

---

### Notifications — `__tests__/notifications/scheduling.test.js`

```js
import * as Notifications from 'expo-notifications';
import { scheduleExpiryNotification, cancelExpiryNotification } from '@/utils/notifications';

describe('Notification scheduling', () => {
  beforeEach(() => jest.clearAllMocks());

  it('schedules notification 1 day before expiry date', async () => {
    const expiryDate = '2026-06-10';
    await scheduleExpiryNotification({ id: 'uuid-001', name: 'Milk', estimated_expiry_date: expiryDate });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const call = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(call.content.title).toMatch(/Milk/);
    // Compare date at ISO-string level to avoid timezone-dependent millisecond mismatches
    expect(call.trigger.date.toISOString().split('T')[0]).toBe('2026-06-09');
  });

  it('returns notification id from scheduleNotificationAsync', async () => {
    const id = await scheduleExpiryNotification({ id: 'uuid-001', name: 'Milk', estimated_expiry_date: '2026-06-10' });
    expect(id).toBe('notification-id-123');
  });

  it('calls cancelScheduledNotificationAsync with stored notification id', async () => {
    await cancelExpiryNotification('notification-id-123');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id-123');
  });
});
```

---

### InventoryContext notification integration (Phase 5) — `__tests__/context/InventoryContext.notifications.test.js`

```js
import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryProvider, useInventory } from '@/context/InventoryContext';
import { SettingsProvider } from '@/context/SettingsContext';
import * as notifications from '@/utils/notifications';

jest.mock('@/utils/notifications', () => ({
  scheduleExpiryNotification: jest.fn().mockResolvedValue('notif-id-1'),
  cancelExpiryNotification: jest.fn().mockResolvedValue(undefined),
}));

const mockItem = (overrides = {}) => ({
  id: 'uuid-001',
  name: 'Milk',
  category: 'Dairy',
  estimated_expiry_date: '2026-06-10',
  confidence_days: 1,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const Wrapper = ({ children }) => (
  <SettingsProvider><InventoryProvider>{children}</InventoryProvider></SettingsProvider>
);

const TestConsumer = ({ onRender }) => {
  const ctx = useInventory();
  onRender(ctx);
  return null;
};

describe('InventoryContext notification integration', () => {
  beforeEach(() => { AsyncStorage.clear(); jest.clearAllMocks(); });

  it('schedules notification when item is added', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem()); });
    await waitFor(() =>
      expect(notifications.scheduleExpiryNotification).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'uuid-001' })
      )
    );
  });

  it('cancels notification when item is deleted', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem({ notificationId: 'notif-id-1' })); });
    await act(async () => { ctx.deleteItem('uuid-001'); });
    await waitFor(() =>
      expect(notifications.cancelExpiryNotification).toHaveBeenCalledWith('notif-id-1')
    );
  });

  it('cancels notification when item is marked consumed', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem({ notificationId: 'notif-id-1' })); });
    await act(async () => { ctx.markConsumed('uuid-001'); });
    await waitFor(() =>
      expect(notifications.cancelExpiryNotification).toHaveBeenCalledWith('notif-id-1')
    );
  });

  it('cancels and reschedules notification when item is updated', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());
    await act(async () => { ctx.addItem(mockItem({ notificationId: 'notif-id-1' })); });
    await act(async () => { ctx.updateItem('uuid-001', { estimated_expiry_date: '2026-06-15' }); });
    await waitFor(() => {
      expect(notifications.cancelExpiryNotification).toHaveBeenCalledWith('notif-id-1');
      expect(notifications.scheduleExpiryNotification).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

### Settings screen — `__tests__/screens/SettingsScreen.test.js`

```js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsScreen from '@/screens/SettingsScreen';
import { SettingsProvider } from '@/context/SettingsContext';

describe('SettingsScreen', () => {
  beforeEach(() => AsyncStorage.clear());

  it('renders provider selector, API key input, auto-delete selector, language selector', () => {
    const { getByTestId } = render(<SettingsProvider><SettingsScreen /></SettingsProvider>);
    expect(getByTestId('settings-ai-provider')).toBeTruthy();
    expect(getByTestId('settings-api-key')).toBeTruthy();
    expect(getByTestId('settings-auto-delete')).toBeTruthy();
    expect(getByTestId('settings-language')).toBeTruthy();
  });

  it('API key input is masked (secureTextEntry)', () => {
    const { getByTestId } = render(<SettingsProvider><SettingsScreen /></SettingsProvider>);
    expect(getByTestId('settings-api-key').props.secureTextEntry).toBe(true);
  });

  it('persists API key change to expiresnap_settings immediately', async () => {
    const { getByTestId } = render(<SettingsProvider><SettingsScreen /></SettingsProvider>);
    fireEvent.changeText(getByTestId('settings-api-key'), 'sk-new-key');
    await waitFor(async () => {
      const stored = JSON.parse(await AsyncStorage.getItem('expiresnap_settings'));
      expect(stored.apiKey).toBe('sk-new-key');
    });
  });
});
```

---

## Running Tests

```bash
# All tests
npx jest

# Watch mode
npx jest --watch

# Single file
npx jest __tests__/context/InventoryContext.test.js

# Coverage report
npx jest --coverage
```

Phase complete when: `npx jest` exits 0 for all tests in that phase's files.
