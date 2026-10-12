#!/usr/bin/env node
// Passive, read-only capture of a public website.
//
//   node capture.mjs <baseUrl> [--label live] [--max-pages 15] [--paths /,/login]
//
// What it does (GET requests only, sequential, with a delay between pages):
//   - discovers same-origin public pages by following <a href> links from the start page
//   - full-page screenshots at 390x844, 768x1024, 1440x900 in light and dark color scheme
//   - saves the server HTML, the rendered DOM, and the document response headers
//   - saves robots.txt, sitemap.xml, the web app manifest and the service worker script
//   - records every loaded resource (type, status, transfer/decoded size, cache headers)
//   - extracts page facts: <title>, meta tags, OG/Twitter, canonical, lang, JSON-LD,
//     heading outline, emoji used as content, interactive elements smaller than 44px,
//     cookie names and flags (never values)
//
// What it never does: submit forms, log in, type into inputs, click buttons, call APIs,
// or send anything other than ordinary page/asset GET requests a browser would send.

import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanForSecrets } from "./lib/secret-scan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const reviewRoot = path.resolve(here, "..");

const VIEWPORTS = [
  { name: "390", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: "768", viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  { name: "1440", viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
];
const contextOptions = ({ name, ...options }) => options;
const SCHEMES = ["light", "dark"];
const SKIP_PATH = /(logout|signout|sign-out|delete|remove|api\/|\/auth\/callback|\.(pdf|zip|apk|ipa)$)/i;
const POLITE_DELAY_MS = 1000;

function parseArgs(argv) {
  const args = { label: "live", maxPages: 15, paths: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--label") args.label = argv[++i];
    else if (a === "--max-pages") args.maxPages = Number(argv[++i]);
    else if (a === "--paths") args.paths = argv[++i].split(",");
    else rest.push(a);
  }
  if (!rest[0]) {
    console.error("usage: node capture.mjs <baseUrl> [--label live] [--max-pages 15] [--paths /,/x]");
    process.exit(2);
  }
  args.base = new URL(rest[0]);
  return args;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugFor(u) {
  const p = (u.pathname + u.search).replace(/\/+$/, "") || "/";
  if (p === "/") return "home";
  return p.replace(/^\//, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
}

function chromiumExecutable() {
  // Use the browser build that ships with this environment when present.
  const candidate = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
  return existsSync(candidate) ? candidate : undefined;
}

async function fetchText(context, url) {
  try {
    const res = await context.request.get(url, { timeout: 20000, maxRedirects: 5 });
    return { url, status: res.status(), headers: res.headers(), body: await res.text() };
  } catch (err) {
    return { url, status: 0, error: String(err) };
  }
}

// Runs in the page. Collects facts for the audit; reads the DOM only.
function pageFactsInBrowser() {
  const meta = (sel) => document.querySelector(sel)?.getAttribute("content") ?? null;
  const metaAll = (prefix) =>
    Object.fromEntries(
      [...document.querySelectorAll(`meta[property^="${prefix}"], meta[name^="${prefix}"]`)].map((m) => [
        m.getAttribute("property") || m.getAttribute("name"),
        m.getAttribute("content"),
      ]),
    );
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => ({
    level: Number(h.tagName[1]),
    text: h.textContent.trim().replace(/\s+/g, " ").slice(0, 120),
  }));
  const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
    try {
      return JSON.parse(s.textContent);
    } catch {
      return { parseError: true, raw: s.textContent.slice(0, 500) };
    }
  });

  // Emoji used as content (outside aria-hidden subtrees is what matters for screen readers).
  // Emoji_Presentation, or a pictograph forced to emoji style with VS16; plain text symbols
  // such as © and ™ are not counted.
  const emojiRe = /\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F/u;
  const emoji = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode() && emoji.length < 50) {
    const t = walker.currentNode.textContent;
    const el = walker.currentNode.parentElement;
    if (!el || el.closest("script,style,noscript,template")) continue;
    if (emojiRe.test(t)) {
      emoji.push({
        tag: el.tagName.toLowerCase(),
        text: t.trim().slice(0, 80),
        ariaHidden: !!el.closest('[aria-hidden="true"]'),
        hasLabel: !!el.closest("[aria-label],[role=img]"),
      });
    }
  }

  // Interactive elements and their rendered size.
  const interactiveSel =
    'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [tabindex]:not([tabindex="-1"])';
  const small = [];
  for (const el of document.querySelectorAll(interactiveSel)) {
    let r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (r.width === 0 || r.height === 0 || style.visibility === "hidden" || style.display === "none") continue;
    // Visually hidden until focused (e.g. a skip link): not a touch target.
    if (r.width <= 1 && r.height <= 1) continue;
    // A checkbox/radio's real target includes its <label>.
    for (const label of el.labels ?? []) {
      const lr = label.getBoundingClientRect();
      if (lr.width * lr.height > r.width * r.height) r = lr;
    }
    if (r.width < 44 || r.height < 44) {
      small.push({
        tag: el.tagName.toLowerCase(),
        name: (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "")
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 60),
        width: Math.round(r.width),
        height: Math.round(r.height),
        under24: r.width < 24 || r.height < 24,
        inlineInText: el.tagName === "A" && style.display === "inline",
      });
    }
  }

  const imgs = [...document.images].map((i) => ({
    src: i.currentSrc || i.src,
    alt: i.getAttribute("alt"),
    width: i.naturalWidth,
    height: i.naturalHeight,
    rendered: [Math.round(i.getBoundingClientRect().width), Math.round(i.getBoundingClientRect().height)],
    loading: i.getAttribute("loading"),
    hasDimensions: i.hasAttribute("width") && i.hasAttribute("height"),
  }));

  const forms = [...document.forms].map((f) => ({
    action: f.getAttribute("action"),
    method: f.getAttribute("method"),
    fields: [...f.elements]
      .filter((e) => e.name || e.id)
      .map((e) => ({
        tag: e.tagName.toLowerCase(),
        type: e.type,
        name: e.name || e.id,
        autocomplete: e.getAttribute("autocomplete"),
        inputmode: e.getAttribute("inputmode"),
        hasLabel: !!(e.labels && e.labels.length) || !!e.getAttribute("aria-label"),
        placeholderOnly: !(e.labels && e.labels.length) && !!e.getAttribute("placeholder"),
      })),
  }));

  return {
    url: location.href,
    title: document.title,
    lang: document.documentElement.getAttribute("lang"),
    dir: document.documentElement.getAttribute("dir"),
    viewport: meta('meta[name="viewport"]'),
    description: meta('meta[name="description"]'),
    robots: meta('meta[name="robots"]'),
    themeColor: [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => ({
      content: m.getAttribute("content"),
      media: m.getAttribute("media"),
    })),
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => ({
      hreflang: l.getAttribute("hreflang"),
      href: l.href,
    })),
    manifest: document.querySelector('link[rel="manifest"]')?.href ?? null,
    appleTouchIcon: [...document.querySelectorAll('link[rel="apple-touch-icon"]')].map((l) => l.href),
    icons: [...document.querySelectorAll('link[rel~="icon"]')].map((l) => ({
      href: l.href,
      sizes: l.getAttribute("sizes"),
      type: l.getAttribute("type"),
    })),
    og: metaAll("og:"),
    twitter: metaAll("twitter:"),
    jsonLd,
    headings,
    h1Count: headings.filter((h) => h.level === 1).length,
    emoji,
    smallTargets: small,
    images: imgs,
    forms,
    framework: {
      nextData: !!document.getElementById("__NEXT_DATA__"),
      nextAppRouter: !!document.querySelector('script[src*="/_next/"]') && !document.getElementById("__NEXT_DATA__"),
      nextAssets: [...document.querySelectorAll("script[src], link[href]")].some((e) =>
        (e.src || e.href || "").includes("/_next/"),
      ),
      reactRoot: !!document.querySelector("[data-reactroot], #__next, #root"),
      vite: !!document.querySelector('script[type="module"][src*="/assets/"]'),
    },
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
    textLength: document.body.innerText.length,
    sameOriginLinks: [...document.querySelectorAll("a[href]")]
      .map((a) => a.href)
      .filter((h) => {
        try {
          return new URL(h).origin === location.origin;
        } catch {
          return false;
        }
      }),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const shotDir = path.join(reviewRoot, "screenshots", args.label);
  const rawDir = path.join(reviewRoot, "findings", "raw", args.label);
  await mkdir(shotDir, { recursive: true });
  await mkdir(rawDir, { recursive: true });

  const browser = await chromium.launch({ executablePath: chromiumExecutable(), args: ["--no-sandbox"] });
  const log = [];
  const say = (m) => {
    console.log(m);
    log.push(m);
  };

  // 1) Discovery + per-page capture at mobile/light, which also records resources.
  const queue = (args.paths ?? ["/"]).map((p) => new URL(p, args.base));
  const seen = new Set();
  const pages = [];
  const allResources = [];
  const secretFindings = [];
  const context = await browser.newContext({ ...contextOptions(VIEWPORTS[0]), colorScheme: "light" });

  while (queue.length && pages.length < args.maxPages) {
    const u = queue.shift();
    u.hash = "";
    const key = u.pathname.replace(/\/+$/, "") + u.search;
    if (seen.has(key) || SKIP_PATH.test(u.pathname)) continue;
    seen.add(key);

    const page = await context.newPage();
    const resources = [];
    page.on("requestfinished", async (req) => {
      try {
        const res = await req.response();
        const sizes = await req.sizes();
        const h = res ? await res.allHeaders() : {};
        // Passive: scan only what the page already downloaded. Values are never stored.
        if (res && ["script", "document"].includes(req.resourceType())) {
          secretFindings.push(...scanForSecrets(await res.text().catch(() => ""), req.url()));
        }
        resources.push({
          url: req.url(),
          type: req.resourceType(),
          status: res?.status() ?? 0,
          transferBytes: sizes.responseBodySize + sizes.responseHeadersSize,
          bodyBytes: sizes.responseBodySize,
          contentType: h["content-type"] ?? null,
          contentEncoding: h["content-encoding"] ?? null,
          cacheControl: h["cache-control"] ?? null,
          thirdParty: new URL(req.url()).hostname !== args.base.hostname,
        });
      } catch {
        /* resource raced with page close */
      }
    });
    page.on("requestfailed", (req) =>
      resources.push({ url: req.url(), type: req.resourceType(), status: 0, failure: req.failure()?.errorText }),
    );

    let docResponse;
    try {
      docResponse = await page.goto(u.href, { waitUntil: "networkidle", timeout: 45000 });
    } catch (err) {
      say(`! ${u.href}: ${err.message.split("\n")[0]}`);
      await page.close();
      pages.push({ url: u.href, error: err.message.split("\n")[0] });
      continue;
    }
    await sleep(500);

    const slug = slugFor(new URL(page.url()));
    const facts = await page.evaluate(pageFactsInBrowser);
    const serverHtml = docResponse ? await docResponse.text().catch(() => "") : "";
    const headers = docResponse ? await docResponse.allHeaders() : {};
    const cookies = (await context.cookies()).map(({ name, domain, path: p, secure, httpOnly, sameSite, expires }) => ({
      name,
      domain,
      path: p,
      secure,
      httpOnly,
      sameSite,
      expires,
    }));
    const swRegistrations = await page
      .evaluate(async () =>
        "serviceWorker" in navigator
          ? (await navigator.serviceWorker.getRegistrations()).map((r) => ({
              scope: r.scope,
              script: (r.active || r.waiting || r.installing)?.scriptURL ?? null,
            }))
          : null,
      )
      .catch(() => null);

    await writeFile(path.join(rawDir, `${slug}.server.html`), serverHtml);
    await writeFile(path.join(rawDir, `${slug}.rendered.html`), await page.content());
    await writeFile(
      path.join(rawDir, `${slug}.headers.json`),
      JSON.stringify({ url: page.url(), status: docResponse?.status(), redirectedFrom: u.href, headers }, null, 2),
    );
    await writeFile(path.join(rawDir, `${slug}.facts.json`), JSON.stringify(facts, null, 2));

    pages.push({
      url: page.url(),
      slug,
      status: docResponse?.status(),
      serverHtmlBytes: Buffer.byteLength(serverHtml),
      serverHtmlHasText: serverHtml.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, "").trim().length,
      renderedTextLength: facts.textLength,
      cookies,
      serviceWorkers: swRegistrations,
      resources,
    });
    allResources.push(...resources.map((r) => ({ page: slug, ...r })));
    say(`✓ ${page.url()} (${resources.length} resources)`);

    for (const href of facts.sameOriginLinks) {
      const next = new URL(href);
      next.hash = "";
      const k = next.pathname.replace(/\/+$/, "") + next.search;
      if (!seen.has(k) && !SKIP_PATH.test(next.pathname)) queue.push(next);
    }
    await page.close();
    await sleep(POLITE_DELAY_MS);
  }
  await context.close();

  // 2) Screenshots: every page x viewport x scheme. Detect whether dark mode changes anything.
  const darkSupport = {};
  for (const vp of VIEWPORTS) {
    for (const scheme of SCHEMES) {
      const ctx = await browser.newContext({ ...contextOptions(vp), colorScheme: scheme });
      for (const p of pages.filter((x) => !x.error)) {
        const page = await ctx.newPage();
        try {
          await page.goto(p.url, { waitUntil: "networkidle", timeout: 45000 });
          await sleep(400);
          const file = path.join(shotDir, `${p.slug}__${vp.name}__${scheme}.png`);
          await page.screenshot({ path: file, fullPage: true });
          if (vp.name === "390") {
            await page.screenshot({ path: path.join(shotDir, `${p.slug}__${vp.name}__${scheme}__fold.png`) });
            const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
            darkSupport[p.slug] = { ...(darkSupport[p.slug] ?? {}), [scheme]: bg };
          }
        } catch (err) {
          say(`! screenshot ${p.url} ${vp.name} ${scheme}: ${err.message.split("\n")[0]}`);
        }
        await page.close();
        await sleep(POLITE_DELAY_MS / 2);
      }
      await ctx.close();
    }
  }

  // 3) Site-level files.
  const ctx = await browser.newContext();
  const robots = await fetchText(ctx, new URL("/robots.txt", args.base).href);
  const sitemap = await fetchText(ctx, new URL("/sitemap.xml", args.base).href);
  await writeFile(path.join(rawDir, "robots.txt"), robots.body ?? `# fetch failed: ${robots.status} ${robots.error ?? ""}`);
  await writeFile(path.join(rawDir, "sitemap.xml"), sitemap.body ?? `<!-- fetch failed: ${sitemap.status} -->`);

  const homeFacts = pages[0]?.slug
    ? JSON.parse(await readFile(path.join(rawDir, `${pages[0].slug}.facts.json`), "utf8"))
    : null;
  let manifest = null;
  if (homeFacts?.manifest) {
    manifest = await fetchText(ctx, homeFacts.manifest);
    await writeFile(path.join(rawDir, "manifest.json"), manifest.body ?? "");
  }
  const swScripts = [...new Set(pages.flatMap((p) => (p.serviceWorkers ?? []).map((s) => s.script)).filter(Boolean))];
  for (const [i, sw] of swScripts.entries()) {
    const r = await fetchText(ctx, sw);
    await writeFile(path.join(rawDir, `service-worker-${i}.js`), r.body ?? "");
  }
  await ctx.close();
  await browser.close();

  // 4) Summaries.
  const byType = {};
  for (const r of allResources.filter((r) => r.page === pages[0]?.slug)) {
    const t = (byType[r.type] ??= { count: 0, transferBytes: 0, bodyBytes: 0 });
    t.count++;
    t.transferBytes += r.transferBytes ?? 0;
    t.bodyBytes += r.bodyBytes ?? 0;
  }
  const summary = {
    capturedAt: new Date().toISOString(),
    base: args.base.href,
    label: args.label,
    pages: pages.map(({ resources, ...p }) => p),
    homeResourceTotals: byType,
    robots: { status: robots.status },
    sitemap: { status: sitemap.status },
    manifest: manifest ? { url: homeFacts.manifest, status: manifest.status } : null,
    serviceWorkerScripts: swScripts,
    darkModeBodyBackground: darkSupport,
    secretFindings,
    log,
  };
  await writeFile(path.join(rawDir, "summary.json"), JSON.stringify(summary, null, 2));
  await writeFile(path.join(rawDir, "resources.json"), JSON.stringify(allResources, null, 2));

  const kb = (b) => (b / 1024).toFixed(1);
  const lines = [
    `# Capture summary: ${args.base.href} (${args.label})`,
    ``,
    `Captured ${summary.capturedAt}. Pages: ${pages.length}.`,
    ``,
    `| Page | Status | Server HTML text chars | Rendered text chars |`,
    `|---|---|---|---|`,
    ...pages.map((p) => `| ${p.url} | ${p.status ?? p.error} | ${p.serverHtmlHasText ?? "-"} | ${p.renderedTextLength ?? "-"} |`),
    ``,
    `## Home page resources by type`,
    ``,
    `| Type | Count | Transfer KB | Body KB |`,
    `|---|---|---|---|`,
    ...Object.entries(byType).map(([t, v]) => `| ${t} | ${v.count} | ${kb(v.transferBytes)} | ${kb(v.bodyBytes)} |`),
    ``,
    `## All resources (home page)`,
    ``,
    `| Type | Status | Transfer KB | Encoding | Cache-Control | 3rd party | URL |`,
    `|---|---|---|---|---|---|---|`,
    ...allResources
      .filter((r) => r.page === pages[0]?.slug)
      .sort((a, b) => (b.transferBytes ?? 0) - (a.transferBytes ?? 0))
      .map(
        (r) =>
          `| ${r.type} | ${r.status} | ${kb(r.transferBytes ?? 0)} | ${r.contentEncoding ?? ""} | ${r.cacheControl ?? ""} | ${r.thirdParty ? "yes" : ""} | ${r.url.slice(0, 120)} |`,
      ),
    ``,
    `robots.txt: ${robots.status} · sitemap.xml: ${sitemap.status} · manifest: ${manifest?.status ?? "none linked"} · service workers: ${swScripts.length}`,
    ``,
    `Dark mode (body background, light vs dark): ${JSON.stringify(darkSupport)}`,
    ``,
    `## Client-side secret scan (passive; values never stored)`,
    ``,
    ...(secretFindings.length
      ? secretFindings.map((f) => `- **${f.severity}** ${f.kind} in ${f.where} — ${f.detail}`)
      : ["- nothing found in downloaded HTML/JS"]),
  ];
  await writeFile(path.join(rawDir, "summary.md"), lines.join("\n") + "\n");
  say(`done → ${path.relative(reviewRoot, rawDir)}, ${path.relative(reviewRoot, shotDir)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
