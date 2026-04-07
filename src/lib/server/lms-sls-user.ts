import type { AuthenticatedUser } from "@/lib/auth/auth-server";

export function createTrustedUserHeaders(user: AuthenticatedUser) {
  const headers = new Headers();

  headers.set("x-user-id", user.userId);
  headers.set("x-user-role", user.role);

  if (user.email) headers.set("x-user-email", user.email);
  if (user.name) headers.set("x-user-name", user.name);

  return headers;
}
