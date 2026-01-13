import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Helper to safely access env vars without crashing if import.meta.env is undefined
// We access the specific property directly so Vite can perform static replacement during build.
const getEnvVar = (key: string, value: string | undefined) => {
  return value || '';
};

const firebaseConfig = {
  // We pass the direct reference to import.meta.env.VITE_... so the bundler sees it.
  // The '|| ""' fallback handles cases where the var is missing.
  apiKey: import.meta.env ? import.meta.env.VITE_FIREBASE_API_KEY : '',
  authDomain: import.meta.env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : '',
  projectId: import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : '',
  storageBucket: import.meta.env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : '',
  messagingSenderId: import.meta.env ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : '',
  appId: import.meta.env ? import.meta.env.VITE_FIREBASE_APP_ID : ''
};

// Initialize Firebase only if config is present and valid
const isConfigured = typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.length > 0;

if (!isConfigured) {
  console.group('Firebase Configuration Missing');
  console.warn('The app is running in Local Demo Mode because Firebase environment variables are missing.');
  console.log('Current Config State:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
  });
  console.log('To fix this, add the VITE_FIREBASE_* variables to your .env file or Vercel Project Settings.');
  console.groupEnd();
}

const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const db = isConfigured ? getFirestore(app!) : null;

export const isBackendConfigured = () => isConfigured;