/**
 * Fails if any app route is not prerendered (ARCHITECTURE §2.1: "○ Static" / "● SSG" only, no "ƒ"),
 * or if the prerendered /work pages and the sitemap don't match the shown projects in content/.
 * Reads .next/prerender-manifest.json, .next/app-path-routes-manifest.json and the built sitemap.
 */
import fs from 'node:fs';
import path from 'node:path';
import { LOCALES, localePath } from '../i18n/config';
import { projects } from '../content/shared/projects';

const dir = path.join(process.cwd(), '.next');
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
if (!fs.existsSync(path.join(dir, 'prerender-manifest.json'))) {
  console.error('[assert-static] .next/prerender-manifest.json missing: run `npm run build` first');
  process.exit(1);
}
const prerender = read('prerender-manifest.json') as { routes: Record<string, unknown>; dynamicRoutes: Record<string, { fallback: unknown }> };
const appPaths = read('app-path-routes-manifest.json') as Record<string, string>;

const staticRoutes = new Set(Object.keys(prerender.routes));
const dynamicPatterns = prerender.dynamicRoutes ?? {};
const problems: string[] = [];

for (const [entry, route] of Object.entries(appPaths)) {
  if (route.startsWith('/_')) continue; // internal (/_not-found, /_global-error)
  const isMetadataStatic = /\.(svg|png|ico|txt|xml|webmanifest)$|\/(sitemap|robots|manifest)/.test(route);
  if (staticRoutes.has(route)) continue;
  const pattern = dynamicPatterns[route];
  if (pattern) {
    if (pattern.fallback !== false) problems.push(`${route}: dynamicParams must be false (fallback=${String(pattern.fallback)})`);
    continue;
  }
  if (isMetadataStatic && entry.endsWith('/route')) {
    // Static metadata files are emitted as static assets; generated ones must be prerendered.
    if (!staticRoutes.has(route)) problems.push(`${route}: metadata route is not prerendered`);
    continue;
  }
  problems.push(`${route}: not prerendered (dynamic "ƒ")`);
}

// Every shown project has exactly one prerendered /work page per locale, and nothing else does.
const shown = (projects as ReadonlyArray<{ id: string; permission: string }>).filter((p) => p.permission !== 'no').map((p) => p.id);
for (const locale of LOCALES) {
  const expected = new Set(shown.map((id) => `/${locale}/work/${id}`));
  const actual = new Set([...staticRoutes].filter((r) => r.startsWith(`/${locale}/work/`)));
  for (const r of expected) if (!actual.has(r)) problems.push(`${r}: expected project page is not prerendered`);
  for (const r of actual) if (!expected.has(r)) problems.push(`${r}: prerendered but not a shown project`);
}
const sitemapFile = path.join(dir, 'server/app/sitemap.xml.body');
if (!fs.existsSync(sitemapFile)) problems.push('sitemap.xml was not prerendered');
else {
  const locs = [...fs.readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
  const want = ['/', ...LOCALES.flatMap((l) => shown.map((id) => localePath(l, `/work/${id}`)))];
  const missing = want.filter((w) => !locs.includes(w));
  const extra = locs.filter((l) => !want.includes(l));
  if (missing.length || extra.length) problems.push(`sitemap mismatch: missing [${missing.join(', ')}], extra [${extra.join(', ')}]`);
}

const prerendered = [...staticRoutes].filter((r) => !r.startsWith('/_')).sort();
if (problems.length) {
  console.error(`[assert-static] FAILED:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`[assert-static] OK: all ${prerendered.length} routes prerendered: ${prerendered.join(', ')}`);
console.log(`[assert-static] OK: ${shown.length} project pages + sitemap match content (${shown.join(', ')})`);
