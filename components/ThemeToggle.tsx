"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-token-border bg-token-surfaceStrong text-token-muted transition hover:border-token-brand hover:text-token-brand"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} theme`}
    >
      <span
        className={
          theme === "dark"
            ? "inline-flex h-3 w-3 rounded-full bg-token-brand shadow-[0_0_0_3px_rgba(202,128,28,0.18)]"
            : "inline-flex h-3 w-3 rounded-full border border-token-brand bg-transparent"
        }
        aria-hidden="true"
      />
    </button>
  );
}
