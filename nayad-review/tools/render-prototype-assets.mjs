#!/usr/bin/env node
// Renders the prototype's raster assets from original SVG/HTML with headless Chromium:
// PWA icons (192, 512, maskable 512), apple-icon (180), favicon.ico (32), og.png (1200x630).
//
//   node render-prototype-assets.mjs

import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const proto = path.resolve(here, "../prototype");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const N_PATH = "M10.5 22V10l11 12V10";
const mark = (size, { radius = 9, pad = 0 } = {}) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-pad} ${-pad} ${32 + 2 * pad} ${32 + 2 * pad}">
    <rect x="${-pad}" y="${-pad}" width="${32 + 2 * pad}" height="${32 + 2 * pad}" rx="${pad ? 0 : radius}" fill="#FFC107"/>
    <path d="${N_PATH}" fill="none" stroke="#1A1A1A" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const page = (body, w, h) => `<!doctype html><html lang="mn"><head><meta charset="utf-8">
<style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:transparent}
body{font-family:Inter,"DejaVu Sans",sans-serif}</style></head><body>${body}</body></html>`;

const OG = `
<div style="width:1200px;height:630px;box-sizing:border-box;padding:72px 80px;background:#FFC107;color:#1A1A1A;display:flex;flex-direction:column;justify-content:space-between">
  <div style="display:flex;align-items:center;gap:20px">
    <svg width="72" height="72" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#1A1A1A"/>
      <path d="${N_PATH}" fill="none" stroke="#FFC107" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span style="font-size:44px;font-weight:800;letter-spacing:-0.5px">NAYAD</span>
  </div>
  <div>
    <div style="font-size:76px;line-height:1.05;font-weight:800;letter-spacing:-1.5px;max-width:980px">Өглөг, падаан, төлөлтөө нэг дор хөтлөөрэй</div>
    <div style="margin-top:28px;font-size:34px;font-weight:500">Жижиг бизнесийн тооцооны апп · nayad.store</div>
  </div>
</div>`;

// ICO container holding one PNG image (supported by every current browser).
function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([header, entry, png]);
}

const browser = await chromium.launch({ executablePath: existsSync(CHROME) ? CHROME : undefined, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const p = await ctx.newPage();

async function shot(html, w, h, omitBackground = true) {
  await p.setViewportSize({ width: w, height: h });
  await p.setContent(page(html, w, h));
  return p.screenshot({ omitBackground, clip: { x: 0, y: 0, width: w, height: h } });
}

const outputs = [
  ["public/icon-192.png", await shot(mark(192, { radius: 7 }), 192, 192)],
  ["public/icon-512.png", await shot(mark(512, { radius: 7 }), 512, 512)],
  // Maskable: full-bleed background, glyph inside the 80% safe zone.
  ["public/icon-maskable-512.png", await shot(mark(512, { pad: 6 }), 512, 512, false)],
  ["src/app/apple-icon.png", await shot(mark(180, { pad: 4 }), 180, 180, false)],
  ["public/og.png", await shot(OG, 1200, 630, false)],
];
const fav = await shot(mark(32, { radius: 8 }), 32, 32);
outputs.push(["src/app/favicon.ico", pngToIco(fav, 32)]);

for (const [rel, buf] of outputs) {
  await writeFile(path.join(proto, rel), buf);
  console.log(`${rel}  ${(buf.length / 1024).toFixed(1)} KB`);
}
await browser.close();
