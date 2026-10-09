import type { MetadataRoute } from 'next';
import { LOCALES } from '@/i18n/config';
import { getContent } from '@/content';
import { getSiteUrl } from '@/lib/site';

/** /sitemap.xml: home + every rendered project page (AD-5 = indexable), same list as generateStaticParams. */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const projects = LOCALES.flatMap((l) => getContent(l).projects);
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...projects.map((p) => ({ url: `${siteUrl}/work/${p.id}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
