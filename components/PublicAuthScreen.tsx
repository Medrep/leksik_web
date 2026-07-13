"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { PublicAuthCard } from "@/components/PublicAuthCard";
import {
  PasswordRecoveryForm,
  SignInForm,
  SignUpForm,
} from "@/components/PublicAuthForms";
import { PublicAuthRedirect } from "@/components/PublicAuthRedirect";

type PublicAuthScreenProps =
  | { kind: "signIn"; signUpHref: string }
  | { kind: "signUp"; signInHref: string }
  | { kind: "signUpConfirmation"; signInHref: string }
  | { kind: "passwordRecovery" }
  | { kind: "passwordRecoveryConfirmation" };

function PublicAuthReadinessPlaceholder() {
  return (
    <section
      aria-busy="true"
      className="auth-appear w-full min-w-0 max-w-full px-0 py-0 sm:max-w-[25rem] sm:rounded-2xl sm:border sm:border-token-border sm:bg-token-surfaceStrong sm:px-8 sm:py-8"
    >
      <div aria-hidden="true" className="w-full min-w-0">
        <div className="h-4 w-20 rounded bg-token-border/60" />
        <div className="mt-8 h-6 w-44 max-w-full rounded bg-token-border/70" />
        <div className="mt-3 h-4 w-56 max-w-full rounded bg-token-border/50" />
        <div className="mt-7 grid gap-3">
          <div className="h-11 rounded-lg bg-token-border/50" />
          <div className="h-11 rounded-lg bg-token-border/50" />
          <div className="h-11 rounded-lg bg-token-border/70" />
        </div>
      </div>
    </section>
  );
}

export function PublicAuthScreen(props: PublicAuthScreenProps) {
  const { isPublicLocaleReady, messages } = useLocale();

  if (!isPublicLocaleReady) {
    return (
      <>
        {props.kind !== "signUpConfirmation" ? <PublicAuthRedirect /> : null}
        <PublicAuthReadinessPlaceholder />
      </>
    );
  }

  const publicAuthMessages = messages.publicAuth;

  if (props.kind === "signIn") {
    return (
      <>
        <PublicAuthRedirect />
        <PublicAuthCard
          variant="form"
          title={publicAuthMessages.signIn.title}
          description={publicAuthMessages.signIn.description}
          backHref="/"
          backLabel={publicAuthMessages.shared.back}
          footer={
            <div className="flex min-w-0 flex-wrap items-center justify-center gap-1">
              <span>{publicAuthMessages.signIn.noAccount}</span>
              <Link className="text-token-brand" href={props.signUpHref}>
                {publicAuthMessages.signIn.signUp}
              </Link>
            </div>
          }
        >
          <SignInForm />
        </PublicAuthCard>
      </>
    );
  }

  if (props.kind === "signUp") {
    return (
      <>
        <PublicAuthRedirect />
        <PublicAuthCard
          variant="form"
          title={publicAuthMessages.signUp.title}
          description={publicAuthMessages.signUp.description}
          backHref="/"
          backLabel={publicAuthMessages.shared.back}
          footer={
            <>
              {publicAuthMessages.signUp.existingAccount}{" "}
              <Link className="text-token-brand" href={props.signInHref}>
                {publicAuthMessages.shared.signIn}
              </Link>
            </>
          }
        >
          <SignUpForm />
        </PublicAuthCard>
      </>
    );
  }

  if (props.kind === "signUpConfirmation") {
    return (
      <PublicAuthCard
        variant="confirmation"
        title={publicAuthMessages.signUpConfirmation.title}
        description={publicAuthMessages.signUpConfirmation.description}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-token-brand bg-token-brandSoft text-token-brand">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <rect x="3.75" y="6.75" width="18.5" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.5 9.25L13 15.25L21.5 9.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mb-6 text-sm font-medium text-token-text">
            {publicAuthMessages.signUpConfirmation.confirmationMessage}
          </p>
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition hover:brightness-95"
            href={props.signInHref}
          >
            {publicAuthMessages.signUpConfirmation.openSignIn}
          </Link>
        </div>
      </PublicAuthCard>
    );
  }

  if (props.kind === "passwordRecovery") {
    return (
      <>
        <PublicAuthRedirect />
        <PublicAuthCard
          variant="form"
          title={publicAuthMessages.passwordRecovery.title}
          description={publicAuthMessages.passwordRecovery.description}
          backHref="/sign-in"
          backLabel={publicAuthMessages.shared.signIn}
        >
          <PasswordRecoveryForm />
        </PublicAuthCard>
      </>
    );
  }

  return (
    <>
      <PublicAuthRedirect />
      <PublicAuthCard
        variant="confirmation"
        title={publicAuthMessages.passwordRecoveryConfirmation.title}
        description={publicAuthMessages.passwordRecoveryConfirmation.description}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-token-brand bg-token-brandSoft text-token-brand">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M5 11.25L9.25 15.5L17.25 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition hover:brightness-95"
            href="/sign-in"
          >
            {publicAuthMessages.passwordRecoveryConfirmation.backToSignIn}
          </Link>
          <Link
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg text-sm font-medium text-token-muted transition hover:text-token-brand"
            href="/password-recovery"
          >
            {publicAuthMessages.passwordRecoveryConfirmation.resetAgain}
          </Link>
        </div>
      </PublicAuthCard>
    </>
  );
}
