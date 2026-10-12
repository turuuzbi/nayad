// Passive scan of text the browser already downloaded (HTML, JS) for credentials that
// should never ship to a client. Returns where and what kind; never returns the secret.

const JWT_RE = /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g;

const PATTERNS = [
  { kind: "stripe-secret-key", re: /\bsk_live_[A-Za-z0-9]{16,}/g },
  { kind: "supabase-secret-key", re: /\bsb_secret_[A-Za-z0-9_-]{16,}/g },
  { kind: "private-key-block", re: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g },
  { kind: "env-name-service-role", re: /SUPABASE_SERVICE_ROLE(?:_KEY)?/g },
];

function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(part, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * @param {string} text  downloaded HTML/JS
 * @param {string} where URL the text came from
 * @returns {{where: string, kind: string, severity: "critical"|"info", detail: string}[]}
 */
export function scanForSecrets(text, where) {
  const findings = [];
  const seen = new Set();
  for (const m of text.matchAll(JWT_RE)) {
    const payload = decodeJwtPayload(m[0]);
    if (!payload) continue;
    const role = payload.role ?? "(none)";
    const key = `jwt:${role}:${payload.ref ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    findings.push({
      where,
      kind: `jwt role=${role}`,
      // anon keys are designed to be public; anything that bypasses RLS is not.
      severity: role === "service_role" || role === "supabase_admin" ? "critical" : "info",
      detail: `iss=${payload.iss ?? "?"} ref=${payload.ref ?? "?"} (token not stored)`,
    });
  }
  for (const { kind, re } of PATTERNS) {
    const count = [...text.matchAll(re)].length;
    if (count) findings.push({ where, kind, severity: "critical", detail: `${count} occurrence(s) (value not stored)` });
  }
  return findings;
}
