# Review tooling

Passive, read-only tools for reviewing a public website, plus helpers for the prototype.

```bash
npm ci        # Node ≥ 22.19; uses Playwright 1.56 and Lighthouse 13.5
npm test      # unit tests for the secret scanner
```

Chromium: the scripts use `/opt/pw-browsers/chromium-1194` when present (cloud environment);
elsewhere run `npx playwright install chromium` once.

## Against the live site (safe: GET requests only)

| Command | Output | What it does |
|---|---|---|
| `node capture.mjs https://nayad.store/ --label live` | `screenshots/live/`, `findings/raw/live/` | Follows same-origin links (max 15 pages, 1 s apart, skips logout/delete/API paths). Full-page screenshots at 390×844, 768×1024 and 1440×900 in light and dark. Saves server HTML, rendered DOM, headers, robots.txt, sitemap.xml, manifest, service worker, every resource with size and cache headers, and page facts (meta, OG, JSON-LD, headings, form fields, emoji, small targets, cookie flags). Scans downloaded HTML/JS for leaked keys and records only location and role. |
| `node lighthouse.mjs https://nayad.store/ --label live --runs 3` | `findings/raw/live/lighthouse-*.{json,html,md}` | Lighthouse mobile, median of N runs. |
| `node axe.mjs <url> [<url>…] --label live` | `findings/raw/live/axe.{json,md}` | axe-core WCAG 2.x A/AA + best-practice at 390×844, light and dark. |
| `node contrast.mjs [#FFC107]` | stdout | WCAG contrast of a brand color against common text colors. |

None of these log in, type into fields, submit forms or call APIs. `findings/raw/live/` and
`screenshots/live/` are git-ignored because they contain the site owner's copy and branding.
Share them privately unless the owner agrees otherwise.

## Prototype only

| Command | What it does |
|---|---|
| `node prototype-smoke.mjs http://localhost:3100/` | Keyboard, form validation/success, FAQ, console/CSP errors, 320 px reflow, 200 % text. **Submits a form**, so it refuses to run on anything but localhost. |
| `node render-prototype-assets.mjs` | Renders the prototype's icons, favicon and OG image from SVG/HTML. |
