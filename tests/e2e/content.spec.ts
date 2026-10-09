import { expect, test } from '@playwright/test';
import { SLUGS } from './helpers';

const TAGLINE = 'สร้างเว็บ โปรแกรม และแอปที่ใช้งานได้จริง — เร็วขึ้นด้วย AI agents ควบคุมคุณภาพด้วยมือนักพัฒนา';

test.describe('real content', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'w1440', 'viewport-independent; runs once');
  });

  test('hero: Thai + English name and the exact PO tagline as the h1', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(TAGLINE);
    await expect(page.locator('#top')).toContainText('ซอลาฮุดดีน เบนโน');
    await expect(page.locator('#top')).toContainText('Salahuddin Benno');
  });

  test('contact: plain-text email with copy button; GitHub and LinkedIn URLs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#contact-email-text')).toHaveText('negaton.app@gmail.com');
    await expect(page.locator('[data-cta="contact_copy_email"]')).toBeVisible();
    await expect(page.locator('a[href="https://github.com/Saladin2020"]').first()).toBeVisible();
    await expect(page.locator('a[href="https://www.linkedin.com/in/salahuddin-benno-9b7419b9"]').first()).toBeVisible();
  });

  test('no placeholder text, example.com links or "2 ผู้ใช้งาน" text on any page', async ({ page }) => {
    for (const path of ['/', ...SLUGS.map((s) => `/work/${s}`)]) {
      await page.goto(path);
      const html = await page.content();
      expect(html, path).not.toContain('PLACEHOLDER');
      expect(html, path).not.toContain('example.com');
      await expect(page.locator('[data-placeholder]'), path).toHaveCount(0);
      expect(await page.locator('body').innerText(), path).not.toContain('2 ผู้ใช้งาน');
    }
  });

  test('portrait uses the PO photo via next/image with Thai alt text', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('#about img');
    await expect(img).toHaveAttribute('alt', /ซอลาฮุดดีน เบนโน/);
    await expect(img).toHaveAttribute('src', /\/_next\/image\?url=.*photo/);
  });

  test('all images have meaningful alt text (decorative ones are aria-hidden)', async ({ page }) => {
    for (const path of ['/', ...SLUGS.map((s) => `/work/${s}`)]) {
      await page.goto(path);
      const bad = await page.locator('img').evaluateAll((imgs) =>
        imgs.filter((i) => !(i.getAttribute('alt') ?? '').trim() && !i.closest('[aria-hidden="true"]')).map((i) => i.getAttribute('src')),
      );
      expect(bad, path).toEqual([]);
    }
  });
});
