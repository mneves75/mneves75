# mvneves.dev — agent notes

Two things share this repository: `README.md` is the GitHub profile README (public copy, not dev docs), and the
rest is the static Astro site deployed to Cloudflare Workers Static Assets. All site content lives in
`src/data/site.ts`.

## Gates

Run all three after any change; each must exit 0 (read the exit code, not the tail of the log):

```bash
bun run check && bun run build && bun run test
```

`bun run build` is `astro build` plus `scripts/csp-headers.mjs`; never deploy a `dist/` built any other way.
CI also runs `bun audit --audit-level=high`. Keep the lockfile on the pinned bun (`packageManager`), e.g.
`bunx bun@1.3.14 install`, so CI's `--frozen-lockfile` accepts it.

## Invariants

- **CSP is strict.** `script-src` holds only sha256 hashes written post-build, and `style-src` is `'self'`
  (`build.inlineStylesheets: 'never'`). A new inline `<script>` is hashed automatically; an inline `<style>`
  or `style=` attribute fails the route test. Verify CSP behaviour served (`wrangler dev --env staging`), not
  from source.
- **Route tests are count-coupled** (`scripts/test-routes.mjs`): project rows, recommendations, sitemap URLs
  and palette items. Adding a project means updating those counts, the route list, and a pt-BR label for every
  new diagram step (`ProjectDetail.astro` fails the build without one).
- **Content truth.** Every claim is checked against its primary source (repo README, release, live page,
  `itunes.apple.com/lookup`). `openSource: true` only with a detected license; no store link before the app is
  in the public lookup; missing material stays an explicit TODO, never invented copy.
- **Motion** runs only under `html[data-motion='on']`; the header pause control (WCAG 2.2.2) and
  reduced-motion users both turn it off. Scroll reveals hide only `.reveal.reveal-pending`.
- **`[hidden]` wins** via a global `!important` rule; any new filterable list relies on it.
- **Staging never claims prod domains**: `env.staging` keeps `"routes": []` (named envs inherit top-level
  `routes`). Production has `workers_dev`/`preview_urls` off.
- pt-BR copy is correct Brazilian Portuguese with accents; English and pt-BR ship together.

## Release

Versioning is SemVer in `package.json`; `CHANGELOG.md` follows Keep a Changelog and records deploy evidence,
with details in `DEPLOYMENT.md` (commands, latest staging/production Worker versions, security posture).
A last-seen bot commits to `main` every 6 h: `git pull --rebase` before pushing, and tag only after
`git log -1` shows the release commit is on `origin/main`. Tags: `vX.Y.Z-betaN` for staging, `vX.Y.Z` for
production. Deploys are explicit operator actions.

Design contract: `DESIGN.md`. Product scope: `PRODUCT.md`. Curated state and past lessons: `MEMORY.md`.
