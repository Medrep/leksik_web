"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { readBrowserLocale, resolveEffectiveLocale } from "@/lib/i18n/locales";
import {
  getWebMessages,
  type SettingsMessages,
  type WebMessages,
} from "@/lib/i18n/messages";
import type { UiLocale } from "@/lib/ui-locale-options";

type UserLocaleState = {
  userId: string;
  uiLocale: UiLocale | null;
};

type LocaleContextValue = {
  acceptAuthoritativeUiLocale: (uiLocale: UiLocale | null) => void;
  isLocaleReady: boolean;
  isPublicLocaleReady: boolean;
  locale: UiLocale;
  messages: WebMessages;
  settingsMessages: SettingsMessages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const hasResolvedBrowserLocaleRef = useRef(false);
  const {
    authStatus,
    bootstrapStatus,
    languagePreferences,
    languageSetupStatus,
    user,
  } = useAuth();
  const userId = user?.id ?? null;
  const [savedLocaleOverride, setSavedLocaleOverride] = useState<UserLocaleState | null>(null);
  const [browserLocale, setBrowserLocale] = useState<UiLocale>("en");
  const [isBrowserLocaleReady, setIsBrowserLocaleReady] = useState(false);
  const hasAuthenticatedPreferences =
    authStatus === "authenticated" && userId !== null && languagePreferences !== null;

  useEffect(() => {
    setSavedLocaleOverride(null);
  }, [languagePreferences, userId]);

  useEffect(() => {
    if (hasResolvedBrowserLocaleRef.current) {
      return;
    }

    hasResolvedBrowserLocaleRef.current = true;
    setBrowserLocale(readBrowserLocale());
    setIsBrowserLocaleReady(true);
  }, []);

  const savedLocale = hasAuthenticatedPreferences
    ? savedLocaleOverride?.userId === userId
      ? savedLocaleOverride.uiLocale
      : languagePreferences.uiLocale
    : null;
  const isLocaleReady =
    hasAuthenticatedPreferences && (savedLocale !== null || isBrowserLocaleReady);
  const hasAuthenticatedLocaleFallback =
    hasAuthenticatedPreferences ||
    bootstrapStatus === "error" ||
    languageSetupStatus === "error";
  const isPublicLocaleReady =
    isBrowserLocaleReady &&
    authStatus !== "loading" &&
    (authStatus !== "authenticated" || hasAuthenticatedLocaleFallback);
  const locale = hasAuthenticatedPreferences
    ? resolveEffectiveLocale(savedLocale, browserLocale)
    : browserLocale;
  const messages = useMemo(() => getWebMessages(locale), [locale]);

  function acceptAuthoritativeUiLocale(uiLocale: UiLocale | null) {
    if (!userId) {
      return;
    }

    setSavedLocaleOverride({
      uiLocale,
      userId,
    });
  }

  return (
    <LocaleContext.Provider
      value={{
        acceptAuthoritativeUiLocale,
        isLocaleReady,
        isPublicLocaleReady,
        locale,
        messages,
        settingsMessages: messages.settings,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
