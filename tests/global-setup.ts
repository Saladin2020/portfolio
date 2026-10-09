/**
 * Playwright globalSetup (fixes security review F-08).
 *
 * Only active on protected Vercel previews (VERCEL_AUTOMATION_BYPASS_SECRET + PW_BYPASS_STATE set).
 * It performs ONE handshake outside any browser context or trace:
 *   GET <BASE_URL>/ with `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie: true`
 * Vercel answers with a Set-Cookie for the preview host. The resulting storage state (cookie only)
 * is written to PW_BYPASS_STATE, which must be OUTSIDE the workspace (e.g. $RUNNER_TEMP) and is
 * never uploaded. Tests then load it via `use.storageState`, so the secret itself is never placed
 * in `extraHTTPHeaders` and never reaches a browser context, trace, report or artifact.
 * Nothing here logs the secret or the cookie value; on GitHub Actions the cookie value is masked.
 */
import { request } from '@playwright/test';

export default async function globalSetup(): Promise<void> {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const statePath = process.env.PW_BYPASS_STATE;
  if (!secret || !statePath) return; // local runs and ci.yml (localhost): nothing to do

  const baseURL = process.env.BASE_URL;
  if (!baseURL) throw new Error('BASE_URL must be set when VERCEL_AUTOMATION_BYPASS_SECRET is set');

  const ctx = await request.newContext({ baseURL });
  try {
    const res = await ctx.get('/', {
      headers: { 'x-vercel-protection-bypass': secret, 'x-vercel-set-bypass-cookie': 'true' },
      // Don't follow redirects: they would re-send the secret header, and the cookie is already
      // stored from the first response (Vercel may answer 200 or a redirect).
      maxRedirects: 0,
    });
    // Status only; never print headers, URLs with query strings, or bodies.
    if (res.status() >= 400) throw new Error(`Protection bypass handshake failed: HTTP ${res.status()}`);

    const state = await ctx.storageState({ path: statePath });
    if (state.cookies.length === 0) throw new Error('Protection bypass handshake set no cookie');
    if (process.env.GITHUB_ACTIONS === 'true') {
      // Mask the derived cookie value(s) in case anything later prints them.
      for (const c of state.cookies) process.stdout.write(`::add-mask::${c.value}\n`);
    }
  } finally {
    await ctx.dispose();
  }
}
