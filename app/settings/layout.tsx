import { AuthenticatedLayoutShell } from "@/components/AuthenticatedLayoutShell";
import { AuthenticatedRouteGate } from "@/components/AuthenticatedRouteGate";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedLayoutShell>
      <AuthenticatedRouteGate resourceLabel="settings">{children}</AuthenticatedRouteGate>
    </AuthenticatedLayoutShell>
  );
}
