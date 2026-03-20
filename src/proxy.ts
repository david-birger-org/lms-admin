import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const CLERK_ACCOUNTS_HOST = "accounts.admin.davidbirger.com";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/unauthorized",
]);

export default clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.hostname === CLERK_ACCOUNTS_HOST) {
    return;
  }

  if (!isPublicRoute(request)) {
    const { userId } = await auth();

    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      const redirectPath =
        request.nextUrl.pathname + (request.nextUrl.search || "");
      signInUrl.searchParams.set("redirect_url", redirectPath);

      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
