import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { type Locale, locales } from "@/i18n/config";
import { routing } from "@/i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

const PUBLIC_PATH_PREFIXES = [
  "/api/auth",
  "/sign-in",
  "/sign-up",
  "/unauthorized",
];

function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && locales.includes(value as Locale);
}

function getLocaleFromPathname(pathname: string): Locale | undefined {
  const [, segment] = pathname.split("/");
  return isLocale(segment) ? segment : undefined;
}

function stripLocalePrefix(pathname: string) {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname;

  const strippedPathname = pathname.slice(locale.length + 1);
  return strippedPathname ? strippedPathname : "/";
}

function isPublicRoute(pathname: string) {
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const intlResponse = nextIntlMiddleware(request);
  const location = intlResponse.headers.get("location");
  if (location) return intlResponse;

  const pathnameWithoutLocale = stripLocalePrefix(request.nextUrl.pathname);
  if (isPublicRoute(pathnameWithoutLocale)) return intlResponse;

  if (!getSessionCookie(request)) {
    const locale =
      getLocaleFromPathname(request.nextUrl.pathname) ?? routing.defaultLocale;
    const signInUrl = new URL(`/${locale}/sign-in`, request.url);
    const redirectPath =
      request.nextUrl.pathname + (request.nextUrl.search || "");
    signInUrl.searchParams.set("redirect_url", redirectPath);

    return NextResponse.redirect(signInUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_vercel|favicon\\.ico|.*\\.[\\w]+$).*)",
  ],
};
