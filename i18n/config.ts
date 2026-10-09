export const LOCALES = ['th'] as const; // v1.1: ['th', 'en']
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'th';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Public path for a locale. The default locale is served unprefixed (ARCHITECTURE §5.1). */
export function localePath(locale: Locale, path: `/${string}` = '/'): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}
