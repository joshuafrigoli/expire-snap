# Notification i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate expiry notifications into the user's active app language, and reschedule all active notifications when the user changes language.

**Architecture:** `notifications.js` imports the i18next singleton directly (safe outside React — i18next is a plain JS object) and calls `i18n.t()` at schedule time. `InventoryContext` registers a `languageChanged` listener on mount using a `useRef` to avoid stale-closure issues; when triggered it cancels and reschedules every active item's notification.

**Tech Stack:** i18next (already configured), expo-notifications (already configured), React `useRef`/`useEffect`

## Global Constraints

- Import shared helpers from `@testHelpers` — never redefine `mockItem`, `Wrapper`, `daysFromNow`, `today` inline.
- `notifications.js` must not use React hooks — it is a plain async utility.
- Mock-first rule does not apply — no AI APIs involved.
- All tests must pass before marking a task complete.

---

### Task 1: Add locale keys and translate notification strings

**Files:**
- Modify: `locales/en.json`
- Modify: `locales/it.json`
- Modify: `utils/notifications.js`
- Modify: `__tests__/notifications/scheduling.test.js`

**Interfaces:**
- Produces: `i18n.t('notifications.expiringTitle', { name })` → `"<name> expiring soon"` (en) / `"<name> in scadenza"` (it)
- Produces: `i18n.t('notifications.expiringBody', { name })` → `"<name> expires tomorrow"` (en) / `"<name> scade domani"` (it)
- Consumed by: Task 2 (rescheduled notifications will use same keys)

- [ ] **Step 1: Write the failing test**

Add this test to `__tests__/notifications/scheduling.test.js`:

```js
import * as Notifications from 'expo-notifications';
import { scheduleExpiryNotification, cancelExpiryNotification } from '@/utils/notifications';
import i18n from '@/utils/i18n';

describe('Notification scheduling', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => i18n.changeLanguage('en'));

  it('schedules notification 1 day before expiry date', async () => {
    const expiryDate = '2026-06-10';
    await scheduleExpiryNotification({ id: 'uuid-001', name: 'Milk', estimated_expiry_date: expiryDate });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const call = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(call.content.title).toMatch(/Milk/);
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

  it('uses Italian strings when app language is Italian', async () => {
    await i18n.changeLanguage('it');
    await scheduleExpiryNotification({ id: 'uuid-002', name: 'Latte', estimated_expiry_date: '2026-06-10' });
    const call = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(call.content.title).toBe('Latte in scadenza');
    expect(call.content.body).toBe('Latte scade domani');
  });

  it('uses English strings when app language is English', async () => {
    await i18n.changeLanguage('en');
    await scheduleExpiryNotification({ id: 'uuid-003', name: 'Milk', estimated_expiry_date: '2026-06-10' });
    const call = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(call.content.title).toBe('Milk expiring soon');
    expect(call.content.body).toBe('Milk expires tomorrow');
  });
});
```

Note: `afterEach(() => i18n.changeLanguage('en'))` resets the singleton so language-switching tests don't bleed into each other.

- [ ] **Step 2: Run tests to verify the new ones fail**

```bash
npx jest __tests__/notifications/scheduling.test.js
```

Expected: existing 3 tests pass, new 2 tests fail — `'Milk expiring soon'` expected but received something like `'Milk expiring soon'` (for en) OR key fallback. The Italian test will definitely fail since current code hardcodes `' expiring soon'`.

- [ ] **Step 3: Add `notifications` section to `locales/en.json`**

Insert after the `"days"` block (before the closing `}`):

```json
  "notifications": {
    "expiringTitle": "{{name}} expiring soon",
    "expiringBody": "{{name}} expires tomorrow"
  }
```

Full `"days"` + `"notifications"` tail of `locales/en.json`:

```json
  "days": {
    "unit": "days",
    "expired": "Expired",
    "today": "Expires today",
    "tomorrow": "Expires tomorrow",
    "daysLeft": "{{n}} days left"
  },
  "notifications": {
    "expiringTitle": "{{name}} expiring soon",
    "expiringBody": "{{name}} expires tomorrow"
  }
}
```

- [ ] **Step 4: Add `notifications` section to `locales/it.json`**

Same position:

```json
  "days": {
    "unit": "giorni",
    "expired": "Scaduto",
    "today": "Scade oggi",
    "tomorrow": "Scade domani",
    "daysLeft": "{{n}} giorni rimanenti"
  },
  "notifications": {
    "expiringTitle": "{{name}} in scadenza",
    "expiringBody": "{{name}} scade domani"
  }
}
```

- [ ] **Step 5: Update `utils/notifications.js` to use `i18n.t()`**

Full file replacement:

```js
import * as Notifications from 'expo-notifications';
import i18n from '@/utils/i18n';

export async function scheduleExpiryNotification(item) {
  const expiryDate = new Date(item.estimated_expiry_date);
  const triggerDate = new Date(expiryDate);
  triggerDate.setDate(triggerDate.getDate() - 1);

  const result = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('notifications.expiringTitle', { name: item.name }),
      body: i18n.t('notifications.expiringBody', { name: item.name }),
    },
    trigger: { type: 'date', date: triggerDate },
  });

  return result;
}

export async function cancelExpiryNotification(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
```

- [ ] **Step 6: Run tests to verify all pass**

```bash
npx jest __tests__/notifications/scheduling.test.js
```

Expected: all 5 tests pass.

- [ ] **Step 7: Commit**

```bash
git add locales/en.json locales/it.json utils/notifications.js __tests__/notifications/scheduling.test.js
git commit -m "feat: translate expiry notifications using i18n language"
```

---

### Task 2: Reschedule existing notifications on language change

**Files:**
- Modify: `context/InventoryContext.js`
- Modify: `__tests__/context/InventoryContext.test.js`

**Interfaces:**
- Consumes: `scheduleExpiryNotification(item)` from `@/utils/notifications` (Task 1)
- Consumes: `cancelExpiryNotification(notificationId)` from `@/utils/notifications`
- Consumes: `i18n.on('languageChanged', handler)` / `i18n.off('languageChanged', handler)` from `@/utils/i18n`

- [ ] **Step 1: Write the failing test**

Add this test to `__tests__/context/InventoryContext.test.js`. Add the imports and test at the bottom of the existing file:

```js
// Add at top of file (after existing imports):
import * as Notifications from 'expo-notifications';
import i18n from '@/utils/i18n';

// Add inside the existing describe('InventoryContext', ...) block:

  it('reschedules all active notifications when language changes', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());

    await act(async () => {
      await ctx.addItem(mockItem({ id: 'item-reschedule', name: 'Cheese' }));
    });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    // addItem called scheduleNotificationAsync once; item now has notificationId 'notification-id-123'

    jest.clearAllMocks();

    await act(async () => {
      await i18n.changeLanguage('it');
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id-123');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);

    // cleanup
    await i18n.changeLanguage('en');
  });

  it('does not reschedule consumed/wasted items when language changes', async () => {
    let ctx;
    render(<Wrapper><TestConsumer onRender={c => { ctx = c; }} /></Wrapper>);
    await waitFor(() => expect(ctx).toBeDefined());

    await act(async () => {
      await ctx.addItem(mockItem({ id: 'item-consumed', name: 'OldMilk' }));
    });
    await waitFor(() => expect(ctx.items).toHaveLength(1));
    await act(async () => { await ctx.markConsumed('item-consumed'); });
    await waitFor(() => expect(ctx.items[0].status).toBe('consumed'));

    jest.clearAllMocks();

    await act(async () => {
      await i18n.changeLanguage('it');
    });

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();

    await i18n.changeLanguage('en');
  });
```

Also add `afterEach(() => i18n.changeLanguage('en'))` inside the existing `describe` block to prevent state bleed.

- [ ] **Step 2: Run tests to verify the new ones fail**

```bash
npx jest __tests__/context/InventoryContext.test.js
```

Expected: existing tests pass, new 2 tests fail — `cancelScheduledNotificationAsync` not called, `scheduleNotificationAsync` not called (since `InventoryContext` doesn't listen yet).

- [ ] **Step 3: Update `context/InventoryContext.js`**

Full file replacement:

```js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleExpiryNotification, cancelExpiryNotification } from '@/utils/notifications';
import i18n from '@/utils/i18n';

const STORAGE_KEY = 'expiresnap_inventory';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);

  useEffect(() => {
    async function load() {
      const [inventoryRaw, settingsRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem('expiresnap_settings'),
      ]);

      let loaded = inventoryRaw ? JSON.parse(inventoryRaw) : [];

      const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
      const autoDeleteDays = settings.autoDeleteDays ?? 30;

      if (autoDeleteDays !== 'never') {
        const cutoff = Date.now() - autoDeleteDays * 24 * 60 * 60 * 1000;
        loaded = loaded.filter((item) => {
          if (item.status === 'active') return true;
          return new Date(item.updatedAt).getTime() > cutoff;
        });
      }

      setItems(loaded);
    }
    load();
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    async function onLanguageChanged() {
      const active = itemsRef.current.filter(
        (i) => i.status === 'active' && i.notificationId
      );
      if (!active.length) return;
      const rescheduled = await Promise.all(
        active.map(async (item) => {
          await cancelExpiryNotification(item.notificationId);
          const notificationId = await scheduleExpiryNotification(item);
          return { ...item, notificationId };
        })
      );
      setItems((prev) => {
        const map = Object.fromEntries(rescheduled.map((r) => [r.id, r]));
        const next = prev.map((i) => map[i.id] ?? i);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
    i18n.on('languageChanged', onLanguageChanged);
    return () => i18n.off('languageChanged', onLanguageChanged);
  }, []);

  async function persist(next) {
    setItems(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function addItem(item) {
    const notificationId = await scheduleExpiryNotification(item);
    await persist([...items, { ...item, notificationId }]);
  }

  async function addItems(newItems) {
    const withNotifications = await Promise.all(
      newItems.map(async (item) => {
        const notificationId = await scheduleExpiryNotification(item);
        return { ...item, notificationId };
      })
    );
    await persist([...items, ...withNotifications]);
  }

  async function deleteItem(id) {
    const item = items.find((i) => i.id === id);
    if (item && item.notificationId) {
      await cancelExpiryNotification(item.notificationId);
    }
    await persist(items.filter((i) => i.id !== id));
  }

  async function updateItem(id, changes) {
    const existing = items.find((i) => i.id === id);
    if (existing && existing.notificationId) {
      await cancelExpiryNotification(existing.notificationId);
    }
    const merged = { ...existing, ...changes, updatedAt: new Date().toISOString() };
    const notificationId = await scheduleExpiryNotification(merged);
    await persist(
      items.map((i) => (i.id === id ? { ...merged, notificationId } : i))
    );
  }

  async function markConsumed(id) {
    const item = items.find((i) => i.id === id);
    if (item && item.notificationId) {
      await cancelExpiryNotification(item.notificationId);
    }
    await persist(
      items.map((i) => {
        if (i.id !== id) return i;
        const prev = new Date(i.updatedAt).getTime();
        const now = Math.max(Date.now(), prev + 1);
        return { ...i, status: 'consumed', updatedAt: new Date(now).toISOString() };
      })
    );
  }

  async function clearInventory() {
    const active = items.filter((i) => i.status === 'active');
    for (const item of active) {
      if (item.notificationId) await cancelExpiryNotification(item.notificationId);
    }
    await persist(items.filter((i) => i.status !== 'active'));
  }

  async function markWasted(id) {
    const item = items.find((i) => i.id === id);
    if (item && item.notificationId) {
      await cancelExpiryNotification(item.notificationId);
    }
    await persist(
      items.map((i) => {
        if (i.id !== id) return i;
        const prev = new Date(i.updatedAt).getTime();
        const now = Math.max(Date.now(), prev + 1);
        return { ...i, status: 'wasted', updatedAt: new Date(now).toISOString() };
      })
    );
  }

  return (
    <InventoryContext.Provider value={{ items, addItem, addItems, deleteItem, updateItem, markConsumed, markWasted, clearInventory }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside InventoryProvider');
  return ctx;
}
```

- [ ] **Step 4: Run all tests to verify pass**

```bash
npx jest __tests__/context/InventoryContext.test.js
```

Expected: all tests pass.

Run full suite to check for regressions:

```bash
npx jest
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add context/InventoryContext.js __tests__/context/InventoryContext.test.js
git commit -m "feat: reschedule notifications in new language when user changes app language"
```
