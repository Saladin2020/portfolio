import { expect, type Page, test } from '@playwright/test';
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

/**
 * Hold every woff2, including the Anuphan subsets next/font emits under a
 * generated family name. The re-align has to be measured after those
 * responses arrive: `fonts-active` is applied first, and the face loads after.
 */
async function delayWoff2(page: Page, ms: number) {
  let started = 0;
  let inflight = 0;
  // `**/*` is required: a woff2-only pattern never receives these font requests.
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (!url.includes('.woff2')) {
      await route.continue();
      return;
    }
    started += 1;
    inflight += 1;
    try {
      await new Promise((resolve) => setTimeout(resolve, ms));
      // fetch() does not re-enter this route. continue() was looping on font requests.
      const response = await route.fetch();
      await route.fulfill({ response });
    } finally {
      inflight -= 1;
    }
  });
  return {
    started: () => started,
    inflight: () => inflight,
  };
}

/** Resolves once the woff2 requests that started after `since` have loaded. */
async function waitForDelayedFonts(
  page: Page,
  tracker: { started: () => number; inflight: () => number },
  since: number,
) {
  const facesSettled = () =>
    page.waitForFunction(() => {
      let loading = false;
      document.fonts.forEach((face) => {
        if (face.status === 'loading') loading = true;
      });
      return document.documentElement.classList.contains('fonts-active') && !loading;
    });
  await expect.poll(() => tracker.started() > since && tracker.inflight() === 0, { timeout: 15_000 }).toBe(true);
  await facesSettled();
  // Subsets are requested together; a short quiet catches one that starts late.
  await page.waitForTimeout(250);
  await expect.poll(() => tracker.inflight() === 0, { timeout: 15_000 }).toBe(true);
  await facesSettled();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

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
    // Hold the face until after the scripted scroll.
    const fonts = await delayWoff2(page, 4000);
    const since = fonts.started();
    try {
      await page.goto('/#about', { waitUntil: 'domcontentloaded' });
      const heading = page.locator('#about-heading');
      await expect
        .poll(async () => heading.evaluate((el) => Math.round(el.getBoundingClientRect().top)), {
          message: '#about should land before the scripted scroll',
          timeout: 4_000,
        })
        .toBeLessThanOrEqual(192 + 80);

      const scrolled = await page.evaluate(() => {
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        const before = window.scrollY;
        window.scrollTo(0, Math.max(0, before - 480));
        const after = window.scrollY;
        root.style.scrollBehavior = prev;
        return { before, after };
      });
      expect(scrolled.before - scrolled.after).toBeGreaterThan(200);
      // Past the post-font align, after the stalled face has actually loaded.
      // Font swap can still anchor the viewport by a few dozen pixels; that is not a snap-back.
      await waitForDelayedFonts(page, fonts, since);
      const top = await heading.evaluate((el) => Math.round(el.getBoundingClientRect().top));
      expect(top, 'scripted scroll was pulled back to the #about offset').toBeGreaterThan(192 + 120);
    } finally {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
  });

  test('keyboard scrolling during font load is not pulled back to the hash', async ({ page }, testInfo) => {
    test.skip(widthOf(testInfo) !== 1440, 'scroll-key handling is independent of viewport');
    const fonts = await delayWoff2(page, 4000);
    const since = fonts.started();
    try {
      await page.goto('/#about', { waitUntil: 'domcontentloaded' });
      const heading = page.locator('#about-heading');
      await expect
        .poll(async () => heading.evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 4_000 })
        .toBeLessThanOrEqual(192 + 80);
      await page.keyboard.press('PageDown');
      await waitForDelayedFonts(page, fonts, since);
      const top = await heading.evaluate((el) => Math.round(el.getBoundingClientRect().top));
      expect(top, 'PageDown was pulled back to the #about offset').toBeLessThan(192 - 80);
    } finally {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
  });

  test('Ctrl+F and a following scroll are not pulled back to the hash', async ({ page }, testInfo) => {
    test.skip(widthOf(testInfo) !== 1440, 'find-in-page handling is independent of viewport');
    const fonts = await delayWoff2(page, 4000);
    const since = fonts.started();
    try {
      await page.goto('/#about', { waitUntil: 'domcontentloaded' });
      const heading = page.locator('#about-heading');
      await expect
        .poll(async () => heading.evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 4_000 })
        .toBeLessThanOrEqual(192 + 80);
      // Find-in-page does not emit a scroll key. Ctrl/Cmd+F marks intent, and the
      // scroll that follows must win over the font re-align.
      await page.evaluate(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true }));
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, Math.max(0, window.scrollY - 480));
        root.style.scrollBehavior = prev;
      });
      await waitForDelayedFonts(page, fonts, since);
      const top = await heading.evaluate((el) => Math.round(el.getBoundingClientRect().top));
      expect(top, 'Ctrl+F scroll was pulled back to the #about offset').toBeGreaterThan(192 + 120);
    } finally {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
  });

  test('a delayed font swap lands the heading at 360, 768 and 1440', async ({ browser }, testInfo) => {
    test.skip(widthOf(testInfo) !== 1440, 'viewports are set inside this test');
    test.setTimeout(120_000);
    const widths = [
      { width: 360, height: 640 },
      { width: 768, height: 900 },
      { width: 1440, height: 900 },
    ] as const;
    for (const viewport of widths) {
      const expected = expectedHeadingTop(viewport.width);
      for (const id of ['process', 'contact', 'work'] as const) {
        // A fresh context so the face is not already in the memory cache.
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          baseURL: 'http://localhost:3000',
        });
        const page = await context.newPage();
        const fonts = await delayWoff2(page, 3500);
        const since = fonts.started();
        try {
          await page.goto(`/#${id}`, { waitUntil: 'load' });
          await waitForDelayedFonts(page, fonts, since);
          const heading = page.locator(`#${id}-heading`);
          const top = await heading.evaluate((el) => Math.round(el.getBoundingClientRect().top));
          expect(Math.abs(top - expected), `#${id} @ ${viewport.width} landed at ${top}px, expected ${expected}`).toBeLessThanOrEqual(4);
        } finally {
          await context.close();
        }
      }
    }
  });
});
