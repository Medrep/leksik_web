import { BackendRequestError, fetchBackendJson } from "@/lib/backend-client";

const DAILY_REVIEW_ENABLED_KEY = "daily_review_enabled";
const DAILY_REVIEW_TARGET_COUNT_KEY = "daily_review_target_count";
const PREFERRED_REVIEW_TIME_KEY = "preferred_review_time";
const PREFERRED_REVIEW_TIMEZONE_KEY = "preferred_review_timezone";
const PREFERRED_TRANSLATION_LANGUAGE_KEY = "preferred_translation_language";
const DEFAULT_DAILY_REVIEW_ENABLED = false;
const DEFAULT_DAILY_REVIEW_TARGET_COUNT = 10;

export type LearningPreferences = {
  dailyReviewEnabled: boolean;
  dailyReviewTargetCount: number;
  preferredReviewTime: string | null;
  preferredReviewTimezone: string | null;
  preferredTranslationLanguage: string | null;
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
  };
}

function toLearningPreferencesPayload(preferences: LearningPreferences) {
  return {
    [DAILY_REVIEW_ENABLED_KEY]: preferences.dailyReviewEnabled,
    [DAILY_REVIEW_TARGET_COUNT_KEY]: preferences.dailyReviewTargetCount,
    [PREFERRED_REVIEW_TIME_KEY]: preferences.preferredReviewTime,
    [PREFERRED_REVIEW_TIMEZONE_KEY]: preferences.preferredReviewTimezone,
    [PREFERRED_TRANSLATION_LANGUAGE_KEY]: preferences.preferredTranslationLanguage,
  };
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
  preferences,
  signal,
}: {
  accessToken: string;
  preferences: LearningPreferences;
  signal?: AbortSignal;
}) {
  const payload = await fetchBackendJson<unknown>({
    accessToken,
    body: toLearningPreferencesPayload(preferences),
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
