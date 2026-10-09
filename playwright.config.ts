import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config (bypass handling hardened per security review F-08).
 *
 * - BASE_URL set → test that server (ci.yml starts `npm start`; preview-e2e.yml uses the Vercel URL). No webServer.
 * - BASE_URL unset → build output is served locally with `npm start` on :3000.
 * - Protected previews: VERCEL_AUTOMATION_BYPASS_SECRET + PW_BYPASS_STATE are set ONLY on the test step
 *   of preview-e2e.yml. tests/global-setup.ts exchanges the secret for a bypass cookie and writes it to
 *   PW_BYPASS_STATE (outside the workspace); tests load it via `storageState`.
 *   The secret is NEVER put in `extraHTTPHeaders` (F-08).
 * - In that "sensitive" mode, trace/video/screenshot are off and only list/github/junit reporters run,
 *   so no artifact can contain request headers or cookies. preview-e2e.yml also forces
 *   `--trace=off --reporter=...` on the command line.
 * Projects = the PRD test widths (AC-RESP-01). Axe specs are tagged @a11y.
 */
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

// F-08: no header injection; cookie state file instead.
const bypassState =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET && process.env.PW_BYPASS_STATE
    ? process.env.PW_BYPASS_STATE
    : undefined;
const sensitive = bypassState !== undefined;

// Preview only: ask Vercel not to inject its toolbar (vercel.live script), which our CSP blocks
// by design. Not a secret. The bypass itself stays cookie-based (above); never add it here.
const previewHeaders = sensitive ? { 'x-vercel-skip-toolbar': '1' } : undefined;

const widths = [
  { name: 'w360', width: 360, height: 640 },
  { name: 'w768', width: 768, height: 1024 },
  { name: 'w1024', width: 1024, height: 768 },
  { name: 'w1440', width: 1440, height: 900 },
];

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/global-setup.ts', // F-08: no-op unless on a protected preview
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // F-08: no HTML report (it embeds traces) when the bypass is in use.
  reporter: sensitive
    ? [['list'], ['github'], ['junit', { outputFile: 'pw-junit.xml' }]]
    : process.env.CI
      ? [['html', { open: 'never' }], ['github']]
      : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    // F-08: traces record request headers and cookies → off on previews.
    trace: sensitive ? 'off' : 'retain-on-failure',
    video: 'off',
    screenshot: sensitive ? 'off' : 'only-on-failure',
    ...(bypassState ? { storageState: bypassState } : {}),
    ...(previewHeaders ? { extraHTTPHeaders: previewHeaders } : {}),
  },
  projects: widths.map((w) => ({
    name: w.name,
    use: { ...devices['Desktop Chrome'], viewport: { width: w.width, height: w.height } },
  })),
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npm start', url: baseURL, reuseExistingServer: true, timeout: 120_000 },
});
