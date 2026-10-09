#!/usr/bin/env node
/**
 * Token pipeline wrapper.
 *   npm run tokens             → tz build (Terrazzo) → styles/generated/{tokens.css,tailwind-theme.css}
 *   npm run tokens -- --check  → tz check + rebuild and fail on drift + scripts/check-tokens.ts
 *   npm run tokens:sync        → copy UX's working file ../design/design-tokens.json into ./design, then build
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const tz = (...a) =>
  execFileSync(process.execPath, [path.join(root, 'node_modules/@terrazzo/cli/bin/cli.js'), ...a, '-c', 'terrazzo.config.mjs'], {
    cwd: root,
    stdio: 'inherit',
  });
const genDir = path.join(root, 'styles/generated');
const snapshot = () =>
  Object.fromEntries(
    (fs.existsSync(genDir) ? fs.readdirSync(genDir) : []).map((f) => [f, fs.readFileSync(path.join(genDir, f), 'utf8')]),
  );

if (args.has('--sync')) {
  const src = path.resolve(root, process.env.UX_TOKENS_PATH ?? '../design/design-tokens.json');
  if (!fs.existsSync(src)) {
    console.error(`[tokens] UX working copy not found: ${src}`);
    process.exit(1);
  }
  fs.mkdirSync(path.join(root, 'design'), { recursive: true });
  // Copy verbatim except for one metadata sentence: UX's top-level $description names the private
  // reference brief it was derived from, which must not appear in the public repo (security review
  // F-11). Token values are untouched, so the generated CSS is identical.
  let json = fs.readFileSync(src, 'utf8');
  json = json.replace(/("\$description": ")([^"]*)"/, (_, k, d) => `${k}${d.replace(/\s*\((?:UX|PM|FE|DEVOPS)-\d+\)/g, '').replace(/\s*Values derived from \S+ \([^)]*\)\.\s*/i, ' ').trim()}"`);
  if (/fastwork/i.test(json)) {
    console.error('[tokens] the token file references third-party reference material; remove it before syncing');
    process.exit(1);
  }
  fs.writeFileSync(path.join(root, 'design/design-tokens.json'), json);
  console.log(`[tokens] synced ${path.relative(root, src)} → design/design-tokens.json (reference-brief note stripped)`);
}

if (args.has('--check')) {
  tz('check', process.env.TOKENS_PATH ?? './design/design-tokens.json');
  const before = snapshot();
  tz('build', '--quiet');
  const after = snapshot();
  const drift = Object.keys({ ...before, ...after }).filter((f) => before[f] !== after[f]);
  if (drift.length) {
    for (const [f, c] of Object.entries(before)) fs.writeFileSync(path.join(genDir, f), c); // restore committed output
    console.error(`[tokens] DRIFT in styles/generated/: ${drift.join(', ')}. Run \`npm run tokens\` and commit.`);
    process.exit(1);
  }
  console.log('[tokens] no drift: styles/generated/ matches design/design-tokens.json');
  execFileSync(process.execPath, [path.join(root, 'node_modules/tsx/dist/cli.mjs'), 'scripts/check-tokens.ts'], {
    cwd: root,
    stdio: 'inherit',
  });
} else {
  tz('build');
}
