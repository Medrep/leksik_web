"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BackendRequestError } from "@/lib/backend-client";
import { fetchLearningPreferences, getPreferencesRequestMessage } from "@/lib/preferences";
import {
  invalidateCachedDictionaryItem,
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

function LoadingBlock() {
  return (
    <div className="rounded-xl border border-token-border bg-token-brandSoft/40 p-4">
      <p className="text-[0.9375rem] font-medium text-token-text">Card loading</p>
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
    <section className={className}>
      <h3 className="text-[0.6875rem] uppercase tracking-[0.16em] text-token-muted/65">{label}</h3>
      <div className="mt-2 text-[0.9375rem] leading-7 text-token-text">{children}</div>
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
    <article className={`rounded-xl border p-4 ${toneClassName}`}>
      <p className="text-[0.9375rem] font-medium text-token-text">{title}</p>
      <p className="mt-1 text-[0.8125rem] leading-5">{copy}</p>
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
  const { refreshBootstrap, session } = useAuth();
  const [details, setDetails] = useState<DictionaryCardDetails | null>(null);
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

  useEffect(() => {
    if (!currentUserId) {
      setDetails(null);
      return;
    }

    const cachedDetails = readCachedDictionaryCardDetails({
      userId: currentUserId,
      itemId: item_id,
    });

    setDetails(cachedDetails);
  }, [currentUserId, item_id]);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const accessToken = session.access_token;
    const controller = new AbortController();

    async function loadPreferences() {
      setIsLoadingPreferences(true);
      setPreferencesErrorMessage(null);

      try {
        const preferences = await fetchLearningPreferences({
          accessToken,
          signal: controller.signal,
        });

        setPreferredTranslationLanguage(preferences.preferredTranslationLanguage);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          void refreshBootstrap();
          return;
        }

        setPreferencesErrorMessage(
          getPreferencesRequestMessage(error, "The dictionary preferences could not be loaded from the backend."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPreferences(false);
        }
      }
    }

    void loadPreferences();

    return () => controller.abort();
  }, [refreshBootstrap, session?.access_token]);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const accessToken = session.access_token;
    const hasCachedDetails = currentUserId
      ? readCachedDictionaryCardDetails({
          userId: currentUserId,
          itemId: item_id,
        }) !== null
      : false;
    const controller = new AbortController();

    async function loadCardDetails() {
      setIsLoadingDetails(true);
      setDetailsErrorMessage(null);
      setDeleteErrorMessage(null);
      setIsDeleteConfirming(false);
      setIsNotFound(false);

      try {
        const nextDetails = await fetchDictionaryCardDetails({
          accessToken,
          item_id,
          signal: controller.signal,
        });

        if (!nextDetails) {
          setDetails(null);
          setIsNotFound(true);
          return;
        }

        setDetails(nextDetails);
        if (currentUserId) {
          writeCachedDictionaryCardDetails({
            userId: currentUserId,
            itemId: item_id,
            details: nextDetails,
          });
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          void refreshBootstrap();
          return;
        }

        if (error instanceof BackendRequestError && (error.status === 403 || error.status === 404)) {
          if (currentUserId) {
            invalidateCachedDictionaryItem({
              userId: currentUserId,
              itemId: item_id,
            });
          }
          setDetails(null);
          setIsNotFound(true);
          return;
        }

        if (!hasCachedDetails) {
          setDetails(null);
          setDetailsErrorMessage(
            getVocabRequestMessage(error, "The card details could not be loaded from the backend."),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDetails(false);
        }
      }
    }

    void loadCardDetails();

    return () => controller.abort();
  }, [currentUserId, item_id, refreshBootstrap, session?.access_token]);

  const canShowTranslation =
    !preferencesErrorMessage &&
    !isLoadingPreferences &&
    Boolean(preferredTranslationLanguage) &&
    Boolean(details?.translation);
  const isLoading = !details && !isNotFound && !detailsErrorMessage && isLoadingDetails;
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
    if (!session?.access_token) {
      return;
    }

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      await deleteDictionaryItem({
        accessToken: session.access_token,
        item_id,
      });

      if (currentUserId) {
        invalidateCachedDictionaryReadDataForUser(currentUserId);
      }
      setDetails(null);
      setIsDeleteConfirming(false);
      router.replace("/dictionary");
      router.refresh();
    } catch (error) {
      if (error instanceof BackendRequestError && error.status === 401) {
        void refreshBootstrap();
        return;
      }

      if (error instanceof BackendRequestError && (error.status === 403 || error.status === 404)) {
        if (currentUserId) {
          invalidateCachedDictionaryItem({
            userId: currentUserId,
            itemId: item_id,
          });
        }
        setDetails(null);
        setIsNotFound(true);
        return;
      }

      setDeleteErrorMessage(getVocabRequestMessage(error, "The word could not be deleted from the backend."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="auth-appear mx-auto grid w-full max-w-[44rem] gap-6">
      <div className="flex items-center justify-between gap-3 border-b border-token-border pb-4">
        <Link className="inline-flex items-center gap-2 text-[0.8125rem] text-token-muted transition hover:text-token-brand" href="/dictionary">
          <span aria-hidden="true">←</span>
          Dictionary
        </Link>
        {translationModeLabel ? (
          <span className="rounded-full bg-token-brandSoft px-2.5 py-1 text-[0.6875rem] font-medium uppercase leading-none text-token-brand">
            {translationModeLabel}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <article className="grid gap-3">
          <LoadingBlock />
          <LoadingBlock />
          <LoadingBlock />
        </article>
      ) : null}

      {!isLoading && isNotFound ? (
        <StatePanel title="Word unavailable" copy="This word may be missing or unavailable to the current account." />
      ) : null}

      {!isLoading && detailsErrorMessage ? (
        <StatePanel tone="danger" title="Could not load this word" copy={detailsErrorMessage} />
      ) : null}

      {!isLoading && !isNotFound && !detailsErrorMessage && details ? (
        <article className="grid gap-6">
          <div>
            <h1 className="font-serifDisplay text-[3rem] font-normal leading-none text-token-text sm:text-[4rem]">
              {details.title}
            </h1>
            {metadataParts.length > 0 ? (
              <p className="mt-2 text-[0.8125rem] leading-5 text-token-muted">
                {metadataParts.join(" · ")}
              </p>
            ) : null}
            {details.canonicalForm ? (
              <p className="mt-1 text-[0.6875rem] leading-5 text-token-muted/55">
                Canonical: {details.canonicalForm}
              </p>
            ) : null}
            {preferencesErrorMessage ? (
              <p className="mt-3 max-w-md text-xs leading-5 text-token-muted/70">
                Translation preference could not be loaded, so this card is shown without translation.
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 border-t border-token-border pt-5">
            {canShowTranslation ? (
              <DetailSection label="Translation">
                <p className="text-token-text">{details.translation}</p>
              </DetailSection>
            ) : null}

            <DetailSection label="Explanation">
              <p className="text-token-muted">{details.explanation ?? "Not available for this item."}</p>
            </DetailSection>

            {details.examples.length > 0 ? (
              <DetailSection label="Examples">
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

            <DetailSection label="Delete" className="border-t border-token-border pt-4">
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
                    Delete from dictionary
                  </button>
                ) : (
                  <div className="rounded-xl border border-[#E8B7AF] bg-[#FFF4F1] p-4 text-[#8A3328]">
                    <p className="text-[0.8125rem] font-medium">Delete this word from your dictionary?</p>
                    <p className="mt-1 text-xs leading-5">
                      This removes it from normal dictionary browsing.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-token-brand px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={() => void handleDelete()}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting…" : "Confirm delete"}
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
                        Cancel
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
