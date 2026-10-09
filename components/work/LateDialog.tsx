'use client';

import { useEffect, useRef, useState, type ComponentType, type RefObject } from 'react';

/**
 * Evaluates ProjectDialogEnhancer on the first project-card click, not during
 * page load. The enhancer module, including focus restore, is imported as-is.
 * This capture listener holds that click until the enhancer's own listener is
 * attached, then replays it.
 */
export function LateDialog() {
  const [Enhancer, setEnhancer] = useState<ComponentType | null>(null);
  const queuedRef = useRef<HTMLAnchorElement[]>([]);
  const detachRef = useRef<(() => void) | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[data-project-link]');
      if (!(link instanceof HTMLAnchorElement)) return;
      event.preventDefault();
      queuedRef.current.push(link);
      if (loadingRef.current) return;
      loadingRef.current = true;
      void import('./ProjectDialogEnhancer').then((mod) => {
        setEnhancer(() => mod.ProjectDialogEnhancer);
      });
    };
    document.addEventListener('click', onClick, true);
    detachRef.current = () => document.removeEventListener('click', onClick, true);
    return () => detachRef.current?.();
  }, []);

  return Enhancer ? <Mounted Comp={Enhancer} queuedRef={queuedRef} detachRef={detachRef} /> : null;
}

function Mounted({
  Comp,
  queuedRef,
  detachRef,
}: {
  Comp: ComponentType;
  queuedRef: RefObject<HTMLAnchorElement[]>;
  detachRef: RefObject<(() => void) | null>;
}) {
  useEffect(() => {
    // Runs after the enhancer's effect, which attaches its own click listener.
    detachRef.current?.();
    detachRef.current = null;
    const links = queuedRef.current.splice(0);
    for (const link of links) {
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  }, [detachRef, queuedRef]);
  return <Comp />;
}
