#!/usr/bin/env node
// DEVOPS-006: summarize N Lighthouse JSON results (LHRs) into a markdown table + a sanitized JSON.
// usage: node perf-bench-summary.mjs <lhr-dir> <summary-json-out>
// Raw LHRs contain configSettings.extraHeaders and are never uploaded; this script copies out
// metrics only. Markdown goes to $GITHUB_STEP_SUMMARY when set, else stdout.
import { appendFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { join } from 'node:path';

const [dir, outJson] = process.argv.slice(2);
if (!dir || !outJson) { console.error('usage: perf-bench-summary.mjs <lhr-dir> <summary-json-out>'); process.exit(2); }

const files = readdirSync(dir).filter((f) => /^lhr-\d+\.json$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
if (files.length === 0) { console.log('::error::no Lighthouse results found'); process.exit(1); }

const num = (a) => (a && typeof a.numericValue === 'number' ? a.numericValue : null);
const runs = files.map((f, i) => {
  const lhr = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  const au = lhr.audits || {};
  const perf = lhr.categories?.performance?.score;
  return {
    run: i + 1,
    lighthouseVersion: lhr.lighthouseVersion ?? null,
    host: (() => { try { return new URL(lhr.finalDisplayedUrl || lhr.requestedUrl).hostname; } catch { return null; } })(),
    runtimeError: lhr.runtimeError?.code ?? null,
    performance: typeof perf === 'number' ? Math.round(perf * 100) : null,
    tbtMs: num(au['total-blocking-time']),
    lcpMs: num(au['largest-contentful-paint']),
    cls: num(au['cumulative-layout-shift']),
    benchmarkIndex: lhr.environment?.benchmarkIndex ?? null,
  };
});

const median = (xs) => {
  const v = xs.filter((x) => typeof x === 'number').sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};
const keys = ['performance', 'tbtMs', 'lcpMs', 'cls', 'benchmarkIndex'];
const med = Object.fromEntries(keys.map((k) => [k, median(runs.map((r) => r[k]))]));

const fmt = {
  performance: (x) => (x == null ? 'n/a' : String(Math.round(x))),
  tbtMs: (x) => (x == null ? 'n/a' : `${Math.round(x)} ms`),
  lcpMs: (x) => (x == null ? 'n/a' : `${Math.round(x)} ms`),
  cls: (x) => (x == null ? 'n/a' : x.toFixed(3)),
  benchmarkIndex: (x) => (x == null ? 'n/a' : String(Math.round(x))),
};
const versions = [...new Set(runs.map((r) => r.lighthouseVersion).filter(Boolean))];
const hosts = [...new Set(runs.map((r) => r.host).filter(Boolean))];
const cpu = cpus();
const runner = {
  os: process.env.RUNNER_OS || process.platform,
  arch: process.env.RUNNER_ARCH || process.arch,
  image: [process.env.ImageOS, process.env.ImageVersion].filter(Boolean).join(' ') || null,
  cpuModel: cpu[0]?.model ?? null,
  cpuCount: cpu.length,
};

const md = [
  '## Perf bench (Lighthouse lab, mobile defaults)',
  '',
  `- Lighthouse: ${versions.join(', ') || 'n/a'}`,
  `- Host: \`${hosts.join(', ') || 'n/a'}\``,
  `- Runs: ${runs.length}${runs.some((r) => r.runtimeError) ? ` (errors: ${runs.filter((r) => r.runtimeError).map((r) => `#${r.run} ${r.runtimeError}`).join(', ')})` : ''}`,
  `- Runner: ${runner.os}/${runner.arch}${runner.image ? `, image ${runner.image}` : ''}, ${runner.cpuCount}x ${runner.cpuModel ?? 'unknown CPU'}`,
  '',
  '| Run | Perf score | TBT | LCP | CLS | benchmarkIndex |',
  '| ---: | ---: | ---: | ---: | ---: | ---: |',
  ...runs.map((r) => `| ${r.run} | ${keys.map((k) => fmt[k](r[k])).join(' | ')} |`),
  `| **median** | ${keys.map((k) => `**${fmt[k](med[k])}**`).join(' | ')} |`,
  '',
  '_Median is per column (each metric independently)._',
  '',
].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
else process.stdout.write(md);

// Sanitized summary: an explicit allow-list of fields, nothing copied wholesale from the LHR.
const summary = {
  lighthouseVersions: versions,
  hosts,
  runner,
  runs: runs.map(({ run, runtimeError, performance, tbtMs, lcpMs, cls, benchmarkIndex }) =>
    ({ run, runtimeError, performance, tbtMs, lcpMs, cls, benchmarkIndex })),
  median: med,
};
writeFileSync(outJson, JSON.stringify(summary, null, 2) + '\n', { mode: 0o644 });

if (runs.every((r) => r.performance == null)) { console.log('::error::every Lighthouse run failed'); process.exit(1); }
