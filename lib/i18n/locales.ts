import { isUiLocale, type UiLocale } from "@/lib/ui-locale-options";

export const DEFAULT_LOCALE: UiLocale = "en";

export function normalizeBrowserLocale(value: unknown): UiLocale | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase().replaceAll("_", "-");

  if (!normalizedValue) {
    return null;
  }

  const [baseLocale] = normalizedValue.split("-");
  return isUiLocale(baseLocale) ? baseLocale : null;
}

export function resolveBrowserLocale(
  languages: unknown,
  language: unknown,
): UiLocale {
  const candidates = Array.isArray(languages) ? languages : [];

  for (const candidate of candidates) {
    const locale = normalizeBrowserLocale(candidate);

    if (locale) {
      return locale;
    }
  }

  return normalizeBrowserLocale(language) ?? DEFAULT_LOCALE;
}

export function readBrowserLocale(): UiLocale {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }

  try {
    return resolveBrowserLocale(navigator.languages, navigator.language);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function resolveEffectiveLocale(
  savedLocale: UiLocale | null,
  browserLocale: UiLocale,
): UiLocale {
  return savedLocale ?? browserLocale ?? DEFAULT_LOCALE;
}
