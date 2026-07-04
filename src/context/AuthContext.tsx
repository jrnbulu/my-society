/**
 * Authentication Context
 * 
 * Manages global authentication state and provides auth methods
 * to the entire application through React Context.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signOutUser } from '../services/authService';
import { getUserProfile, UserProfile } from '../services/userService';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Wraps the app to provide authentication state to all child components
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Monitor authentication state changes
  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = onAuthStateChange(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        try {
          // Fetch user profile from Firestore
          const profile = await getUserProfile(authUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  /**
   * Refresh user profile from Firestore
   */
  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * 
 * @returns AuthContextType
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
