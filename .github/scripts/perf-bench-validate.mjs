#!/usr/bin/env node
// DEVOPS-006: validate perf-bench inputs. Inputs arrive ONLY via env (never ${{ }} in scripts).
//   URL_INPUT   required, https only; host must be the production host or *-saladins-projects-00ede424.vercel.app
//   RUNS_INPUT  integer, default 5, clamped to 1..15
//   PROD_URL    production origin (vars.PROD_URL or fallback)
// Writes url/host/kind/runs to $GITHUB_OUTPUT when set, else prints them (local testing).
import { appendFileSync } from 'node:fs';

const PREVIEW_HOST = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?-saladins-projects-00ede424\.vercel\.app$/;

export function validate({ urlInput, runsInput, prodUrl }) {
  const raw = String(urlInput ?? '').trim();
  if (!raw) throw new Error('url is required');
  // Reject whitespace/control chars outright (the WHATWG parser would silently strip some of them).
  if (/[\s\u0000-\u001f\u007f]/.test(raw)) throw new Error('url contains whitespace/control characters');
  let u;
  try { u = new URL(raw); } catch { throw new Error('url is not a valid absolute URL'); }
  if (u.protocol !== 'https:') throw new Error('url must use https');
  if (u.username || u.password) throw new Error('url must not contain credentials');
  if (u.port) throw new Error('url must not set a port');
  const prodHost = new URL(prodUrl).hostname.toLowerCase();
  const host = u.hostname.toLowerCase();
  let kind;
  if (host === prodHost) kind = 'prod';
  else if (PREVIEW_HOST.test(host)) kind = 'preview';
  else throw new Error(`host not allowed (allowed: ${prodHost} or *-saladins-projects-00ede424.vercel.app)`);
  u.hash = '';

  const r = String(runsInput ?? '').trim() || '5';
  if (!/^\d{1,3}$/.test(r)) throw new Error('runs must be a whole number');
  const runs = Math.min(15, Math.max(1, Number(r)));
  return { url: u.href, host, kind, runs };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const out = validate({
      urlInput: process.env.URL_INPUT,
      runsInput: process.env.RUNS_INPUT,
      prodUrl: process.env.PROD_URL,
    });
    const lines = Object.entries(out).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines);
    else process.stdout.write(lines);
  } catch (e) {
    console.log(`::error title=perf-bench input::${e.message}`);
    process.exit(1);
  }
}
