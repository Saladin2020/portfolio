import type { SiteContent } from '@/content';
import type { Messages } from '@/messages/th';
import { PillLink } from '@/components/ui/Pill';
import { ctaAttrs, type CtaLocation } from '@/lib/cta';
import { buildMailto } from '@/lib/mailto';
import { cx } from '@/components/ui/cx';
import { BriefcaseIcon, UserSearchIcon } from '@/components/ui/icons';

type Props = { c: SiteContent; m: Messages; scene: 'light' | 'dark'; location: CtaLocation; headingLevel?: 'h3' };

/** Client vs recruiter paths (S-2, repeated in S-7 per AC-CON-03). Equal weight (D-11). */
export function PathCards({ c, m, scene, location }: Props) {
  const p = c.profile;
  const name = String(p.displayName ?? p.fullName);
  const mailto = buildMailto(p.email, m.mailto.subject, m.mailto.body(name));
  const card = cx(
    'flex flex-col gap-3 rounded-panel border p-4 lg:p-6',
    scene === 'light' ? 'border-light-border-subtle bg-light-surface shadow-card' : 'border-dark-surface bg-dark-surface',
  );
  const title = cx('type-h3', scene === 'light' ? 'text-light-text-heading' : 'text-dark-text-heading');
  const text = scene === 'light' ? 'text-light-text-secondary' : 'text-dark-text-secondary';
  const icon = cx('size-touch rounded-full p-2', scene === 'light' ? 'bg-light-muted text-light-text-heading' : 'bg-dark-bg text-dark-text-primary');
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className={card} aria-labelledby={`${location}-client-title`}>
        <BriefcaseIcon className={icon} />
        <h3 id={`${location}-client-title`} className={title}>
          {m.paths.clientTitle}
        </h3>
        <p className={text}>{m.paths.clientText}</p>
        <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <PillLink href={mailto} variant="primary" scene={scene} {...ctaAttrs('path_client_start_project', location)}>
            {m.paths.clientPrimary}
          </PillLink>
          {p.links.hire.map((h) => (
            <PillLink key={h.id} href={h.url} external variant="secondary" scene={scene} {...ctaAttrs('path_client_hire_platform', location)}>
              {m.paths.hirePrefix} {(p.hireLabels as Record<string, string>)[h.id] ?? h.id}
            </PillLink>
          ))}
        </div>
        <p className={cx('type-small', text)}>
          {m.paths.noMailHelper}{' '}
          <a href="#contact-email" className={cx('inline-flex min-h-touch min-w-touch items-center underline underline-offset-4', scene === 'light' ? 'text-light-text-link' : 'text-dark-text-link')}>
            {m.contact.copy}
          </a>
        </p>
      </article>

      <article className={card} aria-labelledby={`${location}-recruiter-title`}>
        <UserSearchIcon className={icon} />
        <h3 id={`${location}-recruiter-title`} className={title}>
          {m.paths.recruiterTitle}
        </h3>
        <p className={text}>{m.paths.recruiterText}</p>
        <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {/* Resume CTA is hidden entirely until a PDF exists (C-24, PO decision 2026-10-09). */}
          {'resume' in p && p.resume ? (
            <PillLink href={(p.resume as { path: string }).path} download variant="primary" scene={scene} {...ctaAttrs('path_recruiter_resume', location)}>
              {m.paths.resume} (PDF)
            </PillLink>
          ) : null}
          <PillLink href={p.links.linkedin} external variant={'resume' in p && p.resume ? 'secondary' : 'primary'} scene={scene} {...ctaAttrs('path_recruiter_linkedin', location)}>
            LinkedIn
          </PillLink>
          <PillLink href={p.links.github} external variant="secondary" scene={scene} {...ctaAttrs('path_recruiter_github', location)}>
            GitHub
          </PillLink>
        </div>
      </article>
    </div>
  );
}
