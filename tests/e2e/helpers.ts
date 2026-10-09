import type { Page, TestInfo } from '@playwright/test';

export const LG = 1030; // breakpoint.lg (design-tokens.json)

/** The 4 shown projects (content/shared/projects.ts), in display order. */
export const SLUGS = ['memo', 'p3', 'labwise', 'signal-controlbridge'] as const;

export const widthOf = (testInfo: TestInfo) => testInfo.project.use.viewport?.width ?? 0;

/** Scroll the whole page so scroll-linked reveals and lazy images settle. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    // Wait (max 10 s) for rendered lazy images to load so screenshots/axe see final pixels.
    // Images inside closed <dialog>s are display:none and never load, so they are skipped.
    const pending = [...document.images].filter((img) => !img.complete && img.getClientRects().length > 0);
    await Promise.race([
      Promise.all(pending.map((img) => new Promise((r) => (img.addEventListener('load', r, { once: true }), img.addEventListener('error', r, { once: true }))))),
      new Promise((r) => setTimeout(r, 10_000)),
    ]);
    window.scrollTo(0, 0);
  });
}

export async function noHorizontalScroll(page: Page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    ok: document.documentElement.scrollWidth <= window.innerWidth,
  }));
}
