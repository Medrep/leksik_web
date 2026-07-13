"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { readBrowserLocale, resolveEffectiveLocale } from "@/lib/i18n/locales";
import {
  getAuthenticatedMessages,
  type AuthenticatedMessages,
  type SettingsMessages,
} from "@/lib/i18n/messages";
import type { UiLocale } from "@/lib/ui-locale-options";

type UserLocaleState = {
  userId: string;
  uiLocale: UiLocale | null;
};

type BrowserLocaleState = {
  locale: UiLocale;
  userId: string;
};

type LocaleContextValue = {
  acceptAuthoritativeUiLocale: (uiLocale: UiLocale | null) => void;
  isLocaleReady: boolean;
  locale: UiLocale;
  messages: AuthenticatedMessages;
  settingsMessages: SettingsMessages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { authStatus, languagePreferences, user } = useAuth();
  const userId = user?.id ?? null;
  const [savedLocaleOverride, setSavedLocaleOverride] = useState<UserLocaleState | null>(null);
  const [browserLocale, setBrowserLocale] = useState<BrowserLocaleState | null>(null);
  const hasAuthenticatedPreferences =
    authStatus === "authenticated" && userId !== null && languagePreferences !== null;

  useEffect(() => {
    setSavedLocaleOverride(null);
  }, [languagePreferences, userId]);

  useEffect(() => {
    if (!hasAuthenticatedPreferences || !userId) {
      setBrowserLocale(null);
      return;
    }

    setBrowserLocale({
      locale: readBrowserLocale(),
      userId,
    });
  }, [hasAuthenticatedPreferences, userId]);

  const savedLocale =
    savedLocaleOverride?.userId === userId
      ? savedLocaleOverride.uiLocale
      : languagePreferences?.uiLocale ?? null;
  const resolvedBrowserLocale =
    browserLocale?.userId === userId ? browserLocale.locale : null;
  const isLocaleReady =
    hasAuthenticatedPreferences && (savedLocale !== null || resolvedBrowserLocale !== null);
  const locale = isLocaleReady
    ? resolveEffectiveLocale(savedLocale, resolvedBrowserLocale ?? "en")
    : "en";
  const messages = useMemo(() => getAuthenticatedMessages(locale), [locale]);

  function acceptAuthoritativeUiLocale(uiLocale: UiLocale | null) {
    if (!userId) {
      return;
    }

    if (uiLocale === null) {
      setBrowserLocale({
        locale: readBrowserLocale(),
        userId,
      });
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
