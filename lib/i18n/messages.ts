import { enMessages } from "@/lib/i18n/messages/en";
import { plMessages } from "@/lib/i18n/messages/pl";
import { ruMessages } from "@/lib/i18n/messages/ru";
import type {
  AuthenticatedMessages,
  DictionaryWordCountMessages,
} from "@/lib/i18n/messages/types";
import { ukMessages } from "@/lib/i18n/messages/uk";
import type { UiLocale } from "@/lib/ui-locale-options";

const AUTHENTICATED_MESSAGES: Partial<Record<UiLocale, AuthenticatedMessages>> = {
  en: enMessages,
  pl: plMessages,
  ru: ruMessages,
  uk: ukMessages,
};

export function getAuthenticatedMessages(locale: UiLocale): AuthenticatedMessages {
  return AUTHENTICATED_MESSAGES[locale] ?? enMessages;
}

export function formatDictionaryWordCount(
  locale: UiLocale,
  count: number,
  messages: DictionaryWordCountMessages,
) {
  let form: keyof DictionaryWordCountMessages = "other";

  if (Number.isInteger(count)) {
    if (locale === "en") {
      form = count === 1 ? "one" : "other";
    } else {
      const absoluteCount = Math.abs(count);
      const lastDigit = absoluteCount % 10;
      const lastTwoDigits = absoluteCount % 100;

      if (lastDigit === 1 && lastTwoDigits !== 11) {
        form = "one";
      } else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
        form = "few";
      } else {
        form = "many";
      }
    }
  }

  return `${count} ${messages[form]}`;
}

export type {
  AuthenticatedMessages,
  DictionaryDetailsMessages,
  DictionaryListMessages,
  DictionaryWordCountMessages,
  OnboardingMessages,
  SettingsMessages,
  ShellMessages,
  TelegramCompletionMessages,
  TelegramCompletionStateMessages,
} from "@/lib/i18n/messages/types";
