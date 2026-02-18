import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBir1Z0Cjk6pbF1byF7OaniBsp-spIynDg",
  authDomain: "thaidrive-b7eb4.firebaseapp.com",
  projectId: "thaidrive-b7eb4",
  storageBucket: "thaidrive-b7eb4.firebasestorage.app",
  messagingSenderId: "67186739808",
  appId: "1:67186739808:web:79c3e1229e8af6047bd105",
  measurementId: "G-WL4TCYY9FZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {}, "webdboard");

// Initialize analytics only in browser and if supported
export const initAnalytics = async () => {
  const supported = await isSupported();
  if (supported) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
