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

  test('hero thumbnails keep a real size from 640px through 1199px (REG-01)', async ({ page }, testInfo) => {
    test.skip(widthOf(testInfo) !== 1440, 'viewports are set inside this test');
    const measure = async (width: number, height: number) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      return page.evaluate(() => {
        const box = (el: Element) => {
          const r = el.getBoundingClientRect();
          return { w: r.width, h: r.height, y: r.top, display: getComputedStyle(el).display };
        };
        return {
          thumbs: [...document.querySelectorAll('#top [class*="hero-thumb-"]')].map(box),
          imgs: [...document.querySelectorAll('#top img')].map(box),
        };
      });
    };

    const stacked = await measure(360, 800);
    expect(stacked.imgs).toHaveLength(3);
    for (const img of stacked.imgs) {
      expect(img.w).toBeGreaterThanOrEqual(160);
      expect(img.h).toBeGreaterThanOrEqual(90);
    }
    expect(stacked.imgs[1]!.y).toBeGreaterThan(stacked.imgs[0]!.y + stacked.imgs[0]!.h - 1);
    expect(stacked.imgs[2]!.y).toBeGreaterThan(stacked.imgs[1]!.y + stacked.imgs[1]!.h - 1);
    for (const thumb of stacked.thumbs) expect(thumb.display).toBe('none');

    for (const width of [640, 768, 1024, 1199]) {
      const mid = await measure(width, 900);
      expect(mid.thumbs, `three thumbs at ${width}`).toHaveLength(3);
      for (const thumb of mid.thumbs) {
        expect(thumb.w, `thumb width at ${width}`).toBeGreaterThanOrEqual(80);
        expect(thumb.h, `thumb height at ${width}`).toBeGreaterThanOrEqual(48);
      }
      expect(Math.abs(mid.thumbs[0]!.y - mid.thumbs[1]!.y), `row at ${width}`).toBeLessThan(8);
      expect(Math.abs(mid.thumbs[1]!.y - mid.thumbs[2]!.y), `row at ${width}`).toBeLessThan(8);
    }

    const wide = await measure(1200, 900);
    expect(wide.thumbs).toHaveLength(3);
    for (const thumb of wide.thumbs) {
      expect(thumb.w).toBeGreaterThanOrEqual(80);
      expect(thumb.h).toBeGreaterThanOrEqual(48);
    }
    const ys = wide.thumbs.map((thumb) => thumb.y);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(40);
  });

  test('hero CTAs are visible without scrolling', async ({ page }) => {
    await page.goto('/');
    for (const cta of ['hero_view_work', 'hero_contact']) {
      const el = page.locator(`[data-cta="${cta}"]`);
      await expect(el).toBeInViewport({ ratio: 1 });
    }
  });

  test('hero CTAs stay in the fold before and after the web font (NEW-02, NEW-02b)', async ({ page }, testInfo) => {
    test.skip(widthOf(testInfo) !== 360, 'the Facebook row overflowed at 360×640');

    const check = async (width: number, height: number, phase: string) => {
      await page.setViewportSize({ width, height });
      const boxes = await page.evaluate(() => {
        const ids = ['hero_view_work', 'hero_contact', 'hero_facebook'] as const;
        return ids.map((id) => {
          const r = document.querySelector(`[data-cta="${id}"]`)!.getBoundingClientRect();
          return { id, top: r.top, bottom: r.bottom, height: r.height, scrollY: window.scrollY };
        });
      });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${phase} ${width}×${height} horizontal overflow`).toBeLessThanOrEqual(1);
      for (const box of boxes) {
        expect(box.scrollY, `${phase} ${box.id}`).toBe(0);
        expect(box.top, `${phase} ${box.id}`).toBeGreaterThanOrEqual(0);
        expect(box.height, `${phase} ${box.id}`).toBeGreaterThanOrEqual(44);
      }
      const facebook = boxes.find((box) => box.id === 'hero_facebook')!;
      expect(facebook.height, `${phase} Facebook wraps at ${width}`).toBeLessThanOrEqual(52);
      if (height === 640) {
        for (const box of boxes) {
          expect(box.bottom, `${phase} ${box.id} ends below the 640px fold`).toBeLessThanOrEqual(640);
        }
      } else {
        for (const box of boxes.filter((item) => item.id !== 'hero_facebook')) {
          expect(box.bottom, `${phase} ${box.id} ends below the 568px fold`).toBeLessThanOrEqual(568);
        }
      }
    };

    await page.route('**/*.woff2', (route) => route.abort());
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');
    await check(360, 640, 'fallback');
    await check(320, 568, 'fallback');
    await page.unroute('**/*.woff2');
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await check(360, 640, 'anuphan');
    await check(320, 568, 'anuphan');
  });

  test('touch targets are at least 44×44 on the touch layout (AC-RESP-03)', async ({ page }, testInfo) => {
    test.skip(widthOf(testInfo) !== 360, 'measured on the touch layout');
    await page.goto('/');
    const boxes = await page.evaluate(() => {
      const groups = [
        '#work h3 a[data-project-link]',
        '#site-sections a',
        'a[href="#contact-email"]',
        'a[href="https://www.facebook.com/negaton.man"]',
        'a[href="#availability-detail"]',
      ];
      return groups.flatMap((sel) =>
        [...document.querySelectorAll<HTMLElement>(sel)].map((el) => {
          const r = el.getBoundingClientRect();
          // min-h-touch is 44px; layout can report 43.999 on a fractional device pixel.
          return { sel, text: (el.textContent ?? '').trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) };
        }),
      );
    });
    expect(boxes.length).toBeGreaterThanOrEqual(4 + 4 + 2 + 4 + 1);
    for (const b of boxes) {
      expect(b.h, `${b.text} height`).toBeGreaterThanOrEqual(44);
      expect(b.w, `${b.text} width`).toBeGreaterThanOrEqual(44);
    }
  });

  test('body text is at least 16px (AC-RESP-04)', async ({ page }) => {
    await page.goto('/');
    const size = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
  });
});
