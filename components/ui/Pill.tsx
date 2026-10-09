import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { isPlaceholder } from '@/content/placeholder';
import { ExternalLink } from './ExternalLink';
import { cx } from './cx';

export type PillVariant = 'primary' | 'secondary';
export type Scene = 'light' | 'dark';

export function pillClass(variant: PillVariant, scene: Scene, extra?: string) {
  return cx(
    'motion-hover inline-flex min-h-control items-center justify-center gap-1-5 rounded-full border-2 px-4 py-1-5 text-center type-label no-underline',
    variant === 'primary' && scene === 'light' && 'border-light-action-primary-bg bg-light-action-primary-bg text-light-action-primary-text hover:shadow-med',
    variant === 'secondary' && scene === 'light' && 'border-light-action-secondary-border bg-transparent text-light-action-secondary-text hover:bg-light-muted',
    variant === 'primary' && scene === 'dark' && 'border-dark-action-primary-bg bg-dark-action-primary-bg text-dark-action-primary-text hover:shadow-med',
    variant === 'secondary' && scene === 'dark' && 'border-dark-action-secondary-border bg-transparent text-dark-action-secondary-text hover:bg-dark-surface',
    extra,
  );
}

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  variant?: PillVariant;
  scene?: Scene;
  external?: boolean;
  children: ReactNode;
};

/** Pill-shaped link (brief §4: dark primary pill, outline secondary pill; inverted on dark scenes). */
export function PillLink({ href, variant = 'primary', scene = 'light', external, className, children, ...rest }: Props) {
  const cls = cx(pillClass(variant, scene, className), isPlaceholder(href) && 'border-dashed');
  if (external) {
    return (
      <ExternalLink href={href} className={cls} {...rest}>
        {children}
      </ExternalLink>
    );
  }
  return (
    <a href={href} className={cls} data-placeholder={isPlaceholder(href) ? 'true' : undefined} {...rest}>
      {children}
    </a>
  );
}
