/**
 * Services Index
 * 
 * Central export point for all services
 */

export { app, auth, firestore } from './firebaseConfig';
export {
  sendPhoneOTP,
  sendEmailOTP,
  verifyEmailOTP,
  verifyPhoneOTP,
  getCurrentUser,
  getCurrentUserAsync,
  getAuthToken,
  signOutUser,
  onAuthStateChange,
} from './authService';

export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getUsersBySociety,
  getOwnersBySociety,
  getTenantsBySociety,
  getSocietyDetails,
  createSocietyDetails,
  type UserProfile,
  type UserRole,
  type SocietyDetails,
} from './userService';
