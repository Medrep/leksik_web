import Link from "next/link";
import { PublicAuthCard } from "@/components/PublicAuthCard";
import { PublicAuthRedirect } from "@/components/PublicAuthRedirect";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";

export default function PasswordRecoveryConfirmationPage() {
  return (
    <PublicLayoutShell activePath="/password-recovery">
      <PublicAuthRedirect />
      <PublicAuthCard
        variant="confirmation"
        title="Check your inbox"
        description="If the address matches an account, we'll send a reset link."
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-token-brand bg-token-brandSoft text-token-brand">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M5 11.25L9.25 15.5L17.25 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition hover:brightness-95"
            href="/sign-in"
          >
            Back to sign in
          </Link>
          <Link
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg text-sm font-medium text-token-muted transition hover:text-token-brand"
            href="/password-recovery"
          >
            Reset again
          </Link>
        </div>
      </PublicAuthCard>
    </PublicLayoutShell>
  );
}
