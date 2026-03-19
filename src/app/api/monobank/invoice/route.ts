import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/auth/admin";
import { forwardLmsSlsRequest } from "@/lib/server/lms-sls";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 },
      );
    }

    const user = await currentUser();

    if (!isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const incomingUrl = new URL(request.url);

    return await forwardLmsSlsRequest({
      body: JSON.stringify({
        ...body,
        clerkUserId: userId,
        customerEmail: user?.primaryEmailAddress?.emailAddress ?? null,
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
