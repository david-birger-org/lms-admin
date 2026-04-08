import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin-server";
import { listAdminUsers, updateAdminUser } from "@/lib/server/admin-users";

export async function GET(request: Request) {
  const access = await requireAdminApiAccess(request);
  if (!access.ok) return access.response;

  try {
    return NextResponse.json({ users: await listAdminUsers() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      { error: `Failed to load users: ${message}` },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const access = await requireAdminApiAccess(request);
  if (!access.ok) return access.response;

  try {
    const payload = (await request.json()) as {
      email?: string;
      name?: string | null;
      role?: string;
      userId?: string;
    };

    if (!payload.userId || !payload.email || !payload.role) {
      return NextResponse.json(
        { error: "userId, email, and role are required." },
        { status: 400 },
      );
    }

    const user = await updateAdminUser({
      email: payload.email,
      name: payload.name,
      role: payload.role,
      userId: payload.userId,
    });

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "User not found." ? 404 : 400;

    return NextResponse.json(
      { error: `Failed to update user: ${message}` },
      { status },
    );
  }
}
