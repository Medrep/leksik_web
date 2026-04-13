import { BackendRequestError, fetchBackendJson } from "@/lib/backend-client";

// Confirmed backend contract for the web-client release:
// GET /vocab supports `search`, `language`, and `learning_status`.
const VOCAB_SEARCH_QUERY_PARAM = "search";

// Confirmed project evidence from accepted docs/session history includes
// snake_case response fields like display_text, canonical_text,
// short_explanation, examples, and learning_status.
// Exact GET /vocab and GET /vocab/{item_id} response envelope shapes are still
// partially documented here, so only the confirmed narrow snake_case field family
// is normalized below. Response-envelope handling remains conservative.
const LIST_TITLE_KEYS = ["display_text", "canonical_text"] as const;
const LIST_SUMMARY_KEYS = ["translation", "short_explanation"] as const;
const LANGUAGE_KEYS = ["language"] as const;
const LEARNING_STATUS_KEYS = ["learning_status"] as const;
const DETAIL_CANONICAL_KEYS = ["canonical_text"] as const;
const DETAIL_MEANING_KEYS = ["short_explanation"] as const;
const ITEM_ID_KEYS = ["item_id", "id", "vocabulary_item_id"] as const;

export type DictionaryListItem = {
  id: string;
  learningStatus: string | null;
  language: string | null;
  summary: string | null;
  title: string;
};

export type DictionaryCardDetails = {
  canonicalForm: string | null;
  examples: string[];
  id: string;
  language: string | null;
  learningStatus: string | null;
  meaning: string | null;
  title: string;
  translation: string | null;
};

function pickString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function pickExamples(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string" && item.trim()) {
          return item.trim();
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return pickString(record, ["text", "content", "example", "sentence", "value"]);
        }

        return null;
      })
      .filter((item): item is string => item !== null);
  }

  if (typeof raw === "string" && raw.trim()) {
    return [raw.trim()];
  }

  return [];
}

function normalizeDictionaryListItem(raw: unknown) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const id = pickString(record, [...ITEM_ID_KEYS]);

  if (!id) {
    return null;
  }

  return {
    id,
    title: pickString(record, [...LIST_TITLE_KEYS]) ?? "Saved item",
    summary: pickString(record, [...LIST_SUMMARY_KEYS]),
    language: pickString(record, [...LANGUAGE_KEYS]),
    learningStatus: pickString(record, [...LEARNING_STATUS_KEYS]),
  } satisfies DictionaryListItem;
}

function normalizeDictionaryListResponse(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload
      .map(normalizeDictionaryListItem)
      .filter((item): item is DictionaryListItem => item !== null);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const container =
    (Array.isArray(record.items) && record.items) ||
    (Array.isArray(record.results) && record.results) ||
    (Array.isArray(record.data) && record.data) ||
    [];

  return container
    .map(normalizeDictionaryListItem)
    .filter((item): item is DictionaryListItem => item !== null);
}

function normalizeDictionaryCardDetails(raw: unknown): DictionaryCardDetails | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const id = pickString(record, [...ITEM_ID_KEYS]);

  if (!id) {
    return null;
  }

  return {
    canonicalForm: pickString(record, [...DETAIL_CANONICAL_KEYS]),
    examples: pickExamples(record.examples),
    id,
    language: pickString(record, [...LANGUAGE_KEYS]),
    learningStatus: pickString(record, [...LEARNING_STATUS_KEYS]),
    meaning: pickString(record, [...DETAIL_MEANING_KEYS]),
    title: pickString(record, [...LIST_TITLE_KEYS]) ?? "Saved item",
    translation: pickString(record, ["translation"]),
  };
}

export async function fetchDictionaryList({
  accessToken,
  searchText,
  signal,
}: {
  accessToken: string;
  searchText: string;
  signal?: AbortSignal;
}) {
  const searchParams = new URLSearchParams();
  const trimmedSearch = searchText.trim();

  if (trimmedSearch) {
    searchParams.set(VOCAB_SEARCH_QUERY_PARAM, trimmedSearch);
  }

  const payload = await fetchBackendJson<unknown>({
    accessToken,
    path: "/vocab",
    searchParams,
    signal,
  });

  return normalizeDictionaryListResponse(payload);
}

export async function fetchDictionaryCardDetails({
  accessToken,
  item_id,
  signal,
}: {
  accessToken: string;
  item_id: string;
  signal?: AbortSignal;
}) {
  const payload = await fetchBackendJson<unknown>({
    accessToken,
    path: `/vocab/${encodeURIComponent(item_id)}`,
    signal,
  });

  return normalizeDictionaryCardDetails(payload);
}

export function getVocabRequestMessage(error: unknown, fallback: string) {
  if (error instanceof BackendRequestError && error.message.trim()) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
