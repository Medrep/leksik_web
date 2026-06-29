import Link from "next/link";

type BrandMarkProps = {
  to: string;
};

export function BrandMark({ to }: BrandMarkProps) {
  return (
    <Link className="inline-flex min-w-0 max-w-full items-center gap-3" href={to}>
      <img className="h-9 w-9 shrink-0" src="/leksik-logo.svg" alt="" aria-hidden="true" />
      <strong className="min-w-0 truncate text-lg font-semibold leading-none">Leksik</strong>
    </Link>
  );
}
