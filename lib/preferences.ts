import { BackendRequestError, fetchBackendJson } from "@/lib/backend-client";
import { isUiLocale, type UiLocale } from "@/lib/ui-locale-options";

const DAILY_REVIEW_ENABLED_KEY = "daily_review_enabled";
const DAILY_REVIEW_TARGET_COUNT_KEY = "daily_review_target_count";
const PREFERRED_REVIEW_TIME_KEY = "preferred_review_time";
const PREFERRED_REVIEW_TIMEZONE_KEY = "preferred_review_timezone";
const PREFERRED_TRANSLATION_LANGUAGE_KEY = "preferred_translation_language";
const LEARNING_LANGUAGE_KEY = "learning_language";
const UI_LOCALE_KEY = "ui_locale";
const DEFAULT_DAILY_REVIEW_ENABLED = false;
const DEFAULT_DAILY_REVIEW_TARGET_COUNT = 10;

export type LearningPreferences = {
  dailyReviewEnabled: boolean;
  dailyReviewTargetCount: number;
  preferredReviewTime: string | null;
  preferredReviewTimezone: string | null;
  preferredTranslationLanguage: string | null;
  learningLanguage: string | null;
  uiLocale: UiLocale | null;
};

export type LearningPreferencesUpdate = {
  dailyReviewEnabled?: boolean;
  dailyReviewTargetCount?: number;
  preferredReviewTime?: string | null;
  preferredReviewTimezone?: string | null;
  preferredTranslationLanguage?: string | null;
  learningLanguage?: string | null;
  uiLocale?: UiLocale | null;
};

function normalizeBooleanPreference(value: unknown, key: string) {
  if (value === null || value === undefined) {
    return DEFAULT_DAILY_REVIEW_ENABLED;
  }

  if (typeof value !== "boolean") {
    throw new Error(`Backend returned an invalid ${key} value.`);
  }

  return value;
}

function normalizeIntegerPreference(value: unknown, key: string) {
  if (value === null || value === undefined) {
    return DEFAULT_DAILY_REVIEW_TARGET_COUNT;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`Backend returned an invalid ${key} value.`);
  }

  return value;
}

function normalizeNullableStringPreference(value: unknown, key: string) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Backend returned an invalid ${key} value.`);
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function normalizeUiLocalePreference(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string" || !isUiLocale(value)) {
    throw new Error(`Backend returned an invalid ${UI_LOCALE_KEY} value.`);
  }

  return value;
}

function normalizeLearningPreferences(payload: unknown): LearningPreferences {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Backend returned an invalid learning preferences response.");
  }

  const record = payload as Record<string, unknown>;

  return {
    dailyReviewEnabled: normalizeBooleanPreference(
      record[DAILY_REVIEW_ENABLED_KEY],
      DAILY_REVIEW_ENABLED_KEY,
    ),
    dailyReviewTargetCount: normalizeIntegerPreference(
      record[DAILY_REVIEW_TARGET_COUNT_KEY],
      DAILY_REVIEW_TARGET_COUNT_KEY,
    ),
    preferredReviewTime: normalizeNullableStringPreference(
      record[PREFERRED_REVIEW_TIME_KEY],
      PREFERRED_REVIEW_TIME_KEY,
    ),
    preferredReviewTimezone: normalizeNullableStringPreference(
      record[PREFERRED_REVIEW_TIMEZONE_KEY],
      PREFERRED_REVIEW_TIMEZONE_KEY,
    ),
    preferredTranslationLanguage: normalizeNullableStringPreference(
      record[PREFERRED_TRANSLATION_LANGUAGE_KEY],
      PREFERRED_TRANSLATION_LANGUAGE_KEY,
    ),
    learningLanguage: normalizeNullableStringPreference(
      record[LEARNING_LANGUAGE_KEY],
      LEARNING_LANGUAGE_KEY,
    ),
    uiLocale: normalizeUiLocalePreference(record[UI_LOCALE_KEY]),
  };
}

function toLearningPreferencesPayload(update: LearningPreferencesUpdate) {
  const payload: Record<string, boolean | number | string | null> = {};

  if (
    Object.prototype.hasOwnProperty.call(update, "dailyReviewEnabled") &&
    update.dailyReviewEnabled !== undefined
  ) {
    payload[DAILY_REVIEW_ENABLED_KEY] = update.dailyReviewEnabled;
  }

  if (
    Object.prototype.hasOwnProperty.call(update, "dailyReviewTargetCount") &&
    update.dailyReviewTargetCount !== undefined
  ) {
    payload[DAILY_REVIEW_TARGET_COUNT_KEY] = update.dailyReviewTargetCount;
  }

  if (
    Object.prototype.hasOwnProperty.call(update, "preferredReviewTime") &&
    update.preferredReviewTime !== undefined
  ) {
    payload[PREFERRED_REVIEW_TIME_KEY] = update.preferredReviewTime;
  }

  if (
    Object.prototype.hasOwnProperty.call(update, "preferredReviewTimezone") &&
    update.preferredReviewTimezone !== undefined
  ) {
    payload[PREFERRED_REVIEW_TIMEZONE_KEY] = update.preferredReviewTimezone;
  }

  if (
    Object.prototype.hasOwnProperty.call(update, "preferredTranslationLanguage") &&
    update.preferredTranslationLanguage !== undefined
  ) {
    payload[PREFERRED_TRANSLATION_LANGUAGE_KEY] = update.preferredTranslationLanguage;
  }

  if (
    Object.prototype.hasOwnProperty.call(update, "learningLanguage") &&
    update.learningLanguage !== undefined
  ) {
    payload[LEARNING_LANGUAGE_KEY] = update.learningLanguage;
  }

  if (
    Object.prototype.hasOwnProperty.call(update, "uiLocale") &&
    update.uiLocale !== undefined
  ) {
    payload[UI_LOCALE_KEY] = update.uiLocale;
  }

  return payload;
}

export async function fetchLearningPreferences({
  accessToken,
  signal,
}: {
  accessToken: string;
  signal?: AbortSignal;
}) {
  const payload = await fetchBackendJson<unknown>({
    accessToken,
    path: "/preferences/learning",
    signal,
  });

  return normalizeLearningPreferences(payload);
}

export async function updateLearningPreferences({
  accessToken,
  update,
  signal,
}: {
  accessToken: string;
  update: LearningPreferencesUpdate;
  signal?: AbortSignal;
}) {
  const payload = await fetchBackendJson<unknown>({
    accessToken,
    body: toLearningPreferencesPayload(update),
    method: "PUT",
    path: "/preferences/learning",
    signal,
  });

  return normalizeLearningPreferences(payload);
}

export function getPreferencesRequestMessage(error: unknown, fallback: string) {
  if (error instanceof BackendRequestError && error.message.trim()) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
