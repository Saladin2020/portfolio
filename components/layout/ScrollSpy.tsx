'use client';

import { useEffect } from 'react';

/** Marks the nav link of the section in view with aria-current="true" (wireframes S-0 note 4). */
export function ScrollSpy({ ids }: { ids: string[] }) {
  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const visible = new Map<string, boolean>();
    const apply = () => {
      const current = ids.find((id) => visible.get(id));
      document.querySelectorAll<HTMLAnchorElement>('a[data-nav-link]').forEach((a) => {
        if (a.dataset.navLink === current) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        apply();
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [ids]);
  return null;
}
