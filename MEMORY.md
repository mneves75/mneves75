# MEMORY — mvneves.dev

Curated long-term state. Daily journals live in `memory/YYYY-MM-DD.md`. Read both at session start.

## Current state (2026-09-23)

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
- **Named Wrangler envs inherit top-level `routes`**: a staging deploy once claimed the prod custom domains. `env.staging` must keep `"routes": []` (+ `workers_dev: true`); details in `DEPLOYMENT.md`.
- Palette stays graphite/bone/copper (not CT's coral) so the personal site reads as a sibling of conhecendotudo, not a twin. Terminal panels (`--term-*`) are theme-invariant dark.
- Dosage rule (anti-pastiche): each signature device appears exactly once — decoder in hero h1, masthead+marquee once, count-ups on stat rail, magnetic on hero CTA, terminal panels as hero session + detail slab. Enforce in any future page.
- Fonts: latin + latin-ext subsets both vendored with `unicode-range`. The latin-ext file alone LACKS `ã ç é ·` — pt-BR silently falls back without the latin file.
- Scroll reveals are no-JS-safe: CSS hides only `.reveal.reveal-pending` (class added by the runtime). Never hide `.reveal` directly in CSS.
- Nav: current page = bold + 2px copper underline; hover = 1px neutral, gated `@media (hover: hover)`. They were identical once and looked like two active pages.
- Route tests are count-coupled: `class="recommendation"` ×7 (exact attribute), `data-project-row data-category` ×34, palette items 7 + 5 + 34, "Three decades shipping" on home, 78 sitemap locs. Update `scripts/test-routes.mjs` in lockstep with content changes.

## Open items

1. `www.mvneves.dev` now serves the site as a second custom domain (canonical = apex). Optional: replace with a strict 301 Redirect Rule in the dashboard; `mvneves.app → mvneves.dev` redirect still pending (separate zone).
2. Every one of the 31 projects now carries a written case study sourced from its repository README or live site (1.2.0). The only remaining visible TODO is recommendation slot 08. `ProjectDetail.astro` throws at build time if a diagram step has no pt-BR label — do not add a step without one.
3. CI runs `check`/`build`/`test` on every push and PR (`.github/workflows/ci.yml`); the last-seen cron runs every 6 h.
4. Cloudflare Web Analytics beacon is injected by the zone and blocked by CSP (the only production violation, since
   before 1.6). Decide: allow `static.cloudflareinsights.com` in `script-src` + `cloudflareinsights.com` in
   `connect-src` (privacy review per `DEPLOYMENT.md`), or turn automatic injection off in the dashboard.
5. Recommended next: move the manual browser checks into `bun run test` as a small headless gate (palette keys, pause
   → scrollable marquee, terminal timers, work filter, `securitypolicyviolation` sweep with a planted-violation
   control). Every JS bug fixed in 1.6.0/1.6.1 slipped past the static-HTML route test.
6. A Cloudflare API token for the marcusneves2005 account was pasted into an agent chat on 2026-09-23 (not used).
   Revoke/roll it in the dashboard; tokens go through 1Password, never chat.

## Tooling lessons

- `agent-browser press <char>` on a non-editable target repeats the key forever and floods the next focused input — harness bug, not a site bug. Use `eval` + synthetic KeyboardEvent for key-trigger tests.
- autoreview refuses binary diffs: park `og-image*.png` (`git show HEAD:path > path`) and the untracked `.woff2` files in the scratchpad before review, restore after.
