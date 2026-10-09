import { expect, test } from '@playwright/test';

const FACEBOOK = 'https://www.facebook.com/negaton.man';
const BADGE = 'รับฟรีแลนซ์ + งานประจำ';
const AVAILABILITY = 'รับฟรีแลนซ์ + เปิดรับงานประจำ · รับงานได้ตั้งแต่เดือน ก.พ.–มี.ค., พ.ค.–ก.ย., พ.ย. ทุกวันที่ 5–15';
const FACEBOOK_CTA = 'จ้างงานหรือติดต่อผ่าน Facebook';
const FACEBOOK_HELPER = 'ส่งข้อความคุยรายละเอียดงานได้ทาง Facebook';
const IDEA = 'ตั้งเป้าตั้งแต่ขั้นไอเดียว่างานต้องถูกต้องและใช้งานได้จริง ก่อนเริ่มออกแบบและลงมือสร้าง';

const RESULTS = {
  memo: 'เว็บไซต์ออนไลน์จริงบน Vercel เปิดดูหน้าแรกและหน้าอธิบายแพ็กสมาชิก Free / Plus / Pro เป็นภาษาไทยได้ทันทีโดยไม่ต้องล็อกอิน',
  p3: 'เปิดให้ใช้งานจริงโดยไม่ต้องล็อกอิน เริ่มสร้างพอร์ตจำลอง $1000 ได้จากหน้าแรก มีหน้า Pulse ห้องดูเอล และคู่มือติดตั้งเป็นแอปบนมือถือและเดสก์ท็อป',
  labwise:
    'ระบบทำงานได้ครบตั้งแต่บันทึกและค้นหาอุบัติการณ์ด้วยตัวกรองหลายแบบ แดชบอร์ดสรุปรายการที่ต้องติดตาม ไปจนถึงหน้าวิเคราะห์แนวโน้ม 12 เดือนและกราฟ Pareto ตามหมวด สำหรับห้องปฏิบัติการเทคนิคการแพทย์',
  'signal-controlbridge':
    'รับ webhook ได้จริงและแยกผลสำเร็จ / ล้มเหลวให้เห็นบนแดชบอร์ด ตั้งค่าช่องได้ในหน้าเดียว ทั้ง webhook URL, bot token ที่ซ่อนไว้ และเทมเพลตข้อความพร้อมพรีเซ็ตและเงื่อนไข if / else',
} as const;

test.describe('GATE 4 approved copy', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'w1440', 'viewport-independent; runs once');
  });

  test('availability badge links to the full line', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('#top a[href="#availability-detail"]');
    await expect(badge).toHaveText(`สถานะ: ${BADGE}`);
    await badge.click();
    await expect(page.locator('#availability-detail')).toHaveText(AVAILABILITY);
    await expect(page.locator('#about')).toContainText(BADGE);
    await expect(page.locator('#availability-detail')).toBeInViewport();
  });

  test('Facebook CTA in the hero, client path, and contact, and the label in the footer', async ({ page }) => {
    await page.goto('/');
    const places = [
      { sel: '#top a[href="' + FACEBOOK + '"]', name: FACEBOOK_CTA },
      { sel: '#paths a[href="' + FACEBOOK + '"]', name: FACEBOOK_CTA },
      { sel: '#contact a[href="' + FACEBOOK + '"]', name: FACEBOOK_CTA },
      { sel: 'footer a[href="' + FACEBOOK + '"]', name: 'Facebook' },
    ];
    for (const place of places) {
      const link = page.locator(place.sel);
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(link).toContainText(place.name);
      await expect(link).toContainText('(เปิดในแท็บใหม่)');
    }
    await expect(page.locator('#paths')).toContainText(FACEBOOK_HELPER);
    await expect(page.locator('#contact')).toContainText(FACEBOOK_HELPER);
  });

  test('ผลลัพธ์ on each card, in the dialog, and on /work/<slug>', async ({ page }) => {
    await page.goto('/');
    for (const [slug, result] of Object.entries(RESULTS)) {
      const card = page.locator('#work li[data-category]').filter({ has: page.locator(`a[data-project-link="${slug}"]`) });
      await expect(card).toContainText(`ผลลัพธ์: ${result}`);
    }
    for (const [slug, result] of Object.entries(RESULTS)) {
      await page.locator(`a[data-project-link="${slug}"]`).first().click();
      const dialog = page.locator(`#project-dialog-${slug}`);
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('heading', { name: 'ผลลัพธ์' })).toBeVisible();
      await expect(dialog).toContainText(result);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    }
    for (const [slug, result] of Object.entries(RESULTS)) {
      await page.goto(`/work/${slug}`);
      await expect(page.getByRole('heading', { name: 'ผลลัพธ์' })).toBeVisible();
      await expect(page.locator('main')).toContainText(result);
    }
  });

  test('ไอเดีย step uses the approved description', async ({ page }) => {
    await page.goto('/');
    const step = page.locator('#process li').filter({ has: page.getByRole('heading', { name: 'ไอเดีย' }) });
    await expect(step).toContainText(IDEA);
  });

  test('largest contentful paint element is the hero h1', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __lcp: Array<{ tag: string | null; id: string | null; size: number }> };
      w.__lcp = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const paint = entry as PerformanceEntry & { element?: Element | null; size?: number };
          w.__lcp.push({ tag: paint.element?.tagName ?? null, id: paint.element?.id ?? null, size: paint.size ?? 0 });
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('#hero-heading')).toBeVisible();
    await page.waitForTimeout(500);
    const lcp = await page.evaluate(() => {
      const rows = (window as unknown as { __lcp: Array<{ tag: string | null; id: string | null; size: number }> }).__lcp;
      return rows.reduce((best, row) => (row.size >= best.size ? row : best), rows[0] ?? { tag: null, id: null, size: 0 });
    });
    expect(lcp.tag).toBe('H1');
    expect(lcp.id).toBe('hero-heading');
  });
});
