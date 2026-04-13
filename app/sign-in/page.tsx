import Link from "next/link";
import { PublicAuthCard } from "@/components/PublicAuthCard";
import { SignInForm } from "@/components/PublicAuthForms";
import { PublicAuthRedirect } from "@/components/PublicAuthRedirect";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";

export default function SignInPage() {
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
            <Link className="text-token-brand" href="/sign-up">
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
