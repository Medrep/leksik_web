import { PublicLayoutShell } from "@/components/PublicLayoutShell";
import { TelegramCompletionPageShell } from "@/components/TelegramCompletionPageShell";

type TelegramCompletionPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeArtifact(searchParams: TelegramCompletionPageProps["searchParams"]) {
  const rawCode = firstParamValue(searchParams?.code);
  const trimmedCode = rawCode?.trim();
  return trimmedCode ? trimmedCode : null;
}

function buildSignInHref(artifact: string | null) {
  const completionParams = new URLSearchParams();

  if (artifact) {
    completionParams.set("code", artifact);
  }

  const completionPath = `/telegram/complete${
    completionParams.toString() ? `?${completionParams.toString()}` : ""
  }`;

  return `/sign-in?next=${encodeURIComponent(completionPath)}`;
}

export default function TelegramCompletionPage({ searchParams }: TelegramCompletionPageProps) {
  const artifact = normalizeArtifact(searchParams);

  return (
    <PublicLayoutShell activePath="/telegram/complete">
      <TelegramCompletionPageShell
        artifact={artifact}
        signInHref={buildSignInHref(artifact)}
      />
    </PublicLayoutShell>
  );
}
