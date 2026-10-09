import 'server-only';
import type { Locale } from './config';
import { th, type Messages } from '@/messages/th';

const dictionaries: Record<Locale, Messages> = { th };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}
