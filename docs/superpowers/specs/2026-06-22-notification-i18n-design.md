# Notification i18n — Design Spec

**Date:** 2026-06-22
**Status:** Approved

## Problem

Scheduled expiry notifications use hardcoded English strings (`"Milk expiring soon"`, `"Milk expires tomorrow"`). Italian users (and any future locale) receive English-only notifications regardless of their app language setting.

## Goal

Notifications match the user's current app language at schedule time, and automatically re-fire in the new language when the user changes their language setting.

## Architecture

### 1. Translation keys

Add a `notifications` section to both locale files.

**`locales/en.json`**
```json
"notifications": {
  "expiringTitle": "{{name}} expiring soon",
  "expiringBody": "{{name}} expires tomorrow"
}
```

**`locales/it.json`**
```json
"notifications": {
  "expiringTitle": "{{name}} in scadenza",
  "expiringBody": "{{name}} scade domani"
}
```

### 2. `utils/notifications.js` — use i18n singleton

i18next is a plain JS singleton, safe to import outside React. At schedule time, `i18n.t()` returns the string in the currently active language.

```js
import i18n from '@/utils/i18n';

title: i18n.t('notifications.expiringTitle', { name: item.name }),
body:  i18n.t('notifications.expiringBody',  { name: item.name }),
```

Language is captured at schedule time — if the user later changes language, old notifications keep the old language until rescheduled (handled by Section 3).

### 3. `context/InventoryContext.js` — reschedule on language change

When the user changes app language, all active items' notifications are cancelled and rescheduled so they fire in the new language.

**Pattern:** `useRef` holds latest items to avoid stale closure; listener registered once on mount.

```js
const itemsRef = useRef(items);
useEffect(() => { itemsRef.current = items; }, [items]);

useEffect(() => {
  async function onLanguageChanged() {
    const active = itemsRef.current.filter(
      (i) => i.status === 'active' && i.notificationId
    );
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
```

## Files Changed

| File | Change |
|------|--------|
| `utils/notifications.js` | Import i18n; use `i18n.t()` for title/body |
| `locales/en.json` | Add `notifications` section |
| `locales/it.json` | Add `notifications` section |
| `context/InventoryContext.js` | Add `useRef` + language-change listener |
| `__tests__/notifications/scheduling.test.js` | Update + add Italian and reschedule tests |

## Testing

- Existing test (`toMatch(/Milk/)`) continues to pass — item name still present in title.
- New: mock `i18n.language = 'it'`, assert title/body in Italian.
- New: fire `i18n.emit('languageChanged', 'it')` with active items in state, assert cancel + reschedule called for each.

## Constraints

- No new files — all changes are additive to existing modules.
- Mock-first rule not applicable (no AI APIs involved).
- No UI changes required.
