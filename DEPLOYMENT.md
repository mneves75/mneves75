# Deployment — mvneves.dev

## Build locally

```bash
bun install
bun run check
bun run build
bun run preview
```

The production artifact is `dist/` plus the root-language Worker in `worker/`. No API key, database, or build-time
GitHub token is required.

## Cloudflare Workers Static Assets

1. Authenticate Wrangler in the intended Cloudflare account: `wrangler login`.
2. Confirm the target account and project name before deploying: `wrangler whoami`.
3. Build: `bun run build`.
4. `bun run build` also runs `scripts/csp-headers.mjs`, which replaces `script-src 'unsafe-inline'` in `dist/_headers` with sha256 hashes of the inline scripts in the built HTML, and `scripts/sitemap-lastmod.mjs`, which stamps `dist/sitemap.xml` with each page's last significant change from `src/data/sitemap-lastmod.json` (and updates that manifest when content changed; commit it: CI builds with `LASTMOD_CHECK=1`, which fails on a stale manifest instead of rewriting it). Never deploy a `dist/` built any other way; `bun run test` asserts the hashed policy and the lastmod manifest.
5. Deploy the production static asset Worker explicitly: `wrangler deploy --env="" --config wrangler.jsonc`.
6. In Cloudflare dashboard, add `mvneves.dev` under **Workers & Pages → mvneves-dev → Settings → Domains & Routes → Custom Domains**.
7. Confirm the domain serves `/`, `/work/`, `/pt-br/`, and a newly added portfolio detail route such as `/work/bolao-2026/` before changing redirects.

`wrangler.jsonc` intentionally has no account ID or secret. Do not add tokens to the repository or client bundle.

Since 1.10.0 the Worker has one script, `worker/index.js`, and `assets.run_worker_first: ["/", "/lang"]` invokes it
only for the root and the language-choice endpoint; every other path is served straight from the assets. It sends an
arrival at `/` whose browser's top language is Portuguese to `/pt-br/` (302, `Cache-Control: no-store`) and otherwise
returns the English page from the `ASSETS` binding, where `_headers` still apply. Both carry
`Vary: Accept-Language, Cookie`. `POST /lang?set=en|pt`, sent by the language control, answers 204 with the `mn-lang`
cookie (403 unless the request comes from the site itself, 400 for another value, 405 for another method).
`_headers` applies only to asset responses, so the Worker copies the root page's `/*` headers (CSP, HSTS, framing,
CORP and the rest) onto the responses it builds itself; the browser gate compares them. `bun run test` imports
the module into its Node server, which cannot see workerd-only rules (the main module may export only its handler:
a named string export made workerd refuse to start) or prove that `_headers` reach the root. Whenever `worker/`
changes, and before a deploy, run the gate against real workerd:

```bash
wrangler dev --env staging --config wrangler.jsonc --ip 127.0.0.1 --port 8799
BASE_URL=http://127.0.0.1:8799 bun run smoke
```

## Staging publish

The repository defines a separate Workers Static Assets environment so staging cannot target the production Worker by accident:

```bash
bun run build
wrangler whoami
wrangler deploy --env staging --config wrangler.jsonc
```

The staging Worker name is `mvneves-dev-staging`. This publishes the static artifact but does not attach a custom domain or change DNS. Verify the generated `workers.dev` URL returned by Wrangler before sharing it. Production remains a separate, explicit `wrangler deploy` action.

**Routes inheritance trap (fixed 2026-08-10):** named Wrangler environments inherit the top-level `routes` key. Before `env.staging` set `"routes": []`, a staging deploy silently claimed the `mvneves.dev`/`www` custom domains for the staging Worker. Keep the empty `routes` override in `env.staging`; if a staging deploy ever prints the custom domains under its triggers, redeploy production immediately to reclaim them.

### Latest staging evidence

- 1.9.1 (tag `v1.9.1-beta1` @`e674ddfd`, 2026-09-25): Worker version `46b30ce4-6a77-48c1-a5f6-be1fe29ea938`, only the
  workers.dev trigger; smoke all checks; `/pt-br/work/` ItemList of 48.
- 1.9.0 (tag `v1.9.0-beta1` @`083bf131`, 2026-09-25): Worker version `a29771fb-a419-4239-8a11-1ebb095b1c4f`, only the
  workers.dev trigger. `BASE_URL=https://mvneves-dev-staging.mvneves.workers.dev bun run smoke`: all checks passed; served
  headers confirm `/images/projects/og/*.jpg`, the covers and the site cards carry no CORP while pages keep `same-origin`.
- Published URL: `https://mvneves-dev-staging.mvneves.workers.dev`
- Worker version: `07e1cfca-6bab-459f-97e0-b8fbaacfd9f8` (1.8.0 at `d0367bd8`, 2026-09-23); only the workers.dev trigger.
  `BASE_URL=… bun run smoke`: 11/11 (new in-motion filter check included). Lighthouse mobile on `/`, two runs:
  performance 97–100, accessibility 100, best practices 100, SEO 100, LCP 1.6 s, CLS 0 (production 1.7.0 baseline the
  same hour: performance 97–100, LCP 1.6–2.2 s). Tag `v1.8.0-beta1` at `a1f8a146`. HTTPS git has no credentials on this
  Mac; push over SSH: `git push git@github.com:mneves75/mneves75.git HEAD:main`.
- Worker version: `b9851ddf-a240-4352-8f7e-16085f07be58` (1.7.0, tag `v1.7.0-beta1`, 2026-09-23); only the workers.dev
  trigger. `BASE_URL=https://mvneves-dev-staging.mvneves.workers.dev bun run smoke`: 10/10 (staging gets no beacon:
  Cloudflare injects it only on the proxied custom domains).
- Worker version: `ddbbb36a-7be6-432a-98f6-e7184037de59` (1.6.1, tag `v1.6.1-beta1`, 2026-09-23); only the workers.dev trigger. Remote smoke:
  headers and CORP exception on OG images/favicon, hashed CSP, ten skills in both locales, 13 pages with zero CSP
  violations or JS errors (detector proven by a planted inline style), palette/pause/terminal/filter behaviour.
- Worker version: `8e737e72-8f8a-4f71-bdb9-3ef8fec1f7a5` (1.5.0, tag `v1.5.0-beta1`, 2026-09-15); the deploy printed only the workers.dev trigger.
- Remote smoke verified: App Store links by locale on `/work/dnschat/` (us) and `/pt-br/work/weathersunscreen/` (br), no ffts-grep image on `/work/cf-toolkit/`, nine skills, devtrim v0.9.6, hay 0.458, "no license yet" status on unlicensed repos, CSP without `'unsafe-inline'`.

### Latest production evidence

- 1.9.1 (tag `v1.9.1` @`e674ddfd`, 2026-09-25): Worker version `7e44581b-2b37-4c0f-a321-eddd1781b61a`, triggers only
  `mvneves.dev` and `www.mvneves.dev`; smoke all checks; live sitemap crawl 106 URLs, 0 failures.
- 1.9.0 (tag `v1.9.0` @`083bf131`, 2026-09-25): Worker version `e711703f-9b2a-4544-a603-4713b0aff425`, triggers only
  `mvneves.dev` and `www.mvneves.dev`. `BASE_URL=https://mvneves.dev bun run smoke`: all checks passed. Live sitemap crawl:
  106 URLs, each 200 with one self canonical, `<lastmod>`, OG image 200, `max-image-preview:large`, BreadcrumbList below the
  home page; 0 failures (212 before this release).
- 1.8.0 (tag `v1.8.0` @`52fbcaf4`, 2026-09-24): Worker version `70ea7855-c753-4b35-8009-7ad607fa46b6`, triggers only
  `mvneves.dev` and `www.mvneves.dev`. `BASE_URL=https://mvneves.dev bun run smoke`: 11/11. Staging before it:
  `948acfc8-643d-45ce-8a3c-64c2a3ca8f00` (`v1.8.0-beta2`).

- 1.7.0 (tag `v1.7.0`, 2026-09-23): Worker version `96a586e2-a9e8-4bae-958e-dccdd19d706c`, triggers only `mvneves.dev`
  and `www.mvneves.dev`. Web Analytics live: on `/`, `/pt-br/work/` and `www…/about/` Chrome loads
  `static.cloudflareinsights.com/beacon.min.js/v31…` (200) and posts to same-origin `/cdn-cgi/rum` (204), zero CSP
  violations. `BASE_URL=https://mvneves.dev bun run smoke`: 10/10.
- 1.6.1 (tag `v1.6.1`, 2026-09-23): Worker version `79dfd2d2-723b-4928-bfd3-75e8d1d684d5`, triggers only `mvneves.dev` and
  `www.mvneves.dev`. Verified live on both hostnames: 200/404, `style-src 'self'`, new script hash, CORP detached only on
  OG images/favicon, ten skills. Only CSP violation: the zone-injected Cloudflare Web Analytics beacon
  (`static.cloudflareinsights.com`), blocked since before 1.6 — analytics collects nothing until that is decided.
- 1.5.0 (tag `v1.5.0`, 2026-09-15): Worker version `2becbaf6-b9d3-4c37-84f7-34a5e67d5111`, custom domains `mvneves.dev` and `www.mvneves.dev` still attached. Verified live: store links, cf-toolkit plate, nine skills.
- Published URLs: `https://mvneves.dev` (custom domain) and `https://mvneves-dev.mvneves.workers.dev`
- Worker version: `940113fd-34c2-468e-8624-023bd62e517b` (1.4.0, tag `v1.4.0`, 2026-08-27) — STOA added; custom domains `mvneves.dev` and `www.mvneves.dev` still attached. Verified live: `/work/stoa/` and `/pt-br/work/stoa/` 200 on apex and www, 34 project rows in both locales, 78 sitemap URLs, no link to the private source repo. A stale edge-cache HIT can lag a minute after deploy.
- Both `mvneves.dev` and `www.mvneves.dev` custom domains are attached declaratively via `routes` (`custom_domain: true`) in `wrangler.jsonc` — Wrangler provisions DNS records and certificates on deploy. Neither hostname had a DNS record before 2026-08-10.
- Remote smoke verified on both hostnames: `/`, `/pt-br/`, `/work/` 200, unknown route 404 (apex), pt-BR copy and `og-image-pt.png` served over valid TLS. `www` serves the same assets; every page's canonical URL points at the apex, so search engines consolidate on `mvneves.dev`.
- Optional dashboard follow-ups (Redirect Rules): replace the `www` custom domain with a strict `www → apex` 301, and add `mvneves.app → mvneves.dev` (that zone is not managed by this Worker config).

## Permanent redirects

Use Cloudflare **Redirect Rules**, not a legacy Pages `_redirects` file and not a Worker-side redirect. Create two single-redirect rules in the account that owns the source host:

### mvneves.app → mvneves.dev

- Rule expression: `http.host eq "mvneves.app"`
- Target URL: `https://mvneves.dev${http.request.uri.path}`
- Status code: `301`
- Preserve query string: enabled

Create the same rule for `www.mvneves.app` if that hostname is enabled.

### www.mvneves.dev → mvneves.dev

- Rule expression: `http.host eq "www.mvneves.dev"`
- Target URL: `https://mvneves.dev${http.request.uri.path}`
- Status code: `301`
- Preserve query string: enabled

Put the redirect rules above any broader rewrite or cache rule. Verify with:

```bash
curl -I https://mvneves.app/
curl -I https://www.mvneves.dev/work/
```

Expected result: one `301` with the canonical `Location` header. Do not mutate DNS or Cloudflare configuration from this repository without explicit authorization.

## Headers and cache behavior

`public/_headers` is copied to the static output. It sets security headers, a same-origin CSP, and immutable caching for images/assets. HTML remains revalidatable at the edge; purge only if a deployment has stale HTML or an operational incident requires it.

## Security posture

Reviewed 2026-08-10 against the deployed site and the repository configuration.

Reviewed again 2026-09-15 for 1.6.0 (independent source-grounded audit: no Critical/High findings; the Medium
items — vulnerable build toolchain and `style-src 'unsafe-inline'` — are fixed).

Response headers (`public/_headers`, verified served from production before the review): HSTS
(`max-age=31536000; includeSubDomains`, added in 1.1.0 — production was serving no HSTS header),
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` denying camera/microphone/geolocation/payment/usb/browsing-topics,
`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin` (detached since 1.6.1 on `/og-image.png`,
`/og-image-pt.png` and `/favicon.svg`, which web-view link previews such as Apple Mail load cross-site; 1.9.0 adds
`/images/projects/*`, the project pages' `og:image`, which is not yet verified served because 1.9.0 is not deployed),
`X-Frame-Options: DENY`
(legacy browsers; `frame-ancestors 'none'` covers the rest), and a same-origin CSP with `frame-ancestors 'none'`,
`base-uri 'self'`, `form-action 'self'`, and `object-src 'none'`.
HSTS is deliberately not `preload`: preload is effectively irreversible for the apex domain.

CSP has no `'unsafe-inline'`. `script-src` lists sha256 hashes of the inline scripts in the built HTML
(`scripts/csp-headers.mjs`, since 1.3.0; JSON-LD data blocks are not executed and need none). Since 1.6.0
`style-src` is `'self'`: `build.inlineStylesheets: 'never'` emits every component stylesheet as a file, and
runtime style changes go through the CSSOM (`el.style`, `setProperty`), which CSP does not govern. The route
test fails on any inline `<style>` block, `style=` attribute, or `'unsafe-inline'` in either directive. The
site takes no user input and has no auth; the hidden terminal escapes the visitor's own typed input before echoing
it. Since 1.10.0 it sets one first-party preference cookie, `mn-lang` (`en` or `pt`, `Max-Age` a year, `Path=/`,
`SameSite=Lax`, `Secure`), and only when the visitor follows the language control (click or middle-click). The
control writes it in the page and posts it to `/lang` (`keepalive`), where the Worker sets it as an HTTP cookie:
Safari keeps a script-set cookie only 7 days. `/lang` refuses a request that does not come from the site itself
(`Sec-Fetch-Site`, else `Origin`, else Referer), so another site cannot set a visitor's language. The root re-issues
a valid choice on each visit; responses that set the cookie are `private` or `no-store`. Nothing else reads it. The
root redirect goes to a fixed path plus the request's own query (no open redirect). Its only third-party script (since 1.7.0) is the Cloudflare Web Analytics beacon the
zone injects at the edge: `script-src` allows `https://static.cloudflareinsights.com/beacon.min.js/` (a
trailing-slash path source prefix-matches the versioned beacon URL and nothing else on the host; the file-exact
source from Cloudflare's FAQ would block it, and `'strict-dynamic'` cannot cover an edge-inserted tag). Cloudflare
adds a sha512 `integrity` attribute to the tag. It reports to
same-origin `/cdn-cgi/rum`, so `connect-src` stays `'self'`. The route test fails on any other external script
host. `bun run test` also runs `scripts/test-browser.mjs`, which serves `dist/` with `_headers` applied and
drives system Chrome: CSP violations (with a planted-violation control), palette, pause, filter, terminal, 404s
and 360px overflow.

Production serves only the custom domains: `workers_dev` and `preview_urls` are `false` at the top level of
`wrangler.jsonc` (the workers.dev URL already answered `error code: 1042`; now explicit). Accepted: the staging
workers.dev URL is indexable (one `_headers` file serves both environments, and staging receives the same
bytes as production); `www` duplicates the apex with an apex canonical until a 301 Redirect Rule exists.

Supply chain: both workflows pin `actions/checkout` to a commit SHA and declare least-privilege
`permissions`; CI runs with a read-only token and `persist-credentials: false`; Dependabot watches
GitHub Actions and the `bun` ecosystem. Dependabot alerts do not see bun's transitive tree, so CI runs
`bun audit --audit-level=high` (1.6.0: astro 7.3.2 and in-range fast-uri/js-yaml/svgo updates took it from
10 advisories to 0; none of that code reaches `dist/`). `lint:design` pins `impeccable@3.6.1`. A TruffleHog
`verified,unknown` scan over all 113 tracked and modified files returned no findings. The repository
holds no secrets, and deployment credentials live only in the operator's local Wrangler session.

## Analytics

Cloudflare Web Analytics, enabled at the zone (automatic setup: Cloudflare injects the beacon into HTML responses
of the proxied custom domains, not into staging on workers.dev). Allowed by CSP since 1.7.0; it was blocked
before, so there is no earlier data. Cloudflare states it keeps no client-side state (no cookies or
localStorage) and does not fingerprint visitors by IP or User-Agent
([Cloudflare blog](https://blog.cloudflare.com/free-privacy-first-analytics-for-a-better-web/)). On the Free
plan the automatic setup excludes EU/EEA visitors' data by default
([Cloudflare docs](https://developers.cloudflare.com/speed/observatory/rum-beacon/#rum-excluding-eeaeu)); the
choice lives in the dashboard (Web Analytics → site settings).
Do not add Google Analytics or any other third-party script without a separate product decision and
consent/privacy review.

## Launch checklist

- [ ] Verify the 26 local project image assets' provenance before public launch.
- [ ] Confirm LinkedIn and GitHub URLs.
- [ ] Confirm custom domains and redirect rules return the expected 301/200 behavior.
- [ ] Check `/robots.txt`, `/sitemap.xml`, canonical, hreflang, and OG metadata on both locales.
- [ ] Run `bun run check && bun run build` from a clean checkout.
- [ ] Confirm the generated sitemap includes all 34 project slugs in both locales.
- [ ] Inspect desktop and mobile screenshots after deployment.
