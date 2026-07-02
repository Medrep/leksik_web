"use client";

import { type Session, type User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { resolveAuthenticatedEntry } from "@/lib/auth-bootstrap";
import { BackendRequestError } from "@/lib/backend-client";
import { appConfig } from "@/lib/config";
import {
  fetchLearningPreferences,
  getPreferencesRequestMessage,
  type LearningPreferences,
} from "@/lib/preferences";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearAllCachedDictionaryReadData } from "@/lib/vocab-cache";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";
type BootstrapStatus = "idle" | "checking" | "ready" | "error";
type LanguageSetupStatus = "idle" | "checking" | "complete" | "required" | "error";

type AuthContextValue = {
  access: unknown;
  authStatus: AuthStatus;
  bootstrapError: string | null;
  bootstrapStatus: BootstrapStatus;
  completeLanguageSetup: (preferences: LearningPreferences) => void;
  hasBrowserAuthConfig: boolean;
  hasBootstrapConfig: boolean;
  isProtectedReady: boolean;
  languagePreferences: LearningPreferences | null;
  languageSetupError: string | null;
  languageSetupStatus: LanguageSetupStatus;
  me: unknown;
  refreshBootstrap: () => Promise<void>;
  session: Session | null;
  signOut: () => Promise<{ error: string | null }>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function hasCompleteLanguageSetup(preferences: LearningPreferences) {
  return Boolean(preferences.learningLanguage && preferences.preferredTranslationLanguage);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>("idle");
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [languageSetupStatus, setLanguageSetupStatus] = useState<LanguageSetupStatus>("idle");
  const [languageSetupError, setLanguageSetupError] = useState<string | null>(null);
  const [languagePreferences, setLanguagePreferences] = useState<LearningPreferences | null>(null);
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
      setLanguageSetupError(null);
      setLanguagePreferences(null);

      if (!nextSession?.access_token) {
        clearAllCachedDictionaryReadData();
        setAuthStatus("unauthenticated");
        setBootstrapStatus("idle");
        setLanguageSetupStatus("idle");
        return;
      }

      setAuthStatus("authenticated");
      setBootstrapStatus("checking");
      setLanguageSetupStatus("idle");

      const result = await resolveAuthenticatedEntry(nextSession.access_token);

      if (!isActive) {
        return;
      }

      if (result.kind === "ok") {
        setMe(result.me);
        setAccess(result.access);
        setBootstrapStatus("ready");
        setLanguageSetupStatus("checking");

        try {
          const preferences = await fetchLearningPreferences({
            accessToken: nextSession.access_token,
          });

          if (!isActive) {
            return;
          }

          setLanguagePreferences(preferences);
          setLanguageSetupStatus(hasCompleteLanguageSetup(preferences) ? "complete" : "required");
        } catch (error) {
          if (!isActive) {
            return;
          }

          if (error instanceof BackendRequestError && error.status === 401) {
            clearAllCachedDictionaryReadData();
            setAuthStatus("unauthenticated");
            setBootstrapStatus("idle");
            setLanguageSetupStatus("idle");
            setSession(null);
            setUser(null);
            setBootstrapError(error.message);
            await supabase.auth.signOut();
            return;
          }

          setLanguageSetupStatus("error");
          setLanguageSetupError(
            getPreferencesRequestMessage(error, "Language settings could not be loaded."),
          );
        }
        return;
      }

      if (result.kind === "unauthorized") {
        clearAllCachedDictionaryReadData();
        setAuthStatus("unauthenticated");
        setBootstrapStatus("idle");
        setSession(null);
        setUser(null);
        setLanguageSetupStatus("idle");
        setLanguagePreferences(null);
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
    setLanguageSetupStatus("idle");
    setLanguageSetupError(null);
    setLanguagePreferences(null);

    const result = await resolveAuthenticatedEntry(session.access_token);

    if (result.kind === "ok") {
      setMe(result.me);
      setAccess(result.access);
      setBootstrapStatus("ready");
      setAuthStatus("authenticated");
      setLanguageSetupStatus("checking");

      try {
        const preferences = await fetchLearningPreferences({
          accessToken: session.access_token,
        });

        setLanguagePreferences(preferences);
        setLanguageSetupStatus(hasCompleteLanguageSetup(preferences) ? "complete" : "required");
      } catch (error) {
        if (error instanceof BackendRequestError && error.status === 401) {
          clearAllCachedDictionaryReadData();
          setAuthStatus("unauthenticated");
          setBootstrapStatus("idle");
          setSession(null);
          setUser(null);
          setMe(null);
          setAccess(null);
          setLanguageSetupStatus("idle");
          setLanguagePreferences(null);
          setBootstrapError(error.message);

          if (appConfig.hasSupabaseBrowserAuth) {
            const supabase = getSupabaseBrowserClient();
            await supabase.auth.signOut();
          }

          return;
        }

        setLanguageSetupStatus("error");
        setLanguageSetupError(
          getPreferencesRequestMessage(error, "Language settings could not be loaded."),
        );
      }
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
      setLanguageSetupStatus("idle");
      setLanguagePreferences(null);
      setBootstrapError(result.message);

      if (appConfig.hasSupabaseBrowserAuth) {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      }

      return;
    }

    setBootstrapStatus("error");
    setBootstrapError(result.message);
    setLanguageSetupStatus("idle");
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
    setLanguageSetupStatus("idle");
    setLanguageSetupError(null);
    setLanguagePreferences(null);

    return { error: null };
  }

  function completeLanguageSetup(preferences: LearningPreferences) {
    setLanguagePreferences(preferences);
    setLanguageSetupError(null);
    setLanguageSetupStatus(hasCompleteLanguageSetup(preferences) ? "complete" : "required");
  }

  return (
    <AuthContext.Provider
      value={{
        access,
        authStatus,
        bootstrapError,
        bootstrapStatus,
        completeLanguageSetup,
        hasBrowserAuthConfig: appConfig.hasSupabaseBrowserAuth,
        hasBootstrapConfig: appConfig.hasAuthBootstrapConfig,
        isProtectedReady:
          authStatus === "authenticated" &&
          bootstrapStatus === "ready" &&
          languageSetupStatus === "complete",
        languagePreferences,
        languageSetupError,
        languageSetupStatus,
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
