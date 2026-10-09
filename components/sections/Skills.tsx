import type { SiteContent } from '@/content';
import type { Messages } from '@/messages/th';
import { Section } from '@/components/layout/Section';
import { Chip } from '@/components/ui/Chip';

/** S-5 Skills: h3 + <ul> per group, plain text chips, no bars or percentages (AC-SKILL-01..03). */
export function Skills({ c, m }: { c: SiteContent; m: Messages }) {
  return (
    <Section id="skills" heading={m.skills.heading} intro={m.skills.intro} className="cv-defer">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {c.skills.map((g) => (
          <section key={g.id} aria-labelledby={`skills-${g.id}`} className="motion-reveal rounded-container border border-light-border-subtle bg-light-surface p-4">
            <h3 id={`skills-${g.id}`} className="type-h3 text-light-text-heading">
              {g.label}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1">
              {g.items.map((s) => (
                <li key={s.name}>
                  <Chip>{s.name}</Chip>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}
