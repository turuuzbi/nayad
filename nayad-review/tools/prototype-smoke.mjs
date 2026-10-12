#!/usr/bin/env node
// Interaction checks for the local prototype only (never run against the live site: it
// types into and submits a form).
//
//   node prototype-smoke.mjs http://localhost:3100/

import { chromium } from "playwright";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const here = path.dirname(fileURLToPath(import.meta.url));
const shots = path.resolve(here, "../screenshots/prototype");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const base = process.argv[2] ?? "http://localhost:3100/";
if (!/^http:\/\/(localhost|127\.0\.0\.1)/.test(base)) {
  console.error("Refusing to run: this script submits forms and is only for the local prototype.");
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: existsSync(CHROME) ? CHROME : undefined, args: ["--no-sandbox"] });
const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(`PASS  ${name}`);
  } catch (err) {
    results.push(`FAIL  ${name}: ${err.message.split("\n")[0]}`);
  }
};

const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));
await page.goto(base, { waitUntil: "networkidle" });

await check("viewport meta allows zoom", async () => {
  const vp = await page.getAttribute('meta[name="viewport"]', "content");
  assert.ok(!/user-scalable\s*=\s*(no|0)/i.test(vp) && !/maximum-scale\s*=\s*1(\.0)?\b/i.test(vp), vp);
});

await check("skip link is first tab stop and moves focus to <main>", async () => {
  await page.keyboard.press("Tab");
  const text = await page.evaluate(() => document.activeElement?.textContent);
  assert.equal(text?.trim(), "Үндсэн агуулга руу шилжих");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => document.activeElement?.id || location.hash), "main");
});

await check("waitlist: empty submit shows Mongolian error, sets aria-invalid, focuses field", async () => {
  await page.locator("#pricing").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Мэдэгдэл авах" }).click();
  const input = page.getByLabel("Утасны дугаар");
  await assert.doesNotReject(input.waitFor());
  assert.equal(await input.getAttribute("aria-invalid"), "true");
  assert.ok(await input.evaluate((el) => el === document.activeElement), "input not focused");
  const describedBy = await input.getAttribute("aria-describedby");
  const msg = await page.locator(`[id="${describedBy}"]`).textContent();
  assert.equal(msg, "Утасны дугаараа оруулна уу.");
});

await check("waitlist: malformed phone shows format hint", async () => {
  await page.getByLabel("Утасны дугаар").fill("9911 22");
  await page.getByRole("button", { name: "Мэдэгдэл авах" }).click();
  await page.getByText("Утасны дугаар 8 оронтой байна").waitFor();
  await page.locator("#pricing").screenshot({ path: path.join(shots, "state__waitlist-error__390__light.png") });
});

await check("waitlist: switching to email changes input type and keyboard", async () => {
  await page.getByLabel("Имэйл", { exact: true }).check();
  const input = page.getByLabel("Имэйл хаяг");
  assert.equal(await input.getAttribute("type"), "email");
  assert.equal(await input.getAttribute("autocomplete"), "email");
  await page.getByLabel("Утас", { exact: true }).check();
  assert.equal(await page.getByLabel("Утасны дугаар").getAttribute("type"), "tel");
});

await check("waitlist: valid number shows confirmation in a focused status region", async () => {
  await page.getByLabel("Утасны дугаар").fill("+976 9911 2233");
  await page.getByRole("button", { name: "Мэдэгдэл авах" }).click();
  const status = page.getByRole("status");
  await status.getByText("Баярлалаа!").waitFor();
  assert.match(await status.textContent(), /Бүртгэсэн: 9911 2233/);
  await page.waitForTimeout(100);
  assert.equal(await status.evaluate((el) => el === document.activeElement), true);
  await page.locator("#pricing").screenshot({ path: path.join(shots, "state__waitlist-success__390__light.png") });
});

await check("FAQ opens with keyboard (native details/summary)", async () => {
  const summary = page.locator("#faq summary").first();
  await summary.focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#faq details").first().evaluate((d) => d.open), true);
});

await check("no console errors or CSP violations", async () => {
  assert.deepEqual(consoleErrors, []);
});
await ctx.close();

// WCAG 1.4.10 Reflow: content usable at 320 CSS px without horizontal scrolling.
for (const p of ["/", "/privacy", "/terms"]) {
  await check(`no horizontal scroll at 320px: ${p}`, async () => {
    const c = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true });
    const pg = await c.newPage();
    await pg.goto(new URL(p, base).href, { waitUntil: "networkidle" });
    const { sw, cw } = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    await c.close();
    assert.ok(sw <= cw, `scrollWidth ${sw} > clientWidth ${cw}`);
  });
}

// WCAG 1.4.4 Resize text: 200% text size must not break layout.
await check("200% text size: no page-level horizontal scroll", async () => {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const pg = await c.newPage();
  await pg.goto(base, { waitUntil: "networkidle" });
  await pg.addStyleTag({ content: "html{font-size:200% !important}" });
  await pg.waitForTimeout(200);
  const { sw, cw } = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  await pg.screenshot({ path: path.join(shots, "state__text-200pct__390__light.png") });
  await c.close();
  assert.ok(sw <= cw, `scrollWidth ${sw} > clientWidth ${cw}`);
});

await browser.close();
console.log(results.join("\n"));
process.exit(results.some((r) => r.startsWith("FAIL")) ? 1 : 0);
