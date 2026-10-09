/** Site origin: NEXT_PUBLIC_SITE_URL (production, C-25) → VERCEL_URL (previews) → localhost. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const isProduction = process.env.VERCEL_ENV === 'production';
