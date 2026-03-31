import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const readEnv = (value: string | undefined, fallback: string) => (value && value.trim().length > 0 ? value : fallback);

const firebaseConfig = {
  apiKey: readEnv(import.meta.env.VITE_FIREBASE_API_KEY, "AIzaSyBtbU7NxYqX3W95NxFtzLAwV_IecVsXAk0"),
  authDomain: readEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "grubed-95935.firebaseapp.com"),
  projectId: readEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, "grubed-95935"),
  storageBucket: readEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, "grubed-95935.firebasestorage.app"),
  messagingSenderId: readEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, "735633430795"),
  appId: readEnv(import.meta.env.VITE_FIREBASE_APP_ID, "1:735633430795:web:a0c6c10326102b303fea0e"),
  measurementId: readEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, "G-MCFR3TVMPY"),
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export let analytics: Analytics | null = null;

if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  void isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((error) => {
      console.warn("Firebase analytics initialization skipped.", error);
    });
}
