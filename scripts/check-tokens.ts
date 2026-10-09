/**
 * Token misuse checks (ARCHITECTURE §1.4, items 3–5):
 *   3. no raw hex/rgb colours or arbitrary design-unit classes in app/ and components/
 *      (escape hatch: a `tokens-ignore: <reason>` comment on the same line)
 *   4. every var(--…) used in hand-written CSS/TSX exists in tokens.css, the theme, or is a known runtime var
 *   5. contrast pairs from accessibility-notes re-checked against the token file (AC-A11Y-05)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors: string[] = [];

function walk(dir: string, exts: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p, exts);
    return exts.some((x) => e.name.endsWith(x)) ? [p] : [];
  });
}

/* 3. raw values */
const sources = [...walk(path.join(root, 'app'), ['.ts', '.tsx']), ...walk(path.join(root, 'components'), ['.ts', '.tsx'])];
const rawPatterns: Array<[RegExp, string]> = [
  [/#[0-9a-fA-F]{3,8}\b(?![\w-]*\})/, 'raw hex colour'],
  [/\brgba?\(/, 'raw rgb() colour'],
  [/\b[\w:-]+-\[\d+(\.\d+)?(px|rem|em|ms|s)\]/, 'arbitrary design-unit class'],
  [/\b(duration|delay)-\[/, 'arbitrary duration class'],
  [/-\[#/, 'arbitrary colour class'],
];
for (const file of sources) {
  fs.readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (line.includes('tokens-ignore')) return;
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      for (const [re, what] of rawPatterns) if (re.test(line)) errors.push(`${path.relative(root, file)}:${i + 1}: ${what}: ${line.trim()}`);
    });
}

/* 4. dangling variables */
const generated = ['styles/generated/tokens.css', 'styles/generated/tailwind-theme.css'].map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const defined = new Set([...generated.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const handCss = fs.readFileSync(path.join(root, 'styles/globals.css'), 'utf8');
for (const m of handCss.matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]!);
const runtime = new Set([
  '--font-anuphan-thai',
  '--font-anuphan-latin',
  '--font-anuphan-heading-thai',
  '--font-anuphan-heading-latin',
]);
for (const file of ['styles/globals.css', ...sources.map((s) => path.relative(root, s))]) {
  const txt = fs.readFileSync(path.join(root, file), 'utf8');
  for (const m of txt.matchAll(/var\((--[\w-]+)/g)) {
    if (!defined.has(m[1]!) && !runtime.has(m[1]!)) errors.push(`${file}: var(${m[1]}) is not defined by any token`);
  }
}

/* 5. contrast pairs */
const tokens = JSON.parse(fs.readFileSync(path.join(root, 'design/design-tokens.json'), 'utf8'));
const get = (p: string): unknown => p.split('.').reduce<any>((n, k) => n?.[k], tokens); // eslint-disable-line @typescript-eslint/no-explicit-any
const hexOf = (p: string): { hex: string; alpha: number } => {
  let v = (get(p) as { $value: unknown }).$value;
  while (typeof v === 'string' && v.startsWith('{')) v = (get(v.slice(1, -1)) as { $value: unknown }).$value;
  const c = v as { hex: string; alpha?: number };
  return { hex: c.hex, alpha: c.alpha ?? 1 };
};
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lum = (c: number[]) => {
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const ratio = (fgPath: string, bgPath: string) => {
  const fg = hexOf(fgPath);
  const bg = rgb(hexOf(bgPath).hex);
  const f = rgb(fg.hex).map((v, i) => v * fg.alpha + bg[i]! * (1 - fg.alpha));
  const [a, b] = [lum(f), lum(bg)].sort((x, y) => y - x);
  return (a! + 0.05) / (b! + 0.05);
};
const pairs: Array<[string, string, number]> = [
  ['color.light.text.primary', 'color.light.bg', 4.5],
  ['color.light.text.heading', 'color.light.surface', 4.5],
  ['color.light.text.secondary', 'color.light.bg', 4.5],
  ['color.light.text.secondary', 'color.light.muted', 4.5],
  ['color.light.text.link', 'color.light.bg', 4.5],
  ['color.light.action.primary-text', 'color.light.action.primary-bg', 4.5],
  ['color.light.border.strong', 'color.light.surface', 3],
  ['color.light.focus-ring', 'color.light.bg', 3],
  ['color.dark.text.primary', 'color.dark.bg', 4.5],
  ['color.dark.text.secondary', 'color.dark.bg', 4.5],
  ['color.dark.text.secondary', 'color.dark.surface', 4.5],
  ['color.dark.text.muted', 'color.dark.bg', 4.5],
  ['color.dark.text.link', 'color.dark.bg', 4.5],
  ['color.dark.action.primary-text', 'color.dark.action.primary-bg', 4.5],
  ['color.dark.focus-ring', 'color.dark.bg', 3],
];
for (const [fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  if (r < min) errors.push(`contrast ${fg} on ${bg} = ${r.toFixed(2)}:1 < ${min}:1`);
}

if (errors.length) {
  console.error(`[check-tokens] FAILED:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(`[check-tokens] OK: ${sources.length} files free of raw design values, all var() refs defined, ${pairs.length} contrast pairs pass`);
