import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase client config — these are PUBLIC values, safe to hardcode
// (Firebase security is enforced via Firebase Security Rules, not by hiding these keys)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDSsxg-z2fIhYVX5YqrqELlGt7RS8Xdxwg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'veeduvadagaiku-66d6a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'veeduvadagaiku-66d6a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'veeduvadagaiku-66d6a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '444607450174',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:444607450174:web:320f8f5efc54ee4a38d56f',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
