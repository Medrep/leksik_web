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

export type ShellMessages = {
  navigation: {
    dictionary: string;
    settings: string;
  };
  signOut: {
    action: string;
    loading: string;
    error: string;
  };
  gate: {
    configurationTitle: string;
    configurationDictionary: string;
    configurationSettings: string;
    preparingDictionary: string;
    preparingSettings: string;
    checkingAccess: string;
    redirectingTitle: string;
    signInForDictionary: string;
    signInForSettings: string;
    openDictionaryError: string;
    openSettingsError: string;
    sessionError: string;
    languageSettingsTitle: string;
    languageSettingsError: string;
    retry: string;
  };
};

export type DictionaryWordCountMessages = {
  one: string;
  few: string;
  many: string;
  other: string;
};

export type DictionaryListMessages = {
  search: {
    label: string;
    placeholder: string;
    clear: string;
    queryPrefix: string;
    querySuffix: string;
  };
  count: DictionaryWordCountMessages;
  loading: {
    cardTitle: string;
    words: string;
    updating: string;
    preferenceTitle: string;
    preferenceDescription: string;
  };
  errors: {
    title: string;
    preferences: string;
    list: string;
  };
  empty: {
    searchTitle: string;
    searchDescription: string;
    dictionaryTitle: string;
    dictionaryDescription: string;
    openTelegram: string;
  };
  card: {
    openHelper: string;
  };
};

export type DictionaryDetailsMessages = {
  navigation: {
    dictionary: string;
  };
  loading: {
    cardTitle: string;
  };
  states: {
    unavailableTitle: string;
    unavailableDescription: string;
    loadErrorTitle: string;
  };
  metadata: {
    canonical: string;
  };
  preference: {
    unavailable: string;
  };
  sections: {
    translation: string;
    explanation: string;
    examples: string;
    delete: string;
  };
  missingContent: string;
  delete: {
    action: string;
    confirmationTitle: string;
    confirmationDescription: string;
    loading: string;
    confirm: string;
    cancel: string;
  };
  errors: {
    preferences: string;
    details: string;
    delete: string;
  };
};

export type OnboardingMessages = {
  title: string;
  subtitle: string;
  learningLanguage: {
    label: string;
    placeholder: string;
  };
  translationLanguage: {
    label: string;
    placeholder: string;
  };
  helper: string;
  continue: string;
  saving: string;
  saveError: string;
};

export type TelegramCompletionStateMessages = {
  badge: string;
  title: string;
  description: string;
  detailTitle: string;
};

export type TelegramCompletionMessages = {
  states: {
    checking: TelegramCompletionStateMessages;
    authRequired: TelegramCompletionStateMessages;
    success: TelegramCompletionStateMessages;
    blocked: TelegramCompletionStateMessages;
    invalid: TelegramCompletionStateMessages;
  };
  details: {
    noCodeProvided: string;
    linkingCompleted: string;
    accountConflict: string;
    backendIncomplete: string;
    conflictFallback: string;
    invalidFallback: string;
    genericFailure: string;
    codeFound: string;
    codeNotFound: string;
  };
  actions: {
    signIn: string;
    createAccount: string;
    openDictionary: string;
  };
};

export type AuthenticatedMessages = {
  settings: SettingsMessages;
  shell: ShellMessages;
  dictionaryList: DictionaryListMessages;
  dictionaryDetails: DictionaryDetailsMessages;
  onboarding: OnboardingMessages;
  telegramCompletion: TelegramCompletionMessages;
};
