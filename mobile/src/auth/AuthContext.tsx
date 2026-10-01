import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { setOnAuthFailure } from "../api/client";
import { clearTokens, hydrateTokens, setTokens } from "./tokenStore";
import { AuthenticatedUser } from "../types";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort server-side revoke; local session clears regardless.
    }
    await clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    setOnAuthFailure(() => setUser(null));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const tokens = await hydrateTokens();
        if (!tokens) return;
        const me = await authApi.fetchMe();
        setUser(me);
      } catch {
        // Corrupt/missing tokens, an expired session, or secure storage being
        // unavailable should all just fall back to the login screen.
        await clearTokens().catch(() => {});
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    await setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setUser(result.user);
  }, []);

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
