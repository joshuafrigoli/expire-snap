# Development Plan: ExpireSnap (Smart Receipt Scanner)

A React Native + Expo mobile application that allows users to photograph a grocery receipt, extract food items using AI, estimate their expiration dates, and receive push notifications to reduce food waste.

---

## 1. Architecture & Tech Stack

- **Framework:** React Native + Expo (SDK 54); `npx create-expo-app` scaffold.
- **Styling:** NativeWind v4 (Tailwind for React Native) with CSS custom properties mapped via `tailwind.config.js`. Design system: **Bubbly Neo-Brutalism** — hard 2D shadows, pill shapes, thick 2px borders, extreme roundedness. Font: **Poppins** exclusively (via `expo-font`, weights 500-700). Reference mockups: `to-be/<page>/code.html` (visual reference only — HTML structure does not transfer) + `to-be/<page>/DESIGN.md` (tokens & rules). Palette: original spec is Emerald Green — **override primary to Blue** (see Section 1a).
- **Hard Shadows:** `react-native-shadow-2` library — provides CSS-like offset box-shadow on both iOS and Android. Native `elevation`/`shadowOffset` alone cannot replicate hard 2D shadows.
- **State Management:** React Context API (inventory items, scan state, filters).
- **Navigation:** React Navigation v6 — `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/stack`.
- **AI Integration:** API calls to OpenAI (GPT-4o), Google Gemini Flash, or Anthropic Claude (`claude-sonnet-4-6`) using Structured Outputs (JSON). Image passed as base64.
- **Storage:** `@react-native-async-storage/async-storage` — replaces `localStorage`. Same key strategy.
- **Settings:** User preferences stored under `expiresnap_settings` AsyncStorage key.
- **Notifications:** `expo-notifications` — local scheduled notifications; no server required. OS handles background delivery.
- **Camera / Image Picker:** `expo-image-picker` — `launchCameraAsync` (camera) + `launchImageLibraryAsync` (gallery).
- **Image Compression (mandatory):** `expo-image-manipulator` — compress and resize every image before AI submission. Target: max 1200px wide (maintain aspect ratio), JPEG quality 80%. Reduces file size from ~5-10MB to ~150-200KB and token usage to ~200-300 tokens per scan. Applied to all 3 AI providers.
- **i18n:** `react-i18next` + `i18next` (works with React Native unchanged).
- **Distribution:** Expo Go for development; EAS Build for production APK/IPA.

---

## 1a. Design System & Palette Override

Source of truth for **visual design**: `to-be/<page>/code.html` + `to-be/<page>/DESIGN.md`. HTML structure is reference only — all components use React Native primitives (`View`, `Text`, `Pressable`, etc.).

### Palette Override — Blue Primary

The `to-be/` spec uses Emerald Green as primary. Replace all green-tinted tokens with blue equivalents:

| Token | Original (Green) | Override (Blue) |
|---|---|---|
| `--primary` | `#006c49` | `#005bc4` |
| `--primary-container` | `#10b981` | `#3b82f6` |
| `--inverse-primary` | `#4edea3` | `#93c5fd` |
| `--surface` | `#e7fff3` | `#eff6ff` |
| `--surface-container` | `#bbfbe1` | `#bfdbfe` |
| `--on-surface` | `#002117` | `#001a3d` |
| `--surface-tint` | `#006c49` | `#005bc4` |
| `--background` | `#e7fff3` | `#eff6ff` |

> Note: `--surface` and `--background` share the same value intentionally.

All other tokens (secondary Amber, tertiary Violet, error, typography, spacing, shadows) remain as specified in `to-be/DESIGN.md`.

### Key Design Rules (from DESIGN.md)

- **Shadows:** hard 2D via `react-native-shadow-2` — **2px offset (small/buttons)** / **4px offset (large cards)**, deep navy color, 0 blur.
- **Borders:** 2px solid, same color as shadow.
- **Radius:** `sm` 0.5rem / default 1rem / `md` 1.5rem / `lg` 2rem / `xl` 3rem / `full` 9999px — mapped in NativeWind config.
- **Spacing:** 8px base unit; screen padding 16px; gutter 24px.
- **Button press state:** `Pressable` with `onPressIn` shifting +4px X/Y (mechanical click feel).
- **Progress bars:** 16px+ height, hard-shadow track, vibrant fill.
- **Font:** Poppins only — loaded via `expo-font` / `useFonts`.

---

## 2. Application Flow & User Journey

0. **Onboarding / Profile Setup:** Shown on first launch only (no profile in AsyncStorage). User enters name and picks an avatar emoji. Saved to AsyncStorage; never shown again unless profile is reset.
1. **Dashboard / Home:** Main view showing quick stats (Expired, Expiring Soon, Safe items) with color-coded urgency (Red, Amber, Green) and a prominent "Scan Receipt" primary action button. Thresholds (active items only): **Expired** = expiry date < today; **Expiring Soon** = expiry date within 0–3 days inclusive (i.e., today and the next 3 days — days 0, 1, 2, 3 all count as expiring soon); **Safe** = expiry date > 3 days out.
2. **Upload & Processing State:** Camera capture or gallery picker interface. Displays skeleton loader or animated spinner while AI processes the receipt.
3. **Review & Validation Screen:** List of AI-extracted products with estimated expiration dates. User can edit names, adjust dates via native date picker, or delete rows before saving.
4. **Virtual Fridge (Inventory):** Active inventory tracker with search, category filters, and quick actions to mark items as "Consumed" or "Wasted".
5. **History:** Archive of consumed/wasted items with date and status badge. Accessible only from Profile page.
6. **Profile Page:** Displays user name + avatar (editable). App stats (total scanned, saved from waste). Export Data + Import Data. Link to History.
7. **Settings Screen:** AI provider selector, API key input, auto-delete period, language selector.

### Navigation Structure

- **TopAppBar:** page title (left) + optional back button (left) + profile avatar button (right, navigates to Profile). No hamburger.
- **BottomNav:** `@react-navigation/bottom-tabs` — Home / Scan / Fridge / Settings.
- **History:** accessible only from Profile page — not in BottomNav.

---

## 3. Technical Specifications & AI JSON Schema

Image sent as base64 string along with current date (injected at runtime). AI must respond with structured JSON:

```json
{
  "transaction_date": "YYYY-MM-DD",
  "items": [
    {
      "id": "uuid-v4",
      "name": "Clean Product Name (e.g., Fresh Whole Milk)",
      "category": "Dairy | Meat & Fish | Fruits & Veggies | Frozen | Pantry",
      "estimated_expiry_date": "YYYY-MM-DD",
      "confidence_days": 2
    }
  ]
}
```

> `confidence_days` = AI's uncertainty margin in days. Displayed as "± N days" on Review screen.

### AI Estimation Logic Guidelines (Prompt Rules):

- Fresh Milk: +6 days
- Yogurt: +20 days
- Fresh Meat: +3 days
- Fresh Fish: +2 days
- Cold cuts / Hard cheese: +15 days
- Pantry goods (pasta, rice, canned food): +180 days or more.

---

## 4. Implementation Roadmap (Tasks for Claude Code)

### Phase 0: Project Setup & State Architecture

- [x] Scaffold with `npx create-expo-app expire-snap --template blank`.
- [x] Install and configure NativeWind v4 (babel plugin + `tailwind.config.js` + `global.css`).
- [x] Define design tokens in `tailwind.config.js` `theme.extend` using Blue palette from Section 1a plus secondary/tertiary/error from `to-be/DESIGN.md`. Includes colors, radius, spacing, font sizes.
- [x] Install and configure `expo-font`; load Poppins (500, 600, 700) in `_layout.tsx` or `App.js`.
- [x] Install `react-native-shadow-2` for hard offset shadows.
- [x] Install `react-native-reanimated` (Expo SDK 51 compatible) — provides `withTiming`, `withSpring`, `FadeIn`, `FadeOut`, `SlideInDown`, `SlideInUp`, `SlideOutDown`, `FadeInRight`, `FadeOutLeft` for all component-level transitions. Add `'react-native-reanimated/babel-plugin'` as the **last** entry in `babel.config.js` plugins array.
- [x] Set path aliases (`@/components`, `@/context`, etc.) in `babel.config.js` + `tsconfig.json`.
- [x] Create folder structure: `components/`, `context/`, `hooks/`, `utils/`, `locales/`, `screens/`, `navigation/`, `__tests__/helpers/`.
- [x] Create `jest.setup.js` at project root — paste all global mocks from `TESTS.md` "Test Stack" section (AsyncStorage, expo-notifications, expo-image-picker, expo-sharing, react-i18next, react-native-reanimated, datetimepicker, expo-file-system, react-native-screens, gesture-handler, expo-linear-gradient, expo-document-picker). Add `"./jest.setup.js"` to `setupFilesAfterFramework` in jest config.
- [x] Create `__tests__/helpers/index.js` — shared test utilities: `today`, `daysFromNow(n)`, `mockItem(overrides)`, `Wrapper` (SettingsProvider + InventoryProvider). Add `"^@testHelpers$": "<rootDir>/__tests__/helpers/index.js"` to `moduleNameMapper` in `package.json` jest config alongside the existing `@/` alias. All test files import from here — never redefine inline.
- [x] Install and configure `react-i18next` + `i18next`.
- [x] Create baseline English translation file (`locales/en.json`) with all UI strings.
- [x] Install `@react-native-async-storage/async-storage`.
- [x] Install `expo-sharing` (used by `exportData()` in `utils/dataTransfer.js`).
- [x] Install `expo-document-picker` (used by Onboarding import in Phase 2 and Profile import in Phase 5).
- [x] Define item data schema (JSDoc shape or TypeScript interface).
- [x] Create `utils/dataTransfer.js` — `exportData()` serializes full app state to JSON and triggers share sheet (`expo-sharing`). `importData(jsonString)` receives a raw JSON string (caller handles file reading), validates schema (`inventory` and `settings` fields required), merges into AsyncStorage. Throws on invalid JSON or missing fields.
- [x] Define settings schema: `{ aiProvider, apiKey, autoDeleteDays: 7|14|30|60|never, language, profile: { name, avatarEmoji } }`.
- [x] Create `SettingsContext` with get/set operations; persist to `expiresnap_settings` AsyncStorage key.
- [x] Create `InventoryContext` with CRUD operations (add, update, delete, markConsumed, markWasted). `updateItem` must refresh `updatedAt` to the current timestamp so auto-delete logic stays accurate.
- [x] Add AsyncStorage sync to `InventoryContext` (load on init, persist on change).
- [x] Add auto-delete logic to `InventoryContext`: on app load, purge consumed/wasted items where `updatedAt` is older than `autoDeleteDays` (skip if `never`).

### Phase 1: Base UI Component Kit

Build all reusable primitives **before any screen**. Every screen imports from here. Use `to-be/*/code.html` as visual reference only — implement with React Native primitives.

- [x] Create `components/ui/Button.jsx` — variants: primary, secondary, ghost; sizes: sm, md, lg; pill shape (`borderRadius: 9999`), 2px border, hard shadow via `react-native-shadow-2`, press-shift via `Pressable` `onPressIn`/`onPressOut`; `useAnimatedStyle` + `withSpring({ damping: 10, stiffness: 200 })` scale to 0.96 on press for tactile spring-back.
- [x] Create `components/ui/Card.jsx` — white background, `borderRadius: 16`, hard 4px shadow, 2px border.
- [x] Create `components/ui/Badge.jsx` — pill shape, color variants: danger, warning, safe, neutral.
- [x] Create `components/ui/ProgressBar.jsx` — 16px height, hard-shadow track `View`, vibrant fill `Animated.View`; fill width animates via `withTiming(400, { easing: Easing.out(Easing.quad) })` on every value change; color driven by prop.
- [x] Create `components/ui/Input.jsx` — variants: text, date, password; `TextInput` base; thick 2px border, focus swaps border to primary + hard shadow.
- [x] Create `components/ui/Select.jsx` — custom modal-based selector (avoid native `Picker` — inconsistent cross-platform); same border/radius/shadow as Input.
- [x] Create `components/ui/DatePicker.jsx` — wraps `@react-native-community/datetimepicker`; modal presentation on iOS, inline on Android.
- [x] Create `components/ui/TopAppBar.jsx` — `View` row: page title (left) + optional back `Pressable` (left) + profile Avatar `Pressable` (right). No hamburger.
- [x] Create `components/ui/BottomNav.jsx` — custom tab bar component for React Navigation `tabBar` prop; icon + label; active tab uses primary color. Tabs: Home / Scan / Fridge / Settings.
- [x] Create `components/ui/FloatingActionButton.jsx` — circular `Pressable`, primary color, hard 8px shadow, used on Fridge screen.
- [x] Create `components/ui/FilterTabs.jsx` — horizontal `ScrollView` with pill tab `Pressable` items for category filtering; active pill indicator slides between tabs via `useSharedValue` + `withSpring` on `translateX`; inactive labels fade via `withTiming` on opacity.
- [x] Create `components/ui/Spinner.jsx` — `ActivityIndicator` wrapped with branded styling.
- [x] Create `components/ui/Modal.jsx` — RN `Modal` component + centered `Card`; backdrop `Animated.View` with `entering={FadeIn.duration(200)}` / `exiting={FadeOut.duration(150)}`; card `Animated.View` with `entering={SlideInUp.springify().damping(18)}` / `exiting={SlideOutDown.duration(200)}`; used for scan processing state.
- [x] Install `expo-linear-gradient` (used by `SkeletonBlock` shimmer animation).
- [x] Create `components/ui/SkeletonBlock.jsx` — animated `View` placeholder using `Animated` API or `expo-linear-gradient`.
- [x] Create `components/ui/Avatar.jsx` — displays emoji or initials in circular `View`; size variants sm/md/lg.
- [x] Create `components/ui/Snackbar.jsx` — bottom toast conditionally rendered `Animated.View`; variants: info, success, error; auto-dismiss after 3s; pill shape + hard shadow; positioned with absolute layout; `entering={SlideInDown.springify().damping(14)}` on mount, `exiting={FadeOut.duration(200)}` on dismiss. Must use conditional render (`{visible && ...}`) — not opacity-based — so RNTL `queryByText` returns null when not visible.
- [x] Create `components/ui/index.js` — barrel export for all primitives.
- [x] Visually verify all components in Expo Go before proceeding to Phase 2.

### Phase 2: Screen Development

- [x] Set up React Navigation: `NavigationContainer` + `BottomTabNavigator` (Home / Scan / Fridge / Settings) + `StackNavigator` for Profile, Onboarding, Review, History (nested above tabs). Stack screens use default slide-from-right transition; tab switches use a `tabBarStyle` fade crossfade (configure via `screenOptions: { animation: 'fade' }` on the tab navigator).
- [x] Add navigation guard: if `expiresnap_settings.profile.name` missing in AsyncStorage → redirect to Onboarding before any other screen.
- [x] Build `Onboarding` screen — `TextInput` for name + emoji grid picker; "Let's Go" button saves profile to `SettingsContext` and navigates to Home. Include "Import Backup" option — uses `expo-document-picker` to select a JSON file, reads content as string, calls `importData(jsonString)`; skips onboarding and navigates to Home if import succeeds.
- [x] Build `Profile` screen — show avatar + name (editable inline); app stats (total scanned, saved from waste); Export Data button; Import Data button; link to History screen.
- [x] Wrap all UI strings with `t()` from `react-i18next`.
- [x] Create `Layout` wrapper (`SafeAreaView` + screen padding + `TopAppBar` slot).
- [x] Create `StatCard` component (label, count, color variant: red/amber/green); count animates from 0 to actual value on mount using `withTiming(600, { easing: Easing.out(Easing.cubic) })` on a `useSharedValue`.
- [x] Build `DashboardScreen` (`screens/DashboardScreen.jsx`) — `SafeAreaView` with `testID="screen-home"`; renders three `StatCard` components (Expired / Expiring Soon / Safe) with `testID="stat-expired"`, `testID="stat-expiring"`, `testID="stat-safe"` on the count `Text` elements; prominent "Scan Receipt" button that navigates to Scan tab.
- [x] Compute Expired / Expiring Soon / Safe counts from context; wire to Dashboard.
- [x] Create `InventoryItem` card component (name, category badge, countdown days).
- [x] Add freshness `ProgressBar` to `InventoryItem` (green → amber → red based on days remaining).
- [x] Create `InventoryList` with `TextInput` search and `FilterTabs` category filter; use `FlatList`; wrap each row in `Animated.View` with `entering={FadeInRight.duration(250)}` and `exiting={FadeOutLeft.duration(200)}` so items animate in/out on add, delete, and filter changes.
- [x] Build `FridgeScreen` — `SafeAreaView` wrapper with `testID="screen-fridge"`, renders `InventoryList`, and a `FloatingActionButton` with `testID="fridge-fab"` (reserved for future add-item shortcut). Install `expo-document-picker` here (needed for Onboarding import flow below).
- [x] Build `History` screen — `FlatList` of consumed/wasted items, status `Badge`, date; accessible from Profile only.

### Phase 3: Camera & Mock API Setup

- [x] Install `expo-image-picker` and `expo-image-manipulator`; request `CAMERA` and `MEDIA_LIBRARY` permissions.
- [x] Build Scan screen — primary "Take Photo" button + secondary "Choose from Gallery" button.
- [x] Add file validation (type: image only, size: max 10 MB).
- [x] Create `utils/validateImage.js` — throws on non-image MIME type or file size > 10 MB; called in Scan screen before compress step.
- [x] Create `utils/compressImage.js` — takes raw image URI from `expo-image-picker`, uses `expo-image-manipulator` to resize to max 1200px wide (maintain aspect ratio) + convert to JPEG quality 80. Returns compressed URI + base64. **Mandatory step before any AI call.**
- [x] Wire `compressImage` into Scan flow: pick/shoot → compress → base64 → AI.
- [x] Create mock data fixture matching the AI JSON schema.
- [x] Create `mockScanReceipt(imageBase64)` utility — returns mock fixture after 2-second delay.
- [x] Show `Modal` with `Spinner` + `SkeletonBlock` list while processing.
- [x] Disable "Take Photo" and "Choose from Gallery" buttons immediately on scan start; re-enable only after response (success or error). Prevents duplicate requests from accidental multi-tap.

### Phase 4: Review Screen (Validation UI)

- [x] Create `ReviewItem` component: editable name `TextInput`, `DatePicker` for expiry, delete `Pressable`.
- [x] Display `confidence_days` as "± N days" label next to expiry date on each `ReviewItem`.
- [x] Map AI response `items` into `ReviewItem` list using `FlatList`.
- [x] Validate all rows before commit (no empty names, no past expiry dates).
- [x] Implement "Confirm & Add to Fridge" — dispatch items to `InventoryContext`, then switch to the Fridge tab. Use `navigation.navigate('BottomTabs', { screen: 'Fridge' })` (or the configured bottom-tab navigator name) — do NOT push Fridge as a stack screen, since it is a tab destination.

### Phase 5: Real API Integration, Notifications & Polish

- [x] Create provider-agnostic `scanReceipt(imageBase64, provider, apiKey)` service module.
- [x] Implement OpenAI (GPT-4o) provider — send image as base64 in vision message.
- [x] Implement Google Gemini Flash provider.
- [x] Implement Anthropic Claude (`claude-sonnet-4-6`) provider.
- [x] Add error handling and fallback for malformed AI responses.
- [x] Handle HTTP 429 (rate limit) explicitly in `scanReceipt`: define and **export** a `RateLimitError` class (`export class RateLimitError extends Error { constructor() { super('Too Many Requests'); this.name = 'RateLimitError'; } }`). Throw it on 429. In the UI, catch by checking `err.name === 'RateLimitError'` (not `instanceof` — test files define their own local class and check `.name`). Show a `Snackbar` with message "Too many requests — wait a few seconds and try again" instead of crashing.
- [x] Update `ScanScreen` to call `scanReceipt` (from `utils/scanReceipt`) using provider and API key from `SettingsContext`; remove `mockScanReceipt` import. Update mock targets in **both** `__tests__/screens/ScanScreen.test.js` and `__tests__/screens/ScanScreen.lock.test.js` from `@/utils/mockScanReceipt` to `@/utils/scanReceipt`.
- [x] Wire Export Data button to `exportData()` — shares JSON via `expo-sharing`.
- [x] Wire Import Data button — use `expo-document-picker` to select JSON file; read file content as string; pass to `importData(jsonString)`; show `Snackbar` on success/failure; confirm before overwriting existing data.
- [x] Install `expo-notifications`; request notification permission once onboarding completes (or on first Home visit if user imported backup and skipped onboarding).
- [x] Create `utils/notifications.js` — exports `scheduleExpiryNotification(item)` (schedules notification 1 day before `estimated_expiry_date`, returns notification ID) and `cancelExpiryNotification(notificationId)` (cancels by ID).
- [x] On every item save/update: call `scheduleExpiryNotification(item)` and store returned ID on the item. Cancel + reschedule on edit via `cancelExpiryNotification` then `scheduleExpiryNotification`. Call `cancelExpiryNotification` on consumed/wasted/deleted.
- [x] Build Settings screen: AI provider selector (`Select`), API key input (masked `Input`, stored in `expiresnap_settings`), auto-delete period (`Select`), language selector (`Select`).
- [x] Wire Settings screen to `SettingsContext`; changes take effect immediately.
- [x] Add Italian translation file (`locales/it.json`) as second locale.
- [x] Audit touch targets — min 44×44pt on all interactive elements.
- [x] Test on iOS simulator (375pt baseline) and Android emulator.
- [x] Smoke-test full journey: onboarding → scan → review → fridge → mark consumed → history → settings → export/import.
- [x] Write `README.md` — must be self-sufficient for a new developer with zero prior context. Required sections:
  1. **Overview** — what ExpireSnap does, key features (receipt scan, AI expiry estimation, push notifications, export/import), supported platforms (iOS + Android).
  2. **Tech Stack** — React Native + Expo SDK 51, NativeWind v4, React Navigation v6, AsyncStorage, expo-notifications, expo-image-picker, expo-image-manipulator, react-i18next, react-native-shadow-2, react-native-reanimated; AI providers: OpenAI GPT-4o / Google Gemini Flash / Anthropic Claude.
  3. **Prerequisites** — Node.js 18+, npm/yarn, Expo CLI (`npm install -g expo-cli`), Expo Go app on physical device (iOS/Android), EAS CLI for production builds (`npm install -g eas-cli`), an account on expo.dev, API key from at least one AI provider.
  4. **Installation** — step-by-step: clone repo, `npm install`, copy `.env.example` to `.env` (if applicable), start dev server with `npx expo start`.
  5. **Running on Device (Development)** — scan QR code with Expo Go; tunnel mode for networks that block UDP (`npx expo start --tunnel`); note that camera and notifications require a physical device (not simulator).
  6. **Configuration** — where to enter AI provider and API key (Settings screen in app); list supported providers and where to get keys (OpenAI platform, Google AI Studio, Anthropic console); note keys are stored locally in AsyncStorage only.
  7. **Running Tests** — `npx jest` (all), `npx jest --watch` (watch mode), `npx jest --coverage` (coverage report), `npx jest <path>` (single file); test stack: jest-expo + RNTL + jest-native.
  8. **Project Structure** — annotated directory tree: `components/ui/` (primitives), `components/` (composite), `screens/` (full screens), `navigation/` (AppNavigator), `context/` (SettingsContext, InventoryContext), `utils/` (scanReceipt, compressImage, notifications, dataTransfer, validateImage), `locales/` (i18n), `__tests__/` (mirrors src structure + helpers/).
  9. **Building for Production (EAS Build)** — step-by-step: `eas login`, `eas build:configure`, build Android APK: `eas build -p android --profile preview`, build iOS IPA: `eas build -p ios --profile preview`; explain difference between `preview` (internal testing) and `production` profiles; note iOS requires Apple Developer account ($99/yr).
  10. **Submitting to App Stores** — Android: `eas submit -p android` → Google Play Console (create app listing, upload AAB, fill store details, submit for review); iOS: `eas submit -p ios` → App Store Connect (create app record, fill metadata, submit for TestFlight or direct review); note typical review times (Android 1–3 days, iOS 1–7 days).
  11. **Push Notifications** — local only (no server); `expo-notifications` schedules alerts 1 day before expiry; OS delivers even with app closed; no backend or Firebase setup required.
  12. **Export / Import Data** — Export: Profile → Export Data → shares JSON via system share sheet; Import: Profile → Import Data → select JSON file → merges into local storage; format documented inline (inventory array + settings object).
  13. **Troubleshooting** — common issues: camera not working on simulator (use physical device), notifications not firing (check OS permission in Settings), AI returning malformed JSON (switch provider or check API key quota), Metro bundler cache issues (`npx expo start --clear`).
  14. **Roadmap** — brief mention of Section 5 (Supabase multi-device sync, household sharing, Edge Function AI keys).
  15. **License** — MIT.

---

## 5. Future Implementation: Backend & Multi-Device Sync

Goal: allow multiple devices and household members to share one fridge inventory in real time.

### Recommended Stack
- **Backend:** Supabase (PostgreSQL + real-time subscriptions + Auth) — free tier, minimal ops overhead.
- **Auth:** Supabase Auth (email/password or magic link); each household gets a shared `household_id`.
- **Storage:** Replace AsyncStorage with Supabase DB; keep AsyncStorage as offline cache + optimistic UI.

### Data Model Changes
```
households   { id, name }
users        { id, household_id, email }
inventory    { id, household_id, name, category, expiry_date, status, created_by, created_at }
```

### Migration Path (non-breaking)
1. Add Supabase client (`@supabase/supabase-js`); keep AsyncStorage fallback for unauthenticated users.
2. Replace `InventoryContext` CRUD calls with Supabase DB calls; sync real-time via `supabase.channel()`.
3. Add Auth screens (Login / Register / Join Household via invite link).
4. Move AI API calls to Supabase Edge Functions — hides API keys server-side (no client-side keys needed).
5. Replace local `expo-notifications` scheduling with Supabase + Web Push for cross-device expiry alerts.

### Key Considerations
- Conflict resolution: last-write-wins is fine for grocery inventory.
- Offline support: queue mutations in AsyncStorage, flush on reconnect.
- API key security: Edge Functions remove the need for client-side AI keys entirely.

---

## 6. Definition of Done (Acceptance Criteria)

- Runs on iOS and Android via Expo Go; production build via EAS Build.
- Camera and gallery image picking works on physical device.
- Local push notifications fire at item expiry minus 1 day — even with app closed.
- Persistent data across app restarts via AsyncStorage.
- AI provider and API key entered by user in Settings; stored in `expiresnap_settings`; never hardcoded in source.
- Built-in error handling and fallback states for malformed AI responses.
