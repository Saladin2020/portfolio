import { expect, test, type Locator, type Page } from '@playwright/test';
import { widthOf } from './helpers';

/**
 * NEW-01b. From /#work, Esc and X must put focus back on the triggering card
 * and leave the scroll position where it was before the dialog opened.
 * QA-004a: CPU 4× returned focus in 2/120 trials, and every close jumped to
 * the top of #work.
 */
const CONFIGS = [
  { label: 'cpu4@390', width: 390, height: 844, rate: 4 },
  { label: 'cpu4@1440', width: 1440, height: 900, rate: 4 },
  { label: 'unthrottled@390', width: 390, height: 844, rate: 1 },
  { label: 'unthrottled@1440', width: 1440, height: 900, rate: 1 },
] as const;

const TRIALS = 20;
const BACK_TRIALS = 10;

async function setCpu(page: Page, rate: number) {
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate });
  return client;
}

async function trial(page: Page, trigger: Locator, how: 'Escape' | 'X' | 'Back') {
  await trigger.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await trigger.click();
  const dialog = page.locator('#project-dialog-p3');
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(1000);
  if (how === 'Escape') await page.keyboard.press('Escape');
  else if (how === 'X') await dialog.getByRole('button', { name: 'ปิด' }).click();
  else await page.goBack();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/#work$/);
  await expect(trigger).toBeFocused({ timeout: 2_000 });
  await page.waitForTimeout(200);
  await expect(trigger).toBeFocused();
  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThanOrEqual(4);
  const seen = await trigger.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  });
  expect(seen).toBe(true);
}

test.describe('dialog focus and scroll from /#work (NEW-01b)', () => {
  test.describe.configure({ retries: 0 });

  test('Esc, X, and Back restore the card and the scroll position', async ({ page }, testInfo) => {
    test.skip(widthOf(testInfo) !== 1440, 'viewport and CPU rate are set inside this test');
    test.setTimeout(10 * 60_000);

    for (const config of CONFIGS) {
      await page.setViewportSize({ width: config.width, height: config.height });
      const client = await setCpu(page, config.rate);
      try {
        await page.goto('/#work', { waitUntil: 'load' });
        const trigger = page.locator('#work a[data-project-link="p3"]').filter({ hasText: 'ดูรายละเอียด' });
        await expect(trigger).toBeVisible();
        for (const how of ['Escape', 'X'] as const) {
          let passed = 0;
          for (let i = 0; i < TRIALS; i++) {
            await trial(page, trigger, how);
            passed += 1;
          }
          const row = `${config.label} ${how} dwell=1000ms ${passed}/${TRIALS}`;
          console.log(`NEW-01b ${row}`);
          expect(passed, row).toBe(TRIALS);
        }
        console.log(`NEW-01b ${config.label} combined ${TRIALS * 2}/${TRIALS * 2}`);
        let backPassed = 0;
        for (let i = 0; i < BACK_TRIALS; i++) {
          await trial(page, trigger, 'Back');
          backPassed += 1;
        }
        const backRow = `${config.label} Back dwell=1000ms ${backPassed}/${BACK_TRIALS}`;
        console.log(`NEW-01b ${backRow}`);
        expect(backPassed, backRow).toBe(BACK_TRIALS);
      } finally {
        await client.detach();
      }
    }
  });
});
