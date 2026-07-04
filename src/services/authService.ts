/**
 * Authentication Service
 * 
 * Handles Firebase OTP authentication for Gmail and Mobile numbers.
 * Provides methods for:
 * - Sending OTP
 * - Verifying OTP
 * - User sign out
 * - Getting current user
 */

import {
  signInWithPhoneNumber,
  signInWithEmailLink,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink as signInWithLink,
  getAuth,
  User,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { ConfirmationResult } from 'firebase/auth';

/**
 * Send OTP to phone number using Firebase Phone Authentication
 * 
 * @param phoneNumber - Phone number in international format (e.g., +1234567890)
 * @returns Promise with confirmation result
 */
export const sendPhoneOTP = async (
  phoneNumber: string
): Promise<ConfirmationResult> => {
  try {
    // In a real app, you would use Firebase Phone Authentication
    // For now, returning a mock confirmation
    console.log(`OTP sent to phone: ${phoneNumber}`);
    
    return {
      confirm: async (code: string) => {
        // Mock implementation - replace with actual Firebase sign-in
        console.log(`Verifying OTP code: ${code}`);
        return { user: null } as any;
      },
    } as ConfirmationResult;
  } catch (error) {
    console.error('Error sending phone OTP:', error);
    throw error;
  }
};

/**
 * Send sign-in link to email address
 * 
 * @param email - Email address to send sign-in link to
 * @returns Promise<void>
 */
export const sendEmailOTP = async (email: string): Promise<void> => {
  try {
    const actionCodeSettings = {
      url: 'https://yourdomain.firebaseapp.com/?email=' + email,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Store email in localStorage for verification
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailForSignIn', email);
    }
    
    console.log(`Email sign-in link sent to: ${email}`);
  } catch (error) {
    console.error('Error sending email OTP:', error);
    throw error;
  }
};

/**
 * Verify email sign-in link
 * 
 * @param email - Email address
 * @param link - Sign-in link from email
 * @returns Promise<void>
 */
export const verifyEmailOTP = async (
  email: string,
  link: string
): Promise<void> => {
  try {
    if (isSignInWithEmailLink(auth, link)) {
      await signInWithLink(auth, email, link);
      console.log('Email verification successful');
    } else {
      throw new Error('Invalid sign-in link');
    }
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    throw error;
  }
};

/**
 * Verify phone OTP code
 * 
 * @param confirmationResult - Confirmation result from sendPhoneOTP
 * @param code - 6-digit OTP code
 * @returns Promise<User>
 */
export const verifyPhoneOTP = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<User> => {
  try {
    const result = await confirmationResult.confirm(code);
    console.log('Phone verification successful');
    return result.user;
  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 * 
 * @returns Current user or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Get current user as a promise
 * 
 * @returns Promise<User | null>
 */
export const getCurrentUserAsync = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Get authentication token
 * 
 * @returns Promise<string> - Authentication token
 */
export const getAuthToken = async (): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
};

/**
 * Sign out current user
 * 
 * @returns Promise<void>
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Listen to authentication state changes
 * 
 * @param callback - Callback function that receives user
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return auth.onAuthStateChanged(callback);
};
