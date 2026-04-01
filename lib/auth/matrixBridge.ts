"use client";

import { signInWithCustomToken } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";

type MatrixBridgeRequest = {
  username: string;
  password: string;
  homeserverUrl?: string;
};

type MatrixBridgeResponse = {
  customToken: string;
  firebaseUid: string;
  matrixUserId: string;
};

export const bridgeMatrixSession = async (input: MatrixBridgeRequest) => {
  const response = await fetch("/api/auth/matrix/bridge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as Partial<MatrixBridgeResponse> & { error?: string };
  if (!response.ok || !payload.customToken || !payload.firebaseUid || !payload.matrixUserId) {
    throw new Error(payload.error ?? "Matrix bridge sign-in failed.");
  }

  await signInWithCustomToken(getFirebaseAuth(), payload.customToken);

  return {
    firebaseUid: payload.firebaseUid,
    matrixUserId: payload.matrixUserId,
  };
};
