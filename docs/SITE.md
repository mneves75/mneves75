# mvneves.dev — site documentation

> The repository root `README.md` is the GitHub profile README rendered at
> [github.com/mneves75](https://github.com/mneves75). This file documents the site that lives in
> the same repository.

Personal site for **Marcus Neves** — software, data, and AI built for real-world constraints.

> Three decades shipping production systems. Now building AI-native software.

## What is here

- English homepage at [`/`](https://mvneves.dev/)
- Brazilian Portuguese at [`/pt-br/`](https://mvneves.dev/pt-br/)
- Source-backed work index with 27 typed project detail pages
- About, recommendations, contact, sitemap, robots, and Cloudflare headers
- Local project content in `src/data/site.ts`
- Impeccable design contract in [`DESIGN.md`](../DESIGN.md)
- Research and implementation plan in [`PLAN.md`](./PLAN.md) and [`RESEARCH.md`](./RESEARCH.md)

## Development

Requires Node 22.12+ and a package manager that can install the pinned Astro toolchain.

```bash
bun install
bun run dev
bun run check
bun run build
bun run preview
```

`bun.lock` is generated with the stable Bun pinned in `packageManager` (1.3.14) — the same version CI installs. A canary Bun writes a newer lockfile format that stable Bun cannot parse, which breaks `bun install --frozen-lockfile` in CI.

## Architecture

- Astro 7 static output.
- Plain TypeScript data and native CSS; no React, database, auth, or runtime GitHub API.
- Minimal inline JavaScript for theme, command palette, project filtering, and one-time motion reveals; native CSS handles the hero and signal animation.
- Real project WebP assets copied from the supplied public portfolio page, including all 26 listed sites.
- Cloudflare Workers Static Assets configuration in `wrangler.jsonc`.

## Design references

`design/references/` contains the visual direction boards for the six page families. The root-level boards are deterministic offline references; `design/references/codex/` contains six genuine Codex/OpenAI-generated raster references. They are design evidence only, not runtime production imagery. The implemented site translates their paper/ink/copper editorial system into CSS and uses verified local project captures.

## Deployment

Read [`DEPLOYMENT.md`](../DEPLOYMENT.md). The repository does not deploy or change DNS. The target is `mvneves.dev`; `mvneves.app` and `www.mvneves.dev` are documented as Cloudflare Redirect Rules to the canonical host.

## License

No new software license was supplied for this personal site. Project names, screenshots, and source code remain subject to their respective repositories and owners.
