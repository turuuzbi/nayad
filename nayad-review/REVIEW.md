# NAYAD (nayad.store) — improvement review

*Passive public-site review with the owner's written permission · 2026-10-12 · branch `nayad-review`*

## Executive summary

**The live site could not be reached from the review environment.** Its network allow-list
blocks `nayad.store`: the proxy returns 403, and the control host `example.com` is blocked too, so
this says nothing about the site itself. Remote options failed as well: PageSpeed Insights has a
zero anonymous quota, and the fetch tool resolved no hosts at all. Evidence:
[`findings/live-access.md`](findings/live-access.md). As a result, **no finding about the live site
is verified yet**, and none is invented. Each audit item is labelled VERIFIED, REPORTED (from the
brief) or TO CHECK.

What exists instead:

1. **A working review toolkit** ([`tools/`](tools/)) that runs Steps 1–2 against nayad.store in
   one pass:
   - screenshots at 3 widths, light and dark;
   - raw HTML, headers, robots.txt, sitemap.xml, manifest and service worker;
   - every resource with its size and cache headers;
   - Lighthouse (3 runs) and axe;
   - a passive scan for leaked keys in client code.

   It is GET-only and has been verified end-to-end on the prototype.
2. **An evidence-labelled audit** ([`findings/audit.md`](findings/audit.md)): 40 checks across
   accessibility, performance, SEO, security headers, content/UX, PWA, plus 6 competitive gaps.
3. **A provisional top-10 roadmap** ([`proposals/roadmap.md`](proposals/roadmap.md)) and
   read-only SQL the owner can run to confirm data isolation
   ([`proposals/owner-checks.sql`](proposals/owner-checks.sql)).
4. **A landing-page prototype** ([`prototype/`](prototype/)): Next.js 16, TypeScript, Tailwind 4,
   Mongolian, mobile-first, original design and copy, no backend.

   | Check | Result |
   |---|---|
   | Lighthouse mobile, home | **98 / 100 / 100 / 100** (performance / accessibility / best practices / SEO) |
   | axe | 0 WCAG A/AA violations on 4 pages in light and dark |
   | Zoom and reflow | Zoom enabled; no horizontal scroll at 320 px or at 200 % text |
   | Unit tests | 9/9 |
   | Smoke tests | 12/12 |

**Most likely biggest wins**, pending the live capture:
1. Re-enable zoom.
2. Use the brand yellow only with near-black text (white on `#FFC107` is 1.63:1).
3. Add clickjacking and referrer protection on the login and password-reset pages.
4. Give the first screen one job and one primary button ("Бүртгүүлэх").
5. Turn the "pricing coming soon" dead end into a waitlist plus a "start now" link.

All five are under a day each.

## Top findings

| ID | Finding | Label | Severity | Fix | Effort |
|---|---|---|---|---|---|
| A1 | Viewport disables zoom (`user-scalable=no`, `maximum-scale=1`): fails WCAG 1.4.4; Android Chrome honours it | REPORTED | High | `width=device-width, initial-scale=1`; 16 px inputs | S |
| A2 | `#FFC107` fails with white (1.63:1) and mid-grey (2.83:1) text; near-black passes (10.68:1) | VERIFIED (math) | High where used | Dark text on yellow only; dark-amber accent text | S |
| H1/H4 | Login and reset pages need `frame-ancestors 'none'` and a strict `Referrer-Policy` so they can't be framed and reset tokens can't leak via `Referer` | TO CHECK | High if missing | Header baseline (prototype `next.config.ts`) | S |
| H6 | Any key that bypasses Supabase RLS (`service_role`) shipped in client JS would expose every business's data | TO CHECK (scanner ready) | Critical if found | Rotate key; keep it server-only | S |
| C1/C2 | First screen must say what + for whom with a single primary CTA. "App суулгах" as the main CTA sends iPhone users into a manual flow first | TO CHECK | High | Primary "Бүртгүүлэх", secondary "Нэвтрэх", install as a guide | S |
| C4 | Pricing "coming soon" is a dead end | REPORTED | Medium | Waitlist + "одоо бүртгүүлэх" (prototype component ready) | S |
| P3 | Google Fonts' `cyrillic` subset lacks Ө ө Ү ү (they're in `cyrillic-ext`); ₮ is in `latin-ext` | TO CHECK | Medium | Add both subsets, or use system fonts | S |
| C3 | Trust signals: legal entity, privacy policy, terms, contact. Mongolia's personal-data law applies | TO CHECK | High | Footer + `/privacy` + `/terms` (skeletons in prototype) | M |
| C8 | "Өглөг" usually means *payables* in accounting; customer debts are "авлага" | Question | Low–Med | Confirm intent; explain or rename | S |

Full list with evidence, fixes and verification steps: [`findings/audit.md`](findings/audit.md).

## Roadmap (provisional)

| Group | # | Improvement | Impact / Effort |
|---|---|---|---|
| Step 0 | — | Add 4 analytics events + real-user Web Vitals so conversion changes can be measured | prerequisite |
| Quick wins | 1 | Re-enable zoom | High / S |
| | 2 | Yellow-safe colors + visible focus ring | High / S |
| | 3 | Security header baseline (CSP report-only first) | High / S |
| | 4 | First screen: one message, one primary CTA | High / S |
| | 5 | `lang="mn"`, Mongolian title/description, OG/Twitter, canonical, robots/sitemap | Medium / S |
| | 6 | Pricing waitlist + "start now" | Medium / S |
| This month | 7 | Trust block: entity, privacy, terms, contact, FAQ (legacy email login, reset) | High / M |
| | 8 | Performance pass: Server Components, font subsets, images, third parties | Medium / M |
| | 9 | PWA polish: manifest, install prompt, update prompt, safe offline | Medium / M |
| Later | 10 | Reminders + customer statement links + aging report | High / L |

Expected metric movement and evidence per item: [`proposals/roadmap.md`](proposals/roadmap.md).
A security track (RLS, reset/login enumeration and rate limits, money integrity) needs owner access
and is listed there separately.

## Before / after metrics

| Metric (Lighthouse mobile unless noted) | Live nayad.store | Prototype |
|---|---|---|
| Performance | not measured | 98 |
| Accessibility | not measured | 100 |
| Best practices | not measured | 100 |
| SEO | not measured | 100 |
| LCP / CLS / TBT | not measured | 2.3 s / 0 / 80 ms |
| Page weight (home) | not measured | 203 KiB (147 KB JS, 0 fonts, 0 images) |
| axe violations (light + dark) | not measured | 0 |
| Zoom allowed | reported: no | yes |
| `lang` | not measured | `mn` |

Measured on a local production build, so server time is near zero. Run the same commands on
nayad.store before quoting a comparison: [`findings/compare.md`](findings/compare.md).

---

## Message for the owner (ready to send)

> Send after attaching 3–4 prototype screenshots from `screenshots/prototype/` (e.g.
> `home__390__light__fold.png`, `home__390__dark__fold.png`, `home__1440__light.png`,
> `state__waitlist-error__390__light.png`), the "Claims to confirm" list from
> `prototype/README.md`, and `proposals/owner-checks.sql`.

### English

> **Subject: NAYAD website review — prototype ready, live measurements next**
>
> Hi [name],
>
> Thank you for letting me review nayad.store. A short update:
>
> **1. A prototype of an improved landing page is ready** (screenshots attached). It's in
> Mongolian and built for phones first: zoom works, the NAYAD yellow is used so text stays easy
> to read, there is one clear "Бүртгүүлэх" button, step-by-step install guides for iPhone and
> Android, a pricing section that collects contacts instead of stopping at "coming soon", an
> FAQ, and placeholders for a privacy policy and terms. In my lab tests it scores 98–100 in all
> four Lighthouse categories and has no WCAG A/AA violations in automated testing, in light and
> dark mode. The design and text are new, and nothing is connected to your system. It's a
> proposal for you to take or leave.
>
> **2. I haven't measured your current site yet.** My review environment couldn't connect to
> nayad.store. I'll run the same checks on it next and send you a before/after with
> screenshots. The review only loads public pages: it doesn't log in, submit forms or touch
> your data.
>
> **3. What I'll check first:**
> - From what I've been told, the page turns off pinch-to-zoom. That blocks people with weaker
>   eyesight and fails accessibility standards. It's a one-line fix.
> - Text on the yellow brand color: white on #FFC107 is too faint to read comfortably; dark
>   text works well.
> - Protection headers on the login and password-reset pages.
>
> **4. Three questions for you:**
> 1. Could you confirm the statements about NAYAD in the attached list (for example, that each
>    business's data is visible only to that business) before any of this text is used?
> 2. In accounting, "авлага" usually means money customers owe you, and "өглөг" money you owe.
>    Is "өглөг" deliberate in NAYAD?
> 3. Would you be willing to run four read-only database checks (attached SQL)? They only read
>    system tables, not customer data, and confirm that businesses can't see each other's records.
>
> Best regards,
> [your name]

### Монгол

> **Гарчиг: NAYAD сайтын үнэлгээ — жишээ хувилбар бэлэн, одоогийн сайтын хэмжилт дараагийн алхамд**
>
> Сайн байна уу, [нэр].
>
> nayad.store сайтыг судлах зөвшөөрөл өгсөнд баярлалаа. Товч мэдээлэл:
>
> **1. Нүүр хуудсыг сайжруулсан жишээ хувилбар бэлэн боллоо** (зургуудыг хавсаргав). Монгол хэл
> дээр, утсанд зориулж хийсэн: дэлгэцийг томруулж болно, NAYAD-ын шар өнгийг бичвэр нь тод
> уншигдахаар ашигласан, "Бүртгүүлэх" гэсэн нэг тодорхой товчтой, iPhone болон Android дээр
> суулгах алхам алхмаар заавартай, "удахгүй" гээд зогсдог үнийн хэсгийн оронд мэдэгдэл авах
> бүртгэлтэй, түгээмэл асуулт, нууцлалын бодлого ба үйлчилгээний нөхцөлийн хуудасны бүтэцтэй.
> Миний туршилтаар Lighthouse-ын дөрвөн үзүүлэлтээр 98–100 оноо авч, автомат шалгалтаар
> WCAG A/AA түвшний алдаа гараагүй (цайвар, бараан горимд). Дизайн, бичвэр бүгд шинэ бөгөөд
> таны системтэй холбогдоогүй. Ашиглах эсэхийг та өөрөө шийднэ.
>
> **2. Одоогийн сайтыг хараахан хэмжиж амжаагүй.** Миний ажлын орчноос nayad.store сайт руу
> холбогдох боломжгүй байлаа. Дараагийн алхамд яг ижил шалгалтыг хийж, өмнө ба дараах
> харьцуулалтыг зурагтай нь илгээнэ. Шалгалт зөвхөн нийтэд нээлттэй хуудсыг ачаална: нэвтрэх,
> маягт илгээх, таны өгөгдөлд хандах үйлдэл огт хийхгүй.
>
> **3. Эхэлж шалгах зүйлс:**
> - Надад өгсөн мэдээллээр хуудас дэлгэцийг хуруугаар томруулахыг хаасан байгаа. Энэ нь хараа
>   султай хүмүүст саад болж, хүртээмжийн стандартыг зөрчдөг. Нэг мөр кодоор засагдана.
> - Шар өнгөн дээрх бичвэр: #FFC107 дээр цагаан бичвэр хэт бүдэг харагдана, харин бараан бичвэр
>   сайн уншигдана.
> - Нэвтрэх болон нууц үг сэргээх хуудасны хамгаалалтын тохиргоо (security headers).
>
> **4. Танаас асуух гурван зүйл:**
> 1. Хавсаргасан жагсаалтад NAYAD-ын тухай бичсэн өгүүлбэрүүд (жишээ нь бизнес бүрийн мэдээлэл
>    зөвхөн тухайн бизнест харагдана) үнэн эсэхийг баталж өгөх үү? Баталгаажуулахаас өмнө энэ
>    бичвэрийг ашиглахгүй.
> 2. Нягтлан бодох бүртгэлд харилцагчаас авах мөнгийг ихэвчлэн "авлага", өөрийн төлөх мөнгийг
>    "өглөг" гэдэг. NAYAD-д "өглөг" гэж санаатай нэрлэсэн үү?
> 3. Мэдээллийн сан дээр зөвхөн унших дөрвөн шалгалт (хавсаргасан SQL) ажиллуулж өгөх боломжтой
>    юу? Зөвхөн системийн хүснэгтийг уншина, харилцагчийн мэдээлэлд хандахгүй. Бизнесүүд бие
>    биеийнхээ мэдээллийг харах боломжгүйг баталгаажуулна.
>
> Хүндэтгэсэн,
> [таны нэр]

---

## What was done, what couldn't be verified, next steps

**Done**
- Step 0: workspace, branch, tooling installed in `tools/` only (Playwright 1.56.1 matching the
  pre-installed Chromium, Lighthouse 13.5.0, axe-core 4.14).
- Steps 1–2 (tooling): capture, Lighthouse, axe, contrast and secret-scan scripts, verified on
  the prototype. Live run attempted and logged.
- Step 2 (document): audit with 40 labelled checks + 6 suggestions.
- Step 3: provisional top-10 roadmap + owner SQL checks.
- Step 4: prototype built; typecheck, lint, 9 unit tests, production build, 12 smoke checks,
  Lighthouse and axe all pass. 35 screenshots in `screenshots/prototype/`.
- Step 5: this report.

**Could not verify**
- Anything on the live site: current scores, headers, metadata, copy, mock-up, auth screens,
  PWA behaviour, whether it is Next.js, and whether the zoom lock is still there.
- Production performance of the prototype (measured on localhost).
- Every product claim in the prototype copy (listed in `prototype/README.md`).
- Mongolian copy was written and proofread by me (case suffixes checked for vowel harmony);
  have a native speaker read it before publishing.

**Next steps**
1. Allow `nayad.store` and `www.nayad.store` in the environment's network settings (environment
   menu → Edit → Network access) and start a new session, or run the three commands in
   `findings/live-access.md` on any machine.
2. Re-label every TO CHECK item in `audit.md`, re-rank `roadmap.md`, fill the "before" column in
   `compare.md`.
3. Send the owner message; get answers on the claims list, the өглөг/авлага question, and the
   SQL checks.
4. Implement quick wins 1–6 on the real codebase (owner's repo), measuring with step 0.

## Repository map

```
nayad-review/
├── REVIEW.md                  this report
├── findings/
│   ├── audit.md               40 labelled checks + competitive gaps
│   ├── compare.md             before/after metrics (before: not measured)
│   ├── live-access.md         evidence that the live site was unreachable
│   └── raw/prototype/         capture, Lighthouse, axe, smoke output (raw/live/ is git-ignored)
├── proposals/
│   ├── roadmap.md             provisional top 10 + security track
│   └── owner-checks.sql       read-only RLS / money-type checks for the owner
├── prototype/                 Next.js 16 + TS + Tailwind landing page (README inside)
├── screenshots/prototype/     390/768/1440 × light/dark, form states, 200 % text
└── tools/                     capture, lighthouse, axe, contrast, smoke, asset renderer
```
