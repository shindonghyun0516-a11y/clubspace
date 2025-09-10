// User profile management service for Firestore integration
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { User, UserPreferences } from '@/types/auth';

// Default user preferences
const defaultPreferences: UserPreferences = {
  notifications: {
    email: true,
    push: true,
    eventReminders: true,
    chatMessages: true,
  },
  privacy: {
    profileVisibility: 'clubs_only',
    showEmail: false,
  },
  language: 'ko',
  theme: 'system',
};

/**
 * Create a new user profile in Firestore
 */
export const createUserProfile = async (
  firebaseUser: FirebaseUser,
  additionalData?: Partial<User>
): Promise<User> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  
  const userData: Omit<User, 'createdAt' | 'lastLoginAt'> = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || 'Unknown User',
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    status: 'active',
    preferences: defaultPreferences,
    ...additionalData,
  };
  
  try {
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    
    // Return the created user data with current timestamps
    return {
      ...userData,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };
    
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      
      // Convert Firestore timestamps to Date objects
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (
  uid: string, 
  updates: Partial<Omit<User, 'uid' | 'createdAt' | 'lastLoginAt'>>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
};

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw error for non-critical operation
  }
};

/**
 * Update Firebase Auth profile (display name, photo URL)
 */
export const updateFirebaseProfile = async (
  firebaseUser: FirebaseUser,
  updates: { displayName?: string; photoURL?: string }
): Promise<void> => {
  try {
    await updateProfile(firebaseUser, updates);
  } catch (error) {
    console.error('Error updating Firebase profile:', error);
    throw new Error('Failed to update profile');
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  uid: string,
  preferences: Partial<UserPreferences>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      preferences: preferences,
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update preferences');
  }
};

/**
 * Deactivate user account (soft delete)
 */
export const deactivateUser = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status: 'inactive',
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw new Error('Failed to deactivate user');
  }
};

/**
 * Delete user profile from Firestore (hard delete)
 */
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw new Error('Failed to delete user profile');
  }
};

/**
 * Check if user profile exists
 */
export const userProfileExists = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error('Error checking user profile existence:', error);
    return false;
  }
};

/**
 * Convert Firebase User to our User type
 */
export const convertFirebaseUser = (
  firebaseUser: FirebaseUser,
  additionalData?: Partial<User>
): Omit<User, 'createdAt' | 'lastLoginAt' | 'preferences'> => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    status: 'active',
    ...additionalData,
  };
};