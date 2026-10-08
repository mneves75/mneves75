# Project book — mvneves.dev 1.13.0

## What the review changed

The book lives on the bilingual work index, before the complete ledger; the personal home keeps its existing evidence selection. The curated eight projects derive from canonical data, link to localized case studies, and retain stage labels. Filters and structured data describe the ledger separately. Motion is positively gated on `data-motion=on`, including pause during a turn. Native zoom remains available. Acceptance includes 320 CSS pixels.

The native Astro/CSS/TypeScript adaptation was chosen over scroll-snap (simpler, but no requested page turn) and keeping only the ledger (best for simultaneous comparison, but does not deliver the requested book). Keeping useful HTML without JavaScript avoids a long-term animation dependency. No new package was added.

Sources: [W3C WAI carousel tutorial](https://www.w3.org/WAI/tutorials/carousels/), [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action).

## Scope and preserved work

Clean worktree based on origin/main `9f3f0b22`. The original `feat/perf-security-1.13` checkout and its dirty dependency/CI/performance work are preserved. This release includes verified compatible security patches needed to pass CI; it does not import the unfinished performance harness or claim completion of that audit. No hosting migration: mvneves.dev remains Cloudflare Workers Static Assets.

## Security disposition

The baseline audit exited 1 with five findings. Compatible patched releases were applied; final audit results follow in the acceptance receipt.

| Dependency | Baseline | Patched minimum | Advisory |
| --- | --- | --- | --- |
| fast-uri | 3.1.7 | 3.1.8 | [GHSA-hrr3-gc8f-f4qj](https://github.com/advisories/GHSA-hrr3-gc8f-f4qj) |
| http-cache-semantics | 4.2.0 | 4.3.0 | [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) |
| sharp | 0.35.4 | 0.35.5 | [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) |
| smol-toml | 1.7.1 | 1.9.0 | [GHSA-r4xh-jqrq-34v2](https://github.com/advisories/GHSA-r4xh-jqrq-34v2) |
| source-map-js | 1.2.1 | 1.2.2 | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) |

Astro resolves to 7.3.8 within the updated 7.3.7 compatible range. Bun 1.3.14 generated the lockfile. CI now audits without ignores. These are build-tool dependency findings; no statement about token revocation or a complete security audit is implied.

## Verification

- Red control: the public previous work index exposed 0 book leaves instead of 8, assertion exit 1. The full baseline browser suite passed its existing checks and failed the new book criteria.
- First implementation check: 0 errors, warnings or hints. Complete build: 110 pages, 108 sitemap URLs, only the two work-index lastmods changed.
- First route run caught the broad ItemList link extractor including the curated selection before ledger rows. The check now scopes to actual `data-project-row` articles, still checking all 49 rows and exact structured-data order.
- Complexity: cccc 1.8.0, focused TS and two Astro files, owning default config. Only TS analyzed (13 functions), 0 parse errors, maximum cognitive 11; Astro unsupported. Partial comprehension evidence does not establish correctness.
- Final local check/build/test: exit 0. Route smoke verified 110 outputs and the full search contract; browser gate passed all existing checks plus eight book viewport/locale cases and no-JS controls. Full audit and CI audit: exit 0, no vulnerabilities among 321 packages. Independent runtime acceptance, CI and deployment: pending. Chrome runs in a fresh temporary profile outside the sandbox; the sandboxed executable aborts before opening a page.
- Runtime uses real workerd on a dedicated local port. The initial watcher exited when a rebuild briefly removed dist/ images; it was restarted after the complete build. No source or artifact rebuild takes place during independent acceptance.

## Deployment

Account verified by canonical Wrangler 4.136.2: `534f5829e05a9a48adc018820257451c`, production Worker `mvneves-dev`; staging `mvneves-dev-staging`, routes empty. ASSETS is the only binding; no app database or secret is required. Tags must point to the code commit on origin/main. Staging and production use the same frozen dist/ and worker sources. No rebuild between environments. Post-deploy browser smoke is required on both URLs. Deployment receipts pending.
