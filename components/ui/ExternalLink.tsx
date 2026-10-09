import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { isPlaceholder } from '@/content/placeholder';
import { th } from '@/messages/th';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> & {
  href: string;
  children: ReactNode;
  /** Visually hidden "(opens in a new tab)" text (AC-PATH-04). */
  hint?: string;
  showArrow?: boolean;
};

/** External link: new tab, rel="noopener noreferrer", SR hint, ↗ marker (AC-PATH-04). */
export function ExternalLink({ href, children, hint = th.externalHint, showArrow = true, ...rest }: Props) {
  const placeholder = isPlaceholder(href);
  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-placeholder={placeholder ? 'true' : undefined}
      title={placeholder ? '[PLACEHOLDER] ลิงก์ตัวอย่าง รอ URL จริง' : rest.title}
    >
      {children}
      {showArrow && <span aria-hidden="true"> ↗</span>}
      <span className="sr-only"> {hint}</span>
    </a>
  );
}
