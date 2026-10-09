import type { SiteContent } from '@/content';
import type { Messages } from '@/messages/th';
import { Section } from '@/components/layout/Section';
import { PathCards } from './PathCards';

/** S-2 Audience paths (right after the hero). */
export function AudiencePaths({ c, m }: { c: SiteContent; m: Messages }) {
  return (
    <Section id="paths" heading={m.paths.heading} intro={m.paths.intro} className="pt-0 lg:pt-0">
      <PathCards c={c} m={m} scene="light" location="paths" />
    </Section>
  );
}
