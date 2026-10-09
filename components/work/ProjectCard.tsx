import Image from 'next/image';
import type { RenderedProject } from '@/content';
import type { Messages } from '@/messages/th';
import { Chip } from '@/components/ui/Chip';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { pillClass } from '@/components/ui/Pill';
import { ctaAttrs } from '@/lib/cta';

/** S-3 card. Title + "View details" are real links to /work/<slug>; JS upgrades them to the dialog. */
export function ProjectCard({ project, m }: { project: RenderedProject; m: Messages }) {
  const t = project.text;
  const href = `/work/${project.id}`;
  const img = project.images[0]!;
  return (
    <li data-category={project.category} className="motion-reveal">
      <article className="motion-hover flex h-full flex-col overflow-hidden rounded-container border border-light-border-subtle bg-light-surface hover:shadow-med">
        <Image
          src={img.src}
          alt={t.imageAlt[img.key] ?? ''}
          sizes="(width >= 1030px) 40vw, 100vw"
          className="aspect-16/10 h-auto w-full object-cover"
        />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Chip className="self-start">{m.work.categories[project.category]}</Chip>
          <h3 className="type-h3 text-light-text-heading">
            <a href={href} data-project-link={project.id} className="underline-offset-4 hover:underline" {...ctaAttrs('work_open_detail')}>
              {t.title}
            </a>
          </h3>
          <p className="text-light-text-secondary">
            <span className="font-medium text-light-text-primary">{m.work.problem}:</span> {t.problem}
          </p>
          <p className="text-light-text-secondary">
            <span className="font-medium text-light-text-primary">{m.work.role}:</span> {t.role}
          </p>
          <ul aria-label={m.work.tech} className="flex flex-wrap gap-1">
            {project.tech.map((x, i) => (
              <li key={i}>
                <Chip>{x}</Chip>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
            <a href={href} data-project-link={project.id} className={pillClass('secondary', 'light', 'min-h-touch')} {...ctaAttrs('work_open_detail')}>
              {m.work.viewDetails}
              <span className="sr-only">: {t.title}</span>
            </a>
            {project.links.live && (
              <ExternalLink href={project.links.live} className="inline-flex min-h-touch items-center type-label text-light-text-link underline-offset-4 hover:underline">
                {m.work.live}
                <span className="sr-only">: {t.title}</span>
                {t.liveNote && <span className="ml-1 type-small text-light-text-secondary">({t.liveNote})</span>}
              </ExternalLink>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}
