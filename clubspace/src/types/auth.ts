// Authentication related TypeScript types

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  status: 'active' | 'inactive' | 'suspended';
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    eventReminders: boolean;
    chatMessages: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'clubs_only' | 'private';
    showEmail: boolean;
  };
  language: 'ko' | 'en';
  theme: 'light' | 'dark' | 'system';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  displayName: string;
  confirmPassword: string;
}

export interface PasswordResetData {
  email: string;
}

export interface AuthError {
  code: string;
  message: string;
}

// Firebase User to App User conversion
export interface FirebaseUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Auth action types for better type safety
export type AuthAction = 
  | 'SIGN_IN'
  | 'SIGN_UP'
  | 'SIGN_OUT'
  | 'GOOGLE_SIGN_IN'
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFICATION';

// Auth method types
export type AuthMethod = 'email' | 'google' | 'guest';

// Route protection types
export interface RouteProtection {
  requireAuth: boolean;
  requireEmailVerification: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

// Auth context props
export interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  clearError: () => void;
}