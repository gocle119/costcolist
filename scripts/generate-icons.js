// One-off/re-runnable icon generator. Run with: node scripts/generate-icons.js
// Rasterizes the SVG sources in public/ into the PNGs referenced by manifest.json and the HTML heads.
const path = require('path');
const sharp = require('sharp');

const PUBLIC = path.join(__dirname, '..', 'public');
const ICON_SVG = path.join(PUBLIC, 'icon.svg');
const MASKABLE_SVG = path.join(PUBLIC, 'icon-maskable-512.svg');

async function run() {
  await sharp(ICON_SVG).resize(192, 192).png().toFile(path.join(PUBLIC, 'icon-192.png'));
  await sharp(ICON_SVG).resize(512, 512).png().toFile(path.join(PUBLIC, 'icon-512.png'));
  await sharp(ICON_SVG).resize(180, 180).flatten({ background: '#E31837' }).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'));
  await sharp(ICON_SVG).resize(32, 32).png().toFile(path.join(PUBLIC, 'favicon.png'));
  await sharp(MASKABLE_SVG).resize(512, 512).png().toFile(path.join(PUBLIC, 'icon-maskable-512.png'));
  console.log('Icons generated in public/.');
}

run().catch(err => { console.error(err); process.exit(1); });
