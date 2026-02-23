import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAe6UI0vKSBQFYXx4iuq0fu1dtrlR8QTHo",
  authDomain: "foundrmatch-bc8ad.firebaseapp.com",
  projectId: "foundrmatch-bc8ad",
  storageBucket: "foundrmatch-bc8ad.firebasestorage.app",
  messagingSenderId: "186065745705",
  appId: "1:186065745705:web:b3d48b24241e486ef02938",
  measurementId: "G-Z04ENCJDEM"
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

export { app, auth, db, googleProvider };
