import Link from "next/link";
import { PublicAuthCard } from "@/components/PublicAuthCard";
import { PublicAuthRedirect } from "@/components/PublicAuthRedirect";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";

export default function PasswordRecoveryConfirmationPage() {
  return (
    <PublicLayoutShell activePath="/password-recovery">
      <PublicAuthRedirect />
      <PublicAuthCard
        title="Check your email"
        description="If the address matches an account, we'll send a reset link."
        backHref="/sign-in"
        backLabel="Sign in"
        footer={
          <>
            Need another try?{" "}
            <Link className="text-token-brand" href="/password-recovery">
              Reset again
            </Link>
          </>
        }
      >
        <div className="rounded-[1rem] border border-token-border bg-token-brandSoft px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-token-brand bg-token-surfaceStrong text-token-brand">
              ✓
            </div>
            <div>
              <p className="text-lg font-semibold text-token-text">Recovery request sent</p>
              <p className="mt-1 text-sm leading-6 text-token-muted">
                Check your inbox for the next step.
              </p>
            </div>
          </div>
        </div>
      </PublicAuthCard>
    </PublicLayoutShell>
  );
}
