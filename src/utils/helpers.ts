/**
 * Utility Functions
 * 
 * Common utility functions used throughout the application
 */

import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants';

/**
 * Validate email address
 * 
 * @param email - Email to validate
 * @returns boolean
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

/**
 * Validate phone number
 * 
 * @param phoneNumber - Phone number to validate
 * @returns boolean
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  return VALIDATION_RULES.PHONE_REGEX.test(phoneNumber);
};

/**
 * Validate OTP code
 * 
 * @param otp - OTP code
 * @returns boolean
 */
export const validateOTP = (otp: string): boolean => {
  return otp.length === VALIDATION_RULES.OTP_LENGTH && /^\d+$/.test(otp);
};

/**
 * Format phone number to standard format
 * 
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as +91 XXXXX XXXXX for Indian numbers
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return phoneNumber;
};

/**
 * Format date to readable string
 * 
 * @param date - Date object or timestamp
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time to HH:MM format
 * 
 * @param date - Date object
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Check if email is Gmail
 * 
 * @param email - Email address
 * @returns boolean
 */
export const isGmailAddress = (email: string): boolean => {
  return email.toLowerCase().endsWith('@gmail.com');
};

/**
 * Get user role label
 * 
 * @param role - User role
 * @returns Role label
 */
export const getRoleLabel = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    admin: 'Administrator',
    owner: 'Owner',
    tenant: 'Tenant',
  };
  return roleMap[role.toLowerCase()] || role;
};

/**
 * Get error message
 * 
 * @param errorCode - Error code or message
 * @returns Error message
 */
export const getErrorMessage = (errorCode: string): string => {
  const errorMap: { [key: string]: string } = {
    'auth/invalid-email': ERROR_MESSAGES.INVALID_EMAIL,
    'auth/user-not-found': ERROR_MESSAGES.USER_NOT_FOUND,
    'auth/invalid-phone-number': ERROR_MESSAGES.INVALID_PHONE,
    'auth/session-expired': ERROR_MESSAGES.OTP_EXPIRED,
    network: ERROR_MESSAGES.NETWORK_ERROR,
  };
  
  return errorMap[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Debounce function
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 * 
 * @param func - Function to throttle
 * @param limit - Limit time in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Get initials from name
 * 
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Check if object is empty
 * 
 * @param obj - Object to check
 * @returns boolean
 */
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim() === '';
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Deep clone object
 * 
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Get string between two characters
 * 
 * @param str - String to search
 * @param start - Start character
 * @param end - End character
 * @returns Substring between start and end
 */
export const getStringBetween = (
  str: string,
  start: string,
  end: string
): string => {
  const startIndex = str.indexOf(start);
  const endIndex = str.indexOf(end);
  
  if (startIndex === -1 || endIndex === -1) return '';
  
  return str.substring(startIndex + start.length, endIndex);
};
