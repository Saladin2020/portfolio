import { expect, test } from '@playwright/test';

test.describe('reduced motion (AC-A11Y-07)', () => {
  test('prefers-reduced-motion: reduce disables entrance, reveal, shimmer, bob and smooth scroll', async ({ browser }, testInfo) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: testInfo.project.use.viewport, baseURL: testInfo.project.use.baseURL, storageState: testInfo.project.use.storageState });
    const page = await context.newPage();
    await page.goto('/');
    const result = await page.evaluate(() => {
      const names = (sel: string) => [...document.querySelectorAll(sel)].map((el) => getComputedStyle(el).animationName);
      const cue = document.querySelector('.motion-scroll-cue');
      const dialog = document.querySelector('.project-dialog');
      return {
        matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
        entrance: names('.motion-entrance'),
        reveal: names('.motion-reveal'),
        shimmer: names('.motion-shimmer'),
        bob: names('.motion-bob'),
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        cueDisplay: cue ? getComputedStyle(cue).display : 'none',
        dialogTransition: dialog ? getComputedStyle(dialog).transitionDuration : '0s',
        hoverTransition: [...document.querySelectorAll('.motion-hover')].map((el) => getComputedStyle(el).transitionDuration),
        hiddenByOpacity: [...document.querySelectorAll('main *')].filter((el) => getComputedStyle(el).opacity === '0').length,
      };
    });
    test.info().annotations.push({ type: 'reduced-motion', description: JSON.stringify(result) });
    expect(result.matches).toBe(true);
    for (const list of [result.entrance, result.reveal, result.shimmer, result.bob]) for (const n of list) expect(n).toBe('none');
    expect(result.reveal.length).toBeGreaterThan(0);
    expect(result.scrollBehavior).toBe('auto');
    expect(result.cueDisplay).toBe('none');
    expect(result.dialogTransition.split(',').every((d) => d.trim() === '0s')).toBe(true);
    expect(result.hoverTransition.every((d) => d.split(',').every((x) => x.trim() === '0s'))).toBe(true);
    expect(result.hiddenByOpacity).toBe(0); // all content visible without animation
    await context.close();
  });

  test('with no preference, motion is present (sanity check for the test above)', async ({ browser }, testInfo) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference', viewport: testInfo.project.use.viewport, baseURL: testInfo.project.use.baseURL, storageState: testInfo.project.use.storageState });
    const page = await context.newPage();
    await page.goto('/');
    const entrance = await page.locator('.motion-entrance').first().evaluate((el) => getComputedStyle(el).animationName);
    const smooth = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    expect(entrance).toBe('fade-up');
    expect(smooth).toBe('smooth');
    await context.close();
  });
});
