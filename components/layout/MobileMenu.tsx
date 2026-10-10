'use client';

import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { Menu, X } from 'lucide-react';

type Item = { id: string; label: string; href: string };
type Props = { items: Item[]; labels: { open: string; close: string; menu: string; nav: string } };

/**
 * Mobile/tablet menu (< 1030px). A modal <dialog> sheet: aria-expanded/aria-controls on the button,
 * focus moves to the first link, Esc / ✕ / choosing a link closes it and focus returns to the button
 * (AC-NAV-03, wireframes S-0).
 */
export function MobileMenu({ items, labels }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const sheetId = `mobile-menu-${id.replace(/:/g, '')}`;

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      // preventScroll: focusing the button must not yank the page after a section jump.
      buttonRef.current?.focus({ preventScroll: true });
    };
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  // Close if the viewport grows past the breakpoint while open.
  useEffect(() => {
    const mq = window.matchMedia('(width >= 1030px)'); // tokens-ignore: mirrors breakpoint.lg for JS
    const onChange = () => mq.matches && dialogRef.current?.open && close();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [close]);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Opening the sheet is a reader interaction: the font hash re-align must not run after it.
    (window as unknown as { __portfolioHashAlign?: { freeze: () => void } }).__portfolioHashAlign?.freeze();
    dialog.showModal();
    setOpen(true);
    dialog.querySelector<HTMLAnchorElement>('a')?.focus();
  };

  // The native fragment scroll is computed while this dialog (and its scroll lock)
  // is still open, then finishes short of the designed offset. Close first, then jump.
  const follow = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const jump = () => {
      const align = (window as unknown as { __portfolioHashAlign?: { programmatic: (fn: () => void) => void } }).__portfolioHashAlign;
      const go = () => {
        const el = document.getElementById(id);
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        el?.scrollIntoView({ block: 'start' });
        root.style.scrollBehavior = prev;
      };
      if (align) align.programmatic(go);
      else go();
      const hash = `#${id}`;
      if (window.location.hash !== hash) {
        const prev = window.history.state as { __NA?: boolean } | null;
        const base = prev && typeof prev === 'object' ? { ...prev } : {};
        window.history.pushState({ ...base, __NA: true }, '', hash);
      }
    };
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.addEventListener('close', () => requestAnimationFrame(() => requestAnimationFrame(jump)), { once: true });
      dialog.close();
    } else {
      jump();
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="hidden size-touch items-center justify-center rounded-full bg-light-action-primary-bg text-light-action-primary-text js:inline-flex"
        aria-expanded={open}
        aria-controls={sheetId}
        aria-label={open ? labels.close : labels.open}
        onClick={() => (open ? close() : openMenu())}
        data-nav="menu-button"
      >
        <Menu aria-hidden="true" className="size-4" />
      </button>
      <dialog
        ref={dialogRef}
        id={sheetId}
        aria-label={labels.nav}
        className="menu-sheet fixed inset-x-0 top-0 m-0 w-full max-w-full bg-transparent p-3 backdrop:bg-transparent"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="mx-auto max-w-nav rounded-panel border border-light-border-subtle bg-light-surface p-3 shadow-high">
          <div className="flex items-center justify-between pb-2">
            <span className="pl-2 type-label text-light-text-secondary">{labels.menu}</span>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="inline-flex size-touch items-center justify-center rounded-full border-2 border-light-action-secondary-border text-light-action-secondary-text"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={follow(item.id)}
                  data-nav-link={item.id}
                  className="flex min-h-touch items-center rounded-element px-3 type-lead text-light-text-heading no-underline hover:bg-light-muted aria-[current=true]:font-semibold"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
