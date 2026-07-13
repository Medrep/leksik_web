import type { LanguageCode } from "@/lib/language-options";
import type { UiLocale } from "@/lib/ui-locale-options";

export type SettingsMessages = {
  navigation: {
    dictionary: string;
  };
  page: {
    title: string;
    subtitle: string;
  };
  languageNames: Record<LanguageCode, string>;
  learningLanguage: {
    label: string;
    description: string;
    notSelected: string;
  };
  translationLanguage: {
    label: string;
    description: string;
    noTranslation: string;
  };
  interfaceLanguage: {
    label: string;
    description: string;
    systemDefault: string;
    localeNames: Record<UiLocale, string>;
  };
  dailyReview: {
    enabledLabel: string;
    enabledDescription: string;
    on: string;
    off: string;
    targetLabel: string;
    targetDescription: string;
    decreaseTarget: string;
    increaseTarget: string;
  };
  reviewTime: {
    label: string;
    description: string;
  };
  reviewTimezone: {
    label: string;
    description: string;
    none: string;
    currentSuffix: string;
  };
  feedback: {
    loading: string;
    saved: string;
    saving: string;
    save: string;
    retry: string;
  };
  errors: {
    load: string;
    mustLoadBeforeSave: string;
    dailyReviewRequiresSchedule: string;
    save: string;
    validation: string;
    deleteAccount: string;
  };
  telegram: {
    sectionLabel: string;
    checkingHeadline: string;
    checkingDescription: string;
    linkedHeadline: string;
    linkedDescription: string;
    pendingHeadline: string;
    pendingDescription: string;
    conflictHeadline: string;
    conflictDescription: string;
    unlinkedHeadline: string;
    unlinkedDescription: string;
    observedAccount: string;
    stateLabels: {
      unlinked: string;
      pending: string;
      linked: string;
      conflict: string;
    };
    loading: string;
    codeLabel: string;
    codePlaceholder: string;
    linking: string;
    completeLink: string;
    linkedSuccess: string;
    errors: {
      load: string;
      codeRequired: string;
      complete: string;
    };
  };
  accountDeletion: {
    sectionTitle: string;
    sectionDescription: string;
    openButton: string;
    modalTitle: string;
    modalDescription: string;
    irreversible: string;
    retention: string;
    confirmationLabel: string;
    cancel: string;
    deleting: string;
    confirmButton: string;
  };
};
