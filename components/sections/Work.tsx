import type { SiteContent } from '@/content';
import type { Messages } from '@/messages/th';
import { Section } from '@/components/layout/Section';
import { PROJECT_CATEGORIES } from '@/content/schema';
import { ProjectCard } from '@/components/work/ProjectCard';
import { LateDialog } from '@/components/work/LateDialog';
import { WorkFilter } from '@/components/work/WorkFilter';

/** S-3 Featured work. The filter shell and cards are server-rendered. The dialog island loads on click. */
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
      <LateDialog />
    </Section>
  );
}
