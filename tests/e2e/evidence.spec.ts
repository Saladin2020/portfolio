import path from 'node:path';
import { expect, test } from '@playwright/test';
import { scrollThrough } from './helpers';

/**
 * Evidence screenshots. Runs only when EVIDENCE_DIR is set:
 *   EVIDENCE_DIR=<output dir> npx playwright test evidence --project=w1440
 * Captures full-page home at 390 and 1440 plus the project dialog and a project page.
 */
const dir = process.env.EVIDENCE_DIR;

test.describe('evidence screenshots @evidence', () => {
  test.skip(!dir, 'set EVIDENCE_DIR to capture');
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'w1440', 'captured once');
  });

  for (const width of [390, 1440]) {
    test(`home ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 1030 ? 844 : 900 });
      await page.goto('/');
      await scrollThrough(page);
      await page.waitForLoadState('networkidle');
      await page.emulateMedia({ reducedMotion: 'reduce' }); // settle reveal animations to their final state
      await page.screenshot({ path: path.join(dir!, `home-${width}.png`), fullPage: true });

      const trigger = page.locator('a[data-project-link="memo"]').last();
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      await expect(page.locator('#project-dialog-memo')).toBeVisible();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(dir!, `dialog-${width}.png`) });

      await page.goto('/work/labwise');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(dir!, `project-page-${width}.png`), fullPage: true });
    });
  }
});
