/**
 * Content validation + placeholder gate (ARCHITECTURE §4.5). Runs in `prebuild` and CI.
 *   - Always: zod schemas, lengths, alt text per image, slug format, 3–6 rendered projects, qualityNote rule.
 *   - Local/preview: placeholders are listed as warnings (a live content checklist).
 *   - Production (VERCEL_ENV=production): any placeholder, a missing site URL
 *     (NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL), or a resume ≥ 2 MB fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { profile } from '../content/shared/profile';
import { projects as projectsConst } from '../content/shared/projects';
import type { ProjectData, ProjectText } from '../content/schema';
import { skills } from '../content/shared/skills';
import { profileText } from '../content/locales/th/profile';
import { projectText as projectTextConst } from '../content/locales/th/projects';

const projects: readonly ProjectData[] = projectsConst;
const projectText = projectTextConst as Record<string, ProjectText>;
import { processText } from '../content/locales/th/process';
import { siteText } from '../content/locales/th/site';
import { th } from '../messages/th';
import {
  processTextSchema,
  profileDataSchema,
  profileTextSchema,
  projectDataSchema,
  projectTextSchema,
  siteTextSchema,
  skillGroupSchema,
} from '../content/schema';
import { isPlaceholder } from '../content/placeholder';
import { configuredSiteUrl } from '../lib/site';

const isProd = process.env.VERCEL_ENV === 'production';
const errors: string[] = [];
const placeholders = new Map<string, number>();

function check(label: string, schema: { safeParse: (v: unknown) => { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } } }, value: unknown) {
  const r = schema.safeParse(value);
  if (!r.success) for (const i of r.error!.issues) errors.push(`${label}${i.path.length ? '.' + i.path.map(String).join('.') : ''}: ${i.message}`);
}

function scan(label: string, value: unknown): void {
  if (typeof value === 'string') {
    if (isPlaceholder(value)) {
      const id = value.match(/C-\d+(?:\/C-\d+)?/)?.[0] ?? label;
      placeholders.set(id, (placeholders.get(id) ?? 0) + 1);
    }
  } else if (Array.isArray(value)) value.forEach((v, i) => scan(`${label}[${i}]`, v));
  else if (value && typeof value === 'object' && !('src' in value && 'width' in value)) {
    for (const [k, v] of Object.entries(value)) scan(`${label}.${k}`, v);
  }
}

check('shared/profile', profileDataSchema, profile);
check('th/profile', profileTextSchema, profileText);
const hireLabels = profileText.hireLabels as Record<string, string>;
for (const h of profile.links.hire) {
  if (!hireLabels[h.id]?.trim()) errors.push(`th/profile.hireLabels.${h.id}: missing label`);
}
if (profile.availability && !profileText.availabilityDetail?.trim()) {
  errors.push('th/profile.availabilityDetail: required when availability is set');
}
check('th/process', processTextSchema, processText);
check('th/site', siteTextSchema, siteText);

const rendered = projects.filter((p) => p.permission !== 'no');
if (rendered.length < 3 || rendered.length > 6) errors.push(`projects: ${rendered.length} rendered, need 3–6 (AC-WORK-01)`);
const seen = new Set<string>();
for (const p of projects) {
  check(`shared/projects[${p.id}]`, projectDataSchema, p);
  if (seen.has(p.id)) errors.push(`projects: duplicate slug ${p.id}`);
  seen.add(p.id);
  const t = projectText[p.id];
  if (!t) {
    errors.push(`th/projects: missing text for ${p.id}`);
    continue;
  }
  check(`th/projects[${p.id}]`, projectTextSchema, t);
  if (p.permission !== 'no' && !t.result?.trim()) errors.push(`th/projects[${p.id}].result: every shown project needs a result`);
  for (const img of p.images) if (!t.imageAlt[img.key]) errors.push(`th/projects[${p.id}].imageAlt.${img.key}: missing alt (AC-WORK-08)`);
  if (p.links.source) errors.push(`projects[${p.id}].links.source: repos are private, live links only (PO decision Q-G1)`);
}
if (!processText['ai-build'].qualityNote && !processText.test.qualityNote) errors.push('th/process: qualityNote required on ai-build or test (AC-PROC-02)');
for (const g of skills) {
  check(`skills.${g.id}`, skillGroupSchema, g);
  for (const item of g.items)
    for (const id of item.projects) if (!seen.has(id)) errors.push(`skills.${g.id}.${item.name}: unknown project "${id}" (skills must be evidenced by a shown project)`);
}

const resume = (profile as { resume?: { path: string; bytes: number } }).resume;
if (resume) {
  const file = path.join(process.cwd(), 'public', resume.path);
  if (!fs.existsSync(file)) errors.push(`resume: ${resume.path} not found in public/`);
  else if (fs.statSync(file).size >= 2 * 1024 * 1024) errors.push('resume: must be < 2 MB (AC-CON-04)');
}

scan('profile', profile);
scan('profileText', profileText);
scan('projects', projects);
scan('projectText', projectText);
scan('skills', skills);
scan('process', processText);
scan('site', siteText);
scan('messages', th);

const total = [...placeholders.values()].reduce((a, b) => a + b, 0);
const placeholderSummary = `${total} placeholder value(s)`;
if (placeholders.size) {
  const list = [...placeholders.entries()].sort().map(([id, n]) => `${id}×${n}`).join(', ');
  const msg = `${total} placeholder value(s) remain (content checklist): ${list}`;
  if (isProd) errors.push(msg);
  else console.warn(`[validate-content] WARN ${msg}`);
}
if (!resume) console.log('[validate-content] note: resume (C-24) not configured, so the resume CTA is hidden');
if (isProd && !configuredSiteUrl()) {
  errors.push(
    'Site URL is required for production builds: set NEXT_PUBLIC_SITE_URL or deploy on Vercel (VERCEL_PROJECT_PRODUCTION_URL) (C-25)',
  );
}

if (errors.length) {
  console.error(`[validate-content] FAILED (${isProd ? 'production' : 'preview/local'}):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(
  `[validate-content] OK: ${rendered.length} projects, ${skills.length} skill groups, ${placeholderSummary}, schema/length/alt checks passed (${isProd ? 'production' : 'preview/local'} mode)`,
);
