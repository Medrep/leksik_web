import Link from "next/link";
import { PublicAuthCard } from "@/components/PublicAuthCard";
import { SignUpForm } from "@/components/PublicAuthForms";
import { PublicAuthRedirect } from "@/components/PublicAuthRedirect";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";

export default function SignUpPage() {
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
            <Link className="text-token-brand" href="/sign-in">
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
