import type { SiteContent } from '@/content';
import { buildProfileJsonLd, jsonLdScript } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site';

/** ProfilePage + Person JSON-LD (AC-SEO-05). `<` is escaped as \u003c. */
export function ProfileJsonLd({ c }: { c: SiteContent }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(buildProfileJsonLd(c, getSiteUrl())) }} />;
}
