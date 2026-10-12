#!/usr/bin/env node
// WCAG 2.x contrast ratios for the brand yellow against common text/background colors.
//
//   node contrast.mjs [#FFC107]
//
// Pure math, no network. AA needs 4.5:1 for body text, 3:1 for large text (>= 24px, or >= 18.66px bold)
// and for UI component boundaries/icons.

const brand = (process.argv[2] ?? "#FFC107").toUpperCase();

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
export function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const pairs = [
  ["#FFFFFF", "white text on yellow / yellow text on white"],
  ["#F5F5F5", "yellow on light-grey page background"],
  ["#000000", "black text on yellow"],
  ["#1A1A1A", "near-black text on yellow"],
  ["#212121", "Material grey 900 text on yellow"],
  ["#424242", "grey 800 text on yellow"],
  ["#757575", "grey 600 (muted) text on yellow"],
  ["#121212", "yellow on dark-mode surface"],
];
const verdict = (r) => (r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large/UI only" : "FAIL");

console.log(`| Other color | Use | Ratio vs ${brand} | WCAG |`);
console.log(`|---|---|---|---|`);
for (const [c, use] of pairs) {
  const r = ratio(brand, c);
  console.log(`| ${c} | ${use} | ${r.toFixed(2)}:1 | ${verdict(r)} |`);
}
