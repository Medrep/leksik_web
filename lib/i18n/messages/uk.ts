import type {
  AuthenticatedMessages,
  DictionaryDetailsMessages,
  DictionaryListMessages,
  SettingsMessages,
  ShellMessages,
} from "@/lib/i18n/messages/types";

export const ukSettingsMessages = {
  navigation: {
    dictionary: "Словник",
  },
  page: {
    title: "Налаштування",
    subtitle: "Переклади, повторення та підключення Telegram.",
  },
  languageNames: {
    en: "Англійська",
    pl: "Польська",
    uk: "Українська",
    ru: "Російська",
    de: "Німецька",
    es: "Іспанська",
    pt: "Португальська",
  },
  learningLanguage: {
    label: "Я вивчаю",
    description:
      "Використовується як підказка під час розпізнавання нових слів. Ви й надалі можете зберігати слова з інших мов.",
    notSelected: "Не вибрано",
  },
  translationLanguage: {
    label: "Бажана мова перекладу",
    description: "Використовується на картках словника.",
    noTranslation: "Без перекладу",
  },
  interfaceLanguage: {
    label: "Мова інтерфейсу",
    description:
      "Збережіть бажану мову інтерфейсу для підтримуваних розділів Leksik. На цьому етапі локалізовано Налаштування; переклад інших розділів вебзастосунку буде додано окремо.",
    systemDefault: "Типова мова системи/браузера",
    localeNames: {
      en: "English",
      pl: "Polski",
      ru: "Русский",
      uk: "Українська",
    },
  },
  dailyReview: {
    enabledLabel: "Щоденне повторення",
    enabledDescription: "Використовувати Telegram для нагадувань про щоденне повторення.",
    on: "Увімк.",
    off: "Вимк.",
    targetLabel: "Кількість карток на день",
    targetDescription: "Карток на день: крок 5, максимум 50.",
    decreaseTarget: "Зменшити кількість карток на день",
    increaseTarget: "Збільшити кількість карток на день",
  },
  reviewTime: {
    label: "Бажаний час повторення",
    description: "Місцевий час нагадування про щоденне повторення.",
  },
  reviewTimezone: {
    label: "Бажаний часовий пояс",
    description: "Часовий пояс IANA для нагадування про щоденне повторення.",
    none: "Без часового поясу",
    currentSuffix: "поточний",
  },
  feedback: {
    loading: "Завантаження поточних налаштувань…",
    saved: "Налаштування збережено.",
    saving: "Збереження…",
    save: "Зберегти налаштування",
    retry: "Спробувати ще раз",
  },
  errors: {
    load: "Не вдалося завантажити налаштування із сервера.",
    mustLoadBeforeSave: "Перед збереженням потрібно завантажити поточні налаштування.",
    dailyReviewRequiresSchedule: "Для щоденного повторення потрібні час і часовий пояс.",
    save: "Не вдалося зберегти налаштування.",
    validation: "Не вдалося зберегти налаштування. Перевірте вибрані значення та повторіть спробу.",
    deleteAccount: "Не вдалося видалити обліковий запис. Спробуйте ще раз.",
  },
  telegram: {
    sectionLabel: "Telegram",
    checkingHeadline: "Telegram",
    checkingDescription: "Перевіряємо, чи підключено Telegram до цього облікового запису.",
    linkedHeadline: "Telegram підключено",
    linkedDescription:
      "Telegram підключено для збереження слів і щоденного повторення. Вебсловник доступний незалежно від цього підключення.",
    pendingHeadline: "Підключення Telegram очікує завершення",
    pendingDescription:
      "Обліковий запис Telegram розпізнано, але для завершення підключення потрібен одноразовий код із Telegram.",
    conflictHeadline: "Конфлікт підключення Telegram",
    conflictDescription:
      "Підключення Telegram заблоковано через наявний конфлікт. Цей вебклієнт не підтримує перепризначення або від’єднання облікового запису.",
    unlinkedHeadline: "Telegram не підключено",
    unlinkedDescription:
      "Telegram ще не підключено. Якщо ви отримали одноразовий код у Telegram, введіть його тут, щоб завершити підключення.",
    observedAccount: "Розпізнаний обліковий запис",
    stateLabels: {
      unlinked: "не підключено",
      pending: "очікує",
      linked: "підключено",
      conflict: "конфлікт",
    },
    loading: "Завантаження стану підключення Telegram…",
    codeLabel: "Одноразовий код Telegram",
    codePlaceholder: "Введіть код",
    linking: "Підключення…",
    completeLink: "Завершити підключення",
    linkedSuccess: "Telegram підключено.",
    errors: {
      load: "Не вдалося завантажити стан підключення Telegram.",
      codeRequired: "Введіть одноразовий код із Telegram.",
      complete: "Зараз не вдалося завершити підключення Telegram.",
    },
  },
  accountDeletion: {
    sectionTitle: "Небезпечна зона",
    sectionDescription:
      "Видаліть обліковий запис і назавжди видаліть збережену лексику, історію повторень, прогрес навчання та підключення Telegram.",
    openButton: "Видалити обліковий запис",
    modalTitle: "Видалити обліковий запис Leksik?",
    modalDescription:
      "Обліковий запис Leksik буде видалено назавжди разом зі збереженою лексикою, надісланими словами й фразами, створеними картками, історією повторень, прогресом навчання та підключенням Telegram з активних систем.",
    irreversible: "Цю дію неможливо скасувати.",
    retention:
      "Деякі обмежені технічні дані можуть зберігатися, коли це потрібно для безпеки, дотримання законодавства, запобігання зловживанням, цілісності аудиту або зберігання резервних копій, як описано в нашій Політиці конфіденційності.",
    confirmationLabel: "Введіть DELETE для підтвердження",
    cancel: "Скасувати",
    deleting: "Видалення…",
    confirmButton: "Видалити обліковий запис назавжди",
  },
} satisfies SettingsMessages;

export const ukShellMessages = {
  navigation: {
    dictionary: "Словник",
    settings: "Налаштування",
  },
  signOut: {
    action: "Вийти",
    loading: "Вихід…",
    error: "Не вдалося вийти. Спробуйте ще раз.",
  },
  gate: {
    configurationTitle: "Конфігурацію застосунку не завершено",
    configurationDictionary:
      "Укажіть NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY і NEXT_PUBLIC_API_BASE_URL перед відкриттям словника.",
    configurationSettings:
      "Укажіть NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY і NEXT_PUBLIC_API_BASE_URL перед відкриттям налаштувань.",
    preparingDictionary: "Підготовка словника",
    preparingSettings: "Підготовка налаштувань",
    checkingAccess: "Перевіряємо сеанс і завантажуємо доступ.",
    redirectingTitle: "Перехід до входу",
    signInForDictionary: "Щоб відкрити словник, потрібно ввійти.",
    signInForSettings: "Щоб відкрити налаштування, потрібно ввійти.",
    openDictionaryError: "Не вдалося відкрити словник",
    openSettingsError: "Не вдалося відкрити налаштування",
    sessionError: "Не вдалося підтвердити поточний сеанс.",
    languageSettingsTitle: "Не вдалося завантажити мовні налаштування",
    languageSettingsError: "Не вдалося підтвердити поточні мовні налаштування.",
    retry: "Спробувати ще раз",
  },
} satisfies ShellMessages;

export const ukDictionaryListMessages = {
  search: {
    label: "Пошук у словнику",
    placeholder: "Шукати слова...",
    clear: "Очистити",
    queryPrefix: " за запитом «",
    querySuffix: "»",
  },
  count: {
    one: "збережене слово",
    few: "збережені слова",
    many: "збережених слів",
    other: "збережених слів",
  },
  loading: {
    cardTitle: "Завантаження словника",
    words: "Завантаження слів…",
    updating: "Оновлення результатів…",
    preferenceTitle: "Завантаження налаштування перекладу",
    preferenceDescription: "Переклади приховано, доки налаштування не завантажаться.",
  },
  errors: {
    title: "Не вдалося завантажити словник",
    preferences: "Не вдалося завантажити налаштування словника із сервера.",
    list: "Не вдалося завантажити список словника із сервера.",
  },
  empty: {
    searchTitle: "Нічого не знайдено",
    searchDescription: "За цим запитом нічого не знайдено. Спробуйте інше слово або фразу.",
    dictionaryTitle: "Збережених слів поки немає",
    dictionaryDescription: "Надішліть перше слово або фразу через Telegram.",
    openTelegram: "Відкрити Telegram",
  },
  card: {
    openHelper: "Відкрийте, щоб переглянути збережене слово.",
  },
} satisfies DictionaryListMessages;

export const ukDictionaryDetailsMessages = {
  navigation: {
    dictionary: "Словник",
  },
  loading: {
    cardTitle: "Завантаження картки",
  },
  states: {
    unavailableTitle: "Слово недоступне",
    unavailableDescription: "Можливо, це слово відсутнє або недоступне поточному обліковому запису.",
    loadErrorTitle: "Не вдалося завантажити це слово",
  },
  metadata: {
    canonical: "Канонічна форма",
  },
  preference: {
    unavailable: "Не вдалося завантажити налаштування перекладу, тому картку показано без перекладу.",
  },
  sections: {
    translation: "Переклад",
    explanation: "Пояснення",
    examples: "Приклади",
    delete: "Видалення",
  },
  missingContent: "Для цього елемента немає даних.",
  delete: {
    action: "Видалити зі словника",
    confirmationTitle: "Видалити це слово зі словника?",
    confirmationDescription: "Воно зникне зі звичайного перегляду словника.",
    loading: "Видалення…",
    confirm: "Підтвердити видалення",
    cancel: "Скасувати",
  },
  errors: {
    preferences: "Не вдалося завантажити налаштування словника із сервера.",
    details: "Не вдалося завантажити дані картки із сервера.",
    delete: "Не вдалося видалити слово на сервері.",
  },
} satisfies DictionaryDetailsMessages;

export const ukMessages = {
  settings: ukSettingsMessages,
  shell: ukShellMessages,
  dictionaryList: ukDictionaryListMessages,
  dictionaryDetails: ukDictionaryDetailsMessages,
} satisfies AuthenticatedMessages;
