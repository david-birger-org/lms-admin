import "server-only";

import type { QueryResultRow } from "pg";
import type { UserRole } from "@/lib/auth/auth-server";
import { getAuthDbPool } from "@/lib/auth/better-auth";
import { upsertLmsSlsAppUser } from "@/lib/server/lms-sls-app-users";

export interface AdminUserRecord {
  createdAt: string;
  email: string;
  emailVerified: boolean;
  id: string;
  name: string | null;
  role: UserRole;
  updatedAt: string;
}

interface AdminUserRow extends QueryResultRow {
  createdAt: Date | string;
  email: string;
  emailVerified: boolean;
  id: string;
  name: string | null;
  role: UserRole;
  updatedAt: Date | string;
}

function normalizeAdminUser(row: AdminUserRow): AdminUserRecord {
  return {
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    email: row.email,
    emailVerified: row.emailVerified,
    id: row.id,
    name: row.name,
    role: row.role,
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt),
  };
}

function assertRole(value: string): UserRole {
  if (value === "admin" || value === "user") {
    return value;
  }

  throw new Error("Invalid user role.");
}

function normalizeName(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeEmail(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    throw new Error("Email is required.");
  }

  return normalized;
}

export async function listAdminUsers(): Promise<AdminUserRecord[]> {
  const result = await getAuthDbPool().query<AdminUserRow>(
    `
      SELECT
        id,
        name,
        email,
        role,
        email_verified AS "emailVerified",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM auth_users
      ORDER BY created_at DESC
    `,
  );

  return result.rows.map(normalizeAdminUser);
}

export async function getAdminUserById(userId: string) {
  const result = await getAuthDbPool().query<AdminUserRow>(
    `
      SELECT
        id,
        name,
        email,
        role,
        email_verified AS "emailVerified",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM auth_users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ? normalizeAdminUser(result.rows[0]) : null;
}

export async function updateAdminUser({
  email,
  name,
  role,
  userId,
}: {
  email: string;
  name?: string | null;
  role: string;
  userId: string;
}) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = normalizeName(name);
  const normalizedRole = assertRole(role);

  try {
    const result = await getAuthDbPool().query<AdminUserRow>(
      `
        UPDATE auth_users
        SET
          email = $2,
          name = $3,
          role = $4,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          email,
          role,
          email_verified AS "emailVerified",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [userId, normalizedEmail, normalizedName, normalizedRole],
    );

    const updatedUser = result.rows[0];

    if (!updatedUser) {
      throw new Error("User not found.");
    }

    await upsertLmsSlsAppUser({
      authUserId: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.name,
    });

    return normalizeAdminUser(updatedUser);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new Error("A user with this email already exists.");
    }

    throw error;
  }
}
