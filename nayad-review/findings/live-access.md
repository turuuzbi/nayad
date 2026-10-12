# Live-site access log

**Result: https://nayad.store could not be reached from the review environment. No live-site data was captured.**

The review runs in a sandboxed cloud container whose outbound traffic goes through an
allow-list proxy. `nayad.store` is not on that allow-list.

## Evidence (2026-10-12, UTC)

| Attempt | Route | Result |
|---|---|---|
| `curl https://nayad.store/` | container proxy | `curl: (56) CONNECT tunnel failed, response 403` |
| `curl https://www.nayad.store/` | container proxy | same 403 |
| `curl https://nayad.store/robots.txt` | container proxy | same 403 |
| `node tools/capture.mjs https://nayad.store/` (Playwright/Chromium) | container proxy | `net::ERR_TUNNEL_CONNECTION_FAILED` |
| Proxy status log | — | `connect_rejected … gateway answered 403 to CONNECT (policy denial or upstream failure)`, host `nayad.store:443` and `www.nayad.store:443` (06:02, 06:05, 06:11 UTC) |
| Control: `curl https://example.com/` | container proxy | also 403, so this is the environment's allow-list, not a fault of nayad.store |
| Google PageSpeed Insights API (remote Lighthouse) | googleapis.com (reachable) | HTTP 429 `RESOURCE_EXHAUSTED`: anonymous daily quota is 0; needs an API key |
| WebFetch tool | separate fetcher | `getaddrinfo ENOTFOUND` for every host tested, including `example.com`; not usable here |
| Web Archive / crt.sh / dns.google | container proxy | all blocked (403) |

Because the control host is blocked too, **nothing here says whether nayad.store is up, down or
resolving**; that is unknown.

## How to unblock

Any one of these:

1. **Allow the domain** in the cloud environment's network settings (environment menu → Edit →
   Network access → add `nayad.store` and `www.nayad.store` under Allowed domains), start a new
   session, then run:

   ```bash
   cd nayad-review/tools && npm ci
   node capture.mjs https://nayad.store/ --label live
   node lighthouse.mjs https://nayad.store/ --label live --runs 3
   node axe.mjs https://nayad.store/ --label live      # add other public URLs found by capture
   ```

2. **Run the same three commands on your own machine** (Node ≥ 22.19, `npx playwright install chromium`)
   and share `findings/raw/live/` + `screenshots/live/` privately.

3. **Provide a PageSpeed Insights API key** (free, Google Cloud console) for remote mobile
   Lighthouse numbers only (no screenshots of every view, no headers dump).

The tooling was verified end-to-end against the local prototype (see `compare.md`), so the
commands above are known to work.
