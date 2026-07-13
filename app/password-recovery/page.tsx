import { PublicAuthScreen } from "@/components/PublicAuthScreen";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";

export default function PasswordRecoveryPage() {
  return (
    <PublicLayoutShell activePath="/password-recovery">
      <PublicAuthScreen kind="passwordRecovery" />
    </PublicLayoutShell>
  );
}
