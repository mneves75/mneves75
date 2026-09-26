# mvneves.dev — agent notes

Two things share this repository: `README.md` is the GitHub profile README (public copy, not dev docs), and the
rest is the static Astro site deployed to Cloudflare Workers Static Assets. All site content lives in
`src/data/site.ts`.

## Gates

Run all three after any change; each must exit 0 (read the exit code, not the tail of the log):

```bash
bun run check && bun run build && bun run test
```

`bun run build` is `astro build` plus `scripts/csp-headers.mjs` and `scripts/sitemap-lastmod.mjs`; never deploy a
`dist/` built any other way.
`bun run test` is the static route test plus `scripts/test-browser.mjs`, a browser gate that serves `dist/` with
`_headers` applied and drives the system Google Chrome (`CHROME_PATH` overrides; no browser download). A new
interactive behaviour gets a check there, proved to fail without the fix. After every deploy run the same checks
against the live site: `BASE_URL=<url> bun run smoke`. The gate routes `/` through `worker/index.js` like
`run_worker_first`; a change to `worker/` is also run against real workerd (`wrangler dev`, see `DEPLOYMENT.md`).
CI also runs `bun audit --audit-level=high`. Keep the lockfile on the pinned bun (`packageManager`), e.g.
`bunx bun@1.3.14 install`, so CI's `--frozen-lockfile` accepts it.

## Invariants

- **CSP is strict.** `script-src` holds sha256 hashes written post-build plus one path source, the
  zone-injected Cloudflare Web Analytics beacon (`https://static.cloudflareinsights.com/beacon.min.js/`); `style-src` is `'self'`
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
- **CORP is `same-origin` except on link-preview assets**: `public/_headers` detaches it
  (`! Cross-Origin-Resource-Policy`) on the OG images, the project covers (`/images/projects/*`, whose
  `og/<slug>.jpg` share copies are each project page's `og:image`) and the favicon. `og:image` is PNG or JPEG only
  (LinkedIn documents no WebP): after adding or replacing a cover, run `bash scripts/og-covers.sh` and commit the copy and `src/data/og-covers.json`
  (the cover hashes the route test checks, so a stale copy fails). Overlapping rules comma-join values, so never set a second CORP value there.
- **Sitemap `<lastmod>` is the last significant change**, never a build date. `scripts/sitemap-lastmod.mjs`
  hashes each page's title, description, canonical, `<main>` text and internal links, and JSON-LD into the
  committed `src/data/sitemap-lastmod.json`: an unchanged hash keeps its date, a new URL or changed hash gets
  `LASTMOD_DATE` (YYYY-MM-DD) or today in America/Sao_Paulo. Commit the manifest with the content change that
  moved it; never hand-edit its dates. A rebuild without content changes leaves it byte-identical. CI builds with
  `LASTMOD_CHECK=1`, which fails on a stale or missing manifest instead of rewriting it.
- **Search markup states only what the page shows.** JSON-LD is built as objects and every `<` escaped;
  project pages get a BreadcrumbList and a `mainEntity` from `src/data/seo.ts` (no offers, prices or ratings, and
  no `applicationCategory`, which Google reads only as one of its app types and the data does not record);
  the Person gets no `jobTitle` or `image` until a page shows one ("visible" excludes the closed command palette and
  other hidden subtrees). Titles are unique and at most 60 characters.
  The route test's search contract asserts all of this plus sitemap = indexable canonicals.
- **Root language** (`worker/index.js`, run only for `/`): `/` stays the English x-default. An arrival whose
  browser's top language is Portuguese (any `pt-*`; q-values per RFC 9110), or whose `mn-lang` cookie says `pt`,
  gets a 302 to `/pt-br/` (`no-store`); `mn-lang=en` and every other language keep English. Internal navigation
  (`Sec-Fetch-Site: same-origin`, else a same-origin Referer) never redirects, so the language control, which sets
  `mn-lang` when followed (`data-lang-switch`), always works; the Worker re-issues the cookie over HTTP. Both
  responses `Vary: Accept-Language, Cookie`. The main module exports only its handler; the logic lives in
  `worker/language.js`.
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
