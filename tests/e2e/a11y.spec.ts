import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { scrollThrough, SLUGS } from './helpers';

const serious = <T extends { impact?: string | null }>(violations: T[]): T[] => violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
const summary = (vs: Array<{ id: string; impact?: string | null; nodes: Array<{ target: unknown }> }>) =>
  vs.map((v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => JSON.stringify(n.target)).join(', ')}`).join('\n');

test.describe('axe (AC-A11Y-01) @a11y', () => {
  // Scroll-linked reveals fade content in; a card caught mid-fade has transient low contrast that is not
  // its resting state. Axe therefore runs with motion reduced (content at full opacity); the motion
  // itself is covered by motion.spec.ts.
  test.use({ reducedMotion: 'reduce' });

  for (const path of ['/', ...SLUGS.map((s) => `/work/${s}`), '/does-not-exist']) {
    test(`no serious/critical violations on ${path} @a11y`, async ({ page }) => {
      await page.goto(path);
      await scrollThrough(page);
      await page.waitForTimeout(300);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const bad = serious(results.violations);
      if (results.violations.length) test.info().annotations.push({ type: 'axe', description: summary(results.violations) });
      expect(bad, summary(bad)).toEqual([]);
    });
  }

  test('no serious/critical violations with the project dialog open @a11y', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('a[data-project-link="memo"]').first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(page.locator('#project-dialog-memo')).toBeVisible();
    await page.waitForTimeout(400);
    const results = await new AxeBuilder({ page }).include('#project-dialog-memo').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const bad = serious(results.violations);
    expect(bad, summary(bad)).toEqual([]);
  });
});
