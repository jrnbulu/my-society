# MySociety - Mobile Community Management App

A comprehensive React Native mobile application for managing residential societies and communities. Built with React Native, Firebase, and modern development practices.

## Features

- **Firebase OTP Authentication**: Email (Gmail) and phone-based authentication
- **Role-Based Access Control**: Admin, Owner, and Tenant dashboards
- **Community Management**: View owners, tenants, and society details
- **Responsive Design**: Optimized for iOS and Android
- **Modular Architecture**: Clean code structure for easy maintenance and extension

## Project Structure

```
my-society/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Carousel.tsx
│   │   ├── NavigationDrawer.tsx
│   │   ├── Tabs.tsx
│   │   ├── TextInput.tsx
│   │   └── index.ts
│   ├── screens/             # Application screens
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── OTPVerificationScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── index.ts
│   ├── navigation/          # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   └── index.ts
│   ├── services/            # Business logic & API
│   │   ├── firebaseConfig.ts
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   └── index.ts
│   ├── context/             # React context & state
│   │   ├── AuthContext.tsx
│   │   └── index.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useFormHandling.ts
│   │   └── index.ts
│   ├── constants/           # App-wide constants
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── helpers.ts
│   │   └── index.ts
│   └── index.ts
├── android/                 # Android native code
├── ios/                     # iOS native code
├── App.tsx                  # Root app component
├── index.js                 # Entry point
├── app.json                 # React Native config
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md                # This file
```

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0 or Yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- Firebase Project with OTP authentication enabled

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/jrnbulu/my-society.git
cd my-society
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication methods:
   - Email/Link Authentication
   - Phone Authentication
4. Copy your Firebase config from Project Settings
5. Update `src/services/firebaseConfig.ts` with your credentials:

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID',
};
```

### 4. Configure Firestore (Optional)

For full functionality, create the following Firestore collections:
- `users` - User profiles
- `societies` - Society information
- `owners` - Owner details
- `tenants` - Tenant details

### 5. Run on iOS

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Or specify a device
react-native run-ios --simulator="iPhone 14"
```

### 6. Run on Android

```bash
# Run on Android
npm run android

# Or with a specific emulator
adb devices  # List available devices
react-native run-android --deviceId <DEVICE_ID>
```

## Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build Android APK
npm run bundle-android

# Build iOS bundle
npm run bundle-ios
```

## Key Components

### Authentication Flow
1. **Splash Screen** - Initial loading screen (2 seconds)
2. **Login Screen** - Email or phone selection
3. **OTP Verification** - 6-digit OTP entry
4. **Dashboard** - Role-based dashboard

### UI Components

#### Button
```typescript
<Button
  title="Submit"
  onPress={handlePress}
  variant="primary"
  size="lg"
  loading={isLoading}
  disabled={false}
/>
```

#### Text Input
```typescript
<TextInputField
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={emailError}
/>
```

#### Carousel
```typescript
<Carousel
  items={items}
  height={200}
  autoScroll={true}
  autoScrollInterval={5000}
  onItemPress={handleItemPress}
/>
```

#### Tabs
```typescript
<Tabs
  tabs={[
    { id: 'tab1', label: 'Tab 1', content: <View>...</View> },
    { id: 'tab2', label: 'Tab 2', content: <View>...</View> },
  ]}
  defaultTab="tab1"
  onTabChange={handleTabChange}
/>
```

## Services

### Authentication Service
- `sendPhoneOTP()` - Send OTP to phone
- `sendEmailOTP()` - Send link to email
- `verifyPhoneOTP()` - Verify phone OTP
- `verifyEmailOTP()` - Verify email link
- `getCurrentUser()` - Get current user
- `signOutUser()` - Sign out user

### User Service
- `getUserProfile()` - Fetch user profile
- `updateUserProfile()` - Update user profile
- `getOwnersBySociety()` - Get all owners
- `getTenantsBySociety()` - Get all tenants
- `getSocietyDetails()` - Get society info

## Custom Hooks

### useForm
Manage form state with validation:
```typescript
const form = useForm({
  email: '',
  password: '',
});

form.handleChange('email', value);
form.setFieldError('email', 'Invalid email');
form.resetForm();
```

### useAsync
Manage async operations:
```typescript
const { execute, status, data, error } = useAsync(
  () => fetchData(),
  immediate
);
```

### useToggle
Toggle boolean state:
```typescript
const { value, toggle, setTrue, setFalse } = useToggle(false);
```

### useLocalStorage
Persist data to local storage:
```typescript
const [value, setValue] = useLocalStorage('key', initialValue);
```

## Role-Based Dashboards

### Admin Dashboard
- View all owners and tenants
- Manage society details
- System settings

### Owner Dashboard
- View property information
- Manage tenant details
- Pay maintenance

### Tenant Dashboard
- View society information
- Submit complaints
- View announcements

## Constants

All constants are centralized in `src/constants/index.ts`:
- Colors and Typography
- Screen and Stack names
- API endpoints
- Validation rules
- Error messages

## Styling

The app uses React Native's `StyleSheet` API with a consistent design system:
- **Colors**: Primary, Secondary, Success, Danger, Warning
- **Spacing**: XS (4px) to XXL (32px)
- **Typography**: Predefined text styles
- **Border Radius**: SM to Full

## Error Handling

Comprehensive error handling throughout the app:
- Network error detection
- Firebase authentication errors
- Form validation errors
- User-friendly error messages

## Future Enhancements

- [ ] Push notifications
- [ ] Real-time messaging
- [ ] Payment integration
- [ ] Document management
- [ ] Maintenance tracking
- [ ] Event management
- [ ] Complaint/Issue tracking
- [ ] Analytics dashboard
- [ ] Offline support
- [ ] Dark mode

## Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Environment Variables

Create a `.env` file in the root directory:

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### iOS Build Issues
```bash
# Clean build folder
cd ios && xcodebuild clean -workspace MySociety.xcworkspace -scheme MySociety && cd ..
```

### Android Build Issues
```bash
# Clean gradle
cd android && ./gradlew clean && cd ..
```

---

**Author**: Your Name  
**Last Updated**: 2024  
**Version**: 1.0.0
