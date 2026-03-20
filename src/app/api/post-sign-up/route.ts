import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  forwardLmsSlsRequest,
  getCurrentRequestAuthHeaders,
} from "@/lib/server/lms-sls";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return redirectTo(request, "/sign-in");
    }

    await forwardLmsSlsRequest({
      body: JSON.stringify({ clerkUserId: userId }),
      contentType: "application/json",
      headers: await getCurrentRequestAuthHeaders(),
      method: "POST",
      path: "/api/clerk/provision",
    });
  } catch {
    return redirectTo(request, "/sign-in");
  }

  return redirectTo(request, "/");
}
