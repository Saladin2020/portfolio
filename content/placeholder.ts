/**
 * Placeholder helpers (ARCHITECTURE §4.5).
 * Every value the PO must still supply is written with `ph('C-xx', 'hint')`, which renders visibly as
 * `[PLACEHOLDER: C-xx hint]`. `scripts/validate-content.ts` lists them as warnings on preview/local builds
 * and fails production builds (VERCEL_ENV=production) while any remain.
 */
export type Placeholder = `[PLACEHOLDER: ${string}]`;

export function ph(id: string, hint?: string): Placeholder {
  return `[PLACEHOLDER: ${hint ? `${id} ${hint}` : id}]`;
}

/**
 * Placeholder URLs and emails use the IANA-reserved documentation domain `example.com`, so links are
 * never broken (AC-WORK-05) and never point at a real person. They are flagged in the UI and by the
 * content validator.
 */
export const PLACEHOLDER_ORIGIN = 'https://example.com';
export function phUrl(id: string): `https://${string}` {
  return `https://example.com/placeholder/${id.toLowerCase()}`;
}

export function isPlaceholder(value: string | undefined | null): boolean {
  if (!value) return false;
  return value.includes('[PLACEHOLDER') || /(^|[/@.])example\.com(\/|$)/.test(value);
}
