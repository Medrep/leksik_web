"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLocale } from "@/components/LocaleProvider";
import { BackendRequestError } from "@/lib/backend-client";
import { LANGUAGE_OPTIONS, isLanguageCode, type LanguageCode } from "@/lib/language-options";
import { updateLearningPreferences } from "@/lib/preferences";
import { invalidateCachedDictionaryReadDataForUser } from "@/lib/vocab-cache";

type LanguageSelectValue = "" | LanguageCode;

function toInitialSelectValue(value: string | null | undefined): LanguageSelectValue {
  return value && isLanguageCode(value) ? value : "";
}

export function LanguagePreferencesOnboardingGate() {
  const {
    completeLanguageSetup,
    languagePreferences,
    refreshBootstrap,
    session,
    user,
  } = useAuth();
  const { messages } = useLocale();
  const onboardingMessages = messages.onboarding;
  const [learningLanguage, setLearningLanguage] = useState<LanguageSelectValue>(
    toInitialSelectValue(languagePreferences?.learningLanguage),
  );
  const [preferredTranslationLanguage, setPreferredTranslationLanguage] =
    useState<LanguageSelectValue>(
      toInitialSelectValue(languagePreferences?.preferredTranslationLanguage),
    );
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaveError, setHasSaveError] = useState(false);
  const canContinue = Boolean(learningLanguage && preferredTranslationLanguage);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.access_token || !languagePreferences || !canContinue) {
      return;
    }

    setIsSaving(true);
    setHasSaveError(false);

    try {
      const updatedPreferences = await updateLearningPreferences({
        accessToken: session.access_token,
        update: {
          learningLanguage,
          preferredTranslationLanguage,
        },
      });

      if (user?.id) {
        invalidateCachedDictionaryReadDataForUser(user.id);
      }

      if (user?.id) {
        completeLanguageSetup(updatedPreferences, user.id);
      }
    } catch (error) {
      if (error instanceof BackendRequestError && error.status === 401) {
        void refreshBootstrap();
        return;
      }

      setHasSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="auth-appear mx-auto flex w-full min-w-0 max-w-[32rem] flex-col gap-6">
      <div className="min-w-0 max-w-full">
        <h1 className="break-words text-[1.65rem] font-semibold leading-tight text-token-text sm:text-[2rem]">
          {onboardingMessages.title}
        </h1>
        <p className="mt-3 break-words text-[0.95rem] leading-7 text-token-muted">
          {onboardingMessages.subtitle}
        </p>
      </div>

      <form
        className="grid w-full min-w-0 max-w-full gap-4"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <label className="grid gap-2">
          <span className="text-[0.8125rem] font-medium text-token-text">
            {onboardingMessages.learningLanguage.label}
          </span>
          <select
            aria-label={onboardingMessages.learningLanguage.label}
            className="field-input"
            name="learning_language"
            value={learningLanguage}
            required
            disabled={isSaving}
            onChange={(event) => {
              setLearningLanguage(event.target.value as LanguageSelectValue);
              setHasSaveError(false);
            }}
          >
            <option value="">{onboardingMessages.learningLanguage.placeholder}</option>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {messages.settings.languageNames[option.value]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-[0.8125rem] font-medium text-token-text">
            {onboardingMessages.translationLanguage.label}
          </span>
          <select
            aria-label={onboardingMessages.translationLanguage.label}
            className="field-input"
            name="preferred_translation_language"
            value={preferredTranslationLanguage}
            required
            disabled={isSaving}
            onChange={(event) => {
              setPreferredTranslationLanguage(event.target.value as LanguageSelectValue);
              setHasSaveError(false);
            }}
          >
            <option value="">{onboardingMessages.translationLanguage.placeholder}</option>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {messages.settings.languageNames[option.value]}
              </option>
            ))}
          </select>
        </label>

        <p className="break-words text-[0.8125rem] leading-5 text-token-muted">
          {onboardingMessages.helper}
        </p>

        {hasSaveError ? (
          <div className="rounded-xl border border-[#E8B7AF] bg-[#FFF4F1] px-4 py-3 text-[#8A3328]">
            <p className="break-words text-[0.8125rem] leading-5">
              {onboardingMessages.saveError}
            </p>
          </div>
        ) : null}

        <button
          className="primary-button min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSaving || !canContinue}
        >
          {isSaving ? onboardingMessages.saving : onboardingMessages.continue}
        </button>
      </form>
    </section>
  );
}
