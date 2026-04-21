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
        variant="confirmation"
        title="Check your email"
        description="Click the link in the email to activate your account. Check your spam folder if you don't see it."
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-token-brand bg-token-brandSoft text-token-brand">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <rect x="3.75" y="6.75" width="18.5" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.5 9.25L13 15.25L21.5 9.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mb-6 text-sm font-medium text-token-text">We sent a confirmation link to your email address.</p>
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition hover:brightness-95"
            href={signInHref}
          >
            Open sign in
          </Link>
        </div>
      </PublicAuthCard>
    </PublicLayoutShell>
  );
}
