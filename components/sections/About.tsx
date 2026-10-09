import Image from 'next/image';
import type { SiteContent } from '@/content';
import type { Messages } from '@/messages/th';
import { Section } from '@/components/layout/Section';
import { Chip } from '@/components/ui/Chip';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { AVAILABILITY, type Availability } from '@/content/schema';

/** S-6 About: photo (4:5, alt), name · role/city, bio, availability (one value), role chips. */
export function About({ c, m }: { c: SiteContent; m: Messages }) {
  const p = c.profile;
  const raw = 'availability' in p ? (p.availability as string | undefined) : undefined;
  const availability = raw && (AVAILABILITY as readonly string[]).includes(raw) ? p.availabilityLabel[raw as Availability] : undefined;
  return (
    <Section id="about" heading={m.about.heading}>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
        <Image
          src={p.photo}
          alt={p.photoAlt}
          sizes="(width >= 860px) 40vw, 100vw"
          placeholder="blur"
          className="aspect-4/5 h-auto w-full max-w-copy rounded-panel border border-light-border-subtle object-cover"
        />
        <div className="flex max-w-copy flex-col gap-3">
          <p className="type-lead text-light-text-heading">
            {p.fullName}{' '}
            <span lang="en" className="text-light-text-secondary">
              · {p.nameEn}
            </span>
            {p.roleCity && <> · {p.roleCity}</>}
          </p>
          <p>{p.bio}</p>
          {availability && (
            <p className="flex flex-wrap items-center gap-1-5">
              <span className="type-label text-light-text-secondary">{m.about.availability}:</span>
              <span className="inline-flex items-center gap-1-5 rounded-full border border-light-border-subtle bg-light-surface px-2 py-0-5">
                <span aria-hidden="true" className="size-1-5 rounded-full bg-status-success" />
                {availability}
              </span>
            </p>
          )}
          <ul className="flex flex-wrap gap-2 type-label">
            <li>
              <ExternalLink href={p.links.github} className="inline-flex min-h-touch items-center text-light-text-link underline underline-offset-4">
                GitHub
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={p.links.linkedin} className="inline-flex min-h-touch items-center text-light-text-link underline underline-offset-4">
                LinkedIn
              </ExternalLink>
            </li>
          </ul>
          {p.rolePreferences && (
            <div>
              <p className="type-label text-light-text-secondary">{m.about.preferences}</p>
              <ul className="mt-1 flex flex-wrap gap-1">
                {p.rolePreferences.map((r, i) => (
                  <li key={i}>
                    <Chip>{r}</Chip>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
