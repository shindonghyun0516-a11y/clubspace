// Zustand store for authentication state management
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  createUserProfile, 
  getUserProfile, 
  updateLastLogin,
  userProfileExists,
  updateFirebaseProfile
} from '@/lib/auth/userService';
import { 
  validateSignUpData, 
  validateSignInData, 
  validatePasswordResetEmail 
} from '@/lib/auth/validation';
import { AuthState, AuthCredentials, SignUpData, User } from '@/types/auth';

interface AuthStore extends AuthState {
  // Core Actions
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // Profile Actions
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  
  // State Management
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setInitialized: (initialized: boolean) => void;
  
  // Initialization
  initialize: () => Promise<void>;
  
  // Cleanup
  cleanup: () => void;
}

// Auth error message mapping
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': '등록되지 않은 사용자입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
    'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
    'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/popup-closed-by-user': '로그인 창이 닫혔습니다.',
    'auth/cancelled-popup-request': '로그인이 취소되었습니다.',
    'auth/popup-blocked': '팝업이 차단되었습니다. 팝업을 허용해주세요.',
    'auth/operation-not-allowed': '이 로그인 방법이 허용되지 않습니다.',
    'auth/invalid-credential': '인증 정보가 올바르지 않습니다.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/user-token-expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
    'passwords-dont-match': '비밀번호가 일치하지 않습니다.',
  };
  
  return errorMessages[errorCode] || '알 수 없는 오류가 발생했습니다.';
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isLoading: true,
        isAuthenticated: false,
        error: null,
        isInitialized: false,

        // Sign in with email/password
        signIn: async (credentials: AuthCredentials) => {
          try {
            set({ isLoading: true, error: null });
            
            // Validate input
            const validation = validateSignInData(credentials.email, credentials.password);
            if (!validation.isValid) {
              throw new Error(validation.errors[0]);
            }
            
            const userCredential = await signInWithEmailAndPassword(
              auth,
              credentials.email,
              credentials.password
            );
            
            // Update last login timestamp
            await updateLastLogin(userCredential.user.uid);
            
            // User state will be updated via auth state listener
            
          } catch (error: any) {
            const errorMessage = error.code 
              ? getAuthErrorMessage(error.code)
              : error.message;
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Sign up with email/password
        signUp: async (data: SignUpData) => {
          try {
            set({ isLoading: true, error: null });
            
            // Validate input
            const validation = validateSignUpData(data);
            if (!validation.isValid) {
              throw new Error(validation.errors[0]);
            }
            
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              data.email,
              data.password
            );
            
            // Update display name in Firebase Auth
            await updateProfile(userCredential.user, {
              displayName: data.displayName
            });
            
            // Create user profile in Firestore
            await createUserProfile(userCredential.user, {
              displayName: data.displayName,
            });
            
            // Send email verification
            await sendEmailVerification(userCredential.user);
            
            // User state will be updated via auth state listener
            
          } catch (error: any) {
            const errorMessage = error.code 
              ? getAuthErrorMessage(error.code)
              : error.message;
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Sign in with Google
        signInWithGoogle: async () => {
          try {
            set({ isLoading: true, error: null });
            
            const userCredential = await signInWithPopup(auth, googleProvider);
            
            // Check if user profile exists, create if not
            const profileExists = await userProfileExists(userCredential.user.uid);
            if (!profileExists) {
              await createUserProfile(userCredential.user);
            } else {
              await updateLastLogin(userCredential.user.uid);
            }
            
            // User state will be updated via auth state listener
            
          } catch (error: any) {
            const errorMessage = error.code 
              ? getAuthErrorMessage(error.code)
              : error.message;
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Sign out
        signOut: async () => {
          try {
            set({ isLoading: true, error: null });
            await firebaseSignOut(auth);
            
            // Clear user state
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
            
          } catch (error: any) {
            const errorMessage = error.code 
              ? getAuthErrorMessage(error.code)
              : error.message;
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Reset password
        resetPassword: async (email: string) => {
          try {
            set({ error: null });
            
            // Validate email
            const validation = validatePasswordResetEmail(email);
            if (!validation.isValid) {
              throw new Error(validation.errors[0]);
            }
            
            await sendPasswordResetEmail(auth, email);
            
          } catch (error: any) {
            const errorMessage = error.code 
              ? getAuthErrorMessage(error.code)
              : error.message;
            set({ error: errorMessage });
            throw error;
          }
        },

        // Resend email verification
        resendEmailVerification: async () => {
          try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
              throw new Error('로그인이 필요합니다.');
            }
            
            if (currentUser.emailVerified) {
              throw new Error('이메일이 이미 인증되었습니다.');
            }
            
            await sendEmailVerification(currentUser);
            
          } catch (error: any) {
            const errorMessage = error.code 
              ? getAuthErrorMessage(error.code)
              : error.message;
            set({ error: errorMessage });
            throw error;
          }
        },

        // Delete account
        deleteAccount: async () => {
          try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
              throw new Error('로그인이 필요합니다.');
            }
            
            set({ isLoading: true, error: null });
            
            // Delete user from Firebase Auth
            await deleteUser(currentUser);
            
            // Clear user state
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
            
          } catch (error: any) {
            const errorMessage = error.code 
              ? getAuthErrorMessage(error.code)
              : error.message;
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Update profile
        updateProfile: async (updates: { displayName?: string; photoURL?: string }) => {
          try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
              throw new Error('로그인이 필요합니다.');
            }
            
            set({ isLoading: true, error: null });
            
            // Update Firebase Auth profile
            await updateFirebaseProfile(currentUser, updates);
            
            // Refresh user profile to get updated data
            await get().refreshUserProfile();
            
          } catch (error: any) {
            const errorMessage = error.code 
              ? getAuthErrorMessage(error.code)
              : error.message;
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        // Refresh user profile from Firestore
        refreshUserProfile: async () => {
          try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
              return;
            }
            
            const userProfile = await getUserProfile(currentUser.uid);
            if (userProfile) {
              set({ 
                user: userProfile,
                isAuthenticated: true,
                isLoading: false 
              });
            }
            
          } catch (error) {
            console.error('Error refreshing user profile:', error);
            set({ isLoading: false });
          }
        },

        // State setters
        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        }),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (error) => set({ error }),
        
        clearError: () => set({ error: null }),
        
        setInitialized: (isInitialized) => set({ isInitialized }),

        // Initialize auth listener
        initialize: async () => {
          return new Promise<void>((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
              try {
                if (firebaseUser) {
                  // User is signed in
                  const userProfile = await getUserProfile(firebaseUser.uid);
                  
                  if (userProfile) {
                    set({ 
                      user: userProfile, 
                      isAuthenticated: true, 
                      isLoading: false,
                      isInitialized: true
                    });
                  } else {
                    // Create profile if missing (shouldn't happen normally)
                    const newProfile = await createUserProfile(firebaseUser);
                    set({ 
                      user: newProfile, 
                      isAuthenticated: true, 
                      isLoading: false,
                      isInitialized: true
                    });
                  }
                } else {
                  // User is signed out
                  set({ 
                    user: null, 
                    isAuthenticated: false, 
                    isLoading: false,
                    isInitialized: true
                  });
                }
              } catch (error) {
                console.error('Auth state change error:', error);
                set({ 
                  user: null, 
                  isAuthenticated: false, 
                  isLoading: false, 
                  isInitialized: true,
                  error: 'Authentication failed' 
                });
              }
              
              resolve();
            });
            
            // Store unsubscribe function for cleanup
            (get as any)._unsubscribe = unsubscribe;
          });
        },

        // Cleanup function
        cleanup: () => {
          if ((get as any)._unsubscribe) {
            (get as any)._unsubscribe();
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated 
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Re-initialize auth listener after rehydration
            state.initialize();
          }
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);