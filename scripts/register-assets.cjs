// Lets build scripts (run with tsx) import image assets like Next does:
// `import img from './x.svg'` → { src, width, height } (size read from the SVG/PNG/JPEG header).
const fs = require('node:fs');

function imageInfo(file) {
  let width = 0;
  let height = 0;
  if (file.endsWith('.svg')) {
    const head = fs.readFileSync(file, 'utf8').slice(0, 500);
    width = Number((head.match(/width="(\d+)/) || [])[1] || 0);
    height = Number((head.match(/height="(\d+)/) || [])[1] || 0);
  } else if (file.endsWith('.png')) {
    const b = fs.readFileSync(file);
    width = b.readUInt32BE(16);
    height = b.readUInt32BE(20);
  } else if (/\.jpe?g$/.test(file)) {
    // Walk JPEG markers to the first SOFn frame header.
    const b = fs.readFileSync(file);
    let i = 2;
    while (i < b.length) {
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        height = b.readUInt16BE(i + 5);
        width = b.readUInt16BE(i + 7);
        break;
      }
      i += 2 + len;
    }
  }
  return { src: file, width, height };
}

for (const ext of ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif']) {
  require.extensions[ext] = (module, filename) => {
    module.exports = { __esModule: true, default: imageInfo(filename) };
  };
}
