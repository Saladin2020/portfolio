import { expect, test, type Page } from '@playwright/test';
import { scrollThrough, SLUGS } from './helpers';

/**
 * SECURITY_REVIEW F-04: the CSP must not break the page. Collects `securitypolicyviolation` events and
 * CSP console errors while loading pages, opening the dialog, and loading fonts and next/image images.
 */
async function watch(page: Page) {
  const violations: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && /Content Security Policy|Content-Security-Policy/i.test(m.text())) violations.push(`console: ${m.text()}`);
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      ((window as unknown as { __csp: string[] }).__csp ??= []).push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return async () => [...violations, ...(await page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []))];
}

test.describe('Content-Security-Policy (F-04)', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'w1440' && test.info().project.name !== 'w360', 'runs at the narrowest and widest widths');
  });

  test('security headers are sent', async ({ request }) => {
    const h = (await request.get('/')).headers();
    expect(h['content-security-policy']).toContain("default-src 'self'");
    expect(h['content-security-policy']).toContain("object-src 'none'");
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['cross-origin-opener-policy']).toBe('same-origin');
  });

  for (const path of ['/', ...SLUGS.map((s) => `/work/${s}`), '/does-not-exist']) {
    test(`no CSP violations on ${path}; fonts and images load`, async ({ page }) => {
      const collect = await watch(page);
      await page.goto(path);
      await scrollThrough(page);
      // The home layout applies Anuphan after load settles. The global 404 has no boot
      // script, so `html:not(.js)` uses the face immediately.
      await page.waitForFunction(
        () => document.documentElement.classList.contains('fonts-active') || !document.documentElement.classList.contains('js'),
        null,
        { timeout: 12_000 },
      );
      const state = await page.evaluate(async () => {
        await document.fonts.ready;
        const imgs = [...document.images].filter((i) => i.getClientRects().length > 0);
        return {
          anuphan: [...document.fonts].some((f) => /anuphan/i.test(f.family) && f.status === 'loaded'),
          broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc),
          optimised: imgs.filter((i) => i.currentSrc.includes('/_next/image')).length,
          hydrated: document.documentElement.classList.contains('js'),
        };
      });
      expect(state.anuphan, 'next/font Anuphan loaded').toBe(true);
      expect(state.broken, 'no broken images').toEqual([]);
      if (path === '/') expect(state.optimised).toBeGreaterThan(0);
      // The inline `html.js` toggle ran (proves inline scripts are allowed); the global 404 has no such script.
      if (path !== '/does-not-exist') expect(state.hydrated).toBe(true);
      expect(await collect()).toEqual([]);
    });
  }

  test('no CSP violations while using the dialog (client JS + history)', async ({ page }) => {
    const collect = await watch(page);
    await page.goto('/');
    const trigger = page.locator('a[data-project-link="labwise"]').first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(page.locator('#project-dialog-labwise')).toBeVisible();
    await expect(page).toHaveURL(/\/work\/labwise$/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#project-dialog-labwise')).toBeHidden();
    expect(await collect()).toEqual([]);
  });

  // Vercel Analytics / Speed Insights render only when VERCEL_ENV=production. Verify against such a
  // build with EXPECT_ANALYTICS=1. Off Vercel, /_vercel/* doesn't exist, so the two scripts are
  // stubbed with code that sends the same kind of same-origin beacons the real scripts send.
  test('Vercel Analytics + Speed Insights load and beacon without CSP violations', async ({ page }) => {
    test.skip(process.env.EXPECT_ANALYTICS !== '1', 'needs a VERCEL_ENV=production build');
    const requested: string[] = [];
    await page.route('**/_vercel/insights/script.js', (r) =>
      r.fulfill({ contentType: 'text/javascript', body: "navigator.sendBeacon('/_vercel/insights/view', '{}');" }),
    );
    await page.route('**/_vercel/speed-insights/script.js', (r) =>
      r.fulfill({ contentType: 'text/javascript', body: "fetch('/_vercel/speed-insights/vitals', { method: 'POST', body: '{}', keepalive: true });" }),
    );
    await page.route('**/_vercel/**/{view,vitals}', (r) => r.fulfill({ status: 200, body: 'ok' }));
    page.on('request', (r) => {
      if (r.url().includes('/_vercel/')) requested.push(new URL(r.url()).pathname);
    });
    const collect = await watch(page);
    await page.goto('/');
    await expect.poll(() => requested.sort()).toEqual(
      expect.arrayContaining(['/_vercel/insights/script.js', '/_vercel/insights/view', '/_vercel/speed-insights/script.js', '/_vercel/speed-insights/vitals']),
    );
    expect(await collect()).toEqual([]);
  });
});
