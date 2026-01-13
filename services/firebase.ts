import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// These should be set in a .env file in the root of your project
// Safely access env to prevent crashes if import.meta.env is not defined
const meta = import.meta as any;
const env = (meta && meta.env) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present
const isConfigured = !!firebaseConfig.apiKey;

const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const db = isConfigured ? getFirestore(app!) : null;

export const isBackendConfigured = () => isConfigured;