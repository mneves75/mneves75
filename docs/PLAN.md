# Plan — mvneves.dev

## Positioning

Builder first: three decades shipping production systems, now building AI-native software across software, data, mobile, developer tooling, privacy, performance, and Cloudflare edge work. Evidence comes from projects, public source, teaching, and recommendations.

## Information architecture

- `/` English home
- `/pt-br/` Portuguese home
- `/work/`, `/pt-br/work/` curated project index with category filters
- `/work/[slug]/`, `/pt-br/work/[slug]/` project detail pages
- `/about/`, `/pt-br/about/`
- `/recommendations/`, `/pt-br/recommendations/`
- `/contact/`, `/pt-br/contact/`
- `/404`

## Selected projects

1. DNSChat — AI over DNS, where the constraint is the feature.
2. AI Health Sync — private local HealthKit sync, no cloud.
3. ffts-grep — Rust + SQLite FTS5/BM25 for fast, relevant file search.
4. Open Profile Manager — local-first macOS profile isolation and explicit launches.
5. LLM Deep Dive — open, bilingual, evidence-led teaching with labs and teach-backs.
6. Gradiente Expert XP-800 — procedural 3D reconstruction, emulator, and browser-owned ROMs.

The all-work index also includes cf-toolkit and Mega-Sena Analyzer because they show deployment safety and data analysis.

## Visual direction

The Working Instrument: graphite, warm bone, one copper signal trace; editorial index over generic cards; real local project captures; compact mono annotations; authored SVG diagrams on detail pages.

## Technical architecture

Static Astro 7+ project, TypeScript, plain CSS and small progressive-enhancement scripts. Local typed project data is canonical. No runtime GitHub API, database, auth, React, remote font request, or required analytics. Wrangler targets Cloudflare Workers Static Assets.

## Unresolved factual gaps

- LinkedIn page was not extractable in the current environment.
- No verified public contact email was supplied for publication.
- Some project images are reused from the supplied local portfolio workspace; provenance should be confirmed before a public launch if that workspace is not the source repository.
- GitHub stars/last-update data are intentionally not hard-coded.

## Verification plan

- Fresh dependency install with pnpm.
- Astro check and production build.
- Route manifest and internal-link assertions.
- Browser smoke tests at desktop and mobile widths: navigation, language switch, theme switch, project detail, filter, command palette.
- Inspect screenshots visually and run Impeccable detector once on the finished UI.
- Run available accessibility checks; report unavailable Lighthouse/axe tooling honestly.
