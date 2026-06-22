"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function GatePanel({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="shell-panel auth-appear min-w-0 max-w-full rounded-[1.4rem] px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto flex min-w-0 max-w-xl flex-col items-start gap-4">
        <div className="min-w-0 max-w-full">
          <h1 className="break-words text-3xl font-semibold leading-tight tracking-[-0.03em] text-token-text sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-xl break-words text-base leading-7 text-token-muted">{description}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

export function AuthenticatedRouteGate({
  children,
  resourceLabel,
}: {
  children: React.ReactNode;
  resourceLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus, bootstrapError, bootstrapStatus, hasBootstrapConfig, refreshBootstrap } = useAuth();
  const configDescription = resourceLabel
    ? `Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_API_BASE_URL before opening your ${resourceLabel}.`
    : "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_API_BASE_URL before opening the dictionary.";
  const loadingTitle = resourceLabel ? `Preparing your ${resourceLabel}` : "Preparing your dictionary";
  const redirectDescription = resourceLabel
    ? `You need to sign in before opening your ${resourceLabel}.`
    : "You need to sign in before opening the dictionary.";
  const errorTitle = resourceLabel ? `We couldn't open your ${resourceLabel}` : "We couldn't open the dictionary";

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      const nextPath = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/sign-in${nextPath}`);
    }
  }, [authStatus, pathname, router]);

  if (!hasBootstrapConfig) {
    return (
      <GatePanel
        title="App configuration is incomplete"
        description={configDescription}
      />
    );
  }

  if (authStatus === "loading" || (authStatus === "authenticated" && bootstrapStatus === "checking")) {
    return (
      <GatePanel
        title={loadingTitle}
        description="Checking your session and loading access."
      />
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <GatePanel
        title="Redirecting to sign in"
        description={redirectDescription}
      />
    );
  }

  if (authStatus === "error" || bootstrapStatus === "error") {
    return (
      <GatePanel
        title={errorTitle}
        description={bootstrapError ?? "The current session couldn't be confirmed."}
        action={
          <button className="secondary-button" type="button" onClick={() => void refreshBootstrap()}>
            Try again
          </button>
        }
      />
    );
  }

  return <>{children}</>;
}
