# ExpireSnap

A React Native + Expo mobile application that reduces food waste by scanning grocery receipts, using AI to extract food items and estimate their expiration dates, and scheduling local push notifications before items expire.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running on Device (Development)](#running-on-device-development)
6. [Configuration](#configuration)
7. [Running Tests](#running-tests)
8. [Project Structure](#project-structure)
9. [Building for Production (EAS Build)](#building-for-production-eas-build)
10. [Submitting to App Stores](#submitting-to-app-stores)
11. [Push Notifications](#push-notifications)
12. [Export / Import Data](#export--import-data)
13. [Troubleshooting](#troubleshooting)
14. [Roadmap](#roadmap)
15. [License](#license)

---

## Overview

ExpireSnap lets you photograph a grocery receipt with your phone's camera. The image is sent to an AI provider (your choice of OpenRouter, OpenAI, Google Gemini, or Anthropic Claude), which extracts the food items and estimates how long each one stays fresh. The results land in your virtual fridge with a countdown to expiry, a freshness progress bar, and a local push notification scheduled for the day before each item expires.

**Key features:**

- Receipt scan via camera or photo library
- AI-powered item extraction with expiry estimation and confidence margin (± N days)
- Virtual fridge with search, category filters, and freshness indicators
- Mark items as Consumed or Wasted; archived in History
- Local push notifications — no backend required
- Export / Import full data as JSON backup
- Onboarding with profile (name + emoji avatar)
- English and Italian UI (i18n via react-i18next)

**Supported platforms:** iOS and Android.

---

## Tech Stack

| Layer              | Library / Tool                                                           |
| ------------------ | ------------------------------------------------------------------------ |
| Framework          | React Native + Expo SDK 54                                               |
| Styling            | NativeWind v4 (Tailwind for React Native)                                |
| Hard shadows       | react-native-shadow-2                                                    |
| Animations         | react-native-reanimated v4                                               |
| Navigation         | React Navigation v6 (bottom-tabs + stack)                                |
| State              | React Context API (InventoryContext, SettingsContext)                    |
| Persistence        | @react-native-async-storage/async-storage                                |
| Camera / Gallery   | expo-image-picker                                                        |
| Image compression  | expo-image-manipulator                                                   |
| Push notifications | expo-notifications                                                       |
| Data sharing       | expo-sharing, expo-document-picker, expo-file-system                     |
| i18n               | react-i18next + i18next                                                  |
| Font               | Poppins via @expo-google-fonts/poppins                                   |
| Testing            | jest-expo + @testing-library/react-native + @testing-library/jest-native |

**AI providers (user-supplied API key, configured in-app):**

| Provider      | Model                  | Notes               |
| ------------- | ---------------------- | ------------------- |
| OpenRouter    | Auto (openrouter/auto) | Free tier available |
| OpenAI        | GPT-4o                 |                     |
| Google Gemini | Gemini Flash           |                     |
| Anthropic     | claude-sonnet-4-6      |                     |

---

## Prerequisites

Before you start, make sure you have the following installed and configured:

- **Node.js 18 or later** — [nodejs.org](https://nodejs.org)
- **npm** (bundled with Node) or **yarn**
- **Expo CLI** — install globally:
  ```
  npm install -g expo-cli
  ```
- **EAS CLI** — required for production builds:
  ```
  npm install -g eas-cli
  ```
- **Expo account** — create a free account at [expo.dev](https://expo.dev)
- **Expo Go app** on a physical iOS or Android device — download from the App Store or Google Play
- **API key** from at least one AI provider (OpenRouter has a free tier that requires no key):
  - OpenRouter (free tier available): [openrouter.ai/keys](https://openrouter.ai/keys)
  - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - Google Gemini: [aistudio.google.com](https://aistudio.google.com)
  - Anthropic: [console.anthropic.com](https://console.anthropic.com)

> Camera and push notification features require a physical device. They do not work in the iOS Simulator or Android Emulator.

---

## Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd expire-snap

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start
```

A QR code will appear in the terminal. Scan it with Expo Go (Android) or the Camera app (iOS) to open the app on your device.

---

## Running on Device (Development)

**Standard mode (same Wi-Fi network):**

Scan the QR code shown by `npx expo start` with:

- **Android** — Expo Go app
- **iOS** — native Camera app (iOS 16+) or Expo Go app

**Tunnel mode (different networks, corporate Wi-Fi, or firewalls that block UDP):**

```bash
npx expo start --tunnel
```

This routes traffic through Expo's relay servers. It is slower than LAN mode but works on any network.

**Important:** Camera capture and push notifications only work on a **physical device**. The iOS Simulator and Android Emulator do not support the camera hardware, and notification delivery on simulators is unreliable.

---

## Configuration

All configuration is done inside the app — there are no `.env` files or hardcoded keys.

1. Open the app and complete onboarding.
2. Tap **Settings** in the bottom navigation bar.
3. Under **AI Provider**, select one of: OpenRouter (free), OpenAI, Google Gemini, or Anthropic Claude.
4. Enter your API key in the **API Key** field (masked input).
5. Optionally configure:
   - **Auto-delete period** — how long consumed/wasted items are kept in history before automatic removal (7, 14, 30, or 60 days; or never).
   - **Language** — English or Italian.

Settings are stored locally in `@react-native-async-storage/async-storage` under the key `expiresnap_settings`. They never leave the device.

**Where to obtain API keys:**

| Provider      | URL                                                                  | Notes                                                             |
| ------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| OpenRouter    | [openrouter.ai/keys](https://openrouter.ai/keys)                     | Free tier available; leave API key field empty to use free models |
| OpenAI        | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |                                                                   |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com)                   |                                                                   |
| Anthropic     | [console.anthropic.com](https://console.anthropic.com)               |                                                                   |

---

## Running Tests

The test suite uses **jest-expo**, **@testing-library/react-native**, and **@testing-library/jest-native**.

```bash
# Run all tests once
npx jest

# Run in watch mode (re-runs on file change)
npx jest --watch

# Generate a coverage report
npx jest --coverage

# Run a specific test file
npx jest __tests__/screens/ScanScreen.test.js

# Run all tests matching a pattern
npx jest --testPathPattern=screens
```

Tests are located in `__tests__/` and mirror the `src` folder structure. Shared test utilities (mock item factory, context wrappers, date helpers) live in `__tests__/helpers/index.js` and are importable as `@testHelpers`.

---

## Project Structure

```
expire-snap/
├── App.js                        # Entry point; loads fonts, renders AppNavigator
├── index.js                      # Expo entry (registers root component)
├── app.json                      # Expo project config (name, slug, icons)
├── babel.config.js               # Babel + NativeWind + Reanimated + path aliases
├── tailwind.config.js            # Design tokens (colors, radius, spacing, fonts)
├── global.css                    # NativeWind global styles
├── jest.setup.js                 # Global mocks for all tests
├── tsconfig.json                 # Path aliases (@/, @testHelpers)
│
├── components/
│   ├── ui/                       # Reusable primitive components
│   │   ├── index.js              # Barrel export for all UI primitives
│   │   ├── Button.jsx            # Primary / secondary / ghost; hard shadow; spring press
│   │   ├── Card.jsx              # White card; 4px hard shadow
│   │   ├── Badge.jsx             # Pill badge; danger / warning / safe / neutral variants
│   │   ├── ProgressBar.jsx       # Animated freshness bar
│   │   ├── Input.jsx             # Text / date / password input
│   │   ├── Select.jsx            # Modal-based custom selector
│   │   ├── DatePicker.jsx        # Wraps @react-native-community/datetimepicker
│   │   ├── TopAppBar.jsx         # Page title + back button + profile avatar
│   │   ├── BottomNav.jsx         # Custom bottom tab bar
│   │   ├── FloatingActionButton.jsx
│   │   ├── FilterTabs.jsx        # Animated horizontal category tabs
│   │   ├── Spinner.jsx           # Branded ActivityIndicator
│   │   ├── SkeletonBlock.jsx     # Loading placeholder with shimmer
│   │   ├── Avatar.jsx            # Emoji or initials avatar; sm/md/lg
│   │   ├── ProfileButton.jsx     # Avatar button for TopAppBar navigation
│   │   └── Snackbar.jsx          # Animated bottom toast; auto-dismiss
│   │
│   ├── InventoryItem.jsx         # Fridge list row with freshness bar and quick actions
│   ├── InventoryList.jsx         # FlatList with search and category filter
│   ├── ReviewItem.jsx            # Editable row on Review screen
│   ├── StatCard.jsx              # Dashboard stat (label + animated count)
│   └── Layout.jsx                # SafeAreaView wrapper + TopAppBar slot
│
├── screens/
│   ├── DashboardScreen.jsx       # Home: stat cards + Scan button
│   ├── ScanScreen.jsx            # Camera / gallery pick + AI scan flow
│   ├── ReviewScreen.jsx          # Edit AI-extracted items before saving
│   ├── FridgeScreen.jsx          # Inventory list with FAB
│   ├── HistoryScreen.jsx         # Consumed / wasted archive
│   ├── ProfileScreen.jsx         # User info, stats, export/import
│   ├── OnboardingScreen.jsx      # First-launch name + avatar setup
│   ├── SettingsScreen.jsx        # AI provider, API key, auto-delete, language
│   └── ProviderInfoScreen.jsx    # Info/help page for AI provider selection
│
├── constants/
│   └── categories.js             # Category key → i18n key mapping
│
├── theme/
│   └── index.js                  # Theme helpers and light/dark color tokens
│
├── navigation/
│   └── AppNavigator.js           # NavigationContainer + BottomTabNavigator + StackNavigator
│
├── context/
│   ├── InventoryContext.js       # CRUD for inventory items; AsyncStorage sync; auto-delete
│   ├── SettingsContext.js        # User preferences; AsyncStorage sync
│   ├── PortalContext.js          # Portal layer for modals/overlays
│   └── SnackbarContext.js        # Global snackbar state and trigger
│
├── utils/
│   ├── scanReceipt.js            # Provider-agnostic AI scan service (Phase 5)
│   ├── mockScanReceipt.js        # Mock scan returning fixture data (dev/testing)
│   ├── compressImage.js          # Resize to 1200px + JPEG 80% before AI upload
│   ├── validateImage.js          # Throws on non-image MIME or file > 10 MB
│   ├── notifications.js          # scheduleExpiryNotification / cancelExpiryNotification
│   ├── dataTransfer.js           # exportData (share JSON) + importData (merge from JSON)
│   └── i18n.js                   # i18next initializer; loads locale files
│
├── locales/
│   ├── en.json                   # English translations
│   └── it.json                   # Italian translations
│
└── __tests__/
    ├── helpers/
    │   └── index.js              # today, daysFromNow, mockItem, Wrapper
    ├── components/               # Unit tests for composite components
    ├── context/                  # Tests for InventoryContext and SettingsContext
    ├── navigation/               # Navigation guard test (onboarding redirect)
    ├── notifications/            # scheduleExpiryNotification / cancel tests
    ├── screens/                  # Integration tests per screen
    └── utils/                    # Unit tests for utility functions
```

---

## Building for Production (EAS Build)

EAS (Expo Application Services) compiles the app to a native APK (Android) or IPA (iOS) outside your local machine.

**One-time setup:**

```bash
# Log in to your Expo account
eas login

# Generate eas.json with build profiles (creates preview + production profiles)
eas build:configure
```

**Android APK (internal testing):**

```bash
eas build -p android --profile preview
```

Produces an `.apk` file you can install directly on any Android device (or an `.aab` for the Play Store with the `production` profile).

**iOS IPA (internal testing):**

```bash
eas build -p ios --profile preview
```

Produces an `.ipa` suitable for TestFlight distribution.

**Profile reference:**

| Profile      | Purpose                             | Output                           |
| ------------ | ----------------------------------- | -------------------------------- |
| `preview`    | Internal testing; sideload directly | APK / unsigned IPA               |
| `production` | Store submission                    | AAB (Android) / signed IPA (iOS) |

> iOS builds require an **Apple Developer account** ($99/year). During `eas build -p ios`, EAS will prompt you to log in to Apple and select your provisioning profile and certificate.

---

## Submitting to App Stores

**Android — Google Play Console:**

```bash
eas build -p android --profile production
eas submit -p android
```

Then in [Google Play Console](https://play.google.com/console):

1. Create a new app listing.
2. Upload the `.aab` generated by EAS (or let `eas submit` upload automatically).
3. Fill in the store listing (description, screenshots, content rating).
4. Submit for review.

Typical Android review time: **1–3 business days**.

**iOS — App Store Connect:**

```bash
eas build -p ios --profile production
eas submit -p ios
```

Then in [App Store Connect](https://appstoreconnect.apple.com):

1. Create a new app record (bundle ID must match `app.json`).
2. Fill in metadata (name, description, screenshots, category).
3. Select the build uploaded by EAS Submit.
4. Submit for review, or distribute via TestFlight first.

Typical iOS review time: **1–7 business days**.

---

## Push Notifications

ExpireSnap uses **local notifications only** — no backend server, no Firebase, no APNs server-side integration required.

How it works:

- When an item is added or updated, `scheduleExpiryNotification(item)` (in `utils/notifications.js`) schedules a local notification for **1 day before** the item's estimated expiry date.
- The notification ID is stored on the item record. When an item is edited, the old notification is cancelled and a new one is scheduled. When an item is consumed, wasted, or deleted, its notification is cancelled.
- The OS (iOS or Android) delivers the notification at the scheduled time, even if the app is closed or in the background.

No account, no server, no additional setup is required beyond granting notification permission when prompted on first launch.

---

## Export / Import Data

**Export:**

1. Tap the **Profile** tab (avatar icon, top-right on any screen).
2. Tap **Export Data**.
3. A JSON file is shared via the system share sheet — save to Files, send via email, AirDrop, etc.

The exported JSON contains:

```json
{
  "inventory": [ ...item objects... ],
  "settings": { ...settings object... }
}
```

**Import:**

1. Tap **Profile** > **Import Data**.
2. Select a `.json` file exported by ExpireSnap.
3. The data is validated and merged into local storage.
4. A confirmation snackbar appears on success.

> Import is also available on the Onboarding screen for users setting up a new device. Selecting a backup file skips onboarding entirely and restores the full app state.

---

## Troubleshooting

**Camera does not open / black screen**

The camera requires a physical device. The iOS Simulator has no camera hardware. Use Expo Go on a real iPhone or Android phone.

**Push notifications are not appearing**

Check that the app has notification permission:

- iOS: Settings > ExpireSnap > Notifications > Allow Notifications
- Android: Settings > Apps > ExpireSnap > Notifications > turn on

If you denied permission during onboarding, you must re-enable it manually in the OS settings — the app cannot re-prompt after an initial denial.

**AI returns an error or malformed JSON**

- Verify the API key is correct and has remaining quota (check your provider's dashboard).
- Google Gemini's free tier is limited to 15 requests per minute. If you see a "Too many requests" snackbar, wait a few seconds and try again.
- Try switching to a different AI provider in Settings.
- Make sure the receipt image is clear and well-lit; blurry or low-contrast images reduce AI accuracy.

**Metro bundler errors after dependency changes**

Clear the Metro cache:

```bash
npx expo start --clear
```

If problems persist, also clear the node_modules cache:

```bash
rm -rf node_modules
npm install
npx expo start --clear
```

**Tests fail with module resolution errors**

Make sure `jest.setup.js` is listed under `setupFilesAfterFramework` in `package.json` and that the `@testHelpers` alias is present in `moduleNameMapper`. Run `npx jest --clearCache` then retry.

---

## Roadmap

The current version stores all data locally on-device. The planned next phase (Section 5 of `PLAN.md`) introduces cloud sync:

- **Supabase backend** — PostgreSQL + real-time subscriptions; each household gets a shared `household_id` so multiple devices see the same fridge.
- **Supabase Auth** — email/password or magic-link; replaces per-device AsyncStorage as the source of truth.
- **Edge Functions for AI** — API keys move server-side; users no longer need to supply their own keys.
- **Cross-device push notifications** — server-triggered Web Push replaces local scheduling when Supabase is enabled.
- **Household sharing** — invite family members via a link; all members see and edit the same inventory in real time.

Offline support will be retained through an AsyncStorage write queue that flushes on reconnect, using last-write-wins conflict resolution.

---

## License

MIT. See [LICENSE](./LICENSE) for the full text.
