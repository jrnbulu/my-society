/**
 * User Service
 * 
 * Handles user profile management and role-based operations.
 * Fetches user data from Firestore and manages user roles.
 */

import { firestore } from './firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

export type UserRole = 'admin' | 'owner' | 'tenant';

export interface UserProfile {
  uid: string;
  email: string;
  phoneNumber?: string;
  name: string;
  role: UserRole;
  societyId: string;
  profilePicture?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface SocietyDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  secretary: string;
  secretaryPhone: string;
  secretaryEmail: string;
  president: string;
  presidentPhone: string;
  presidentEmail: string;
  treasurer?: string;
  totalUnits: number;
  createdAt: Timestamp;
}

/**
 * Create or update user profile in Firestore
 * 
 * @param uid - User ID
 * @param profile - User profile data
 * @returns Promise<void>
 */
export const createUserProfile = async (
  uid: string,
  profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>
): Promise<void> => {
  try {
    const now = Timestamp.now();
    await setDoc(doc(firestore, 'users', uid), {
      ...profile,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`User profile created for ${uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile by UID
 * 
 * @param uid - User ID
 * @returns Promise<UserProfile | null>
 */
export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const docRef = doc(firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * 
 * @param uid - User ID
 * @param updates - Partial profile data to update
 * @returns Promise<void>
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const docRef = doc(firestore, 'users', uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    console.log(`User profile updated for ${uid}`);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get all users by society ID
 * 
 * @param societyId - Society ID
 * @returns Promise<UserProfile[]>
 */
export const getUsersBySociety = async (
  societyId: string
): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(firestore, 'users'),
      where('societyId', '==', societyId)
    );
    const querySnapshot = await getDocs(q);
    
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get owners by society ID
 * 
 * @param societyId - Society ID
 * @returns Promise<UserProfile[]>
 */
export const getOwnersBySociety = async (
  societyId: string
): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(firestore, 'users'),
      where('societyId', '==', societyId),
      where('role', '==', 'owner')
    );
    const querySnapshot = await getDocs(q);
    
    const owners: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      owners.push(doc.data() as UserProfile);
    });
    
    return owners;
  } catch (error) {
    console.error('Error fetching owners:', error);
    throw error;
  }
};

/**
 * Get tenants by society ID
 * 
 * @param societyId - Society ID
 * @returns Promise<UserProfile[]>
 */
export const getTenantsBySociety = async (
  societyId: string
): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(firestore, 'users'),
      where('societyId', '==', societyId),
      where('role', '==', 'tenant')
    );
    const querySnapshot = await getDocs(q);
    
    const tenants: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      tenants.push(doc.data() as UserProfile);
    });
    
    return tenants;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
};

/**
 * Get society details by ID
 * 
 * @param societyId - Society ID
 * @returns Promise<SocietyDetails | null>
 */
export const getSocietyDetails = async (
  societyId: string
): Promise<SocietyDetails | null> => {
  try {
    const docRef = doc(firestore, 'societies', societyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SocietyDetails;
    }
    return null;
  } catch (error) {
    console.error('Error fetching society details:', error);
    throw error;
  }
};

/**
 * Create society details
 * 
 * @param societyId - Society ID
 * @param details - Society details
 * @returns Promise<void>
 */
export const createSocietyDetails = async (
  societyId: string,
  details: Omit<SocietyDetails, 'id' | 'createdAt'>
): Promise<void> => {
  try {
    await setDoc(doc(firestore, 'societies', societyId), {
      id: societyId,
      ...details,
      createdAt: Timestamp.now(),
    });
    console.log(`Society details created for ${societyId}`);
  } catch (error) {
    console.error('Error creating society details:', error);
    throw error;
  }
};
