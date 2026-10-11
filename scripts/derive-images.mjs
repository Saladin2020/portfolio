/**
 * Derives the committed site images from the owner-approved inputs (CONTENT_INPUT_DIR, default ../content-input).
 * Sources are never modified; every output is a new file under assets/ or public/.
 *   - MEMO: the "2 ผู้ใช้งาน" counter is covered (in a derived copy) by blending the page background
 *     rows directly above and below the badge, so no digits or text remain.
 *   - Inside shots (already blurred by the PO): the bottom strip with the mouse cursor is cropped off.
 *   - Profile illustration: re-encoded copy for next/image + a ≤600 px copy at a stable public URL for JSON-LD.
 *     The approved source is 600×720. Outputs are never enlarged past it.
 * Never point this at unblurred originals (any `screenshots/` folder) or design/raw.
 *   node scripts/derive-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = path.resolve(process.cwd(), process.env.CONTENT_INPUT_DIR ?? '../content-input');
const OUT = path.resolve(process.cwd(), 'assets/images');
if (/(^|\/)(screenshots|raw)(\/|$)/i.test(SRC)) throw new Error('forbidden source');

const src = (p) => path.join(SRC, p);
const out = (p) => {
  const f = path.join(OUT, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  return f;
};

async function memo() {
  // Counter badge sits at ~x 160–262, y 612–660 on the 1440×900 landing shot. Each pixel in the box is
  // replaced by a vertical blend of the background rows just above and below it (no seam, no text left).
  const box = { left: 150, top: 604, width: 130, height: 64 };
  const { data, info } = await sharp(src('projects/memo.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const at = (x, y) => (y * info.width + x) * ch;
  for (let x = box.left; x < box.left + box.width; x++) {
    const a = at(x, box.top - 1);
    const b = at(x, box.top + box.height);
    for (let y = box.top; y < box.top + box.height; y++) {
      const t = (y - box.top + 1) / (box.height + 1);
      const o = at(x, y);
      for (let c = 0; c < ch; c++) data[o + c] = Math.round(data[a + c] * (1 - t) + data[b + c] * t);
    }
  }
  await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(out('projects/memo/landing.png'));
}

async function inside(file, slug, name) {
  const img = sharp(src(`projects/inside/${file}`));
  const { width, height } = await img.metadata();
  await img
    .extract({ left: 0, top: 0, width: width - 14, height: height - 44 }) // drop scrollbar + cursor strip
    .png({ compressionLevel: 9 })
    .toFile(out(`projects/${slug}/${name}.png`));
}

async function copy(file, slug, name) {
  await sharp(src(`projects/${file}`)).png({ compressionLevel: 9 }).toFile(out(`projects/${slug}/${name}.png`));
}

async function photo() {
  // 5:6 illustration (600×720). Re-encode only; never enlarge past the source.
  const input = src('profile-collage-news-glasses.jpg');
  const { width: srcW, height: srcH } = await sharp(input).metadata();
  if (!srcW || !srcH) throw new Error('profile source has no dimensions');

  const master = out('profile/photo.jpg');
  await sharp(input)
    .resize({ width: srcW, height: srcH, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(master);

  const pub = path.resolve(process.cwd(), 'public/images/profile.jpg');
  fs.mkdirSync(path.dirname(pub), { recursive: true });
  await sharp(input)
    .resize({ width: Math.min(600, srcW), fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(pub);

  for (const file of [master, pub]) {
    const meta = await sharp(file).metadata();
    if ((meta.width ?? 0) > srcW || (meta.height ?? 0) > srcH) {
      throw new Error(`${file} is ${meta.width}x${meta.height}, larger than source ${srcW}x${srcH}`);
    }
  }
}

await memo();
await copy('p3.png', 'p3', 'home');
await inside('app2_01_dashboard.png', 'labwise', 'dashboard');
await inside('app2_02_incident_list.png', 'labwise', 'incidents');
await inside('app2_03_analysis_chart.png', 'labwise', 'analysis');
await inside('app1_01_dashboard.png', 'signal-controlbridge', 'dashboard');
await inside('app1_03_channel_detail.png', 'signal-controlbridge', 'channel');
await photo();
console.log('[derive-images] done');
