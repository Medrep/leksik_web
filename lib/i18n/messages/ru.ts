import type { SettingsMessages } from "@/lib/i18n/messages/types";

export const ruSettingsMessages = {
  navigation: {
    dictionary: "Словарь",
  },
  page: {
    title: "Настройки",
    subtitle: "Переводы, повторение и подключение Telegram.",
  },
  languageNames: {
    en: "Английский",
    pl: "Польский",
    uk: "Украинский",
    ru: "Русский",
    de: "Немецкий",
    es: "Испанский",
    pt: "Португальский",
  },
  learningLanguage: {
    label: "Я изучаю",
    description:
      "Используется как подсказка при распознавании новых слов. Вы по-прежнему можете сохранять слова из других языков.",
    notSelected: "Не выбрано",
  },
  translationLanguage: {
    label: "Предпочитаемый язык перевода",
    description: "Используется в карточках словаря.",
    noTranslation: "Без перевода",
  },
  interfaceLanguage: {
    label: "Язык интерфейса",
    description:
      "Сохраните предпочитаемый язык интерфейса для поддерживаемых разделов Leksik. На этом этапе локализованы Настройки; перевод остальных разделов веб-приложения будет добавлен отдельно.",
    systemDefault: "По умолчанию системы/браузера",
    localeNames: {
      en: "English",
      pl: "Polski",
      ru: "Русский",
      uk: "Українська",
    },
  },
  dailyReview: {
    enabledLabel: "Ежедневное повторение",
    enabledDescription: "Использовать Telegram для напоминаний о ежедневном повторении.",
    on: "Вкл.",
    off: "Выкл.",
    targetLabel: "Количество карточек в день",
    targetDescription: "Карточек в день: шаг 5, максимум 50.",
    decreaseTarget: "Уменьшить количество карточек в день",
    increaseTarget: "Увеличить количество карточек в день",
  },
  reviewTime: {
    label: "Предпочитаемое время повторения",
    description: "Местное время напоминания о ежедневном повторении.",
  },
  reviewTimezone: {
    label: "Предпочитаемый часовой пояс",
    description: "Часовой пояс IANA для напоминания о ежедневном повторении.",
    none: "Без часового пояса",
    currentSuffix: "текущий",
  },
  feedback: {
    loading: "Загрузка текущих настроек…",
    saved: "Настройки сохранены.",
    saving: "Сохранение…",
    save: "Сохранить настройки",
    retry: "Повторить",
  },
  errors: {
    load: "Не удалось загрузить настройки с сервера.",
    mustLoadBeforeSave: "Перед сохранением необходимо загрузить текущие настройки.",
    dailyReviewRequiresSchedule: "Для ежедневного повторения нужны время и часовой пояс.",
    save: "Не удалось сохранить настройки.",
    validation: "Не удалось сохранить настройки. Проверьте выбранные значения и повторите попытку.",
    deleteAccount: "Не удалось удалить аккаунт. Повторите попытку.",
  },
  telegram: {
    sectionLabel: "Telegram",
    checkingHeadline: "Telegram",
    checkingDescription: "Проверяем, подключён ли Telegram к этому аккаунту.",
    linkedHeadline: "Telegram подключён",
    linkedDescription:
      "Telegram подключён для сохранения слов и ежедневного повторения. Веб-словарь доступен независимо от этого подключения.",
    pendingHeadline: "Подключение Telegram ожидает завершения",
    pendingDescription:
      "Аккаунт Telegram обнаружен, но для завершения подключения нужен одноразовый код из Telegram.",
    conflictHeadline: "Конфликт подключения Telegram",
    conflictDescription:
      "Подключение Telegram заблокировано существующим конфликтом. Этот веб-клиент не поддерживает переназначение или отключение аккаунта.",
    unlinkedHeadline: "Telegram не подключён",
    unlinkedDescription:
      "Telegram пока не подключён. Если вы получили одноразовый код в Telegram, введите его здесь, чтобы завершить подключение.",
    observedAccount: "Обнаруженный аккаунт",
    stateLabels: {
      unlinked: "не подключён",
      pending: "ожидает",
      linked: "подключён",
      conflict: "конфликт",
    },
    loading: "Загрузка состояния подключения Telegram…",
    codeLabel: "Одноразовый код Telegram",
    codePlaceholder: "Введите код",
    linking: "Подключение…",
    completeLink: "Завершить подключение",
    linkedSuccess: "Telegram подключён.",
    errors: {
      load: "Не удалось загрузить состояние подключения Telegram.",
      codeRequired: "Введите одноразовый код из Telegram.",
      complete: "Сейчас не удалось завершить подключение Telegram.",
    },
  },
  accountDeletion: {
    sectionTitle: "Опасная зона",
    sectionDescription:
      "Удалите аккаунт и навсегда удалите сохранённые слова, историю повторений, прогресс обучения и подключение Telegram.",
    openButton: "Удалить аккаунт",
    modalTitle: "Удалить аккаунт Leksik?",
    modalDescription:
      "Аккаунт Leksik будет удалён навсегда вместе с сохранёнными словами, отправленными словами и фразами, созданными карточками, историей повторений, прогрессом обучения и подключением Telegram из активных систем.",
    irreversible: "Это действие нельзя отменить.",
    retention:
      "Некоторые ограниченные технические данные могут храниться, когда это необходимо для безопасности, соблюдения законодательства, предотвращения злоупотреблений, целостности аудита или хранения резервных копий, как описано в нашей Политике конфиденциальности.",
    confirmationLabel: "Введите DELETE для подтверждения",
    cancel: "Отмена",
    deleting: "Удаление…",
    confirmButton: "Удалить аккаунт навсегда",
  },
} satisfies SettingsMessages;
