import Link from "next/link";

type PublicAuthCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function PublicAuthCard({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back",
  footer,
  children,
}: PublicAuthCardProps) {
  return (
    <section className="auth-appear shell-panel w-full max-w-[30rem] rounded-[1.6rem] px-6 py-7 sm:px-8 sm:py-8">
      <div>
        {backHref ? (
          <Link
            className="mb-7 inline-flex items-center gap-2 text-sm text-token-muted transition hover:text-token-brand"
            href={backHref}
          >
            <span aria-hidden="true">←</span>
            {backLabel}
          </Link>
        ) : null}

        {eyebrow ? <p className="mb-3 text-xs uppercase tracking-[0.18em] text-token-brand">{eyebrow}</p> : null}
        <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-token-text">{title}</h1>
        <p className="mt-1 max-w-md text-base leading-7 text-token-muted">{description}</p>

        <div className="mt-8">{children}</div>

        {footer ? <div className="mt-5 text-center text-sm text-token-muted">{footer}</div> : null}
      </div>
    </section>
  );
}
