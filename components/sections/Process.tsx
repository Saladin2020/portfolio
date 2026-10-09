import { CheckCircle2 } from 'lucide-react';
import type { SiteContent } from '@/content';
import type { Messages } from '@/messages/th';
import { Section } from '@/components/layout/Section';
import { cx } from '@/components/ui/cx';

/** S-4 How I work (dark scene): 5 ordered steps (AC-PROC-01/03), quality callouts (AC-PROC-02). */
export function Process({ c, m }: { c: SiteContent; m: Messages }) {
  return (
    <Section
      id="process"
      scene="dark"
      heading={
        <>
          {m.process.heading}{' '}
          <span lang="en" className="text-emphasis-dark motion-shimmer">
            AI-native
          </span>
        </>
      }
      intro={m.process.intro}
      className="cv-defer"
    >
      <ol className="flex flex-col gap-8 lg:gap-12">
        {c.process.map((step, i) => (
          <li key={step.id} className="motion-reveal grid items-center gap-4 lg:grid-cols-2 lg:gap-12">
            <div className={cx('flex flex-col gap-2', i % 2 === 1 && 'lg:order-2')}>
              <span aria-hidden="true" className="type-label text-dark-text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="type-feature-title text-dark-text-heading">{step.title}</h3>
              {step.description && <p className="text-dark-text-secondary">{step.description}</p>}
              {'qualityNote' in step && step.qualityNote && (
                <p className="mt-1 flex items-start gap-1-5 rounded-container border border-dark-surface bg-dark-surface p-3 text-dark-text-primary">
                  <CheckCircle2 aria-hidden="true" className="mt-0-5 size-3 shrink-0 text-dark-text-link" />
                  <span>
                    <span className="font-semibold">{m.process.quality}: </span>
                    {step.qualityNote}
                  </span>
                </p>
              )}
            </div>
            {/* Original, decorative mock-UI card (brief §10 substitutions); hidden from assistive tech. */}
            <div aria-hidden="true" className={cx('rounded-panel bg-dark-surface p-4', i % 2 === 1 && 'lg:order-1')}>
              <div className="flex gap-1 pb-3">
                <span className="size-1-5 rounded-full bg-dark-text-muted" />
                <span className="size-1-5 rounded-full bg-dark-text-muted" />
                <span className="size-1-5 rounded-full bg-dark-text-muted" />
              </div>
              <div className="h-2 w-2/3 rounded-full bg-dark-bg" />
              <div className="mt-2 h-2 w-1/2 rounded-full bg-dark-bg" />
              <div className="mt-4 h-12 rounded-element bg-[linear-gradient(90deg,var(--gradient-emphasis-on-dark))] opacity-30" />
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
