import { PublicAuthCard } from "@/components/PublicAuthCard";
import { PasswordRecoveryForm } from "@/components/PublicAuthForms";
import { PublicAuthRedirect } from "@/components/PublicAuthRedirect";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";

export default function PasswordRecoveryPage() {
  return (
    <PublicLayoutShell activePath="/password-recovery">
      <PublicAuthRedirect />
      <PublicAuthCard
        variant="form"
        title="Reset password"
        description="Enter your email and we'll send a reset link."
        backHref="/sign-in"
        backLabel="Sign in"
      >
        <PasswordRecoveryForm />
      </PublicAuthCard>
    </PublicLayoutShell>
  );
}
