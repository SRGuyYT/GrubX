const readClientEnv = (name: string) => {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
};

export const env = {
  tmdbProxyBase: readClientEnv("NEXT_PUBLIC_TMDB_PROXY_BASE") ?? "https://mtd.sky0cloud.dpdns.org",
  tmdbApiKey: readClientEnv("NEXT_PUBLIC_TMDB_API_KEY") ?? "bda755b29c8939787eded30edf76bec5",
  vidkingBase: readClientEnv("NEXT_PUBLIC_VIDKING_BASE") ?? "https://www.vidking.net/embed",
  firebaseApiKey:
    readClientEnv("NEXT_PUBLIC_FIREBASE_API_KEY") ?? "AIzaSyBtbU7NxYqX3W95NxFtzLAwV_IecVsXAk0",
  firebaseAuthDomain:
    readClientEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") ?? "grubed-95935.firebaseapp.com",
  firebaseProjectId: readClientEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID") ?? "grubed-95935",
  firebaseStorageBucket:
    readClientEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ?? "grubed-95935.firebasestorage.app",
  firebaseMessagingSenderId:
    readClientEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ?? "735633430795",
  firebaseAppId:
    readClientEnv("NEXT_PUBLIC_FIREBASE_APP_ID") ?? "1:735633430795:web:a0c6c10326102b303fea0e",
  firebaseMeasurementId: readClientEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID") ?? "G-MCFR3TVMPY",
  useFirebaseAuthEmulator: readClientEnv("NEXT_PUBLIC_USE_FIREBASE_AUTH_EMULATOR") === "true",
  firebaseAuthEmulatorUrl:
    readClientEnv("NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL") ?? "http://127.0.0.1:9099",
  matrixBridgeEnabled: readClientEnv("NEXT_PUBLIC_MATRIX_BRIDGE_ENABLED") === "true",
};

export const readServerEnv = (name: string) => {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
};
