'use client';

import { useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { cx } from '@/components/ui/cx';

type Filter = 'all' | 'web' | 'program' | 'app';
type Props = {
  options: Array<{ value: Filter; label: string; count: number }>;
  groupLabel: string;
  countLabels: Record<Filter, string>;
  children: ReactNode;
};

/**
 * Work filter (AC-WORK-02/03/04): aria-pressed buttons, "All" default, empty categories hidden,
 * polite live region with the result count. Cards stay server-rendered; filtering is a data attribute
 * + CSS, so no re-render or reload. Buttons only show when JS runs (no-JS: all projects visible).
 */
export function WorkFilter({ options, groupLabel, countLabels, children }: Props) {
  const [active, setActive] = useState<Filter>('all');
  const [announce, setAnnounce] = useState('');

  const select = (value: Filter) => {
    const update = () => {
      setActive(value);
      setAnnounce(countLabels[value]);
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'startViewTransition' in document) {
      document.startViewTransition(() => flushSync(update));
    } else {
      update();
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,4fr)] lg:gap-6">
      <div className="min-w-0">
        <div
          role="group"
          aria-label={groupLabel}
          className="hidden gap-1 overflow-x-auto pb-1 js:flex lg:flex-col lg:overflow-visible"
          data-work-filter
        >
          {options
            .filter((o) => o.value === 'all' || o.count > 0)
            .map((o) => {
              const pressed = active === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => select(o.value)}
                  data-cta="work_filter"
                  data-filter={o.value}
                  className={cx(
                    'inline-flex min-h-touch shrink-0 items-center rounded-full border-2 px-3 text-left whitespace-nowrap lg:rounded-element lg:border-0 lg:px-0',
                    pressed
                      ? 'border-light-action-primary-bg bg-light-action-primary-bg text-light-action-primary-text lg:bg-transparent lg:type-h3 lg:text-light-text-heading'
                      : 'border-light-border-strong text-light-text-secondary hover:text-light-text-primary lg:type-lead',
                  )}
                >
                  {o.label} ({o.count})
                </button>
              );
            })}
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {announce}
        </p>
      </div>
      <div data-active-filter={active} className="min-w-0 rounded-panel border border-light-border-subtle bg-light-surface p-2 shadow-panel sm:p-3 lg:p-4">
        {children}
      </div>
    </div>
  );
}
