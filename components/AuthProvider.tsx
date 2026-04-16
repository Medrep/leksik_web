"use client";

import { type Session, type User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { resolveAuthenticatedEntry } from "@/lib/auth-bootstrap";
import { appConfig } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearAllCachedDictionaryReadData } from "@/lib/vocab-cache";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";
type BootstrapStatus = "idle" | "checking" | "ready" | "error";

type AuthContextValue = {
  access: unknown;
  authStatus: AuthStatus;
  bootstrapError: string | null;
  bootstrapStatus: BootstrapStatus;
  hasBrowserAuthConfig: boolean;
  hasBootstrapConfig: boolean;
  isProtectedReady: boolean;
  me: unknown;
  refreshBootstrap: () => Promise<void>;
  session: Session | null;
  signOut: () => Promise<{ error: string | null }>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>("idle");
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<unknown>(null);
  const [access, setAccess] = useState<unknown>(null);

  useEffect(() => {
    if (!appConfig.hasSupabaseBrowserAuth) {
      setAuthStatus("error");
      setBootstrapStatus("error");
      setBootstrapError(
        "Missing Supabase browser auth configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let isActive = true;

    async function applySession(nextSession: Session | null) {
      if (!isActive) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setMe(null);
      setAccess(null);
      setBootstrapError(null);

      if (!nextSession?.access_token) {
        clearAllCachedDictionaryReadData();
        setAuthStatus("unauthenticated");
        setBootstrapStatus("idle");
        return;
      }

      setAuthStatus("authenticated");
      setBootstrapStatus("checking");

      const result = await resolveAuthenticatedEntry(nextSession.access_token);

      if (!isActive) {
        return;
      }

      if (result.kind === "ok") {
        setMe(result.me);
        setAccess(result.access);
        setBootstrapStatus("ready");
        return;
      }

      if (result.kind === "unauthorized") {
        clearAllCachedDictionaryReadData();
        setAuthStatus("unauthenticated");
        setBootstrapStatus("idle");
        setSession(null);
        setUser(null);
        setBootstrapError(result.message);
        await supabase.auth.signOut();
        return;
      }

      setBootstrapStatus("error");
      setBootstrapError(result.message);
    }

    async function loadInitialSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        await applySession(data.session);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setAuthStatus("error");
        setBootstrapStatus("error");
        setBootstrapError(error instanceof Error ? error.message : "Could not resolve the browser auth session.");
      }
    }

    void loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  async function refreshBootstrap() {
    if (!session?.access_token) {
      setAuthStatus("unauthenticated");
      setBootstrapStatus("idle");
      setBootstrapError(null);
      return;
    }

    setBootstrapStatus("checking");
    setBootstrapError(null);

    const result = await resolveAuthenticatedEntry(session.access_token);

    if (result.kind === "ok") {
      setMe(result.me);
      setAccess(result.access);
      setBootstrapStatus("ready");
      setAuthStatus("authenticated");
      return;
    }

    if (result.kind === "unauthorized") {
      clearAllCachedDictionaryReadData();
      setAuthStatus("unauthenticated");
      setBootstrapStatus("idle");
      setSession(null);
      setUser(null);
      setMe(null);
      setAccess(null);
      setBootstrapError(result.message);

      if (appConfig.hasSupabaseBrowserAuth) {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      }

      return;
    }

    setBootstrapStatus("error");
    setBootstrapError(result.message);
  }

  async function signOut() {
    if (!appConfig.hasSupabaseBrowserAuth) {
      return {
        error:
          "Missing Supabase browser auth configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      };
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    clearAllCachedDictionaryReadData();
    setSession(null);
    setUser(null);
    setMe(null);
    setAccess(null);
    setAuthStatus("unauthenticated");
    setBootstrapStatus("idle");
    setBootstrapError(null);

    return { error: null };
  }

  return (
    <AuthContext.Provider
      value={{
        access,
        authStatus,
        bootstrapError,
        bootstrapStatus,
        hasBrowserAuthConfig: appConfig.hasSupabaseBrowserAuth,
        hasBootstrapConfig: appConfig.hasAuthBootstrapConfig,
        isProtectedReady: authStatus === "authenticated" && bootstrapStatus === "ready",
        me,
        refreshBootstrap,
        session,
        signOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
