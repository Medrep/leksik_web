import { BrandMark } from "./BrandMark";
import { SignOutButton } from "./SignOutButton";
import { ThemeToggle } from "./ThemeToggle";

export function AuthenticatedLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(202, 128, 28, 0.08), transparent 20rem), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
        }}
      />
      <header className="auth-appear relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-token-border pb-4">
        <div className="flex items-center gap-4">
          <BrandMark to="/dictionary" />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
