import { NextResponse } from "next/server";

import { requireAuthApiAccess } from "@/lib/auth/auth-server";
import {
  forwardLmsSlsRequest,
  getForwardedSessionHeaders,
  mergeHeaders,
} from "@/lib/server/lms-sls";
import { createTrustedUserHeaders } from "@/lib/server/lms-sls-user";

export async function POST(request: Request) {
  try {
    const access = await requireAuthApiAccess(request);
    if (!access.ok) return access.response;

    const body = (await request.json().catch(() => null)) as {
      productSlug?: unknown;
      currency?: unknown;
      redirectUrl?: unknown;
    } | null;

    if (!body || typeof body !== "object")
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );

    return await forwardLmsSlsRequest({
      body: JSON.stringify({
        productSlug: body.productSlug,
        currency: body.currency,
        redirectUrl: body.redirectUrl,
      }),
      contentType: "application/json",
      headers: mergeHeaders(
        createTrustedUserHeaders(access.authenticatedUser),
        getForwardedSessionHeaders(request.headers),
      ),
      method: "POST",
      path: "/api/user/checkout",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      { error: `Failed to create checkout: ${message}` },
      { status: 500 },
    );
  }
}
