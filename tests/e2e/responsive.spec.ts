import { expect, test } from '@playwright/test';
import { LG, noHorizontalScroll, scrollThrough, widthOf, SLUGS } from './helpers';

test.describe('responsive (AC-RESP-01, AC-NAV-03, AC-HERO-03)', () => {
  for (const path of ['/', ...SLUGS.map((s) => `/work/${s}`)]) {
    test(`no horizontal scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      await scrollThrough(page);
      const r = await noHorizontalScroll(page);
      test.info().annotations.push({ type: 'scroll', description: `${path} scrollWidth=${r.scrollWidth} innerWidth=${r.innerWidth}` });
      expect(r.scrollWidth).toBeLessThanOrEqual(r.innerWidth);
    });
  }

  test('nav collapses below 1030px and is inline at ≥ 1030px', async ({ page }, testInfo) => {
    await page.goto('/');
    const menuButton = page.locator('[data-nav="menu-button"]');
    const inline = page.locator('[data-nav="inline"]');
    if (widthOf(testInfo) < LG) {
      await expect(menuButton).toBeVisible();
      await expect(inline).toBeHidden();
    } else {
      await expect(menuButton).toBeHidden();
      await expect(inline).toBeVisible();
      await expect(inline.getByRole('link')).toHaveCount(5);
    }
  });

  test('hero CTAs are visible without scrolling', async ({ page }) => {
    await page.goto('/');
    for (const cta of ['hero_view_work', 'hero_contact']) {
      const el = page.locator(`[data-cta="${cta}"]`);
      await expect(el).toBeInViewport({ ratio: 1 });
    }
  });

  test('body text is at least 16px (AC-RESP-04)', async ({ page }) => {
    await page.goto('/');
    const size = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
  });
});
