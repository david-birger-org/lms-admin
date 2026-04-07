import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";

import { isAdminUser } from "@/lib/auth/admin";
import {
  type AuthSessionRecord,
  type AuthUser,
  getAuth,
} from "@/lib/auth/better-auth";

export type UserRole = "admin" | "user";

export interface AuthenticatedUser {
  email: string | null;
  name: string | null;
  role: UserRole;
  userId: string;
}

type ResolvedAuthAccess =
  | {
      authenticatedUser: AuthenticatedUser;
      role: UserRole;
      session: AuthSessionRecord;
      status: "ok";
      userId: string;
      user: AuthUser;
    }
  | {
      status: "unauthorized";
    };

type ResolvedAuthSuccess = Extract<ResolvedAuthAccess, { status: "ok" }>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

function resolveRole(user: AuthUser): UserRole {
  return isAdminUser(user) ? "admin" : "user";
}

async function resolveAuthAccess(
  requestHeaders: Headers,
): Promise<ResolvedAuthAccess> {
  const session = await getAuth().api.getSession({
    headers: requestHeaders,
  });

  if (!session) return { status: "unauthorized" };

  const role = resolveRole(session.user);

  return {
    authenticatedUser: {
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      role,
      userId: session.user.id,
    },
    role,
    session: session.session,
    status: "ok",
    userId: session.user.id,
    user: session.user,
  };
}

const resolveCurrentAuthAccess = cache(async () =>
  resolveAuthAccess(await headers()),
);

export async function requireAuthPageAccess(): Promise<ResolvedAuthSuccess> {
  const access = await resolveCurrentAuthAccess();

  if (access.status === "unauthorized") redirect("/sign-in");

  return access;
}

export async function requireAuthPageAccessWithRedirect(
  redirectUrl: string,
): Promise<ResolvedAuthSuccess> {
  const access = await resolveCurrentAuthAccess();

  if (access.status === "unauthorized") {
    const params = new URLSearchParams({ redirect_url: redirectUrl });
    redirect(`/sign-in?${params.toString()}`);
  }

  return access;
}

type AuthApiAccess =
  | {
      authenticatedUser: AuthenticatedUser;
      ok: true;
      role: UserRole;
      session: AuthSessionRecord;
      userId: string;
      user: AuthUser;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireAuthApiAccess(
  request: Request,
): Promise<AuthApiAccess> {
  let access: ResolvedAuthAccess;

  try {
    access = await resolveAuthAccess(request.headers);
  } catch (error) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Failed to authorize request: ${getErrorMessage(error)}` },
        { status: 500 },
      ),
    };
  }

  if (access.status === "unauthorized")
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };

  return {
    authenticatedUser: access.authenticatedUser,
    ok: true,
    role: access.role,
    session: access.session,
    userId: access.userId,
    user: access.user,
  };
}
