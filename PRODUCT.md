# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People evaluating Marcus Neves as an engineer, collaborator, technical lead, or open-source builder. They may arrive from GitHub, LinkedIn, a project site, or a teaching project and need a quick, truthful understanding of what he builds and how he works.

## Product Purpose

A personal site for Marcus Neves. It makes his current hands-on work, engineering judgment, professional range, and public projects legible without turning the site into a résumé or studio brochure.

Success means a first-time visitor can understand Marcus's professional identity within seconds, inspect real work, read evidence from people who worked with him, and reach verified public destinations.

## Positioning

Software, data, and AI built for real-world constraints, backed by three decades of shipping production systems.

## Operating Context

The site is read on desktop and mobile, in English or Brazilian Portuguese, mostly through public links. It must work as static output on Cloudflare Workers Static Assets with no database or authenticated workflow.

## Capabilities and Constraints

- English at `/`; Brazilian Portuguese at `/pt-br/`.
- Primary pages: home, work index, project detail, about, recommendations, contact, and a not-found page in each locale.
- Project content is local and canonical; the work index lists 48 projects (`src/data/site.ts` is the inventory): current work first, older and promotional work in an Archive group. Each project has a release stage (live, in App Store review, beta, in construction); only live projects with a public destination count as public, and unreleased ones carry a visible text badge and never a staging or pre-lookup store link. External project links remain useful but are not required to render the site.
- No invented metrics, employers, clients, testimonials, contact details, or technical claims.
- Browser language decides only at the root (owner decision 2026-09-25, replacing the 1.0.0 rule "no browser-language
  auto-redirect"): an arrival at `/`, the English x-default, whose browser's top language is Portuguese (any `pt-*`)
  goes to `/pt-br/` with a 302; every other language stays English ("pt-br or other → us"). The language control's
  choice wins and is remembered (the `mn-lang` cookie).
  Internal navigation and every other URL never redirect; crawlers, which send no `Accept-Language`, get English.
- No tracker or contact database. The only server-side code is that root redirect (`worker/index.js`), which stores
  nothing. The only measurement is cookieless Cloudflare Web Analytics, injected at the edge (no client-side state,
  no fingerprinting).
- Accessibility target: WCAG 2.2 AA; keyboard, reduced motion, contrast, responsive layout.
- Motion uses native CSS plus one shared `IntersectionObserver` fallback; reduced-motion users receive visible static content.
- Cloudflare staging deployment is an explicit operator action; production deployment and domain redirects remain separate, explicit operations.

## Brand Commitments

- Builder first; problem solver second; leadership shown through evidence.
- Forward-looking experience without nostalgia.
- Preserve the public phrases: “Ship beats perfect.”, “Clarity over cleverness.”, “Privacy is baseline, not feature.”, and “Mobile-first is not optional.”
- Paper-first editorial presentation with ink technical bands and one copper signal color; the dark theme remains available.
- The visual system is precision editorial × engineering system.

## Evidence on Hand

- Local GitHub profile README in this repository.
- Local portfolio data from the supplied `conhecendotudo.com.br` project.
- Public GitHub README content retrieved for DNSChat, Open Profile Manager, ffts-grep, LLM Deep Dive, MSX Expert XP-800, and cf-toolkit.
- Seven exact recommendation quotes recovered from the supplied brief; one additional recommendation slot remains a content TODO until the source text is provided.
- 26 source-portfolio entries, 19 newly copied preview assets, and the existing local project captures.
- LinkedIn and live public pages were not extractable in this environment; the site does not depend on hidden content from them.

## Product Principles

- Show the constraint before the technology.
- Prefer evidence over adjectives.
- Keep the useful surface small.
- Privacy is a default engineering decision.
- Open source and teaching are part of the work, not a separate sales funnel.

## Accessibility & Inclusion

Use semantic landmarks, visible focus, keyboard-safe controls, meaningful alt text, readable line lengths, WCAG AA contrast, a skip link, language metadata, and reduced-motion fallbacks. Essential information must not depend on hover.
