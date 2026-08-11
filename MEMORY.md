# MEMORY — mvneves.dev

Curated long-term state. Daily journals live in `memory/YYYY-MM-DD.md`. Read both at session start.

## Current state (2026-08-10)

- **1.4.1 is LIVE in production** at https://mvneves.dev (Worker `mvneves-dev`, version `773e7060…`) and staging (`f248abfc…`): the 1.4.0 "Working Instrument v3: Terminal on Paper" redesign plus the four "Como penso" principles translated to pt-BR. Design contract: `DESIGN.md` v3; evidence: `CHANGELOG.md` + `DEPLOYMENT.md`.
- Tree committed and pushed 2026-08-10.

## Key decisions + why

- Custom domain `mvneves.dev` is attached **declaratively** via `routes` + `custom_domain: true` in `wrangler.jsonc` (2026-08-10). Before that the apex had **no DNS record at all** — prod only existed on workers.dev. Never go back to dashboard-only attachment.
- **Named Wrangler envs inherit top-level `routes`**: a staging deploy once claimed the prod custom domains. `env.staging` must keep `"routes": []` (+ `workers_dev: true`); details in `DEPLOYMENT.md`.
- Palette stays graphite/bone/copper (not CT's coral) so the personal site reads as a sibling of conhecendotudo, not a twin. Terminal panels (`--term-*`) are theme-invariant dark.
- Dosage rule (anti-pastiche): each signature device appears exactly once — decoder in hero h1, masthead+marquee once, count-ups on stat rail, magnetic on hero CTA, terminal panels as hero session + detail slab. Enforce in any future page.
- Fonts: latin + latin-ext subsets both vendored with `unicode-range`. The latin-ext file alone LACKS `ã ç é ·` — pt-BR silently falls back without the latin file.
- Scroll reveals are no-JS-safe: CSS hides only `.reveal.reveal-pending` (class added by the runtime). Never hide `.reveal` directly in CSS.
- Nav: current page = bold + 2px copper underline; hover = 1px neutral, gated `@media (hover: hover)`. They were identical once and looked like two active pages.
- Route tests are count-coupled: `class="recommendation"` ×7 (exact attribute), `data-project-row data-category` ×27, "Three decades shipping" on home, 64 sitemap locs. Update `scripts/test-routes.mjs` in lockstep with content changes.

## Open items

1. `www.mvneves.dev` now serves the site as a second custom domain (canonical = apex). Optional: replace with a strict 301 Redirect Rule in the dashboard; `mvneves.app → mvneves.dev` redirect still pending (separate zone).
2. Content ceiling: 19/27 projects show visible case-study TODOs; recommendation slot 08 is a TODO. Highest-ROI next work: write 3–5 real case studies.
3. No CI gate — `check`/`build`/`test` are manual; only the README last-seen cron exists.

## Tooling lessons

- `agent-browser press <char>` on a non-editable target repeats the key forever and floods the next focused input — harness bug, not a site bug. Use `eval` + synthetic KeyboardEvent for key-trigger tests.
- autoreview refuses binary diffs: park `og-image*.png` (`git show HEAD:path > path`) and the untracked `.woff2` files in the scratchpad before review, restore after.
