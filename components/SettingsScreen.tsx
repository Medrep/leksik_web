"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLocale } from "@/components/LocaleProvider";
import { TelegramLinkPanel } from "@/components/TelegramLinkPanel";
import { deleteAccount } from "@/lib/account";
import { BackendRequestError } from "@/lib/backend-client";
import {
  fetchLearningPreferences,
  type LearningPreferences,
  type LearningPreferencesUpdate,
  updateLearningPreferences,
} from "@/lib/preferences";
import type { SettingsMessages } from "@/lib/i18n/messages";
import { isLanguageCode, LANGUAGE_OPTIONS, type LanguageCode } from "@/lib/language-options";
import { UI_LOCALE_OPTIONS, type UiLocale } from "@/lib/ui-locale-options";
import { invalidateCachedDictionaryReadDataForUser } from "@/lib/vocab-cache";

type TranslationLanguageSelectValue = "" | LanguageCode;
type LearningLanguageSelectValue = "" | LanguageCode;
type UiLocaleSelectValue = "" | UiLocale;

const DAILY_REVIEW_TARGET_STEP = 5;
const DAILY_REVIEW_TARGET_MIN = 5;
const DAILY_REVIEW_TARGET_MAX = 50;
const ACCOUNT_DELETE_CONFIRMATION = "DELETE";

const REVIEW_TIMEZONE_VALUES = [
  "UTC",
  "Europe/Warsaw",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Kyiv",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
];

type SettingsError =
  | { kind: "backend"; message: string }
  | { kind: "localized"; key: keyof SettingsMessages["errors"] };

function toSettingsError(
  error: unknown,
  fallbackKey: keyof SettingsMessages["errors"],
): SettingsError {
  if (error instanceof BackendRequestError) {
    if (error.status === 422) {
      return { kind: "localized", key: "validation" };
    }

    if (error.message.trim()) {
      return { kind: "backend", message: error.message };
    }
  }

  return { kind: "localized", key: fallbackKey };
}

function toSelectValue(value: string | null): TranslationLanguageSelectValue {
  if (value === null) {
    return "";
  }

  if (isLanguageCode(value)) {
    return value;
  }

  throw new Error("Backend returned an unsupported preferred_translation_language value.");
}

function toBackendValue(value: TranslationLanguageSelectValue): LanguageCode | null {
  return value === "" ? null : value;
}

function toLearningLanguageSelectValue(value: string | null): LearningLanguageSelectValue {
  if (value === null) {
    return "";
  }

  if (isLanguageCode(value)) {
    return value;
  }

  throw new Error("Backend returned an unsupported learning_language value.");
}

function toLearningLanguageBackendValue(value: LearningLanguageSelectValue): string | null {
  return value === "" ? null : value;
}

function toUiLocaleSelectValue(value: UiLocale | null): UiLocaleSelectValue {
  return value ?? "";
}

function toUiLocaleBackendValue(value: UiLocaleSelectValue): UiLocale | null {
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

function getReviewTimezoneOptions(selectedValue: string, messages: SettingsMessages) {
  const normalizedSelectedValue = toReviewTimezoneBackendValue(selectedValue);
  const options = [
    { label: messages.reviewTimezone.none, value: "" },
    ...REVIEW_TIMEZONE_VALUES.map((value) => ({ label: value, value })),
  ];

  if (
    normalizedSelectedValue === null ||
    options.some((option) => option.value === normalizedSelectedValue)
  ) {
    return options;
  }

  return [
    ...options,
    {
      label: `${normalizedSelectedValue} (${messages.reviewTimezone.currentSuffix})`,
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
    <section className="w-full min-w-0 max-w-full border-t border-token-border pt-4">
      <div className="grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.42fr)] sm:items-start">
        <div className="w-full min-w-0 max-w-full">
          <h2 className="text-[0.6875rem] uppercase tracking-[0.16em] text-token-muted/65">
            {label}
          </h2>
          <p className="mt-1 break-words text-[0.8125rem] leading-5 text-token-muted">{copy}</p>
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
    <div className={`min-w-0 max-w-full rounded-xl border px-4 py-3 ${toneClassName}`}>
      <p className="break-words text-[0.8125rem] leading-5">{message}</p>
    </div>
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const { clearAuthenticatedState, refreshBootstrap, session, signOut, user } = useAuth();
  const { acceptAuthoritativeUiLocale, settingsMessages } = useLocale();
  const [draftDailyReviewEnabled, setDraftDailyReviewEnabled] = useState(false);
  const [draftDailyReviewTargetCount, setDraftDailyReviewTargetCount] = useState(10);
  const [draftPreferredTranslationLanguage, setDraftPreferredTranslationLanguage] =
    useState<TranslationLanguageSelectValue>("");
  const [draftLearningLanguage, setDraftLearningLanguage] =
    useState<LearningLanguageSelectValue>("");
  const [draftUiLocale, setDraftUiLocale] = useState<UiLocaleSelectValue>("");
  const [draftPreferredReviewTime, setDraftPreferredReviewTime] = useState("");
  const [draftPreferredReviewTimezone, setDraftPreferredReviewTimezone] = useState("");
  const [loadedPreferences, setLoadedPreferences] = useState<LearningPreferences | null>(null);
  const [savedDailyReviewEnabled, setSavedDailyReviewEnabled] = useState(false);
  const [savedDailyReviewTargetCount, setSavedDailyReviewTargetCount] = useState(10);
  const [savedPreferredTranslationLanguage, setSavedPreferredTranslationLanguage] =
    useState<LanguageCode | null>(null);
  const [savedLearningLanguage, setSavedLearningLanguage] = useState<string | null>(null);
  const [savedUiLocale, setSavedUiLocale] = useState<UiLocale | null>(null);
  const [savedPreferredReviewTime, setSavedPreferredReviewTime] = useState<string | null>(null);
  const [savedPreferredReviewTimezone, setSavedPreferredReviewTimezone] = useState<string | null>(
    null,
  );
  const [settingsError, setSettingsError] = useState<SettingsError | null>(null);
  const [hasSaveSuccess, setHasSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [hasDeleteError, setHasDeleteError] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const accessToken = session.access_token;
    const controller = new AbortController();

    async function loadPreferences() {
      setIsLoading(true);
      setSettingsError(null);
      setHasSaveSuccess(false);

      try {
        const preferences = await fetchLearningPreferences({
          accessToken,
          signal: controller.signal,
        });

        const nextValue = toSelectValue(preferences.preferredTranslationLanguage);
        const nextLearningLanguage = toLearningLanguageSelectValue(preferences.learningLanguage);
        const nextUiLocale = toUiLocaleSelectValue(preferences.uiLocale);
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
        setSavedLearningLanguage(toLearningLanguageBackendValue(nextLearningLanguage));
        setSavedUiLocale(toUiLocaleBackendValue(nextUiLocale));
        setSavedPreferredReviewTime(toReviewTimeBackendValue(nextPreferredReviewTime));
        setSavedPreferredReviewTimezone(
          toReviewTimezoneBackendValue(nextPreferredReviewTimezone),
        );
        setDraftDailyReviewEnabled(preferences.dailyReviewEnabled);
        setDraftDailyReviewTargetCount(nextDailyReviewTargetCount);
        setDraftPreferredTranslationLanguage(nextValue);
        setDraftLearningLanguage(nextLearningLanguage);
        setDraftUiLocale(nextUiLocale);
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

        setSettingsError(toSettingsError(error, "load"));
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
      setSettingsError({ kind: "localized", key: "mustLoadBeforeSave" });
      return;
    }

    const nextPreferredReviewTime = toReviewTimeBackendValue(draftPreferredReviewTime);
    const nextPreferredReviewTimezone = toReviewTimezoneBackendValue(
      draftPreferredReviewTimezone,
    );
    const nextPreferredTranslationLanguage = toBackendValue(draftPreferredTranslationLanguage);
    const nextLearningLanguage = toLearningLanguageBackendValue(draftLearningLanguage);
    const nextUiLocale = toUiLocaleBackendValue(draftUiLocale);

    if (draftDailyReviewEnabled && (!nextPreferredReviewTime || !nextPreferredReviewTimezone)) {
      setSettingsError({ kind: "localized", key: "dailyReviewRequiresSchedule" });
      setHasSaveSuccess(false);
      return;
    }

    const update: LearningPreferencesUpdate = {};

    if (draftDailyReviewEnabled !== savedDailyReviewEnabled) {
      update.dailyReviewEnabled = draftDailyReviewEnabled;
    }

    if (draftDailyReviewTargetCount !== savedDailyReviewTargetCount) {
      update.dailyReviewTargetCount = draftDailyReviewTargetCount;
    }

    if (nextPreferredReviewTime !== savedPreferredReviewTime) {
      update.preferredReviewTime = nextPreferredReviewTime;
    }

    if (nextPreferredReviewTimezone !== savedPreferredReviewTimezone) {
      update.preferredReviewTimezone = nextPreferredReviewTimezone;
    }

    if (nextPreferredTranslationLanguage !== savedPreferredTranslationLanguage) {
      update.preferredTranslationLanguage = nextPreferredTranslationLanguage;
    }

    if (nextLearningLanguage !== savedLearningLanguage) {
      update.learningLanguage = nextLearningLanguage;
    }

    if (nextUiLocale !== savedUiLocale) {
      update.uiLocale = nextUiLocale;
    }

    if (Object.keys(update).length === 0) {
      return;
    }

    setIsSaving(true);
    setSettingsError(null);
    setHasSaveSuccess(false);

    try {
      const updatedPreferences = await updateLearningPreferences({
        accessToken: session.access_token,
        update,
      });

      const nextValue = toSelectValue(updatedPreferences.preferredTranslationLanguage);
      const nextLearningLanguage = toLearningLanguageSelectValue(
        updatedPreferences.learningLanguage,
      );
      const nextUiLocale = toUiLocaleSelectValue(updatedPreferences.uiLocale);
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
      setSavedLearningLanguage(toLearningLanguageBackendValue(nextLearningLanguage));
      setSavedUiLocale(toUiLocaleBackendValue(nextUiLocale));
      setSavedPreferredReviewTime(toReviewTimeBackendValue(savedPreferredReviewTime));
      setSavedPreferredReviewTimezone(toReviewTimezoneBackendValue(savedPreferredReviewTimezone));
      setDraftDailyReviewEnabled(updatedPreferences.dailyReviewEnabled);
      setDraftDailyReviewTargetCount(nextDailyReviewTargetCount);
      setDraftPreferredTranslationLanguage(nextValue);
      setDraftLearningLanguage(nextLearningLanguage);
      setDraftUiLocale(nextUiLocale);
      setDraftPreferredReviewTime(savedPreferredReviewTime);
      setDraftPreferredReviewTimezone(savedPreferredReviewTimezone);
      acceptAuthoritativeUiLocale(updatedPreferences.uiLocale);
      if (user?.id) {
        invalidateCachedDictionaryReadDataForUser(user.id);
      }
      setHasSaveSuccess(true);
    } catch (error) {
      if (error instanceof BackendRequestError && error.status === 401) {
        void refreshBootstrap();
        return;
      }

      setSettingsError(toSettingsError(error, "save"));
    } finally {
      setIsSaving(false);
    }
  }

  const normalizedDraftValue = toBackendValue(draftPreferredTranslationLanguage);
  const normalizedDraftLearningLanguage = toLearningLanguageBackendValue(draftLearningLanguage);
  const normalizedDraftUiLocale = toUiLocaleBackendValue(draftUiLocale);
  const normalizedDraftReviewTime = toReviewTimeBackendValue(draftPreferredReviewTime);
  const normalizedDraftReviewTimezone = toReviewTimezoneBackendValue(draftPreferredReviewTimezone);
  const translationLanguageOptions: ReadonlyArray<{
    label: string;
    value: TranslationLanguageSelectValue;
  }> = [
    { label: settingsMessages.translationLanguage.noTranslation, value: "" },
    ...LANGUAGE_OPTIONS.map((option) => ({
      label: settingsMessages.languageNames[option.value],
      value: option.value,
    })),
  ];
  const learningLanguageOptions: ReadonlyArray<{
    label: string;
    value: LearningLanguageSelectValue;
  }> = [
    { label: settingsMessages.learningLanguage.notSelected, value: "" },
    ...LANGUAGE_OPTIONS.map((option) => ({
      label: settingsMessages.languageNames[option.value],
      value: option.value,
    })),
  ];
  const interfaceLanguageOptions: ReadonlyArray<{
    label: string;
    value: UiLocaleSelectValue;
  }> = [
    { label: settingsMessages.interfaceLanguage.systemDefault, value: "" },
    ...UI_LOCALE_OPTIONS.map((option) => ({
      label: settingsMessages.interfaceLanguage.localeNames[option.value],
      value: option.value,
    })),
  ];
  const reviewTimezoneOptions = getReviewTimezoneOptions(
    draftPreferredReviewTimezone,
    settingsMessages,
  );
  const errorMessage = settingsError
    ? settingsError.kind === "backend"
      ? settingsError.message
      : settingsMessages.errors[settingsError.key]
    : null;
  const hasUnsavedChanges =
    loadedPreferences !== null &&
    (normalizedDraftValue !== savedPreferredTranslationLanguage ||
      normalizedDraftLearningLanguage !== savedLearningLanguage ||
      normalizedDraftUiLocale !== savedUiLocale ||
      draftDailyReviewEnabled !== savedDailyReviewEnabled ||
      draftDailyReviewTargetCount !== savedDailyReviewTargetCount ||
      normalizedDraftReviewTime !== savedPreferredReviewTime ||
      normalizedDraftReviewTimezone !== savedPreferredReviewTimezone);

  function updateDailyReviewTargetCount(nextValue: number) {
    setDraftDailyReviewTargetCount(normalizeDailyReviewTargetCount(nextValue));
    setSettingsError(null);
    setHasSaveSuccess(false);
  }

  async function finishDeletedAccountSession() {
    const result = await signOut();

    if (result.error) {
      clearAuthenticatedState();
    }

    router.replace("/");
  }

  function openDeleteDialog() {
    setDeleteConfirmation("");
    setHasDeleteError(false);
    setIsDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    if (isDeletingAccount) {
      return;
    }

    setIsDeleteDialogOpen(false);
    setDeleteConfirmation("");
    setHasDeleteError(false);
  }

  async function handleDeleteAccountSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDeletingAccount || deleteConfirmation !== ACCOUNT_DELETE_CONFIRMATION) {
      return;
    }

    if (!session?.access_token) {
      await finishDeletedAccountSession();
      return;
    }

    setIsDeletingAccount(true);
    setHasDeleteError(false);

    try {
      await deleteAccount({ accessToken: session.access_token });
      await finishDeletedAccountSession();
    } catch (error) {
      if (error instanceof BackendRequestError && error.status === 401) {
        await finishDeletedAccountSession();
        return;
      }

      setHasDeleteError(true);
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <section className="auth-appear mx-auto grid w-full min-w-0 max-w-full gap-6 sm:max-w-[40rem]">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-token-border pb-4">
        <Link className="inline-flex items-center gap-2 text-[0.8125rem] text-token-muted transition hover:text-token-brand" href="/dictionary">
          <span aria-hidden="true">←</span>
          {settingsMessages.navigation.dictionary}
        </Link>
      </div>

      <article className="w-full min-w-0 max-w-full">
        <h1 className="break-words text-[1.3125rem] font-medium leading-tight text-token-text">
          {settingsMessages.page.title}
        </h1>
        <p className="mt-1 break-words text-[0.8125rem] leading-6 text-token-muted">
          {settingsMessages.page.subtitle}
        </p>

        <form className="mt-5 grid w-full min-w-0 max-w-full gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <SettingsControlRow
            label={settingsMessages.learningLanguage.label}
            copy={settingsMessages.learningLanguage.description}
          >
            <select
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              name="learning_language"
              value={draftLearningLanguage}
              onChange={(event) => {
                setDraftLearningLanguage(event.target.value as LearningLanguageSelectValue);
                setSettingsError(null);
                setHasSaveSuccess(false);
              }}
              disabled={isLoading || isSaving}
            >
              {learningLanguageOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsControlRow>

          <SettingsControlRow
            label={settingsMessages.translationLanguage.label}
            copy={settingsMessages.translationLanguage.description}
          >
            <select
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              name="preferred_translation_language"
              value={draftPreferredTranslationLanguage}
              onChange={(event) => {
                setDraftPreferredTranslationLanguage(
                  event.target.value as TranslationLanguageSelectValue,
                );
                setSettingsError(null);
                setHasSaveSuccess(false);
              }}
              disabled={isLoading || isSaving}
            >
              {translationLanguageOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsControlRow>

          <SettingsControlRow
            label={settingsMessages.interfaceLanguage.label}
            copy={settingsMessages.interfaceLanguage.description}
          >
            <select
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              name="ui_locale"
              value={draftUiLocale}
              onChange={(event) => {
                setDraftUiLocale(event.target.value as UiLocaleSelectValue);
                setSettingsError(null);
                setHasSaveSuccess(false);
              }}
              disabled={isLoading || isSaving}
            >
              {interfaceLanguageOptions.map((option) => (
                <option key={option.value || "default"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsControlRow>

          <SettingsControlRow
            label={settingsMessages.dailyReview.enabledLabel}
            copy={settingsMessages.dailyReview.enabledDescription}
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
                  setSettingsError(null);
                  setHasSaveSuccess(false);
                }}
                disabled={isLoading || isSaving}
                aria-pressed={draftDailyReviewEnabled}
              >
                {settingsMessages.dailyReview.on}
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
                  setSettingsError(null);
                  setHasSaveSuccess(false);
                }}
                disabled={isLoading || isSaving}
                aria-pressed={!draftDailyReviewEnabled}
              >
                {settingsMessages.dailyReview.off}
              </button>
            </div>
          </SettingsControlRow>

          <SettingsControlRow
            label={settingsMessages.dailyReview.targetLabel}
            copy={settingsMessages.dailyReview.targetDescription}
          >
            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] overflow-hidden rounded-lg border border-token-border bg-token-surfaceStrong">
              <button
                className="min-h-11 text-lg text-token-brand transition hover:bg-token-brandSoft disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                onClick={() => updateDailyReviewTargetCount(draftDailyReviewTargetCount - DAILY_REVIEW_TARGET_STEP)}
                disabled={isLoading || isSaving || draftDailyReviewTargetCount <= DAILY_REVIEW_TARGET_MIN}
                aria-label={settingsMessages.dailyReview.decreaseTarget}
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
                aria-label={settingsMessages.dailyReview.increaseTarget}
              >
                +
              </button>
            </div>
          </SettingsControlRow>

          <SettingsControlRow
            label={settingsMessages.reviewTime.label}
            copy={settingsMessages.reviewTime.description}
          >
            <input
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              type="time"
              value={draftPreferredReviewTime}
              required={draftDailyReviewEnabled}
              aria-invalid={draftDailyReviewEnabled && !normalizedDraftReviewTime}
              onChange={(event) => {
                setDraftPreferredReviewTime(event.currentTarget.value);
                setSettingsError(null);
                setHasSaveSuccess(false);
              }}
              disabled={isLoading || isSaving}
            />
          </SettingsControlRow>

          <SettingsControlRow
            label={settingsMessages.reviewTimezone.label}
            copy={settingsMessages.reviewTimezone.description}
          >
            <select
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              name="preferred_review_timezone"
              value={draftPreferredReviewTimezone}
              required={draftDailyReviewEnabled}
              aria-invalid={draftDailyReviewEnabled && !normalizedDraftReviewTimezone}
              onChange={(event) => {
                setDraftPreferredReviewTimezone(event.target.value);
                setSettingsError(null);
                setHasSaveSuccess(false);
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
            {isLoading ? (
              <SettingsStateMessage tone="neutral" message={settingsMessages.feedback.loading} />
            ) : null}

            {errorMessage ? (
              <SettingsStateMessage tone="error" message={errorMessage} />
            ) : null}

            {hasSaveSuccess ? (
              <SettingsStateMessage tone="success" message={settingsMessages.feedback.saved} />
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-token-border pt-5">
            <button
              className="inline-flex min-h-10 min-w-[8.25rem] items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isLoading || isSaving || loadedPreferences === null || !hasUnsavedChanges}
            >
              {isSaving ? settingsMessages.feedback.saving : settingsMessages.feedback.save}
            </button>

            {errorMessage ? (
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-token-brand bg-transparent px-5 text-sm font-medium text-token-brand transition hover:bg-token-brandSoft disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={() => setReloadToken((currentValue) => currentValue + 1)}
                disabled={isSaving}
              >
                {settingsMessages.feedback.retry}
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <TelegramLinkPanel />

      <section className="w-full min-w-0 max-w-full border-t border-[#E8B7AF] pt-5">
        <div className="grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="w-full min-w-0 max-w-full">
            <h2 className="text-[0.6875rem] uppercase tracking-[0.16em] text-[#9A3C32]">
              {settingsMessages.accountDeletion.sectionTitle}
            </h2>
            <p className="mt-1 break-words text-[0.8125rem] leading-5 text-token-muted">
              {settingsMessages.accountDeletion.sectionDescription}
            </p>
          </div>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#C94234] bg-[#FFF4F1] px-5 text-sm font-semibold text-[#9A2F25] transition hover:bg-[#FFE7E1] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={openDeleteDialog}
            disabled={isDeletingAccount}
          >
            {settingsMessages.accountDeletion.openButton}
          </button>
        </div>
      </section>

      {isDeleteDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex min-w-0 items-center justify-center bg-black/35 px-4 py-6"
          role="presentation"
        >
          <div
            aria-labelledby="delete-account-dialog-title"
            aria-modal="true"
            className="w-full max-w-lg rounded-xl border border-[#E8B7AF] bg-token-surfaceStrong p-5 shadow-shell sm:p-6"
            role="dialog"
          >
            <form className="grid gap-4" onSubmit={(event) => void handleDeleteAccountSubmit(event)}>
              <div className="grid gap-2">
                <h2
                  className="break-words text-lg font-semibold leading-tight text-token-text"
                  id="delete-account-dialog-title"
                >
                  {settingsMessages.accountDeletion.modalTitle}
                </h2>
                <p className="break-words text-[0.875rem] leading-6 text-token-muted">
                  {settingsMessages.accountDeletion.modalDescription}
                </p>
                <p className="break-words text-[0.875rem] leading-6 text-token-muted">
                  {settingsMessages.accountDeletion.irreversible}
                </p>
                <p className="break-words text-[0.8125rem] leading-5 text-token-muted">
                  {settingsMessages.accountDeletion.retention}
                </p>
              </div>

              <label className="grid gap-2 text-[0.8125rem] font-medium text-token-text">
                {settingsMessages.accountDeletion.confirmationLabel}
                <input
                  autoComplete="off"
                  className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-[#C94234] disabled:cursor-not-allowed disabled:opacity-60"
                  value={deleteConfirmation}
                  onChange={(event) => {
                    setDeleteConfirmation(event.currentTarget.value);
                    setHasDeleteError(false);
                  }}
                  disabled={isDeletingAccount}
                />
              </label>

              {hasDeleteError ? (
                <SettingsStateMessage tone="error" message={settingsMessages.errors.deleteAccount} />
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 border-t border-token-border pt-4">
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-token-border bg-transparent px-5 text-sm font-medium text-token-muted transition hover:bg-token-brandSoft disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={isDeletingAccount}
                >
                  {settingsMessages.accountDeletion.cancel}
                </button>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#C94234] px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={
                    isDeletingAccount || deleteConfirmation !== ACCOUNT_DELETE_CONFIRMATION
                  }
                >
                  {isDeletingAccount
                    ? settingsMessages.accountDeletion.deleting
                    : settingsMessages.accountDeletion.confirmButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
