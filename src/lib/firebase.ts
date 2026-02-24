import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAe6UI0vKSBQFYXx4iuq0fu1dtrlR8QTHo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "foundrmatch-bc8ad.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "foundrmatch-bc8ad",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "foundrmatch-bc8ad.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "186065745705",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:186065745705:web:b3d48b24241e486ef02938",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Z04ENCJDEM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally (only in browser and if supported)
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};

export { app, auth, db, googleProvider, signInAnonymously };
