import { enSettingsMessages } from "@/lib/i18n/messages/en";
import { plSettingsMessages } from "@/lib/i18n/messages/pl";
import { ruSettingsMessages } from "@/lib/i18n/messages/ru";
import type { SettingsMessages } from "@/lib/i18n/messages/types";
import { ukSettingsMessages } from "@/lib/i18n/messages/uk";
import type { UiLocale } from "@/lib/ui-locale-options";

const SETTINGS_MESSAGES: Partial<Record<UiLocale, SettingsMessages>> = {
  en: enSettingsMessages,
  pl: plSettingsMessages,
  ru: ruSettingsMessages,
  uk: ukSettingsMessages,
};

export function getSettingsMessages(locale: UiLocale): SettingsMessages {
  return SETTINGS_MESSAGES[locale] ?? enSettingsMessages;
}

export type { SettingsMessages } from "@/lib/i18n/messages/types";
