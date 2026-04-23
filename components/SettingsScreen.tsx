"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { TelegramLinkPanel } from "@/components/TelegramLinkPanel";
import { BackendRequestError } from "@/lib/backend-client";
import {
  fetchLearningPreferences,
  getPreferencesRequestMessage,
  type LearningPreferences,
  updateLearningPreferences,
} from "@/lib/preferences";
import { invalidateCachedDictionaryReadDataForUser } from "@/lib/vocab-cache";

type TranslationLanguageCode = "en" | "ru" | "pl";
type TranslationLanguageSelectValue = "" | TranslationLanguageCode;

const DAILY_REVIEW_TARGET_STEP = 5;
const DAILY_REVIEW_TARGET_MIN = 5;
const DAILY_REVIEW_TARGET_MAX = 50;

const TRANSLATION_LANGUAGE_OPTIONS: ReadonlyArray<{
  label: string;
  value: TranslationLanguageSelectValue;
}> = [
  { label: "No translation", value: "" },
  { label: "English", value: "en" },
  { label: "Russian", value: "ru" },
  { label: "Polish", value: "pl" },
];

const REVIEW_TIMEZONE_OPTIONS: ReadonlyArray<{
  label: string;
  value: string;
}> = [
  { label: "No timezone", value: "" },
  { label: "UTC", value: "UTC" },
  { label: "Europe/Warsaw", value: "Europe/Warsaw" },
  { label: "Europe/Berlin", value: "Europe/Berlin" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Europe/Paris", value: "Europe/Paris" },
  { label: "Europe/Rome", value: "Europe/Rome" },
  { label: "Europe/Madrid", value: "Europe/Madrid" },
  { label: "Europe/Kyiv", value: "Europe/Kyiv" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "America/Chicago", value: "America/Chicago" },
  { label: "America/Denver", value: "America/Denver" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "America/Toronto", value: "America/Toronto" },
  { label: "America/Sao_Paulo", value: "America/Sao_Paulo" },
  { label: "Asia/Dubai", value: "Asia/Dubai" },
  { label: "Asia/Kolkata", value: "Asia/Kolkata" },
  { label: "Asia/Singapore", value: "Asia/Singapore" },
  { label: "Asia/Tokyo", value: "Asia/Tokyo" },
  { label: "Asia/Seoul", value: "Asia/Seoul" },
  { label: "Australia/Sydney", value: "Australia/Sydney" },
];

function isTranslationLanguageCode(value: string): value is TranslationLanguageCode {
  return TRANSLATION_LANGUAGE_OPTIONS.some(
    (option) => option.value !== "" && option.value === value,
  );
}

function toSelectValue(value: string | null): TranslationLanguageSelectValue {
  if (value === null) {
    return "";
  }

  if (isTranslationLanguageCode(value)) {
    return value;
  }

  throw new Error("Backend returned an unsupported preferred_translation_language value.");
}

function toBackendValue(value: TranslationLanguageSelectValue): TranslationLanguageCode | null {
  return value === "" ? null : value;
}

function toReviewTimeInputValue(value: string | null) {
  return value ?? "";
}

function toReviewTimeBackendValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : null;
}

function toReviewTimezoneInputValue(value: string | null) {
  return value ?? "";
}

function toReviewTimezoneBackendValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : null;
}

function getReviewTimezoneOptions(selectedValue: string) {
  const normalizedSelectedValue = toReviewTimezoneBackendValue(selectedValue);

  if (
    normalizedSelectedValue === null ||
    REVIEW_TIMEZONE_OPTIONS.some((option) => option.value === normalizedSelectedValue)
  ) {
    return REVIEW_TIMEZONE_OPTIONS;
  }

  return [
    ...REVIEW_TIMEZONE_OPTIONS,
    {
      label: `${normalizedSelectedValue} (current)`,
      value: normalizedSelectedValue,
    },
  ];
}

function normalizeDailyReviewTargetCount(value: number) {
  if (!Number.isFinite(value)) {
    return 10;
  }

  const roundedValue = Math.round(value / DAILY_REVIEW_TARGET_STEP) * DAILY_REVIEW_TARGET_STEP;
  return Math.min(DAILY_REVIEW_TARGET_MAX, Math.max(DAILY_REVIEW_TARGET_MIN, roundedValue));
}

function SettingsControlRow({
  children,
  copy,
  label,
}: {
  children: React.ReactNode;
  copy: string;
  label: string;
}) {
  return (
    <section className="border-t border-token-border pt-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.42fr)] sm:items-start">
        <div>
          <h2 className="text-[0.6875rem] uppercase tracking-[0.16em] text-token-muted/65">
            {label}
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-5 text-token-muted">{copy}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function SettingsStateMessage({
  message,
  tone,
}: {
  message: string;
  tone: "neutral" | "success" | "error";
}) {
  const toneClassName =
    tone === "error"
      ? "border-[#E8B7AF] bg-[#FFF4F1] text-[#8A3328]"
      : tone === "success"
        ? "border-token-border bg-token-brandSoft/40 text-token-brand"
        : "border-token-border bg-[#FEFAF2] text-token-muted";

  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClassName}`}>
      <p className="text-[0.8125rem] leading-5">{message}</p>
    </div>
  );
}

export function SettingsScreen() {
  const { refreshBootstrap, session, user } = useAuth();
  const [draftDailyReviewEnabled, setDraftDailyReviewEnabled] = useState(false);
  const [draftDailyReviewTargetCount, setDraftDailyReviewTargetCount] = useState(10);
  const [draftPreferredTranslationLanguage, setDraftPreferredTranslationLanguage] =
    useState<TranslationLanguageSelectValue>("");
  const [draftPreferredReviewTime, setDraftPreferredReviewTime] = useState("");
  const [draftPreferredReviewTimezone, setDraftPreferredReviewTimezone] = useState("");
  const [loadedPreferences, setLoadedPreferences] = useState<LearningPreferences | null>(null);
  const [savedDailyReviewEnabled, setSavedDailyReviewEnabled] = useState(false);
  const [savedDailyReviewTargetCount, setSavedDailyReviewTargetCount] = useState(10);
  const [savedPreferredTranslationLanguage, setSavedPreferredTranslationLanguage] =
    useState<TranslationLanguageCode | null>(null);
  const [savedPreferredReviewTime, setSavedPreferredReviewTime] = useState<string | null>(null);
  const [savedPreferredReviewTimezone, setSavedPreferredReviewTimezone] = useState<string | null>(
    null,
  );
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

        const nextValue = toSelectValue(preferences.preferredTranslationLanguage);
        const nextDailyReviewTargetCount = normalizeDailyReviewTargetCount(
          preferences.dailyReviewTargetCount,
        );
        const nextPreferredReviewTime = toReviewTimeInputValue(preferences.preferredReviewTime);
        const nextPreferredReviewTimezone = toReviewTimezoneInputValue(
          preferences.preferredReviewTimezone,
        );
        setLoadedPreferences(preferences);
        setSavedDailyReviewEnabled(preferences.dailyReviewEnabled);
        setSavedDailyReviewTargetCount(nextDailyReviewTargetCount);
        setSavedPreferredTranslationLanguage(toBackendValue(nextValue));
        setSavedPreferredReviewTime(toReviewTimeBackendValue(nextPreferredReviewTime));
        setSavedPreferredReviewTimezone(
          toReviewTimezoneBackendValue(nextPreferredReviewTimezone),
        );
        setDraftDailyReviewEnabled(preferences.dailyReviewEnabled);
        setDraftDailyReviewTargetCount(nextDailyReviewTargetCount);
        setDraftPreferredTranslationLanguage(nextValue);
        setDraftPreferredReviewTime(nextPreferredReviewTime);
        setDraftPreferredReviewTimezone(nextPreferredReviewTimezone);
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

    if (!loadedPreferences) {
      setErrorMessage("The current settings must be loaded before saving.");
      return;
    }

    const nextPreferredReviewTime = toReviewTimeBackendValue(draftPreferredReviewTime);
    const nextPreferredReviewTimezone = toReviewTimezoneBackendValue(
      draftPreferredReviewTimezone,
    );

    if (draftDailyReviewEnabled && (!nextPreferredReviewTime || !nextPreferredReviewTimezone)) {
      setErrorMessage("Daily review requires both a review time and timezone.");
      setSuccessMessage(null);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedPreferences = await updateLearningPreferences({
        accessToken: session.access_token,
        preferences: {
          ...loadedPreferences,
          dailyReviewEnabled: draftDailyReviewEnabled,
          dailyReviewTargetCount: draftDailyReviewTargetCount,
          preferredReviewTime: nextPreferredReviewTime,
          preferredReviewTimezone: nextPreferredReviewTimezone,
          preferredTranslationLanguage: toBackendValue(draftPreferredTranslationLanguage),
        },
      });

      const nextValue = toSelectValue(updatedPreferences.preferredTranslationLanguage);
      const nextDailyReviewTargetCount = normalizeDailyReviewTargetCount(
        updatedPreferences.dailyReviewTargetCount,
      );
      const savedPreferredReviewTime = toReviewTimeInputValue(
        updatedPreferences.preferredReviewTime,
      );
      const savedPreferredReviewTimezone = toReviewTimezoneInputValue(
        updatedPreferences.preferredReviewTimezone,
      );
      setLoadedPreferences(updatedPreferences);
      setSavedDailyReviewEnabled(updatedPreferences.dailyReviewEnabled);
      setSavedDailyReviewTargetCount(nextDailyReviewTargetCount);
      setSavedPreferredTranslationLanguage(toBackendValue(nextValue));
      setSavedPreferredReviewTime(toReviewTimeBackendValue(savedPreferredReviewTime));
      setSavedPreferredReviewTimezone(toReviewTimezoneBackendValue(savedPreferredReviewTimezone));
      setDraftDailyReviewEnabled(updatedPreferences.dailyReviewEnabled);
      setDraftDailyReviewTargetCount(nextDailyReviewTargetCount);
      setDraftPreferredTranslationLanguage(nextValue);
      setDraftPreferredReviewTime(savedPreferredReviewTime);
      setDraftPreferredReviewTimezone(savedPreferredReviewTimezone);
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

  const normalizedDraftValue = toBackendValue(draftPreferredTranslationLanguage);
  const normalizedDraftReviewTime = toReviewTimeBackendValue(draftPreferredReviewTime);
  const normalizedDraftReviewTimezone = toReviewTimezoneBackendValue(draftPreferredReviewTimezone);
  const reviewTimezoneOptions = getReviewTimezoneOptions(draftPreferredReviewTimezone);
  const hasUnsavedChanges =
    loadedPreferences !== null &&
    (normalizedDraftValue !== savedPreferredTranslationLanguage ||
      draftDailyReviewEnabled !== savedDailyReviewEnabled ||
      draftDailyReviewTargetCount !== savedDailyReviewTargetCount ||
      normalizedDraftReviewTime !== savedPreferredReviewTime ||
      normalizedDraftReviewTimezone !== savedPreferredReviewTimezone);

  function updateDailyReviewTargetCount(nextValue: number) {
    setDraftDailyReviewTargetCount(normalizeDailyReviewTargetCount(nextValue));
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  return (
    <section className="auth-appear mx-auto grid w-full max-w-[40rem] gap-6">
      <div className="flex items-center justify-between gap-3 border-b border-token-border pb-4">
        <Link className="inline-flex items-center gap-2 text-[0.8125rem] text-token-muted transition hover:text-token-brand" href="/dictionary">
          <span aria-hidden="true">←</span>
          Dictionary
        </Link>
      </div>

      <article>
        <h1 className="text-[1.3125rem] font-medium leading-tight text-token-text">Settings</h1>
        <p className="mt-1 text-[0.8125rem] leading-6 text-token-muted">
          Translation, review, and Telegram connection.
        </p>

        <form className="mt-5 grid gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <SettingsControlRow
            label="Preferred translation language"
            copy="Used on dictionary cards."
          >
            <select
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              name="preferred_translation_language"
              value={draftPreferredTranslationLanguage}
              onChange={(event) => {
                setDraftPreferredTranslationLanguage(
                  event.target.value as TranslationLanguageSelectValue,
                );
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              disabled={isLoading || isSaving}
            >
              {TRANSLATION_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsControlRow>

          <SettingsControlRow
            label="Daily review enabled"
            copy="Use Telegram for daily review reminders."
          >
            <div className="grid grid-cols-2 rounded-lg border border-token-border bg-token-surfaceStrong p-1">
              <button
                className={`min-h-9 rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  draftDailyReviewEnabled
                    ? "bg-token-brand text-white"
                    : "text-token-muted hover:text-token-brand"
                }`}
                type="button"
                onClick={() => {
                  setDraftDailyReviewEnabled(true);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                disabled={isLoading || isSaving}
                aria-pressed={draftDailyReviewEnabled}
              >
                On
              </button>
              <button
                className={`min-h-9 rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  !draftDailyReviewEnabled
                    ? "bg-token-brand text-white"
                    : "text-token-muted hover:text-token-brand"
                }`}
                type="button"
                onClick={() => {
                  setDraftDailyReviewEnabled(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                disabled={isLoading || isSaving}
                aria-pressed={!draftDailyReviewEnabled}
              >
                Off
              </button>
            </div>
          </SettingsControlRow>

          <SettingsControlRow
            label="Daily review target count"
            copy="Cards per day, step 5 and max 50."
          >
            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] overflow-hidden rounded-lg border border-token-border bg-token-surfaceStrong">
              <button
                className="min-h-11 text-lg text-token-brand transition hover:bg-token-brandSoft disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                onClick={() => updateDailyReviewTargetCount(draftDailyReviewTargetCount - DAILY_REVIEW_TARGET_STEP)}
                disabled={isLoading || isSaving || draftDailyReviewTargetCount <= DAILY_REVIEW_TARGET_MIN}
                aria-label="Decrease daily review target count"
              >
                −
              </button>
              <input
                className="min-h-11 border-x border-token-border bg-transparent text-center text-sm font-medium text-token-text outline-none disabled:cursor-not-allowed disabled:opacity-60"
                type="number"
                min={DAILY_REVIEW_TARGET_MIN}
                max={DAILY_REVIEW_TARGET_MAX}
                step={DAILY_REVIEW_TARGET_STEP}
                value={draftDailyReviewTargetCount}
                onChange={(event) => updateDailyReviewTargetCount(event.currentTarget.valueAsNumber)}
                disabled={isLoading || isSaving}
              />
              <button
                className="min-h-11 text-lg text-token-brand transition hover:bg-token-brandSoft disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                onClick={() => updateDailyReviewTargetCount(draftDailyReviewTargetCount + DAILY_REVIEW_TARGET_STEP)}
                disabled={isLoading || isSaving || draftDailyReviewTargetCount >= DAILY_REVIEW_TARGET_MAX}
                aria-label="Increase daily review target count"
              >
                +
              </button>
            </div>
          </SettingsControlRow>

          <SettingsControlRow
            label="Preferred review time"
            copy="Local time for the daily review reminder."
          >
            <input
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              type="time"
              value={draftPreferredReviewTime}
              required={draftDailyReviewEnabled}
              aria-invalid={draftDailyReviewEnabled && !normalizedDraftReviewTime}
              onChange={(event) => {
                setDraftPreferredReviewTime(event.currentTarget.value);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              disabled={isLoading || isSaving}
            />
          </SettingsControlRow>

          <SettingsControlRow
            label="Preferred review timezone"
            copy="IANA timezone for the daily review reminder."
          >
            <select
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              name="preferred_review_timezone"
              value={draftPreferredReviewTimezone}
              required={draftDailyReviewEnabled}
              aria-invalid={draftDailyReviewEnabled && !normalizedDraftReviewTimezone}
              onChange={(event) => {
                setDraftPreferredReviewTimezone(event.target.value);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              disabled={isLoading || isSaving}
            >
              {reviewTimezoneOptions.map((option) => (
                <option key={option.value || "none"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsControlRow>

          <div className="grid gap-3">
            {isLoading ? <SettingsStateMessage tone="neutral" message="Loading current settings…" /> : null}

            {errorMessage ? (
              <SettingsStateMessage tone="error" message={errorMessage} />
            ) : null}

            {successMessage ? <SettingsStateMessage tone="success" message={successMessage} /> : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-token-border pt-5">
            <button
              className="inline-flex min-h-10 min-w-[8.25rem] items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isLoading || isSaving || loadedPreferences === null || !hasUnsavedChanges}
            >
              {isSaving ? "Saving..." : "Save settings"}
            </button>

            {errorMessage ? (
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-token-brand bg-transparent px-5 text-sm font-medium text-token-brand transition hover:bg-token-brandSoft disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={() => setReloadToken((currentValue) => currentValue + 1)}
                disabled={isSaving}
              >
                Try again
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <TelegramLinkPanel />
    </section>
  );
}
