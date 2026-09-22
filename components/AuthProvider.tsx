"use client";

import { type Session, type User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { resolveAuthenticatedEntry } from "@/lib/auth-bootstrap";
import { BackendRequestError } from "@/lib/backend-client";
import { appConfig } from "@/lib/config";
import {
  fetchLearningPreferences,
  getPreferencesRequestMessage,
  type LearningPreferences,
} from "@/lib/preferences";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  clearAllCachedDictionaryReadData,
  invalidateCachedDictionaryReadDataForUser,
} from "@/lib/vocab-cache";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";
type BootstrapStatus = "idle" | "checking" | "ready" | "error";
type LanguageSetupStatus = "idle" | "checking" | "complete" | "required" | "error";
type AuthOwnershipKey = {
  accessToken: string;
  ownerUserId: string;
  requestGeneration: number;
};
type BootstrapRefreshFlight = AuthOwnershipKey & {
  promise: Promise<void>;
};

type AuthContextValue = {
  access: unknown;
  authStatus: AuthStatus;
  bootstrapError: string | null;
  bootstrapStatus: BootstrapStatus;
  captureAuthenticatedRequestOwnership: (
    ownerUserId: string,
    accessToken: string,
  ) => AuthOwnershipKey | null;
  clearAuthenticatedState: () => void;
  completeLanguageSetup: (preferences: LearningPreferences, ownerUserId: string) => void;
  completeLocalAccountDeletion: (ownership: AuthOwnershipKey) => boolean;
  hasBrowserAuthConfig: boolean;
  hasBootstrapConfig: boolean;
  handleAuthenticatedRequestRejection: (
    ownership: AuthOwnershipKey,
    message: string,
  ) => Promise<boolean>;
  isCurrentAuthenticatedRequest: (ownership: AuthOwnershipKey) => boolean;
  isCurrentAuthenticatedSession: (ownerUserId: string, accessToken: string) => boolean;
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
  const authRequestGenerationRef = useRef(0);
  const backendRejectionCleanupGenerationRef = useRef(0);
  const backendRejectionCleanupInProgressRef = useRef(false);
  const bootstrapRefreshInFlightRef = useRef<BootstrapRefreshFlight | null>(null);
  const currentAuthAccessTokenRef = useRef<string | null>(null);
  const currentAuthOwnerIdRef = useRef<string | null>(null);
  const deletedOwnerUserIdRef = useRef<string | null>(null);
  const rejectedOwnerUserIdsRef = useRef(new Set<string>());
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

  function clearAuthenticatedState() {
    authRequestGenerationRef.current += 1;
    currentAuthAccessTokenRef.current = null;
    currentAuthOwnerIdRef.current = null;
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
  }

  function isCurrentAuthOwnership(ownership: AuthOwnershipKey) {
    return (
      authRequestGenerationRef.current === ownership.requestGeneration &&
      currentAuthOwnerIdRef.current === ownership.ownerUserId &&
      currentAuthAccessTokenRef.current === ownership.accessToken
    );
  }

  function captureAuthenticatedRequestOwnership(ownerUserId: string, accessToken: string) {
    const ownership = {
      accessToken,
      ownerUserId,
      requestGeneration: authRequestGenerationRef.current,
    };

    return isCurrentAuthOwnership(ownership) ? ownership : null;
  }

  async function rejectBackendAuthenticatedSession(
    ownership: AuthOwnershipKey,
    message: string,
  ) {
    if (
      backendRejectionCleanupInProgressRef.current ||
      !isCurrentAuthOwnership(ownership)
    ) {
      return false;
    }

    const cleanupGeneration = backendRejectionCleanupGenerationRef.current + 1;
    backendRejectionCleanupGenerationRef.current = cleanupGeneration;
    backendRejectionCleanupInProgressRef.current = true;
    rejectedOwnerUserIdsRef.current.add(ownership.ownerUserId);

    authRequestGenerationRef.current += 1;
    currentAuthAccessTokenRef.current = null;
    currentAuthOwnerIdRef.current = null;
    clearAllCachedDictionaryReadData();
    setSession(null);
    setUser(null);
    setMe(null);
    setAccess(null);
    setAuthStatus("loading");
    setBootstrapStatus("checking");
    setBootstrapError(message);
    setLanguageSetupStatus("idle");
    setLanguageSetupError(null);
    setLanguagePreferences(null);

    let cleanupSucceeded = false;

    try {
      if (appConfig.hasSupabaseBrowserAuth) {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signOut();
        cleanupSucceeded = !error;
      }
    } catch {
      cleanupSucceeded = false;
    }

    if (backendRejectionCleanupGenerationRef.current !== cleanupGeneration) {
      return cleanupSucceeded;
    }

    backendRejectionCleanupInProgressRef.current = false;
    setAuthStatus("unauthenticated");
    setBootstrapStatus("idle");

    return cleanupSucceeded;
  }

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

      if (backendRejectionCleanupInProgressRef.current) {
        return;
      }

      if (
        nextSession?.access_token &&
        rejectedOwnerUserIdsRef.current.has(nextSession.user.id)
      ) {
        return;
      }

      const deletedOwnerUserId = deletedOwnerUserIdRef.current;

      if (
        nextSession?.access_token &&
        deletedOwnerUserId === nextSession.user.id
      ) {
        if (
          !currentAuthOwnerIdRef.current ||
          currentAuthOwnerIdRef.current === deletedOwnerUserId
        ) {
          clearAuthenticatedState();
        }
        return;
      }

      const previousOwnerUserId = currentAuthOwnerIdRef.current;
      const nextOwnerUserId = nextSession?.user.id ?? null;
      const requestGeneration = authRequestGenerationRef.current + 1;
      authRequestGenerationRef.current = requestGeneration;
      const isCurrentRequest = () =>
        isActive && authRequestGenerationRef.current === requestGeneration;

      if (
        previousOwnerUserId &&
        nextOwnerUserId &&
        previousOwnerUserId !== nextOwnerUserId
      ) {
        clearAllCachedDictionaryReadData();
      }

      currentAuthOwnerIdRef.current = nextOwnerUserId;
      currentAuthAccessTokenRef.current = nextSession?.access_token ?? null;

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

      if (!isCurrentRequest()) {
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

          if (!isCurrentRequest()) {
            return;
          }

          setLanguagePreferences(preferences);
          setLanguageSetupStatus(hasCompleteLanguageSetup(preferences) ? "complete" : "required");
        } catch (error) {
          if (!isCurrentRequest()) {
            return;
          }

          if (error instanceof BackendRequestError && error.status === 401) {
            await rejectBackendAuthenticatedSession(
              {
                accessToken: nextSession.access_token,
                ownerUserId: nextSession.user.id,
                requestGeneration,
              },
              error.message,
            );
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
        await rejectBackendAuthenticatedSession(
          {
            accessToken: nextSession.access_token,
            ownerUserId: nextSession.user.id,
            requestGeneration,
          },
          result.message,
        );
        return;
      }

      setBootstrapStatus("error");
      setBootstrapError(result.message);
    }

    async function loadInitialSession() {
      const requestGeneration = authRequestGenerationRef.current + 1;
      authRequestGenerationRef.current = requestGeneration;

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isActive || authRequestGenerationRef.current !== requestGeneration) {
          return;
        }

        await applySession(data.session);
      } catch (error) {
        if (!isActive || authRequestGenerationRef.current !== requestGeneration) {
          return;
        }

        setAuthStatus("error");
        currentAuthOwnerIdRef.current = null;
        currentAuthAccessTokenRef.current = null;
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
      authRequestGenerationRef.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  async function runBootstrapRefresh(ownership: AuthOwnershipKey) {
    setBootstrapStatus("checking");
    setBootstrapError(null);
    setLanguageSetupStatus("idle");
    setLanguageSetupError(null);
    setLanguagePreferences(null);

    const result = await resolveAuthenticatedEntry(ownership.accessToken);

    if (!isCurrentAuthOwnership(ownership)) {
      return;
    }

    if (result.kind === "ok") {
      setMe(result.me);
      setAccess(result.access);
      setBootstrapStatus("ready");
      setAuthStatus("authenticated");
      setLanguageSetupStatus("checking");

      try {
        const preferences = await fetchLearningPreferences({
          accessToken: ownership.accessToken,
        });

        if (!isCurrentAuthOwnership(ownership)) {
          return;
        }

        setLanguagePreferences(preferences);
        setLanguageSetupStatus(hasCompleteLanguageSetup(preferences) ? "complete" : "required");
      } catch (error) {
        if (!isCurrentAuthOwnership(ownership)) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          await rejectBackendAuthenticatedSession(ownership, error.message);
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
      await rejectBackendAuthenticatedSession(ownership, result.message);
      return;
    }

    setBootstrapStatus("error");
    setBootstrapError(result.message);
    setLanguageSetupStatus("idle");
  }

  // These render values identify the caller; request credentials still come from the live refs.
  const refreshCallerOwnerUserId = session?.user.id ?? null;
  const refreshCallerAccessToken = session?.access_token ?? null;

  async function refreshBootstrap() {
    if (backendRejectionCleanupInProgressRef.current) {
      return;
    }

    const ownerUserId = currentAuthOwnerIdRef.current;
    const accessToken = currentAuthAccessTokenRef.current;

    if (!ownerUserId || !accessToken) {
      if (!refreshCallerOwnerUserId && !refreshCallerAccessToken) {
        setAuthStatus("unauthenticated");
        setBootstrapStatus("idle");
        setBootstrapError(null);
      }
      return;
    }

    if (
      refreshCallerOwnerUserId !== ownerUserId ||
      refreshCallerAccessToken !== accessToken
    ) {
      return;
    }

    const requestGeneration = authRequestGenerationRef.current;
    const existingFlight = bootstrapRefreshInFlightRef.current;

    if (
      existingFlight &&
      existingFlight.ownerUserId === ownerUserId &&
      existingFlight.accessToken === accessToken &&
      existingFlight.requestGeneration === requestGeneration
    ) {
      await existingFlight.promise;
      return;
    }

    const ownership = {
      accessToken,
      ownerUserId,
      requestGeneration,
    };
    const promise = runBootstrapRefresh(ownership);
    bootstrapRefreshInFlightRef.current = {
      ...ownership,
      promise,
    };

    try {
      await promise;
    } finally {
      if (bootstrapRefreshInFlightRef.current?.promise === promise) {
        bootstrapRefreshInFlightRef.current = null;
      }
    }
  }

  async function signOut() {
    if (!appConfig.hasSupabaseBrowserAuth) {
      return {
        error:
          "Missing Supabase browser auth configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      };
    }

    authRequestGenerationRef.current += 1;
    currentAuthOwnerIdRef.current = null;
    currentAuthAccessTokenRef.current = null;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      currentAuthOwnerIdRef.current = user?.id ?? null;
      currentAuthAccessTokenRef.current = session?.access_token ?? null;
      return { error: error.message };
    }

    clearAuthenticatedState();

    return { error: null };
  }

  function completeLocalAccountDeletion(ownership: AuthOwnershipKey) {
    deletedOwnerUserIdRef.current = ownership.ownerUserId;

    if (!isCurrentAuthOwnership(ownership)) {
      invalidateCachedDictionaryReadDataForUser(ownership.ownerUserId);
      return false;
    }

    clearAuthenticatedState();

    return true;
  }

  function completeLanguageSetup(preferences: LearningPreferences, ownerUserId: string) {
    if (currentAuthOwnerIdRef.current !== ownerUserId) {
      return;
    }

    setLanguagePreferences(preferences);
    setLanguageSetupError(null);
    setLanguageSetupStatus(hasCompleteLanguageSetup(preferences) ? "complete" : "required");
  }

  function isCurrentAuthenticatedSession(ownerUserId: string, accessToken: string) {
    return (
      currentAuthOwnerIdRef.current === ownerUserId &&
      currentAuthAccessTokenRef.current === accessToken
    );
  }

  return (
    <AuthContext.Provider
      value={{
        access,
        authStatus,
        bootstrapError,
        bootstrapStatus,
        captureAuthenticatedRequestOwnership,
        clearAuthenticatedState,
        completeLanguageSetup,
        completeLocalAccountDeletion,
        hasBrowserAuthConfig: appConfig.hasSupabaseBrowserAuth,
        hasBootstrapConfig: appConfig.hasAuthBootstrapConfig,
        handleAuthenticatedRequestRejection: rejectBackendAuthenticatedSession,
        isCurrentAuthenticatedRequest: isCurrentAuthOwnership,
        isCurrentAuthenticatedSession,
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
