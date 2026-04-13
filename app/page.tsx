import Link from "next/link";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";

export default function LandingPage() {
  return (
    <PublicLayoutShell activePath="/">
      <section className="auth-appear flex w-full justify-center">
        <div className="flex max-w-[30rem] flex-col items-center text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.2rem] border border-token-brand bg-token-brandSoft text-3xl font-semibold text-token-brand">
            L
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.03em] text-token-text sm:text-6xl">
            Leksik
          </h1>
          <p className="mt-5 max-w-sm text-lg leading-8 text-token-muted">
            Your personal vocabulary list, always at hand.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row">
            <Link className="primary-button min-h-[3rem] flex-1" href="/sign-in">
              Sign in
            </Link>
            <Link className="secondary-button min-h-[3rem] flex-1" href="/sign-up">
              Create account
            </Link>
          </div>

          <p className="mt-6 text-sm text-[#b4aea6]">Add words via the Telegram bot</p>
        </div>
      </section>
    </PublicLayoutShell>
  );
}
