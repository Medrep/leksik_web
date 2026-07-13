"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLocale } from "@/components/LocaleProvider";
import { BackendRequestError } from "@/lib/backend-client";
import type { SettingsMessages } from "@/lib/i18n/messages";
import {
  completeTelegramLink,
  fetchTelegramLinkStatus,
  type TelegramLinkStatus,
} from "@/lib/telegram-link";

type TelegramPanelError =
  | { kind: "backend"; message: string }
  | { kind: "localized"; key: keyof SettingsMessages["telegram"]["errors"] };

function toTelegramPanelError(
  error: unknown,
  fallbackKey: keyof SettingsMessages["telegram"]["errors"],
): TelegramPanelError {
  if (error instanceof BackendRequestError && error.message.trim()) {
    return { kind: "backend", message: error.message };
  }

  return { kind: "localized", key: fallbackKey };
}

function statusCopy(status: TelegramLinkStatus | null, messages: SettingsMessages) {
  if (!status) {
    return {
      accentClassName: "text-token-muted",
      description: messages.telegram.checkingDescription,
      headline: messages.telegram.checkingHeadline,
    };
  }

  if (status.state === "linked") {
    return {
      accentClassName: "text-token-brand",
      description: messages.telegram.linkedDescription,
      headline: messages.telegram.linkedHeadline,
    };
  }

  if (status.state === "pending") {
    return {
      accentClassName: "text-token-brand",
      description: messages.telegram.pendingDescription,
      headline: messages.telegram.pendingHeadline,
    };
  }

  if (status.state === "conflict") {
    return {
      accentClassName: "text-red-700",
      description: messages.telegram.conflictDescription,
      headline: messages.telegram.conflictHeadline,
    };
  }

  return {
    accentClassName: "text-token-text",
    description: messages.telegram.unlinkedDescription,
    headline: messages.telegram.unlinkedHeadline,
  };
}

function statusBadgeClassName(state: TelegramLinkStatus["state"]) {
  if (state === "linked") {
    return "rounded-full bg-token-brandSoft px-2.5 py-1 text-[0.6875rem] font-medium uppercase leading-none text-token-brand";
  }

  if (state === "conflict") {
    return "rounded-full bg-red-100 px-2.5 py-1 text-[0.6875rem] font-medium uppercase leading-none text-red-700";
  }

  return "rounded-full bg-token-brandSoft px-2.5 py-1 text-[0.6875rem] font-medium uppercase leading-none text-token-muted";
}

function observedAccountLabel(status: TelegramLinkStatus) {
  if (status.providerUsername) {
    return `@${status.providerUsername}`;
  }

  if (status.providerDisplayName) {
    return status.providerDisplayName;
  }

  return null;
}

export function TelegramLinkPanel() {
  const { refreshBootstrap, session } = useAuth();
  const { settingsMessages } = useLocale();
  const [code, setCode] = useState("");
  const [panelError, setPanelError] = useState<TelegramPanelError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<TelegramLinkStatus | null>(null);
  const [hasSuccess, setHasSuccess] = useState(false);

  async function loadStatus(signal?: AbortSignal) {
    if (!session?.access_token) {
      return;
    }

    setPanelError(null);

    try {
      const nextStatus = await fetchTelegramLinkStatus({
        accessToken: session.access_token,
        signal,
      });

      setStatus(nextStatus);
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      if (error instanceof BackendRequestError && error.status === 401) {
        void refreshBootstrap();
        return;
      }

      setPanelError(toTelegramPanelError(error, "load"));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    setIsLoading(true);
    setHasSuccess(false);

    const controller = new AbortController();

    void loadStatus(controller.signal);

    return () => controller.abort();
  }, [refreshBootstrap, session?.access_token]);

  const currentCopy = statusCopy(status, settingsMessages);
  const observedAccount =
    status && status.state !== "conflict" ? observedAccountLabel(status) : null;
  const shouldShowForm = status?.state === "unlinked" || status?.state === "pending";
  const errorMessage = panelError
    ? panelError.kind === "backend"
      ? panelError.message
      : settingsMessages.telegram.errors[panelError.key]
    : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.access_token) {
      return;
    }

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setPanelError({ kind: "localized", key: "codeRequired" });
      return;
    }

    setIsSubmitting(true);
    setPanelError(null);
    setHasSuccess(false);

    try {
      const nextStatus = await completeTelegramLink({
        accessToken: session.access_token,
        code: trimmedCode,
      });

      setStatus(nextStatus);
      setCode("");
      setHasSuccess(true);
    } catch (error) {
      if (error instanceof BackendRequestError && error.status === 401) {
        void refreshBootstrap();
        return;
      }

      if (error instanceof BackendRequestError && error.status === 409) {
        try {
          const nextStatus = await fetchTelegramLinkStatus({
            accessToken: session.access_token,
          });

          setStatus(nextStatus);
        } catch {
          setStatus((currentStatus) =>
            currentStatus
              ? {
                  ...currentStatus,
                  state: "conflict",
                }
              : {
                  lastObservedAt: null,
                  provider: "telegram",
                  providerDisplayName: null,
                  providerUsername: null,
                  state: "conflict",
                },
          );
        }
      }

      setPanelError(toTelegramPanelError(error, "complete"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full min-w-0 max-w-full border-t border-token-border pt-5">
      <div className="flex w-full min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="w-full min-w-0 max-w-xl">
          <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-token-muted/65">
            {settingsMessages.telegram.sectionLabel}
          </p>
          <h2 className={`mt-2 text-[0.9375rem] font-medium leading-6 ${currentCopy.accentClassName}`}>{currentCopy.headline}</h2>
          <p className="mt-1 break-words text-[0.8125rem] leading-5 text-token-muted">{currentCopy.description}</p>
          {observedAccount ? (
            <p className="mt-3 break-words text-[0.8125rem] text-token-muted">
              {settingsMessages.telegram.observedAccount}: {observedAccount}
            </p>
          ) : null}
        </div>

        {status ? (
          <span className={`${statusBadgeClassName(status.state)} max-w-full truncate`}>
            {settingsMessages.telegram.stateLabels[status.state]}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-[#FEEDCE] bg-[#FEFAF2] px-4 py-3 text-token-muted">
          <p className="text-[0.8125rem] leading-5">{settingsMessages.telegram.loading}</p>
        </div>
      ) : null}

      {!isLoading && shouldShowForm ? (
        <form className="mt-5 grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSubmit}>
          <label className="grid min-w-0 gap-2">
            <span className="text-[0.8125rem] font-medium text-token-text">
              {settingsMessages.telegram.codeLabel}
            </span>
            <input
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              placeholder={settingsMessages.telegram.codePlaceholder}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
          <div className="flex items-end">
            <button
              className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? settingsMessages.telegram.linking
                : settingsMessages.telegram.completeLink}
            </button>
          </div>
        </form>
      ) : null}

      {!isLoading && hasSuccess ? (
        <div className="mt-4 rounded-xl border border-token-border bg-token-brandSoft/40 px-4 py-3 text-token-brand">
          <p className="text-[0.8125rem] leading-5">
            {settingsMessages.telegram.linkedSuccess}
          </p>
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="mt-4 rounded-xl border border-[#E8B7AF] bg-[#FFF4F1] px-4 py-3 text-[#8A3328]">
          <p className="text-[0.8125rem] leading-5">{errorMessage}</p>
        </div>
      ) : null}
    </section>
  );
}
