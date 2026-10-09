import Image from 'next/image';
import type { SiteContent } from '@/content';
import type { Messages } from '@/messages/th';
import { PillLink } from '@/components/ui/Pill';
import { RichText } from '@/components/ui/RichText';
import { ctaAttrs } from '@/lib/cta';

/** S-1 Hero: name, h1 headline (only h1 on the page), value line, two CTAs, decorative thumbnails. */
export function Hero({ c, m }: { c: SiteContent; m: Messages }) {
  const p = c.profile;
  const availability = 'availability' in p && p.availability && isKnownAvailability(p.availability) ? p.availabilityLabel[p.availability] : undefined;
  const thumbs = c.projects.slice(0, 3).map((pr) => pr.images[0]!.src);
  return (
    <section id="top" aria-labelledby="hero-heading" className="section-x relative flex flex-col overflow-hidden pt-4 pb-11 lg:pt-11 lg:pb-12">
      {/* Decorative thumbnails of the PO's own projects (hidden from AT, AC-HERO-04). */}
      <div aria-hidden="true" className="pointer-events-none order-1 mx-auto flex max-sm:hidden max-w-copy justify-center xl:max-w-none gap-2 pb-4 xl:absolute xl:inset-0 xl:block xl:pb-0">
        {/* Real files load only at ≥ sm (640px). Mobile Lighthouse must not fetch these decorative thumbs. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `@media (min-width: 640px){${thumbs
              .map(
                (src, i) =>
                  `.hero-thumb-${i}{background-image:url("/_next/image?url=${encodeURIComponent(src.src)}&w=384&q=75");background-size:cover;background-position:center}`,
              )
              .join('')}}`,
          }}
        />
        {thumbs.map((_, i) => (
          <div
            key={i}
            className={
              [
                'hero-thumb-0 aspect-16/10 h-auto w-1/4 rounded-element border border-light-border-subtle shadow-card max-sm:hidden xl:absolute xl:w-1/6 xl:-rotate-6 xl:top-12 xl:left-10',
                'hero-thumb-1 aspect-16/10 h-auto w-1/4 rounded-element border border-light-border-subtle shadow-card max-sm:hidden xl:absolute xl:w-1/6 xl:rotate-6 xl:top-10 xl:right-10',
                'hero-thumb-2 aspect-16/10 h-auto w-1/4 rounded-element border border-light-border-subtle shadow-card max-sm:hidden xl:absolute xl:w-1/6 xl:-rotate-3 xl:bottom-6 xl:left-12',
              ][i]
            }
          />
        ))}
      </div>

      <div className="relative order-1 mx-auto flex max-w-copy flex-col items-center text-center motion-entrance sm:order-2">
        {/* Availability badge is hidden until the PO states it (C-26). */}
        {availability && (
          <p className="mb-3 inline-flex items-center gap-1-5 rounded-full border border-light-border-subtle bg-light-surface px-3 py-1 type-small text-light-text-secondary">
            <span aria-hidden="true" className="size-1-5 rounded-full bg-status-success" />
            {m.hero.availabilityPrefix} {availability}
          </p>
        )}
        <p className="type-lead text-light-text-heading">
          {p.displayName ?? p.fullName}{' '}
          <span lang="en" className="text-light-text-secondary">
            · {p.nameEn}
          </span>
        </p>
        {p.positioning && (
          <p lang="en" className="mt-1 type-label text-light-text-secondary">
            {p.positioning}
          </p>
        )}
        <h1 id="hero-heading" className="mt-2 type-h2 text-balance text-light-text-heading lg:type-display">
          <RichText value={p.headline} scene="light" animate />
        </h1>
        {p.valueProp && <p className="mt-3 type-lead text-light-text-secondary">{p.valueProp}</p>}
        <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
          <PillLink href="#work" variant="primary" className="px-6 max-sm:flex-1" {...ctaAttrs('hero_view_work')}>
            {m.hero.viewWork}
          </PillLink>
          <PillLink href="#contact" variant="secondary" className="px-6 max-sm:flex-1" {...ctaAttrs('hero_contact')}>
            {m.hero.contact}
          </PillLink>
        </div>
        <span aria-hidden="true" className="motion-scroll-cue motion-bob mt-8 hidden text-light-text-secondary lg:block">
          ↓
        </span>
      </div>

      {/* Below 640px the thumbs stack under the CTAs (BUG-06). Small, lazy, and low priority so the h1 stays LCP. */}
      <div aria-hidden="true" className="order-2 mx-auto flex w-full max-w-copy flex-col items-center gap-3 pt-6 sm:hidden">
        {thumbs.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt=""
            width={176}
            height={110}
            sizes="176px"
            loading="lazy"
            fetchPriority="low"
            className="pointer-events-none aspect-16/10 h-auto w-44 rounded-element border border-light-border-subtle object-cover shadow-card"
          />
        ))}
      </div>
    </section>
  );
}

function isKnownAvailability(v: string): v is 'freelance' | 'full-time' | 'both' | 'not-available' {
  return ['freelance', 'full-time', 'both', 'not-available'].includes(v);
}
