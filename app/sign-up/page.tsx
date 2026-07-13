import { PublicAuthScreen } from "@/components/PublicAuthScreen";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";
import { buildHrefWithNext, getOptionalNextRouteFromSearchParams, type SearchParamsRecord } from "@/lib/auth-next";

type SignUpPageProps = {
  searchParams?: SearchParamsRecord;
};

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  const nextRoute = getOptionalNextRouteFromSearchParams(searchParams);

  return (
    <PublicLayoutShell activePath="/sign-up">
      <PublicAuthScreen
        kind="signUp"
        signInHref={buildHrefWithNext("/sign-in", nextRoute)}
      />
    </PublicLayoutShell>
  );
}
