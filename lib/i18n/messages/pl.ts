import type { SettingsMessages } from "@/lib/i18n/messages/types";

export const plSettingsMessages = {
  navigation: {
    dictionary: "Słownik",
  },
  page: {
    title: "Ustawienia",
    subtitle: "Tłumaczenia, powtórki i połączenie z Telegramem.",
  },
  languageNames: {
    en: "Angielski",
    pl: "Polski",
    uk: "Ukraiński",
    ru: "Rosyjski",
    de: "Niemiecki",
    es: "Hiszpański",
    pt: "Portugalski",
  },
  learningLanguage: {
    label: "Uczę się",
    description:
      "Używany jako wskazówka przy interpretowaniu nowych słów. Nadal możesz zapisywać słowa z innych języków.",
    notSelected: "Nie wybrano",
  },
  translationLanguage: {
    label: "Preferowany język tłumaczenia",
    description: "Używany na kartach w słowniku.",
    noTranslation: "Bez tłumaczenia",
  },
  interfaceLanguage: {
    label: "Język interfejsu",
    description:
      "Zapisz preferowany język interfejsu dla obsługiwanych powierzchni Leksik. Ten etap tłumaczy Ustawienia; pozostałe części aplikacji internetowej zostaną przetłumaczone osobno.",
    systemDefault: "Domyślny systemu/przeglądarki",
    localeNames: {
      en: "English",
      pl: "Polski",
      ru: "Русский",
      uk: "Українська",
    },
  },
  dailyReview: {
    enabledLabel: "Codzienne powtórki",
    enabledDescription: "Używaj Telegrama do przypomnień o codziennych powtórkach.",
    on: "Wł.",
    off: "Wył.",
    targetLabel: "Dzienna liczba kart",
    targetDescription: "Liczba kart dziennie, krok 5, maksymalnie 50.",
    decreaseTarget: "Zmniejsz dzienną liczbę kart",
    increaseTarget: "Zwiększ dzienną liczbę kart",
  },
  reviewTime: {
    label: "Preferowana godzina powtórki",
    description: "Lokalna godzina przypomnienia o codziennej powtórce.",
  },
  reviewTimezone: {
    label: "Preferowana strefa czasowa",
    description: "Strefa czasowa IANA dla przypomnienia o codziennej powtórce.",
    none: "Bez strefy czasowej",
    currentSuffix: "obecna",
  },
  feedback: {
    loading: "Wczytywanie bieżących ustawień…",
    saved: "Ustawienia zapisane.",
    saving: "Zapisywanie…",
    save: "Zapisz ustawienia",
    retry: "Spróbuj ponownie",
  },
  errors: {
    load: "Nie udało się wczytać ustawień z serwera.",
    mustLoadBeforeSave: "Przed zapisaniem trzeba wczytać bieżące ustawienia.",
    dailyReviewRequiresSchedule: "Codzienne powtórki wymagają godziny i strefy czasowej.",
    save: "Nie udało się zapisać ustawień.",
    validation: "Nie udało się zapisać ustawień. Sprawdź wybrane wartości i spróbuj ponownie.",
    deleteAccount: "Nie udało się usunąć konta. Spróbuj ponownie.",
  },
  telegram: {
    sectionLabel: "Telegram",
    checkingHeadline: "Telegram",
    checkingDescription: "Sprawdzanie, czy Telegram jest połączony z tym kontem.",
    linkedHeadline: "Telegram połączony",
    linkedDescription:
      "Telegram jest połączony na potrzeby zapisywania słów i codziennych powtórek. Słownik internetowy pozostaje dostępny niezależnie od tego połączenia.",
    pendingHeadline: "Oczekiwanie na połączenie z Telegramem",
    pendingDescription:
      "Konto Telegram zostało rozpoznane, ale połączenie nadal wymaga jednorazowego kodu z Telegrama.",
    conflictHeadline: "Konflikt połączenia z Telegramem",
    conflictDescription:
      "Połączenie z Telegramem jest zablokowane przez istniejący konflikt. Ten klient internetowy nie obsługuje przepisywania ani odłączania kont.",
    unlinkedHeadline: "Telegram niepołączony",
    unlinkedDescription:
      "Telegram nie jest jeszcze połączony. Jeśli otrzymałeś jednorazowy kod w Telegramie, wpisz go tutaj, aby dokończyć łączenie.",
    observedAccount: "Rozpoznane konto",
    stateLabels: {
      unlinked: "niepołączony",
      pending: "oczekuje",
      linked: "połączony",
      conflict: "konflikt",
    },
    loading: "Wczytywanie stanu połączenia z Telegramem…",
    codeLabel: "Jednorazowy kod Telegram",
    codePlaceholder: "Wpisz kod",
    linking: "Łączenie…",
    completeLink: "Dokończ łączenie",
    linkedSuccess: "Telegram został połączony.",
    errors: {
      load: "Nie udało się wczytać stanu połączenia z Telegramem.",
      codeRequired: "Wpisz jednorazowy kod z Telegrama.",
      complete: "Nie udało się teraz dokończyć łączenia z Telegramem.",
    },
  },
  accountDeletion: {
    sectionTitle: "Strefa niebezpieczna",
    sectionDescription:
      "Usuń konto i trwale usuń zapisane słownictwo, historię powtórek, postępy w nauce oraz połączenie z Telegramem.",
    openButton: "Usuń konto",
    modalTitle: "Usunąć konto Leksik?",
    modalDescription:
      "Spowoduje to trwałe usunięcie konta Leksik oraz zapisanych słów, przesłanych słów i zwrotów, wygenerowanych kart, historii powtórek, postępów w nauce i połączenia z Telegramem z aktywnych systemów.",
    irreversible: "Tej czynności nie można cofnąć.",
    retention:
      "Niektóre ograniczone dane techniczne mogą być przechowywane, gdy jest to konieczne ze względów bezpieczeństwa, zgodności z prawem, zapobiegania nadużyciom, integralności audytu lub retencji kopii zapasowych, zgodnie z naszą Polityką prywatności.",
    confirmationLabel: "Wpisz DELETE, aby potwierdzić",
    cancel: "Anuluj",
    deleting: "Usuwanie…",
    confirmButton: "Usuń konto trwale",
  },
} satisfies SettingsMessages;
