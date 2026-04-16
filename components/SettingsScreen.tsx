"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BackendRequestError } from "@/lib/backend-client";
import {
  fetchLearningPreferences,
  getPreferencesRequestMessage,
  updateLearningPreferences,
} from "@/lib/preferences";
import { invalidateCachedDictionaryReadDataForUser } from "@/lib/vocab-cache";

function normalizeDraftValue(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

export function SettingsScreen() {
  const { refreshBootstrap, session, user } = useAuth();
  const [draftPreferredTranslationLanguage, setDraftPreferredTranslationLanguage] = useState("");
  const [savedPreferredTranslationLanguage, setSavedPreferredTranslationLanguage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const accessToken = session.access_token;
    const controller = new AbortController();

    async function loadPreferences() {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const preferences = await fetchLearningPreferences({
          accessToken,
          signal: controller.signal,
        });

        const nextValue = preferences.preferredTranslationLanguage ?? "";
        setSavedPreferredTranslationLanguage(preferences.preferredTranslationLanguage);
        setDraftPreferredTranslationLanguage(nextValue);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          void refreshBootstrap();
          return;
        }

        setErrorMessage(
          getPreferencesRequestMessage(error, "The settings could not be loaded from the backend."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPreferences();

    return () => controller.abort();
  }, [refreshBootstrap, reloadToken, session?.access_token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.access_token) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedPreferences = await updateLearningPreferences({
        accessToken: session.access_token,
        preferences: {
          preferredTranslationLanguage: normalizeDraftValue(draftPreferredTranslationLanguage),
        },
      });

      const nextValue = updatedPreferences.preferredTranslationLanguage ?? "";
      setSavedPreferredTranslationLanguage(updatedPreferences.preferredTranslationLanguage);
      setDraftPreferredTranslationLanguage(nextValue);
      if (user?.id) {
        invalidateCachedDictionaryReadDataForUser(user.id);
      }
      setSuccessMessage("Settings saved.");
    } catch (error) {
      if (error instanceof BackendRequestError && error.status === 401) {
        void refreshBootstrap();
        return;
      }

      setErrorMessage(getPreferencesRequestMessage(error, "The settings could not be saved."));
    } finally {
      setIsSaving(false);
    }
  }

  const normalizedDraftValue = normalizeDraftValue(draftPreferredTranslationLanguage);
  const hasUnsavedChanges = normalizedDraftValue !== savedPreferredTranslationLanguage;

  return (
    <section className="auth-appear grid gap-6">
      <div className="flex items-center justify-between gap-3 border-b border-token-border pb-4">
        <Link className="inline-flex items-center gap-2 text-sm text-token-muted transition hover:text-token-brand" href="/dictionary">
          <span aria-hidden="true">←</span>
          Dictionary
        </Link>
      </div>

      <article className="shell-panel rounded-[1.4rem] p-6 sm:p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-token-text sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-token-muted">
            Keep your web client preferences narrow and backend-backed.
          </p>

          <form className="mt-8 grid gap-6" onSubmit={(event) => void handleSubmit(event)}>
            <section className="grid gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#a9a39a]">
                  Preferred translation language
                </h2>
                <p className="mt-2 text-sm leading-6 text-token-muted">
                  Leave this blank to show explanation only.
                </p>
              </div>

              <input
                className="field-input"
                type="text"
                name="preferred_translation_language"
                placeholder="Optional"
                value={draftPreferredTranslationLanguage}
                onChange={(event) => {
                  setDraftPreferredTranslationLanguage(event.target.value);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                disabled={isLoading || isSaving}
              />
            </section>

            {isLoading ? <p className="text-sm text-token-muted">Loading current settings…</p> : null}

            {errorMessage ? (
              <div className="rounded-[1.1rem] border border-red-300/60 bg-red-50/80 p-4 dark:border-red-400/30 dark:bg-red-950/30">
                <p className="text-sm leading-6 text-red-800 dark:text-red-200">{errorMessage}</p>
              </div>
            ) : null}

            {successMessage ? <p className="text-sm text-token-brand">{successMessage}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isLoading || isSaving || !hasUnsavedChanges}
              >
                {isSaving ? "Saving..." : "Save settings"}
              </button>

              {errorMessage ? (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setReloadToken((currentValue) => currentValue + 1)}
                  disabled={isSaving}
                >
                  Try again
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </article>
    </section>
  );
}
