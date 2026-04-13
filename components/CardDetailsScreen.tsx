"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BackendRequestError } from "@/lib/backend-client";
import {
  fetchDictionaryCardDetails,
  getVocabRequestMessage,
  type DictionaryCardDetails,
} from "@/lib/vocab";

type CardDetailsScreenProps = {
  item_id: string;
};

function LoadingBlock() {
  return (
    <div className="rounded-[1rem] bg-token-brandSoft p-5">
      <div className="h-4 w-28 rounded-full bg-token-brandSoft" />
      <div className="mt-3 h-8 w-4/5 rounded-full bg-token-brandSoft" />
      <div className="mt-4 h-4 w-full rounded-full bg-token-brandSoft" />
      <div className="mt-2 h-4 w-3/4 rounded-full bg-token-brandSoft" />
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
      <h3 className="text-xs uppercase tracking-[0.16em] text-[#b0aaa1]">{label}</h3>
      <div className="mt-2 text-[1.02rem] leading-8 text-token-text">{children}</div>
    </section>
  );
}

export function CardDetailsScreen({ item_id }: CardDetailsScreenProps) {
  const { refreshBootstrap, session } = useAuth();
  const [details, setDetails] = useState<DictionaryCardDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const accessToken = session.access_token;
    const controller = new AbortController();

    async function loadCardDetails() {
      setIsLoading(true);
      setErrorMessage(null);
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
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof BackendRequestError && error.status === 401) {
          void refreshBootstrap();
          return;
        }

        if (error instanceof BackendRequestError && (error.status === 403 || error.status === 404)) {
          setDetails(null);
          setIsNotFound(true);
          return;
        }

        setDetails(null);
        setErrorMessage(getVocabRequestMessage(error, "The card details could not be loaded from the backend."));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCardDetails();

    return () => controller.abort();
  }, [item_id, refreshBootstrap, session?.access_token]);

  return (
    <section className="auth-appear grid gap-6">
      <div className="flex items-center justify-between gap-3 border-b border-token-border pb-4">
        <Link className="inline-flex items-center gap-2 text-sm text-token-muted transition hover:text-token-brand" href="/dictionary">
          <span aria-hidden="true">←</span>
          Dictionary
        </Link>
        {details?.language ? <span className="pill">{details.language}</span> : null}
      </div>

      {isLoading ? (
        <article className="grid gap-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-start">
            <LoadingBlock />
            <LoadingBlock />
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <LoadingBlock />
            <LoadingBlock />
          </div>
        </article>
      ) : null}

      {!isLoading && isNotFound ? (
        <article className="rounded-[1.2rem] border border-token-border bg-token-surfaceStrong p-6">
          <p className="text-lg font-semibold text-token-text">This word couldn&apos;t be opened.</p>
          <p className="mt-2 text-sm leading-6 text-token-muted">
            It may be missing or unavailable to the current account.
          </p>
        </article>
      ) : null}

      {!isLoading && errorMessage ? (
        <article className="rounded-[1.2rem] border border-red-300/60 bg-red-50/80 p-6 dark:border-red-400/30 dark:bg-red-950/30">
          <p className="text-lg font-semibold text-red-800 dark:text-red-200">Couldn&apos;t load this word.</p>
          <p className="mt-2 text-sm leading-6 text-red-800 dark:text-red-200">{errorMessage}</p>
        </article>
      ) : null}

      {!isLoading && !isNotFound && !errorMessage && details ? (
        <article className="grid gap-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-start">
            <div>
              <h1 className="font-serifDisplay text-[3.4rem] leading-[0.96] tracking-[-0.04em] text-token-text sm:text-[4.6rem]">
                {details.title}
              </h1>
              {(details.canonicalForm || details.learningStatus) ? (
                <p className="mt-3 text-lg text-token-muted">
                  {[details.canonicalForm, details.learningStatus].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>

            {details.examples.length > 0 ? (
              <DetailSection label="Example" className="lg:pt-4">
                <blockquote className="border-l-2 border-token-brand/50 pl-4 font-serifDisplay text-[1.05rem] italic leading-9 text-token-muted">
                  “{details.examples[0]}”
                </blockquote>
              </DetailSection>
            ) : <div />}
          </div>

          <div className="grid gap-8 border-t border-token-border pt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <div className="grid gap-8">
              <DetailSection label="Translation">
                <p>{details.translation ?? "Not available for this item."}</p>
              </DetailSection>

              <DetailSection label="Definition">
                <p>{details.meaning ?? "Not available for this item."}</p>
              </DetailSection>

              {details.examples.length > 1 ? (
                <DetailSection label="Examples">
                  <ul className="space-y-3 text-token-muted">
                    {details.examples.slice(1).map((example, index) => (
                      <li key={`${details.id}-example-${index + 1}`}>{example}</li>
                    ))}
                  </ul>
                </DetailSection>
              ) : null}
            </div>

            <div className="grid gap-8">
              {details.language ? (
                <DetailSection label="Language">
                  <p>{details.language}</p>
                </DetailSection>
              ) : null}

              {details.canonicalForm ? (
                <DetailSection label="Canonical form">
                  <p>{details.canonicalForm}</p>
                </DetailSection>
              ) : null}

              {details.learningStatus ? (
                <DetailSection label="Status">
                  <p>{details.learningStatus}</p>
                </DetailSection>
              ) : null}
            </div>
          </div>
        </article>
      ) : null}
    </section>
  );
}
