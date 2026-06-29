"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BackendRequestError } from "@/lib/backend-client";
import {
  completeTelegramLink,
  fetchTelegramLinkStatus,
  getTelegramLinkRequestMessage,
  type TelegramLinkStatus,
} from "@/lib/telegram-link";

function statusCopy(status: TelegramLinkStatus | null) {
  if (!status) {
    return {
      accentClassName: "text-token-muted",
      description: "Checking whether Telegram is linked for this account.",
      headline: "Telegram",
    };
  }

  if (status.state === "linked") {
    return {
      accentClassName: "text-token-brand",
      description: "Telegram is linked for capture and daily review. Your web dictionary stays available here either way.",
      headline: "Telegram linked",
    };
  }

  if (status.state === "pending") {
    return {
      accentClassName: "text-token-brand",
      description: "Telegram has been observed, but linking still needs the one-time completion code from Telegram.",
      headline: "Telegram link pending",
    };
  }

  if (status.state === "conflict") {
    return {
      accentClassName: "text-red-700",
      description:
        "Telegram linking is blocked by an existing link conflict. This web client does not support reassignment or unlinking.",
      headline: "Telegram link conflict",
    };
  }

  return {
    accentClassName: "text-token-text",
    description:
      "Telegram is not linked yet. If Telegram gave you a one-time completion code, enter it here to finish linking.",
    headline: "Telegram not linked",
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
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<TelegramLinkStatus | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadStatus(signal?: AbortSignal) {
    if (!session?.access_token) {
      return;
    }

    setErrorMessage(null);

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

      setErrorMessage(
        getTelegramLinkRequestMessage(error, "Telegram link status could not be loaded from the backend."),
      );
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
    setSuccessMessage(null);

    const controller = new AbortController();

    void loadStatus(controller.signal);

    return () => controller.abort();
  }, [refreshBootstrap, session?.access_token]);

  const currentCopy = statusCopy(status);
  const observedAccount =
    status && status.state !== "conflict" ? observedAccountLabel(status) : null;
  const shouldShowForm = status?.state === "unlinked" || status?.state === "pending";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.access_token) {
      return;
    }

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setErrorMessage("Enter the one-time code from Telegram.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const nextStatus = await completeTelegramLink({
        accessToken: session.access_token,
        code: trimmedCode,
      });

      setStatus(nextStatus);
      setCode("");
      setSuccessMessage("Telegram is now linked.");
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

      setErrorMessage(
        getTelegramLinkRequestMessage(error, "Telegram linking could not be completed right now."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full min-w-0 max-w-full border-t border-token-border pt-5">
      <div className="flex w-full min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="w-full min-w-0 max-w-xl">
          <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-token-muted/65">Telegram</p>
          <h2 className={`mt-2 text-[0.9375rem] font-medium leading-6 ${currentCopy.accentClassName}`}>{currentCopy.headline}</h2>
          <p className="mt-1 break-words text-[0.8125rem] leading-5 text-token-muted">{currentCopy.description}</p>
          {observedAccount ? (
            <p className="mt-3 break-words text-[0.8125rem] text-token-muted">Observed account: {observedAccount}</p>
          ) : null}
        </div>

        {status ? <span className={`${statusBadgeClassName(status.state)} max-w-full truncate`}>{status.state}</span> : null}
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-[#FEEDCE] bg-[#FEFAF2] px-4 py-3 text-token-muted">
          <p className="text-[0.8125rem] leading-5">Loading Telegram link status…</p>
        </div>
      ) : null}

      {!isLoading && shouldShowForm ? (
        <form className="mt-5 grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSubmit}>
          <label className="grid min-w-0 gap-2">
            <span className="text-[0.8125rem] font-medium text-token-text">One-time Telegram code</span>
            <input
              className="w-full rounded-lg border border-token-border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 focus:border-token-brand disabled:cursor-not-allowed disabled:opacity-60"
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              placeholder="Enter code"
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
              {isSubmitting ? "Linking…" : "Complete link"}
            </button>
          </div>
        </form>
      ) : null}

      {!isLoading && successMessage ? (
        <div className="mt-4 rounded-xl border border-token-border bg-token-brandSoft/40 px-4 py-3 text-token-brand">
          <p className="text-[0.8125rem] leading-5">{successMessage}</p>
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
