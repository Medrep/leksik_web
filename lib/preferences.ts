import { BackendRequestError, fetchBackendJson } from "@/lib/backend-client";

// Accepted current settings contract for the web client:
// `preferred_translation_language` is the only explicitly modeled field in this slice.
const PREFERRED_TRANSLATION_LANGUAGE_KEY = "preferred_translation_language";

export type LearningPreferences = {
  preferredTranslationLanguage: string | null;
};

function normalizePreferredTranslationLanguage(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Backend returned an invalid preferred_translation_language value.");
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
    preferredTranslationLanguage: normalizePreferredTranslationLanguage(
      record[PREFERRED_TRANSLATION_LANGUAGE_KEY],
    ),
  };
}

function toLearningPreferencesPayload(preferences: LearningPreferences) {
  return {
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
