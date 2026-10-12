import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, validateContact } from "../src/lib/waitlist.ts";

test("accepts 8-digit Mongolian numbers in common formats", () => {
  for (const input of ["99112233", "9911 2233", "9911-2233", "+976 9911 2233", "97699112233", " 9911 2233 "]) {
    assert.deepEqual(validateContact("phone", input), { ok: true, value: "99112233" }, input);
  }
});

test("does not strip a leading 976 that is part of an 8-digit number", () => {
  assert.equal(normalizePhone("97611223"), "97611223");
});

test("rejects empty and malformed phone numbers with Mongolian messages", () => {
  const empty = validateContact("phone", "   ");
  assert.equal(empty.ok, false);
  assert.match(!empty.ok ? empty.error : "", /оруулна уу/);
  for (const input of ["9911223", "991122334", "9911a233", "+1 9911 2233"]) {
    const r = validateContact("phone", input);
    assert.equal(r.ok, false, input);
    assert.match(!r.ok ? r.error : "", /8 оронтой/);
  }
});

test("validates and normalizes email", () => {
  assert.deepEqual(validateContact("email", " Bold@Gmail.com "), { ok: true, value: "bold@gmail.com" });
  for (const input of ["bold", "bold@", "bold@gmail", "bo ld@gmail.com"]) {
    assert.equal(validateContact("email", input).ok, false, input);
  }
  const empty = validateContact("email", "");
  assert.match(!empty.ok ? empty.error : "", /Имэйл хаягаа/);
});
