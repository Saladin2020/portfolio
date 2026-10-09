'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from './cx';

type Props = {
  email: string;
  label: string;
  copiedLabel: string;
  fallbackLabel: string;
  /** id of the element holding the visible email text (selected in the fallback path). */
  targetId: string;
  scene?: 'light' | 'dark';
  toastMs: number;
};

/** Copy-email button (user-flows §3.2). The address is always visible as text; this only adds a shortcut. */
export function CopyEmailButton({ email, label, copiedLabel, fallbackLabel, targetId, scene = 'light', toastMs }: Props) {
  const [status, setStatus] = useState<'' | 'ok' | 'fallback'>('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!status) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setStatus('');
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [status]);

  const show = (s: 'ok' | 'fallback') => {
    setStatus(s);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(''), s === 'ok' ? toastMs : toastMs * 2);
  };

  const onClick = async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('no clipboard');
      await navigator.clipboard.writeText(email);
      show('ok');
    } catch {
      const el = document.getElementById(targetId);
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      show('fallback');
    }
  };

  return (
    <span className="relative inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label} ${email}`}
        data-cta="contact_copy_email"
        className={cx(
          'motion-hover inline-flex min-h-touch items-center justify-center rounded-full border-2 px-3 py-1 type-label',
          scene === 'light'
            ? 'border-light-action-secondary-border text-light-action-secondary-text hover:bg-light-muted'
            : 'border-dark-action-secondary-border text-dark-action-secondary-text hover:bg-dark-surface',
        )}
      >
        {label}
      </button>
      <span role="status" aria-live="polite" className={cx('type-small', scene === 'light' ? 'text-light-text-secondary' : 'text-dark-text-secondary')}>
        {status === 'ok' ? copiedLabel : status === 'fallback' ? fallbackLabel : ''}
      </span>
    </span>
  );
}
