"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLocale } from "@/components/LocaleProvider";

export function SignOutButton() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { messages } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    setHasError(false);

    const result = await signOut();

    setIsSubmitting(false);

    if (result.error) {
      setHasError(true);
      return;
    }

    router.replace("/");
  }

  return (
    <div className="flex min-w-0 max-w-full flex-col items-end gap-2">
      <button
        className="max-w-full truncate text-sm text-token-muted transition hover:text-token-brand disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={() => void handleClick()}
        disabled={isSubmitting}
      >
        {isSubmitting ? messages.shell.signOut.loading : messages.shell.signOut.action}
      </button>
      {hasError ? (
        <p className="max-w-full break-words text-right text-xs leading-5 text-red-700 sm:max-w-[18rem]">
          {messages.shell.signOut.error}
        </p>
      ) : null}
    </div>
  );
}
