#!/usr/bin/env node
// Lighthouse (mobile, default config: Moto G Power emulation, simulated slow 4G) against public URLs.
//
//   node lighthouse.mjs <url> [--label live] [--runs 3]
//
// Runs N times, keeps the median run by performance score, and writes
// findings/raw/<label>/lighthouse-<slug>.{json,html} plus lighthouse-<slug>.md.
// Note: INP is a field metric (real users); lab navigation runs report TBT as its proxy.

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const reviewRoot = path.resolve(here, "..");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const argv = process.argv.slice(2);
const url = argv.find((a) => /^https?:/.test(a));
const label = argv.includes("--label") ? argv[argv.indexOf("--label") + 1] : "live";
const runs = argv.includes("--runs") ? Number(argv[argv.indexOf("--runs") + 1]) : 3;
if (!url) {
  console.error("usage: node lighthouse.mjs <url> [--label live] [--runs 3]");
  process.exit(2);
}

const METRICS = [
  ["first-contentful-paint", "FCP"],
  ["largest-contentful-paint", "LCP"],
  ["cumulative-layout-shift", "CLS"],
  ["total-blocking-time", "TBT"],
  ["speed-index", "Speed Index"],
  ["total-byte-weight", "Total bytes"],
];

function slugFor(u) {
  const p = new URL(u).pathname.replace(/\/+$/, "");
  return p ? p.slice(1).replace(/[^a-zA-Z0-9._-]+/g, "_") : "home";
}

async function once() {
  const chrome = await chromeLauncher.launch({
    chromePath: existsSync(CHROME) ? CHROME : undefined,
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });
  try {
    const result = await lighthouse(url, { port: chrome.port, output: ["json", "html"], logLevel: "error" });
    return result;
  } finally {
    await chrome.kill();
  }
}

const results = [];
for (let i = 0; i < runs; i++) {
  const r = await once();
  const perf = r.lhr.categories.performance?.score;
  console.log(`run ${i + 1}/${runs}: performance ${Math.round((perf ?? 0) * 100)}`);
  results.push(r);
}
results.sort((a, b) => (a.lhr.categories.performance.score ?? 0) - (b.lhr.categories.performance.score ?? 0));
const median = results[Math.floor(results.length / 2)];
const { lhr } = median;

const outDir = path.join(reviewRoot, "findings", "raw", label);
await mkdir(outDir, { recursive: true });
const slug = slugFor(url);
await writeFile(path.join(outDir, `lighthouse-${slug}.json`), median.report[0]);
await writeFile(path.join(outDir, `lighthouse-${slug}.html`), median.report[1]);

const score = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100);
const allPerf = results.map((r) => Math.round(r.lhr.categories.performance.score * 100));
const failing = Object.entries(lhr.categories).flatMap(([cat, c]) =>
  c.auditRefs
    .map((ref) => lhr.audits[ref.id])
    .filter((a) => a && a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative")
    .map((a) => `| ${cat} | ${a.id} | ${a.title.replace(/\|/g, "\\|")} | ${a.displayValue ?? ""} |`),
);

const md = [
  `# Lighthouse (mobile) — ${url}`,
  ``,
  `Lighthouse ${lhr.lighthouseVersion}, ${lhr.fetchTime}, ${runs} runs (performance: ${allPerf.join(", ")}), median shown.`,
  `Emulation: ${lhr.configSettings.formFactor}, throttling ${lhr.configSettings.throttlingMethod}.`,
  ``,
  `| Performance | Accessibility | Best practices | SEO |`,
  `|---|---|---|---|`,
  `| ${score("performance")} | ${score("accessibility")} | ${score("best-practices")} | ${score("seo")} |`,
  ``,
  `| Metric | Value |`,
  `|---|---|`,
  ...METRICS.map(([id, name]) => `| ${name} | ${lhr.audits[id]?.displayValue ?? "n/a"} |`),
  `| INP | not measurable in a lab navigation run (field metric); TBT is the lab proxy |`,
  ``,
  `## Audits scoring below 0.9`,
  ``,
  `| Category | Audit id | Title | Value |`,
  `|---|---|---|---|`,
  ...(failing.length ? failing : ["| — | — | none | |"]),
  ``,
];
await writeFile(path.join(outDir, `lighthouse-${slug}.md`), md.join("\n"));
console.log(md.slice(0, 16).join("\n"));
