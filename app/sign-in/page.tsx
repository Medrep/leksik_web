import Link from "next/link";
import { PublicAuthCard } from "@/components/PublicAuthCard";
import { SignInForm } from "@/components/PublicAuthForms";
import { PublicAuthRedirect } from "@/components/PublicAuthRedirect";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";
import { buildHrefWithNext, getOptionalNextRouteFromSearchParams, type SearchParamsRecord } from "@/lib/auth-next";

type SignInPageProps = {
  searchParams?: SearchParamsRecord;
};

export default function SignInPage({ searchParams }: SignInPageProps) {
  const nextRoute = getOptionalNextRouteFromSearchParams(searchParams);

  return (
    <PublicLayoutShell activePath="/sign-in">
      <PublicAuthRedirect />
      <PublicAuthCard
        title="Welcome back"
        description="Sign in to your account."
        backHref="/"
        backLabel="Back"
        footer={
          <div className="flex items-center justify-center gap-1">
            <span>No account?</span>
            <Link className="text-token-brand" href={buildHrefWithNext("/sign-up", nextRoute)}>
              Sign up
            </Link>
          </div>
        }
      >
        <SignInForm />
      </PublicAuthCard>
    </PublicLayoutShell>
  );
}
