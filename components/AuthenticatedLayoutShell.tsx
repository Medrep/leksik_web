"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { BrandMark } from "./BrandMark";
import { SignOutButton } from "./SignOutButton";

export function AuthenticatedLayoutShell({ children }: { children: React.ReactNode }) {
  const { messages } = useLocale();

  return (
    <div className="relative min-h-screen w-full min-w-0 max-w-full overflow-x-clip px-4 py-5 sm:px-6 sm:py-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(202, 128, 28, 0.08), transparent 20rem), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
        }}
      />
      <header className="auth-appear relative z-10 mx-auto flex w-full min-w-0 max-w-full items-center justify-between gap-3 self-stretch border-b border-token-border pb-4 sm:max-w-6xl">
        <div className="flex min-w-0 items-center gap-4">
          <BrandMark ariaLabel={messages.shell.navigation.dictionary} to="/dictionary" />
        </div>
        <div className="flex min-w-0 max-w-full shrink-0 items-center gap-3">
          <Link
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-token-muted transition hover:bg-token-brandSoft hover:text-token-brand"
            href="/settings"
            aria-label={messages.shell.navigation.settings}
            title={messages.shell.navigation.settings}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2.1 2.1 0 1 1-2.97 2.97l-.06-.06a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.65v.17a2.1 2.1 0 1 1-4.2 0v-.09a1.8 1.8 0 0 0-1.18-1.66 1.8 1.8 0 0 0-1.98.36l-.06.06a2.1 2.1 0 1 1-2.97-2.97l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.1h-.17a2.1 2.1 0 1 1 0-4.2h.09A1.8 1.8 0 0 0 4.53 8.5a1.8 1.8 0 0 0-.36-1.98l-.06-.06a2.1 2.1 0 1 1 2.97-2.97l.06.06a1.8 1.8 0 0 0 1.98.36h.08A1.8 1.8 0 0 0 10.3 2.3v-.17a2.1 2.1 0 1 1 4.2 0v.09a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 1.98-.36l.06-.06a2.1 2.1 0 1 1 2.97 2.97l-.06.06a1.8 1.8 0 0 0-.36 1.98v.08a1.8 1.8 0 0 0 1.65 1.1h.17a2.1 2.1 0 1 1 0 4.2h-.09A1.8 1.8 0 0 0 19.4 15Z" />
            </svg>
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="relative z-10 mx-auto flex w-full min-w-0 max-w-full flex-col gap-5 self-stretch py-6 sm:max-w-6xl sm:py-8">
        {children}
      </main>
    </div>
  );
}
