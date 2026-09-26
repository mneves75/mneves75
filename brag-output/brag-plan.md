# /brag — mvneves.dev

**What it is.** Marcus Neves's personal site: three decades of shipping, 48 projects, bilingual (EN / pt-BR).
**Who it's for.** People sizing up Marcus as an engineer, lead, or collaborator.
**What sets it apart.** It shows evidence instead of adjectives. The `mn --status` numbers are computed from the data,
unshipped work carries a stage badge, and case studies publish their misses (hay: "still worse on 12%, the README says so").
**Funniest true thing.** Type `mn` anywhere and a hidden terminal says "you found the hidden terminal. welcome."
Type `theme` and the site goes graphite.
**Visual hook.** The oversized statement with the copper decoder word scrambling through what he's building now.
**Tone.** `polished` with a deadpan wink. It follows the site's own register: paper, hairlines, one copper signal, mono labels.
**Share caption.** A personal site that shows its receipts, including the misses.

## Angle

"Evidence over adjectives." Every claim on screen is real site copy or a number the site computes.
The wink comes from the site's own honesty and its hidden terminal.

## Identity

Paper `#f0eee9`, ink `#1a1a18`, copper `#c8481f` / `#a83a16`, terminal `#15181d`. Archivo (variable width, which drives
the masthead) and Space Mono. A 72px engineering grid. The dark finale uses paper `#0e0e0d`, ink `#f0ece0`, and signal `#ff6b35`.

## Storyboard (1920×1080, 30 fps, 22.0 s, 120 BPM; bar lines at 3.5 / 7.5 / 11.5 / 15.5 / 19.5)

| # | Time | Scene | On screen | Sound |
|---|---|---|---|---|
| 1 | 0.0–3.5 | Hook | Paper + grid. Mono route label types on. "Three decades shipping production systems." rises in word by word. "Now building" plus a copper decoder that resolves "native iOS apps", then "tools for coding agents". | Pad + hats; soft ticks on the scramble |
| 2 | 3.5–7.5 | Reveal | Hook steps back and the real home page lands in a browser frame (`mvneves.dev`). Terminal lines print one by one (`$ mn --status`, 30 years, 36 public, 12 in motion, 14 repos). The page scrolls to the stat rail as it counts up to 30 / 36 / 14 / 12. | Drop: kick + bass; blips per line |
| 3 | 7.5–11.5 | Work | Real `/work/` page: "48 routes through the work". A cursor clicks **In motion 12** and the list filters to Beta, App Store review, and In construction badges. Caption: "Unshipped work wears a badge." | Click; soft whoosh on scroll |
| 4 | 11.5–15.5 | Receipts | Real hay case study: `$ trace "hay"`, whose route steps light up in sequence. The camera moves to The outcome, marking "44.9% → 77.1%" and "Still worse on 115 of those queries (12%) — the README says so." Caption: "Even the misses are on the page." | Blips per step; marker swipe |
| 5 | 15.5–19.5 | Easter egg | Home again. Keycaps `m` `n`, then the real MN://TERMINAL opens and boots ("you found the hidden terminal. welcome."). `theme` is typed and the whole site flips to graphite. | Key clicks; low chime on flip |
| 6 | 19.5–22.0 | Outro | Dark paper. MARCUS **NEVES** masthead stretches along the width axis. "Ship beats perfect." and the `MN` chip with `mvneves.dev · EN / PT-BR`. | Final chord rings out |

## Build

A single HTML composition reuses the built site: same-origin iframes of `dist/` pages are driven per frame
(scroll, filter, terminal lines, theme). Frames are captured with headless Chrome (playwright-core), and the audio is synthesized
in Node (WAV), then muxed with ffmpeg.
