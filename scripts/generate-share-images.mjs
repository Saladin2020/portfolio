#!/usr/bin/env node
/**
 * Renders the share/icon images with headless Chromium from the site's real content:
 *   app/opengraph-image.png (1200×630, AC-SEO-02, wireframe S-8 layout): name, positioning, tagline,
 *     and two tilted thumbnails of the PO's own projects (derived screenshots in assets/images/projects).
 *   app/apple-icon.png (180×180) + app/icon.svg: "SB" initials monogram (no PO-approved logo exists).
 * Fonts: Anuphan must be installed locally (Thai glyphs). Run: node scripts/generate-share-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const t = JSON.parse(fs.readFileSync(path.join(root, 'design/design-tokens.json'), 'utf8'));
const hex = (p) => p.split('.').reduce((n, k) => n[k], t.color.base).$value.hex;
const bg = hex('sand-50');
const ink = hex('slate-700');
const navy = hex('navy-900');
const muted = hex('neutral-550');
const border = hex('neutral-300');

const dataUri = (rel) => `data:image/png;base64,${fs.readFileSync(path.join(root, rel)).toString('base64')}`;
const thumbs = ['assets/images/projects/memo/landing.png', 'assets/images/projects/p3/home.png'].map(dataUri);
const font = "'Anuphan', system-ui, sans-serif";

const og = `<!doctype html><html><body style="margin:0;width:1200px;height:630px;background:${bg};font-family:${font};color:${ink};position:relative;overflow:hidden">
<div style="position:absolute;left:80px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:18px;width:620px">
  <div style="width:72px;height:72px;border-radius:18px;background:${navy};color:#fff;display:grid;place-items:center;font-size:30px;font-weight:600">SB</div>
  <div style="font-size:34px;font-weight:600;color:${navy}">ซอลาฮุดดีน เบนโน <span style="font-weight:400;color:${muted}">· Salahuddin Benno</span></div>
  <div style="font-size:62px;font-weight:600;line-height:1.15">AI-native builder</div>
  <div style="font-size:26px;line-height:1.5;color:${muted}">สร้างเว็บ โปรแกรม และแอปที่ใช้งานได้จริง — เร็วขึ้นด้วย AI agents ควบคุมคุณภาพด้วยมือนักพัฒนา</div>
</div>
${thumbs.map((src, i) => `<img src="${src}" style="position:absolute;right:${60 + i * 50}px;top:${90 + i * 230}px;width:380px;height:auto;border-radius:16px;border:3px solid ${border};transform:rotate(${i ? 4 : -4}deg);box-shadow:0 12px 32px rgba(19,25,34,.12)">`).join('')}
</body></html>`;

const icon = `<!doctype html><html><body style="margin:0;width:180px;height:180px;background:${navy};display:grid;place-items:center;font-family:${font};color:#fff;font-size:72px;font-weight:600">SB</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(og);
const ogBuf = await page.screenshot({ type: 'png' });
for (const f of ['opengraph-image.png']) fs.writeFileSync(path.join(root, 'app', f), ogBuf);
await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(icon);
fs.writeFileSync(path.join(root, 'app/apple-icon.png'), await page.screenshot({ type: 'png' }));
await browser.close();
fs.writeFileSync(
  path.join(root, 'app/icon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${navy}"/><text x="32" y="42" text-anchor="middle" font-family="system-ui, sans-serif" font-size="26" font-weight="700" fill="#ffffff">SB</text></svg>\n`,
);
console.log('[images] wrote opengraph-image.png (1200×630), apple-icon.png (180×180), icon.svg');
