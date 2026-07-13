"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { buildHrefWithNext, getNextRouteFromWindow, getOptionalNextRouteFromWindow } from "@/lib/auth-next";
import { appConfig } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type SignUpValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SignInValues = {
  email: string;
  password: string;
};

type RecoveryValues = {
  email: string;
};

type SignUpErrorKey =
  | "nameRequired"
  | "emailRequired"
  | "passwordRequired"
  | "passwordConfirmationRequired"
  | "passwordMismatch";
type SignInErrorKey = "emailRequired" | "passwordRequired";
type RecoveryErrorKey = "emailRequired";
type FieldErrors<T extends string, TError extends string> = Partial<Record<T, TError>>;
type AuthStatusState<T extends string> =
  | { kind: "localized"; key: T }
  | { kind: "external"; message: string }
  | null;

const authInputBaseClassName =
  "w-full min-w-0 max-w-full rounded-lg border bg-token-surfaceStrong px-3.5 py-3 text-sm text-token-text outline-none transition-colors duration-200 placeholder:text-token-muted/45 focus:border-token-brand";
const authLabelClassName = "grid w-full min-w-0 max-w-full gap-1 text-xs text-token-muted";
const authPrimaryButtonClassName =
  "inline-flex min-h-11 w-full min-w-0 max-w-full items-center justify-center rounded-lg bg-token-brand px-5 text-sm font-semibold text-white transition duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60";

function getAuthInputClassName(hasError: boolean) {
  return `${authInputBaseClassName} ${
    hasError
      ? "border-[#E8B7AF] bg-[#FFFAF8]"
      : "border-token-border"
  }`;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function hasSupabaseConfigError() {
  return !appConfig.hasSupabaseBrowserAuth;
}

function getExternalAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return null;
}

function resolveStatusMessage<T extends string>(
  status: AuthStatusState<T>,
  localizedMessages: Record<T, string>,
) {
  if (!status) {
    return null;
  }

  return status.kind === "external" ? status.message : localizedMessages[status.key];
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="min-w-0 break-words text-xs leading-5 text-[#8A3328]">{message}</p>;
}

function StatusMessage({
  tone,
  message,
}: {
  tone: "neutral" | "error";
  message: string | null;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={
        tone === "error"
          ? "min-w-0 max-w-full break-words rounded-[0.625rem] border border-[#E8B7AF] bg-[#FFF4F1] px-3.5 py-3 text-[0.8125rem] leading-5 text-[#8A3328]"
          : "min-w-0 max-w-full break-words rounded-[0.625rem] border border-token-border bg-[#FEFAF2] px-3.5 py-3 text-[0.8125rem] leading-5 text-token-muted"
      }
    >
      {message}
    </div>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const { messages } = useLocale();
  const sharedMessages = messages.publicAuth.shared;
  const signUpMessages = messages.publicAuth.signUp;
  const [values, setValues] = useState<SignUpValues>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors<keyof SignUpValues, SignUpErrorKey>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<AuthStatusState<"configuration" | "generic">>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors<keyof SignUpValues, SignUpErrorKey> = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = "nameRequired";
    }
    if (!values.email.trim()) {
      nextErrors.email = "emailRequired";
    }
    if (!values.password.trim()) {
      nextErrors.password = "passwordRequired";
    }
    if (!values.confirmPassword.trim()) {
      nextErrors.confirmPassword = "passwordConfirmationRequired";
    }
    if (
      values.password.trim() &&
      values.confirmPassword.trim() &&
      values.password !== values.confirmPassword
    ) {
      nextErrors.confirmPassword = "passwordMismatch";
    }

    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (hasSupabaseConfigError()) {
      setStatus({ kind: "localized", key: "configuration" });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: {
            full_name: values.fullName.trim(),
          },
        },
      });

      if (error) {
        setStatus({ kind: "external", message: error.message });
        return;
      }

      if (data.session) {
        await supabase.auth.signOut();
      }

      router.replace(buildHrefWithNext("/sign-up/confirmation", getOptionalNextRouteFromWindow()));
    } catch (error) {
      const externalMessage = getExternalAuthErrorMessage(error);
      setStatus(
        externalMessage
          ? { kind: "external", message: externalMessage }
          : { kind: "localized", key: "generic" },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid w-full min-w-0 max-w-full gap-3" onSubmit={handleSubmit} noValidate>
      <StatusMessage
        tone="error"
        message={resolveStatusMessage(status, {
          configuration: sharedMessages.configurationError,
          generic: signUpMessages.genericError,
        })}
      />
      <label className={authLabelClassName}>
        <span>{signUpMessages.displayNameLabel}</span>
        <input
          className={getAuthInputClassName(Boolean(errors.fullName))}
          type="text"
          autoComplete="name"
          placeholder={signUpMessages.displayNamePlaceholder}
          value={values.fullName}
          onChange={(event) => {
            const fullName = event.target.value;
            setValues((current) => ({ ...current, fullName }));
            if (errors.fullName) {
              setErrors((current) => ({ ...current, fullName: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.fullName)}
        />
        <FieldError message={errors.fullName ? signUpMessages[errors.fullName] : undefined} />
      </label>
      <label className={authLabelClassName}>
        <span>{sharedMessages.emailLabel}</span>
        <input
          className={getAuthInputClassName(Boolean(errors.email))}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={sharedMessages.emailPlaceholder}
          value={values.email}
          onChange={(event) => {
            const email = event.target.value;
            setValues((current) => ({ ...current, email }));
            if (errors.email) {
              setErrors((current) => ({ ...current, email: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.email)}
        />
        <FieldError message={errors.email ? signUpMessages[errors.email] : undefined} />
      </label>
      <label className={authLabelClassName}>
        <span>{sharedMessages.passwordLabel}</span>
        <input
          className={getAuthInputClassName(Boolean(errors.password))}
          type="text"
          autoComplete="new-password"
          placeholder={signUpMessages.passwordPlaceholder}
          value={values.password}
          onChange={(event) => {
            const password = event.target.value;
            setValues((current) => ({ ...current, password }));
            if (errors.password) {
              setErrors((current) => ({ ...current, password: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.password)}
        />
        <FieldError message={errors.password ? signUpMessages[errors.password] : undefined} />
      </label>
      <label className={authLabelClassName}>
        <span>{signUpMessages.confirmPasswordLabel}</span>
        <input
          className={getAuthInputClassName(Boolean(errors.confirmPassword))}
          type="text"
          autoComplete="new-password"
          placeholder={signUpMessages.confirmPasswordPlaceholder}
          value={values.confirmPassword}
          onChange={(event) => {
            const confirmPassword = event.target.value;
            setValues((current) => ({ ...current, confirmPassword }));
            if (errors.confirmPassword) {
              setErrors((current) => ({ ...current, confirmPassword: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        <FieldError
          message={errors.confirmPassword ? signUpMessages[errors.confirmPassword] : undefined}
        />
      </label>
      <button className={`${authPrimaryButtonClassName} mt-2`} type="submit" disabled={isSubmitting}>
        {isSubmitting ? signUpMessages.submitting : signUpMessages.submit}
      </button>
    </form>
  );
}

export function SignInForm() {
  const router = useRouter();
  const { messages } = useLocale();
  const sharedMessages = messages.publicAuth.shared;
  const signInMessages = messages.publicAuth.signIn;
  const [values, setValues] = useState<SignInValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors<keyof SignInValues, SignInErrorKey>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<AuthStatusState<"configuration" | "generic">>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors<keyof SignInValues, SignInErrorKey> = {};

    if (!values.email.trim()) {
      nextErrors.email = "emailRequired";
    }
    if (!values.password.trim()) {
      nextErrors.password = "passwordRequired";
    }

    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (hasSupabaseConfigError()) {
      setStatus({ kind: "localized", key: "configuration" });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        setStatus({ kind: "external", message: error.message });
        return;
      }

      router.replace(getNextRouteFromWindow());
    } catch (error) {
      const externalMessage = getExternalAuthErrorMessage(error);
      setStatus(
        externalMessage
          ? { kind: "external", message: externalMessage }
          : { kind: "localized", key: "generic" },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid w-full min-w-0 max-w-full gap-3" onSubmit={handleSubmit} noValidate>
      <StatusMessage
        tone="error"
        message={resolveStatusMessage(status, {
          configuration: sharedMessages.configurationError,
          generic: signInMessages.genericError,
        })}
      />
      <label className={authLabelClassName}>
        <span>{sharedMessages.emailLabel}</span>
        <input
          className={getAuthInputClassName(Boolean(errors.email))}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={sharedMessages.emailPlaceholder}
          value={values.email}
          onChange={(event) => {
            const email = event.target.value;
            setValues((current) => ({ ...current, email }));
            if (errors.email) {
              setErrors((current) => ({ ...current, email: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.email)}
        />
        <FieldError message={errors.email ? signInMessages[errors.email] : undefined} />
      </label>
      <label className={authLabelClassName}>
        <div className="flex w-full min-w-0 items-center justify-between gap-3">
          <span>{sharedMessages.passwordLabel}</span>
          <Link className="min-w-0 text-right text-xs text-token-brand transition hover:brightness-95" href="/password-recovery">
            {signInMessages.forgotPassword}
          </Link>
        </div>
        <input
          className={getAuthInputClassName(Boolean(errors.password))}
          type="text"
          autoComplete="current-password"
          placeholder={signInMessages.passwordPlaceholder}
          value={values.password}
          onChange={(event) => {
            const password = event.target.value;
            setValues((current) => ({ ...current, password }));
            if (errors.password) {
              setErrors((current) => ({ ...current, password: undefined }));
            }
          }}
          aria-invalid={Boolean(errors.password)}
        />
        <FieldError message={errors.password ? signInMessages[errors.password] : undefined} />
      </label>
      <button className={`${authPrimaryButtonClassName} mt-2`} type="submit" disabled={isSubmitting}>
        {isSubmitting ? signInMessages.submitting : signInMessages.submit}
      </button>
    </form>
  );
}

export function PasswordRecoveryForm() {
  const router = useRouter();
  const { messages } = useLocale();
  const sharedMessages = messages.publicAuth.shared;
  const recoveryMessages = messages.publicAuth.passwordRecovery;
  const [values, setValues] = useState<RecoveryValues>({ email: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof RecoveryValues, RecoveryErrorKey>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<
    AuthStatusState<"configuration" | "generic" | "emailIncomplete">
  >(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors<keyof RecoveryValues, RecoveryErrorKey> = {};

    if (!values.email.trim()) {
      nextErrors.email = "emailRequired";
    }

    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({ kind: "localized", key: "emailIncomplete" });
      return;
    }

    if (hasSupabaseConfigError()) {
      setStatus({ kind: "localized", key: "configuration" });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim());

      if (error) {
        setStatus({ kind: "external", message: error.message });
        return;
      }

      await sleep(200);
      router.push("/password-recovery/confirmation");
    } catch (error) {
      const externalMessage = getExternalAuthErrorMessage(error);
      setStatus(
        externalMessage
          ? { kind: "external", message: externalMessage }
          : { kind: "localized", key: "generic" },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid w-full min-w-0 max-w-full gap-3" onSubmit={handleSubmit} noValidate>
      <StatusMessage
        tone="error"
        message={resolveStatusMessage(status, {
          configuration: sharedMessages.configurationError,
          generic: recoveryMessages.genericError,
          emailIncomplete: recoveryMessages.emailIncomplete,
        })}
      />
      <label className={authLabelClassName}>
        <span>{sharedMessages.emailLabel}</span>
        <input
          className={getAuthInputClassName(Boolean(errors.email))}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={sharedMessages.emailPlaceholder}
          value={values.email}
          onChange={(event) => {
            const email = event.target.value;
            setValues({ email });
            if (errors.email) {
              setErrors({ email: undefined });
            }
            if (status) {
              setStatus(null);
            }
          }}
          aria-invalid={Boolean(errors.email)}
        />
        <FieldError message={errors.email ? recoveryMessages[errors.email] : undefined} />
      </label>
      <button className={`${authPrimaryButtonClassName} mt-2`} type="submit" disabled={isSubmitting}>
        {isSubmitting ? recoveryMessages.submitting : recoveryMessages.submit}
      </button>
    </form>
  );
}
