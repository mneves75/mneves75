# Google Search — audit and owner steps

Checked 2026-10-03 against a fresh build and the live site, with release 1.11.0. Each line of the common "Google
isn't showing my site" checklist was measured before anything changed. Most of it already held, so the release
changes only what was measured as missing and adds gates so the rest cannot regress silently.

## Checklist result

| Item | State before 1.11.0 | Action | Evidence / gate |
| --- | --- | --- | --- |
| Render server-side | Already true: Astro builds 108 complete HTML pages; no client rendering. | none | `bun run smoke`: "initial HTML is attributable in both languages" |
| Sitemap | Already served: 106 indexable URLs with significant-change `lastmod`, listed in `robots.txt`. | none | route test: sitemap = indexable canonicals; smoke reads the served file |
| Submit to Search Console | A `google-site-verification` TXT record exists on `mvneves.dev`; submission status is visible only to the owner. Google's sitemap ping endpoint is retired (`/ping?sitemap=` returns 404). | **owner** (below) | — |
| Unblock Googlebot | `robots.txt` is `User-agent: *` / `Allow: /`; no `X-Robots-Tag`; Cloudflare bot blocking is off (`docs/chatgpt-search.md`). | none | smoke compares served `robots.txt` with the repo |
| Delete noindex | `noindex` exists only on the two 404 pages, where it is correct. | none | route test: `max-image-preview:large` on indexable pages, `noindex` alone on the rest |
| Redirect chains | None. `http→https`, a missing trailing slash and `/index.html` are one hop each; `/` → `/pt-br/` is one 302 for Portuguese browsers only (crawlers send no `Accept-Language`). | none | new route check: every internal link resolves without a redirect hop |
| 404s | None internal. All 64 outbound links answered (LinkedIn's anti-bot 999 aside); unknown URLs return a real 404. | none | new route check: every internal link and asset resolves to a built file |
| Canonical tags | One self-referencing canonical per indexable page. | none | route test (existing) |
| Meta description on every page | Present everywhere, but 40 indexable pages were under 100 characters (35 project pages plus about, contact and pt-BR recommendations; 38 at the shortest), too thin to pitch the page. | **fixed** | new route check: ≥ 100 characters, and on project pages only text the page shows |
| One H1 per page | Already true on all 108 pages. | none | new route check, with a planted second `<h1>` |
| FAQ schema | Not added. Google stopped showing FAQ rich results for every site on 2026-05-07 and removed the documentation on 2026-06-15 ([Search Central changelog](https://developers.google.com/search/updates)); the site has no visible FAQ, and its markup states only what a page shows. | **declined** | — |
| Breadcrumbs | `BreadcrumbList` already on all 104 sub-pages, following the visible brand → section → page path; the `MN://WORK/<slug>` label above each project title was plain text. | **linked** | that label is now a breadcrumb `<nav>` (`MN://` → home, `WORK` → work index, the slug `aria-current`), same visible text, 24px+ targets; route test: its links equal the `BreadcrumbList` |
| Orphan pages | None: every indexable page has at least two inbound links. | none | new route check, with a planted orphan |
| Alt text on every image | Already true on all 172 `<img>`. | none | new route check |
| WebP | Every `<img>` is WebP. The JPEG/PNG files are `og:image` share copies, which LinkedIn requires. | none | new route check: WebP/AVIF/SVG only |
| Layout shifts | Load ≈ 0.000005 (sub-pixel font swap), scroll 0 (scroll anchoring absorbs the header shrink), hover on a project row ≈ 0.0004. Google's "good" limit is 0.1. | none | new browser check (budget 0.001 per phase, with a planted-shift control) |
| Load under 2 s | Simulated mobile LCP was 2.0–2.9 s live (Lighthouse 13.5). Two causes: the preloaded Archivo file carried an unused width axis (88 KB), and three work-index covers below the first screen loaded eagerly. | **fixed** | font 88 → 33 KB, both fonts 172 → 64 KB; local A/B, 3 runs each: `/` LCP 2.1–2.3 → 1.8 s, `/work/` 3.7–3.8 → 2.1–2.3 s. Gates: preload ≤ 40 KiB; images below the first screen lazy, those on it not |
| Obvious AI slop | Copy scan found one unsupported buzzword: WhatsImovel's "intelligent lead tracking", which its live page never says. "Smart" on WeatherSunscreen is the App Store's own wording and stays. `impeccable detect`: 3 layout-transition warnings and one advisory, no slop finding. | **fixed** (one summary) | primary sources: whatsimovel.com.br, `itunes.apple.com/lookup` |

## Owner steps (need your Google login)

The verification record exists, so the Domain property should already be there.

1. Open [Search Console](https://search.google.com/search-console) → property `mvneves.dev` (Domain).
2. **Sitemaps** → submit `https://mvneves.dev/sitemap.xml` if it is not listed. Expect "Success" and 106 discovered URLs.
3. **Pages** (Page indexing): note the counts of "Not indexed" and their reasons. "Discovered – currently not indexed" and
   "Crawled – currently not indexed" are quality/authority decisions; no markup changes them.
4. **URL Inspection** → `https://mvneves.dev/` → *Test live URL* → *Request indexing*. Repeat for `/work/` and `/pt-br/`.
5. Check again after about two weeks. Indexing is not guaranteed; links from places that already rank (the GitHub
   profile README, LinkedIn, project READMEs) are what moves a new personal site.

A `www` → apex 301 stays an optional dashboard change: `www` already serves one 200 with the apex canonical, which is
not a redirect chain. If you add the 301, confirm afterwards that `http://www.mvneves.dev/` reaches the apex in one hop.
