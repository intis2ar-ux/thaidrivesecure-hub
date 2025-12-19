import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2iKlMOrx7Sog5zcYM79RHSV00Eicn1wU",
  authDomain: "auth-693c8.firebaseapp.com",
  projectId: "auth-693c8",
  storageBucket: "auth-693c8.firebasestorage.app",
  messagingSenderId: "321458577934",
  appId: "1:321458577934:web:a9023483778cd08bd7925f",
  measurementId: "G-N48QSETR27",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
