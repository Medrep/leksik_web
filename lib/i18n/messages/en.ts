import type {
  AuthenticatedMessages,
  DictionaryDetailsMessages,
  DictionaryListMessages,
  SettingsMessages,
  ShellMessages,
} from "@/lib/i18n/messages/types";

export const enSettingsMessages = {
  navigation: {
    dictionary: "Dictionary",
  },
  page: {
    title: "Settings",
    subtitle: "Translation, review, and Telegram connection.",
  },
  languageNames: {
    en: "English",
    pl: "Polish",
    uk: "Ukrainian",
    ru: "Russian",
    de: "German",
    es: "Spanish",
    pt: "Portuguese",
  },
  learningLanguage: {
    label: "I’m learning",
    description:
      "Used as a hint when interpreting new words. You can still save words from other languages.",
    notSelected: "Not selected",
  },
  translationLanguage: {
    label: "Preferred translation language",
    description: "Used on dictionary cards.",
    noTranslation: "No translation",
  },
  interfaceLanguage: {
    label: "Interface language",
    description:
      "Save your preferred interface language for supported Leksik surfaces. This slice localizes Settings; broader web translation will be added separately.",
    systemDefault: "System/browser default",
    localeNames: {
      en: "English",
      pl: "Polski",
      ru: "Русский",
      uk: "Українська",
    },
  },
  dailyReview: {
    enabledLabel: "Daily review enabled",
    enabledDescription: "Use Telegram for daily review reminders.",
    on: "On",
    off: "Off",
    targetLabel: "Daily review target count",
    targetDescription: "Cards per day, step 5 and max 50.",
    decreaseTarget: "Decrease daily review target count",
    increaseTarget: "Increase daily review target count",
  },
  reviewTime: {
    label: "Preferred review time",
    description: "Local time for the daily review reminder.",
  },
  reviewTimezone: {
    label: "Preferred review timezone",
    description: "IANA timezone for the daily review reminder.",
    none: "No timezone",
    currentSuffix: "current",
  },
  feedback: {
    loading: "Loading current settings…",
    saved: "Settings saved.",
    saving: "Saving…",
    save: "Save settings",
    retry: "Try again",
  },
  errors: {
    load: "The settings could not be loaded from the backend.",
    mustLoadBeforeSave: "The current settings must be loaded before saving.",
    dailyReviewRequiresSchedule: "Daily review requires both a review time and timezone.",
    save: "The settings could not be saved.",
    validation: "The settings could not be saved. Check the selected values and try again.",
    deleteAccount: "Could not delete your account. Please try again.",
  },
  telegram: {
    sectionLabel: "Telegram",
    checkingHeadline: "Telegram",
    checkingDescription: "Checking whether Telegram is linked for this account.",
    linkedHeadline: "Telegram linked",
    linkedDescription:
      "Telegram is linked for capture and daily review. Your web dictionary stays available here either way.",
    pendingHeadline: "Telegram link pending",
    pendingDescription:
      "Telegram has been observed, but linking still needs the one-time completion code from Telegram.",
    conflictHeadline: "Telegram link conflict",
    conflictDescription:
      "Telegram linking is blocked by an existing link conflict. This web client does not support reassignment or unlinking.",
    unlinkedHeadline: "Telegram not linked",
    unlinkedDescription:
      "Telegram is not linked yet. If Telegram gave you a one-time completion code, enter it here to finish linking.",
    observedAccount: "Observed account",
    stateLabels: {
      unlinked: "unlinked",
      pending: "pending",
      linked: "linked",
      conflict: "conflict",
    },
    loading: "Loading Telegram link status…",
    codeLabel: "One-time Telegram code",
    codePlaceholder: "Enter code",
    linking: "Linking…",
    completeLink: "Complete link",
    linkedSuccess: "Telegram is now linked.",
    errors: {
      load: "Telegram link status could not be loaded from the backend.",
      codeRequired: "Enter the one-time code from Telegram.",
      complete: "Telegram linking could not be completed right now.",
    },
  },
  accountDeletion: {
    sectionTitle: "Danger zone",
    sectionDescription:
      "Delete your account and permanently remove your saved vocabulary, review history, learning progress, and Telegram connection.",
    openButton: "Delete account",
    modalTitle: "Delete your Leksik account?",
    modalDescription:
      "This will permanently delete your Leksik account and remove your saved vocabulary, submitted words and phrases, generated cards, review history, learning progress, and Telegram connection from active systems.",
    irreversible: "This action cannot be undone.",
    retention:
      "Some limited technical records may be retained where necessary for security, legal compliance, abuse prevention, audit integrity, or backup retention, as described in our Privacy Policy.",
    confirmationLabel: "Type DELETE to confirm",
    cancel: "Cancel",
    deleting: "Deleting…",
    confirmButton: "Delete account permanently",
  },
} satisfies SettingsMessages;

export const enShellMessages = {
  navigation: {
    dictionary: "Dictionary",
    settings: "Settings",
  },
  signOut: {
    action: "Sign out",
    loading: "Signing out…",
    error: "Could not sign out. Please try again.",
  },
  gate: {
    configurationTitle: "App configuration is incomplete",
    configurationDictionary:
      "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_API_BASE_URL before opening the dictionary.",
    configurationSettings:
      "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_API_BASE_URL before opening your settings.",
    preparingDictionary: "Preparing your dictionary",
    preparingSettings: "Preparing your settings",
    checkingAccess: "Checking your session and loading access.",
    redirectingTitle: "Redirecting to sign in",
    signInForDictionary: "You need to sign in before opening the dictionary.",
    signInForSettings: "You need to sign in before opening your settings.",
    openDictionaryError: "We couldn't open the dictionary",
    openSettingsError: "We couldn't open your settings",
    sessionError: "The current session couldn't be confirmed.",
    languageSettingsTitle: "We couldn't load your language settings",
    languageSettingsError: "The current language settings couldn't be confirmed.",
    retry: "Try again",
  },
} satisfies ShellMessages;

export const enDictionaryListMessages = {
  search: {
    label: "Search dictionary",
    placeholder: "Search words...",
    clear: "Clear",
    queryPrefix: " for “",
    querySuffix: "”",
  },
  count: {
    one: "saved word",
    few: "saved words",
    many: "saved words",
    other: "saved words",
  },
  loading: {
    cardTitle: "Dictionary loading",
    words: "Loading words…",
    updating: "Updating results…",
    preferenceTitle: "Loading translation preference",
    preferenceDescription: "Translations are hidden until preferences are ready.",
  },
  errors: {
    title: "Could not load dictionary",
    preferences: "The dictionary preferences could not be loaded from the backend.",
    list: "The dictionary list could not be loaded from the backend.",
  },
  empty: {
    searchTitle: "No search results",
    searchDescription: "No words matched that search. Try a different word or phrase.",
    dictionaryTitle: "No saved words yet",
    dictionaryDescription: "Use Telegram to send your first word or phrase.",
    openTelegram: "Open Telegram",
  },
  card: {
    openHelper: "Open to view this saved word.",
  },
} satisfies DictionaryListMessages;

export const enDictionaryDetailsMessages = {
  navigation: {
    dictionary: "Dictionary",
  },
  loading: {
    cardTitle: "Card loading",
  },
  states: {
    unavailableTitle: "Word unavailable",
    unavailableDescription: "This word may be missing or unavailable to the current account.",
    loadErrorTitle: "Could not load this word",
  },
  metadata: {
    canonical: "Canonical",
  },
  preference: {
    unavailable: "Translation preference could not be loaded, so this card is shown without translation.",
  },
  sections: {
    translation: "Translation",
    explanation: "Explanation",
    examples: "Examples",
    delete: "Delete",
  },
  missingContent: "Not available for this item.",
  delete: {
    action: "Delete from dictionary",
    confirmationTitle: "Delete this word from your dictionary?",
    confirmationDescription: "This removes it from normal dictionary browsing.",
    loading: "Deleting…",
    confirm: "Confirm delete",
    cancel: "Cancel",
  },
  errors: {
    preferences: "The dictionary preferences could not be loaded from the backend.",
    details: "The card details could not be loaded from the backend.",
    delete: "The word could not be deleted from the backend.",
  },
} satisfies DictionaryDetailsMessages;

export const enMessages = {
  settings: enSettingsMessages,
  shell: enShellMessages,
  dictionaryList: enDictionaryListMessages,
  dictionaryDetails: enDictionaryDetailsMessages,
} satisfies AuthenticatedMessages;
