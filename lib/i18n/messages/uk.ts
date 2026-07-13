import type { SettingsMessages } from "@/lib/i18n/messages/types";

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
