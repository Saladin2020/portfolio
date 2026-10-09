import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getContent, getProject } from '@/content';
import { SiteNav } from '@/components/layout/SiteNav';
import { Footer } from '@/components/layout/Footer';
import { ProjectDetail } from '@/components/work/ProjectDetail';
import { PillLink } from '@/components/ui/Pill';
import { jsonLdScript } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site';

/** Static project page: the no-JS target and deep link for each card (ARCHITECTURE §2.4, AD-5 = indexable). */
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => getContent(locale).projects.map((p) => ({ locale, slug: p.id })));
}

type Props = { params: Promise<{ slug: string }> };

const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1)}…`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getI18n();
  const project = getProject(locale, slug);
  if (!project) return {};
  const t = project.text;
  return {
    title: clip(String(t.title), 40),
    description: clip(`${t.problem} ${t.solution}`, 160),
    alternates: { canonical: `/work/${slug}` },
    openGraph: { url: `/work/${slug}`, type: 'article', images: [{ url: '/opengraph-image.png', width: 1200, height: 630 }] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const { locale, m } = await getI18n();
  const project = getProject(locale, slug);
  if (!project) notFound();
  const siteUrl = getSiteUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.text.title,
    description: project.text.problem,
    url: `${siteUrl}/work/${slug}`,
    image: `${siteUrl}${project.images[0]!.src.src}`,
    keywords: project.tech.join(', '),
    inLanguage: locale,
    author: { '@type': 'Person', '@id': `${siteUrl}/#person`, name: getContent(locale).profile.nameEn },
  };
  return (
    <>
      <SiteNav onHome={false} />
      <main id="main" tabIndex={-1} className="section-x section-y focus:outline-none">
        <div className="mx-auto flex max-w-nav flex-col gap-6">
          <Link href="/#work" className="inline-flex min-h-touch items-center self-start type-label text-light-text-link underline-offset-4 hover:underline">
            ← {m.work.backToWork}
          </Link>
          <div className="rounded-panel border border-light-border-subtle bg-light-surface p-4 shadow-panel lg:p-6">
            <ProjectDetail project={project} m={m} headingLevel="h1" idPrefix={`page-${slug}`} />
          </div>
          <div className="flex flex-wrap gap-2">
            <PillLink href="/#contact" variant="primary">
              {m.nav.contact}
            </PillLink>
            <PillLink href="/#work" variant="secondary">
              {m.work.backToWork}
            </PillLink>
          </div>
        </div>
      </main>
      <Footer onHome={false} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
    </>
  );
}
