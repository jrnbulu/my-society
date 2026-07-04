/**
 * Firebase Configuration File
 * 
 * This file contains Firebase project configuration and initialization.
 * Replace the credentials with your actual Firebase project credentials.
 * 
 * Get these from Firebase Console:
 * https://console.firebase.google.com/
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase project configuration
// IMPORTANT: Replace these with your actual Firebase credentials
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore Database
const firestore = getFirestore(app);

// (Optional) Connect to emulators for local development
// Uncomment the lines below if you're using Firebase Emulator Suite
/*
connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
connectFirestoreEmulator(firestore, 'localhost', 8080);
*/

export { app, auth, firestore };
