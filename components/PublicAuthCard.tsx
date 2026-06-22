import Link from "next/link";

type PublicAuthCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  variant?: "default" | "form" | "confirmation";
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function PublicAuthCard({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back",
  variant = "default",
  footer,
  children,
}: PublicAuthCardProps) {
  const isFormVariant = variant === "form";
  const isConfirmationVariant = variant === "confirmation";

  return (
    <section
      className={
        isFormVariant
          ? "auth-appear w-full min-w-0 max-w-full px-0 py-0 sm:max-w-[25rem] sm:rounded-2xl sm:border sm:border-token-border sm:bg-token-surfaceStrong sm:px-8 sm:py-8"
          : isConfirmationVariant
            ? "auth-appear w-full min-w-0 max-w-full px-0 py-0 text-center sm:max-w-[25rem] sm:rounded-2xl sm:border sm:border-token-border sm:bg-token-surfaceStrong sm:px-8 sm:py-8"
            : "auth-appear shell-panel w-full min-w-0 max-w-full rounded-[1.6rem] px-6 py-7 sm:max-w-[30rem] sm:px-8 sm:py-8"
      }
    >
      <div className="min-w-0 max-w-full">
        {backHref ? (
          <Link
            className={
              isFormVariant
                ? "mb-7 inline-flex items-center gap-2 text-[0.8125rem] text-token-muted transition hover:text-token-brand"
                : isConfirmationVariant
                  ? "mb-8 inline-flex items-center gap-2 text-[0.8125rem] text-token-muted transition hover:text-token-brand"
                : "mb-7 inline-flex items-center gap-2 text-sm text-token-muted transition hover:text-token-brand"
            }
            href={backHref}
          >
            <span aria-hidden="true">←</span>
            {backLabel}
          </Link>
        ) : null}

        {eyebrow ? <p className="mb-3 text-xs uppercase tracking-[0.18em] text-token-brand">{eyebrow}</p> : null}
        <h1
          className={
            isFormVariant
              ? "text-[1.3125rem] font-medium leading-tight text-token-text"
              : isConfirmationVariant
                ? "text-[1.3125rem] font-medium leading-tight text-token-text"
              : "text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-token-text"
          }
        >
          {title}
        </h1>
        <p
          className={
            isFormVariant
              ? "mt-1 max-w-md text-[0.8125rem] leading-6 text-token-muted"
              : isConfirmationVariant
                ? "mx-auto mt-2 max-w-[15rem] text-[0.8125rem] leading-6 text-token-muted"
              : "mt-1 max-w-md text-base leading-7 text-token-muted"
          }
        >
          {description}
        </p>

        <div className={isFormVariant ? "mt-5 min-w-0 max-w-full" : isConfirmationVariant ? "mt-6 min-w-0 max-w-full" : "mt-8 min-w-0 max-w-full"}>{children}</div>

        {footer ? (
          <div
            className={
              isFormVariant || isConfirmationVariant
                ? "mt-5 min-w-0 max-w-full break-words text-center text-[0.8125rem] text-token-muted"
                : "mt-5 min-w-0 max-w-full break-words text-center text-sm text-token-muted"
            }
          >
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}
