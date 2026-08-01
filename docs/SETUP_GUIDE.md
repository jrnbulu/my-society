# My Society App – Complete Setup & Deployment Guide

## Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- A Google account

---

## Step 1: Firebase Project Setup

### 1.1 Create Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → Enter name (e.g. `my-society`)
3. Enable Google Analytics (optional)
4. Click **Create project**

### 1.2 Enable Authentication (Phone OTP)

1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Phone**
3. Add your domain to **Authorized domains** (e.g. `my-society.web.app`)
4. For development, add `localhost`

### 1.3 Enable Firestore

1. Firebase Console → **Firestore Database** → **Create database**
2. Select **Production mode** (rules are defined in `firestore.rules`)
3. Choose region: **asia-south1 (Mumbai)**

### 1.4 Enable Cloud Functions

1. Firebase Console → **Functions** → **Get started**
2. Upgrade to **Blaze plan** (required for external HTTP calls from Functions)

### 1.5 Enable Firebase Hosting

1. Firebase Console → **Hosting** → **Get started**
2. Follow the CLI setup steps below

### 1.6 Enable Cloud Messaging (FCM)

1. Firebase Console → **Project Settings** → **Cloud Messaging**
2. Note your **Server key** and **Sender ID**
3. Under **Web configuration**, generate a **Web Push certificate** (VAPID key)
4. Save the VAPID key for `VITE_FIREBASE_VAPID_KEY`

---

## Step 2: Get Firebase Config

1. Firebase Console → **Project Settings** → **Your apps**
2. Click **Add app** → **Web** → Register app
3. Copy the `firebaseConfig` object
4. Use these values in your `.env` file (see Step 3)

---

## Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=my-society.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-society
VITE_FIREBASE_STORAGE_BUCKET=my-society.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_VAPID_KEY=BL...your_vapid_key...
VITE_UPI_VPA=society@upi
```

---

## Step 4: Update FCM Service Worker

Edit `public/firebase-messaging-sw.js` – replace the config values with your actual Firebase config:

```js
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "my-society.firebaseapp.com",
  projectId: "my-society",
  storageBucket: "my-society.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
});
```

---

## Step 5: Firebase CLI Login & Init

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Set project
firebase use --add
# Select your project → alias: default

# Or edit .firebaserc manually
```

---

## Step 6: Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Step 7: Configure Cloud Functions

### 7.1 Set Function Environment Variables

```bash
# MSG91 for SMS
firebase functions:secrets:set MSG91_API_KEY

# SendGrid for Email (optional)
firebase functions:secrets:set SENDGRID_API_KEY
```

### 7.2 Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

### 7.3 Deploy Functions

```bash
firebase deploy --only functions
```

---

## Step 8: Build & Deploy React App

```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## Step 9: Initial Data Seeding

After deploying, create the first admin user:

### 9.1 Login with your phone number

Open the app → enter your phone → verify OTP.

### 9.2 Manually set admin role in Firestore

Firebase Console → Firestore → `users` collection → find your UID document → Edit:

```json
{
  "role": "admin",
  "societyId": "YOUR_SOCIETY_ID"
}
```

### 9.3 Create Society document

Firestore → `societies` collection → Add document:

```json
{
  "name": "Sunrise Heights",
  "address": "Plot 12, Sector 5, Pune",
  "monthlyMaintenance": 2500,
  "electricityRate": 5.45,
  "waterRatePerKL": 8
}
```
Copy the document ID → set as `societyId` in your user document.

### 9.4 Create Flat documents

Firestore → `flats` collection → Add documents for each flat:

```json
{
  "societyId": "YOUR_SOCIETY_ID",
  "flatNumber": "A-101",
  "floor": 1,
  "wing": "A",
  "area": 850,
  "status": "occupied"
}
```

### 9.5 Create Parking Slots

Firestore → `parkingSlots` → Add documents:

```json
{
  "societyId": "YOUR_SOCIETY_ID",
  "slotNumber": "P-01",
  "type": "car",
  "status": "available"
}
```

---

## Step 10: SendGrid Email Setup (Optional)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key (Mail Send permission)
3. Set in Cloud Functions: `firebase functions:secrets:set SENDGRID_API_KEY`
4. Verify your sender email in SendGrid
5. Update `functions/src/index.js` to import and use `@sendgrid/mail`

---

## Step 11: MSG91 SMS Setup

1. Sign up at [msg91.com](https://msg91.com)
2. Get API key from dashboard
3. Set: `firebase functions:secrets:set MSG91_API_KEY`
4. Configure sender ID `MYSOC` in MSG91 dashboard
5. Get DLT template registration (required in India for transactional SMS)

---

## Local Development

```bash
# Start React dev server
npm run dev

# Start Firebase emulators (separate terminal)
firebase emulators:start

# Emulator UI: http://localhost:4000
# Firestore: http://localhost:8080
# Auth: http://localhost:9099
# Functions: http://localhost:5001
```

---

## Deployment Commands Summary

```bash
# Full deploy
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# View deployed functions
firebase functions:list
```

---

## Performance Optimizations

1. **Browser caching**: Static data (society info, flats list) cached in memory (`AppContext`) with 5-minute TTL
2. **Session storage**: User profile cached in `sessionStorage` to avoid Firestore read on page refresh
3. **Firestore indexes**: All composite queries have matching indexes in `firestore.indexes.json`
4. **Firebase Hosting CDN**: JS/CSS assets are immutably cached with 1-year max-age
5. **Code splitting**: Vite automatically code-splits by route

---

## Security Checklist

- [x] Firestore security rules deny all unauthenticated access
- [x] Bills/payments scoped to flat owner/tenant only
- [x] Admin-only routes (expenses, salaries, users) protected at router AND Firestore rule level
- [x] FCM tokens stored per-user, not globally broadcast
- [x] UPI VPA not hardcoded (env variable)
- [x] No secrets in frontend code
- [x] Cloud Functions use Firebase Secrets Manager for API keys
