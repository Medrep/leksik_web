"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BackendRequestError } from "@/lib/backend-client";
import { completeTelegramLink } from "@/lib/telegram-link";

type CompletionShellState = "checking" | "auth-required" | "success" | "blocked" | "invalid";

type CompletionResult = {
  message: string | null;
  state: "idle" | "checking" | "success" | "blocked" | "invalid";
};

type TelegramCompletionPageShellProps = {
  artifact: string | null;
  signInHref: string;
  signUpHref: string;
};

const STATE_COPY: Record<
  CompletionShellState,
  {
    badge: string;
    title: string;
    description: string;
    detailTitle: string;
    icon: "check" | "clock" | "lock" | "blocked" | "invalid";
    tone: "brand" | "danger";
  }
> = {
  checking: {
    badge: "Checking",
    title: "Checking this Telegram link",
    description:
      "This page has the Telegram completion code and is checking it with the backend.",
    detailTitle: "Telegram-first completion",
    icon: "clock",
    tone: "brand",
  },
  "auth-required": {
    badge: "Sign in required",
    title: "Sign in to continue from Telegram",
    description:
      "Use your product account before this Telegram completion link can be handled.",
    detailTitle: "Sign in required",
    icon: "lock",
    tone: "brand",
  },
  success: {
    badge: "Completed",
    title: "Telegram connected",
    description:
      "Your product account and Telegram account are now connected for capture and daily review.",
    detailTitle: "Telegram-first completion",
    icon: "check",
    tone: "brand",
  },
  blocked: {
    badge: "Blocked",
    title: "This Telegram link cannot be completed here",
    description:
      "Backend-owned linking rules blocked this completion. This web client does not support reassignment or unlinking.",
    detailTitle: "Blocked by backend rules",
    icon: "blocked",
    tone: "danger",
  },
  invalid: {
    badge: "Invalid or expired",
    title: "This Telegram completion link is not usable",
    description:
      "The link is missing its completion artifact, is expired, or cannot be used for this account.",
    detailTitle: "Invalid completion link",
    icon: "invalid",
    tone: "danger",
  },
};

function StateIcon({
  icon,
  tone,
}: {
  icon: (typeof STATE_COPY)[CompletionShellState]["icon"];
  tone: (typeof STATE_COPY)[CompletionShellState]["tone"];
}) {
  const iconClassName =
    tone === "danger"
      ? "border-[#E8B7AF] bg-[#FFF4F1] text-[#8A3328]"
      : "border-token-brand bg-token-brandSoft text-token-brand";

  return (
    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full border ${iconClassName}`}>
      {icon === "check" ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12.25L9.5 16.75L19 7.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {icon === "clock" ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 7.75V12.4L15.25 14.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {icon === "lock" ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="6.5" y="10.25" width="11" height="8.25" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.75 10.25V8.5C8.75 6.7 10.2 5.25 12 5.25C13.8 5.25 15.25 6.7 15.25 8.5V10.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : null}
      {icon === "blocked" ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 8.5L15.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : null}
      {icon === "invalid" ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 6.5V12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M12 16.75H12.01" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ) : null}
    </div>
  );
}

function resolveShellState({
  authStatus,
  bootstrapStatus,
  completionResult,
  hasArtifact,
}: {
  authStatus: ReturnType<typeof useAuth>["authStatus"];
  bootstrapStatus: ReturnType<typeof useAuth>["bootstrapStatus"];
  completionResult: CompletionResult;
  hasArtifact: boolean;
}): CompletionShellState {
  if (!hasArtifact || completionResult.state === "invalid") {
    return "invalid";
  }

  if (authStatus === "loading" || (authStatus === "authenticated" && bootstrapStatus === "checking")) {
    return "checking";
  }

  if (authStatus !== "authenticated" || bootstrapStatus !== "ready") {
    return "auth-required";
  }

  if (completionResult.state === "success") {
    return "success";
  }

  if (completionResult.state === "blocked") {
    return "blocked";
  }

  if (completionResult.state === "checking") {
    return "checking";
  }

  return "checking";
}

export function TelegramCompletionPageShell({
  artifact,
  signInHref,
  signUpHref,
}: TelegramCompletionPageShellProps) {
  const { authStatus, bootstrapStatus, refreshBootstrap, session } = useAuth();
  const attemptedCompletionKeyRef = useRef<string | null>(null);
  const [completionResult, setCompletionResult] = useState<CompletionResult>({
    message: null,
    state: "idle",
  });
  const hasArtifact = artifact !== null;

  useEffect(() => {
    if (!artifact) {
      setCompletionResult({
        message: "No Telegram completion code was provided.",
        state: "invalid",
      });
      attemptedCompletionKeyRef.current = null;
      return;
    }

    if (authStatus !== "authenticated" || bootstrapStatus !== "ready" || !session?.access_token) {
      setCompletionResult((currentResult) =>
        currentResult.state === "success" || currentResult.state === "blocked" || currentResult.state === "invalid"
          ? currentResult
          : {
              message: null,
              state: "idle",
            },
      );
      return;
    }

    const accessToken = session.access_token;
    const completionCode = artifact;
    const completionKey = `${accessToken}:${completionCode}`;

    if (attemptedCompletionKeyRef.current === completionKey) {
      return;
    }

    attemptedCompletionKeyRef.current = completionKey;
    setCompletionResult({
      message: null,
      state: "checking",
    });

    const controller = new AbortController();

    async function completeLink() {
      try {
        const nextStatus = await completeTelegramLink({
          accessToken,
          code: completionCode,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        if (nextStatus.state === "linked") {
          setCompletionResult({
            message: "Telegram linking completed.",
            state: "success",
          });
          return;
        }

        if (nextStatus.state === "conflict") {
          setCompletionResult({
            message: "This Telegram account is already linked or cannot be attached to this product account.",
            state: "blocked",
          });
          return;
        }

        setCompletionResult({
          message: "The backend did not complete this Telegram link.",
          state: "blocked",
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          attemptedCompletionKeyRef.current = null;
          setCompletionResult({
            message: null,
            state: "idle",
          });
          void refreshBootstrap();
          return;
        }

        if (error instanceof BackendRequestError && error.status === 409) {
          setCompletionResult({
            message: error.message || "This Telegram link is blocked by backend-owned conflict rules.",
            state: "blocked",
          });
          return;
        }

        if (error instanceof BackendRequestError && (error.status === 400 || error.status === 404 || error.status === 410)) {
          setCompletionResult({
            message: error.message || "This Telegram completion code is invalid or expired.",
            state: "invalid",
          });
          return;
        }

        setCompletionResult({
          message: error instanceof Error && error.message.trim()
            ? error.message
            : "The backend could not complete this Telegram link.",
          state: "blocked",
        });
      }
    }

    void completeLink();

    return () => controller.abort();
  }, [artifact, authStatus, bootstrapStatus, refreshBootstrap, session?.access_token]);

  const shellState = resolveShellState({
    authStatus,
    bootstrapStatus,
    completionResult,
    hasArtifact,
  });
  const copy = STATE_COPY[shellState];
  const detailMessage = completionResult.message ?? (
    hasArtifact
      ? "A Telegram completion code was found in this URL."
      : "No Telegram completion code was found in this URL."
  );

  const detailClassName =
    copy.tone === "danger"
      ? "border-[#E8B7AF] bg-[#FFF4F1] text-[#8A3328]"
      : "border-token-border bg-[#FEFAF2] text-token-muted";

  return (
    <section className="auth-appear w-full max-w-[25rem] px-0 py-0 text-center sm:rounded-2xl sm:border sm:border-token-border sm:bg-token-surfaceStrong sm:px-8 sm:py-8">
      <div className="flex flex-col items-center">
        <StateIcon icon={copy.icon} tone={copy.tone} />
        <p
          className={
            copy.tone === "danger"
              ? "mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#8A3328]"
              : "mt-5 text-xs font-medium uppercase tracking-[0.16em] text-token-brand"
          }
        >
          {copy.badge}
        </p>
        <h1 className="mt-2 text-[1.3125rem] font-medium leading-tight text-token-text">{copy.title}</h1>
        <p className="mx-auto mt-2 max-w-[17rem] text-[0.8125rem] leading-6 text-token-muted">{copy.description}</p>

        <div className={`mt-6 w-full rounded-[0.75rem] border px-4 py-3 text-left ${detailClassName}`}>
          <p className="text-[0.8125rem] font-medium text-token-text">{copy.detailTitle}</p>
          <p className="mt-1 text-[0.8125rem] leading-5">{detailMessage}</p>
        </div>

        {shellState === "auth-required" ? (
          <div className="mt-6 grid w-full gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition hover:brightness-95"
              href={signInHref}
            >
              Sign in
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-token-brand bg-transparent px-5 text-sm font-semibold text-token-brand transition hover:bg-token-brandSoft"
              href={signUpHref}
            >
              Create account
            </Link>
          </div>
        ) : null}

        {shellState === "success" ? (
          <div className="mt-6 w-full">
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition hover:brightness-95"
              href="/dictionary"
            >
              Open dictionary
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
