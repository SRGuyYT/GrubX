"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  connectAuthEmulator,
  getAuth,
  GithubAuthProvider,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import { env } from "@/lib/env";

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let analyticsInstance: Promise<Analytics | null> | null = null;
let emulatorConnected = false;

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
  measurementId: env.firebaseMeasurementId,
};

export const githubProvider = (() => {
  const provider = new GithubAuthProvider();
  provider.addScope("read:user");
  provider.addScope("user:email");
  provider.setCustomParameters({ allow_signup: "true" });
  return provider;
})();

export const getFirebaseApp = () => {
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return appInstance;
};

export const getFirebaseAuth = () => {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
    if (typeof window !== "undefined" && env.useFirebaseAuthEmulator && !emulatorConnected) {
      connectAuthEmulator(authInstance, env.firebaseAuthEmulatorUrl, { disableWarnings: true });
      emulatorConnected = true;
    }
  }
  return authInstance;
};

export const getFirestoreDb = () => {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
};

export const getFirebaseAnalytics = async () => {
  if (typeof window === "undefined" || !env.firebaseMeasurementId) {
    return null;
  }

  if (!analyticsInstance) {
    analyticsInstance = isSupported()
      .then((supported) => (supported ? getAnalytics(getFirebaseApp()) : null))
      .catch(() => null);
  }

  return analyticsInstance;
};
