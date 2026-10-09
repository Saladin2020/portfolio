import type { ProjectData } from '../schema';
import memoLanding from '@/assets/images/projects/memo/landing.png';
import p3Home from '@/assets/images/projects/p3/home.png';
import labDashboard from '@/assets/images/projects/labwise/dashboard.png';
import labIncidents from '@/assets/images/projects/labwise/incidents.png';
import labAnalysis from '@/assets/images/projects/labwise/analysis.png';
import scbDashboard from '@/assets/images/projects/signal-controlbridge/dashboard.png';
import scbChannel from '@/assets/images/projects/signal-controlbridge/channel.png';

/**
 * Locale-neutral project facts from the project fact sheet (observed facts only) plus the owner's
 * decisions (categories, live links only, LABWISE anonymised).
 * Repos are private → no source links. Images are derived copies (scripts/derive-images.mjs).
 * isClientWork stays false: whether any project is client work is still unconfirmed (Q-G4).
 */
export const projects = [
  {
    id: 'memo',
    order: 1,
    category: 'web',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Neon Postgres', 'Prisma', 'Auth.js', 'Stripe', 'PWA', 'Vercel Cron'],
    images: [{ key: 'landing', src: memoLanding }],
    links: { live: 'https://memo-beta-woad.vercel.app/' },
    permission: 'yes',
    isClientWork: false,
  },
  {
    id: 'p3',
    order: 2,
    category: 'app',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Neon Postgres', 'Drizzle ORM', 'PWA', 'Web Push', 'Recharts', 'Vercel Cron'],
    images: [{ key: 'home', src: p3Home }],
    links: { live: 'https://p3-eight-gamma.vercel.app/' },
    permission: 'yes',
    isClientWork: false,
  },
  {
    id: 'labwise',
    order: 3,
    category: 'program',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Neon Postgres', 'Drizzle ORM', 'Auth.js', 'Recharts', 'PWA', 'Vercel'],
    images: [
      { key: 'dashboard', src: labDashboard },
      { key: 'incidents', src: labIncidents },
      { key: 'analysis', src: labAnalysis },
    ],
    links: { live: 'https://labwise-pi.vercel.app/' },
    permission: 'anonymised', // PO: do not name the lab/organisation
    isClientWork: false,
  },
  {
    id: 'signal-controlbridge',
    order: 4,
    category: 'program',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Neon Postgres', 'Drizzle ORM', 'Auth.js', 'Telegram Bot API', 'TradingView webhooks', 'Recharts', 'Vercel'],
    images: [
      { key: 'dashboard', src: scbDashboard },
      { key: 'channel', src: scbChannel },
    ],
    links: { live: 'https://signal-controlbridge.vercel.app/' },
    permission: 'yes',
    isClientWork: false,
  },
] as const satisfies readonly ProjectData[];

export type ProjectId = (typeof projects)[number]['id'];
