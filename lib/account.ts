import { fetchBackendJson } from "@/lib/backend-client";

type AccountDeletionResponse = {
  status: "deleted";
};

function normalizeAccountDeletionResponse(payload: unknown): AccountDeletionResponse {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Backend returned an invalid account deletion response.");
  }

  const record = payload as Record<string, unknown>;

  if (record.status !== "deleted") {
    throw new Error("Backend returned an invalid account deletion status.");
  }

  return { status: "deleted" };
}

export async function deleteAccount({
  accessToken,
  signal,
}: {
  accessToken: string;
  signal?: AbortSignal;
}) {
  const payload = await fetchBackendJson<unknown>({
    accessToken,
    body: { confirmation: "DELETE" },
    method: "POST",
    path: "/account/delete",
    signal,
  });

  return normalizeAccountDeletionResponse(payload);
}
