import { X } from 'lucide-react';
import type { SiteContent } from '@/content';
import type { Messages } from '@/messages/th';
import { Section } from '@/components/layout/Section';
import { PROJECT_CATEGORIES } from '@/content/schema';
import { ProjectCard } from '@/components/work/ProjectCard';
import { ProjectDetail } from '@/components/work/ProjectDetail';
import { ProjectDialogEnhancer } from '@/components/work/ProjectDialogEnhancer';
import { WorkFilter } from '@/components/work/WorkFilter';

/** S-3 Featured work + S-3b detail dialogs (closed, not rendered until opened). */
export function Work({ c, m }: { c: SiteContent; m: Messages }) {
  const counts = Object.fromEntries(PROJECT_CATEGORIES.map((k) => [k, c.projects.filter((p) => p.category === k).length])) as Record<
    (typeof PROJECT_CATEGORIES)[number],
    number
  >;
  const total = c.projects.length;
  const options = [
    { value: 'all' as const, label: m.work.all, count: total },
    ...PROJECT_CATEGORIES.map((k) => ({ value: k, label: m.work.categories[k], count: counts[k] })),
  ];
  const countLabels = { all: m.work.count(total), web: m.work.count(counts.web), program: m.work.count(counts.program), app: m.work.count(counts.app) };

  return (
    <Section id="work" heading={m.work.heading} intro={m.work.intro}>
      <WorkFilter options={options} groupLabel={m.work.filterLabel} countLabels={countLabels}>
        {total === 0 ? (
          <p className="p-4 text-light-text-secondary">{m.work.empty}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:gap-4">
            {c.projects.map((p) => (
              <ProjectCard key={p.id} project={p} m={m} />
            ))}
          </ul>
        )}
      </WorkFilter>

      {c.projects.map((p) => (
        <dialog
          key={p.id}
          id={`project-dialog-${p.id}`}
          aria-labelledby={`dialog-${p.id}-title`}
          className="project-dialog w-full max-w-nav rounded-panel bg-light-surface p-0 text-light-text-primary shadow-high"
        >
          <div className="sticky top-0 z-10 flex justify-end border-b border-light-border-subtle bg-light-surface p-2">
            <form method="dialog">
              <button
                type="submit"
                aria-label={m.work.close}
                className="inline-flex size-touch items-center justify-center rounded-full border-2 border-light-action-secondary-border text-light-action-secondary-text hover:bg-light-muted"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </form>
          </div>
          <div className="p-4 lg:p-6">
            <ProjectDetail project={p} m={m} headingLevel="h2" idPrefix={`dialog-${p.id}`} />
          </div>
        </dialog>
      ))}
      <ProjectDialogEnhancer />
    </Section>
  );
}
