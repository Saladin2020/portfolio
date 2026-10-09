import Image from 'next/image';
import type { RenderedProject } from '@/content';
import type { Messages } from '@/messages/th';
import { Chip } from '@/components/ui/Chip';
import { PillLink } from '@/components/ui/Pill';
import { ctaAttrs } from '@/lib/cta';

type Props = {
  project: RenderedProject;
  m: Messages;
  /** h1 on /work/<slug>, h2 inside the home-page dialog (keeps exactly one h1 on `/`). */
  headingLevel: 'h1' | 'h2';
  idPrefix: string;
};

/** Project detail body, shared by the static page and the dialog (ARCHITECTURE §2.4). */
export function ProjectDetail({ project, m, headingLevel, idPrefix }: Props) {
  const t = project.text;
  const Title = headingLevel;
  const Sub = headingLevel === 'h1' ? 'h2' : 'h3';
  const subCls = 'type-h3 text-light-text-heading';
  type LinkItem = { kind: 'live' | 'demo' | 'source'; href: string; label: string };
  const links: LinkItem[] = [];
  if (project.links.live) links.push({ kind: 'live', href: project.links.live, label: m.work.live });
  if (project.links.demo) links.push({ kind: 'demo', href: project.links.demo, label: m.work.demo });
  if (project.links.source) links.push({ kind: 'source', href: project.links.source, label: m.work.source });

  return (
    <article aria-labelledby={`${idPrefix}-title`} className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <Chip className="self-start">{m.work.categories[project.category]}</Chip>
        <Title id={`${idPrefix}-title`} tabIndex={-1} className={headingLevel === 'h1' ? 'type-h2 text-light-text-heading' : 'type-feature-title text-light-text-heading'}>
          {t.title}
        </Title>
      </header>

      <ul aria-label={m.work.gallery} className="grid gap-2">
        {project.images.map((img) => (
          <li key={img.key}>
            <Image
              src={img.src}
              alt={t.imageAlt[img.key] ?? ''}
              sizes="(width >= 1030px) 900px, 100vw"
              loading="lazy"
              className="h-auto w-full rounded-element border border-light-border-subtle"
            />
          </li>
        ))}
      </ul>

      <div className="grid gap-4 md:grid-cols-2">
        <section>
          <Sub className={subCls}>{m.work.problem}</Sub>
          <p className="mt-1">{t.problem}</p>
        </section>
        <section>
          <Sub className={subCls}>{m.work.solution}</Sub>
          <p className="mt-1">{t.solution}</p>
        </section>
      </div>

      <dl className="grid gap-3 md:grid-cols-2">
        <div>
          <dt className="type-label text-light-text-secondary">{m.work.role}</dt>
          <dd className="mt-0-5">{t.role}</dd>
        </div>
        <div>
          <dt className="type-label text-light-text-secondary">{m.work.tech}</dt>
          <dd className="mt-1">
            <ul className="flex flex-wrap gap-1">
              {project.tech.map((x, i) => (
                <li key={i}>
                  <Chip>{x}</Chip>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      {links.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {links.map((l, i) => (
            <PillLink key={l.kind} href={l.href} external variant={i === 0 ? 'primary' : 'secondary'} {...ctaAttrs('project_link', 'detail')} data-link-kind={l.kind}>
              {l.label}
            </PillLink>
          ))}
          {t.liveNote && <span className="type-small text-light-text-secondary">({t.liveNote})</span>}
        </div>
      )}
    </article>
  );
}
