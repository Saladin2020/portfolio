'use client';

import { useEffect } from 'react';

const DIALOG_PREFIX = 'project-dialog-';

/**
 * Progressive enhancement for project cards (ARCHITECTURE §2.4):
 * a plain primary click on a[data-project-link] loads that project's dialog, opens it with showModal(),
 * pushes /work/<slug> to history, and moves focus to the dialog heading. Esc / ✕ / backdrop close it
 * and call history.back(); Back closes it; focus returns to the link that opened it.
 * Ctrl/Cmd/Shift/middle clicks and no-JS visitors get the real /work/<slug> page.
 * The dialog module is imported on the click so the home page does not parse four detail trees up front.
 */
export function ProjectDialogEnhancer() {
  useEffect(() => {
    let openSlug: string | null = null;
    let trigger: HTMLElement | null = null;
    let closingFromHistory = false;
    // Card to refocus once a hash traversal (back to /#work) has finished moving focus.
    let pendingEl: HTMLElement | null = null;
    let focusToken = 0;
    const wired = new WeakSet<HTMLDialogElement>();
    const opening = new Set<string>();

    const dialogFor = (slug: string) => document.getElementById(DIALOG_PREFIX + slug) as HTMLDialogElement | null;
    const stateSlug = (): string | null => {
      const s = window.history.state as { portfolioProject?: string } | null;
      return s?.portfolioProject ?? null;
    };

    // Esc / ✕ call history.back(). When the page underneath is /#work, that hash
    // traversal focuses <body> after the close task. Restore the card on the
    // following frame, and again from popstate/hashchange if the traversal lands later.
    const focusWhenSettled = (el: HTMLElement | null) => {
      if (!el) return;
      pendingEl = el;
      const token = ++focusToken;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (token !== focusToken || openSlug) return;
          el.focus();
          if (document.activeElement === el) pendingEl = null;
        });
      });
    };

    const onClose = (e: Event) => {
      const dialog = e.currentTarget as HTMLDialogElement;
      const slug = dialog.id.slice(DIALOG_PREFIX.length);
      if (openSlug !== slug) return;
      openSlug = null;
      const target = trigger ?? document.querySelector<HTMLElement>(`a[data-project-link="${CSS.escape(slug)}"]`);
      trigger = null;
      const fromHistory = closingFromHistory;
      closingFromHistory = false;
      // Arm before back() so a synchronous popstate/hashchange can re-schedule.
      if (!fromHistory && stateSlug() === slug) {
        pendingEl = target;
        window.history.back();
      }
      focusWhenSettled(target);
    };

    const onBackdrop = (e: MouseEvent) => {
      const dialog = e.currentTarget as HTMLDialogElement;
      if (e.target === dialog) dialog.close();
    };

    const wire = (dialog: HTMLDialogElement) => {
      if (wired.has(dialog)) return;
      wired.add(dialog);
      dialog.addEventListener('close', onClose);
      dialog.addEventListener('click', onBackdrop);
    };

    const open = async (slug: string, from: HTMLElement | null, push: boolean) => {
      if (opening.has(slug)) return false;
      opening.add(slug);
      try {
        const dialog = dialogFor(slug) ?? (await import('./ProjectDialogs')).ensureProjectDialog(slug);
        if (!dialog || dialog.open) return false;
        wire(dialog);
        trigger = from;
        openSlug = slug;
        dialog.showModal();
        dialog.querySelector<HTMLElement>(`#${CSS.escape(`dialog-${slug}-title`)}`)?.focus();
        if (push) {
          window.history.pushState({ ...(window.history.state ?? {}), portfolioProject: slug }, '', `/work/${slug}`);
        }
        return true;
      } finally {
        opening.delete(slug);
      }
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[data-project-link]');
      if (!link) return;
      const slug = link.dataset.projectLink;
      if (!slug) return;
      // Synchronous: the browser must not follow the href while the dialog chunk loads.
      e.preventDefault();
      void open(slug, link, true).then(
        (opened) => {
          if (!opened && !dialogFor(slug)?.open) window.location.assign(link.href);
        },
        () => window.location.assign(link.href),
      );
    };

    const onPop = () => {
      const slug = stateSlug();
      if (openSlug && slug !== openSlug) {
        closingFromHistory = true;
        dialogFor(openSlug)?.close();
      } else if (!openSlug && slug) {
        // Forward navigation back onto a dialog entry. Drop a pending card restore
        // so it cannot steal focus from the heading once the dialog is open.
        pendingEl = null;
        focusToken += 1;
        void open(slug, document.querySelector<HTMLElement>(`a[data-project-link="${CSS.escape(slug)}"]`), false);
        return;
      }
      if (pendingEl && !openSlug) focusWhenSettled(pendingEl);
    };

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  return null;
}
