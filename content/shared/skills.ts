import type { SkillGroupData } from '../schema';
import type { ProjectId } from './projects';

/**
 * Only skills evidenced by the 4 shown projects (project fact sheet); `projects` lists which.
 * AI agents: PO decision "built all 4 projects solo using AI agents (Cursor/Claude)"; p3 and LABWISE
 * repos also contain AGENTS.md / CLAUDE.md (p3 also .cursor/). Text only, no levels (AC-SKILL-03).
 */
const ALL: readonly ProjectId[] = ['memo', 'p3', 'labwise', 'signal-controlbridge'];

export const skills = [
  {
    id: 'frameworks',
    items: [
      { name: 'Next.js', projects: ALL },
      { name: 'React', projects: ALL },
      { name: 'TypeScript', projects: ALL },
      { name: 'Tailwind CSS', projects: ALL },
    ],
  },
  {
    id: 'data',
    items: [
      { name: 'PostgreSQL (Neon)', projects: ALL },
      { name: 'Prisma', projects: ['memo'] },
      { name: 'Drizzle ORM', projects: ['p3', 'labwise', 'signal-controlbridge'] },
    ],
  },
  {
    id: 'integrations',
    items: [
      { name: 'Stripe', projects: ['memo'] },
      { name: 'Telegram Bot API', projects: ['signal-controlbridge'] },
      { name: 'TradingView webhooks', projects: ['signal-controlbridge'] },
      { name: 'PWA / Web Push', projects: ['memo', 'p3', 'labwise'] },
    ],
  },
  {
    id: 'ai-tools',
    items: [
      { name: 'AI agents: Cursor', projects: ALL },
      { name: 'AI agents: Claude', projects: ALL },
    ],
  },
  {
    id: 'devops',
    items: [
      { name: 'Vercel', projects: ALL },
      { name: 'Vercel Cron', projects: ['memo', 'p3'] },
    ],
  },
] as const satisfies readonly SkillGroupData[];
