/**
 * Application Constants
 * 
 * Centralized constants used throughout the application
 */

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin' as const,
  OWNER: 'owner' as const,
  TENANT: 'tenant' as const,
};

// Screen Names
export const SCREEN_NAMES = {
  // Auth Screens
  SPLASH: 'Splash' as const,
  LOGIN: 'Login' as const,
  OTP_VERIFICATION: 'OTPVerification' as const,
  
  // App Screens
  DASHBOARD: 'Dashboard' as const,
  PROFILE: 'Profile' as const,
  SETTINGS: 'Settings' as const,
  SOCIETY_DETAILS: 'SocietyDetails' as const,
  OWNERS_LIST: 'OwnersList' as const,
  TENANTS_LIST: 'TenantsList' as const,
};

// Navigation Stacks
export const STACK_NAMES = {
  AUTH_STACK: 'AuthStack' as const,
  APP_STACK: 'AppStack' as const,
  DASHBOARD_STACK: 'DashboardStack' as const,
  PROFILE_STACK: 'ProfileStack' as const,
};

// Tab Names
export const TAB_NAMES = {
  OWNERS: 'Owners' as const,
  TENANTS: 'Tenants' as const,
  SOCIETY: 'Society' as const,
};

// Colors
export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#5AC8FA',
  SUCCESS: '#34C759',
  DANGER: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#50B7FF',
  
  // Grayscale
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GRAY_DARK: '#333333',
  GRAY: '#999999',
  GRAY_LIGHT: '#CCCCCC',
  GRAY_LIGHTER: '#F5F5F5',
  
  // Semantic
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  TEXT_DISABLED: '#D1D5DB',
  BACKGROUND: '#FFFFFF',
  BORDER: '#E5E7EB',
};

// Typography
export const TYPOGRAPHY = {
  TITLE_LARGE: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  TITLE_MEDIUM: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  TITLE_SMALL: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  BODY_LARGE: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  BODY_MEDIUM: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  BODY_SMALL: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  LABEL_LARGE: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  LABEL_MEDIUM: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
};

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 24,
  XXL: 32,
};

// Border Radius
export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  FULL: 9999,
};

// API Endpoints (if using REST API)
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.yourdomain.com',
  AUTH: '/auth',
  USERS: '/users',
  SOCIETIES: '/societies',
  OWNERS: '/owners',
  TENANTS: '/tenants',
};

// Firebase Collections
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  SOCIETIES: 'societies',
  OWNERS: 'owners',
  TENANTS: 'tenants',
  MESSAGES: 'messages',
  COMPLAINTS: 'complaints',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  SOCIETY_ID: 'society_id',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_EMAIL: 'Invalid email address.',
  INVALID_PHONE: 'Invalid phone number.',
  INVALID_OTP: 'Invalid OTP code.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  USER_NOT_FOUND: 'User not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  OTP_SENT: 'OTP sent successfully.',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  OTP_LENGTH: 6,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
};

// Time Intervals (in milliseconds)
export const TIME_INTERVALS = {
  SPLASH_TIMEOUT: 2000,
  OTP_EXPIRY: 600000, // 10 minutes
  TOAST_DURATION: 2000,
  API_TIMEOUT: 30000, // 30 seconds
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
};
