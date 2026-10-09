import { getI18n } from '@/i18n/server';
import { getContent } from '@/content';
import { SiteNav } from '@/components/layout/SiteNav';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { AudiencePaths } from '@/components/sections/AudiencePaths';
import { Work } from '@/components/sections/Work';
import { Process } from '@/components/sections/Process';
import { Skills } from '@/components/sections/Skills';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { ProfileJsonLd } from '@/components/seo/ProfileJsonLd';

/** Single page composing the PRD sections in order (ARCHITECTURE §2.3). */
export default async function HomePage() {
  const { locale, m } = await getI18n();
  const c = getContent(locale);
  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero c={c} m={m} />
        <AudiencePaths c={c} m={m} />
        <Work c={c} m={m} />
        <Process c={c} m={m} />
        <Skills c={c} m={m} />
        <About c={c} m={m} />
        <Contact c={c} m={m} />
      </main>
      <Footer />
      <ProfileJsonLd c={c} />
    </>
  );
}
