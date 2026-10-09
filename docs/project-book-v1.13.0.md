# Project book — mvneves.dev 1.13.0

## What the review changed

The Standards review found two minor design-contract violations: copper focus outlines and rounded book chrome. The correction uses the existing functional-blue focus token and hard edges. A runtime red control proved the old focus color differed from the required token. The permanent browser gate now exercises native swipe in both directions, actual pinch zoom and the header pause handler during a turn, in both languages.

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
- Final local check/build/test: exit 0. Route smoke verified 110 outputs and the full search contract; browser gate passed all existing checks plus eight book viewport/locale cases, two native-gesture cases and no-JS controls. The first native gate failed when its unnecessary zoom-reset command used coordinates outside the newly enlarged viewport; removing that reset passed the complete suite. Full audit and CI audit: exit 0, no vulnerabilities among 321 packages. Initial independent runtime acceptance: 14/14 PASS, different-model builder gpt-6.1-sol and verifier gpt-6-astra, confirmed. Complete reacceptance after the visual correction: 14/14 PASS. CI and deployment are separate gates. Chrome runs in a fresh temporary profile outside the sandbox; the sandboxed executable aborts before opening a page.
- Runtime uses real workerd on a dedicated local port. The initial watcher exited when a rebuild briefly removed dist/ images; it was restarted after the complete build. No source or artifact rebuild takes place during independent acceptance.

## Deployment

Final independent reacceptance passed all 14 criteria: 32 viewport/spread/locale combinations, 16 destinations returning 200, native swipes/scroll/pinch, focus and pause, no-JavaScript fallback, CSP positive controls and over six minutes without autoplay. The verifier closed its isolated Chrome. Evidence: `.scratch/project-book-20261008/acceptance-personal-final/runtime-observations.json` in the studio checkout. No app rebuild or source change followed acceptance.

Three Linux CI runs passed install, audit, types and build but failed pinch through `synthesizePinchGesture`: waiting for the viewport did not fix it, and a longer gesture failed even on the plain-page control. Native `dispatchTouchEvent` with two distinct fingers and 20 gradual moves passed both the plain control and the book in both locales. The Linux CI on `ce325a6c` passed all gates: [run 37868970004](https://github.com/mneves75/mneves75/actions/runs/37868970004). Actual zoom and no-accidental-page-turn assertions remain strict; no page-scale assignment, browser flag or Linux skip was used.

Source review confirms different Aura injection paths and multitouch recognition in the touch-event path. The passing input contrast supports a path-specific diagnosis, but does not establish the complete Chromium root cause. These corrections changed only tests and docs; the accepted app artifact stayed unchanged. References: [Aura debugger dispatch](https://github.com/chromium/chromium/blob/154.0.8037.97/content/browser/renderer_host/input/synthetic_gesture_target_aura.cc#L147-L175), [touch injection](https://github.com/chromium/chromium/blob/154.0.8037.97/content/browser/devtools/protocol/input_handler.cc#L807-L820), [multitouch recognition](https://github.com/chromium/chromium/blob/154.0.8037.97/content/browser/renderer_host/input/touch_emulator_impl.cc#L119-L124).

Account verified by canonical Wrangler 4.136.2: `534f5829e05a9a48adc018820257451c`, production Worker `mvneves-dev`; staging `mvneves-dev-staging`, routes empty. ASSETS is the only binding; no app database or secret is required. Tags must point to the code commit on origin/main. Staging and production use the same frozen dist/ and worker sources. No rebuild between environments. Post-deploy browser smoke is required on both URLs. Source commit: `ce325a6ca66185ee29223c065e823d93e008de00`. Beta tag `v1.13.0-beta1` deployed Worker `632c9013-c330-452b-9605-a7a874e3788b` at 100%, only workers.dev. All 34 public staging smoke checks passed. The two work-index HTML responses and their five CSS/JS assets equal the frozen local bytes. Artifact fingerprint: `f0b7d868aa2875fcd9f4a1c294170315fa122141e471671a99013a8168ea1a01`, 313 dist/ and worker/ files. Production Worker `e17f9ab0-2a50-416a-9260-418c114f4b20` served at 100% on apex/www. The book passed public independent acceptance (3 criteria, 254 checks). Full production smoke passed 33/34 checks on each host: existing home-row hover padding produced CLS 0.009645/0.005116, over 0.001. The follow-up 1.13.1 removes that geometry change; see `docs/project-book-v1.13.1.md`. Raw HTML differs in production, while all five checked CSS/JS assets equal staging; full public HTML byte equality is not claimed.
