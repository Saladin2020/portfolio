import { expect, test } from '@playwright/test';

test.describe('featured work: filter + project detail (S-3, S-3b, AC-WORK-*)', () => {
  test('filter: All pressed by default, filtering in place, empty categories hidden', async ({ page }) => {
    await page.goto('/');
    const group = page.locator('[data-work-filter]');
    await expect(group).toBeVisible();
    await expect(group.locator('[data-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
    const cards = page.locator('#work li[data-category]');
    const total = await cards.count();
    expect(total).toBeGreaterThanOrEqual(3);
    expect(total).toBeLessThanOrEqual(6);
    await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
    await group.locator('[data-filter="web"]').click();
    await expect(group.locator('[data-filter="web"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(group.locator('[data-filter="all"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#work li[data-category="web"]').first()).toBeVisible();
    await expect(page.locator('#work li[data-category="app"]').first()).toBeHidden();
    await expect(page.locator('#work [role="status"]')).toContainText('โปรเจกต์');
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);
    for (const btn of await group.locator('button').all()) {
      await expect(btn).not.toContainText('(0)');
    }
  });

  test('dialog: opens from card, pushes /work/<slug>, focus to heading, Esc closes, focus returns', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 42));
    const trigger = page.locator('a[data-project-link="memo"]').last();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const dialog = page.locator('#project-dialog-memo');
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/work\/memo$/);
    await expect(page.locator('#dialog-memo-title')).toBeFocused();
    await expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-memo-title');
    // Modal: the page behind is inert, so Tab never lands on background content
    // (native <dialog> may hand focus to the browser chrome/body after the last control).
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const where = await page.evaluate(() => {
        const a = document.activeElement;
        return !a || a === document.body ? 'body' : a.closest('dialog[open]') ? 'dialog' : 'background';
      });
      expect(where).not.toBe('background');
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(42); // no reload / Next navigation
  });

  test('dialog: Esc and close return focus with and without a hash (AC-WORK-09)', async ({ page }, testInfo) => {
    test.skip((testInfo.project.use.viewport?.width ?? 0) !== 1440, 'focus return is independent of viewport');
    const trigger = page.locator('a[data-project-link="p3"]').first();
    for (const start of ['/', '/#work'] as const) {
      for (const how of ['Escape', 'close'] as const) {
        await test.step(`${how} from ${start || '/'}`, async () => {
          await page.goto(start);
          if (start === '/#work') {
            // Same-document #work must keep the App Router history state. A null
            // entry lets a deferred restore rewrite the URL back to /work/p3.
            await expect
              .poll(async () => page.evaluate(() => Boolean((history.state as { __NA?: boolean } | null)?.__NA)))
              .toBe(true);
          }
          await trigger.scrollIntoViewIfNeeded();
          await trigger.click();
          const dialog = page.locator('#project-dialog-p3');
          await expect(dialog).toBeVisible();
          await expect(page).toHaveURL(/\/work\/p3$/);
          if (how === 'Escape') await page.keyboard.press('Escape');
          else await dialog.getByRole('button', { name: 'ปิด' }).click();
          await expect(dialog).toBeHidden();
          await expect(page).toHaveURL(start === '/#work' ? /\/#work$/ : /\/$/);
          await expect(trigger).toBeFocused();
        });
      }
    }
  });

  test('dialog: browser Back closes it; Forward reopens it; close button works', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('a[data-project-link="labwise"]').first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const dialog = page.locator('#project-dialog-labwise');
    await expect(dialog).toBeVisible();
    await page.goBack();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
    await page.goForward();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'ปิด' }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test('project page works without JavaScript (no-JS fallback, AC-A11Y-08)', async ({ browser }, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport, baseURL: testInfo.project.use.baseURL, storageState: testInfo.project.use.storageState });
    const page = await context.newPage();
    await page.goto('/');
    // All projects rendered, filter controls hidden without JS.
    await expect(page.locator('#work li[data-category]')).toHaveCount(4);
    await expect(page.locator('[data-work-filter]')).toBeHidden();
    // Generous timeout: first-hit next/image optimisation can keep a local `next start` busy.
    await Promise.all([page.waitForURL(/\/work\/signal-controlbridge$/, { timeout: 20_000 }), page.locator('a[data-project-link="signal-controlbridge"]').first().click()]);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main h2').first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/work\/signal-controlbridge$/);
    await context.close();
  });

  test('cards show title, category, brief, role, result, tech, image with alt; live links only', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#work li[data-category]')).toHaveCount(4);
    for (const [slug, category] of [['memo', 'web'], ['p3', 'app'], ['labwise', 'program'], ['signal-controlbridge', 'program']] as const) {
      const card = page.locator('#work li[data-category]').filter({ has: page.locator(`a[data-project-link="${slug}"]`) });
      await expect(card).toHaveAttribute('data-category', category);
      await expect(card.locator('h3')).toHaveCount(1);
      await expect(card.locator('img')).toHaveAttribute('alt', /.{10,}/);
      await expect(card).toContainText('ผลลัพธ์');
      await expect(card).toContainText('บทบาท');
      await expect(card).toContainText('AI agents (Cursor / Claude)');
      await expect(card.locator('a[target="_blank"][href$=".vercel.app/"]')).toHaveCount(1);
    }
    // Login-only apps say so next to the live link.
    await expect(page.locator('#work li[data-category]').filter({ has: page.locator('a[data-project-link="labwise"]') })).toContainText('ต้องเข้าสู่ระบบ');
    // Repos are private: no source links anywhere.
    await expect(page.locator('[data-link-kind="source"], a[href*="github.com/Saladin2020/"]')).toHaveCount(0);
    // Detail markup is fetched on open, not inlined in the home document.
    await page.locator('a[data-project-link="labwise"]').first().click();
    const detail = page.locator('#project-dialog-labwise');
    await expect(detail).toBeVisible();
    await expect(detail.getByRole('heading', { name: 'ผลลัพธ์' })).toBeVisible();
    await expect(detail.locator('[data-link-kind="live"]')).toHaveCount(1);
    await expect(detail.locator('img')).toHaveCount(3);
  });

  test('project images are served through next/image (optimised, responsive)', async ({ page }) => {
    await page.goto('/');
    const srcs = await page.locator('#work li[data-category] img').evaluateAll((imgs) => imgs.map((i) => [i.getAttribute('src'), i.getAttribute('srcset')]));
    expect(srcs.length).toBe(4);
    for (const [src, srcset] of srcs) {
      expect(src).toContain('/_next/image?url=');
      expect(srcset).toContain('w=');
    }
  });
});
