import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMNT, sumMNT } from "../src/lib/money.ts";

test("formats whole tugriks with thousands separators and ₮ suffix", () => {
  assert.equal(formatMNT(0), "0₮");
  assert.equal(formatMNT(480_000), "480,000₮");
  assert.equal(formatMNT(3_480_000), "3,480,000₮");
  assert.equal(formatMNT(-120_000), "-120,000₮");
});

test("rejects fractional or unsafe amounts instead of rounding silently", () => {
  assert.throws(() => formatMNT(0.1 + 0.2), RangeError);
  assert.throws(() => formatMNT(Number.MAX_SAFE_INTEGER + 2), RangeError);
  assert.throws(() => sumMNT([100, 0.5]), RangeError);
});

test("sums integer amounts exactly", () => {
  assert.equal(sumMNT([]), 0);
  assert.equal(sumMNT([1_250_000, 480_000, 870_000, 880_000]), 3_480_000);
});
