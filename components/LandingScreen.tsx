"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

export function LandingScreen() {
  const { isPublicLocaleReady, messages } = useLocale();

  if (!isPublicLocaleReady) {
    return (
      <main
        aria-busy="true"
        className="auth-appear min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-token-surfaceStrong px-8 py-10 text-token-text sm:px-10 sm:py-14"
      >
        <section
          aria-hidden="true"
          className="mx-auto flex min-h-[calc(100svh-5rem)] w-full min-w-0 max-w-3xl flex-col justify-between text-center md:min-h-[calc(100vh-7rem)] md:justify-center md:gap-9"
        >
          <div className="flex flex-1 flex-col items-center justify-center pb-12 md:flex-none md:pb-0">
            <div className="h-[3.375rem] w-[3.375rem] rounded-[0.95rem] border border-token-brand bg-token-brandSoft md:h-[3.75rem] md:w-[3.75rem] md:rounded-2xl" />
            <div className="mt-5 h-7 w-24 rounded bg-token-border/70" />
            <div className="mt-4 h-4 w-48 max-w-full rounded bg-token-border/60" />
          </div>
          <div className="mx-auto w-full max-w-[20rem] md:max-w-md">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-11 rounded-lg bg-token-border/70" />
              <div className="h-11 rounded-lg bg-token-border/50" />
            </div>
            <div className="mx-auto mt-5 h-3 w-40 max-w-full rounded bg-token-border/50" />
          </div>
        </section>
      </main>
    );
  }

  const landingMessages = messages.landing;

  return (
    <main className="auth-appear min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-token-surfaceStrong px-8 py-10 text-token-text sm:px-10 sm:py-14">
      <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full min-w-0 max-w-3xl flex-col justify-between text-center md:min-h-[calc(100vh-7rem)] md:justify-center md:gap-9">
        <div className="flex flex-1 flex-col items-center justify-center pb-12 md:flex-none md:pb-0">
          <div
            aria-hidden="true"
            className="inline-flex h-[3.375rem] w-[3.375rem] items-center justify-center rounded-[0.95rem] border border-token-brand bg-token-brandSoft font-serifDisplay text-[1.55rem] text-token-brand md:h-[3.75rem] md:w-[3.75rem] md:rounded-2xl md:text-[1.75rem]"
          >
            L
          </div>
          <h1 className="mt-5 text-2xl font-semibold leading-tight text-token-text md:text-[1.75rem]">
            Leksik
          </h1>
          <p className="mt-3 max-w-[13rem] text-sm leading-7 text-token-muted md:max-w-[18rem] md:text-base">
            {landingMessages.subtitle}
          </p>
        </div>

        <div className="mx-auto w-full max-w-[20rem] md:max-w-none">
          <div className="flex flex-col gap-3 md:flex-row md:justify-center">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-token-brand px-8 text-sm font-semibold text-white transition hover:brightness-95 md:min-w-[7.5rem]"
              href="/sign-in"
            >
              {landingMessages.signIn}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-token-brand bg-transparent px-8 text-sm font-semibold text-token-brand transition hover:bg-token-brandSoft md:min-w-[10rem]"
              href="/sign-up"
            >
              {landingMessages.createAccount}
            </Link>
          </div>
          <p className="mt-5 text-xs text-token-muted">{landingMessages.telegramHelper}</p>
        </div>
      </section>
    </main>
  );
}
