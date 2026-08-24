# MEMORY — mvneves.dev

Curated long-term state. Daily journals live in `memory/YYYY-MM-DD.md`. Read both at session start.

## Current state (2026-08-24)

- **1.3.0** adds `hay` + `devtrim` (33 projects) and a hashed CSP (`scripts/csp-headers.mjs` runs after `astro build`; `script-src` has no `'unsafe-inline'`). Any new inline `<script>` changes the hash set automatically; an inline `style=` attribute would fail the route test. Local `wrangler dev` needs `wrangler@latest` (the pinned workerd rejects compatibility_date 2026-08-09).
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
- Route tests are count-coupled: `class="recommendation"` ×7 (exact attribute), `data-project-row data-category` ×33, "Three decades shipping" on home, 76 sitemap locs. Update `scripts/test-routes.mjs` in lockstep with content changes.

## Open items

1. `www.mvneves.dev` now serves the site as a second custom domain (canonical = apex). Optional: replace with a strict 301 Redirect Rule in the dashboard; `mvneves.app → mvneves.dev` redirect still pending (separate zone).
2. Every one of the 31 projects now carries a written case study sourced from its repository README or live site (1.2.0). The only remaining visible TODO is recommendation slot 08. `ProjectDetail.astro` throws at build time if a diagram step has no pt-BR label — do not add a step without one.
3. CI runs `check`/`build`/`test` on every push and PR (`.github/workflows/ci.yml`); the last-seen cron runs every 6 h.

## Tooling lessons

- `agent-browser press <char>` on a non-editable target repeats the key forever and floods the next focused input — harness bug, not a site bug. Use `eval` + synthetic KeyboardEvent for key-trigger tests.
- autoreview refuses binary diffs: park `og-image*.png` (`git show HEAD:path > path`) and the untracked `.woff2` files in the scratchpad before review, restore after.
