import Link from "next/link";
import { PublicAuthCard } from "@/components/PublicAuthCard";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";

export default function SignUpConfirmationPage() {
  return (
    <PublicLayoutShell activePath="/sign-up">
      <PublicAuthCard
        title="Check your email"
        description="We sent a confirmation link to your email address."
        backHref="/sign-in"
        backLabel="Sign in"
        footer={
          <>
            Already confirmed?{" "}
            <Link className="text-token-brand" href="/sign-in">
              Sign in
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
              <p className="text-lg font-semibold text-token-text">Registration submitted</p>
              <p className="mt-1 text-sm leading-6 text-token-muted">
                Check your inbox and open the confirmation link before signing in.
              </p>
            </div>
          </div>
        </div>
      </PublicAuthCard>
    </PublicLayoutShell>
  );
}
