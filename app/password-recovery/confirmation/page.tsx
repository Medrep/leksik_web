import { PublicAuthScreen } from "@/components/PublicAuthScreen";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";

export default function PasswordRecoveryConfirmationPage() {
  return (
    <PublicLayoutShell activePath="/password-recovery">
      <PublicAuthScreen kind="passwordRecoveryConfirmation" />
    </PublicLayoutShell>
  );
}
