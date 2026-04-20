import Link from "next/link";
import { PublicAuthCard } from "@/components/PublicAuthCard";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";
import { buildHrefWithNext, getOptionalNextRouteFromSearchParams, type SearchParamsRecord } from "@/lib/auth-next";

type SignUpConfirmationPageProps = {
  searchParams?: SearchParamsRecord;
};

export default function SignUpConfirmationPage({ searchParams }: SignUpConfirmationPageProps) {
  const nextRoute = getOptionalNextRouteFromSearchParams(searchParams);
  const signInHref = buildHrefWithNext("/sign-in", nextRoute);

  return (
    <PublicLayoutShell activePath="/sign-up">
      <PublicAuthCard
        title="Check your email"
        description="We sent a confirmation link to your email address."
        backHref={signInHref}
        backLabel="Sign in"
        footer={
          <>
            Already confirmed?{" "}
            <Link className="text-token-brand" href={signInHref}>
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
