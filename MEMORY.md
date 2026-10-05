# MEMORY — mvneves.dev

Curated long-term state. Daily journals live in `memory/YYYY-MM-DD.md`. Read both at session start.

## Current state (2026-10-05, 1.12.1 LIVE: prod `3bc55462`, tag `v1.12.1` @`448200bc`; staging `745b76cf`)

- 1.12.1: `/` opens in Portuguese for a browser that accepts Portuguese anywhere in its list (see Key decisions).
- Lesson: the first smoke run right after a deploy can time out on "choosing Portuguese sticks": the keepalive
  `POST /lang` races the navigation and a cold Worker loses it, so Playwright never sees the response. Rerun once
  before judging; `POST /lang` answered 204 with the cookie when called directly.

## Earlier state (2026-10-05, 1.12.0: prod `540dff98`, tag `v1.12.0` @`21a44328`; staging `4a070148`)

- 1.12.0: Busca Remédios Brasil added (49 projects; private repo, so no source link). A `seo-audit` pass of the live
  site found nothing high-impact; shipped three related projects per project page, 39 hand-written cover alts
  (`portfolioProject` now fails the build on a cover without one), sentence-bounded descriptions, descriptive section
  titles and `twitter:site`. Left for the owner: the four near-duplicate Cruzadas pages, Skills' 371-character summary.
- Lesson: `ProjectRow` collapses by container width; any list that reuses it must set `container-type: inline-size`
  (the browser gate caught a 360px overflow on project pages when the related rows had no container).
- Lesson: a description cap that keeps whole sentences cannot shorten a first sentence that is already too long; 39
  descriptions stay over 165 characters until the copy changes.

## Earlier state (2026-10-03, 1.11.2 LIVE: prod `8f1cdb5a`, tag `v1.11.2` @`5cdbb652`; staging `9793e8d7`)

- 1.11.2: the fresh reverify of 1.11.1 passed 19/20 and failed load time on `/work/dnschat/` (median 2.04 s): the
  cover is the LCP element and phones fetched the 1600px original. Covers now ship 400w/800w copies via srcset
  (`scripts/og-covers.sh`, needs `cwebp`); live 1.28–1.30 s. Lesson: lab LCP is bimodal; take 5 runs, never 1–3.

## Earlier state (2026-10-03, 1.11.1 LIVE: prod `6e472c29`, tag `v1.11.1` @`763463af`; staging `647a1a3e`)

- 1.11.1: independent verification of 1.11.0 (Codex, 20 frozen criteria) passed 19; it failed WhatsImovel's
  "anonymised under the LGPD" claim, which the product's privacy policy contradicts (pseudonymised HMAC per IP).
  Fixed. Lesson: privacy wording (anonymised vs pseudonymised) is a factual claim; check it against the policy.

- Google Search pass (`docs/google-search.md`): most of the checklist already held; shipped the font trim (Archivo wght
  400–900, normal width, 88 → 33 KB preload), lazy work-index covers, ≥100-char descriptions from visible text, a
  linked `MN://WORK/<slug>` breadcrumb, and gates for each item. Live LCP 1.4–1.6 s. FAQ schema declined (Google
  retired FAQ rich results 2026-05-07). Search Console submission/indexing status needs the owner's login.
- CI audit ignores only GHSA-ch52-4w7c-c8xp (http-cache-semantics, no fix; Astro build-time remote-image cache only).
  Remove the ignore when a patched release exists.
- Lesson: Lighthouse never scrolls or hovers; measure CLS for those in the browser gate. Scroll anchoring absorbs a
  header that shrinks above the viewport (measured 0).
- Lesson: a link gate that only reads root-relative hrefs, or counts `<head>` hreflang as inbound links, passes
  orphans and broken relative links; resolve URLs against the page and walk body anchors from the homes.
- Lesson: in zsh never name a loop variable `path` (it is tied to `PATH`); briefs for helper agents must forbid killing
  processes they did not start (a reviewer killed babimakeup's 8765 server on 2026-10-03).

## Earlier state (2026-10-02, 1.10.1 LIVE: prod `3f8d7819`, tag `v1.10.1` @`417fd21`; staging `84fe8e95`)

- ChatGPT Search audit: existing initial HTML, canonical metadata, sitemap, 404 exclusions and crawler policies passed. Preserved wildcard search/training permissions and cookieless Web Analytics; no content or significant-change dates moved.
- Smoke now verifies served discovery files and campaign-independent canonicals, with local negative controls. Every sitemap URL must be inspected, including one without `lastmod`; filtering only dated entries misses extra URLs. All 20 checks passed on real workerd, staging, apex and www; release CI passed. Build-time fast-uri 3.1.6 → 3.1.7 fixed the failing high-severity audit.
- Measurement remains separate: current analytics catalogue access returned 403; Cloudflare Web Analytics explicitly does not support UTM parameters/custom events. Use exact Referer host `chatgpt.com` for the ChatGPT report category. Genuine OpenAI events and ChatGPT UI citations were not measured. The fixed six-question protocol and access steps live in `docs/chatgpt-search.md`.

## Earlier state (2026-09-26, 1.10.0 LIVE: prod `11bf8f2e`, tag `v1.10.0` @`d25c34fc`; staging `3098bcd6`)

- 1.10.0: `/` sends arrivals whose browser's top language is Portuguese to `/pt-br/` through `worker/index.js` (run
  only for `/` and `/lang`); the language control's `mn-lang` cookie wins, stored over HTTP by `POST /lang`; internal
  navigation never redirects.
- Lesson: workerd refuses a main module that has a non-handler named export (a string constant); the Node harness in
  `bun run test` cannot see that. Run the gate against `wrangler dev` whenever `worker/` changes.
- Lesson: Playwright contexts default to the machine's locale; the gate now pins `en-US` so a pt-BR Mac does not
  send `/` to `/pt-br/` under every check.
- Lesson: Safari keeps a `document.cookie` cookie only 7 days; a preference meant to last must also be set by the
  server, and at the moment it is chosen (here `POST /lang`), not on some later visit.
- Lesson: Playwright reports a `keepalive` request that outlives its page as `requestfailed` even after a 204; wait on
  its `response` event instead of `requestfinished`.
- Lesson: Cloudflare injects the Web Analytics beacon only for a browser `Accept` header (text/html first); curl's
  default `*/*` gets no beacon on any page, so a curl check alone reads as a regression that is not there.

## Earlier state (2026-09-23, 1.8.0 on staging)

- **1.8.0 LIVE** (prod `70ea7855`, tag `v1.8.0` @`52fbcaf4`; staging `948acfc8`, `v1.8.0-beta2`). 48 projects with a `stage` field
  (live / appReview / beta / building); public count = live with a link (37). Evidence per stage:
  `agent_planning/2026-09-projects.md`. Tag `v1.8.0-beta1`. HTTPS git has no credentials here; push over SSH
  (`git push git@github.com:mneves75/mneves75.git HEAD:main`).
- Rule: promote an app to `live` and add `appStore` only after it appears in the br + us lookup; unreleased projects
  link a product or support page labelled "Product page", never staging.
- Lesson: Lighthouse `label-content-name-mismatch` has weight 0, so accessibility can read 100 while WCAG 2.5.3
  fails; read that audit directly.

## Earlier state (2026-09-23, later)

- **1.7.0 LIVE** (prod `96a586e2`, staging `b9851ddf`): Cloudflare Web Analytics enabled (beacon 200, `/cdn-cgi/rum` 204 verified live) — CSP `script-src` allows the path source
  `https://static.cloudflareinsights.com/beacon.min.js/` (trailing slash = prefix match of the versioned beacon URL;
  Cloudflare's file-exact FAQ source blocks it; reports go to same-origin
  `/cdn-cgi/rum`). Browser gate `scripts/test-browser.mjs` runs in `bun run test` and CI with system Chrome via
  `playwright-core` (no download); it failed the pre-fix 1.6.0 build on exactly the five bugs it guards. After a deploy:
  `BASE_URL=<url> bun run smoke`.
- Lesson: Playwright request interception (`context.route`) on every context made cross-document view transitions
  abort with a spurious `InvalidStateError` in 3 of 5 gate runs (0/30 on real staging and a plain server). Scope
  `route` to the one check that needs it.

## Earlier state (2026-09-23)

- **1.6.1**: pre-release review of 1.6.0, shipped together — LIVE (prod `79dfd2d2`, staging `ddbbb36a`) (1.6.0 was never deployed or tagged on its own). Paused marquee no longer clipped, terminal timers cancelled on close, empty-query Enter in ⌘K no longer opens the terminal, pause glyph keyed on `data-motion`, work filter on `hidden`, Skills = ten skills / three MIT, devalue 5.9.4 (one-entry lockfile edit), CORP detached on OG images + favicon.
- Lesson: `agent-browser console` does NOT surface CSP violations — a "clean console" is vacuous. Register a `securitypolicyviolation` listener with `--init-script` and prove it with a planted inline `<style>` first.
- Lesson: deleting one `bun.lock` entry makes bun re-resolve ~40 in-range packages; for a single-package security fix, edit that entry's version + integrity in place and confirm with `--frozen-lockfile`.
- Lesson: `wrangler dev` dies if `bun run build` recreates `dist/` under it; restart after rebuilding. Port 8799 is often held by another project's dev server — check `lsof` before trusting a response.

## Previous state (2026-09-15, later)

- **1.6.0** (shipped in 1.6.1): full-site review. Motion pause control (WCAG 2.2.2), ⌘K palette actually filters and navigates (it never did), terminal as native `<dialog>`, dark-theme AA tokens, pt-BR 404 via an `astro:build:done` hook, CSP `style-src 'self'`, astro 7.3.2 with `bun audit` clean, content fixes from primary sources. `AGENTS.md` now holds gates and invariants.
- Unlisted App Store apps by the same developer (id 1487532985): IA Palavras Cruzadas (6767752911) and GP Race Stats (6776818539). Not on the site; adding them needs source material first.
- Lesson: a filter that sets `hidden` is dead code whenever a class sets `display`; the global `[hidden] { display: none !important }` rule exists for that. Behaviour bugs in the palette survived since launch because the route test is static HTML only; verify JS behaviour in a browser under the served CSP.

## Previous state (2026-09-15)

- **1.5.0**: factual corrections found by cross-checking against conhecendotudo.com.br and GitHub: open-source flag only with a detected license (weathersunscreen, polymarket-analyzer, ai-calories-tracker are public but unlicensed), devtrim v0.9.6, cf-toolkit without the ffts-grep image, hay 0.2.0 figures, nine skills, benchmark stack with V/TypeScript. App Store links (`appStore` field) on dnschat and weathersunscreen, verified live in the public lookup. The other iOS apps are not published yet; do not add store links before they appear in `itunes.apple.com/lookup`.

## Previous state (2026-08-27)

- **1.4.0**: STOA added (34 projects, sitemap 78). Listed with a live link and **no source link** — `mneves75/stoa` is private, and both the repo and its `/security/advisories/new` URL return 404 anonymously (verified with an unauthenticated request, positive control on a public repo). `openSource: false`. When that repo is made public, add `source` and flip the flag.
- Carries the pending Skills entry + README row from 2026-08-26.
- New pt diagram labels: `lesson`, `practice`, `journal`, `browser-only progress`.

## Previous state (2026-08-24)

- **1.3.0 is LIVE in production** (Worker `e29dd7d5-c220-43a7-ab8d-da719ea1a7e9`, tag `v1.3.0`; staging `e0c15609…`, tag `v1.3.0-beta2`). Adds `hay` + `devtrim` (33 projects) and a hashed CSP (`scripts/csp-headers.mjs` runs after `astro build`; `script-src` has no `'unsafe-inline'`). Any new inline `<script>` changes the hash set automatically; an inline `style=` attribute would fail the route test. Local `wrangler dev` needs `wrangler@latest` (the pinned workerd rejects compatibility_date 2026-08-09).
- Lesson: `git commit -- <paths>` with an untracked path in the list fails as a whole; the follow-on `git push` then pushed nothing and the beta tag landed on the old HEAD (deleted, retagged beta2). Always `git add` new files first and check `git log -1` before tagging.
- Remote history was rewritten 2026-08-19 (public-repo cleanup); local `main` was realigned to `origin/main` on 2026-08-24 (old history kept at `backup/main-pre-rewrite-2026-08-24`).

## Previous state (2026-08-13)

- **1.2.2 is LIVE in production** at https://mvneves.dev (Worker `mvneves-dev`, version `4e0cfdbb-23b0-4fca-ada6-840feea0ae7c`) and staging (`e925b458-4e17-45f1-b66f-a9b9dd1855f8`). Hero decoder wraps in the copy column instead of sitting under the terminal. Design contract: `DESIGN.md` v3; evidence: `CHANGELOG.md` + `DEPLOYMENT.md`.
- Tree committed and pushed 2026-08-13.

## Key decisions + why

- Custom domain `mvneves.dev` is attached **declaratively** via `routes` + `custom_domain: true` in `wrangler.jsonc` (2026-08-10). Before that the apex had **no DNS record at all** — prod only existed on workers.dev. Never go back to dashboard-only attachment.
- **Root language, corrected 2026-10-05 (1.12.1)**: Portuguese when the browser accepts Portuguese *anywhere* in its
  list, not only first. The owner's Mac is pt-BR, but his Chrome profile sends `en-US,en,pt,de,zh-CN`, so the 1.10.0
  "top language" rule kept serving him English. Lesson: test a language rule with the owner's real browser header
  (`intl.accept_languages` in the Chrome profile), not with a tidy `pt-BR,pt;q=0.9`.
- **Root language (owner, 2026-09-25)**: `mvneves.dev/` follows the visitor's language ("pt-br or other → us"),
  replacing the 1.0.0 rule "No browser-language auto-redirect". Only `/` redirects, only on arrival, and the
  language control's choice wins, so crawlers keep the English x-default and nobody is trapped (Google and W3C
  guidance).
- **Named Wrangler envs inherit top-level `routes`**: a staging deploy once claimed the prod custom domains. `env.staging` must keep `"routes": []` (+ `workers_dev: true`); details in `DEPLOYMENT.md`.
- Palette stays graphite/bone/copper (not CT's coral) so the personal site reads as a sibling of conhecendotudo, not a twin. Terminal panels (`--term-*`) are theme-invariant dark.
- Dosage rule (anti-pastiche): each signature device appears exactly once — decoder in hero h1, masthead+marquee once, count-ups on stat rail, magnetic on hero CTA, terminal panels as hero session + detail slab. Enforce in any future page.
- Fonts: latin + latin-ext subsets both vendored with `unicode-range`. The latin-ext file alone LACKS `ã ç é ·` — pt-BR silently falls back without the latin file.
- Scroll reveals are no-JS-safe: CSS hides only `.reveal.reveal-pending` (class added by the runtime). Never hide `.reveal` directly in CSS.
- Nav: current page = bold + 2px copper underline; hover = 1px neutral, gated `@media (hover: hover)`. They were identical once and looked like two active pages.
- Route tests are count-coupled (recommendations, project rows, palette items, sitemap locs, "Three decades shipping" on home). `scripts/test-routes.mjs` owns the numbers, derived from the inventory in `src/data/site.ts` where it can; update it in lockstep with content changes instead of restating counts here, which go stale.

## Open items

1. `www.mvneves.dev` now serves the site as a second custom domain (canonical = apex). Optional: replace with a strict 301 Redirect Rule in the dashboard; `mvneves.app → mvneves.dev` redirect still pending (separate zone).
2. No rendered page shows a content TODO (checked 2026-09-25 on the 1.10.0 build: 0 of 96 project pages carry the
   fallback "content TODO" text from `src/data/site.ts`; the recommendations page lists seven, with no open slot).
   `ProjectDetail.astro` throws at build time if a diagram step has no pt-BR label — do not add a step without one.
3. CI runs `check`/`build`/`test` on every push and PR (`.github/workflows/ci.yml`); the last-seen cron runs every 6 h.
4. Web Analytics automatic setup excludes EU visitors by default (dashboard toggle); a product decision, not code.
5. Revoke Cloudflare API tokens pasted into agent chats (again on 2026-10-05: one marcusneves2005 token, unused, and
   the conhecendo.contato "FULL" token, used for two cache rules and a purge): marcusneves2005 account (2026-09-23, unused) and the
   conhecendo.contato account "FULL" token (2026-09-23, used for purges + one cache rule; it lacks RUM write), plus
   the two from 2026-09-15 listed in conhecendoia `plans/README.md`. Tokens go through 1Password, never chat.

## Sibling sites (MEUS_SITES) — cross-site follow-ups after the 2026-09-23 sweep

Live 2026-09-23 (each repo records its own evidence): stoa 0.5.1, conhecendoia 5.1.1, conhecendotudo 0.8.1,
wine-school 0.7.1, llmdeepdive 0.6.8, babimakeup 1.7.3. Analytics is on only where the site allows it
(mvneves.dev, babimakeup, conhecendotudo with GA behind consent); stoa, conhecendoia, llmdeepdive and wine-school
promise no tracking and stay off.

1. conhecendoia: turn off Web Analytics in the dashboard (Web Analytics → conhecendoia.com.br → Disable). The beacon
   is injected and CSP-blocked: no data, one console error per visit. API update needs RUM write the token lacks.
2. stoa: same console error, but the beacon is injected zone-wide for mvneves.dev; a RUM rule's host filter only
   changes measurement, not injection (tested and reverted). Removing it for stoa means disabling mvneves.dev analytics.
3. GitHub billing blocks Actions for private repos (stoa, wine-school): no CI confirmation there.
4. vitarum_seguros: dropped by the owner (not to be published); local fixes are pushed.
5. Not touched (dirty trees owned by others): fatima_aniversario_docker, landing_page_fatima_hostinger,
   landing-page-projetos-portfolio, conhecendotudo-app-convites(-basehub), next-auth-roles; no-git folders too.
6. Done for reference: conhecendoia HTML cache rule now respects origin (`REVALIDATED`, deploys visible without a
   purge; previous ruleset saved before the change); babimakeup build tools 301 via `site/_redirects` because the
   Pages asset cache on the apex survived purges and Pages rejects 404 in `_redirects`.

## Tooling lessons

- `agent-browser press <char>` on a non-editable target repeats the key forever and floods the next focused input — harness bug, not a site bug. Use `eval` + synthetic KeyboardEvent for key-trigger tests.
- autoreview refuses binary diffs: park `og-image*.png` (`git show HEAD:path > path`) and the untracked `.woff2` files in the scratchpad before review, restore after.
