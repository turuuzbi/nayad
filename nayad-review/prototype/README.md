# NAYAD landing page prototype

An improved landing page for nayad.store, built as a proposal. **Landing page only:** no backend,
no real authentication. "Бүртгүүлэх" and "Нэвтрэх" go to a stub page (`/app`), and the
pricing waitlist validates on the client and sends nothing anywhere.

Design and copy are original; no assets from the live site are used. The only things carried
over are the product name, its Mongolian terms (өглөг, падаан, төлөлт, зээл) and the theme
color `#FFC107`.

## Run

Requires Node.js ≥ 22.18 (tests use Node's built-in TypeScript support).

```bash
npm ci
npm run dev          # http://localhost:3000
npm run check        # typecheck + lint + unit tests + production build
npm run build && npm start
```

## What is on the page

| Section | Notes |
|---|---|
| Header | Logo, section links (≥ 1024 px), "Нэвтрэх" (secondary), "Бүртгүүлэх" (primary). Wordmark text hides below 360 px so the header fits at 320 px. |
| Hero | Headline (what + for whom), one primary CTA, product mock-up built in HTML/CSS. Mock-up totals are computed from its rows and dates are relative, so it can't show inconsistent numbers or stale dates. |
| Trust points | Mongolian language, installable, Google / Face ID sign-in. |
| Боломжууд | Six capabilities, all taken from the product brief. |
| Хэрхэн ажилладаг | Three steps. |
| Утсандаа суулгах | iPhone (Safari) and Android (Chrome) steps naming each button in Mongolian and English. |
| Үнэ | "Coming soon" with a waitlist (phone/email toggle, Mongolian validation) and a "start now" link. |
| Түгээмэл асуулт | Native `<details>`; the same data generates FAQPage structured data. |
| Footer | Developer name, phone, email, privacy, terms. |
| `/privacy`, `/terms` | Section skeletons with a visible "draft" notice. |

## Placeholders to replace (all in `src/lib/site.ts`)

| Key | Current value |
|---|---|
| `PLACEHOLDER.company` | `Компанийн нэр` |
| `PLACEHOLDER.phone` / `phoneHref` | `+976 0000 0000` |
| `PLACEHOLDER.email` | `hello@example.com` |
| `SITE.signupUrl`, `SITE.loginUrl` | `/app` stub; point to the real app routes |

## Claims the owner must confirm before using this copy

The copy was written without access to the product. Each line below states something about
NAYAD that only the owner can confirm. Change or remove any that are not true.

1. "Таны оруулсан өглөг, падаан, төлөлт зөвхөн таны бүртгэлээр нэвтэрсэн үед харагдана" (FAQ):
   requires Row Level Security on every table, scoped per business (see
   `../proposals/owner-checks.sql`).
2. Payments update the customer's balance automatically (Төлөлт card, step 3).
3. Invoices (падаан) create the customer's debt (step 2).
4. Loans can be recorded and the remaining balance seen (Зээл card).
5. Sign-in by phone + password, Google, and Face ID; legacy email login exists; there is a
   password-reset link on the login page (FAQ wording assumes these labels exist).
6. Works in any modern browser on phone, tablet and computer.
7. Waitlist promises: "Нэг удаа л мэдэгдэнэ", "Сурталчилгаа илгээхгүй", "Хүссэн үедээ
   татгалзана". Keep them only if the owner commits to them.
8. "Одоо бүртгүүлэх" implies the product can be used now while pricing is unannounced.

## Decisions and trade-offs

- **Zoom is never disabled.** Inputs use 16 px text so iOS does not zoom on focus.
- **Colors:** `#FFC107` only behind near-black text (10.7:1) or as a foreground on dark
  surfaces (11.5:1). Every text pair is ≥ 6.5:1; see `../findings/compare.md`.
- **Dark mode** follows `prefers-color-scheme` via CSS variables (`src/app/globals.css`).
- **System fonts:** zero font download, and full Mongolian Cyrillic (Ө ө Ү ү) and ₮ coverage.
  Web fonts would need the `cyrillic-ext` and `latin-ext` subsets.
- **One client component** (`waitlist-form.tsx`); everything else is a Server Component and all
  routes are statically prerendered.
- **`experimental.inlineCss`:** the ~6 KB Tailwind CSS is inlined to remove a render-blocking
  request. It is experimental in Next.js 16; remove the flag if it causes trouble. Returning
  visitors lose separate CSS caching.
- **Security headers** in `next.config.ts`. CSP has no nonces, so the page stays static;
  `script-src` therefore needs `'unsafe-inline'` for Next.js's inline hydration scripts. HSTS
  includes `preload`; keep it only if every subdomain serves HTTPS.
- **Money:** amounts are whole tugriks (integers). `formatMNT` throws on fractions instead of
  rounding silently; tests cover it.

## Tests

`npm test` runs `tests/*.test.ts` with Node's built-in test runner (no extra dependency):
money formatting and sums, mock-up totals and due-date buckets, and phone/email validation
with Mongolian error messages. Browser-level checks (keyboard, form states, reflow, console/CSP
errors) are in `../tools/prototype-smoke.mjs`.

## Known items

- `npm audit` reports 5 high-severity advisories, all one issue: `braces`, pulled in through
  `fast-glob` by `@next/eslint-plugin-next`. It is a dev-time lint dependency and does not ship
  to the browser or server bundle. npm's suggested fix downgrades `eslint-config-next` to 14, so
  it was not applied.
- `AGENTS.md` / `CLAUDE.md` were generated by `create-next-app`.
