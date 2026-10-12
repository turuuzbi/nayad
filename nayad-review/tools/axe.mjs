#!/usr/bin/env node
// axe-core accessibility scan of public URLs at 390x844, light and dark color scheme.
//
//   node axe.mjs <url> [<url> ...] [--label live]
//
// Writes findings/raw/<label>/axe.json and axe.md. Read-only: loads pages, runs axe, nothing else.

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const reviewRoot = path.resolve(here, "..");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const argv = process.argv.slice(2);
const label = argv.includes("--label") ? argv[argv.indexOf("--label") + 1] : "live";
const urls = argv.filter((a) => /^https?:/.test(a));
if (!urls.length) {
  console.error("usage: node axe.mjs <url> [<url> ...] [--label live]");
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: existsSync(CHROME) ? CHROME : undefined, args: ["--no-sandbox"] });
const out = [];
for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: scheme,
  });
  for (const url of urls) {
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    const res = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();
    out.push({
      url,
      scheme,
      violations: res.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        tags: v.tags.filter((t) => t.startsWith("wcag")),
        nodes: v.nodes.map((n) => ({ target: n.target.join(" "), summary: n.failureSummary })),
      })),
      passes: res.passes.length,
      incomplete: res.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
    });
    await page.close();
  }
  await ctx.close();
}
await browser.close();

const outDir = path.join(reviewRoot, "findings", "raw", label);
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "axe.json"), JSON.stringify(out, null, 2));
const md = [
  `# axe-core scan (${label})`,
  ``,
  `Viewport 390x844, tags: WCAG 2.0/2.1/2.2 A+AA, best-practice.`,
  ``,
  `| URL | Scheme | Violations | Passed rules | Needs review |`,
  `|---|---|---|---|---|`,
  ...out.map((r) => `| ${r.url} | ${r.scheme} | ${r.violations.length} | ${r.passes} | ${r.incomplete.length} |`),
  ``,
  ...out.flatMap((r) =>
    r.violations.length
      ? [
          `## ${r.url} (${r.scheme})`,
          ``,
          ...r.violations.map(
            (v) => `- **${v.id}** (${v.impact}) ${v.help} — ${v.nodes.length} node(s), e.g. \`${v.nodes[0]?.target}\``,
          ),
          ``,
        ]
      : [],
  ),
];
await writeFile(path.join(outDir, "axe.md"), md.join("\n"));
console.log(md.join("\n"));
