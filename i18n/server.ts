import 'server-only';
import { locale as rootLocale } from 'next/root-params';
import { DEFAULT_LOCALE, isLocale, type Locale } from './config';
import { getMessages } from './dictionary';

/** Current locale from the root `[locale]` segment (ARCHITECTURE §5.2, next/root-params). */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale();
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, m: getMessages(locale) };
}
