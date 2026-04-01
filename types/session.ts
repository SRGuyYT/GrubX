import type { User } from "firebase/auth";

export type SessionStatus = "anonymous" | "authenticating" | "bridging" | "authenticated";
export type AuthProvider = "firebase" | "github" | "matrix" | null;

export type SessionState = {
  status: SessionStatus;
  authProvider: AuthProvider;
  firebaseUid: string | null;
  matrixUserId: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  username: string;
};

export type SessionContextValue = {
  initialized: boolean;
  session: SessionState;
  firebaseUser: User | null;
  user: SessionUser | null;
  login(email: string, password: string): Promise<void>;
  register(email: string, username: string, password: string): Promise<void>;
  loginWithGithub(): Promise<void>;
  loginWithMatrix(input: { username: string; password: string; homeserverUrl?: string }): Promise<void>;
  logout(): Promise<void>;
};
