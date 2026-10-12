import { test } from "node:test";
import assert from "node:assert/strict";
import { DEMO_DEBTS, dueLabel, dueStatus, summarize } from "../src/lib/demo-ledger.ts";

test("mock-up totals add up to the rows shown", () => {
  const s = summarize(DEMO_DEBTS);
  assert.equal(s.customers, 4);
  assert.equal(s.total, 3_480_000);
  assert.equal(s.overdue, 1_250_000);
  assert.equal(s.dueThisWeek, 480_000 + 870_000);
  // Every row falls in exactly one bucket: overdue, due within 7 days, or later.
  const later = DEMO_DEBTS.filter((d) => d.dueInDays > 7).reduce((t, d) => t + d.amount, 0);
  assert.equal(s.overdue + s.dueThisWeek + later, s.total);
});

test("due labels and statuses agree", () => {
  assert.equal(dueLabel(-5), "5 хоног хэтэрсэн");
  assert.equal(dueLabel(0), "Өнөөдөр");
  assert.equal(dueLabel(3), "3 хоногийн дараа");
  assert.equal(dueStatus(-1), "overdue");
  assert.equal(dueStatus(0), "today");
  assert.equal(dueStatus(7), "soon");
  assert.equal(dueStatus(8), "later");
});
