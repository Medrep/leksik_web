"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BackendRequestError } from "@/lib/backend-client";
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

  return (
    <Link href={`/dictionary/${item.id}`}>
      <article className="rounded-[1.1rem] border border-token-border bg-token-surfaceStrong p-4 transition hover:border-token-brand hover:bg-token-surface">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[1.65rem] font-medium leading-tight tracking-[-0.03em] text-token-text">
              {item.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-token-muted">
              {item.summary ?? "Open to view this saved word."}
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
  const [searchText, setSearchText] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveQuery(searchText.trim());
    }, 260);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const accessToken = session.access_token;
    const controller = new AbortController();

    async function loadDictionaryList() {
      if (!hasLoadedOnce) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setErrorMessage(null);

      try {
        const nextItems = await fetchDictionaryList({
          accessToken,
          searchText: activeQuery,
          signal: controller.signal,
        });

        setItems(nextItems);
        setHasLoadedOnce(true);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          void refreshBootstrap();
          return;
        }

        setItems([]);
        setHasLoadedOnce(true);
        setErrorMessage(getVocabRequestMessage(error, "The dictionary list could not be loaded from the backend."));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadDictionaryList();

    return () => controller.abort();
  }, [activeQuery, refreshBootstrap, session?.access_token]);

  const hasQuery = activeQuery.length > 0;
  const showInitialLoading = isLoading && !hasLoadedOnce;
  const showEmptyState = !showInitialLoading && !errorMessage && items.length === 0;

  return (
    <section className="grid gap-5">
      <section className="auth-appear grid gap-4">
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

        <p className="text-sm text-[#a9a39a]">
          {showInitialLoading ? "Loading words..." : `${items.length} word${items.length === 1 ? "" : "s"}`}
          {hasQuery ? ` for “${activeQuery}”` : ""}
        </p>

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
              {hasQuery ? "Try a different word or phrase." : "Your saved vocabulary will appear here."}
            </p>
          </div>
        ) : null}

        {!showInitialLoading && !errorMessage && items.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
