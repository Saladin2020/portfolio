import { getI18n } from '@/i18n/server';
import { getContent } from '@/content';
import { MobileMenu } from './MobileMenu';
import { ScrollSpy } from './ScrollSpy';
import { navHref, navItems } from './nav-items';
import { cx } from '@/components/ui/cx';

/** S-0 floating pill nav. Inline links at ≥ lg (1030px); menu button below (AC-NAV-03). */
export async function SiteNav({ onHome = true }: { onHome?: boolean }) {
  const { locale, m } = await getI18n();
  const { profile } = getContent(locale);
  const items = navItems(m);
  const name = profile.displayName ?? profile.fullName;
  return (
    <header className="sticky top-0 z-40 section-x pt-3">
      <nav
        aria-label={m.nav.label}
        className="nav-pill relative mx-auto flex min-h-nav-mobile max-w-nav items-center justify-between gap-3 rounded-full border border-light-border-subtle bg-light-surface py-1 pr-1 pl-3 shadow-low backdrop-blur-none sm:bg-light-surface/85 sm:backdrop-blur-md lg:min-h-nav-desktop lg:pl-4"
      >
        <a
          href={onHome ? '#top' : '/'}
          className="flex min-h-touch min-w-0 items-center gap-1-5 type-label text-light-text-heading no-underline"
          aria-label={`SB, ${name}, ${m.nav.homeSuffix}`}
        >
          <span aria-hidden="true" className="grid size-touch shrink-0 place-items-center rounded-full bg-light-action-primary-bg type-small font-semibold text-light-action-primary-text">
            SB
          </span>
          <span className="truncate max-sm:sr-only">{name}</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex" data-nav="inline">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={navHref(item.id, onHome)}
                data-nav-link={item.id}
                className={cx(
                  'inline-flex min-h-touch items-center rounded-full px-3 type-label no-underline',
                  item.id === 'contact'
                    ? 'motion-hover bg-light-action-primary-bg text-light-action-primary-text hover:shadow-med'
                    : 'text-light-text-primary underline-offset-8 hover:underline aria-[current=true]:underline aria-[current=true]:decoration-2',
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="lg:hidden">
          <MobileMenu
            items={items.map((i) => ({ ...i, href: navHref(i.id, onHome) }))}
            labels={{ open: m.nav.menuOpen, close: m.nav.menuClose, menu: m.nav.menu, nav: m.nav.label }}
          />
          {/* No-JS fallback: the menu button needs JS, so link to the footer section list instead. */}
          <a href="#site-sections" className="hidden min-h-touch items-center rounded-full px-3 type-label no-js:inline-flex">
            {m.nav.menu}
          </a>
        </div>
      </nav>
      {onHome && <ScrollSpy ids={items.map((i) => i.id)} />}
    </header>
  );
}
