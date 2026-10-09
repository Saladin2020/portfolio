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
 * The sticky nav occupies the top ~68px below lg and ~80px at 1440, so the
 * heading sits in the band just under that pill.
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

        // Poll until scroll and font swap settle. The value is the heading's
        // distance from the viewport top.
        await expect
          .poll(
            async () => heading.evaluate((el) => Math.round(el.getBoundingClientRect().top)),
            { message: `#${id} @ ${viewport.width}×${viewport.height}`, timeout: 5_000 },
          )
          .toBe(expected);

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
});
