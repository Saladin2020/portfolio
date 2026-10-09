import type { Person, ProfilePage, WithContext } from 'schema-dts';
import type { SiteContent } from '@/content';
import { richTextToString } from '@/components/ui/RichText';

/** ProfilePage + Person JSON-LD (ARCHITECTURE §7, AC-SEO-05). */
export function buildProfileJsonLd(c: SiteContent, siteUrl: string): WithContext<ProfilePage> {
  const p = c.profile;
  const person: Person = {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: p.nameEn,
    alternateName: [p.fullName, p.displayName].filter((x): x is NonNullable<typeof x> => Boolean(x)),
    jobTitle: p.jobTitle,
    description: p.valueProp ?? richTextToString(p.headline),
    url: `${siteUrl}/`,
    image: `${siteUrl}${p.photoPublicPath}`,
    email: `mailto:${p.email}`,
    sameAs: [p.links.github, p.links.linkedin, ...p.links.hire.map((h) => h.url)],
    knowsAbout: [...new Set(c.skills.flatMap((g) => g.items.map((i) => i.name)))],
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${siteUrl}/`,
    inLanguage: c.locale,
    dateModified: new Date().toISOString(),
    mainEntity: person,
  };
}

export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
