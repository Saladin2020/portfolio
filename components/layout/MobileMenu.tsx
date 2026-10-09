'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
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
      buttonRef.current?.focus();
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
    dialog.showModal();
    setOpen(true);
    dialog.querySelector<HTMLAnchorElement>('a')?.focus();
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
                  onClick={close}
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
