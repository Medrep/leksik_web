import { appConfig } from "@/lib/config";

export class BackendRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendRequestError";
    this.status = status;
  }
}

export function buildBackendUrl(path: string) {
  return `${appConfig.apiBaseUrl}${path}`;
}

export async function readBackendResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text || null;
  } catch (error) {
    return null;
  }
}

export function getBackendErrorMessage(body: unknown, fallback: string) {
  if (!body) {
    return fallback;
  }

  if (typeof body === "string") {
    return body;
  }

  if (typeof body === "object") {
    const record = body as Record<string, unknown>;

    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail;
    }

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }

    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }
  }

  return fallback;
}

export async function fetchBackendJson<T>({
  accessToken,
  path,
  method = "GET",
  body,
  searchParams,
  signal,
}: {
  accessToken: string;
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  searchParams?: URLSearchParams;
  signal?: AbortSignal;
}): Promise<T> {
  if (!appConfig.hasApiBaseUrl) {
    throw new BackendRequestError("Missing NEXT_PUBLIC_API_BASE_URL for backend requests.", 0);
  }

  const url = new URL(buildBackendUrl(path));

  if (searchParams) {
    url.search = searchParams.toString();
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const requestInit: RequestInit = {
    method,
    headers,
    signal,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), {
    ...requestInit,
  });

  if (!response.ok) {
    const body = await readBackendResponseBody(response);
    throw new BackendRequestError(
      getBackendErrorMessage(body, "Backend request failed."),
      response.status,
    );
  }

  return (await readBackendResponseBody(response)) as T;
}
