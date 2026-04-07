import "server-only";

import { getLmsSlsConfig } from "@/lib/server/lms-sls";

interface UpsertAppUserInput {
  authUserId: string;
  email: string | null;
  fullName: string | null;
}

export async function upsertLmsSlsAppUser(input: UpsertAppUserInput) {
  const { apiKey, baseUrl } = getLmsSlsConfig();
  const url = new URL("api/internal/app-users/upsert", baseUrl);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-api-key": apiKey,
    },
    body: JSON.stringify({
      authUserId: input.authUserId,
      email: input.email,
      fullName: input.fullName,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      payload?.error ?? `lms-sls upsert failed with HTTP ${response.status}`,
    );
  }
}
