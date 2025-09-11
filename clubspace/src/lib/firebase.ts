// Firebase configuration and initialization
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  EmailAuthProvider,
  setPersistence,
  browserLocalPersistence 
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Email Auth Provider  
export const emailProvider = new EmailAuthProvider();

// Set auth persistence (only in browser environment)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
}

// Connect to Firebase Emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Connect to emulators only if enabled via environment variable
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    try {
      // Connect to Auth emulator
      if (auth && !auth._delegate._config?.emulator) {
        auth.useAuthEmulator('http://localhost:9098');
      }
      
      // Connect to Firestore emulator
      if (!db._delegate._settings?.host?.includes('localhost')) {
        connectFirestoreEmulator(db, 'localhost', 8082);
      }
      
      // Connect to Storage emulator
      if (!storage._delegate._host?.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      
      console.log('✅ Connected to Firebase emulators');
    } catch (error) {
      // Emulators already connected or not available
      console.log('⚠️ Firebase emulators connection skipped:', error);
    }
  }
}

export default app;