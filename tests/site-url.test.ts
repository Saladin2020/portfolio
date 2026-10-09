import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, test } from 'node:test';
import { configuredSiteUrl, getSiteUrl } from '../lib/site';

const keys = ['NEXT_PUBLIC_SITE_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL', 'VERCEL_ENV'] as const;
const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));

function setEnv(values: Partial<Record<(typeof keys)[number], string | undefined>>) {
  for (const key of keys) {
    const value = values[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

afterEach(() => {
  for (const key of keys) {
    const value = saved[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('configuredSiteUrl', () => {
  test('prefers NEXT_PUBLIC_SITE_URL and strips a trailing slash', () => {
    setEnv({ NEXT_PUBLIC_SITE_URL: 'https://example.com/', VERCEL_PROJECT_PRODUCTION_URL: 'portfolio.vercel.app' });
    assert.equal(configuredSiteUrl(), 'https://example.com');
    assert.equal(getSiteUrl(), 'https://example.com');
  });

  test('falls back to https://VERCEL_PROJECT_PRODUCTION_URL', () => {
    setEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'portfolio.vercel.app/' });
    assert.equal(configuredSiteUrl(), 'https://portfolio.vercel.app');
    assert.equal(getSiteUrl(), 'https://portfolio.vercel.app');
  });

  test('accepts a host that already includes a scheme', () => {
    setEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'https://portfolio.vercel.app' });
    assert.equal(configuredSiteUrl(), 'https://portfolio.vercel.app');
  });

  test('is undefined when neither production source is set', () => {
    setEnv({});
    assert.equal(configuredSiteUrl(), undefined);
  });

  test('treats blank values as unset', () => {
    setEnv({ NEXT_PUBLIC_SITE_URL: '  ', VERCEL_PROJECT_PRODUCTION_URL: '' });
    assert.equal(configuredSiteUrl(), undefined);
  });
});

describe('getSiteUrl outside production', () => {
  test('uses the production host when Vercel provides it, else VERCEL_URL, else localhost', () => {
    setEnv({ VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'portfolio.vercel.app', VERCEL_URL: 'preview.vercel.app' });
    assert.equal(getSiteUrl(), 'https://portfolio.vercel.app');
    setEnv({ VERCEL_ENV: 'preview', VERCEL_URL: 'preview.vercel.app' });
    assert.equal(getSiteUrl(), 'https://preview.vercel.app');
    setEnv({});
    assert.equal(getSiteUrl(), 'http://localhost:3000');
  });

  test('throws in production when neither source is set', () => {
    setEnv({ VERCEL_ENV: 'production' });
    assert.throws(() => getSiteUrl(), /VERCEL_PROJECT_PRODUCTION_URL/);
  });
});

describe('validate:content production gate', () => {
  function run(extra: Record<string, string | undefined>) {
    const env: NodeJS.ProcessEnv = { ...process.env, VERCEL_ENV: 'production' };
    delete env.NEXT_PUBLIC_SITE_URL;
    delete env.VERCEL_PROJECT_PRODUCTION_URL;
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined) delete env[key];
      else env[key] = value;
    }
    try {
      const stdout = execFileSync(
        process.execPath,
        ['node_modules/tsx/dist/cli.mjs', '--require', './scripts/register-assets.cjs', 'scripts/validate-content.ts'],
        { env, encoding: 'utf8', cwd: process.cwd() },
      );
      return { ok: true, output: stdout };
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string };
      return { ok: false, output: `${err.stdout ?? ''}\n${err.stderr ?? ''}` };
    }
  }

  test('fails when neither site URL source is set', () => {
    const result = run({});
    assert.equal(result.ok, false);
    assert.match(result.output, /VERCEL_PROJECT_PRODUCTION_URL/);
  });

  test('passes with only VERCEL_PROJECT_PRODUCTION_URL', () => {
    const result = run({ VERCEL_PROJECT_PRODUCTION_URL: 'portfolio.vercel.app' });
    assert.equal(result.ok, true, result.output);
  });

  test('passes with only NEXT_PUBLIC_SITE_URL', () => {
    const result = run({ NEXT_PUBLIC_SITE_URL: 'https://example.com' });
    assert.equal(result.ok, true, result.output);
  });
});
