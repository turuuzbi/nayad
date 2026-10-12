# NAYAD improvement roadmap (provisional)

**Provisional:** the live site could not be captured ([`../findings/live-access.md`](../findings/live-access.md)).
Items are ranked from what is known: facts stated in the brief (REPORTED), color math and the
prototype (VERIFIED), and standard checks the tooling will confirm or clear (TO CHECK). After the
first live capture, drop any TO CHECK item that turns out fine and re-rank the rest. Item IDs
refer to [`../findings/audit.md`](../findings/audit.md).

**Ranking:** impact ÷ effort, with impact High = 3, Medium = 2, Low = 1 and effort S = 1,
M = 2, L = 4. Ties are broken by how well-evidenced the item is.

**Expected impact** is stated as the metric that should move and the evidence for it. Where a
number exists (Lighthouse on the prototype), it is quoted. Conversion effects are directional
only: there is no baseline yet, so step 0 is to measure.

## Step 0: measure before changing (½ day, do first)

Add four analytics events: hero CTA click, header "Нэвтрэх" click, waitlist submit, sign-up
completed. Add real-user Web Vitals (LCP, CLS, INP) if Chrome UX Report has no data for the site.
Without this baseline, no conversion claim below can be confirmed.

## Quick wins (< 1 day each)

| # | Improvement | Audit | Basis | Impact | Effort | Score | Expected impact (metric) |
|---|---|---|---|---|---|---|---|
| 1 | **Re-enable zoom**: viewport `width=device-width, initial-scale=1`; 16 px inputs if iOS focus-zoom was the reason | A1 | REPORTED | High | S | 3.0 | Lighthouse Accessibility: `meta-viewport` audit flips to pass. WCAG 1.4.4 met. Prototype passes 320 px reflow and 200 % text with zoom on. |
| 2 | **Yellow-safe colors + visible focus**: near-black on `#FFC107`, never white/grey on yellow, dark-amber accent text, global `:focus-visible` ring | A2, A4 | VERIFIED math (white on yellow 1.63:1) | High | S | 3.0 | axe `color-contrast` violations → 0; Lighthouse Accessibility up. Prototype: 0 axe violations in light and dark, all pairs ≥ 6.5:1. |
| 3 | **Security header baseline** on all routes: `frame-ancestors 'none'`/`X-Frame-Options`, HSTS, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`; CSP in **Report-Only** first | H1–H5 | TO CHECK | High | S | 3.0 | Login/reset pages cannot be framed; reset tokens do not leak via `Referer`; securityheaders.com grade up. Prototype headers in `prototype/next.config.ts`. |
| 4 | **First screen does one job**: headline says what + for whom; one primary CTA "Бүртгүүлэх"; "Нэвтрэх" secondary in header; install moved to a guide | C1, C2 | TO CHECK | High | S | 3.0 | Hero CTA click-through and sign-up starts up (directional; measure with step 0). Prototype fold: headline, sub-line, primary CTA all visible at 390×844. |
| 5 | **Language and sharing metadata**: `lang="mn"`, Mongolian title/description, OG + Twitter card with 1200×630 image, canonical, robots/sitemap with app routes `noindex` | A3, S1–S5 | TO CHECK | Medium | S | 2.0 | Lighthouse SEO (prototype 100); link previews render in messengers; correct screen-reader voice. |
| 6 | **Pricing dead end → two next steps**: waitlist (phone/email, Mongolian validation, no-spam promise) + "Хүлээх хэрэггүй, одоо бүртгүүлэх" | C4 | REPORTED | Medium | S | 2.0 | Waitlist sign-ups (new metric, previously 0 by design); fewer exits from the pricing section. Prototype component ready (`waitlist-form.tsx`, unit-tested validation). |

## This month

| # | Improvement | Audit | Basis | Impact | Effort | Score | Expected impact (metric) |
|---|---|---|---|---|---|---|---|
| 7 | **Trust block**: legal entity name, privacy policy, terms, phone/email contact, FAQ covering legacy email login and password reset | C3, C7 | TO CHECK / REPORTED (dual login) | High | M | 1.5 | Sign-up completion up and fewer "how do I log in" support requests (directional). Prototype has the footer, `/privacy` and `/terms` skeletons and 6 FAQ items with matching FAQPage data. |
| 8 | **Performance pass**: landing as static Server Components, no auth SDK on `/`, fonts with `cyrillic-ext` + `latin-ext` subsets (or system fonts), images via `next/image` with dimensions, review third parties | P1–P6, S6 | TO CHECK | Medium | M | 1.0 | Lighthouse Performance toward the prototype's 98 on the same framework (LCP 2.3 s, CLS 0, TBT 80 ms, 0 font/image bytes); correct Ө/Ү glyphs. |
| 9 | **PWA polish**: complete manifest (`lang: mn`, maskable icon, `id`), Android `beforeinstallprompt` button, iOS 3-step guide, "new version" prompt, Mongolian offline page with last-synced time, no offline payment writes without idempotency keys | W1–W3, C5 | TO CHECK | Medium | M | 1.0 | Installs (`appinstalled` events) and share of sessions in standalone mode up; fewer stale-version bug reports; no duplicate payments after reconnect. |

## Later

| # | Improvement | Audit | Basis | Impact | Effort | Score | Expected impact (metric) |
|---|---|---|---|---|---|---|---|
| 10 | **Collect debts faster**: reminder messages (share-link first, scheduled SMS later) + read-only customer statement links ("тооцоо нийлсэн акт") + aging report | G2, G6, G4 | suggestion | High | L | 0.75 | Share of debts paid by due date and average days outstanding, measured per business before/after. Weekly active businesses. Validate with 5–10 shop owners before building. |

Not ranked, still worth tracking: bank-statement / QPay matching (G1, L), Excel/PDF export
(G3, M), multi-user roles (G5, L), and the өглөг/авлага wording question (C8, S).

## Security track (needs owner access; outside a passive review)

These cannot be assessed from public pages, but they decide whether the product is safe to grow.
They are not in the top 10 only because this review cannot see them.

1. Confirm **Row Level Security is enabled on every table** and every policy scopes rows to the
   signed-in user's business. Run the read-only catalog queries in
   [`owner-checks.sql`](owner-checks.sql) (system catalogs only; no customer rows).
2. If the passive scan (H6) ever finds a **service_role** key in client code: rotate it the same day.
3. **Password reset and login**: identical responses whether or not the account exists, rate
   limits per IP and per account, short-lived single-use reset tokens (H8).
4. **Money integrity**: integer or `numeric` tugrik amounts, no float math, payment edits as
   new audit rows rather than overwrites, tests on balance calculations.
