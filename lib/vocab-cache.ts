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

  return window.localStorage;
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

function userCachePrefix(userId: string) {
  return `${VOCAB_CACHE_PREFIX}:`;
}

export function readCachedDictionaryList({
  userId,
  searchText,
}: {
  userId: string;
  searchText: string;
}) {
  const cachedValue = safeRead<CachedValue<DictionaryListItem[]>>(listCacheKey(userId, searchText));
  return cachedValue?.value ?? null;
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
  const cachedValue = safeRead<CachedValue<DictionaryCardDetails>>(detailsCacheKey(userId, itemId));
  return cachedValue?.value ?? null;
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
  removeMatchingKeys(userCachePrefix(""));
}
