type PublicLayoutShellProps = {
  children: React.ReactNode;
  activePath: string;
};

export function PublicLayoutShell({ children }: PublicLayoutShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 12%, rgba(202, 128, 28, 0.08), transparent 18rem), radial-gradient(circle at 50% 100%, rgba(202, 128, 28, 0.06), transparent 24rem)",
        }}
      />
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
