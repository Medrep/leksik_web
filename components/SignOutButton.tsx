"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function SignOutButton() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await signOut();

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    router.replace("/");
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className="text-sm text-token-muted transition hover:text-token-brand disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={() => void handleClick()}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing out..." : "Sign out"}
      </button>
      {errorMessage ? <p className="max-w-[18rem] text-right text-xs leading-5 text-red-700 dark:text-red-300">{errorMessage}</p> : null}
    </div>
  );
}
