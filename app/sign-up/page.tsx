import Link from "next/link";
import { PublicAuthCard } from "@/components/PublicAuthCard";
import { SignUpForm } from "@/components/PublicAuthForms";
import { PublicAuthRedirect } from "@/components/PublicAuthRedirect";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";
import { buildHrefWithNext, getOptionalNextRouteFromSearchParams, type SearchParamsRecord } from "@/lib/auth-next";

type SignUpPageProps = {
  searchParams?: SearchParamsRecord;
};

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  const nextRoute = getOptionalNextRouteFromSearchParams(searchParams);

  return (
    <PublicLayoutShell activePath="/sign-up">
      <PublicAuthRedirect />
      <PublicAuthCard
        title="Create account"
        description="Fill in your details to get started."
        backHref="/"
        backLabel="Back"
        footer={
          <>
            Already have an account?{" "}
            <Link className="text-token-brand" href={buildHrefWithNext("/sign-in", nextRoute)}>
              Sign in
            </Link>
          </>
        }
      >
        <SignUpForm />
      </PublicAuthCard>
    </PublicLayoutShell>
  );
}
