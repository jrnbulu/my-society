# My Society App – Complete Firebase Setup & Firestore Seed Guide

## Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- A Google account
- A Firebase project with billing enabled if you plan to deploy Cloud Functions

---

## Step 1: Create and Configure Firebase Project

### 1.1 Create the project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Enter a project name such as `my-society`
4. Enable Google Analytics if you need it
5. Click **Create project**

### 1.2 Register the web app

1. Open **Project settings**
2. In **Your apps**, click **Add app** → **Web**
3. Register the app
4. Copy the generated Firebase config for Step 4

### 1.3 Enable Authentication

1. Open **Authentication** → **Sign-in method**
2. Enable **Phone**
3. Add `localhost` to **Authorized domains** for development
4. Add your production domain later after hosting is deployed

### 1.4 Enable Firestore

1. Open **Firestore Database** → **Create database**
2. Select **Production mode**
3. Choose your preferred region
4. Finish the setup

### 1.5 Enable Storage

1. Open **Storage** → **Get started**
2. Choose the same region as Firestore if possible
3. Complete the default setup

### 1.6 Enable Cloud Functions

1. Open **Functions** → **Get started**
2. Upgrade to the **Blaze** plan if you need deployed functions

### 1.7 Enable Cloud Messaging

1. Open **Project settings** → **Cloud Messaging**
2. Note the **Sender ID**
3. Generate a **Web Push certificate**
4. Save the VAPID key for `VITE_FIREBASE_VAPID_KEY`

---

## Step 2: Install Dependencies

```bash
cd /home/runner/work/my-society/my-society
npm install
cd functions
npm install
cd ..
```

---

## Step 3: Login to Firebase CLI

```bash
firebase login
cd /home/runner/work/my-society/my-society
firebase use --add
```

When prompted:

1. Select the Firebase project you created
2. Save it with the alias `default`

---

## Step 4: Configure Frontend Environment Variables

```bash
cd /home/runner/work/my-society/my-society
cp .env.example .env
```

Edit `.env` with your Firebase app config:

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

## Step 5: Update the FCM Service Worker

Edit `public/firebase-messaging-sw.js` and replace the placeholder Firebase config values with your real project values.

---

## Step 6: Configure Admin Credentials for the Seed Script

The Firestore seed script uses `firebase-admin` with `applicationDefault()` credentials.

### Option A: Use application default login

```bash
gcloud auth application-default login
```

### Option B: Use a service account JSON file

1. Open **Project settings** → **Service accounts**
2. Click **Generate new private key**
3. Save the JSON file outside this repository
4. Export the path before running the script:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"
```

---

## Step 7: Deploy Firestore Rules and Indexes

```bash
cd /home/runner/work/my-society/my-society
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Step 8: Seed Firestore Collections

The seed script is located at:

`/home/runner/work/my-society/my-society/functions/scripts/seed-firestore.js`

Run it with:

```bash
cd /home/runner/work/my-society/my-society/functions
npm run seed:firestore
```

This creates sample data in these collections:

- `users`
- `flats`
- `bills`
- `payments`
- `utilities`
- `expenses`
- `salaries`
- `meetings`

Sample seeded records include:

- `admin1`, `owner1`, `tenant1`, `caretaker1`
- `flat_101`
- `bill_2026_04_flat_101`
- `payment_001`
- utility, expense, salary, and meeting sample documents

---

## Step 9: Verify Seeded Firestore Data

1. Open **Firestore Database** in Firebase Console
2. Confirm the collections listed above were created
3. Open `users/admin1` and confirm `role` is `ADMIN`
4. Open `bills/bill_2026_04_flat_101` and confirm `paymentIds` contains `payment_001`

---

## Step 10: Deploy Cloud Functions

### 10.1 Set function secrets if needed

```bash
firebase functions:secrets:set MSG91_API_KEY
firebase functions:secrets:set SENDGRID_API_KEY
```

### 10.2 Deploy functions

```bash
cd /home/runner/work/my-society/my-society
firebase deploy --only functions
```

---

## Step 11: Build and Deploy the React App

```bash
cd /home/runner/work/my-society/my-society
npm run build
firebase deploy --only hosting
```

Your app will be live at:

`https://YOUR_PROJECT_ID.web.app`

---

## Step 12: Example Minimal Firestore Rules

If you want a minimal user-and-bills rule setup like the example schema, use:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    match /bills/{billId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ADMIN";
    }
  }
}
```

Deploy the rules after updating `firestore.rules`:

```bash
cd /home/runner/work/my-society/my-society
firebase deploy --only firestore:rules
```

---

## Local Development

```bash
cd /home/runner/work/my-society/my-society
npm run dev
```

In another terminal:

```bash
cd /home/runner/work/my-society/my-society
firebase emulators:start
```

---

## Deployment Commands Summary

```bash
cd /home/runner/work/my-society/my-society
firebase deploy
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## Important Notes

- Keep service-account JSON files outside the repository
- Do not commit real API keys, device tokens, or production user data
- Re-run the seed script whenever you need the same sample collection structure in a new Firebase project
