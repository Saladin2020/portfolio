import type { SiteContent } from '@/content';
import type { Messages } from '@/messages/th';
import { Section } from '@/components/layout/Section';
import { TOAST_VISIBLE_MS } from '@/lib/tokens';
import { cx } from '@/components/ui/cx';
import { PathCards } from './PathCards';

/** S-7 Contact (dark closing panel): visible email + copy button (AC-CON-05), repeated paths (AC-CON-03). */
export function Contact({ c, m }: { c: SiteContent; m: Messages }) {
  const email = c.profile.email;
  return (
    <Section id="contact" scene="dark" heading={m.contact.heading} intro={m.contact.closing} className="lg:pb-section-bottom-last">
      <div id="contact-email" className="mb-6 flex flex-col gap-2 rounded-panel border border-dark-surface p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:p-6">
        <p className="flex min-w-0 flex-col">
          <span className="type-label text-dark-text-muted">{m.contact.emailLabel}</span>
          <a id="contact-email-text" href={`mailto:${email}`} className="type-h3 text-dark-text-primary underline-offset-4 hover:underline">
            {email.slice(0, email.indexOf('@') + 1)}
            <wbr />
            {email.slice(email.indexOf('@') + 1)}
          </a>
        </p>
        <span className="relative inline-flex flex-col items-start gap-1">
          <button
            type="button"
            data-copy-email={email}
            data-copied={m.contact.copied}
            data-fallback={m.contact.copyFallback}
            data-copy-target="contact-email-text"
            data-toast={TOAST_VISIBLE_MS}
            aria-label={`${m.contact.copy} ${email}`}
            data-cta="contact_copy_email"
            className={cx(
              'motion-hover inline-flex min-h-touch items-center justify-center rounded-full border-2 px-3 py-1 type-label',
              'border-dark-action-secondary-border text-dark-action-secondary-text hover:bg-dark-surface',
            )}
          >
            {m.contact.copy}
          </button>
          <span role="status" aria-live="polite" data-copy-status className="type-small text-dark-text-secondary" />
        </span>
      </div>
      <PathCards c={c} m={m} scene="dark" location="contact" />
    </Section>
  );
}
