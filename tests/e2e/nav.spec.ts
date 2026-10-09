import { expect, test } from '@playwright/test';
import { LG, widthOf } from './helpers';

test.describe('global nav and page structure (S-0, AC-NAV-*, AC-A11Y-02, AC-HERO-02)', () => {
  test('skip link is the first focusable element and targets main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('href', '#main');
    await expect(focused).toBeVisible();
  });

  test('exactly one h1 (in the hero), html lang="th"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#top h1')).toHaveCount(1);
  });

  test('every section has an h2 and anchors update the URL hash', async ({ page }, testInfo) => {
    await page.goto('/');
    for (const id of ['work', 'process', 'skills', 'about', 'contact']) {
      await expect(page.locator(`#${id} h2:not(dialog h2)`)).toHaveCount(1);
    }
    if (widthOf(testInfo) >= LG) {
      await page.locator('[data-nav="inline"] a[data-nav-link="skills"]').click();
      await expect(page).toHaveURL(/#skills$/);
      // Heading lands below the floating nav (AC-NAV-02).
      await page.waitForTimeout(800);
      const navBottom = await page.locator('nav.nav-pill').evaluate((n) => n.getBoundingClientRect().bottom);
      const headingTop = await page.locator('#skills h2').evaluate((h) => h.getBoundingClientRect().top);
      expect(headingTop).toBeGreaterThanOrEqual(navBottom);
    }
  });

  test('mobile menu: accessible name, aria-expanded, Esc closes and returns focus', async ({ page }, testInfo) => {
    test.skip(widthOf(testInfo) >= LG, 'menu control only below 1030px');
    await page.goto('/');
    const button = page.locator('[data-nav="menu-button"]');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAccessibleName(/เมนู/);
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const sheet = page.locator(`#${await button.getAttribute('aria-controls')}`);
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
    // Choosing a link closes the sheet and jumps to the section.
    await button.click();
    await sheet.locator('a[data-nav-link="contact"]').click();
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/#contact$/);
  });

  test('footer shows email, GitHub, LinkedIn and copyright; no language switch', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(footer.getByRole('link', { name: /GitHub/ })).toHaveCount(1);
    await expect(footer.getByRole('link', { name: /LinkedIn/ })).toHaveCount(1);
    await expect(footer).toContainText('©');
    await expect(page.locator('[hreflang], [data-lang-switch]')).toHaveCount(0);
  });

  test('external links open in a new tab with rel=noopener noreferrer and SR hint', async ({ page }) => {
    await page.goto('/');
    const ext = page.locator('a[target="_blank"]');
    const n = await ext.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(ext.nth(i)).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(ext.nth(i)).toContainText('(เปิดในแท็บใหม่)');
    }
  });

  test('CTAs carry stable data-cta ids (AC-PATH-05 N/A on Hobby)', async ({ page }) => {
    await page.goto('/');
    for (const id of ['hero_view_work', 'hero_contact', 'path_client_start_project', 'path_recruiter_linkedin', 'path_recruiter_github', 'contact_copy_email', 'work_open_detail']) {
      expect(await page.locator(`[data-cta="${id}"]`).count(), id).toBeGreaterThan(0);
    }
    // Resume CTA stays hidden until a PDF exists. Facebook is the approved hire/contact link (paths + contact).
    await expect(page.locator('[data-cta="path_recruiter_resume"]')).toHaveCount(0);
    await expect(page.locator('[data-cta="path_client_hire_platform"]')).toHaveCount(2);
    await expect(page.locator('[data-cta="hero_facebook"]')).toHaveCount(1);
    for (const loc of ['paths', 'contact']) {
      await expect(page.locator(`[data-cta="path_client_start_project"][data-cta-location="${loc}"]`)).toHaveCount(1);
    }
  });

  test('client mailto has a Thai subject and brief template (AC-CON-02); email is visible text (AC-CON-05)', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('[data-cta="path_client_start_project"]').first().getAttribute('href');
    expect(href).toMatch(/^mailto:[^?]+\?subject=.+&body=.+/);
    const subject = decodeURIComponent(new URL(href!).searchParams.get('subject') ?? '');
    expect(subject).toContain('สนใจจ้างทำโปรเจกต์');
    expect(href!.length).toBeLessThan(2000);
    await expect(page.locator('#contact-email-text')).toBeVisible();
  });
});
