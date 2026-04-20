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
    toneClassName: string;
  }
> = {
  checking: {
    badge: "Checking",
    title: "Checking this Telegram link",
    description:
      "This page has the Telegram completion code and is checking it with the backend.",
    toneClassName: "text-token-brand",
  },
  "auth-required": {
    badge: "Sign in required",
    title: "Sign in to continue from Telegram",
    description:
      "Use your product account before this Telegram completion link can be handled.",
    toneClassName: "text-token-brand",
  },
  success: {
    badge: "Completed",
    title: "Telegram is linked",
    description:
      "Your product account and Telegram account are now connected for capture and daily review.",
    toneClassName: "text-token-brand",
  },
  blocked: {
    badge: "Blocked",
    title: "This Telegram link cannot be completed here",
    description:
      "Backend-owned linking rules blocked this completion. This web client does not support reassignment or unlinking.",
    toneClassName: "text-red-700 dark:text-red-200",
  },
  invalid: {
    badge: "Invalid or expired",
    title: "This Telegram completion link is not usable",
    description:
      "The link is missing its completion artifact, is expired, or cannot be used for this account.",
    toneClassName: "text-red-700 dark:text-red-200",
  },
};

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

  return (
    <section className="auth-appear shell-panel w-full max-w-[32rem] rounded-[1.6rem] px-6 py-7 sm:px-8 sm:py-8">
      <div>
        <p className={`text-xs uppercase tracking-[0.18em] ${copy.toneClassName}`}>{copy.badge}</p>
        <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-token-text">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-md text-base leading-7 text-token-muted">{copy.description}</p>

        <div className="mt-7 rounded-[1rem] border border-token-border bg-token-brandSoft px-5 py-4">
          <p className="text-sm font-medium text-token-text">Telegram-first completion</p>
          <p className="mt-1 text-sm leading-6 text-token-muted">{detailMessage}</p>
        </div>

        {shellState === "auth-required" ? (
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="primary-button" href={signInHref}>
              Sign in
            </Link>
            <Link className="secondary-button" href={signUpHref}>
              Create account
            </Link>
          </div>
        ) : null}

        {shellState === "success" ? (
          <div className="mt-7">
            <Link className="primary-button" href="/dictionary">
              Open dictionary
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
