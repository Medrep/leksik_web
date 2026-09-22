"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLocale } from "@/components/LocaleProvider";
import { BackendRequestError } from "@/lib/backend-client";
import type { DictionaryDetailsMessages } from "@/lib/i18n/messages";
import { fetchLearningPreferences, getPreferencesRequestMessage } from "@/lib/preferences";
import {
  invalidateCachedDictionaryItem,
  invalidateCachedDictionaryListsForUser,
  invalidateCachedDictionaryReadDataForUser,
  readCachedDictionaryCardDetails,
  writeCachedDictionaryCardDetails,
} from "@/lib/vocab-cache";
import {
  deleteDictionaryItem,
  fetchDictionaryCardDetails,
  getVocabRequestMessage,
  type DictionaryCardDetails,
} from "@/lib/vocab";

type CardDetailsScreenProps = {
  item_id: string;
};

function LoadingBlock({ messages }: { messages: DictionaryDetailsMessages }) {
  return (
    <div className="w-full min-w-0 max-w-full rounded-xl border border-token-border bg-token-brandSoft/40 p-4">
      <p className="text-[0.9375rem] font-medium text-token-text">{messages.loading.cardTitle}</p>
      <div className="mt-3 h-3 w-1/3 rounded-full bg-token-brandSoft" />
      <div className="mt-3 h-3 w-11/12 rounded-full bg-token-brandSoft" />
      <div className="mt-3 h-3 w-2/3 rounded-full bg-token-brandSoft" />
    </div>
  );
}

function DetailSection({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`w-full min-w-0 max-w-full ${className}`}>
      <h3 className="text-[0.6875rem] uppercase tracking-[0.16em] text-token-muted/65">{label}</h3>
      <div className="mt-2 w-full min-w-0 max-w-full break-words text-[0.9375rem] leading-7 text-token-text">{children}</div>
    </section>
  );
}

function StatePanel({
  copy,
  tone = "neutral",
  title,
}: {
  copy: string;
  tone?: "neutral" | "danger";
  title: string;
}) {
  const toneClassName =
    tone === "danger"
      ? "border-[#E8B7AF] bg-[#FFF4F1] text-[#8A3328]"
      : "border-token-border bg-token-surfaceStrong text-token-muted";

  return (
    <article className={`min-w-0 max-w-full rounded-xl border p-4 ${toneClassName}`}>
      <p className="text-[0.9375rem] font-medium text-token-text">{title}</p>
      <p className="mt-1 break-words text-[0.8125rem] leading-5">{copy}</p>
    </article>
  );
}

function formatCompactLanguage(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length <= 3 ? trimmedValue.toUpperCase() : trimmedValue;
}

function getTranslationModeLabel({
  preferredTranslationLanguage,
  sourceLanguage,
}: {
  preferredTranslationLanguage: string | null;
  sourceLanguage: string | null;
}) {
  if (sourceLanguage && preferredTranslationLanguage) {
    const source = formatCompactLanguage(sourceLanguage);
    const target = formatCompactLanguage(preferredTranslationLanguage);

    if (source.toLowerCase() !== target.toLowerCase()) {
      return `${source} → ${target}`;
    }
  }

  if (sourceLanguage) {
    return formatCompactLanguage(sourceLanguage);
  }

  if (preferredTranslationLanguage) {
    return formatCompactLanguage(preferredTranslationLanguage);
  }

  return null;
}

export function CardDetailsScreen({ item_id }: CardDetailsScreenProps) {
  const router = useRouter();
  const { isCurrentAuthenticatedSession, refreshBootstrap, session } = useAuth();
  const { messages } = useLocale();
  const dictionaryMessages = messages.dictionaryDetails;
  const [storedDetails, setStoredDetails] = useState<DictionaryCardDetails | null>(null);
  const [detailsErrorMessage, setDetailsErrorMessage] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [preferencesErrorMessage, setPreferencesErrorMessage] = useState<string | null>(null);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [preferredTranslationLanguage, setPreferredTranslationLanguage] = useState<string | null>(null);
  const currentUserId = session?.user?.id ?? null;
  const currentAccessToken = session?.access_token ?? null;
  const activeReadRef = useRef({
    accessToken: currentAccessToken,
    itemId: item_id,
    userId: currentUserId,
  });
  const authDenialGenerationRef = useRef(0);
  const [resultOwner, setResultOwner] = useState<{
    itemId: string;
    userId: string;
  } | null>(null);
  const [preferencesOwnerUserId, setPreferencesOwnerUserId] = useState<string | null>(null);

  activeReadRef.current = {
    accessToken: currentAccessToken,
    itemId: item_id,
    userId: currentUserId,
  };

  const isCurrentResult =
    resultOwner?.userId === currentUserId && resultOwner.itemId === item_id;
  const details = isCurrentResult ? storedDetails : null;
  const currentDetailsErrorMessage = isCurrentResult ? detailsErrorMessage : null;
  const currentIsNotFound = isCurrentResult && isNotFound;
  const currentPreferencesErrorMessage =
    preferencesOwnerUserId === currentUserId ? preferencesErrorMessage : null;

  useEffect(() => {
    if (!currentUserId) {
      setStoredDetails(null);
      setResultOwner(null);
      return;
    }

    const cachedDetails = readCachedDictionaryCardDetails({
      userId: currentUserId,
      itemId: item_id,
    });

    setStoredDetails(cachedDetails);
    setResultOwner({ itemId: item_id, userId: currentUserId });
  }, [currentUserId, item_id]);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const accessToken = session.access_token;
    const ownerUserId = session.user.id;
    const authDenialGeneration = authDenialGenerationRef.current;
    const controller = new AbortController();
    const isCurrentRequest = () =>
      !controller.signal.aborted &&
      authDenialGenerationRef.current === authDenialGeneration &&
      isCurrentAuthenticatedSession(ownerUserId, accessToken) &&
      activeReadRef.current.accessToken === accessToken &&
      activeReadRef.current.userId === ownerUserId;

    async function loadPreferences() {
      setIsLoadingPreferences(true);
      setPreferredTranslationLanguage(null);
      setPreferencesOwnerUserId(ownerUserId);
      setPreferencesErrorMessage(null);

      try {
        const preferences = await fetchLearningPreferences({
          accessToken,
          signal: controller.signal,
        });

        if (!isCurrentRequest()) {
          return;
        }

        setPreferredTranslationLanguage(preferences.preferredTranslationLanguage);
      } catch (error) {
        if (!isCurrentRequest()) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          authDenialGenerationRef.current += 1;
          setStoredDetails(null);
          invalidateCachedDictionaryReadDataForUser(ownerUserId);
          void refreshBootstrap();
          return;
        }

        setPreferencesErrorMessage(
          getPreferencesRequestMessage(error, dictionaryMessages.errors.preferences),
        );
      } finally {
        if (isCurrentRequest()) {
          setIsLoadingPreferences(false);
        }
      }
    }

    void loadPreferences();

    return () => controller.abort();
  }, [isCurrentAuthenticatedSession, refreshBootstrap, session?.access_token]);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const accessToken = session.access_token;
    const ownerUserId = session.user.id;
    const requestItemId = item_id;
    const authDenialGeneration = authDenialGenerationRef.current;
    const controller = new AbortController();
    const isCurrentRequest = () =>
      !controller.signal.aborted &&
      authDenialGenerationRef.current === authDenialGeneration &&
      isCurrentAuthenticatedSession(ownerUserId, accessToken) &&
      activeReadRef.current.accessToken === accessToken &&
      activeReadRef.current.itemId === requestItemId &&
      activeReadRef.current.userId === ownerUserId;

    async function loadCardDetails() {
      setIsLoadingDetails(true);
      setResultOwner({ itemId: requestItemId, userId: ownerUserId });
      setDetailsErrorMessage(null);
      setDeleteErrorMessage(null);
      setIsDeleteConfirming(false);
      setIsNotFound(false);

      try {
        const nextDetails = await fetchDictionaryCardDetails({
          accessToken,
          item_id: requestItemId,
          signal: controller.signal,
        });

        if (!isCurrentRequest()) {
          return;
        }

        if (!nextDetails) {
          invalidateCachedDictionaryItem({
            userId: ownerUserId,
            itemId: requestItemId,
          });
          invalidateCachedDictionaryListsForUser(ownerUserId);
          setStoredDetails(null);
          setIsNotFound(true);
          return;
        }

        setStoredDetails(nextDetails);
        writeCachedDictionaryCardDetails({
          userId: ownerUserId,
          itemId: requestItemId,
          details: nextDetails,
        });
      } catch (error) {
        if (!isCurrentRequest()) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          authDenialGenerationRef.current += 1;
          setStoredDetails(null);
          invalidateCachedDictionaryReadDataForUser(ownerUserId);
          void refreshBootstrap();
          return;
        }

        if (error instanceof BackendRequestError && (error.status === 403 || error.status === 404)) {
          invalidateCachedDictionaryItem({
            userId: ownerUserId,
            itemId: requestItemId,
          });
          if (error.status === 404) {
            invalidateCachedDictionaryListsForUser(ownerUserId);
          }
          setStoredDetails(null);
          setIsNotFound(true);
          return;
        }

        setStoredDetails(null);
        setDetailsErrorMessage(
          getVocabRequestMessage(error, dictionaryMessages.errors.details),
        );
      } finally {
        if (isCurrentRequest()) {
          setIsLoadingDetails(false);
        }
      }
    }

    void loadCardDetails();

    return () => controller.abort();
  }, [currentUserId, isCurrentAuthenticatedSession, item_id, refreshBootstrap, session?.access_token]);

  const canShowTranslation =
    preferencesOwnerUserId === currentUserId &&
    !currentPreferencesErrorMessage &&
    !isLoadingPreferences &&
    Boolean(preferredTranslationLanguage) &&
    Boolean(details?.translation);
  const isLoading =
    !isCurrentResult ||
    (!details && !currentIsNotFound && !currentDetailsErrorMessage && isLoadingDetails);
  const translationModeLabel = details
    ? getTranslationModeLabel({
        preferredTranslationLanguage,
        sourceLanguage: details.language,
      })
    : null;
  const metadataParts = details
    ? [
        details.canonicalForm &&
        details.canonicalForm.toLowerCase() !== details.title.toLowerCase()
          ? details.canonicalForm
          : null,
        details.language,
        details.learningStatus,
      ].filter((item): item is string => Boolean(item))
    : [];

  async function handleDelete() {
    if (!session?.access_token || !currentUserId) {
      return;
    }

    const accessToken = session.access_token;
    const ownerUserId = currentUserId;
    const requestItemId = item_id;
    const authDenialGeneration = authDenialGenerationRef.current;
    const isCurrentRequest = () =>
      authDenialGenerationRef.current === authDenialGeneration &&
      isCurrentAuthenticatedSession(ownerUserId, accessToken) &&
      activeReadRef.current.accessToken === accessToken &&
      activeReadRef.current.itemId === requestItemId &&
      activeReadRef.current.userId === ownerUserId;

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      await deleteDictionaryItem({
        accessToken,
        item_id: requestItemId,
      });

      invalidateCachedDictionaryItem({
        userId: ownerUserId,
        itemId: requestItemId,
      });
      invalidateCachedDictionaryListsForUser(ownerUserId);

      if (!isCurrentRequest()) {
        return;
      }

      setStoredDetails(null);
      setIsDeleteConfirming(false);
      router.replace("/dictionary");
      router.refresh();
    } catch (error) {
      if (!isCurrentRequest()) {
        return;
      }

      if (error instanceof BackendRequestError && error.status === 401) {
        authDenialGenerationRef.current += 1;
        setStoredDetails(null);
        invalidateCachedDictionaryReadDataForUser(ownerUserId);
        void refreshBootstrap();
        return;
      }

      if (error instanceof BackendRequestError && (error.status === 403 || error.status === 404)) {
        invalidateCachedDictionaryItem({
          userId: ownerUserId,
          itemId: requestItemId,
        });
        if (error.status === 404) {
          invalidateCachedDictionaryListsForUser(ownerUserId);
        }
        setStoredDetails(null);
        setIsNotFound(true);
        return;
      }

      setDeleteErrorMessage(getVocabRequestMessage(error, dictionaryMessages.errors.delete));
    } finally {
      if (isCurrentRequest()) {
        setIsDeleting(false);
      }
    }
  }

  return (
    <section className="auth-appear mx-auto grid w-full min-w-0 max-w-full gap-6 sm:max-w-[44rem]">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-token-border pb-4">
        <Link
          aria-label={dictionaryMessages.navigation.dictionary}
          className="inline-flex items-center gap-2 text-[0.8125rem] text-token-muted transition hover:text-token-brand"
          href="/dictionary"
        >
          <span aria-hidden="true">←</span>
          {dictionaryMessages.navigation.dictionary}
        </Link>
        {translationModeLabel ? (
          <span className="rounded-full bg-token-brandSoft px-2.5 py-1 text-[0.6875rem] font-medium uppercase leading-none text-token-brand">
            {translationModeLabel}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <article className="grid w-full min-w-0 max-w-full gap-3">
          <LoadingBlock messages={dictionaryMessages} />
          <LoadingBlock messages={dictionaryMessages} />
          <LoadingBlock messages={dictionaryMessages} />
        </article>
      ) : null}

      {!isLoading && currentIsNotFound ? (
        <StatePanel
          title={dictionaryMessages.states.unavailableTitle}
          copy={dictionaryMessages.states.unavailableDescription}
        />
      ) : null}

      {!isLoading && currentDetailsErrorMessage ? (
        <StatePanel
          tone="danger"
          title={dictionaryMessages.states.loadErrorTitle}
          copy={currentDetailsErrorMessage}
        />
      ) : null}

      {!isLoading && !currentIsNotFound && !currentDetailsErrorMessage && details ? (
        <article className="grid w-full min-w-0 max-w-full gap-6">
          <div className="w-full min-w-0 max-w-full">
            <h1 className="break-words font-serifDisplay text-[3rem] font-normal leading-none text-token-text sm:text-[4rem]">
              {details.title}
            </h1>
            {metadataParts.length > 0 ? (
              <p className="mt-2 break-words text-[0.8125rem] leading-5 text-token-muted">
                {metadataParts.join(" · ")}
              </p>
            ) : null}
            {details.canonicalForm ? (
              <p className="mt-1 break-words text-[0.6875rem] leading-5 text-token-muted/55">
                {dictionaryMessages.metadata.canonical}: {details.canonicalForm}
              </p>
            ) : null}
            {currentPreferencesErrorMessage ? (
              <p className="mt-3 max-w-md break-words text-xs leading-5 text-token-muted/70">
                {dictionaryMessages.preference.unavailable}
              </p>
            ) : null}
          </div>

          <div className="grid w-full min-w-0 max-w-full gap-5 border-t border-token-border pt-5">
            {canShowTranslation ? (
              <DetailSection label={dictionaryMessages.sections.translation}>
                <p className="text-token-text">{details.translation}</p>
              </DetailSection>
            ) : null}

            <DetailSection label={dictionaryMessages.sections.explanation}>
              <p className="text-token-muted">
                {details.explanation ?? dictionaryMessages.missingContent}
              </p>
            </DetailSection>

            {details.examples.length > 0 ? (
              <DetailSection label={dictionaryMessages.sections.examples}>
                <div className="rounded-lg border border-token-border bg-transparent px-3">
                  {details.examples.map((example, index) => (
                    <p
                      className="border-t border-token-border py-2.5 font-serifDisplay text-[0.9375rem] font-normal italic leading-7 text-token-muted first:border-t-0"
                      key={`${details.id}-example-${index}`}
                    >
                      “{example}”
                    </p>
                  ))}
                </div>
              </DetailSection>
            ) : null}

            <DetailSection
              label={dictionaryMessages.sections.delete}
              className="border-t border-token-border pt-4"
            >
              <div className="grid gap-3">
                {!isDeleteConfirming ? (
                  <button
                    className="inline-flex min-h-10 w-fit items-center justify-center rounded-lg px-0 text-sm font-medium text-token-brand transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={() => {
                      setDeleteErrorMessage(null);
                      setIsDeleteConfirming(true);
                    }}
                    disabled={isDeleting}
                  >
                    {dictionaryMessages.delete.action}
                  </button>
                ) : (
                  <div className="rounded-xl border border-[#E8B7AF] bg-[#FFF4F1] p-4 text-[#8A3328]">
                    <p className="text-[0.8125rem] font-medium">
                      {dictionaryMessages.delete.confirmationTitle}
                    </p>
                    <p className="mt-1 text-xs leading-5">
                      {dictionaryMessages.delete.confirmationDescription}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-token-brand px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={() => void handleDelete()}
                        disabled={isDeleting}
                      >
                        {isDeleting
                          ? dictionaryMessages.delete.loading
                          : dictionaryMessages.delete.confirm}
                      </button>
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-token-brand bg-token-surfaceStrong px-4 text-sm font-medium text-token-brand transition hover:bg-token-brandSoft disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={() => {
                          setDeleteErrorMessage(null);
                          setIsDeleteConfirming(false);
                        }}
                        disabled={isDeleting}
                      >
                        {dictionaryMessages.delete.cancel}
                      </button>
                    </div>
                    {deleteErrorMessage ? (
                      <p className="mt-3 text-xs leading-5">{deleteErrorMessage}</p>
                    ) : null}
                  </div>
                )}
                {!isDeleteConfirming && deleteErrorMessage ? (
                  <p className="text-xs leading-5 text-[#8A3328]">{deleteErrorMessage}</p>
                ) : null}
              </div>
            </DetailSection>
          </div>
        </article>
      ) : null}
    </section>
  );
}
