# NAYAD public-site audit

**Scope:** passive, read-only review of the public pages of https://nayad.store (landing page,
public auth screens). No logins, no form submissions, no API or database probing.

**Status: the live site could not be reached from the review environment** (network allow-list,
see [`live-access.md`](live-access.md)). So this document does not invent findings. Each item
carries one of three labels:

| Label | Meaning |
|---|---|
| **VERIFIED** | Backed by evidence in this repository (math, tool output, or the prototype). |
| **REPORTED** | Stated in the review brief; I did not observe it on the live site. |
| **TO CHECK** | Standard check that the tooling in [`../tools`](../tools) will answer in one run. Severity is what it would be *if* the check fails. |

Severity: **Critical**, **High**, **Medium**, **Low**. Effort: **S** < 1 day · **M** 1–5 days ·
**L** > 1 week. Anything security-related is additionally marked *needs owner verification*.

The fastest way to turn TO CHECK into VERIFIED/cleared:

```bash
cd nayad-review/tools && npm ci
node capture.mjs https://nayad.store/ --label live          # screenshots, HTML, headers, facts
node lighthouse.mjs https://nayad.store/ --label live --runs 3
node axe.mjs https://nayad.store/ <other public URLs> --label live
```

---

## 1. Accessibility

### A1. Viewport blocks zoom (`user-scalable=no`, `maximum-scale=1`)
- **Label:** REPORTED · **Severity:** High · **Effort:** S
- **Evidence:** brief states the viewport meta contains both values. Not observed (site unreachable).
  `capture.mjs` records it as `facts.viewport`.
- **Why it matters:** fails WCAG 1.4.4 Resize Text (AA) and Lighthouse's `meta-viewport`
  accessibility audit. Chrome on Android honours the lock by default, so low-vision users
  cannot pinch-zoom balances or amounts. (iOS Safari has ignored `user-scalable=no` for pinch-zoom
  since iOS 10, so iPhone users are less affected.)
- **Fix:** `<meta name="viewport" content="width=device-width, initial-scale=1">`. In Next.js App
  Router: export `viewport = { width: "device-width", initialScale: 1 }` and nothing else. If the
  lock was added to stop iOS zooming into inputs on focus, the real fix is **`font-size: 16px` on
  inputs**; iOS only auto-zooms fields smaller than 16px.
- **Prototype evidence:** zoom enabled; smoke test passes 320px reflow and 200% text without
  horizontal scroll ([`compare.md`](compare.md)).

### A2. Brand yellow `#FFC107` cannot carry light or grey text
- **Label:** VERIFIED (color math) / TO CHECK (where the live site uses it) · **Severity:** High
  where text fails · **Effort:** S
- **Evidence:** `node tools/contrast.mjs`:

  | Pair | Ratio | WCAG |
  |---|---|---|
  | white on `#FFC107` (or yellow text on white) | 1.63:1 | **fail** |
  | `#757575` grey on `#FFC107` | 2.83:1 | **fail** |
  | yellow on `#F5F5F5` | 1.50:1 | **fail** |
  | `#424242` on `#FFC107` | 6.17:1 | AA |
  | `#1A1A1A` on `#FFC107` | 10.68:1 | AAA |
  | `#FFC107` on dark `#121212` | 11.49:1 | AAA |

- **Fix:** yellow only as a background behind near-black text, or as a foreground on dark
  surfaces. For accent text on light backgrounds use a dark amber (prototype: `#7A4A00`,
  6.9:1 on pale yellow). Check icons and focus rings too: UI components need 3:1 (WCAG 1.4.11).
- **Verify:** axe `color-contrast` in `axe.md`.

### A3. `<html lang>` must be `mn`
- **Label:** TO CHECK · **Severity:** High if wrong · **Effort:** S
- **Evidence:** none for the live site. Note that the stock `create-next-app` template ships
  `<html lang="en">` (seen in this repo's scaffold before it was changed), so a Next.js site
  that never changed it reads Cyrillic with an English voice in screen readers and sends a wrong
  language signal to search engines.
- **Fix:** `<html lang="mn">` in the root layout.
- **Verify:** `facts.lang`.

### A4. Visible focus states
- **Label:** TO CHECK · **Severity:** High if missing · **Effort:** S
- **Fix:** one global `:focus-visible { outline: 3px solid …; outline-offset: 2px }` with a color
  that has 3:1 against both the page and yellow buttons (prototype: `#1A1A1A` light, `#FFC107`
  dark). Never `outline: none` without a replacement.
- **Verify:** tab through the page in the live capture; axe does not detect this reliably.

### A5. Form labels on the public auth screens
- **Label:** TO CHECK · **Severity:** High if placeholder-only · **Effort:** S
- **What to look for (read-only):** each phone/email/password field has a visible `<label>`,
  `autocomplete` (`tel`, `email`, `current-password`, `new-password`), phone uses `type="tel"`,
  error text is linked with `aria-describedby` and is in Mongolian. `capture.mjs` records
  `forms[].fields[]` with `hasLabel`, `placeholderOnly`, `autocomplete`, `inputmode`; no field is
  typed into or submitted.
- **Fix pattern:** see `prototype/src/components/waitlist-form.tsx` (label, hint, inline error,
  `aria-invalid`, focus returns to the field, status region announces success).

### A6. Touch targets ≥ 44 px
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **Evidence:** `facts.smallTargets` lists every visible interactive element smaller than 44×44
  (and flags those under 24×24, the WCAG 2.5.8 AA minimum).
- **Fix:** `min-height: 44px` on links/buttons; the label of a checkbox/radio counts as its target.

### A7. Icon-only buttons need accessible names
- **Label:** TO CHECK · **Severity:** High if present · **Effort:** S
- **Verify:** axe `button-name`, `link-name`. Fix with visible text or `aria-label` in Mongolian.

### A8. Emoji used as content
- **Label:** TO CHECK · **Severity:** Low–Medium · **Effort:** S
- **Evidence:** `facts.emoji` lists emoji in visible text with whether they are `aria-hidden`.
  Screen readers read emoji names (often in English) mid-sentence; rendering differs per OS.
- **Fix:** inline SVG icons with `aria-hidden="true"` next to real text (as in the prototype).

---

## 2. Performance

### P1. Lighthouse mobile baseline
- **Label:** TO CHECK · **Severity:** depends on result · **Effort:** S to measure
- **Targets:** LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms (lab). INP ≤ 200 ms needs field data: if
  nayad.store has too little traffic for Chrome UX Report, add real-user monitoring
  (e.g. Vercel Speed Insights or `web-vitals` → analytics).
- **Reference point:** the prototype on the same framework scores 98 (LCP 2.3 s, CLS 0, TBT 80 ms).

### P2. JavaScript weight on the landing page
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** M
- **Reference:** Next.js 16 + React baseline for a static page is ~147 KB gzip (prototype).
  Much more than that on a marketing page usually means `"use client"` high in the tree,
  animation or icon libraries, or the auth bundle (Supabase client, Google SDK) loaded on `/`.
- **Fix:** landing as Server Components; only interactive islands (forms, menus) as client
  components; load auth SDKs on auth routes only.
- **Verify:** `resources.md` (script rows, sizes, third-party flag).

### P3. Fonts: Mongolian letters need `cyrillic-ext`, the ₮ sign needs `latin-ext`
- **Label:** TO CHECK · **Severity:** Medium (visible glyph mismatch) · **Effort:** S
- **Why:** Google Fonts' `cyrillic` subset covers Russian Cyrillic (U+0400–045F and a few
  others) but **not Ө ө Ү ү** (U+04E8/04E9, U+04AE/04AF), which are in `cyrillic-ext`. The tugrik
  sign ₮ (U+20AE) is in `latin-ext`. With `next/font/google` and `subsets: ["latin", "cyrillic"]`,
  those letters fall back to another font mid-word.
- **Fix:** `subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"]`, or drop the web font
  and use the system stack (prototype: 0 font bytes; SF Pro, Roboto and Segoe UI all cover
  Mongolian Cyrillic).
- **Verify:** `resources.md` font rows; zoom into Ө/Ү in the live screenshots.

### P4. Images
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S–M
- **What:** WebP/AVIF via `next/image`, explicit `width`/`height` (CLS), `loading="lazy"` below
  the fold, no hero image larger than rendered size. `facts.images` lists natural vs rendered
  size and whether dimensions are set.
- **Alternative used in the prototype:** the product mock-up is HTML/CSS (sharp at any zoom,
  0 image bytes, numbers computed from data).

### P5. Caching headers
- **Label:** TO CHECK · **Severity:** Low–Medium · **Effort:** S
- **What:** hashed static assets `public, max-age=31536000, immutable`; HTML revalidated.
  `resources.md` shows `Cache-Control` per request.

### P6. Third-party scripts
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **What:** analytics, chat widgets, pixels: each adds main-thread time and must be declared
  in a privacy policy. `resources.md` marks third-party hosts.

---

## 3. SEO and landing metadata

### S1. Title and description in Mongolian
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **Fix:** title ≤ ~60 chars naming the product and what it does; description ≤ ~160 chars.
  Prototype: `NAYAD — өглөг, падаан, төлөлтийн бүртгэл` + a 120-char description.

### S2. Open Graph / Twitter card
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **Why:** links shared in messengers and social apps render a preview card from these tags.
  Without them the link shows a bare URL.
- **Fix:** `og:title`, `og:description`, `og:image` (1200×630, with `og:image:alt`), `og:locale=mn_MN`,
  `twitter:card=summary_large_image`. Prototype ships an original 1200×630 image.

### S3. Canonical host
- **Label:** TO CHECK · **Severity:** Low–Medium · **Effort:** S
- **What:** one canonical host (apex or `www`), the other 301-redirects; `<link rel="canonical">`
  per page. The capture records redirects and canonicals.

### S4. robots.txt, sitemap.xml, and keeping app routes out of the index
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **Fix:** sitemap lists only public marketing pages; login, reset-password and app routes get
  `noindex` (and can be disallowed). Password-reset pages in search results are a phishing aid.

### S5. Structured data
- **Label:** TO CHECK · **Severity:** Low · **Effort:** S
- **Fix:** Organization + WebSite + SoftwareApplication (+ FAQPage generated from the visible
  FAQ so they cannot drift). See `prototype/src/components/json-ld.tsx`.

### S6. Is the landing content in the server HTML?
- **Label:** TO CHECK · **Severity:** Medium if not · **Effort:** M
- **Evidence:** `summary.md` compares visible text in the server HTML with the rendered DOM. If
  the server HTML is nearly empty (client-rendered), Google can still render it, but link
  previews and most other crawlers cannot, and LCP waits for JavaScript.
- **Fix:** static prerender of the landing page (Server Components).

### S7. One `<h1>`, logical heading order
- **Label:** TO CHECK · **Severity:** Low · **Effort:** S · **Evidence:** `facts.headings`.

---

## 4. Security headers and client exposure (passive)

All items: *needs owner verification*. Nothing was probed; these are header and source checks
on public responses only.

### H1. Clickjacking protection on login/reset pages
- **Label:** TO CHECK · **Severity:** High if missing · **Effort:** S
- **Fix:** `Content-Security-Policy: frame-ancestors 'none'` (plus `X-Frame-Options: DENY` for
  old browsers). Without it a hostile page can frame the login form.

### H2. HSTS
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **Fix:** `Strict-Transport-Security: max-age=63072000; includeSubDomains`. Add `preload` only
  after confirming every subdomain serves HTTPS.

### H3. Content-Security-Policy
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** M
- **Fix:** start with `Content-Security-Policy-Report-Only` for a week, then enforce. Baseline in
  `prototype/next.config.ts` (no nonces, static rendering kept). Add the auth provider's and
  Google sign-in's origins to `connect-src` / `frame-src` / `script-src` as needed.

### H4. Referrer-Policy and tokens in URLs
- **Label:** TO CHECK · **Severity:** High if reset tokens can leak · **Effort:** S
- **Why:** password-reset and magic links often carry a code or token in the URL. If that
  page loads any third-party resource and the policy is permissive, the full URL can leak in
  the `Referer` header.
- **Fix:** `Referrer-Policy: strict-origin-when-cross-origin` site-wide (or `no-referrer` on
  auth callback/reset routes); load no third-party scripts on those routes; exchange the code
  immediately and strip it from the URL.

### H5. Permissions-Policy, nosniff, X-Powered-By
- **Label:** TO CHECK · **Severity:** Low · **Effort:** S
- **Fix:** see prototype headers (camera/mic/geolocation/payment off, `nosniff`,
  `poweredByHeader: false`). Keep `publickey-credentials-get` allowed (the default) since Face ID
  sign-in on the web uses WebAuthn.

### H6. Secrets shipped to the browser
- **Label:** TO CHECK · **Severity:** Critical if found · **Effort:** S to rotate
- **What:** `capture.mjs` scans every downloaded HTML/JS file for JWTs and decodes the role
  claim, plus secret-key patterns. A Supabase **anon** key in the bundle is expected and fine *if
  RLS is enabled on every table*. A **service_role** key (or any key that bypasses RLS) in client
  code means anyone can read and write every business's data: rotate immediately. The scanner
  reports location and role only and never stores the value.

### H7. Cookie flags
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **What:** cookies set on public pages should be `Secure`, `HttpOnly` where not read by JS,
  `SameSite=Lax` or stricter. Capture records names and flags (never values).

### H8. Account enumeration in the visible auth copy
- **Label:** TO CHECK (copy only; nothing will be submitted) · **Severity:** Medium · **Effort:** S
- **What:** read-only check of the reset/login screens' text. Owner to verify server behaviour:
  reset responds identically whether or not the phone/email exists ("Хэрэв энэ дугаар бүртгэлтэй
  бол код илгээгдэнэ"), login errors don't say which of phone/password was wrong, and login and
  reset are rate-limited per IP and per account.

---

## 5. Content and UX

Mongolian copy quality can only be judged from the real text; items below are what to check,
with a concrete pass/fail rule each.

### C1. Value proposition within 5 seconds
- **Label:** TO CHECK · **Severity:** High · **Effort:** S
- **Rule:** on the 390×844 first screen, the headline says *what* (өглөг/падаан/төлөлт) and *for
  whom* (жижиг бизнес), and the primary action is visible without scrolling. Check
  `screenshots/live/home__390__light__fold.png`.

### C2. CTA hierarchy: "App суулгах" vs "Нэвтрэх"
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **Recommendation:** one primary action, sign-up ("Бүртгүүлэх"); "Нэвтрэх" secondary in the
  header for returning users; installation as a guide, not the primary button. iOS cannot show
  an install prompt from a button, so "App суулгах" as the main CTA leads iPhone users into a
  multi-step manual flow before they have seen any value.

### C3. Trust signals for a money app
- **Label:** TO CHECK · **Severity:** High · **Effort:** M (legal text)
- **Rule:** visible company/legal entity, privacy policy, terms, a reachable contact (phone or
  email), and what happens to data. Mongolia's Law on Personal Data Protection (in force since
  May 2022) applies to customer data entered by businesses; owner to confirm obligations with
  counsel. Prototype includes a footer with these slots and skeleton `/privacy` and `/terms` pages.

### C4. Pricing "coming soon" is a dead end
- **Label:** REPORTED · **Severity:** Medium · **Effort:** S
- **Fix:** give the visitor two next steps: leave a phone/email for the price announcement,
  or start now. Prototype: waitlist with phone/email toggle, Mongolian validation, commitments
  ("Нэг удаа л мэдэгдэнэ", "Сурталчилгаа илгээхгүй"), and a "Хүлээх хэрэггүй, одоо бүртгүүлэх" link.

### C5. Install guide clarity
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **Rule:** separate iPhone (Safari) and Android (Chrome) steps; name buttons as they appear.
  Phone menus are often not in Mongolian (iOS in particular), so many users see English or
  Russian labels: write «Хуваалцах» (Share) → «Нүүр дэлгэцэнд нэмэх» (Add to Home Screen) and show
  the icon they will see.

### C6. Demo mock-up realism
- **Label:** TO CHECK · **Severity:** Medium (trust) · **Effort:** S
- **Rule:** totals equal the sum of rows; overdue/upcoming buckets add up; dates are not in the
  past year or impossible (31 April), weekday matches date; one currency format everywhere
  (prototype: `1,250,000₮`). Prototype computes totals from the rows and uses relative dates
  ("5 хоног хэтэрсэн", "Өнөөдөр") so it never goes stale; a unit test enforces the sums.

### C7. Phone-first sign-in vs legacy email users
- **Label:** REPORTED (dual login exists) / TO CHECK (copy) · **Severity:** Medium · **Effort:** S
- **Rule:** the login screen says plainly that earlier email accounts still work and where
  ("Өмнө нь имэйлээр бүртгүүлсэн бол…"), and the FAQ answers it. Otherwise legacy users try
  their email in the phone field, fail, and reset or abandon.

### C8. Terminology: өглөг vs авлага
- **Label:** question for the owner · **Severity:** Low–Medium · **Effort:** S
- In accounting usage **авлага** is money owed *to* the business (receivables) and **өглөг** is
  money the business owes (payables). NAYAD uses "өглөг" for customer debts. That may be a
  deliberate everyday usage, but accountants and bookkeepers may read it the other way round.
  Worth one line of explanation or a user test. The prototype keeps the product's term.

---

## 6. PWA

### W1. Manifest completeness
- **Label:** TO CHECK · **Severity:** Medium · **Effort:** S
- **Rule:** `name`, `short_name`, `lang: "mn"`, `start_url`, `scope`, `display: standalone`,
  `theme_color: #FFC107`, `background_color`, icons 192 + 512 + **maskable** 512, `id`.
  iOS also needs `apple-touch-icon` (180×180). Prototype `src/app/manifest.ts` is a template.

### W2. Service worker, offline and updates
- **Label:** TO CHECK · **Severity:** Medium–High for a money app · **Effort:** M
- **Rules:** offline fallback page in Mongolian; balances shown offline carry a "сүүлд
  шинэчилсэн …" timestamp and a banner; **no payments recorded offline** unless each carries an
  idempotency key and is reconciled server-side (otherwise duplicate payments on reconnect).
  New-version prompt ("Шинэ хувилбар гарлаа — шинэчлэх") instead of silently serving stale code.

### W3. Install prompt
- **Label:** TO CHECK · **Severity:** Low–Medium · **Effort:** S
- **Rule:** Android: capture `beforeinstallprompt`, show "Апп суулгах" only when installable;
  hide it when already running standalone. iOS: show the 3-step guide instead of a dead button.

---

## 7. Competitive gaps (suggestions only)

I do not know which of these NAYAD already has; each is a suggestion to validate with users.

| # | Feature | Why small Mongolian businesses would expect it | Notes / effort |
|---|---|---|---|
| G1 | **QPay / bank payment matching**: import a bank statement (Excel/CSV) or receive QPay payment notifications and match them to open debts | Most customer payments arrive by bank transfer or QR; re-typing them is the main chore | Statement import first (L); QPay merchant integration later (L, needs a merchant agreement) |
| G2 | **Payment reminders** by SMS, Viber, Telegram or Messenger, with a pre-filled Mongolian message and the amount due | Chasing debts is awkward; a polite automatic reminder is the core value | Start with "share reminder" links (S–M), then scheduled SMS (M, per-message cost) |
| G3 | **Excel / PDF export** of customers, invoices, payments | Accountants and tax filing still run on Excel | Server-generated XLSX/PDF with integer ₮ amounts (M) |
| G4 | **Debt aging report** (0–30, 31–60, 61–90, 90+ days) | The standard way to see which debts are going bad | Pure query + view (M); needs tests on bucket boundaries |
| G5 | **Multi-user roles per business** (owner, cashier, read-only accountant) | Shops have staff who record payments but should not delete history | Data-model + RLS change (L); must keep audit trail |
| G6 | **Customer statement links** ("тооцоо нийлсэн акт"): a read-only link the shop sends to its customer | Settles disputes about who owes what; doubles as a reminder | Signed, expiring, read-only link; never exposes other customers (M) |
