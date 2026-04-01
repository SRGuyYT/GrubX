import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { readServerEnv } from "@/lib/env";

let adminApp: App | null = null;

const readServiceAccount = () => {
  const asJson = readServerEnv("FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON");
  if (asJson) {
    return JSON.parse(asJson) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
  }

  const projectId = readServerEnv("FIREBASE_ADMIN_PROJECT_ID");
  const clientEmail = readServerEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
  const privateKey = readServerEnv("FIREBASE_ADMIN_PRIVATE_KEY")?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey,
  };
};

export const getFirebaseAdminApp = () => {
  if (adminApp) {
    return adminApp;
  }

  const serviceAccount = readServiceAccount();
  if (!serviceAccount) {
    throw new Error("Firebase Admin credentials are not configured.");
  }

  adminApp =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    });

  return adminApp;
};

export const getFirebaseAdminAuth = () => getAuth(getFirebaseAdminApp());
