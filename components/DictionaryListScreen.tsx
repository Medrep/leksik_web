"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { TelegramLinkPanel } from "@/components/TelegramLinkPanel";
import { BackendRequestError } from "@/lib/backend-client";
import { fetchLearningPreferences, getPreferencesRequestMessage } from "@/lib/preferences";
import { readCachedDictionaryList, writeCachedDictionaryList } from "@/lib/vocab-cache";
import { fetchDictionaryList, getVocabRequestMessage, type DictionaryListItem } from "@/lib/vocab";

function LoadingCard() {
  return (
    <div className="rounded-[1.1rem] border border-token-border bg-token-surfaceStrong p-4">
      <div className="h-6 w-2/5 rounded-full bg-token-brandSoft" />
      <div className="mt-3 h-4 w-4/5 rounded-full bg-token-brandSoft" />
      <div className="mt-3 h-6 w-20 rounded-full bg-token-brandSoft" />
    </div>
  );
}

function ResultCard({ item }: { item: DictionaryListItem }) {
  const badge = item.language ?? item.learningStatus;
  const previewText = item.translation ?? item.explanation ?? "Open to view this saved word.";

  return (
    <Link href={`/dictionary/${item.id}`}>
      <article className="rounded-[1.1rem] border border-token-border bg-token-surfaceStrong p-4 transition hover:border-token-brand hover:bg-token-surface">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[1.65rem] font-medium leading-tight tracking-[-0.03em] text-token-text">
              {item.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-token-muted">
              {previewText}
            </p>
          </div>
          {badge ? <span className="pill">{badge}</span> : null}
        </div>
      </article>
    </Link>
  );
}

export function DictionaryListScreen() {
  const { refreshBootstrap, session } = useAuth();
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
      return;
    }

    const cachedItems = readCachedDictionaryList({
      userId: currentUserId,
      searchText: activeQuery,
    });

    if (cachedItems) {
      setItems(cachedItems);
      setHasLoadedOnce(true);
      return;
    }

    setItems([]);
    setHasLoadedOnce(false);
  }, [activeQuery, currentUserId]);

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
          setHasLoadedPreferences(true);
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
    const hasCachedList = currentUserId
      ? readCachedDictionaryList({
          userId: currentUserId,
          searchText: activeQuery,
        }) !== null
      : false;
    const controller = new AbortController();

    async function loadDictionaryList() {
      if (!hasLoadedOnce) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setListErrorMessage(null);

      try {
        const nextItems = await fetchDictionaryList({
          accessToken,
          searchText: activeQuery,
          signal: controller.signal,
        });

        setItems(nextItems);
        if (currentUserId) {
          writeCachedDictionaryList({
            userId: currentUserId,
            searchText: activeQuery,
            items: nextItems,
          });
        }
        setHasLoadedOnce(true);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          void refreshBootstrap();
          return;
        }

        if (!hasCachedList) {
          setItems([]);
          setHasLoadedOnce(true);
          setListErrorMessage(
            getVocabRequestMessage(error, "The dictionary list could not be loaded from the backend."),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadDictionaryList();

    return () => controller.abort();
  }, [activeQuery, currentUserId, refreshBootstrap, session?.access_token]);

  const canShowTranslation = hasLoadedPreferences && Boolean(preferredTranslationLanguage);
  const visibleItems = items.map((item) => ({
    ...item,
    translation: canShowTranslation ? item.translation : null,
  }));
  const errorMessage = preferencesErrorMessage ?? listErrorMessage;
  const hasQuery = activeQuery.length > 0;
  const showInitialLoading = !hasLoadedOnce && (isLoadingPreferences || !hasLoadedPreferences || isLoading);
  const showEmptyState = !showInitialLoading && !errorMessage && visibleItems.length === 0;

  return (
    <section className="grid gap-5">
      <section className="auth-appear grid gap-4">
        <TelegramLinkPanel />

        <div className="shell-panel rounded-[1.2rem] p-3">
          <div className="flex items-center gap-3">
            <svg
              aria-hidden="true"
              className="ml-2 h-4 w-4 shrink-0 text-token-muted"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="9" r="5.5" />
              <path d="M13.5 13.5L18 18" />
            </svg>
            <input
              className="w-full bg-transparent py-2 pr-2 text-base text-token-text outline-none placeholder:text-[#b3aea5]"
              type="search"
              placeholder="Search words..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            {searchText ? (
              <button
                className="mr-2 text-sm text-token-muted transition hover:text-token-brand"
                type="button"
                onClick={() => setSearchText("")}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#a9a39a]">
            {showInitialLoading
              ? "Loading words..."
              : `${visibleItems.length} word${visibleItems.length === 1 ? "" : "s"}`}
            {hasQuery ? ` for “${activeQuery}”` : ""}
          </p>
          <Link className="text-sm text-token-muted transition hover:text-token-brand" href="/settings">
            Settings
          </Link>
        </div>

        {isRefreshing ? <p className="text-sm text-token-muted">Updating results…</p> : null}

        {showInitialLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[1.2rem] border border-red-300/60 bg-red-50/80 p-5 dark:border-red-400/30 dark:bg-red-950/30">
            <p className="text-lg font-semibold text-red-800 dark:text-red-200">Couldn&apos;t load your dictionary.</p>
            <p className="mt-2 text-sm leading-6 text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        ) : null}

        {showEmptyState ? (
          <div className="rounded-[1.2rem] border border-token-border bg-token-surfaceStrong p-5">
            <p className="text-lg font-semibold text-token-text">
              {hasQuery ? "No words matched that search." : "No saved words yet."}
            </p>
            <p className="mt-2 text-sm leading-6 text-token-muted">
              {hasQuery
                ? "Try a different word or phrase."
                : "Use Telegram to send your first word or phrase. It will appear here after the backend saves it."}
            </p>
            {!hasQuery ? (
              <div className="mt-4">
                <a
                  className="secondary-button"
                  href="https://web.telegram.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Telegram
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        {!showInitialLoading && !errorMessage && visibleItems.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
