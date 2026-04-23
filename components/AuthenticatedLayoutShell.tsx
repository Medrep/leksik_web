import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { SignOutButton } from "./SignOutButton";

export function AuthenticatedLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(202, 128, 28, 0.08), transparent 20rem), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
        }}
      />
      <header className="auth-appear relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-token-border pb-4">
        <div className="flex items-center gap-4">
          <BrandMark to="/dictionary" />
        </div>
        <div className="flex items-center gap-3">
          <Link
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-token-muted transition hover:bg-token-brandSoft hover:text-token-brand"
            href="/settings"
            aria-label="Settings"
            title="Settings"
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
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
