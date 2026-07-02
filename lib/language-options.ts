export type LanguageCode = "en" | "pl" | "uk" | "ru" | "de" | "es" | "pt";

export const LANGUAGE_OPTIONS: ReadonlyArray<{
  label: string;
  value: LanguageCode;
}> = [
  { label: "English", value: "en" },
  { label: "Polish", value: "pl" },
  { label: "Ukrainian", value: "uk" },
  { label: "Russian", value: "ru" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
];

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGE_OPTIONS.some((option) => option.value === value);
}
