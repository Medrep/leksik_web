export default function HomePage() {
  return (
    <main className="auth-appear flex min-h-screen items-center justify-center px-6 py-16">
      <section className="flex flex-col items-center text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1rem] border border-token-brand bg-token-brandSoft text-2xl font-semibold text-token-brand">
          L
        </div>
        <p className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-token-text sm:text-5xl">
          Leksik
        </p>
        <p className="mt-3 text-base text-token-muted sm:text-lg">Coming soon</p>
      </section>
    </main>
  );
}
