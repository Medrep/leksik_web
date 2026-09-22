import type { DictionaryCardDetails, DictionaryListItem } from "@/lib/vocab";

const VOCAB_CACHE_PREFIX = "leksik-web:vocab-cache:v1";

type CachedValue<T> = {
  cachedAt: number;
  value: T;
};

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeRead<T>(key: string): T | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(key);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    safeRemove(key);
    return null;
  }
}

function safeWrite<T>(key: string, value: T) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures and continue using backend reads.
  }
}

function safeRemove(key: string) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage remove failures and continue using backend reads.
  }
}

function removeMatchingKeys(prefix: string) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    const matchingKeys: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);

      if (key?.startsWith(prefix)) {
        matchingKeys.push(key);
      }
    }

    matchingKeys.forEach((key) => storage.removeItem(key));
  } catch {
    // Ignore storage remove failures and continue using backend reads.
  }
}

function encodeKeyPart(value: string) {
  return encodeURIComponent(value);
}

function listCacheKey(userId: string, searchText: string) {
  return `${VOCAB_CACHE_PREFIX}:list:${encodeKeyPart(userId)}:${encodeKeyPart(searchText.trim())}`;
}

function detailsCacheKey(userId: string, itemId: string) {
  return `${VOCAB_CACHE_PREFIX}:details:${encodeKeyPart(userId)}:${encodeKeyPart(itemId)}`;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isDictionaryListItem(value: unknown): value is DictionaryListItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    isNullableString(item.explanation) &&
    typeof item.id === "string" &&
    isNullableString(item.learningStatus) &&
    isNullableString(item.language) &&
    typeof item.title === "string" &&
    isNullableString(item.translation)
  );
}

function isDictionaryCardDetails(value: unknown): value is DictionaryCardDetails {
  if (!isDictionaryListItem(value)) {
    return false;
  }

  const details = value as unknown as Record<string, unknown>;
  return (
    isNullableString(details.canonicalForm) &&
    Array.isArray(details.examples) &&
    details.examples.every((example) => typeof example === "string")
  );
}

function readValidatedCachedValue<T>(
  key: string,
  isValidValue: (value: unknown) => value is T,
) {
  const cachedValue = safeRead<unknown>(key);

  if (!cachedValue || typeof cachedValue !== "object") {
    if (cachedValue !== null) {
      safeRemove(key);
    }
    return null;
  }

  const record = cachedValue as Record<string, unknown>;

  if (
    typeof record.cachedAt !== "number" ||
    !Number.isFinite(record.cachedAt) ||
    !isValidValue(record.value)
  ) {
    safeRemove(key);
    return null;
  }

  return record.value;
}

export function readCachedDictionaryList({
  userId,
  searchText,
}: {
  userId: string;
  searchText: string;
}) {
  const key = listCacheKey(userId, searchText);
  return readValidatedCachedValue(
    key,
    (value): value is DictionaryListItem[] =>
      Array.isArray(value) && value.every(isDictionaryListItem),
  );
}

export function writeCachedDictionaryList({
  userId,
  searchText,
  items,
}: {
  userId: string;
  searchText: string;
  items: DictionaryListItem[];
}) {
  safeWrite(listCacheKey(userId, searchText), {
    cachedAt: Date.now(),
    value: items,
  } satisfies CachedValue<DictionaryListItem[]>);
}

export function readCachedDictionaryCardDetails({
  userId,
  itemId,
}: {
  userId: string;
  itemId: string;
}) {
  const key = detailsCacheKey(userId, itemId);
  return readValidatedCachedValue(key, isDictionaryCardDetails);
}

export function writeCachedDictionaryCardDetails({
  userId,
  itemId,
  details,
}: {
  userId: string;
  itemId: string;
  details: DictionaryCardDetails;
}) {
  safeWrite(detailsCacheKey(userId, itemId), {
    cachedAt: Date.now(),
    value: details,
  } satisfies CachedValue<DictionaryCardDetails>);
}

export function invalidateCachedDictionaryReadDataForUser(userId: string) {
  const encodedUserId = encodeKeyPart(userId);
  removeMatchingKeys(`${VOCAB_CACHE_PREFIX}:list:${encodedUserId}:`);
  removeMatchingKeys(`${VOCAB_CACHE_PREFIX}:details:${encodedUserId}:`);
}

export function invalidateCachedDictionaryListsForUser(userId: string) {
  const encodedUserId = encodeKeyPart(userId);
  removeMatchingKeys(`${VOCAB_CACHE_PREFIX}:list:${encodedUserId}:`);
}

export function invalidateCachedDictionaryItem({
  userId,
  itemId,
}: {
  userId: string;
  itemId: string;
}) {
  safeRemove(detailsCacheKey(userId, itemId));
}

export function clearAllCachedDictionaryReadData() {
  removeMatchingKeys(`${VOCAB_CACHE_PREFIX}:`);
}
