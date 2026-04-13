"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type FieldErrors<T extends string> = Partial<Record<T, string>>;

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getNextRoute() {
  if (typeof window === "undefined") {
    return "/dictionary";
  }

  const searchParams = new URLSearchParams(window.location.search);
  const nextRoute = searchParams.get("next");

  if (!nextRoute || !nextRoute.startsWith("/")) {
    return "/dictionary";
  }

  return nextRoute;
}

function getSupabaseConfigError() {
  if (!appConfig.hasSupabaseBrowserAuth) {
    return "Missing Supabase browser auth configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }

  return null;
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm leading-5 text-red-700 dark:text-red-300">{message}</p>;
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
          ? "mt-4 rounded-[1rem] border border-red-300/60 bg-red-50/80 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-400/30 dark:bg-red-950/30 dark:text-red-200"
          : "mt-4 rounded-[1rem] border border-token-border bg-token-brandSoft px-4 py-3 text-sm leading-6 text-token-muted"
      }
    >
      {message}
    </div>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [values, setValues] = useState<SignUpValues>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors<keyof SignUpValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error">("neutral");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors<keyof SignUpValues> = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Enter your name to continue.";
    }
    if (!values.email.trim()) {
      nextErrors.email = "Enter your email to continue.";
    }
    if (!values.password.trim()) {
      nextErrors.password = "Enter a password to continue.";
    }
    if (!values.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm your password to continue.";
    }
    if (
      values.password.trim() &&
      values.confirmPassword.trim() &&
      values.password !== values.confirmPassword
    ) {
      nextErrors.confirmPassword = "Repeat the same password in both fields.";
    }

    setErrors(nextErrors);
    setStatusMessage(null);
    setStatusTone("neutral");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const configError = getSupabaseConfigError();

    if (configError) {
      setStatusTone("error");
      setStatusMessage(configError);
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
        setStatusTone("error");
        setStatusMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace(getNextRoute());
        return;
      }

      setStatusTone("neutral");
      setStatusMessage(
        "Account request accepted. If email confirmation is enabled for this Supabase project, confirm your email before signing in.",
      );
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(getAuthErrorMessage(error, "Sign-up could not be completed from the current browser auth setup."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <label className="grid gap-2 text-sm text-token-muted">
        <span>Full name</span>
        <input
          className="field-input"
          type="text"
          autoComplete="name"
          placeholder="Your name"
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
        <FieldError message={errors.fullName} />
      </label>
      <label className="grid gap-2 text-sm text-token-muted">
        <span>Email</span>
        <input
          className="field-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
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
        <FieldError message={errors.email} />
      </label>
      <label className="grid gap-2 text-sm text-token-muted">
        <span>Password</span>
        <input
          className="field-input"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
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
        <FieldError message={errors.password} />
      </label>
      <label className="grid gap-2 text-sm text-token-muted">
        <span>Confirm password</span>
        <input
          className="field-input"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
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
        <FieldError message={errors.confirmPassword} />
      </label>
      <button className="primary-button mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Get started"}
      </button>
      <StatusMessage tone={statusTone} message={statusMessage} />
    </form>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [values, setValues] = useState<SignInValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors<keyof SignInValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error">("neutral");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors<keyof SignInValues> = {};

    if (!values.email.trim()) {
      nextErrors.email = "Enter your email to continue.";
    }
    if (!values.password.trim()) {
      nextErrors.password = "Enter your password to continue.";
    }

    setErrors(nextErrors);
    setStatusMessage(null);
    setStatusTone("neutral");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const configError = getSupabaseConfigError();

    if (configError) {
      setStatusTone("error");
      setStatusMessage(configError);
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
        setStatusTone("error");
        setStatusMessage(error.message);
        return;
      }

      router.replace(getNextRoute());
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(getAuthErrorMessage(error, "Sign-in could not be completed from the current browser auth setup."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <label className="grid gap-2 text-sm text-token-muted">
        <span>Email</span>
        <input
          className="field-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
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
        <FieldError message={errors.email} />
      </label>
      <label className="grid gap-2 text-sm text-token-muted">
        <div className="flex items-center justify-between gap-3">
          <span>Password</span>
          <Link className="text-sm text-token-brand" href="/password-recovery">
            Forgot password?
          </Link>
        </div>
        <input
          className="field-input"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
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
        <FieldError message={errors.password} />
      </label>
      <button className="primary-button mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      <StatusMessage tone={statusTone} message={statusMessage} />
    </form>
  );
}

export function PasswordRecoveryForm() {
  const router = useRouter();
  const [values, setValues] = useState<RecoveryValues>({ email: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof RecoveryValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "error">("neutral");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors<keyof RecoveryValues> = {};

    if (!values.email.trim()) {
      nextErrors.email = "Enter your email to continue.";
    }

    setErrors(nextErrors);
    setStatusMessage(null);
    setStatusTone("neutral");

    if (Object.keys(nextErrors).length > 0) {
      setStatusTone("error");
      setStatusMessage("Complete the email field before continuing.");
      return;
    }

    const configError = getSupabaseConfigError();

    if (configError) {
      setStatusTone("error");
      setStatusMessage(configError);
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim());

      if (error) {
        setStatusTone("error");
        setStatusMessage(error.message);
        return;
      }

      await sleep(200);
      router.push("/password-recovery/confirmation");
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(
        getAuthErrorMessage(error, "Password recovery could not be started from the current browser auth setup."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <label className="grid gap-2 text-sm text-token-muted">
        <span>Email</span>
        <input
          className="field-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(event) => {
            const email = event.target.value;
            setValues({ email });
            if (errors.email) {
              setErrors({ email: undefined });
            }
            if (statusMessage) {
              setStatusMessage(null);
            }
            if (statusTone === "error") {
              setStatusTone("neutral");
            }
          }}
          aria-invalid={Boolean(errors.email)}
        />
        <FieldError message={errors.email} />
      </label>
      <button className="primary-button mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending reset link..." : "Send reset link"}
      </button>
      <StatusMessage tone={statusTone} message={statusMessage} />
    </form>
  );
}
