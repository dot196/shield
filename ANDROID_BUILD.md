# Building Dlinqnt Shield Android APK

This guide will help you build the Android APK for Dlinqnt Shield locally.

## Prerequisites

1. Install Node.js (v16 or later)
2. Install Android Studio (latest version)
3. Install Java Development Kit (JDK) 17
4. Configure Android SDK (via Android Studio)

## Setup Instructions

1. Clone or download the project
2. Install dependencies:
```bash
npm install
```

3. Build the web application:
```bash
npm run build
```

4. Install Android platform (if not already present):
```bash
npx cap add android
```

5. Copy web assets to Android:
```bash
npx cap copy android
```

## Building the APK

1. Open Android Studio:
```bash
npx cap open android
```

2. In Android Studio:
   - Wait for the project to sync
   - Go to Build > Generate Signed Bundle / APK
   - Select APK
   - Create or choose a keystore:
     - Path: `release-key.keystore`
     - Alias: `key0`
     - Password: Use the password provided in your secure environment
   - Choose release build variant
   - Click 'Create'

The APK will be generated in:
`android/app/build/outputs/apk/release/app-release.apk`

## Testing the APK

1. Enable "Install from Unknown Sources" on your Android device
2. Transfer the APK to your device
3. Install and test the application

## Troubleshooting

- If you encounter build errors:
  - Ensure Android SDK platforms and build tools are installed
  - Verify Gradle sync completed successfully
  - Check that all environment variables are set correctly

- For signing issues:
  - Verify keystore credentials match capacitor.config.ts
  - Ensure keystore file is in the correct location

## Notes

- The app requires Android 5.0 (API 21) or higher
- Internet permission is required for accessing the web services
- The app will connect to https://dlinqnt-shield.replit.app by default
