# MySociety - Architecture Overview

## Project Architecture

```
REACT NATIVE APPLICATION (iOS & Android)
│
├── 📱 UI Layer (Components)
│   ├── Button, TextInput, Carousel, Tabs, NavigationDrawer
│   └── Reusable, themeable, composable components
│
├── 🎬 Screen Layer (Screens)
│   ├── SplashScreen (2 sec initial load)
│   ├── LoginScreen (Email/Phone OTP)
│   ├── OTPVerificationScreen
│   ├── DashboardScreen (with drawer & tabs)
│   ├── ProfileScreen
│   └── SettingsScreen
│
├── 🧭 Navigation Layer
│   ├── RootNavigator (Auth state based)
│   ├── AuthStack (Login → OTP → Dashboard)
│   ├── AppStack (Drawer + Main screens)
│   └── Role-based routing logic
│
├── 🔐 Authentication Layer
│   ├── Firebase Auth Service
│   ├── OTP Handlers (Email & Phone)
│   ├── Auth Context Provider
│   └── Token Management
│
├── 📦 Business Logic Layer
│   ├── User Service (profiles, roles)
│   ├── Complaint Service (optional)
│   ├── Message Service (optional)
│   └── Custom Hooks
│
├── 💾 Data Layer
│   ├── Firebase Firestore Database
│   ├── Collections:
│   │   ├── users
│   │   ├── societies
│   │   ├── owners
│   │   ├── tenants
│   │   ├── messages (optional)
│   │   └── complaints (optional)
│   └── Firestore Security Rules
│
├── ⚙️ Configuration Layer
│   ├── Constants (colors, typography, spacing)
│   ├── Firebase Config
│   ├── API Endpoints
│   └── Validation Rules
│
└── 🛠️ Utility Layer
    ├── Helpers (validation, formatting)
    ├── Error handlers
    ├── Custom hooks
    └── Storage utilities
```

## Data Flow Architecture

```
User Action
    ↓
Component/Screen
    ↓
Custom Hook (useAuth, useForm, useComplaints)
    ↓
Service Layer (authService, userService, etc.)
    ↓
Firebase/Firestore
    ↓
Response
    ↓
Context/State Update
    ↓
UI Re-render
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                    │
└─────────────────────────────────────────────────────────┘

1. App Startup
   └─→ RootNavigator checks auth state via AuthContext
       ├─ If authenticated → Show AppNavigator
       └─ If not → Show AuthNavigator

2. Login Screen
   ├─ User selects: Email (Gmail) or Phone
   ├─ Email: sendEmailOTP() → Firebase sends verification link
   └─ Phone: sendPhoneOTP() → Firebase sends 6-digit OTP

3. OTP Verification Screen
   ├─ User enters OTP code
   ├─ verifyPhoneOTP() or verifyEmailOTP()
   └─ Firebase validates and signs in user

4. Dashboard
   └─ Auth state changes → Navigation redirects to AppNavigator
       ├─ Drawer menu displays user info
       ├─ Role determines visible options
       └─ User can logout

5. Session Management
   ├─ getCurrentUser() for current session
   ├─ getAuthToken() for API calls
   └─ onAuthStateChange() listens for auth changes
```

## Component Hierarchy

```
App
├── AuthProvider
│   └── RootNavigator
│       ├── AuthStack (when not authenticated)
│       │   ├── LoginScreen
│       │   └── OTPVerificationScreen
│       │
│       └── AppStack (when authenticated)
│           └── Drawer.Navigator
│               ├── NavigationDrawer (left sidebar)
│               └── DashboardStack
│                   ├── DashboardScreen
│                   │   ├── Carousel
│                   │   │   └── CarouselItems
│                   │   └── Tabs
│                   │       ├── OwnersTab (FlatList of users)
│                   │       ├── TenantsTab (FlatList of users)
│                   │       └── SocietyTab (SocietyDetails)
│                   ├── ProfileScreen
│                   │   ├── TextInputField
│                   │   └── Button
│                   └── SettingsScreen
│                       ├── Switch components
│                       └── Button components
```

## State Management

### AuthContext (Global Auth State)
```typescript
{
  user: User | null              // Firebase User object
  userProfile: UserProfile | null // User data from Firestore
  isLoading: boolean              // Loading state
  isAuthenticated: boolean        // Auth status
  logout: () => Promise<void>     // Logout function
  refreshUserProfile: () => Promise<void> // Refresh user data
}
```

### Component Local State (useForm Hook)
```typescript
{
  values: Record<string, any>    // Form field values
  errors: Record<string, string> // Field errors
  touched: Record<string, boolean> // Touched fields
  handleChange: (name, value) => void
  handleBlur: (name) => void
  setFieldError: (name, error) => void
  setFieldValue: (name, value) => void
  resetForm: () => void
}
```

## Role-Based Access Control

```
┌──────────────────────────────────────────────────────────┐
│             ROLE-BASED DASHBOARD ACCESS                 │
└──────────────────────────────────────────────────────────┘

ADMIN
├─ View all users (owners & tenants)
├─ View all societies
├─ Manage society details
├─ Access admin settings
├─ View reports and analytics
└─ Full system access

OWNER
├─ View property information
├─ View tenants in property
├─ Pay maintenance charges
├─ Submit complaints
├─ View society details
└─ Access personal settings

TENANT
├─ View society details
├─ View other members
├─ Submit complaints
├─ Pay rent/deposits
├─ Access announcements
└─ Access personal profile

Each role gets specific screens and menu options
```

## API Integration Points

### Firebase Authentication
```typescript
- sendPhoneOTP(phoneNumber)
- sendEmailOTP(email)
- verifyPhoneOTP(confirmationResult, code)
- verifyEmailOTP(email, link)
- getCurrentUser()
- signOutUser()
```

### Firebase Firestore (Database)
```typescript
- getUserProfile(uid)
- updateUserProfile(uid, updates)
- getUsersBySociety(societyId)
- getOwnersBySociety(societyId)
- getTenantsBySociety(societyId)
- getSocietyDetails(societyId)
```

## Error Handling Architecture

```
┌─────────────────────────────────────┐
│         ERROR HANDLING FLOW         │
└─────────────────────────────────────┘

1. Error Occurs
   ↓
2. Catch block in service/hook
   ↓
3. Error classification
   ├─ Network Error
   ├─ Authentication Error
   ├─ Validation Error
   ├─ Firebase Error
   └─ Unknown Error
   ↓
4. Transform to user-friendly message
   ├─ Use ERROR_MESSAGES constants
   └─ Provide actionable guidance
   ↓
5. Display to user
   ├─ Toast notification
   ├─ Alert dialog
   ├─ In-form error
   └─ Error screen
```

## Performance Considerations

### Code Splitting
- Lazy load screens when possible
- Use React.memo for expensive components
- Implement pagination for long lists

### State Management
- Use minimal, focused state
- Memoize expensive computations
- Clean up subscriptions in useEffect

### Network
- Implement request caching
- Use pagination for data fetching
- Debounce search inputs
- Handle offline scenarios

### Rendering
- FlatList with virtualization
- Optimize images
- Use CSS containment
- Avoid inline function creation

## Security

### Firestore Security Rules
```
- Authentication checks
- Role-based access
- Field-level permissions
- Data validation
- User isolation
```

### Firebase Authentication
```
- OTP verification (6-digit)
- No password storage
- Secure token management
- Session handling
```

### Best Practices
```
- Never commit Firebase credentials
- Use environment variables
- Validate on client and server
- Sanitize user inputs
- Implement rate limiting
```

## Deployment Architecture

```
Development Environment
        ↓
    Git Push
        ↓
    GitHub Repository
        ↓
    CI/CD Pipeline (optional)
        ├─ Run tests
        ├─ Build APK (Android)
        ├─ Build IPA (iOS)
        └─ Deploy
```

## Scalability Considerations

### Can easily scale to support:
- Multiple societies
- Thousands of users
- Complex role hierarchies
- Real-time updates (with Firestore listeners)
- Multiple languages
- Different themes/branding

### Suggested optimizations:
- Implement Firestore pagination
- Use Cloud Functions for complex logic
- Add caching layer
- Implement data syncing
- Monitor with Firebase Analytics

## Directory Structure

```
my-society/
│
├── src/
│   ├── components/          # UI components (reusable)
│   ├── screens/             # Screen components
│   ├── navigation/          # Navigation configuration
│   ├── services/            # Business logic & APIs
│   ├── context/             # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── constants/           # App-wide constants
│   ├── utils/               # Utility functions
│   └── index.ts             # Main exports
│
├── android/                 # Android native code
├── ios/                     # iOS native code
│
├── Configuration files
├── Documentation files
└── Package files
```

## Development Workflow

```
1. Feature Development
   └─ Create feature branch
   └─ Implement feature (following existing patterns)
   └─ Add tests if applicable
   └─ Format code with prettier
   └─ Lint with eslint

2. Testing
   └─ Manual testing on iOS simulator
   └─ Manual testing on Android emulator
   └─ Physical device testing
   └─ Run unit tests

3. Code Review
   └─ Submit pull request
   └─ Address review comments
   └─ Merge to main

4. Deployment
   └─ Build for iOS/Android
   └─ Test on store environments
   └─ Submit to app stores
```

---

This architecture is designed to be:
- ✅ Scalable - Easy to add new features
- ✅ Maintainable - Clean code and structure
- ✅ Testable - Modular components and services
- ✅ Extensible - Plugin-style additions
- ✅ Secure - Built-in security patterns
