# Building ExpireSnap APK (Android)

## Prerequisites

- Node.js installed
- Expo account at [expo.dev](https://expo.dev) (free)
- Android device with "Install unknown apps" enabled

---

## One-time Setup

```bash
npm install -g eas-cli
eas login
```

---

## Build APK

```bash
eas build -p android --profile preview
```

- Builds on Expo cloud (~10–15 min)
- No Android Studio or local SDK needed
- Prints APK download URL when complete

---

## Install on Device

1. Download `.apk` from the URL printed after build
2. On Android: **Settings → Security → Install unknown apps** → enable for your browser or Files app
3. Open the `.apk` file → tap Install
4. Launch ExpireSnap — push notifications work natively

---

## Build Profiles (eas.json)

| Profile | Output | Use for |
|---------|--------|---------|
| `preview` | `.apk` | Sideload testing on device |
| `production` | `.aab` | Google Play Store submission |

Switch profiles:
```bash
eas build -p android --profile production
```

---

## Project IDs

- **Expo owner:** `joshuafrigoli`
- **EAS project ID:** `38f0c278-b92b-4d37-82ca-4855dc399a67`
- **Android package:** `com.jfrigoli.expiresnap`

---

## View Past Builds

```bash
eas build:list
```

Or visit [expo.dev/accounts/joshuafrigoli/projects/expire-snap/builds](https://expo.dev/accounts/joshuafrigoli/projects/expire-snap/builds)
