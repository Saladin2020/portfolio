import type { ReactNode } from 'react';
import { cx } from './cx';

/** Non-interactive text chip (skills, tech, category). Border is decorative (accessibility-notes S-5). */
export function Chip({ children, scene = 'light', className }: { children: ReactNode; scene?: 'light' | 'dark'; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2 py-0-5 type-small',
        scene === 'light' ? 'border-light-border-subtle bg-light-surface text-light-text-primary' : 'border-dark-surface bg-dark-surface text-dark-text-secondary',
        className,
      )}
    >
      {children}
    </span>
  );
}
