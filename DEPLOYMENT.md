# Deployment — mvneves.dev

## Build locally

```bash
bun install
bun run check
bun run build
bun run preview
```

The production artifact is `dist/`. No API key, database, server runtime, or build-time GitHub token is required.

## Cloudflare Workers Static Assets

1. Authenticate Wrangler in the intended Cloudflare account: `wrangler login`.
2. Confirm the target account and project name before deploying: `wrangler whoami`.
3. Build: `bun run build`.
4. Deploy the production static asset Worker explicitly: `wrangler deploy --env="" --config wrangler.jsonc`.
5. In Cloudflare dashboard, add `mvneves.dev` under **Workers & Pages → mvneves-dev → Settings → Domains & Routes → Custom Domains**.
6. Confirm the domain serves `/`, `/work/`, `/pt-br/`, and a newly added portfolio detail route such as `/work/bolao-2026/` before changing redirects.

`wrangler.jsonc` intentionally has no account ID or secret. Do not add tokens to the repository or client bundle.

## Staging publish

The repository defines a separate Workers Static Assets environment so staging cannot target the production Worker by accident:

```bash
bun run build
wrangler whoami
wrangler deploy --env staging --config wrangler.jsonc
```

The staging Worker name is `mvneves-dev-staging`. This publishes the static artifact but does not attach a custom domain or change DNS. Verify the generated `workers.dev` URL returned by Wrangler before sharing it. Production remains a separate, explicit `wrangler deploy` action.

**Routes inheritance trap (fixed 2026-08-10):** named Wrangler environments inherit the top-level `routes` key. Before `env.staging` set `"routes": []`, a staging deploy silently claimed the `mvneves.dev`/`www` custom domains for the staging Worker. Keep the empty `routes` override in `env.staging`; if a staging deploy ever prints the custom domains under its triggers, redeploy production immediately to reclaim them.

### Latest staging evidence

- Published URL: `https://mvneves-dev-staging.mvneves.workers.dev`
- Worker version: `f248abfc-446c-4bb5-8d46-e4f4b5d93e16` (1.4.1, pt-BR principles; routes override active — workers.dev only)
- Published command observed: `2026-08-10`.
- Remote smoke verified: `/pt-br/` returned HTTP 200 with all four translated principles.

### Latest production evidence

- Published URLs: `https://mvneves.dev` (custom domain) and `https://mvneves-dev.mvneves.workers.dev`
- Worker version: `773e7060-017b-4283-89e1-d7bee603cf97` (1.4.1, 2026-08-10) — served `/pt-br/` verified byte-identical (MD5) to the local `dist/`; a stale edge-cache HIT can lag a minute after deploy.
- Both `mvneves.dev` and `www.mvneves.dev` custom domains are attached declaratively via `routes` (`custom_domain: true`) in `wrangler.jsonc` — Wrangler provisions DNS records and certificates on deploy. Neither hostname had a DNS record before 2026-08-10.
- Remote smoke verified on both hostnames: `/`, `/pt-br/`, `/work/` 200, unknown route 404 (apex), pt-BR copy and `og-image-pt.png` served over valid TLS. `www` serves the same assets; every page's canonical URL points at the apex, so search engines consolidate on `mvneves.dev`.
- Optional dashboard follow-ups (Redirect Rules): replace the `www` custom domain with a strict `www → apex` 301, and add `mvneves.app → mvneves.dev` (that zone is not managed by this Worker config).

## Permanent redirects

Use Cloudflare **Redirect Rules**, not a legacy Pages `_redirects` file and not a Worker-side redirect. Create two single-redirect rules in the account that owns the source host:

### mvneves.app → mvneves.dev

- Rule expression: `http.host eq "mvneves.app"`
- Target URL: `https://mvneves.dev${http.request.uri.path}`
- Status code: `301`
- Preserve query string: enabled

Create the same rule for `www.mvneves.app` if that hostname is enabled.

### www.mvneves.dev → mvneves.dev

- Rule expression: `http.host eq "www.mvneves.dev"`
- Target URL: `https://mvneves.dev${http.request.uri.path}`
- Status code: `301`
- Preserve query string: enabled

Put the redirect rules above any broader rewrite or cache rule. Verify with:

```bash
curl -I https://mvneves.app/
curl -I https://www.mvneves.dev/work/
```

Expected result: one `301` with the canonical `Location` header. Do not mutate DNS or Cloudflare configuration from this repository without explicit authorization.

## Headers and cache behavior

`public/_headers` is copied to the static output. It sets security headers, a same-origin CSP, and immutable caching for images/assets. HTML remains revalidatable at the edge; purge only if a deployment has stale HTML or an operational incident requires it.

## Analytics

No analytics is required for launch. If measurement becomes necessary, prefer Cloudflare Web Analytics configured at the Cloudflare dashboard. Do not add Google Analytics or a third-party script without a separate product decision and consent/privacy review.

## Launch checklist

- [ ] Verify the 26 local project image assets' provenance before public launch.
- [ ] Confirm LinkedIn and GitHub URLs.
- [ ] Confirm custom domains and redirect rules return the expected 301/200 behavior.
- [ ] Check `/robots.txt`, `/sitemap.xml`, canonical, hreflang, and OG metadata on both locales.
- [ ] Run `bun run check && bun run build` from a clean checkout.
- [ ] Confirm the generated sitemap includes all 27 project slugs in both locales.
- [ ] Inspect desktop and mobile screenshots after deployment.
