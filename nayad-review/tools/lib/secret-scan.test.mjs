import { test } from "node:test";
import assert from "node:assert/strict";
import { scanForSecrets } from "./secret-scan.mjs";

// Synthetic tokens built here; they are not real credentials.
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const fakeJwt = (payload) => `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.c2lnbmF0dXJlLW5vdC1yZWFs`;

test("flags a service_role JWT as critical without returning the token", () => {
  const token = fakeJwt({ iss: "supabase", ref: "abcdefgh", role: "service_role" });
  const [f] = scanForSecrets(`const k="${token}";`, "https://example.test/app.js");
  assert.equal(f.severity, "critical");
  assert.equal(f.kind, "jwt role=service_role");
  assert.ok(!JSON.stringify(f).includes(token));
});

test("reports an anon JWT as info only", () => {
  const [f] = scanForSecrets(fakeJwt({ iss: "supabase", ref: "abcdefgh", role: "anon" }), "x");
  assert.equal(f.severity, "info");
});

test("finds secret-shaped strings and env names", () => {
  const kinds = scanForSecrets("sk_live_" + "a".repeat(24) + " SUPABASE_SERVICE_ROLE_KEY", "x").map((f) => f.kind);
  assert.deepEqual(kinds.sort(), ["env-name-service-role", "stripe-secret-key"]);
});

test("clean text yields nothing", () => {
  assert.deepEqual(scanForSecrets("const a = 1; // eyJ not a token", "x"), []);
});
