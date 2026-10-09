import type { ReactNode } from 'react';
import { cx } from '@/components/ui/cx';

type Props = {
  id: string;
  heading: ReactNode;
  intro?: ReactNode;
  scene?: 'light' | 'dark';
  children: ReactNode;
  className?: string;
};

/** Section wrapper: one h2 per section (AC-SEO-04), light or dark scene. */
export function Section({ id, heading, intro, scene = 'light', children, className }: Props) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cx(
        'section-x section-y',
        scene === 'dark' ? 'scene-dark bg-dark-bg text-dark-text-primary' : 'bg-light-bg text-light-text-primary',
        className,
      )}
    >
      <div className="mx-auto max-w-content">
        <h2 id={headingId} className={cx('type-h2', scene === 'dark' ? 'text-dark-text-heading' : 'text-light-text-heading')}>
          {heading}
        </h2>
        {intro && (
          <p className={cx('mt-2 max-w-copy type-lead', scene === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary')}>{intro}</p>
        )}
        <div className="mt-6 lg:mt-8">{children}</div>
      </div>
    </section>
  );
}
