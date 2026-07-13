import { PublicAuthScreen } from "@/components/PublicAuthScreen";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";
import { buildHrefWithNext, getOptionalNextRouteFromSearchParams, type SearchParamsRecord } from "@/lib/auth-next";

type SignInPageProps = {
  searchParams?: SearchParamsRecord;
};

export default function SignInPage({ searchParams }: SignInPageProps) {
  const nextRoute = getOptionalNextRouteFromSearchParams(searchParams);

  return (
    <PublicLayoutShell activePath="/sign-in">
      <PublicAuthScreen
        kind="signIn"
        signUpHref={buildHrefWithNext("/sign-up", nextRoute)}
      />
    </PublicLayoutShell>
  );
}
