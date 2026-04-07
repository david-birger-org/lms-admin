import { defaultLocale, type Locale, locales } from "@/i18n/config";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}
