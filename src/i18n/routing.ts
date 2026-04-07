import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ua"],
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
