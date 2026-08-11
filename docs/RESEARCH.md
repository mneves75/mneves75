# Research record

## Sources inspected

- `README.md` in this repository: public GitHub profile positioning, principles, current project list, teaching link, and public destinations.
- `/Users/mneves/dev/MEUS_SITES/conhecendotudo/src/data/portfolio.json`: current project summaries, live URLs, source URLs, categories, tags, and local image assets.
- Raw public GitHub READMEs retrieved over HTTPS for `dnschat`, `open-profile-manager`, `ffts-grep`, `llmdeepdive`, `msx-expert-xp800`, and `cf-toolkit`.
- `/Users/mneves/dev/MEUS_SITES/conhecendoai/README.md`: teaching project positioning and confirmed public scope.

## Access limitations

The configured web extraction service was unavailable because no Firecrawl key/URL is configured. The unauthenticated GitHub API returned HTTP 403 rate-limit exceeded. LinkedIn and live portfolio pages were therefore not treated as sources of hidden facts. No copy below depends on inaccessible content.

## Factual notes used

- Marcus's public profile says: “30 years building systems where failure isn't an option. Now building with AI.” and identifies banking, insurance, telecom, and government experience.
- DNSChat: React Native Expo app that sends short prompts as DNS TXT queries; native iOS/Android resolver plus JavaScript UDP/TCP fallbacks; encrypted local history; no accounts/tracking/API keys according to its README.
- Open Profile Manager: unofficial local-first macOS launcher using named `CODEX_HOME` profiles, read-only account/quota status, manual selection, and no telemetry or hosted service.
- ffts-grep: Rust full-text file indexer using SQLite FTS5 and BM25; README states ~10ms queries on 10K-file codebases and incremental/deletion-aware indexing.
- LLM Deep Dive: free bilingual course; cited empirical claims, real labs, teach-backs, quizzes, and an anatomy explorer.
- MSX Expert XP-800: procedural Three.js reconstruction of the 1985 Brazilian computer with a working MSX emulator, user-owned ROMs kept in browser memory, and a measured rendering budget.
- cf-toolkit: multi-account Cloudflare Wrangler workflow with a pinned account target and a separate credential lock; token stays in macOS Keychain.
- AI Health Sync, AI Pedometer, Swift Fast Markdown, and Mega-Sena Analyzer are confirmed in the local portfolio data and profile README; this site keeps their descriptions short unless a primary README was available.
- Seven exact recommendation texts were recoverable from the brief; one additional recommendation slot remains a content TODO until its source text is provided.

## Portfolio inventory

The official public page `https://www.conhecendotudo.com.br/en/portfolio/` was inspected directly on 2026-08-09. It listed 26 entries: Open Profile Manager, llmdeepdive, Bolão 2026, O Diário Neutro, OpenClaw Club Brasil, Conhecendo IA, Mega-Sena Analyzer, Terroir Atelier, WhatsImovel, IA Travel, Event Management System, Event Services Platform, Maturity Toolbox, Babimakeup, DNSChat, WeatherSunscreen, CigarInfo AI, AI Pedometer, AI Health Sync, swift-fast-markdown, Gradiente Expert XP-800, ffts-grep, Cruzadas Rubro-Negras, Cruzadas Tricolores, Cruzadas Alvinegras, and Cruzadas Fluminense.

For the 19 newly imported entries, the implementation copied the public preview WebP, title, category, public summary, technology labels, and live/source link from that page. The seven pre-existing overlapping records retain their richer source-backed local case studies and intentional classifications. The site retains the existing `cf-toolkit` entry because it was already source-backed in the local project data. The new portfolio-only entries use an explicit longer-case-study TODO rather than invented problem, constraint, approach, or outcome claims.

## Asset provenance

The six original selected project WebP files came from the supplied local portfolio workspace under `conhecendotudo/public/images/portfolio/`; 19 additional preview WebPs were retrieved from the official public portfolio page. They are used as practical local source assets and should be reconfirmed before launch if ownership/licensing context changes.
