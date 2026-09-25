# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.9.0] - 2026-09-25

Search pass: honest sitemap dates and structured data that states only what each page shows. **Not deployed yet.**

### Added

- `<lastmod>` on all 106 sitemap URLs from a committed content-hash manifest (`src/data/sitemap-lastmod.json`, written
  by `scripts/sitemap-lastmod.mjs` inside `bun run build`). A date moves only when a page's title, description,
  canonical, `<main>` text and links, or JSON-LD change; asset names and scripts do not count. Seeded 2026-09-25,
  because this release changes the structured data of every page. A rebuild without content changes leaves the
  manifest byte-identical. CI builds with `LASTMOD_CHECK=1`, which fails on a stale or missing manifest instead of
  rewriting it, so a content change cannot land without its manifest. `LASTMOD_DATE` must be a real calendar day
  (`2026-02-30` is refused rather than rolled over to March 2).
- BreadcrumbList JSON-LD on every page below the home page (Home › Work › Project on project pages).
- Project pages describe the project as their `mainEntity`, from data the page shows: `SoftwareSourceCode` for an
  open-source repository linked from the page, otherwise `CreativeWork` — apps included. Never offers, prices or ratings.
  Apps are not `SoftwareApplication` on purpose: Google's Software app rich result requires `offers.price` plus
  `aggregateRating` or `review`, which the site cannot state truthfully, so those nodes would only show up as invalid
  items in Search Console.
- Home: a `WebSite` node (`Marcus Neves`, alternate name `mvneves.dev`) for Google's site name.
- `max-image-preview:large` robots meta on indexable pages; both 404 pages keep `noindex` alone.
- Search contract in the route test (9 checks; 7 failed on the 1.8.0 build, the other 2 and the sub-checks were proven
  with planted violations): sitemap = indexable self-canonical pages, lastmod = manifest and manifest hash = built
  page (the hash ignores asset names, scoped-style ids and query strings inside `<main>` and sees text and link edits),
  JSON-LD parses with no raw `<`, breadcrumbs (names and links checked against what is visible, not the closed command
  palette), project `mainEntity`, WebSite and Person facts, `og:image` is a built file at its declared size and
  fetchable cross-site, unique titles and descriptions with titles of at most 60 characters, robots meta.

### Changed

- Project pages preview their own 1600×1000 cover (`og:image`, `twitter:image`, alt text from the cover) instead of
  the site card; the five projects without a cover keep the card.
- Project titles name the category the page shows ("hay · Developer tools — Marcus Neves"), so English and
  Portuguese titles no longer collide. Three that would pass 60 characters keep "Project — Marcus Neves": Gradiente
  Expert XP-800 (en), Open Profile Manager and swift-fast-markdown (pt).
- JSON-LD is one `@graph` per page. The Person drops `jobTitle`, which no page states; `sameAs` keeps GitHub,
  LinkedIn and X, all linked on every page.
- `Cross-Origin-Resource-Policy` is detached on `/images/projects/*`, now link-preview images (the same exception the
  OG images have had since 1.6.1).

## [1.8.0] - 2026-09-23

### Added

- 14 projects (48 total), each checked on 2026-09-23 against its README, its live URL (anonymous request) and the public
  iTunes lookup (br + us): ArremataRadar, SINAL, CaptureVault, LUME, Lente IA, Drawing with Love, Live Run,
  MinutaDraft, Levante a Taça, Vestou, Paquera AI, Recursos de Multas, GP Race Stats and IA Palavras Cruzadas.
- Release stage per project (`stage`: live, App Store review, beta, in construction). The stat rail and hero terminal
  count only live projects with a public destination (37); unreleased work shows a text badge, an "In motion" filter
  and the terminal's `ls work/ --in-motion`. No staging URL and no store link before the public lookup.
- Archive group on `/work/` for promotional and early work (URLs unchanged); current work is ordered flagships first.
- Real 1600×1000 covers for the new projects and for devtrim, hay and STOA (live pages or committed app screens).
- `BASE_URL=<url> bun run smoke` runs the browser gate against a deployed site; used as the post-deploy smoke.

### Changed

- Terroir Atelier (the wine school) links production instead of staging; DNSChat and devtrim statuses no longer pin
  a version; AIPedometer is marked as awaiting its App Store release.
- Featured set: ArremataRadar, DNSChat, hay, devtrim, llmdeepdive and Terroir Atelier.
- Copy: hero intro, decoder words, selected-work note, contact body, About paragraph and pt-BR calques rewritten;
  "constraint" no longer repeats across the home page; generic "Engineering note" and "Next route" removed from
  project pages; alt texts no longer mention a "supplied portfolio asset".
- Design: project images in full colour at 16:10 (were grayscale, cropped to 16:9), flat terminal panels with one
  status square, container queries on project rows. Removed the hero cursor spotlight and the nav hover scramble.
- Stat rail numbers are server-rendered and hidden from assistive tech while they count up; the label carries the value.
- Route test takes project routes from the sitemap (STOA's pages were never checked before); a new browser check
  proves the in-motion filter and the archive group (fails against the previous filter code).

### Removed

- The public "Slot 08" recommendation TODO; the seven sourced quotes remain.

### Fixed

- WCAG 2.5.3 (label in name): header controls and the brand link now expose their visible text; this predates 1.8.0.
- WCAG 2.5.8: terminal slug links are at least 24px tall.
- CigarInfo AI was marked "Live", but neither of its App Store ids is in the public lookup and its own status page calls
  1.9.1 a release candidate; it is now "In construction · release candidate" (found by the independent GPT-6 verify).

Deployed 2026-09-24: production `70ea7855` (tag `v1.8.0` @`52fbcaf4`), staging `948acfc8` (tag `v1.8.0-beta2`);
earlier staging `07e1cfca` (`v1.8.0-beta1`). Before production: autoreview (P2, clean), a security review of both
sites (no critical or high findings) and an independent GPT-6 verify that failed once (CigarInfo stage) and then
passed all 7 criteria. Production smoke 11/11; Lighthouse mobile performance 99–100, accessibility 100, best
practices 100, SEO 100, LCP 1.4–2.0 s, CLS 0. Smoke 11/11; Lighthouse mobile
performance 97–100, accessibility 100, best practices 100, SEO 100, LCP 1.6 s, CLS 0.

## [1.7.0] - 2026-09-23

### Added

- Cloudflare Web Analytics works: the zone injects its beacon at the edge, and the CSP blocked it on every page.
  `script-src` now allows `https://static.cloudflareinsights.com/beacon.min.js/`, a trailing-slash path source that
  matches the versioned beacon URL and nothing else on that host; reports go to same-origin `/cdn-cgi/rum`, so `connect-src` stays `'self'`. Cloudflare's analytics keeps
  no cookies or localStorage and does not fingerprint visitors. The route test fails on any other script source, and the browser gate proves another file on the same host stays blocked.
- Browser gate in `bun run test` (`scripts/test-browser.mjs`, `playwright-core` 1.63.0 driving the system Google
  Chrome, no browser download): serves `dist/` with `_headers` applied and checks CSP violations on 12 pages and
  both 404s (with a planted-violation control), the beacon allowlist, the localized 404, ⌘K palette keys, the pause
  control and scrollable marquee, reduced motion, the work filter, terminal timers and 360px overflow. Against the
  pre-1.6.1 build it fails exactly the five checks for bugs fixed since. CI runs it on every push.

Deployed 2026-09-23: staging `b9851ddf` (`v1.7.0-beta1`), production `96a586e2` (`v1.7.0`). Live: the edge-injected
beacon loads (200) and reports to same-origin `/cdn-cgi/rum` (204) on apex and www with zero CSP violations; the
browser gate passes 10/10 against staging and production; CI ran it on the runner's Chrome 152.

## [1.6.1] - 2026-09-23

Pre-release review of 1.6.0, which was never deployed on its own: 1.6.1 is the first deploy of both.
Deployed 2026-09-23: staging `ddbbb36a` (`v1.6.1-beta1`), production `79dfd2d2` (`v1.6.1`); evidence in `DEPLOYMENT.md`.

### Fixed

- Pausing motion from the header left the home marquee clipped (`overflow: hidden`): its scrollable fallback
  applied only to reduced-motion users. It now applies whenever the marquee is not animating, no-JS included.
- Closing the hidden terminal during `matrix` kept writing lines into it, and closing right after `cd` still
  navigated. Every pending timer is cancelled on close.
- Enter in an empty ⌘K palette ran the first item, which is "Open terminal". Enter now runs the first match
  only for a typed query.
- A page loaded while motion was paused briefly showed the pause glyph (❚❚) before switching to play (▶); the
  glyph now follows `data-motion`, which is set before first paint.
- Work filter hides rows with the `hidden` attribute, as `AGENTS.md` requires, instead of a `data-hidden` rule.
- Skills now ships ten skills (adds a handoff prompt for a second agent's independent review), and three
  adapted skills keep MIT, not two (checked against `mneves75/skills`). Profile README row updated.

### Security

- devalue 5.9.0 → 5.9.4 (GHSA-9rgm-9g3h-6x36, DoS on malformed input; build-time only): a one-entry
  lockfile change, `bun audit` clean at every level. Built HTML is byte-identical apart from the fixes above.
- `Cross-Origin-Resource-Policy: same-origin` (new in 1.6.0) is detached on `/og-image.png`,
  `/og-image-pt.png` and `/favicon.svg`: web-view link previews (Apple Mail, Fediverse web clients) load them
  cross-site and would show a blank image. The route test asserts the exception.

## [1.6.0] - 2026-09-15

Full-site review: security, accessibility, SEO and content truth. Shipped in 1.6.1.

### Added

- Pause control for animations in the header and the ⌘K palette (WCAG 2.2.2): stops the hero decoder,
  marquee, signal trace and cursor blink, persists across pages, and is restored before first paint. Hidden
  for reduced-motion users, who already get a still page.
- ⌘K palette now lists actions, every page and all 34 projects, with an empty state; "Open terminal" reaches
  the hidden terminal without the key sequence.
- Brazilian Portuguese 404 page (`/pt-br/404.html`, served for any missing `/pt-br/` route).
- `og:locale`, `og:image` dimensions and alt text, `twitter:image:alt`.
- `AGENTS.md` (gates, invariants, release rules) and a `CLAUDE.md` pointer to it.

### Fixed

- ⌘K palette filtering never hid anything (`display: flex` beat the `hidden` attribute), and the advertised
  ↑↓ navigation was not implemented. Arrow keys, Enter on the first match, a single Esc and backdrop click
  now work.
- Dark theme contrast: the `MN` chip, hovered buttons and text selection (white on `#ff6b35`, 2.8:1), and the
  active filter count (2.4:1) now pass AA through `--on-signal` / `--on-ink-accent`.
- Hero heading's accessible name no longer changes with the decoder animation.
- Hidden terminal is a native modal `<dialog>`: the page behind is inert and focus returns on close.
- `aria-label` on the stat rail and filter bar had no role (`role="group"` added); filter results are
  announced; decorative arrows, quotes and the footer trace are out of the accessibility tree.
- Mobile nav text grew from 9.3px to 10.6px, and the header keeps one row of controls at 320px.
- Project detail hero media was hidden by the scroll reveal, delaying LCP.
- Home terminal values wrap under their own column, not under the key.
- 404 pages no longer advertise a canonical URL, hreflang alternates or JSON-LD for a route that does not
  exist; JSON-LD is `ProfilePage` only on home and about (`WebPage` elsewhere), with X in `sameAs`.
- Content checked against primary sources: hay designed seven ranking signals and deleted four (was six and
  three); Skills ships three scripts and two adapted skills keep MIT; OU Benchmark promises a checksum
  readback, not identical checksums; pt-BR orthography (multiconta, independentemente, antes de o Wrangler,
  umidor). Profile README: ffts-grep ~10 ms, Swift Fast Markdown measured figure, OpenClaw listed as a fork,
  licenses are Apache-2.0 or MIT.
- Work index count no longer counts up (the dosage rule keeps count-ups on the home stat rail).

### Security

- `Content-Security-Policy` `style-src` no longer allows `'unsafe-inline'`: stylesheets are always external
  (`build.inlineStylesheets: 'never'`), and the route test fails on any inline style.
- astro 7.2.0 → 7.3.2 (critical AVIF build-time advisory) plus in-range fast-uri, js-yaml and svgo updates:
  `bun audit` 10 advisories → 0. CI now runs `bun audit --audit-level=high`.
- Added `Cross-Origin-Resource-Policy: same-origin`, `X-Frame-Options: DENY`, and payment/usb/browsing-topics to
  `Permissions-Policy`; fonts get immutable caching.
- `wrangler.jsonc` sets `workers_dev: false` and `preview_urls: false` for production explicitly.
- `scripts/csp-headers.mjs` no longer mistakes `data-src=` for an external script; `lint:design` pins
  `impeccable@3.6.1` instead of running whatever npm serves.

## [1.5.0] - 2026-09-15

Deployed to staging (`8e737e72`, tag `v1.5.0-beta1`) and production (`2becbaf6`, tag `v1.5.0`) on 2026-09-15.

### Added

- App Store links on [DNS Chat](https://mvneves.dev/work/dnschat/) and
  [WeatherSunscreen](https://mvneves.dev/work/weathersunscreen/): the US storefront on English
  pages, the Brazilian one on pt-BR. Both are the only portfolio apps on this site that are live in
  the public App Store lookup (`itunes.apple.com/lookup`, br and us). Optional `appStore` field on
  projects; the detail page renders it next to the source and live links.

### Fixed

- "Open source" label removed from WeatherSunscreen, Polymarket Analyzer and AI Calories Tracker:
  their repositories are public but have no license (GitHub `licenseInfo` null, no `LICENSE`).
  Status now reads "Public code · no license yet". Flip back when a license lands.
- devtrim status showed `v0.3.1` (hay's tag); the latest devtrim release is `v0.9.6`.
- cf-toolkit used the ffts-grep screenshot; it now renders the terminal plate like other entries
  without a verified capture.
- hay outcome carried the 0.1.4 figures. Updated to the README's paired 0.2.0 run: MRR 0.258 →
  0.458, answer in top ten 44.9% → 77.1%, still worse on 115 of 951 queries (12%).
- Skills described six skills; the repository README lists nine. Summary, outcome and README row
  updated.
- OU Benchmark stack omitted V and TypeScript, which the summary and README include.

## [1.4.0] - 2026-08-27

### Added

- [STOA](https://stoa.mvneves.dev/) — a 12-week Stoicism course in Brazilian Portuguese: 36
  self-contained lessons, 14 exercises with explicit misuse limits, and a reflective journal that
  never leaves the reader's device. Filed under Privacy / local-first because that is the defining
  constraint, not a feature: no account, no backend, no analytics, no cookie, and the whole course
  works offline from a versioned service worker. 34 projects; sitemap 76 → 78 URLs.
- Portuguese diagram labels for the new route steps (`lesson`, `practice`, `journal`,
  `browser-only progress`) — `ProjectDetail.astro` fails the build rather than leak an English step
  onto a pt-BR page.

### Changed

- [Skills](https://mneves75.github.io/skills/) entry and README row rewritten for its 1.11.0 state: six skills, `npx skills` install, landing page as the live link.

### Notes

- STOA is listed with a live link and **no source link**: the repository is private, and a 404 in
  the portfolio is worse than no link at all (verified anonymously — the repo and its advisory URL
  both return 404 without a session). `openSource: false`, status reads "source private". When the
  repository is made public, add `source` and flip the flag.
- No image asset: like `hay` and `devtrim`, the entry renders the terminal plate rather than
  inventing a capture that does not exist.

## [1.3.0] - 2026-08-24

### Added

- [`hay`](https://github.com/mneves75/hay) — a ranked grep for coding agents, with the paired
  evaluation numbers (MRR 0.266 → 0.404 over 951 queries) and the 25% per-query regression rate
  taken from the README, negative result included. Featured on the home page.
- [`devtrim`](https://github.com/mneves75/devtrim) — fail-closed disk hygiene for macOS developer
  machines, written from the README's safety model. 33 projects, 17 public repositories.

### Security

- `Content-Security-Policy` no longer allows `script-src 'unsafe-inline'`. A post-build step
  (`scripts/csp-headers.mjs`) hashes the three inline scripts Astro emits and writes them into
  `dist/_headers`; the route test fails if `'unsafe-inline'` ever returns to `script-src`.
  Each hash was proven live: corrupting it stops exactly the script it covers.
- Added `object-src 'none'` and `upgrade-insecure-requests`.
- The hidden terminal's only inline `style=` attribute became a `.sr-only` class, so the page has
  no inline style attributes to justify relaxing `style-src-attr` later.
- The terminal echo now escapes `&` as well as `<`.

### Verification

- `bun run check` — 0 errors, 0 warnings, 0 hints.
- `bun run test` — 77 route outputs; 33 projects in both locales; 76 sitemap URLs.
- `wrangler dev` with the built `_headers`: theme toggle, `mn` terminal, work filters and the
  hay/devtrim pages work under the hashed policy; positive control per hash.
- Staging `e0c15609-0381-49dc-9d65-3be4069904a7` (tag `v1.3.0-beta2`) then production
  `e29dd7d5-c220-43a7-ab8d-da719ea1a7e9` (tag `v1.3.0`), both from `e890e460`. Apex and www: `/`,
  `/work/hay/`, `/pt-br/work/devtrim/` 200, unknown route 404, hashed `script-src` served, 76 sitemap
  URLs, 33 work rows. CI green on the same commit.

## [1.2.2] - 2026-08-13

### Fixed

- Home hero decoder reserved `18ch` (`software AI-native`) as `inline-block` plus a scripted
  `minWidth`, so the copper phrase overflowed the copy column and sat under the terminal.
  The phrase now wraps in the column; the JS width reservation is gone.

### Verification

- `bun run check` — 0 errors, 0 warnings, 0 hints.
- `bun run test` — 73 route outputs.
- autoreview `--mode local` — clean.
- Staging `e925b458-4e17-45f1-b66f-a9b9dd1855f8` then production `4e0cfdbb-23b0-4fca-ada6-840feea0ae7c`.
  Apex and www `/pt-br/` 200; published CSS has `.hero-copy { min-width: 0 }` and `.decoder { display: block }`.

## [1.2.1] - 2026-08-13

### Fixed

- Home masthead `MARCUS NEVES` was sized with `vw` while sitting in the 1160px page
  column, so the last `S` clipped on desktop. It now sizes from the column (`cqi`).
  The scroll-driven `font-stretch` animation is gone; it widened the name past the box.

### Verification

- `bun run check` — 0 errors, 0 warnings, 0 hints.
- `bun run test` — 73 route outputs.
- Live measure at 1440px on staging and production: text 1025px in 1064px available.
- Screenshots at 1440 / 1100 / 1920 / 700 / 390.

## [1.2.0] - 2026-08-11

### Added

- Case studies for all 22 projects that previously showed a "case study pending" TODO, each written
  from a primary source: the repository README for the open-source work, the live site for the rest.
  The work index no longer renders a single TODO block.
- [`ai-calories-tracker`](https://github.com/mneves75/ai-calories-tracker) — a Bun monorepo pairing an
  Expo client with a Cloudflare Workers API. 31 projects, 15 public repositories.
- `ProjectDetail.astro` throws at build time when a diagram step has no pt-BR label, and the route
  test fails if a case-study TODO block reappears.

### Fixed

- `maturity-toolbox` was described as a "business maturity assessment tool". The live site is Carlos
  Magno's 52-week maturity method with an AI companion; the title, summary, stack, and status now
  match the source.
- The pt-BR page for `llmdeepdive` rendered the English diagram step "teach-back" because the label
  map had no entry for it. The new build-time guard is what surfaced it.
- 18 projects showed their category twice in the detail meta row, because the kicker repeated the
  category label. Each now carries a kicker that says something the category does not.

### Verification

- `bun run check` — 0 errors, 0 warnings, 0 hints.
- `bun run build` — 73 static pages.
- `bun run test` — 73 route outputs, 31 project rows per locale, 72 sitemap URLs, no TODO blocks.
- autoreview (codex `gpt-5.6-sol`, high) clean, 0.98.
- Real-UI pass at 1440px (pt-BR case study and diagram) and 390px (new project page).

## [1.1.1] - 2026-08-10

### Fixed

- The terminal plate on an image-less project page centred the `$` prompt against the whole block, so
  at 390px the prompt floated between the two wrapped lines of the command. It now aligns to the
  first line.

## [1.1.0] - 2026-08-10

### Added

- Three public repositories that the work index had never cited: [`skills`](https://github.com/mneves75/skills)
  (agent tooling), [`language-benchmarks`](https://github.com/mneves75/language-benchmarks) (OU Benchmark
  across C, Zig, Rust, Swift, V and TypeScript), and
  [`polymarket-analyzer`](https://github.com/mneves75/polymarket-analyzer) (realtime TUI over Polymarket
  public APIs). The index now lists 30 projects and 14 public repositories.
- `src/pages/sitemap.xml.ts` generates the sitemap from `src/data/site.ts`.

### Changed

- `WeatherSunscreen` now links its public repository and counts as open source; its stack reflects the
  React Native / Expo source rather than a generic mobile listing.
- `Project.image` is optional. Entries without a verified capture render a terminal plate
  (`$ <slug>` in the index, `$ gh repo view <owner>/<repo>` on the detail page) instead of borrowing an
  unrelated image.

### Security

- Added `Strict-Transport-Security: max-age=31536000; includeSubDomains`. Production was serving no
  HSTS header, so a first plain-HTTP request to the apex was downgradeable. `preload` is deliberately
  omitted. The rest of the review, including the accepted `'unsafe-inline'` CSP risk and its upgrade
  path, is documented under "Security posture" in `DEPLOYMENT.md`.

### Fixed

- The sitemap was a hand-maintained `public/sitemap.xml`, so any new project was silently absent from it.
  It is generated now, and the route smoke test asserts 70 URLs.

### Verification

- `bun run check` — 0 errors, 0 warnings, 0 hints.
- `bun run build` — 71 static pages.
- `bun run test` — 71 route outputs, 30 project rows per locale, 70 sitemap URLs.
- Real-UI pass with agent-browser: work index at 1440px, project detail at 1440px (pt-BR) and 390px (en).

## [1.0.0] - 2026-08-10

First tagged release. The repository holds two things: the GitHub profile README rendered at
[github.com/mneves75](https://github.com/mneves75) and the source of
[mvneves.dev](https://mvneves.dev). Git history was squashed to a single commit — the pre-tag log
below records the work that landed before any tag existed.

### Added

- Apache-2.0 `LICENSE`, matching the license already claimed in the profile README. Project
  screenshots, names, and linked source stay subject to their own repositories.
- `SECURITY.md` with a private GitHub Security Advisories reporting path.
- `.github/workflows/ci.yml`: `bun install --frozen-lockfile` → `check` → `build` → `test` on push,
  pull request, and manual dispatch. Read-only token, `persist-credentials: false`, 10-minute
  timeout, cancel-in-progress concurrency.
- `.github/dependabot.yml`: weekly grouped updates for GitHub Actions and the `bun` ecosystem.
- `docs/SITE.md` — the site documentation that previously occupied the root `README.md`.

### Changed

- The root `README.md` is the GitHub profile README again. The site build had replaced it, which
  blanked the profile page at github.com/mneves75.
- Last-seen cron cadence reduced from every 30 minutes to every 6 hours. The old cadence generated
  48 commits per day and accounted for nearly all 6101 commits in the squashed history.
- Both workflows pin `actions/checkout` to a full commit SHA and declare least-privilege
  `permissions`; the last-seen job gained a concurrency group and a timeout.
- `package.json` version reset to `1.0.0` for the first tagged release; `packageManager` pinned to
  the stable `bun@1.3.14` and `bun.lock` regenerated with it. The committed lockfile had been
  written by a canary Bun in a format stable Bun rejects, so `bun install --frozen-lockfile` would
  have failed on every CI run.

---

## Pre-tag development log

Entries below are preserved verbatim from before the squash. Their version numbers were never
tagged and no commits remain for them.

## [1.4.1] - 2026-08-10

### Fixed

- Translated the four "Como penso" principles to pt-BR (they duplicated the English strings in the `pt` field of `principles`).
- Staging env in `wrangler.jsonc` now overrides `routes` to `[]` — named envs inherit top-level routes, so a staging deploy was claiming the production custom domains.

## [1.4.0] - 2026-08-10

### Added

- Redesigned all six page families as "Working Instrument v3: Terminal on Paper" — herdr.dev-inspired warm paper + graphite base with theme-invariant dark terminal panels as the signature device.
- Added the hero terminal session (`mn@dev --status`) with numbers computed from `site.ts`, a cycling decoder word, and a count-up stat rail (30 years / 27 projects / 10 open source).
- Added the kinetic `MARCUS NEVES` masthead (variable-font width rides the scroll via `animation-timeline: view()`) and a discipline marquee.
- Added the `MN://` namespace: numbered nav (01–04) with scramble-on-hover, MN brand chip, terminal-styled ⌘K palette, route eyebrows, and MN://404.
- Added the hidden `MN://TERMINAL` easter egg (type `mn` or Konami): bilingual factual commands, focus trap, Esc close, `aria-modal`.
- Added cross-document view transitions, magnetic hero CTA, and cursor spotlight over the hero grid — all gated behind reduced-motion checks.
- Added a branded OG image and MN chip favicon; updated manifest colors.

### Changed

- Rebuilt the token system: semantic ink/paper naming, AA-checked `--signal-text` copper variant, terminal `--term-*` tokens, 1160px measure, small radii on terminal panels only.
- Work index became an evidence ledger with a contiguous filter lattice and per-category counts; project detail became a case-study sheet with the diagram inside a dark terminal slab.
- About/Recommendations/Contact restyled as calibration sheet, signal ledger (with a visible slot-08 TODO), and open-channel protocol rows.
- Scroll reveals are now no-JS-safe: content is only hidden after the runtime marks it pending, so JS failure never blanks the page.

### Fixed

- Portuguese accents (`ã ç é ·`) rendered in fallback fonts: the vendored "latin-ext" subsets lack those glyphs. Vendored the proper latin subsets with correct `unicode-range` pairs.
- Three token pairs below WCAG AA (terminal muted 4.07:1, white-on-copper 4.11:1) raised to 4.77–5.09:1.
- Nav hover and current-page underlines were identical, so two items could look active at once; current page is now a 2px copper rule with bold label, hover a 1px neutral rule gated to `hover: hover` pointers (no sticky tap state on touch).
- pt-BR copy review: "Confiado para liderar" → "Confiam em mim para liderar", "imposto de idioma" → "pedágio de idioma", "banking" → "bancos", "que vale trabalhar" → "que vale a pena trabalhar", "email" → "e-mail", work-index intro rephrased, diagram keeps the course's own "teach-back" term.
- `theme-color` meta now follows the manual theme toggle (header and hidden terminal), not only the OS preference.
- pt-BR pages now reference a dedicated pt-BR OG image (`/og-image-pt.png`).
- Attached the `mvneves.dev` custom domain to the production Worker via `routes` in `wrangler.jsonc` — the apex previously had no DNS record and did not resolve.

### Verification

- `bun run check` 0 errors; `bun run build` 65 pages; `bun run test` 65 routes, 27 rows and 7 recommendations per locale, pt-BR leak checks green.
- Real-browser pass (agent-browser): all six page families × light/dark × 1280px/390px, EN + pt-BR; zero horizontal overflow at 390px on all sampled routes.
- Interactions verified live: category filter (3 visible rows on Developer tools, `aria-pressed`), decoder cycling, terminal easter egg boot/`help`/`theme`/Esc in pt-BR, palette open.
- Reduced-motion verified live: no `data-motion`, every section fully visible, marquee static.
- Contrast ratios computed for 16 token pairs; all shipped pairs ≥ 4.5:1 (small text) in both themes.

### Known limitations

- Portfolio-only case studies remain explicit content TODOs; recommendation slot 08 remains a visible TODO.
- Remote/staging smoke not run this round (no deploy was requested).

## [1.3.0] - 2026-08-09

### Added

- Added a purposeful motion layer: sequenced homepage entrance, one-time scroll reveals across page families, and a progressive native `animation-timeline: view()` enhancement for short hero blocks.
- Added a shared `IntersectionObserver` fallback with `prefers-reduced-motion` protection and no scroll event listener.

### Changed

- Changed the signal trace to a visible 6-second dashed flow using a 6/10 dash rhythm.
- Added tactile active feedback to primary buttons and work-index filters.
- Kept long sections on one-time observer reveals so large content blocks do not remain partially transparent while entering the viewport.

## [1.2.0] - 2026-08-09

### Added

- Added all 26 projects listed on the official `conhecendotudo.IA` portfolio page, preserving the existing `cf-toolkit` entry for a total of 27 projects.
- Added 19 verified public portfolio preview assets, bilingual summaries, source/live links, source categories, and generated English/Portuguese project routes.
- Re-imagined the page-family presentation from the six Codex/OpenAI design references: paper-first editorial surfaces, ink technical mastheads, copper signal panels, ruled ledgers, and dark case-study hero bands.
- Made the work index expose eight useful category filters, including web apps, mobile apps, and promotional work.
- Added explicit content TODOs to portfolio-only detail pages instead of inventing case-study claims.
- Vendored the reference site's `Archivo` and `Space Mono` font files locally.

### Changed

- Updated the sitemap and route smoke tests for 65 static routes.
- Made the default presentation paper-first while preserving the dark theme toggle.
- Kept English and Brazilian Portuguese project copy aligned for the expanded portfolio.

### Verification

- `bun run check` succeeded with 0 errors, warnings, or hints.
- `bun run build` succeeded with 65 static pages.
- `bun run test` succeeded with 65 route outputs and 27 project rows per locale.
- `bun run lint:design` succeeded with Impeccable output `[]`.
- Desktop and 390px mobile browser smoke checks completed against the local build.

### Known limitations

- Portfolio-only projects have verified listing summaries and links, but their longer case-study fields remain explicit content TODOs.
- LinkedIn/live source extraction remains unavailable in the build environment.
- Cloudflare staging deployment succeeded for Worker version `a0530a7c-2115-4002-95ee-c5740fd80fe1`; read-only remote HTTP smoke was blocked by the terminal approval guard and remains unverified.

## [1.1.0] - 2026-08-09

- Initial re-imagined Astro site, bilingual route system, authored signal design, seven verified recommendation texts, Cloudflare configuration, and release documentation.

## 0.1.0 — 2026-01-08

- Created GitHub profile README for @mneves75.
