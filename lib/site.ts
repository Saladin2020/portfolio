/**
 * Production origin for metadataBase, canonical, sitemap, robots, JSON-LD, and OG.
 *
 * 1. NEXT_PUBLIC_SITE_URL when set (custom domain, C-25).
 * 2. Otherwise https://VERCEL_PROJECT_PRODUCTION_URL (Vercel system env, set on every deployment).
 * 3. Production builds fail when neither is set.
 *    Non-production keeps VERCEL_URL, then http://localhost:3000, so local and CI builds need no env.
 */

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/\/+$/, '');
  return trimmed ? trimmed : undefined;
}

/** Explicit site origin, or undefined when neither production source is set. */
export function configuredSiteUrl(): string | undefined {
  const explicit = clean(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicit) return explicit;
  const host = clean(process.env.VERCEL_PROJECT_PRODUCTION_URL)?.replace(/^https?:\/\//, '');
  if (host) return `https://${host}`;
  return undefined;
}

export function getSiteUrl(): string {
  const configured = configuredSiteUrl();
  if (configured) return configured;
  if (process.env.VERCEL_ENV === 'production') {
    throw new Error(
      'Site URL is required in production: set NEXT_PUBLIC_SITE_URL or deploy on Vercel so VERCEL_PROJECT_PRODUCTION_URL is available',
    );
  }
  const preview = clean(process.env.VERCEL_URL);
  if (preview) return `https://${preview.replace(/^https?:\/\//, '')}`;
  return 'http://localhost:3000';
}

export const isProduction = process.env.VERCEL_ENV === 'production';
