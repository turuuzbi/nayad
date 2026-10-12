# Before / after metrics

**"Before" (live nayad.store) could not be measured.** The review environment's network
allow-list blocks the domain; see [`live-access.md`](live-access.md). Every "before" cell below
is therefore *not measured*, not zero and not a guess. The "after" column is the prototype in
[`../prototype`](../prototype), measured with the same tools that will produce the "before"
column once the domain is reachable.

To fill the "before" column (≈ 5 minutes):

```bash
cd nayad-review/tools && npm ci
node capture.mjs    https://nayad.store/ --label live
node lighthouse.mjs https://nayad.store/ --label live --runs 3
node axe.mjs        https://nayad.store/ --label live
```

## How the prototype was measured

- Production build (`next build && next start`, Next.js 16.3.8), served from `localhost:3100`.
- Lighthouse 13.5.0, default mobile config (Moto G Power emulation, simulated slow 4G,
  4× CPU slowdown). Home page: 3 runs (98, 98, 100), median reported. Privacy page: 1 run.
- axe-core 4.14 (via @axe-core/playwright 4.11) in Playwright, 390×844, light and dark color schemes, WCAG 2.0/2.1/2.2 A+AA
  plus best-practice rules.
- Capture + smoke scripts in [`../tools`](../tools). Raw output: [`raw/prototype/`](raw/prototype).

**Caveat:** localhost has near-zero server time. Lighthouse's simulated throttling still models a
slow mobile network, but a real deployment adds real TTFB and CDN behaviour. Treat these as what
the design allows, not a promise of production scores. Run the same tools against both sites
before quoting a comparison.

## Lighthouse (mobile)

| | Live nayad.store | Prototype `/` | Prototype `/privacy` |
|---|---|---|---|
| Performance | not measured | **98** | 100 |
| Accessibility | not measured | **100** | 100 |
| Best practices | not measured | **100** | 100 |
| SEO | not measured | **100** | 100 |
| First Contentful Paint | not measured | 0.8 s | — |
| Largest Contentful Paint | not measured | 2.3 s (element: hero `<h1>`) | — |
| Cumulative Layout Shift | not measured | 0 | — |
| Total Blocking Time | not measured | 80 ms | — |
| Speed Index | not measured | 0.8 s | — |
| INP | field metric only; needs real-user data (CrUX or RUM) | n/a in lab | — |
| Total page weight | not measured | 203 KiB | — |

Remaining prototype opportunities (all come from the Next.js/React runtime, not page code):
unused JavaScript ~29 KiB, legacy polyfills ~14 KiB, one "forced reflow" insight.
Source: [`raw/prototype/lighthouse-home.md`](raw/prototype/lighthouse-home.md).

## Page weight (home, transferred, gzip)

| Resource type | Live | Prototype |
|---|---|---|
| HTML (includes inlined CSS) | not measured | 27.0 KB |
| JavaScript (8 files, Next.js + React runtime) | not measured | 147.1 KB |
| CSS (separate files) | not measured | 0 (inlined) |
| Fonts | not measured | 0 (system fonts) |
| Images | not measured | 0 (mock-up is HTML/CSS; icons are inline SVG) |
| Third-party requests | not measured | 0 |

Source: [`raw/prototype/summary.md`](raw/prototype/summary.md).

## Accessibility

| Check | Live | Prototype | Evidence |
|---|---|---|---|
| axe violations (4 pages × light/dark) | not measured | **0** | [`raw/prototype/axe.md`](raw/prototype/axe.md) |
| Viewport allows zoom | reported as **blocked** (`user-scalable=no, maximum-scale=1`), not observed | yes: `width=device-width, initial-scale=1` | smoke test |
| `<html lang>` | not measured | `mn` | `raw/prototype/home.facts.json` |
| Reflow at 320 px (WCAG 1.4.10) | not measured | no horizontal scroll on `/`, `/privacy`, `/terms` | smoke test |
| 200 % text size | not measured | no horizontal scroll | smoke test, `screenshots/prototype/state__text-200pct__390__light.png` |
| Interactive elements under 44 px | not measured | 0 | `raw/prototype/*.facts.json` → `smallTargets` |
| Emoji used as content | not measured | 0 | `facts.json` → `emoji` |
| Skip link, visible focus, keyboard FAQ | not measured | pass | smoke test |
| Form errors announced + field focused | not measured | pass (Mongolian messages) | smoke test, `state__waitlist-error__390__light.png` |
| Dark mode | not measured | yes (`prefers-color-scheme`) | body bg `#FFFDF7` → `#121212` in capture |

axe left one item for manual review: contrast of the highlighted phrase "нэг дор" (axe cannot
compute over a gradient). Checked by hand: `#1A1A1A` on `#FFC107` is 10.68:1 and on `#FFFDF7`
17.11:1, so it passes AAA either way.

### Prototype color pairs (WCAG 2.x ratio)

| Theme | Foreground | Background | Use | Ratio |
|---|---|---|---|---|
| light | #1A1A1A | #FFFDF7 | body text | 17.11:1 |
| light | #555555 | #FFFDF7 | muted text | 7.33:1 |
| light | #555555 | #FFFFFF | muted text on cards | 7.46:1 |
| light | #7A4A00 | #FFF6D9 | accent label on pale yellow | 6.92:1 |
| light | #7A4A00 | #FFF3CD | warning badge | 6.75:1 |
| light | #B3261E | #FFFFFF | error text | 6.54:1 |
| light | #1E6B3A | #FFFFFF | check icons | 6.52:1 |
| light | #1A1A1A | #FFC107 | button/label on brand yellow | 10.68:1 |
| light | #FFFFFF | #1A1A1A | dark CTA button | 17.40:1 |
| dark | #F3F3F3 | #121212 | body text | 16.88:1 |
| dark | #B8B8B8 | #1C1C1C | muted text on cards | 8.59:1 |
| dark | #FFC107 | #121212 | accent / highlighted phrase | 11.49:1 |
| dark | #FF8A80 | #1C1C1C | error text | 7.47:1 |
| dark | #FFD54F | #3A3214 | warning badge | 9.04:1 |
| dark | #81D99A | #1C1C1C | check icons | 10.00:1 |

## SEO and metadata

| Item | Live | Prototype |
|---|---|---|
| `<title>` | not measured | `NAYAD — өглөг, падаан, төлөлтийн бүртгэл` |
| Meta description | not measured | Mongolian, 120 characters |
| Canonical | not measured | per page (`/`, `/privacy`, `/terms`); `/app` stub is `noindex` |
| Open Graph + Twitter card | not measured | title, description, 1200×630 image with alt, `mn_MN` locale |
| Structured data | not measured | Organization, WebSite, SoftwareApplication, FAQPage (FAQ generated from the same data as the visible FAQ) |
| robots.txt / sitemap.xml | not measured | both present; `/app` disallowed |
| Headings | not measured | one `<h1>`, sections `<h2>`, cards `<h3>` |
| Server-rendered text | not measured | all content in initial HTML (static prerender) |

## Security headers (passive)

| Header | Live | Prototype |
|---|---|---|
| Content-Security-Policy | not measured | `default-src 'self'`; `frame-ancestors 'none'`; `object-src 'none'`; `form-action 'self'` (script-src still needs `'unsafe-inline'` for Next.js hydration without nonces) |
| Strict-Transport-Security | not measured | `max-age=63072000; includeSubDomains; preload` (owner must confirm every subdomain serves HTTPS before keeping `preload`) |
| X-Frame-Options | not measured | `DENY` |
| X-Content-Type-Options | not measured | `nosniff` |
| Referrer-Policy | not measured | `strict-origin-when-cross-origin` |
| Permissions-Policy | not measured | camera, microphone, geolocation, payment, usb disabled |
| `X-Powered-By` | not measured | removed |
| Secrets in client JS | not measured | none found (passive scan of downloaded HTML/JS) |

## PWA

| Item | Live | Prototype (landing only) |
|---|---|---|
| Manifest | not measured | name, short_name, `lang: mn`, start_url, scope, `display: standalone`, theme `#FFC107` |
| Icons | not measured | 192, 512, maskable 512, apple-touch 180, SVG favicon + ICO |
| Service worker / offline | not measured | none: deliberately out of scope for a landing-page prototype; belongs to the app (see audit §6) |
