import { expect, test } from '@playwright/test';
import { widthOf } from './helpers';

/**
 * REG-02: fresh-loading an in-page anchor must land the section heading just
 * below the sticky nav. `content-visibility: auto` plus oversized
 * `contain-intrinsic-size` placeholders made Chrome resolve the hash against
 * the placeholder, then jump the real (shorter) section above the viewport.
 *
 * Designed offset = scroll-padding-top + the section's padding-top
 * (e003abf, 45/45 OK): 148px below the lg breakpoint, 192px at ≥ 1030px.
 * The sticky nav fills the top ~68px below lg and ~80px at 1440, so the
 * heading has to land on that offset, under the pill. A 0–80px cap would
 * accept a heading covered by the nav.
 */
const ANCHORS = ['work', 'process', 'skills', 'about', 'contact'] as const;

const VIEWPORTS = [
  { width: 360, height: 640 },
  { width: 768, height: 900 },
  { width: 1029, height: 900 },
  { width: 1440, height: 900 },
] as const;

const expectedHeadingTop = (width: number) => (width >= 1030 ? 192 : 148);

test.describe('fresh-load in-page anchors (REG-02, AC-NAV-02)', () => {
  test('each nav anchor lands the heading on its designed offset', async ({ page }, testInfo) => {
    test.skip(widthOf(testInfo) !== 1440, 'viewports are set inside this test');

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const expected = expectedHeadingTop(viewport.width);

      for (const id of ANCHORS) {
        await page.goto(`/#${id}`, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);

        const heading = page.locator(`#${id}-heading`);
        await expect(heading).toBeVisible();

        // Poll until the font swap and the hash re-align settle. The value is
        // how far the heading sits from the designed offset.
        await expect
          .poll(
            async () => heading.evaluate((el, exp) => Math.abs(Math.round(el.getBoundingClientRect().top) - exp), expected),
            { message: `#${id} @ ${viewport.width}×${viewport.height} expected top ${expected}px`, timeout: 5_000 },
          )
          .toBeLessThanOrEqual(4);

        const box = await heading.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom };
        });
        const navBottom = await page.locator('nav.nav-pill').evaluate((el) => el.getBoundingClientRect().bottom);
        // On screen, below the sticky nav, and inside this viewport.
        expect(box.top, `#${id} is not above the viewport`).toBeGreaterThanOrEqual(0);
        expect(box.top, `#${id} clears the sticky nav`).toBeGreaterThanOrEqual(navBottom - 1);
        expect(box.bottom, `#${id} is inside the viewport`).toBeLessThanOrEqual(viewport.height);
        const hidden = await page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).contentVisibility);
        expect(hidden, `#${id} is laid out, not content-visibility:auto`).toBe('visible');
      }
    }
  });

  test('a scripted scroll during font load is not pulled back to the hash', async ({ page }, testInfo) => {
    test.skip(widthOf(testInfo) !== 1440, 'font-load scroll is independent of viewport');
    const client = await page.context().newCDPSession(page);
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await page.route('**/*.woff2', async (route) => {
      await new Promise((r) => setTimeout(r, 1200));
      await route.continue();
    });
    await page.goto('/#about', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    // Move away from the anchor with an instant scroll. scroll-behavior:smooth would
    // keep animating after we sample scrollY and look like a snap-back.
    const scrolled = await page.evaluate(() => {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      const before = window.scrollY;
      window.scrollTo(0, Math.max(0, before - 360));
      const after = window.scrollY;
      root.style.scrollBehavior = prev;
      return { before, after };
    });
    expect(scrolled.before - scrolled.after).toBeGreaterThan(40);
    await page.evaluate(() => document.fonts.ready);
    // Past the post-font align. A late loadingdone used to jump back to the hash.
    // Font swap can still anchor the viewport by a few dozen pixels; that is not a snap-back.
    await page.waitForTimeout(800);
    const top = await page.locator('#about-heading').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    expect(top, 'scripted scroll was pulled back to the #about offset').toBeGreaterThan(192 + 120);
    await client.detach();
  });
});
