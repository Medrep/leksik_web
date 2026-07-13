"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { LanguagePreferencesOnboardingGate } from "@/components/LanguagePreferencesOnboardingGate";
import { useLocale } from "@/components/LocaleProvider";

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
    <section className="shell-panel auth-appear w-full min-w-0 max-w-full overflow-x-clip rounded-[1.4rem] px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto flex w-full min-w-0 max-w-xl flex-col items-start gap-4">
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
  const {
    authStatus,
    bootstrapError,
    bootstrapStatus,
    hasBootstrapConfig,
    languageSetupError,
    languageSetupStatus,
    refreshBootstrap,
  } = useAuth();
  const { isLocaleReady, messages } = useLocale();
  const isSettings = resourceLabel === "settings";
  const configDescription = isSettings
    ? messages.shell.gate.configurationSettings
    : messages.shell.gate.configurationDictionary;
  const loadingTitle = isSettings
    ? messages.shell.gate.preparingSettings
    : messages.shell.gate.preparingDictionary;
  const redirectDescription = isSettings
    ? messages.shell.gate.signInForSettings
    : messages.shell.gate.signInForDictionary;
  const errorTitle = isSettings
    ? messages.shell.gate.openSettingsError
    : messages.shell.gate.openDictionaryError;

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      const nextPath = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/sign-in${nextPath}`);
    }
  }, [authStatus, pathname, router]);

  if (!hasBootstrapConfig) {
    return (
      <GatePanel
        title={messages.shell.gate.configurationTitle}
        description={configDescription}
      />
    );
  }

  if (
    authStatus === "loading" ||
    (authStatus === "authenticated" &&
      (bootstrapStatus === "checking" ||
        languageSetupStatus === "checking" ||
        (languageSetupStatus === "complete" && !isLocaleReady)))
  ) {
    return (
      <GatePanel
        title={loadingTitle}
        description={messages.shell.gate.checkingAccess}
      />
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <GatePanel
        title={messages.shell.gate.redirectingTitle}
        description={redirectDescription}
      />
    );
  }

  if (authStatus === "error" || bootstrapStatus === "error") {
    return (
      <GatePanel
        title={errorTitle}
        description={bootstrapError ?? messages.shell.gate.sessionError}
        action={
          <button className="secondary-button" type="button" onClick={() => void refreshBootstrap()}>
            {messages.shell.gate.retry}
          </button>
        }
      />
    );
  }

  if (languageSetupStatus === "error") {
    return (
      <GatePanel
        title={messages.shell.gate.languageSettingsTitle}
        description={languageSetupError ?? messages.shell.gate.languageSettingsError}
        action={
          <button className="secondary-button" type="button" onClick={() => void refreshBootstrap()}>
            {messages.shell.gate.retry}
          </button>
        }
      />
    );
  }

  if (languageSetupStatus === "required") {
    return <LanguagePreferencesOnboardingGate />;
  }

  return <>{children}</>;
}
