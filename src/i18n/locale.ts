import { defaultLocale, type Locale, locales } from "@/i18n/config";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

export function stripLocalePrefix(path: string): string {
  if (!path.startsWith("/")) return path;

  const [, segment] = path.split("/");
  if (!segment || !isLocale(segment)) return path;

  const suffix = path.slice(segment.length + 1);
  if (!suffix) return "/";
  if (suffix.startsWith("/")) return suffix;
  return `/${suffix}`;
}
