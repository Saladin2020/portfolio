import { getI18n } from '@/i18n/server';
import { getContent } from '@/content';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { navHref, navItems } from './nav-items';

/** S-0 footer: email, GitHub, LinkedIn, hire links, © year + name (AC-NAV-04). */
export async function Footer({ onHome = true }: { onHome?: boolean }) {
  const { locale, m } = await getI18n();
  const { profile } = getContent(locale);
  const year = new Date().getFullYear();
  const linkCls = 'inline-flex min-h-touch items-center text-dark-text-secondary underline-offset-4 hover:underline hover:text-dark-text-primary';
  return (
    <footer className="scene-dark section-x border-t border-dark-surface bg-dark-bg pt-6 pb-8 text-dark-text-secondary">
      <div className="mx-auto flex max-w-content flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <nav aria-label={m.footer.contactNav}>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 type-small">
            <li>
              <a href={`mailto:${profile.email}`} className={linkCls}>
                {profile.email}
              </a>
            </li>
            <li>
              <ExternalLink href={profile.links.github} className={linkCls}>
                GitHub
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={profile.links.linkedin} className={linkCls}>
                LinkedIn
              </ExternalLink>
            </li>
            {profile.links.hire.map((h) => (
              <li key={h.id}>
                <ExternalLink href={h.url} className={linkCls}>
                  {(profile.hireLabels as Record<string, string>)[h.id] ?? h.id}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={m.footer.sectionsNav} id="site-sections">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 type-small">
            {navItems(m).map((i) => (
              <li key={i.id}>
                <a href={navHref(i.id, onHome)} className={linkCls}>
                  {i.label}
                </a>
              </li>
            ))}
            <li>
              <a href={onHome ? '#top' : '/'} className={linkCls}>
                {m.footer.backToTop}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-4 flex max-w-content flex-col gap-1 type-small text-dark-text-muted">
        <p>
          © {year} {profile.fullName}
        </p>
      </div>
    </footer>
  );
}
