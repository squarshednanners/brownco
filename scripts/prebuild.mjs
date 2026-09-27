// Runs before `astro dev` and `astro build` (via tsx, so it can import business.ts directly).
//  (a) Photos in public/images/ → WebP variants + src/generated/images.json (sizes for <picture>)
//  (b) Logos in public/logo/ → WebP copies (same manifest, keyed "logo/<file>")
//  (c) public/logo/brown-co-icon.png → favicon set + site.webmanifest
//  (d) public/logo/brown-co-logo.png → og-image.png (1200x630 social share image)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { business } from '../src/config/business.ts';

const PUBLIC = 'public';
const IMAGES = join(PUBLIC, 'images');
const LOGOS = join(PUBLIC, 'logo');
const GENERATED = join(IMAGES, '_generated');
const MANIFEST = join('src', 'generated', 'images.json');
const ICON = join(LOGOS, 'brown-co-icon.png');
const LOGO = join(LOGOS, 'brown-co-logo.png');
const WIDTHS = [480, 960, 1600];
const CREAM = '#F5F0E6';

// ---------- V-PHOTO: every photo named in business.ts must exist ----------
for (const [key, photo] of Object.entries(business.photos)) {
  if (!existsSync(join(IMAGES, photo.file))) {
    console.error(`\nbusiness.ts → photos.${key}.file: "${photo.file}" not found in public/images/\n`);
    process.exit(1);
  }
}

mkdirSync(GENERATED, { recursive: true });
mkdirSync(join('src', 'generated'), { recursive: true });
const manifest = {};

/** Writes WebP variants of src at the given widths (never upscaled) and records them. */
async function variants(src, key, name, widths, quality) {
  const { width, height } = await sharp(src).metadata();
  const webp = [];
  for (const w of widths) {
    const target = Math.min(w, width);
    if (webp.some((v) => v.w === target)) continue;
    const out = `images/_generated/${name}-${target}.webp`;
    await sharp(src).resize({ width: target }).webp({ quality, alphaQuality: 90 }).toFile(join(PUBLIC, out));
    webp.push({ src: out, w: target });
  }
  manifest[key] = { width, height, webp };
}

// ---------- (a) Photos ----------
for (const file of readdirSync(IMAGES)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;
  await variants(join(IMAGES, file), file, parse(file).name, WIDTHS, 72);
}

// ---------- (b) Logos (owner-supplied PNGs; keep native size, lossless-ish WebP) ----------
for (const file of readdirSync(LOGOS)) {
  if (!/\.png$/i.test(file)) continue;
  const src = join(LOGOS, file);
  const { width } = await sharp(src).metadata();
  await variants(src, `logo/${file}`, parse(file).name, [width], 90);
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

// ---------- (c) Favicons from the square icon ----------
const icon = (size) => sharp(ICON).resize(size, size).flatten({ background: CREAM }).png().toBuffer();
writeFileSync(join(PUBLIC, 'apple-touch-icon.png'), await icon(180));
writeFileSync(join(PUBLIC, 'icon-192.png'), await icon(192));
writeFileSync(join(PUBLIC, 'icon-512.png'), await icon(512));
writeFileSync(join(PUBLIC, 'favicon.ico'), await pngToIco([await icon(32)]));
writeFileSync(
  join(PUBLIC, 'site.webmanifest'),
  JSON.stringify(
    {
      name: business.name,
      short_name: business.shortName,
      theme_color: '#3B2A1A',
      background_color: CREAM,
      display: 'browser',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);

// ---------- (d) Social share image ----------
const logo = await sharp(LOGO).resize({ width: 760 }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: CREAM } })
  .composite([{ input: logo, left: Math.round((1200 - logoMeta.width) / 2), top: Math.round((630 - logoMeta.height) / 2) }])
  .png()
  .toFile(join(PUBLIC, 'og-image.png'));

console.log(`prebuild: ${Object.keys(manifest).length} image(s)/logo(s), favicon set, og-image ready`);
