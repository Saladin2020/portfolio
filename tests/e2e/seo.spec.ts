import { expect, test } from '@playwright/test';
import { SLUGS } from './helpers';

test.describe('SEO and meta (S-8, AC-SEO-*)', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'w1440', 'viewport-independent; runs once');
  });

  test('title ≤ 60, description ≤ 160, canonical, OG/Twitter 1200×630', async ({ page, request }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toContain('ซอลาฮุดดีน เบนโน');
    expect(title).toContain('Salahuddin Benno');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc!.length).toBeLessThanOrEqual(160);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect((await request.get(new URL(og!).pathname)).status()).toBe(200);
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
  });

  test('sitemap.xml and robots.txt are reachable; sitemap lists home + project pages (AD-5)', async ({ request }) => {
    const sm = await request.get('/sitemap.xml');
    expect(sm.status()).toBe(200);
    const xml = await sm.text();
    expect(xml).toMatch(/<loc>[^<]+\/<\/loc>/);
    for (const slug of SLUGS) expect(xml).toContain(`/work/${slug}</loc>`);
    expect(xml.match(/<loc>/g)).toHaveLength(1 + SLUGS.length);
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap:');
  });

  test('ProfilePage + Person JSON-LD has name, jobTitle, url, image, sameAs', async ({ page, request }) => {
    await page.goto('/');
    const json = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
    expect(json['@type']).toBe('ProfilePage');
    const person = json.mainEntity;
    expect(person['@type']).toBe('Person');
    for (const k of ['name', 'jobTitle', 'url', 'image']) expect(person[k], k).toBeTruthy();
    expect(person.name).toBe('Salahuddin Benno');
    expect(person.alternateName).toContain('ซอลาฮุดดีน เบนโน');
    expect(person.email).toBe('mailto:negaton.app@gmail.com');
    expect(person.sameAs).toEqual(['https://github.com/Saladin2020', 'https://www.linkedin.com/in/salahuddin-benno-9b7419b9']);
    expect(person.knowsAbout).toContain('Next.js');
    expect((await request.get(new URL(person.image).pathname)).status()).toBe(200);
  });

  test('routes: /th → / (308), /work → /#work, unknown → Thai 404', async ({ request }) => {
    const th = await request.get('/th', { maxRedirects: 0 });
    expect(th.status()).toBe(308);
    expect(th.headers()['location']).toMatch(/\/$/);
    const work = await request.get('/work', { maxRedirects: 0 });
    expect(work.status()).toBe(308);
    const nf = await request.get('/nope/nope');
    expect(nf.status()).toBe(404);
    expect(await nf.text()).toContain('lang="th"');
    for (const slug of SLUGS) expect((await request.get(`/work/${slug}`)).status()).toBe(200);
  });
});
