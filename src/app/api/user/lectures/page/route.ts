import { NextResponse } from "next/server";

import { requireAuthApiAccess } from "@/lib/auth/auth-server";
import { renderLecturePage } from "@/lib/server/lecture-renderer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const access = await requireAuthApiAccess(request);
  if (!access.ok) return access.response;

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();
  const rawIndex = url.searchParams.get("index");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const index = Number.parseInt(rawIndex ?? "", 10);
  if (!Number.isFinite(index) || index < 0) {
    return NextResponse.json({ error: "Invalid index." }, { status: 400 });
  }

  try {
    const png = await renderLecturePage(slug, access.authenticatedUser, index);
    return new Response(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unexpected";
    if (message === "not-found" || message === "page-out-of-range") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: `Failed to render lecture page: ${message}` },
      { status: 500 },
    );
  }
}
