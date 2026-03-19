import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin-server";
import { forwardLmsSlsRequest } from "@/lib/server/lms-sls";

export async function POST(request: Request) {
  const access = await requireAdminApiAccess({ includeUser: true });

  if (!access.ok) {
    return access.response;
  }

  try {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 },
      );
    }

    const incomingUrl = new URL(request.url);

    return await forwardLmsSlsRequest({
      body: JSON.stringify({
        ...body,
        clerkUserId: access.userId,
        customerEmail: access.user?.primaryEmailAddress?.emailAddress ?? null,
      }),
      contentType: "application/json",
      method: "POST",
      path: "/api/monobank/invoice",
      search: incomingUrl.search,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    return NextResponse.json(
      { error: `Failed to reach lms-sls service: ${message}` },
      { status: 500 },
    );
  }
}
