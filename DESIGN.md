# Design direction — Working Instrument v3: Terminal on Paper

<!-- impeccable:design-contract 3 -->

**THESIS:** A developer's working instrument on warm paper. The page is quiet editorial print — hairlines, mono labels, one copper signal — and the machine shows up as dark terminal panels embedded in the paper, never as a theme takeover. Six page families share the system while changing composition: home is a statement + live session, work is an evidence ledger, project detail is a case-study sheet with a terminal route slab, about is a calibration sheet, recommendations are a signal ledger, contact is an open channel.

**REFERENCES:** herdr.dev (paper/ink base, terminal panels as centerpiece, small radii on panels only) and conhecendotudo.com.br (editorial-brutalista devices: kinetic masthead, numbered indices, scramble decoder, hidden terminal). Adapted, not copied — the palette stays graphite/bone/copper so the personal site reads as a sibling of the studio, not a twin.

**STORY:** Visitors read a statement backed by a live-looking session of verifiable facts, inspect constraints behind selected work, browse 31 public projects, then choose public proof or a channel.

**FIRST VIEWPORT:** Quiet paper field with a faint 72px engineering grid, oversized statement with a cycling decoder word, a dark `mn@dev` terminal panel rendering only verifiable numbers, and a count-up stat rail on a hairline.

## Durable system rules

- Palette (naming is semantic: ink = foreground, paper = background):
  - Light: `--paper #f0eee9`, `--ink #1a1a18`, `--line #d8d6d0`, `--signal #c8481f` (fills/graphics), `--signal-text #a83a16` (AA small text).
  - Dark: `--paper #0e0e0d`, `--ink #f0ece0`, `--line #262624`, `--signal = --signal-text #ff6b35`.
  - Terminal panels are theme-invariant (`--term-bg #1a1d22` family) — dark in both themes, bordered, radius 6px. Everything else is hard-edged.
- One accent. No purple/blue gradients, glow blobs, glassmorphism (single exception: header backdrop blur), or multi-accent category colors. Focus rings use a functional blue, not the accent.
- **Type:** Archivo variable (wght 100–900, wdth 62–125 — the width axis powers the kinetic masthead) + Space Mono. Vendored in `public/fonts/` with latin + latin-ext subsets and `unicode-range` (latin carries pt-BR accents). `.label-mono` (mono .72rem uppercase tracked) is the identity-defining utility.
- **Dosage rule (anti-pastiche):** each signature device appears exactly once, in its strongest position — decoder only in the hero h1, kinetic masthead + marquee only once between hero and work, count-ups only on the stat rail, magnetic only on the primary hero CTA, terminal panels only as hero session + project-detail route slab (+ the ⌘K palette and the hidden MN://TERMINAL, which are chrome). Everywhere else the system stays quiet: hairlines, mono labels, paper.
- `MN://` is the namespace device (route labels, palette, footer, 404, easter egg). Brand chip: copper square, mono `MN`.
- Terminal panels are real HTML text — selectable, screen-reader-sane, never images or ASCII-art screenshots.
- Motion: opt-in behind `html[data-motion='on']` (set only when reduced motion is not preferred). Entries 280–700ms with `--ease-out`, hovers 180ms, lifts ≤2px. Scroll reveals via `.reveal` + IntersectionObserver; masthead stretch via native `animation-timeline: view()` only. Cross-document view transitions (`@view-transition`) guarded by `prefers-reduced-motion`. Reduced-motion users get everything visible and still (marquee becomes a scrollable strip).
- Hidden terminal (type `mn` or Konami): factual content only, focus-trapped, Esc closes, `aria-modal`.
- Responsive: 920px / 700px breakpoints; mobile keeps all four nav links, ledgers collapse to stacked rows, tap targets ≥2.6rem.
- Content truth: no invented metrics, clients, or contact details; the terminal/stat numbers are computed from `src/data/site.ts`; missing case-study material stays an explicit visible TODO.
