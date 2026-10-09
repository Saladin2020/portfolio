/**
 * Content types + zod schemas (ARCHITECTURE §4.2). Types are the compile-time contract; the zod schemas
 * are used only by scripts/validate-content.ts (build/CI), never shipped to the client.
 */
import { z } from 'zod';
import type { StaticImageData } from 'next/image';
import type { Placeholder } from './placeholder';

export type Url = `https://${string}`;
export type Text = string | Placeholder;

/** Inline rich text: plain strings, an emphasised keyword, or an English passage. */
export type RichTextSegment = string | { text: string; emphasis?: 'gradient' | 'strong'; lang?: 'en' };
export type RichText = ReadonlyArray<RichTextSegment>;

export const PROJECT_CATEGORIES = ['web', 'program', 'app'] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type Permission = 'yes' | 'anonymised' | 'no';
export const AVAILABILITY = ['freelance', 'full-time', 'both', 'not-available'] as const;
export type Availability = (typeof AVAILABILITY)[number];
export const PROCESS_STEP_IDS = ['idea', 'design', 'ai-build', 'test', 'deploy'] as const;
export type ProcessStepId = (typeof PROCESS_STEP_IDS)[number];
export const SKILL_GROUP_IDS = ['frameworks', 'data', 'integrations', 'ai-tools', 'devops'] as const;
export type SkillGroupId = (typeof SKILL_GROUP_IDS)[number];

/* ---------- locale-neutral ---------- */
export interface ProfileData {
  nameEn: Text; // C-02
  email: string; // C-20
  links: {
    github: Url; // C-21
    linkedin: Url; // C-22
    hire: ReadonlyArray<{ id: string; url: Url }>; // C-23
  };
  photo: StaticImageData; // C-04
  photoPublicPath: `/images/${string}`;
  resume?: { path: `/resume/${string}.pdf`; bytes: number }; // C-24 (omitted until the PDF exists → CTA hidden)
  availability?: Availability; // C-26
}

export interface ProjectData {
  id: string; // slug → /work/<id>
  order: number;
  category: ProjectCategory; // C-09
  tech: readonly string[]; // C-13
  images: ReadonlyArray<{ key: string; src: StaticImageData }>; // C-14
  links: { live?: Url; demo?: Url; source?: Url }; // C-15
  permission: Permission; // C-17
  /** false = not confirmed as client work (Q-G4 still open). */
  isClientWork: boolean;
}

/** A skill is listed only when at least one shown project evidences it. */
export interface SkillItem {
  name: string;
  projects: readonly string[]; // project ids that use it (per the project fact sheet)
}
export interface SkillGroupData {
  id: SkillGroupId;
  items: readonly SkillItem[]; // C-18
}

/* ---------- per-locale ---------- */
export interface ProfileText {
  fullName: Text; // C-01
  displayName?: Text; // C-03
  /** Short English positioning line next to the name (PRD "AI-native builder"). */
  positioning?: Text;
  headline: RichText; // C-05
  valueProp?: Text; // C-06 (hidden when absent)
  bio: Text; // C-07
  jobTitle: Text;
  roleCity?: Text; // C-28 (hidden when absent)
  photoAlt: Text;
  availabilityLabel: Record<Availability, Text>;
  /** Full availability sentence shown with the short badge. */
  availabilityDetail?: Text;
  rolePreferences?: readonly Text[]; // C-28
  hireLabels: Record<string, Text>; // short label per ProfileData.links.hire[].id
  /** Exact CTA text per hire id (client path, Contact, hero). */
  hireCta?: Record<string, Text>;
  /** Optional sentence under that CTA. */
  hireHelper?: Record<string, Text>;
}

export interface ProjectText {
  title: Text; // C-08
  problem: Text; // C-10
  solution: Text; // C-11
  role: Text; // C-16
  /** Short note shown next to the live link, e.g. that the app needs a login. */
  liveNote?: Text;
  /** Qualitative result line (label: ผลลัพธ์). Required for every shown project. */
  result: Text;
  imageAlt: Record<string, Text>;
}

export interface ProcessStepText {
  title: Text;
  description?: Text; // hidden when no source fact backs it
  qualityNote?: Text;
}

export interface SiteText {
  title: Text; // ≤ 60
  description: Text; // ≤ 160
  ogImageAlt: Text;
}

/* ---------- zod (validation only) ---------- */
const httpsUrl = z.string().regex(/^https:\/\/\S+$/, 'must be an https:// URL');
const richText = z.array(
  z.union([
    z.string(),
    z.object({ text: z.string().min(1), emphasis: z.enum(['gradient', 'strong']).optional(), lang: z.literal('en').optional() }),
  ]),
);
const image = z.object({ src: z.string(), width: z.number().positive(), height: z.number().positive() }).passthrough();

export const profileDataSchema = z.object({
  nameEn: z.string().min(1),
  email: z.string().email(),
  links: z.object({
    github: httpsUrl,
    linkedin: httpsUrl,
    hire: z.array(z.object({ id: z.string().min(1), url: httpsUrl })),
  }),
  photo: image,
  photoPublicPath: z.string().startsWith('/images/'),
  resume: z
    .object({ path: z.string().regex(/^\/resume\/[\w.-]+\.pdf$/), bytes: z.number().max(2 * 1024 * 1024 - 1, 'resume must be < 2 MB') })
    .optional(),
  availability: z.enum(AVAILABILITY).optional(),
});

export const projectDataSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be ASCII kebab-case'),
  order: z.number().int(),
  category: z.enum(PROJECT_CATEGORIES),
  tech: z.array(z.string().min(1)).min(1),
  images: z.array(z.object({ key: z.string().min(1), src: image })).min(1).max(3),
  links: z.object({ live: httpsUrl.optional(), demo: httpsUrl.optional(), source: httpsUrl.optional() }),
  permission: z.enum(['yes', 'anonymised', 'no']),
  isClientWork: z.boolean(),
});

export const skillGroupSchema = z.object({
  id: z.enum(SKILL_GROUP_IDS),
  items: z.array(z.object({ name: z.string().min(1), projects: z.array(z.string().min(1)).min(1, 'each skill needs ≥1 evidencing project') })).min(1),
});

export const projectTextSchema = z
  .object({
    title: z.string().min(1),
    problem: z.string().min(1),
    solution: z.string().min(1),
    role: z.string().min(1),
    liveNote: z.string().min(1).optional(),
    result: z.string().min(1),
    imageAlt: z.record(z.string(), z.string().min(1)),
  })
  .strict();

export const profileTextSchema = z.object({
  fullName: z.string().min(1),
  displayName: z.string().optional(),
  positioning: z.string().min(1).optional(),
  headline: richText.min(1),
  valueProp: z.string().min(1).optional(),
  bio: z.string().min(1),
  jobTitle: z.string().min(1),
  roleCity: z.string().min(1).optional(),
  photoAlt: z.string().min(1),
  availabilityLabel: z.record(z.enum(AVAILABILITY), z.string().min(1)),
  availabilityDetail: z.string().min(1).optional(),
  rolePreferences: z.array(z.string()).optional(),
  hireLabels: z.record(z.string(), z.string().min(1)),
  hireCta: z.record(z.string(), z.string().min(1)).optional(),
  hireHelper: z.record(z.string(), z.string().min(1)).optional(),
});

export const processTextSchema = z.record(
  z.enum(PROCESS_STEP_IDS),
  z.object({ title: z.string().min(1), description: z.string().min(1).optional(), qualityNote: z.string().min(1).optional() }),
);

export const siteTextSchema = z.object({
  title: z.string().min(1).max(60, 'title must be ≤ 60 characters (AC-SEO-01)'),
  description: z.string().min(1).max(160, 'description must be ≤ 160 characters (AC-SEO-01)'),
  ogImageAlt: z.string().min(1),
});
