'use client';

import { useEffect } from 'react';

const DIALOG_PREFIX = 'project-dialog-';
const GUARD_FRAMES = 36;

type HashAlign = {
  programmatic: (fn: () => void) => void;
  freeze: () => void;
};

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
    // Card to refocus after a hash traversal focuses <body>. The traversal also
    // scrolls to the fragment; returnScroll is the viewport from before open.
    let pendingEl: HTMLElement | null = null;
    let returnScroll: number | null = null;
    // Captured in the click turn, before the dialog chunk import can yield.
    let queuedScroll = 0;
    let focusToken = 0;
    const wired = new WeakSet<HTMLDialogElement>();
    const opening = new Set<string>();

    const hashAlign = () => (window as unknown as { __portfolioHashAlign?: HashAlign }).__portfolioHashAlign;
    const dialogFor = (slug: string) => document.getElementById(DIALOG_PREFIX + slug) as HTMLDialogElement | null;
    type Hist = { __NA?: boolean; portfolioProject?: string };
    // App Router history entry for this document, without a dialog slug.
    // A same-document visit to /#work creates an entry whose state is null.
    // The following pushState then looks like a route change, and a deferred
    // restore can replaceState the URL back to /work/<slug> after history.back().
    let pageState: Hist | null = null;
    const snapshotPageState = () => {
      const s = window.history.state as Hist | null;
      if (!s?.__NA || s.portfolioProject) return;
      const rest = { ...s };
      delete rest.portfolioProject;
      pageState = rest;
    };
    const scrollToY = (y: number) => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const top = Math.max(0, Math.min(y, max));
      if (Math.abs(window.scrollY - top) <= 1) return;
      const go = () => {
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, top);
        root.style.scrollBehavior = prev;
      };
      const api = hashAlign();
      if (api) api.programmatic(go);
      else go();
    };
    const restoreRouterState = () => {
      snapshotPageState();
      const s = window.history.state as Hist | null;
      const { pathname, search, hash } = window.location;
      // Closing back onto /#work. replaceState during popstate cancels the
      // fragment scroll that would focus <body> and jump to the hash target.
      // Put the viewport back where it was when the dialog opened.
      if (hash && pendingEl) {
        const next = (s?.__NA ? s : pageState) ?? s;
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        if (next) window.history.replaceState(next, '', pathname + search + hash);
        if (returnScroll != null) window.scrollTo(0, returnScroll);
        root.style.scrollBehavior = prev;
        return;
      }
      if (s?.__NA || !pageState) return;
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      // replaceState during this popstate cancels the browser's fragment scroll.
      root.style.scrollBehavior = 'auto';
      window.history.replaceState(pageState, '', pathname + search + hash);
      const id = hash.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' });
      root.style.scrollBehavior = prev;
    };
    snapshotPageState();
    const stateSlug = (): string | null => {
      const s = window.history.state as Hist | null;
      return s?.portfolioProject ?? null;
    };

    // Esc / ✕ / Back land on /#work. Focus the card with preventScroll and
    // keep putting the saved scroll position back for the frames after
    // popstate, so a late fragment scroll cannot win.
    const placeCard = (token: number) => {
      const el = pendingEl;
      if (!el || token !== focusToken || openSlug) return;
      if (returnScroll != null) scrollToY(returnScroll);
      if (document.activeElement === el) return;
      const active = document.activeElement;
      if (
        active instanceof Element &&
        active !== document.body &&
        active !== document.documentElement &&
        !active.closest('dialog')
      ) {
        pendingEl = null;
        return;
      }
      el.focus({ preventScroll: true });
    };

    const focusWhenSettled = (el: HTMLElement | null) => {
      if (!el) return;
      pendingEl = el;
      const token = ++focusToken;
      let frame = 0;
      const step = () => {
        if (token !== focusToken || !pendingEl) return;
        frame += 1;
        placeCard(token);
        if (!pendingEl || token !== focusToken) return;
        if (frame >= GUARD_FRAMES) {
          pendingEl = null;
          return;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const onFocusIn = () => {
      if (!pendingEl || openSlug) return;
      const token = focusToken;
      requestAnimationFrame(() => placeCard(token));
    };

    const onScroll = () => {
      if (!pendingEl || returnScroll == null || openSlug) return;
      scrollToY(returnScroll);
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
        pendingEl = null;
        focusToken += 1;
        // A later font re-align must not scroll this page out from under the dialog.
        hashAlign()?.freeze();
        if (push) returnScroll = queuedScroll;
        openSlug = slug;
        dialog.showModal();
        dialog.querySelector<HTMLElement>(`#${CSS.escape(`dialog-${slug}-title`)}`)?.focus();
        if (push) {
          restoreRouterState();
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
      queuedScroll = window.scrollY;
      void open(slug, link, true).then(
        (opened) => {
          if (!opened && !dialogFor(slug)?.open) window.location.assign(link.href);
        },
        () => window.location.assign(link.href),
      );
    };

    const onPop = () => {
      const slug = stateSlug();
      // Back: arm the card before restoreRouterState so the fragment scroll
      // is cancelled and the saved scroll position is what sticks.
      if (openSlug && slug !== openSlug) {
        pendingEl = trigger ?? document.querySelector<HTMLElement>(`a[data-project-link="${CSS.escape(openSlug)}"]`);
      }
      restoreRouterState();
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
    document.addEventListener('focusin', onFocusIn);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  return null;
}
