// Renders the pixel ghost into app icons, favicon and iOS splash screens.
// Usage: npm run icons   (requires Node ≥ 22.18 for .ts imports)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { ghostIdle } from '../src/components/pixel/sprites.ts';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pub = path.join(root, 'public');
const BG = '#F3EEE6';
const SHADOW = '#E2D8C8';

/** Sprite → SVG <rect>s at a given offset/scale (units = sprite pixels). */
function spriteRects(sprite, ox, oy) {
  let out = '';
  sprite.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const fill = sprite.palette[ch];
      if (ch !== '.' && fill) out += `<rect x="${ox + x}" y="${oy + y}" width="${end - x}" height="1" fill="${fill}"/>`;
      x = end;
    }
  });
  return out;
}

/** Square icon: ghost centered on a `units`-wide canvas. */
function iconSvg(units, { rounded = false, bg = true } = {}) {
  const ox = (units - ghostIdle.w) / 2;
  const oy = (units - ghostIdle.h) / 2 - 0.5;
  const r = rounded ? units * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${units} ${units}" shape-rendering="crispEdges">
${bg ? `<rect width="${units}" height="${units}" rx="${r}" fill="${BG}"/>` : ''}
<rect x="${units / 2 - 4}" y="${oy + ghostIdle.h + 0.5}" width="8" height="1" fill="${SHADOW}"/>
${spriteRects(ghostIdle, ox, oy)}
</svg>`;
}

async function png(svg, size, file) {
  await sharp(Buffer.from(svg), { density: 600 })
    .resize(size, size, { kernel: 'nearest' })
    .png()
    .toFile(path.join(pub, file));
  console.log('✓', file);
}

const SPLASHES = [
  [440, 956, 3],
  [430, 932, 3],
  [428, 926, 3],
  [402, 874, 3],
  [393, 852, 3],
  [390, 844, 3],
  [375, 812, 3],
  [414, 896, 2],
  [375, 667, 2]
];

async function splash(w, h, dpr) {
  const W = w * dpr;
  const H = h * dpr;
  const px = Math.round((W * 0.26) / ghostIdle.w); // device px per sprite pixel
  const gw = ghostIdle.w * px;
  const left = Math.round((W - gw) / 2);
  const top = Math.round((H - gw) / 2 - H * 0.04);
  const ghost = await sharp(Buffer.from(iconSvg(ghostIdle.w + 2, { bg: false })), { density: 600 })
    .resize(gw + 2 * px, gw + 2 * px, { kernel: 'nearest' })
    .png()
    .toBuffer();
  const file = `splash/splash-${W}x${H}.png`;
  await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
    .composite([{ input: ghost, left: left - px, top: top - px }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(pub, file));
  console.log('✓', file);
  return `<link rel="apple-touch-startup-image" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)" href="/${file}" />`;
}

await mkdir(path.join(pub, 'splash'), { recursive: true });

await writeFile(path.join(pub, 'favicon.svg'), iconSvg(20, { rounded: true }));
console.log('✓ favicon.svg');
await png(iconSvg(22), 180, 'apple-touch-icon.png');
await png(iconSvg(22), 192, 'icon-192.png');
await png(iconSvg(22), 512, 'icon-512.png');
await png(iconSvg(30), 512, 'icon-maskable-512.png');

const links = [];
for (const [w, h, d] of SPLASHES) links.push(await splash(w, h, d));

const indexPath = path.join(root, 'index.html');
const html = await readFile(indexPath, 'utf8');
const updated = html.replace(
  /<!-- SPLASH:START -->[\s\S]*<!-- SPLASH:END -->/,
  `<!-- SPLASH:START -->\n    ${links.join('\n    ')}\n    <!-- SPLASH:END -->`
);
await writeFile(indexPath, updated);
console.log('✓ index.html splash links');
