import { BackendRequestError, fetchBackendJson } from "@/lib/backend-client";
import { appConfig } from "@/lib/config";

type BackendBootstrapSuccess = {
  kind: "ok";
  access: unknown;
  me: unknown;
};

type BackendBootstrapUnauthorized = {
  kind: "unauthorized";
  message: string;
};

type BackendBootstrapError = {
  kind: "error";
  message: string;
};

export type BackendBootstrapResult =
  | BackendBootstrapSuccess
  | BackendBootstrapUnauthorized
  | BackendBootstrapError;

export async function resolveAuthenticatedEntry(accessToken: string): Promise<BackendBootstrapResult> {
  if (!appConfig.hasApiBaseUrl) {
    return {
      kind: "error",
      message: "Missing NEXT_PUBLIC_API_BASE_URL for backend auth bootstrap.",
    };
  }

  try {
    const [me, access] = await Promise.all([
      fetchBackendJson<unknown>({
        accessToken,
        path: "/auth/me",
      }),
      fetchBackendJson<unknown>({
        accessToken,
        path: "/auth/access",
      }),
    ]);

    return {
      kind: "ok",
      access,
      me,
    };
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 401) {
      return {
        kind: "unauthorized",
        message: "The current browser session is not accepted by the backend auth boundary.",
      };
    }

    return {
      kind: "error",
      message:
        error instanceof Error && error.message.trim()
          ? error.message
          : "Backend auth bootstrap could not reach the API. Check the configured base URL and browser network access.",
    };
  }
}
