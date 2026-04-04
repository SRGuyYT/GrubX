"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { bridgeMatrixSession } from "@/lib/auth/matrixBridge";
import { getFirebaseAnalytics, getFirebaseAuth, githubProvider } from "@/lib/firebase/client";
import type { SessionContextValue, SessionState, SessionUser } from "@/types/session";

const SessionContext = createContext<SessionContextValue | null>(null);

const DEFAULT_SESSION: SessionState = {
  status: "anonymous",
  authProvider: null,
  firebaseUid: null,
  matrixUserId: null,
};

const deriveProvider = async (firebaseUser: User) => {
  const token = await getIdTokenResult(firebaseUser);
  if (token.claims.authProvider === "matrix") {
    return {
      authProvider: "matrix" as const,
      matrixUserId: typeof token.claims.matrixUserId === "string" ? token.claims.matrixUserId : null,
    };
  }

  if (firebaseUser.providerData.some((entry) => entry.providerId === "github.com")) {
    return {
      authProvider: "github" as const,
      matrixUserId: null,
    };
  }

  return {
    authProvider: "firebase" as const,
    matrixUserId: null,
  };
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionState>(DEFAULT_SESSION);

  useEffect(() => {
    void getFirebaseAnalytics();

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      setFirebaseUser(nextUser);

      if (!nextUser) {
        setSession(DEFAULT_SESSION);
        setInitialized(true);
        return;
      }

      try {
        await nextUser.getIdToken();
        const provider = await deriveProvider(nextUser);
        setSession({
          status: "authenticated",
          authProvider: provider.authProvider,
          firebaseUid: nextUser.uid,
          matrixUserId: provider.matrixUserId,
        });
      } catch {
        setSession({
          status: "authenticated",
          authProvider: "firebase",
          firebaseUid: nextUser.uid,
          matrixUserId: null,
        });
      } finally {
        setInitialized(true);
      }
    });

    return unsubscribe;
  }, []);

  const user = useMemo<SessionUser | null>(() => {
    if (!firebaseUser) {
      return null;
    }

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email ?? "",
      username: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "Viewer",
    };
  }, [firebaseUser]);

  const value = useMemo<SessionContextValue>(
    () => ({
      initialized,
      session,
      firebaseUser,
      user,
      async login(email, password) {
        const previousSession = session;
        setSession((current) => ({ ...current, status: "authenticating" }));
        try {
          await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
        } catch (error) {
          setSession(previousSession);
          throw error;
        }
      },
      async register(email, username, password) {
        const previousSession = session;
        setSession((current) => ({ ...current, status: "authenticating" }));
        try {
          const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
          await updateProfile(credential.user, { displayName: username.trim() });
        } catch (error) {
          setSession(previousSession);
          throw error;
        }
      },
      async loginWithGithub() {
        const previousSession = session;
        setSession((current) => ({ ...current, status: "authenticating" }));
        try {
          await signInWithPopup(getFirebaseAuth(), githubProvider);
        } catch (error) {
          setSession(previousSession);
          throw error;
        }
      },
      async loginWithMatrix(input) {
        const previousSession = session;
        setSession((current) => ({ ...current, status: "bridging" }));
        try {
          await bridgeMatrixSession({
            username: input.username.trim(),
            password: input.password,
            homeserverUrl: input.homeserverUrl?.trim(),
          });
        } catch (error) {
          setSession(previousSession);
          throw error;
        }
      },
      async logout() {
        setSession(DEFAULT_SESSION);
        await signOut(getFirebaseAuth());
      },
    }),
    [firebaseUser, initialized, session, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider.");
  }
  return context;
};
