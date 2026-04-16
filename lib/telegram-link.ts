import { BackendRequestError, fetchBackendJson } from "@/lib/backend-client";

const TELEGRAM_LINK_STATES = ["unlinked", "pending", "linked", "conflict"] as const;

export type TelegramLinkState = (typeof TELEGRAM_LINK_STATES)[number];

export type TelegramLinkStatus = {
  lastObservedAt: string | null;
  provider: "telegram";
  providerDisplayName: string | null;
  providerUsername: string | null;
  state: TelegramLinkState;
};

function pickString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function normalizeTelegramLinkStatus(payload: unknown): TelegramLinkStatus {
  if (!payload || typeof payload !== "object") {
    throw new Error("Backend returned an invalid Telegram link response.");
  }

  const record = payload as Record<string, unknown>;
  const state = record.state;

  if (typeof state !== "string" || !TELEGRAM_LINK_STATES.includes(state as TelegramLinkState)) {
    throw new Error("Backend returned an unknown Telegram link state.");
  }

  const normalizedState = state as TelegramLinkState;

  return {
    lastObservedAt: pickString(record, "last_observed_at"),
    provider: "telegram",
    providerDisplayName: pickString(record, "provider_display_name"),
    providerUsername: pickString(record, "provider_username"),
    state: normalizedState,
  };
}

export async function fetchTelegramLinkStatus({
  accessToken,
  signal,
}: {
  accessToken: string;
  signal?: AbortSignal;
}) {
  const payload = await fetchBackendJson<unknown>({
    accessToken,
    path: "/messaging-links/telegram",
    signal,
  });

  return normalizeTelegramLinkStatus(payload);
}

export async function completeTelegramLink({
  accessToken,
  code,
  signal,
}: {
  accessToken: string;
  code: string;
  signal?: AbortSignal;
}) {
  const payload = await fetchBackendJson<unknown>({
    accessToken,
    body: {
      code,
    },
    method: "POST",
    path: "/messaging-links/telegram/complete",
    signal,
  });

  return normalizeTelegramLinkStatus(payload);
}

export function getTelegramLinkRequestMessage(error: unknown, fallback: string) {
  if (error instanceof BackendRequestError && error.message.trim()) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
