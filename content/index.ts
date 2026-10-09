import 'server-only';
import type { Locale } from '@/i18n/config';
import type { ProcessStepId, ProcessStepText, ProfileData, ProfileText, ProjectData, ProjectText, SiteText, SkillGroupData } from './schema';
import { profile } from './shared/profile';
import { projects } from './shared/projects';
import { skills } from './shared/skills';
import { processSteps } from './shared/process';
import { profileText as thProfile } from './locales/th/profile';
import { projectText as thProjects } from './locales/th/projects';
import { skillGroupLabels as thSkills } from './locales/th/skills';
import { processText as thProcess } from './locales/th/process';
import { siteText as thSite } from './locales/th/site';

const locales = {
  th: { profile: thProfile, projects: thProjects, skills: thSkills, process: thProcess, site: thSite },
} as const;

export type RenderedProject = ProjectData & { text: ProjectText };
export interface SiteContent {
  locale: Locale;
  site: SiteText;
  profile: ProfileData & ProfileText;
  projects: RenderedProject[];
  skills: Array<SkillGroupData & { label: string }>;
  process: Array<ProcessStepText & { id: ProcessStepId }>;
}

/** Merge shared + locale content, drop `permission: 'no'`, sort by order (ARCHITECTURE §4.2). */
export function getContent(locale: Locale): SiteContent {
  const l = locales[locale];
  const all: readonly ProjectData[] = projects;
  const visible = [...all]
    .filter((p) => p.permission !== 'no')
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ ...p, text: (l.projects as Record<string, ProjectText>)[p.id]! }));
  return {
    locale,
    site: l.site,
    profile: { ...profile, ...l.profile },
    projects: visible,
    skills: skills.map((g) => ({ ...g, label: l.skills[g.id] })),
    process: processSteps.map((id) => ({ id, ...l.process[id] })),
  };
}


export function getProject(locale: Locale, slug: string): RenderedProject | undefined {
  return getContent(locale).projects.find((p) => p.id === slug);
}
