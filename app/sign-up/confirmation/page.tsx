import { PublicAuthScreen } from "@/components/PublicAuthScreen";
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
      <PublicAuthScreen kind="signUpConfirmation" signInHref={signInHref} />
    </PublicLayoutShell>
  );
}
