import tokens from '@/design/design-tokens.json';

/** Numeric token values needed by JS (e.g. toast timing). Read from the token file, never hard-coded. */
export const TOAST_VISIBLE_MS: number = tokens.duration['toast-visible'].$value.value;
