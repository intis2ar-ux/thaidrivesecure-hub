import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD2iKlMOrx7Sog5zcYM79RHSV00Eicn1wU",
  authDomain: "auth-693c8.firebaseapp.com",
  projectId: "auth-693c8",
  storageBucket: "auth-693c8.firebasestorage.app",
  messagingSenderId: "321458577934",
  appId: "1:321458577934:web:a9023483778cd08bd7925f",
  measurementId: "G-N48QSETR27"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence for faster subsequent loads
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence unavailable: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser');
  }
});

// Initialize analytics only in browser and if supported
export const initAnalytics = async () => {
  const supported = await isSupported();
  if (supported) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
