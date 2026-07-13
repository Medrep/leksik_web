export type UiLocale = "en" | "pl" | "ru" | "uk";

export const UI_LOCALE_OPTIONS: ReadonlyArray<{
  label: string;
  value: UiLocale;
}> = [
  { label: "English", value: "en" },
  { label: "Polski", value: "pl" },
  { label: "Русский", value: "ru" },
  { label: "Українська", value: "uk" },
];

export function isUiLocale(value: string): value is UiLocale {
  return UI_LOCALE_OPTIONS.some((option) => option.value === value);
}
