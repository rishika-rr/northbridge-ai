import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getMe, login, logout } from "../services/api";
import { getToken, setSessionExpiredHandler, setToken } from "../services/http";
import { AuthContext } from "./context";
import type { AuthState } from "./context";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [state, setState] = useState<AuthState>(() =>
    getToken() ? { status: "loading", user: null } : { status: "anonymous", user: null }
  );
  const [sessionEnded, setSessionEnded] = useState(false);

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    getMe()
      .then((user) => {
        if (!cancelled) setState({ status: "authenticated", user });
      })
      .catch(() => {
        if (cancelled) return;
        setToken(null);
        setState({ status: "anonymous", user: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The server rejected our token mid-session: back to the sign-in screen.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.clear();
      setSessionEnded(true);
      setState({ status: "anonymous", user: null });
    });
    return () => setSessionExpiredHandler(null);
  }, [queryClient]);

  const signIn = useCallback(
    async (username: string, password: string) => {
      const result = await login(username, password);
      setToken(result.access_token);
      queryClient.clear(); // never show the previous user's data
      setSessionEnded(false);
      setState({ status: "authenticated", user: result.user });
    },
    [queryClient]
  );

  const signOut = useCallback(async () => {
    try {
      await logout(); // revoke the token on the server
    } catch {
      // already invalid or offline: sign out locally regardless
    }
    setToken(null);
    queryClient.clear();
    setSessionEnded(false);
    setState({ status: "anonymous", user: null });
  }, [queryClient]);

  const value = useMemo(
    () => ({ ...state, signIn, signOut, sessionEnded }),
    [state, signIn, signOut, sessionEnded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
