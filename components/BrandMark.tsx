import Link from "next/link";

type BrandMarkProps = {
  to: string;
};

export function BrandMark({ to }: BrandMarkProps) {
  return (
    <Link className="inline-flex items-center gap-3" href={to}>
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-[0.8rem] border border-token-brand bg-token-brandSoft text-base font-semibold text-token-brand"
        aria-hidden="true"
      >
        L
      </span>
      <strong className="text-lg font-semibold leading-none">Leksik</strong>
    </Link>
  );
}
