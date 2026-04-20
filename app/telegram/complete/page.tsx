import { PublicLayoutShell } from "@/components/PublicLayoutShell";
import { TelegramCompletionPageShell } from "@/components/TelegramCompletionPageShell";
import { buildHrefWithNext } from "@/lib/auth-next";

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

function buildCompletionPath(artifact: string | null) {
  const completionParams = new URLSearchParams();

  if (artifact) {
    completionParams.set("code", artifact);
  }

  return `/telegram/complete${
    completionParams.toString() ? `?${completionParams.toString()}` : ""
  }`;
}

export default function TelegramCompletionPage({ searchParams }: TelegramCompletionPageProps) {
  const artifact = normalizeArtifact(searchParams);
  const completionPath = buildCompletionPath(artifact);

  return (
    <PublicLayoutShell activePath="/telegram/complete">
      <TelegramCompletionPageShell
        artifact={artifact}
        signInHref={buildHrefWithNext("/sign-in", completionPath)}
        signUpHref={buildHrefWithNext("/sign-up", completionPath)}
      />
    </PublicLayoutShell>
  );
}
