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
      accentClassName: "text-red-700 dark:text-red-200",
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
    return "pill";
  }

  if (state === "conflict") {
    return "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-200";
  }

  return "rounded-full bg-token-surfaceStrong px-3 py-1 text-xs font-medium text-token-muted";
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
    <section className="auth-appear shell-panel rounded-[1.2rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.16em] text-[#b0aaa1]">Telegram</p>
          <h2 className={`mt-2 text-xl font-semibold ${currentCopy.accentClassName}`}>{currentCopy.headline}</h2>
          <p className="mt-2 text-sm leading-6 text-token-muted">{currentCopy.description}</p>
          {observedAccount ? (
            <p className="mt-3 text-sm text-token-muted">Observed account: {observedAccount}</p>
          ) : null}
        </div>

        {status ? <span className={statusBadgeClassName(status.state)}>{status.state}</span> : null}
      </div>

      {isLoading ? <p className="mt-4 text-sm text-token-muted">Loading Telegram link status…</p> : null}

      {!isLoading && shouldShowForm ? (
        <form className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-token-text">One-time Telegram code</span>
            <input
              className="field-input"
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
            <button className="primary-button w-full sm:w-auto" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Linking…" : "Complete link"}
            </button>
          </div>
        </form>
      ) : null}

      {!isLoading && successMessage ? <p className="mt-4 text-sm text-token-brand">{successMessage}</p> : null}

      {!isLoading && errorMessage ? (
        <p className="mt-4 text-sm leading-6 text-red-700 dark:text-red-200">{errorMessage}</p>
      ) : null}
    </section>
  );
}
