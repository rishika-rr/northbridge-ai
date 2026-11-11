import { createContext, useContext } from "react";

import type { User } from "../services/api";

export type AuthState =
  | { status: "loading"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: User };

export type AuthContextValue = AuthState & {
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** set when the server ended the session (expired, revoked, deactivated) */
  sessionEnded: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
