"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

export const THEME_STORAGE_KEY = "leksik-web-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const datasetTheme = document.documentElement.dataset.theme;
  if (datasetTheme === "light" || datasetTheme === "dark") {
    return datasetTheme;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [hasHydrated, theme]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      if (event.newValue === "light" || event.newValue === "dark") {
        setTheme(event.newValue);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
