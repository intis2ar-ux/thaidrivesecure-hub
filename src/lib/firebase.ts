import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDvvak2EAhWjxDiDkaqo1m_8-gCOlusCW4",
  authDomain: "thai-drive-5dd28.firebaseapp.com",
  projectId: "thai-drive-5dd28",
  storageBucket: "thai-drive-5dd28.firebasestorage.app",
  messagingSenderId: "161376243372",
  appId: "1:161376243372:web:9fffac3b368acecc691909",
  measurementId: "G-E4CGHRQF1R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics only in browser and if supported
export const initAnalytics = async () => {
  const supported = await isSupported();
  if (supported) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
