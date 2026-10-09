import type { MetadataRoute } from 'next';
import { getSiteUrl, isProduction } from '@/lib/site';

/** /robots.txt: allow + sitemap in production; disallow everywhere else (ARCHITECTURE §7). */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  if (!isProduction) {
    return { rules: { userAgent: '*', disallow: '/' }, sitemap: `${siteUrl}/sitemap.xml` };
  }
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteUrl}/sitemap.xml` };
}
