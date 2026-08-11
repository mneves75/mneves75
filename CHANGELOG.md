# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
