"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLocale } from "@/components/LocaleProvider";
import { BackendRequestError } from "@/lib/backend-client";
import {
  formatDictionaryWordCount,
  type DictionaryListMessages,
} from "@/lib/i18n/messages";
import { fetchLearningPreferences, getPreferencesRequestMessage } from "@/lib/preferences";
import {
  invalidateCachedDictionaryListsForUser,
  invalidateCachedDictionaryReadDataForUser,
  readCachedDictionaryList,
  writeCachedDictionaryList,
} from "@/lib/vocab-cache";
import { fetchDictionaryList, getVocabRequestMessage, type DictionaryListItem } from "@/lib/vocab";

function LoadingCard({ messages }: { messages: DictionaryListMessages }) {
  return (
    <div className="w-full min-w-0 max-w-full rounded-xl border border-token-border bg-token-brandSoft/40 p-4">
      <p className="text-[0.9375rem] font-medium text-token-text">{messages.loading.cardTitle}</p>
      <p className="mt-1 text-[0.8125rem] leading-5 text-token-muted">{messages.loading.words}</p>
      <div className="mt-3 h-3 w-2/5 rounded-full bg-token-brandSoft" />
      <div className="mt-3 h-3 w-11/12 rounded-full bg-token-brandSoft" />
    </div>
  );
}

function ResultCard({
  item,
  messages,
}: {
  item: DictionaryListItem;
  messages: DictionaryListMessages;
}) {
  const badge = item.language ?? item.learningStatus;
  const previewText = item.translation ?? item.explanation ?? messages.card.openHelper;

  return (
    <Link className="block w-full min-w-0 max-w-full" href={`/dictionary/${item.id}`}>
      <article className="min-h-[5.375rem] w-full min-w-0 max-w-full rounded-xl border border-token-border bg-token-surfaceStrong px-4 py-3.5 transition hover:border-token-brand hover:bg-token-surface">
        <div className="flex w-full min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[0.9375rem] font-medium leading-6 text-token-text">
              {item.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-token-muted">
              {previewText}
            </p>
          </div>
          {badge ? (
            <span className="max-w-[40%] shrink-0 truncate rounded-full bg-token-brandSoft px-2.5 py-1 text-[0.6875rem] font-medium uppercase leading-none text-token-brand">
              {badge}
            </span>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

function StateCard({
  action,
  copy,
  tone = "neutral",
  title,
}: {
  action?: React.ReactNode;
  copy: string;
  tone?: "neutral" | "soft" | "danger";
  title: string;
}) {
  const toneClassName =
    tone === "danger"
      ? "border-[#E8B7AF] bg-[#FFF4F1] text-[#8A3328]"
      : tone === "soft"
        ? "border-token-border bg-token-brandSoft/40 text-token-muted"
        : "border-token-border bg-token-surfaceStrong text-token-muted";

  return (
    <div className={`w-full min-w-0 max-w-full rounded-xl border p-4 ${toneClassName}`}>
      <p className="text-[0.9375rem] font-medium text-token-text">{title}</p>
      <p className="mt-1 break-words text-[0.8125rem] leading-5">{copy}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function DictionaryListScreen() {
  const { isCurrentAuthenticatedSession, refreshBootstrap, session } = useAuth();
  const { locale, messages } = useLocale();
  const dictionaryMessages = messages.dictionaryList;
  const [items, setItems] = useState<DictionaryListItem[]>([]);
  const [preferredTranslationLanguage, setPreferredTranslationLanguage] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [listErrorMessage, setListErrorMessage] = useState<string | null>(null);
  const [preferencesErrorMessage, setPreferencesErrorMessage] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const currentUserId = session?.user?.id ?? null;
  const currentAccessToken = session?.access_token ?? null;
  const activeReadRef = useRef({
    accessToken: currentAccessToken,
    query: activeQuery,
    userId: currentUserId,
  });
  const authDenialGenerationRef = useRef(0);
  const [resultOwner, setResultOwner] = useState<{
    query: string;
    userId: string;
  } | null>(null);
  const [preferencesOwnerUserId, setPreferencesOwnerUserId] = useState<string | null>(null);

  activeReadRef.current = {
    accessToken: currentAccessToken,
    query: activeQuery,
    userId: currentUserId,
  };

  const isCurrentResult =
    resultOwner?.userId === currentUserId && resultOwner.query === activeQuery;
  const currentItems = isCurrentResult ? items : [];
  const currentHasLoadedOnce = isCurrentResult ? hasLoadedOnce : false;
  const currentListErrorMessage = isCurrentResult ? listErrorMessage : null;
  const currentPreferencesErrorMessage =
    preferencesOwnerUserId === currentUserId ? preferencesErrorMessage : null;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveQuery(searchText.trim());
    }, 260);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    if (!currentUserId) {
      setItems([]);
      setHasLoadedOnce(false);
      setResultOwner(null);
      return;
    }

    const cachedItems = readCachedDictionaryList({
      userId: currentUserId,
      searchText: activeQuery,
    });

    if (cachedItems) {
      setItems(cachedItems);
      setHasLoadedOnce(true);
      setResultOwner({ query: activeQuery, userId: currentUserId });
      return;
    }

    setItems([]);
    setHasLoadedOnce(false);
    setResultOwner({ query: activeQuery, userId: currentUserId });
  }, [activeQuery, currentUserId]);

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
      setHasLoadedPreferences(false);
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
          setItems([]);
          setHasLoadedOnce(false);
          setResultOwner({ query: activeQuery, userId: ownerUserId });
          invalidateCachedDictionaryReadDataForUser(ownerUserId);
          void refreshBootstrap();
          return;
        }

        setPreferencesErrorMessage(
          getPreferencesRequestMessage(error, dictionaryMessages.errors.preferences),
        );
      } finally {
        if (isCurrentRequest()) {
          setHasLoadedPreferences(true);
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
    const requestQuery = activeQuery;
    const authDenialGeneration = authDenialGenerationRef.current;
    const controller = new AbortController();
    const isCurrentRequest = () =>
      !controller.signal.aborted &&
      authDenialGenerationRef.current === authDenialGeneration &&
      isCurrentAuthenticatedSession(ownerUserId, accessToken) &&
      activeReadRef.current.accessToken === accessToken &&
      activeReadRef.current.query === requestQuery &&
      activeReadRef.current.userId === ownerUserId;

    async function loadDictionaryList() {
      if (!currentHasLoadedOnce) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setResultOwner({ query: requestQuery, userId: ownerUserId });
      setListErrorMessage(null);

      try {
        const nextItems = await fetchDictionaryList({
          accessToken,
          searchText: activeQuery,
          signal: controller.signal,
        });

        if (!isCurrentRequest()) {
          return;
        }

        setItems(nextItems);
        writeCachedDictionaryList({
          userId: ownerUserId,
          searchText: requestQuery,
          items: nextItems,
        });
        setHasLoadedOnce(true);
      } catch (error) {
        if (!isCurrentRequest()) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          authDenialGenerationRef.current += 1;
          setItems([]);
          setHasLoadedOnce(false);
          invalidateCachedDictionaryReadDataForUser(ownerUserId);
          void refreshBootstrap();
          return;
        }

        if (error instanceof BackendRequestError && error.status === 403) {
          invalidateCachedDictionaryListsForUser(ownerUserId);
        }

        setItems([]);
        setHasLoadedOnce(true);
        setListErrorMessage(
          getVocabRequestMessage(error, dictionaryMessages.errors.list),
        );
      } finally {
        if (isCurrentRequest()) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadDictionaryList();

    return () => controller.abort();
  }, [activeQuery, isCurrentAuthenticatedSession, refreshBootstrap, session?.access_token, session?.user.id]);

  const canShowTranslation =
    preferencesOwnerUserId === currentUserId &&
    hasLoadedPreferences &&
    Boolean(preferredTranslationLanguage);
  const visibleItems = currentItems.map((item) => ({
    ...item,
    translation: canShowTranslation ? item.translation : null,
  }));
  const errorMessage = currentPreferencesErrorMessage ?? currentListErrorMessage;
  const hasQuery = activeQuery.length > 0;
  const showInitialLoading =
    !currentHasLoadedOnce &&
    (!isCurrentResult || isLoadingPreferences || !hasLoadedPreferences || isLoading);
  const showEmptyState = !showInitialLoading && !errorMessage && visibleItems.length === 0;

  return (
    <section className="auth-appear grid w-full min-w-0 max-w-full gap-4">
      <div className="grid w-full min-w-0 max-w-full gap-4">
        <div className="w-full min-w-0 max-w-full rounded-xl border border-token-border bg-token-surfaceStrong">
          <div className="relative flex items-center">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-token-muted/65"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <circle cx="6" cy="6" r="4.5" />
              <path d="M10 10L12.5 12.5" strokeLinecap="round" />
            </svg>
            <input
              className="min-h-11 w-full min-w-0 bg-transparent py-2 pl-9 pr-16 text-sm text-token-text outline-none placeholder:text-token-muted/45"
              type="search"
              aria-label={dictionaryMessages.search.label}
              placeholder={dictionaryMessages.search.placeholder}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            {searchText ? (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-token-brand transition hover:brightness-95"
                type="button"
                onClick={() => setSearchText("")}
              >
                {dictionaryMessages.search.clear}
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 break-words text-xs text-token-muted/70">
            {showInitialLoading
              ? dictionaryMessages.loading.words
              : formatDictionaryWordCount(locale, visibleItems.length, dictionaryMessages.count)}
            {hasQuery
              ? `${dictionaryMessages.search.queryPrefix}${activeQuery}${dictionaryMessages.search.querySuffix}`
              : ""}
          </p>
          {isRefreshing ? (
            <p className="text-xs text-token-muted">{dictionaryMessages.loading.updating}</p>
          ) : null}
        </div>

        {!showInitialLoading && isLoadingPreferences ? (
          <StateCard
            tone="soft"
            title={dictionaryMessages.loading.preferenceTitle}
            copy={dictionaryMessages.loading.preferenceDescription}
          />
        ) : null}

        {showInitialLoading ? (
          <div className="grid w-full min-w-0 max-w-full gap-3 md:grid-cols-2 xl:grid-cols-3">
            <LoadingCard messages={dictionaryMessages} />
            <LoadingCard messages={dictionaryMessages} />
            <LoadingCard messages={dictionaryMessages} />
          </div>
        ) : null}

        {errorMessage ? (
          <StateCard
            tone="danger"
            title={dictionaryMessages.errors.title}
            copy={errorMessage}
          />
        ) : null}

        {showEmptyState ? (
          <StateCard
            title={
              hasQuery
                ? dictionaryMessages.empty.searchTitle
                : dictionaryMessages.empty.dictionaryTitle
            }
            copy={
              hasQuery
                ? dictionaryMessages.empty.searchDescription
                : dictionaryMessages.empty.dictionaryDescription
            }
            action={
              !hasQuery ? (
                <a
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-token-brand bg-transparent px-4 text-sm font-medium text-token-brand transition hover:bg-token-brandSoft"
                  href="https://web.telegram.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {dictionaryMessages.empty.openTelegram}
                </a>
              ) : null
            }
          />
        ) : null}

        {!showInitialLoading && !errorMessage && visibleItems.length > 0 ? (
          <div className="grid w-full min-w-0 max-w-full gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <ResultCard key={item.id} item={item} messages={dictionaryMessages} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
