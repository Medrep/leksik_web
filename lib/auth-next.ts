export type SearchParamsRecord = Record<string, string | string[] | undefined> | undefined;

function firstParamValue(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeOptionalNextRoute(value: string | string[] | null | undefined) {
  const rawValue = firstParamValue(value);
  const nextRoute = rawValue?.trim();

  if (!nextRoute || !nextRoute.startsWith("/") || nextRoute.startsWith("//")) {
    return null;
  }

  return nextRoute;
}

export function normalizeNextRoute(
  value: string | string[] | null | undefined,
  fallback = "/dictionary",
) {
  return normalizeOptionalNextRoute(value) ?? fallback;
}

export function getNextRouteFromSearchParams(
  searchParams: SearchParamsRecord,
  fallback = "/dictionary",
) {
  return normalizeNextRoute(searchParams?.next, fallback);
}

export function getOptionalNextRouteFromSearchParams(searchParams: SearchParamsRecord) {
  return normalizeOptionalNextRoute(searchParams?.next);
}

export function getNextRouteFromWindow(fallback = "/dictionary") {
  if (typeof window === "undefined") {
    return fallback;
  }

  const searchParams = new URLSearchParams(window.location.search);
  return normalizeNextRoute(searchParams.get("next"), fallback);
}

export function getOptionalNextRouteFromWindow() {
  if (typeof window === "undefined") {
    return null;
  }

  const searchParams = new URLSearchParams(window.location.search);
  return normalizeOptionalNextRoute(searchParams.get("next"));
}

export function buildHrefWithNext(path: string, nextRoute: string | string[] | null | undefined) {
  const normalizedNextRoute = normalizeOptionalNextRoute(nextRoute);

  if (!normalizedNextRoute) {
    return path;
  }

  const searchParams = new URLSearchParams();
  searchParams.set("next", normalizedNextRoute);

  return `${path}?${searchParams.toString()}`;
}
