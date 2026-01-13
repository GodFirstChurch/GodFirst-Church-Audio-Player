import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// We check if import.meta.env exists before accessing it to prevent runtime crashes.
// We also strictly use the full string "import.meta.env.KEY" in the value position
// so Vite's build process can find and replace it with the actual string literal.

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env ? import.meta.env.VITE_FIREBASE_API_KEY : '',
  authDomain: env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : '',
  projectId: env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : '',
  storageBucket: env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : '',
  messagingSenderId: env ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : '',
  appId: env ? import.meta.env.VITE_FIREBASE_APP_ID : ''
};

// Initialize Firebase only if config is present and valid
const isConfigured = typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.length > 0;

const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const db = isConfigured ? getFirestore(app!) : null;

export const isBackendConfigured = () => isConfigured;