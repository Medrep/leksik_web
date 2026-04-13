import { AuthenticatedRouteGate } from "@/components/AuthenticatedRouteGate";
import { AuthenticatedLayoutShell } from "@/components/AuthenticatedLayoutShell";

export default function DictionaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedLayoutShell>
      <AuthenticatedRouteGate>{children}</AuthenticatedRouteGate>
    </AuthenticatedLayoutShell>
  );
}
