# Swipe Counter (Expo)

A mobile app that tracks **swipe-up** gestures inside the app. It shows:
- Total swipes (persistent)
- Today's swipes (resets each day)
- 7-day history with a simple chart

> Note: Due to platform limits, this Expo app counts swipes **inside this app**. 
> System-wide (across all apps) swipe counting requires a native Android AccessibilityService build.

## Run (Phone only)
1. Install **Expo Go** from Play Store.
2. Upload this folder to **Snack** (https://snack.expo.dev) or run locally with `expo start`.
3. Open in Expo Go.

## Build APK (Cloud) – optional
- Use **EAS Build**: `npx expo install && npx eas build -p android` (needs an Expo account).