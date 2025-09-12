// Custom hook for authentication state and actions
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Custom hook for accessing authentication state and actions
 * Provides a clean interface for components to interact with auth
 */
export const useAuth = () => {
  const {
    // State
    user,
    isLoading,
    isAuthenticated,
    error,
    isInitialized,
    
    // Actions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    resendEmailVerification,
    deleteAccount,
    updateProfile,
    refreshUserProfile,
    
    // State management
    clearError,
    initialize,
    cleanup,
  } = useAuthStore();

  // Initialize auth listener on mount
  useEffect(() => {
    // Only initialize if not already initialized
    if (!isInitialized) {
      initialize();
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [isInitialized, initialize, cleanup]);

  // Derived state for convenience
  const isEmailVerified = user?.emailVerified ?? false;
  const hasError = !!error;
  const isReady = isInitialized && !isLoading;

  return {
    // User state
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    isReady,
    error,
    hasError,
    isEmailVerified,
    
    // Authentication actions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    resendEmailVerification,
    deleteAccount,
    
    // Profile actions
    updateProfile,
    refreshUserProfile,
    
    // Utility actions
    clearError,
    
    // Convenience methods
    requireAuth: () => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }
    },
    
    requireEmailVerification: () => {
      if (!isEmailVerified) {
        throw new Error('Email verification required');
      }
    },
    
    // User role/permission helpers (can be extended)
    hasRole: (_role: string) => {
      // For now, just check if user exists
      // This can be extended when role system is implemented
      return isAuthenticated;
    },
    
    // Quick user info accessors
    userDisplayName: user?.displayName || 'Unknown User',
    userEmail: user?.email || '',
    userPhotoURL: user?.photoURL,
    
    // Status checks
    isActive: user?.status === 'active',
    needsEmailVerification: isAuthenticated && !isEmailVerified,
  };
};

/**
 * Hook for getting just the user state (lighter version)
 */
export const useUser = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
  };
};

/**
 * Hook for getting authentication status only
 */
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
  
  return {
    isAuthenticated,
    isLoading,
    isReady: isInitialized && !isLoading,
  };
};