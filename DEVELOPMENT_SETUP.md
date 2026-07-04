# Development Setup Guide

This guide provides step-by-step instructions for setting up the MySociety application for development.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Firebase Configuration](#firebase-configuration)
3. [Running on iOS](#running-on-ios)
4. [Running on Android](#running-on-android)
5. [Debugging](#debugging)
6. [Common Issues](#common-issues)

## Environment Setup

### macOS Setup

1. **Install Node.js and npm**
```bash
# Using Homebrew
brew install node

# Verify installation
node --version
npm --version
```

2. **Install React Native CLI**
```bash
npm install -g react-native-cli
```

3. **Install Watchman** (improves Metro bundler performance)
```bash
brew install watchman
```

4. **Install CocoaPods** (for iOS)
```bash
sudo gem install cocoapods
```

5. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install Android SDK (API Level 31 or higher)
   - Configure ANDROID_HOME environment variable

### Windows Setup

1. **Install Node.js and npm**
   - Download from https://nodejs.org/
   - Run installer and follow prompts

2. **Install React Native CLI**
```bash
npm install -g react-native-cli
```

3. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install Android SDK (API Level 31 or higher)
   - Configure ANDROID_HOME environment variable

4. **Add to PATH** (Windows)
   - ANDROID_HOME: `C:\Users\YOUR_USERNAME\AppData\Local\Android\sdk`
   - Add `%ANDROID_HOME%\platform-tools` to PATH

### Linux Setup

1. **Install Node.js and npm**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install React Native CLI**
```bash
npm install -g react-native-cli
```

3. **Install Java Development Kit**
```bash
sudo apt-get install default-jdk
```

4. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Follow installation instructions

## Firebase Configuration

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Enter project name: "MySociety"
4. Accept terms and create project

### Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Enable the following sign-in methods:
   - **Email/Password** (select "Email link (passwordless sign-in)")
   - **Phone Number** (enable Phone Number sign-in)
4. For Production, add your app domains to authorized domains

### Get Firebase Config

1. Go to Project Settings (gear icon)
2. Under "Your apps", select Web app
3. Copy the config object
4. Update `src/services/firebaseConfig.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_auth_domain",
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id",
};
```

### Set Up Firestore (Optional)

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select production mode
4. Create the following collections:

```
firestore/
├── users/
│   └── {uid}
│       ├── email
│       ├── name
│       ├── phoneNumber
│       ├── role
│       ├── societyId
│       └── profilePicture
├── societies/
│   └── {societyId}
│       ├── name
│       ├── address
│       ├── secretary
│       ├── president
│       └── totalUnits
├── owners/
└── tenants/
```

## Running on iOS

### Prerequisites

- Mac with Xcode 14.0 or later
- iOS Simulator or physical device
- All dependencies installed (see Environment Setup)

### Installation Steps

```bash
# 1. Install iOS dependencies
cd ios
pod install
cd ..

# 2. Start Metro bundler
npm start

# 3. In a new terminal, run on iOS
npm run ios

# Or run on specific device
react-native run-ios --simulator="iPhone 14"
```

### Using Xcode

```bash
# 1. Open workspace
open ios/MySociety.xcworkspace

# 2. Select target scheme
# 3. Select simulator or device
# 4. Press Cmd + R to run
```

### Testing on Physical Device

1. Connect iPhone via USB
2. In Xcode, select device from scheme menu
3. Ensure provisioning profiles are set up
4. Press Cmd + R to run

## Running on Android

### Prerequisites

- Android Studio installed
- Android SDK (API 31+)
- Android Virtual Device or physical device
- `ANDROID_HOME` environment variable set

### Installation Steps

```bash
# 1. Start emulator
# Option A: Command line
emulator -avd <AVD_NAME>

# Option B: Android Studio
# Open AVD Manager and launch emulator

# 2. Start Metro bundler
npm start

# 3. In a new terminal, run on Android
npm run android
```

### Using Android Studio

```bash
# 1. Open android folder in Android Studio
# File > Open > navigate to android folder

# 2. Wait for Gradle sync to complete

# 3. Select Run > Run 'app'
```

### Testing on Physical Device

1. Enable Developer Mode on Android phone
2. Enable USB Debugging
3. Connect via USB
4. Verify connection: `adb devices`
5. Run: `npm run android`

## Debugging

### React Native Debugger

```bash
# Install globally
npm install -g react-native-debugger

# Run debugger
react-native-debugger
```

### In-App Debug Menu

- **iOS**: Cmd + D (Simulator) or Shake device
- **Android**: Cmd/Ctrl + M (Emulator) or Shake device

### Chrome DevTools

1. Open in-app debug menu
2. Select "Debug with Chrome"
3. Open http://localhost:8081/debugger-ui/

### Flipper Debugging

```bash
# Install Flipper
brew install flipper

# Run Flipper
flipper
```

### Console Logging

```typescript
// Add logs
console.log('Message:', data);
console.warn('Warning:', data);
console.error('Error:', data);
```

### React DevTools

```bash
# Install extension
npm install --save-dev @react-navigation/devtools

# Use in RootNavigator
import { useNavigationContainerRef } from '@react-navigation/native';

const navigationRef = useNavigationContainerRef();

// In NavigationContainer:
<NavigationContainer ref={navigationRef}>
  {/* ... */}
</NavigationContainer>
```

## Common Issues

### Issue: Module Not Found

**Solution:**
```bash
# Clear cache
npm start -- --reset-cache

# Or
watchman watch-del-all
```

### Issue: iOS Build Fails

**Solution:**
```bash
# Clean and rebuild
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm start -- --reset-cache
```

### Issue: Android Emulator Won't Start

**Solution:**
```bash
# Delete and recreate AVD
emulator -avd <AVD_NAME> -wipe-data

# Or
emulator -avd <AVD_NAME> -no-snapshot-load
```

### Issue: Permission Denied

**Solution:**
```bash
# Make scripts executable
chmod +x android/gradlew
```

### Issue: Metro Bundler Not Starting

**Solution:**
```bash
# Kill existing process
lsof -i :8081
kill -9 <PID>

# Start fresh
npm start
```

### Issue: Firebase Not Initializing

**Solution:**
1. Verify firebaseConfig.ts has correct credentials
2. Check Firebase project has auth enabled
3. Clear app cache and restart

### Issue: OTP Not Received

**Checklist:**
- Phone number format is correct (+country_code format)
- Gmail is for email-based OTP
- Check spam folder for email links
- Verify SMS permissions for phone

## Environment Variables

Create `.env` file in project root:

```bash
# Firebase Config
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_id
FIREBASE_APP_ID=your_app_id

# API Endpoints (Optional)
API_BASE_URL=https://api.yourdomain.com
```

## Useful Commands

```bash
# Clear all caches
npm start -- --reset-cache
watchman watch-del-all

# List devices/emulators
adb devices
xcrun simctl list

# Install app on device
react-native run-android
react-native run-ios

# Build release APK
cd android
./gradlew assembleRelease
cd ..

# Build release iOS bundle
cd ios
xcodebuild -workspace MySociety.xcworkspace -scheme MySociety -configuration Release
cd ..

# Format code
npm run format

# Lint code
npm run lint
```

## Performance Optimization Tips

1. **Use `React.memo` for components**
```typescript
export const MyComponent = React.memo(({ prop }) => {
  // Component code
});
```

2. **Optimize Images**
```typescript
<Image
  source={require('./image.png')}
  style={{ width: 200, height: 200 }}
/>
```

3. **Use FlatList instead of ScrollView for long lists**

4. **Lazy load components**
```typescript
const DynamicComponent = React.lazy(() => import('./Component'));
```

5. **Use AsyncStorage for offline data**

## Next Steps

- Read [React Native Documentation](https://reactnative.dev/docs)
- Explore [Firebase Documentation](https://firebase.google.com/docs)
- Check out [React Navigation Guide](https://reactnavigation.org/docs)
- Review project structure and code examples

---

For more help, visit the [GitHub Issues](https://github.com/jrnbulu/my-society/issues) page.
