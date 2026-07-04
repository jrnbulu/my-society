# MySociety - Developer Checklist

A comprehensive checklist for setting up, developing, and deploying the MySociety application.

## Pre-Development Setup

### Environment Setup
- [ ] Install Node.js (v16+)
- [ ] Install npm or yarn
- [ ] Install React Native CLI globally
- [ ] Install watchman (macOS)
- [ ] Install Xcode (macOS for iOS)
- [ ] Install Android Studio
- [ ] Configure ANDROID_HOME environment variable
- [ ] Install CocoaPods (macOS)
- [ ] Create/activate virtual environment if using one

### Firebase Setup
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Navigate to Project Settings
- [ ] Copy Firebase configuration
- [ ] Update `src/services/firebaseConfig.ts` with credentials
- [ ] Enable Authentication > Email/Link Sign-in
- [ ] Enable Authentication > Phone Number Sign-in
- [ ] Create Firestore Database
- [ ] Create collections: users, societies, owners, tenants
- [ ] Configure security rules from firestore.rules

### Project Setup
- [ ] Clone repository: `git clone https://github.com/jrnbulu/my-society.git`
- [ ] Navigate to project: `cd my-society`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file from `.env.example`
- [ ] Fill in `.env` with your Firebase credentials

## Development Checklist

### Initial Development
- [ ] Start Metro bundler: `npm start`
- [ ] Test on iOS: `npm run ios`
- [ ] Test on Android: `npm run android`
- [ ] Verify app launches without crashes
- [ ] Test Splash screen displays for 2 seconds

### Testing Login Flow
- [ ] Navigate to Login Screen
- [ ] Test email login tab
  - [ ] Enter valid Gmail address
  - [ ] Receive verification link
  - [ ] Click link and verify email
- [ ] Test phone login tab
  - [ ] Enter valid phone number
  - [ ] Receive OTP code
  - [ ] Enter OTP and verify
- [ ] Test OTP expiry timer
- [ ] Test "Resend OTP" functionality

### Testing Dashboard
- [ ] Login successfully
- [ ] Verify Dashboard displays
- [ ] Check carousel auto-scrolls
- [ ] Test carousel dot indicators
- [ ] Navigate through tabs (Owners, Tenants, Society)
- [ ] Verify user data displays correctly

### Testing Navigation
- [ ] Click drawer menu button
- [ ] Verify drawer opens with profile section
- [ ] Click Profile → navigate to Profile screen
- [ ] Click Settings → navigate to Settings screen
- [ ] Click Logout → return to Login screen
- [ ] Test back navigation

### Testing Features
- [ ] Test form validation
- [ ] Test error messages display correctly
- [ ] Test loading states
- [ ] Test all button variants
- [ ] Test text input validation
- [ ] Test carousel navigation
- [ ] Test tab switching

### Code Quality
- [ ] Format code: `npm run format`
- [ ] Run linting: `npm run lint`
- [ ] Fix any linting errors
- [ ] Review console for warnings
- [ ] Test memory usage
- [ ] Test network performance

## Testing Checklist

### Manual Testing
- [ ] Test on iOS Simulator (iPhone 14)
- [ ] Test on iOS Simulator (iPhone SE)
- [ ] Test on Android Emulator (Android 11)
- [ ] Test on Android Emulator (Android 12)
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Test on landscape orientation
- [ ] Test on portrait orientation
- [ ] Test with different text sizes
- [ ] Test with internet off (offline mode)

### Performance Testing
- [ ] Profile app performance in Xcode
- [ ] Profile app performance in Android Studio
- [ ] Check memory usage
- [ ] Test list scrolling performance
- [ ] Monitor network requests
- [ ] Verify no memory leaks

### Edge Cases
- [ ] Test with invalid email format
- [ ] Test with invalid phone format
- [ ] Test with expired OTP
- [ ] Test with incorrect OTP
- [ ] Test rapid button clicks
- [ ] Test network timeout
- [ ] Test Firebase connection loss

## Firebase Configuration

### Firestore Collections
- [ ] Create `users` collection
  - [ ] Document: {uid}
  - [ ] Fields: email, name, phoneNumber, role, societyId, etc.

- [ ] Create `societies` collection
  - [ ] Document: {societyId}
  - [ ] Fields: name, address, secretary, president, etc.

- [ ] Create `owners` collection
  - [ ] Document: {ownerId}
  - [ ] Fields: society reference, property details, etc.

- [ ] Create `tenants` collection
  - [ ] Document: {tenantId}
  - [ ] Fields: society reference, owner reference, etc.

### Security Rules
- [ ] Deploy firestore.rules to Firestore
- [ ] Test rules in Firestore test console
- [ ] Verify authentication checks work
- [ ] Verify role-based access works
- [ ] Test unauthorized access is blocked

### Authentication
- [ ] Test Email/Link sign-in
- [ ] Test Phone number sign-in
- [ ] Configure approved domains
- [ ] Test OTP delivery
- [ ] Test email link delivery
- [ ] Configure SMS provider (Twilio or Firebase default)

## Debugging

### Tools Setup
- [ ] Install React Native Debugger
- [ ] Install Flipper for debugging
- [ ] Configure Chrome DevTools
- [ ] Setup logcat for Android
- [ ] Setup Xcode debugging for iOS

### Debugging Techniques
- [ ] Add console.log() statements
- [ ] Use React DevTools
- [ ] Use Network tab in Chrome DevTools
- [ ] Use Redux DevTools (if using Redux)
- [ ] Debug Firebase calls
- [ ] Debug async operations

### Common Issues
- [ ] Metro bundler not starting
- [ ] iOS build failures
- [ ] Android build failures
- [ ] Firebase not initializing
- [ ] Navigation issues
- [ ] State management issues

## Documentation

### Code Documentation
- [ ] Add JSDoc comments to services
- [ ] Document component props
- [ ] Document custom hooks
- [ ] Add inline comments for complex logic
- [ ] Document API endpoints
- [ ] Update README with custom features

### Project Documentation
- [ ] Update README.md with project details
- [ ] Create ARCHITECTURE.md (✅ Done)
- [ ] Create DEVELOPMENT_SETUP.md (✅ Done)
- [ ] Create EXTENSION_GUIDE.md (✅ Done)
- [ ] Document API integration points
- [ ] Document database schema

## Release Preparation

### iOS Release
- [ ] Update app version in app.json
- [ ] Create release build: `npm run bundle-ios`
- [ ] Test release build on device
- [ ] Generate signing certificate
- [ ] Create provisioning profile
- [ ] Archive in Xcode
- [ ] Validate with App Store
- [ ] Submit to App Store
- [ ] Monitor TestFlight beta

### Android Release
- [ ] Update app version in app.json
- [ ] Generate signing key: `keytool -genkey -v -keystore app-release-key.keystore`
- [ ] Create release APK: `npm run bundle-android`
- [ ] Test release APK on device
- [ ] Upload to Google Play Console
- [ ] Configure release details
- [ ] Submit for review
- [ ] Monitor Play Store dashboard

### App Store Listings
- [ ] Write compelling app description
- [ ] Create app screenshots
- [ ] Prepare preview video
- [ ] Set pricing tier
- [ ] Configure categories
- [ ] Add keywords
- [ ] Set privacy policy URL
- [ ] Set support email
- [ ] Set support website

## Post-Release

### Monitoring
- [ ] Monitor app crash reports
- [ ] Check Firebase error logs
- [ ] Monitor user feedback
- [ ] Track key metrics (DAU, MAU)
- [ ] Monitor Firebase database usage
- [ ] Check API response times

### Maintenance
- [ ] Update dependencies regularly
- [ ] Apply security patches
- [ ] Monitor Firebase quota usage
- [ ] Backup Firestore data
- [ ] Review and optimize queries
- [ ] Monitor costs

### User Support
- [ ] Respond to app reviews
- [ ] Monitor in-app feedback
- [ ] Create FAQ section
- [ ] Set up support email
- [ ] Document common issues
- [ ] Create troubleshooting guide

## Feature Implementation Checklist

### Complaints Feature (Example)
- [ ] Create complaintService.ts
- [ ] Create useComplaints hook
- [ ] Create ComplaintsScreen
- [ ] Add to navigation
- [ ] Add Firestore collection
- [ ] Add security rules
- [ ] Test create complaint
- [ ] Test list complaints
- [ ] Test update status
- [ ] Test delete complaint

### Messages Feature (Example)
- [ ] Create messageService.ts
- [ ] Create useMessages hook
- [ ] Create MessagesScreen
- [ ] Create MessageDetailScreen
- [ ] Add to navigation
- [ ] Add Firestore collection
- [ ] Add real-time listeners
- [ ] Test send message
- [ ] Test receive message
- [ ] Test message notifications

### Notifications Feature (Example)
- [ ] Install Firebase Cloud Messaging
- [ ] Create notificationService.ts
- [ ] Request user permissions
- [ ] Handle notification permissions
- [ ] Store FCM tokens
- [ ] Test send notification
- [ ] Test receive notification
- [ ] Configure notification handling
- [ ] Test background notifications
- [ ] Test silent notifications

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] No console errors
- [ ] Performance optimized
- [ ] Security validated
- [ ] Documentation complete
- [ ] Environment variables set
- [ ] Firebase rules deployed

### Deployment Steps
1. [ ] Create release branch
2. [ ] Update version numbers
3. [ ] Build release binaries
4. [ ] Test on staging environment
5. [ ] Get approval for release
6. [ ] Deploy to app stores
7. [ ] Monitor for issues
8. [ ] Document release notes

### Post-Deployment
- [ ] Monitor app stability
- [ ] Check error rates
- [ ] Review user feedback
- [ ] Monitor analytics
- [ ] Update documentation
- [ ] Close release tickets

## Ongoing Development

### Weekly Tasks
- [ ] Review Firebase logs
- [ ] Check error monitoring
- [ ] Update dependencies if needed
- [ ] Review code quality
- [ ] Plan upcoming features

### Monthly Tasks
- [ ] Update README with latest features
- [ ] Review and optimize database
- [ ] Check Firebase costs
- [ ] Plan performance improvements
- [ ] User feedback review

### Quarterly Tasks
- [ ] Major version planning
- [ ] Architecture review
- [ ] Security audit
- [ ] Performance benchmarking
- [ ] User research

---

## Quick Reference

### Useful Commands
```bash
# Development
npm start                  # Start Metro bundler
npm run ios               # Run on iOS
npm run android           # Run on Android
npm run lint              # Lint code
npm run format            # Format code
npm test                  # Run tests

# Building
npm run bundle-ios        # Build iOS bundle
npm run bundle-android    # Build Android APK

# Debugging
npm start -- --reset-cache # Reset Metro cache
watchman watch-del-all    # Reset Watchman
```

### Key Files to Update
- `src/services/firebaseConfig.ts` - Firebase credentials
- `app.json` - App version and metadata
- `.env` - Environment variables
- `firestore.rules` - Database security rules

### Important URLs
- Firebase Console: https://console.firebase.google.com
- Google Play Console: https://play.google.com/console
- Apple App Store Connect: https://appstoreconnect.apple.com

---

**Status**: Ready for Development  
**Last Updated**: 2024  
**Maintained By**: Your Team
