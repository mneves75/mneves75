# ChatGPT Search — verification and measurement

Checked 2026-10-02. Audience: people evaluating Marcus Neves as an engineer,
collaborator, technical lead or open-source builder, in English and pt-BR.
The canonical origin is <https://mvneves.dev>. This is a portfolio, not a news
publisher: a feed or additional thin search pages would not serve its purpose.

## Publication

Version **1.10.1**, release commit `417fd21cd6b158db6e3248a3bb13f288179822da`,
published 2026-10-02 to staging (`v1.10.1-beta1`, Worker
`84fe8e95-50f5-4d46-99da-59d78adea75d`) and production (`v1.10.1`, Worker
`3f8d7819-5549-4d8a-b09d-79cd7bc25648`). All 20 smoke checks exited 0 separately
on staging, <https://mvneves.dev> and <https://www.mvneves.dev>. Cloudflare readback
confirmed the tag/commit annotations and each active version at 100%; the artifact
fingerprint was unchanged between environments. [Release CI passed](https://github.com/mneves75/mneves75/actions/runs/36965570304).
Deployment/rollback details are in [DEPLOYMENT.md](../DEPLOYMENT.md); ignored
`.tmp/chatgpt-search/promotion-proof.json` and `*-postdeploy-smoke.log` contain the
repeatable local evidence. Remaining steps concern measurement access, not deployment.

## Findings

| Surface | Result | Evidence / limit |
| --- | --- | --- |
| Public discovery | PASS | `/`, `/pt-br/`, `/work/`, `/about/`, `/recommendations/`, and `/work/skills/` serve meaningful initial HTML, clean canonicals, descriptions and truthful JSON-LD. |
| Excluded control | PASS | An unknown route returns 404 with `noindex`, no canonical and no JSON-LD; the sitemap excludes it. |
| Crawler policy | PASS | Served `robots.txt` matches `public/robots.txt`: `User-agent: *`, `Allow: /`, canonical sitemap. No crawler-specific or managed additions were present. |
| Cloudflare bot settings | PASS, configuration only | Bot Fight Mode, JS detection, crawler/content blocking and the Search, Training and User AI blocking policies are disabled; managed robots is off. No custom WAF ruleset appeared in the zone list. Managed WAF and DDoS protection remain present. |
| Genuine OpenAI crawler access | BLOCKED | No verified event from the published OpenAI IP ranges was obtained. Analytics catalogue inspection returned HTTP 403 `Authorization error`. A request from our IP, even with an OpenAI user-agent, would not prove access. |
| ChatGPT UI citations | BLOCKED / NOT MEASURED | Browser inspection returned `browser_consent_required`; the native ChatGPT window was hidden and no usable Search/composer control was obtained. No Search answer was submitted or counted. |
| Analytics configuration | PASS, configuration only | Cloudflare Web Analytics is enabled with automatic installation and `lite: true` (the EU/EEA exclusion). Browser-shaped HTML requests contain the beacon. This does not prove recorded visits. |
| ChatGPT referral counts | BLOCKED / NOT MEASURED | No authorized aggregate traffic result was available. No zero-traffic claim can be made. |
| UTM attribution | NOT MEASURED; capability gap | Cloudflare explicitly does not support UTM parameters or custom events in Web Analytics and does not log query strings for privacy. This repository has no campaign collector. There is no UTM-only ChatGPT attribution here. |

All bot-policy `disabled` values describe disabled **blocking policies**, not a
disabled search service. Existing wildcard permission also allows GPTBot; this
audit preserves that training preference. Changing training policy requires a
separate owner decision. Search and training permissions are independent.

The site already provides project problems, constraints, methods, outcomes and
source links. Skills copy was checked against the public repository README and
NOTICE at commit `5380ee80a48b30e9683ce7ef20094752d6481b94`: ten skills and three MIT
adaptations are accurate. No content rewrite or additional `llms.txt` was justified.

## Repeatable technical checks

```bash
bun run check && bun run build && bun run test
BASE_URL=https://mvneves.dev bun run smoke
```

The smoke gate also checks served robots against the reviewed policy, sitemap
membership/dates against `src/data/sitemap-lastmod.json`, and initial HTML in both
languages. Exact `utm_source=chatgpt.com` and a lookalike value must leave clean
canonicals unchanged. Those requests test metadata only, not traffic attribution.
The existing language gate checks preservation of query parameters on redirects.
Missing-route controls must remain non-indexable. Local planted robots/sitemap
regressions must make the gate fail; never plant those controls on the live site.

The controls observed here: a local `Disallow: /` and an invented `lastmod` each
made smoke exit 1. Independent review found that an extra URL without `lastmod`
escaped the first parser: the regression wrapper exited 1 because smoke incorrectly
exited 0. With every URL entry inspected, the same wrapper passed and smoke
correctly exited 1. All planted entries were removed before publication.

Local mandatory gates exited 0: `check` (38 Astro files, no diagnostics), `build`
with `LASTMOD_CHECK=1` (108 outputs, 106 sitemap URLs, no date changes), `test`
(108 route outputs and 20 browser checks), and `bun audit --audit-level=high`
(no high-severity findings; one finding below that threshold). The build-time
`fast-uri` update was installed with Bun 1.3.14 and `--frozen-lockfile`. Independent
Codex review found the sitemap false negative above; its correction rerun was
`scoped-clean` through P3. Generated gate/control logs are in `.tmp/chatgpt-search/`.

Keep generated logs and raw public HTML in the ignored `.tmp/chatgpt-search/`;
keep private analytics exports and ChatGPT answers there too, without reader
identifiers or raw reader query strings. The canonical manifest is not redated for
a verification-only release. Before deployment, run the documented real workerd
smoke gate in [DEPLOYMENT.md](../DEPLOYMENT.md).

## Citation baseline

Freeze these six questions before observing answers. Run each three times in
fresh temporary ChatGPT conversations with Search enabled: 18 planned answers,
**0 completed answers in this check**, citation rate **not measured**. Keep
language, region and account/settings fixed and record them. Questions 5–6 are
branded retrieval checks and must be reported separately from discovery (1–4).

| ID | Language | Question |
| --- | --- | --- |
| 1 | pt-BR | Quais portfólios de engenharia mostram projetos de software, dados e IA com problemas, restrições e resultados explicados? |
| 2 | pt-BR | Quais ferramentas abertas ajudam a revisar e verificar código produzido por agentes de IA? |
| 3 | pt-BR | Onde posso encontrar um exemplo de projeto que usa fontes oficiais para avaliar imóveis de leilão de bancos? |
| 4 | en | Which engineering portfolios document native apps, public-data systems and tools for coding agents? |
| 5 | en | What does Marcus Neves build, and how does he approach engineering? |
| 6 | pt-BR | O que o projeto Skills em mvneves.dev/work/skills/ oferece para agentes de programação com IA? |

Save every answer and its cited URLs/screenshots, including no-citation results,
errors and incomplete runs. Suggested CSV:

```text
checked_at,query_id,run,surface,search_enabled,language,region,brand_mentioned,domain_cited,cited_urls,artifact,status
```

Count only completed ChatGPT UI answers that cite `mvneves.dev` in the numerator;
divide by completed answers, reporting errors/exclusions separately. A mention,
GitHub citation, API web-search result or ordinary search hit is not a citation of
this site. Repeat the identical set weekly for four weeks after deployment if
desired; no recurring automation has been created. Variation alone is not evidence
that this release caused a ranking change.

## Referral baseline

Use the existing Cloudflare dashboard for a fixed seven-day interval, with bots
excluded. In the report, use the explicit category **ChatGPT** only for the exact
Referer host `chatgpt.com`. Keep `chatgpt.com.evil.example`, `notchatgpt.com`, other
hosts and absent evidence out of that category. Do not count AI crawler requests
as reader referrals. A Referer can be absent or forged; these are attributed
clicks, not authenticated origins or all citations.

OpenAI documents `utm_source=chatgpt.com`. If a future approved analytics export
actually includes UTM source, map only that exact value to **ChatGPT** and keep
lookalikes unknown. Validate the mapping in a local/test dataset first, retain the
site's query handling and clean canonicals, and deduplicate overlapping Referer/UTM
counts. Do not reclassify historical unknown traffic without retained evidence.

For now, Referer-only reporting cannot measure a UTM-only arrival whose Referer
was suppressed. Adding another script or per-reader/server logging would change
the site's privacy/product contract and is not part of this audit. To obtain
counts, use the owner dashboard or grant the required Analytics Read access and
query only aggregate dimensions; the current API attempt returned 403.

For genuine crawler evidence, inspect existing security/AI crawl events for a
request from OpenAI's current searchbot IP ranges, recording UTC time, route and
outcome only. If a real block is found, prepare a narrowly scoped verified-search
exception; do not disable WAF or bot protection globally.

## Primary guidance checked

- [OpenAI crawlers](https://developers.openai.com/api/docs/bots): independent SearchBot, GPTBot and ChatGPT-User roles; fetched the `.md` version to retain the crawler table and current IP-list links.
- [Publisher FAQ](https://help.openai.com/en/articles/12627856): search access, crawlable `noindex`, referral UTM.
- [Cloudflare AI blocking policies](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/) and [Bot Management API](https://developers.cloudflare.com/api/resources/bot_management/): configuration semantics.
- [Cloudflare Web Analytics dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/) and [FAQ](https://developers.cloudflare.com/web-analytics/faq/): Referer and bot filtering; UTM parameters and custom events are unsupported, and query strings are not logged for privacy.
- [Skills README](https://github.com/mneves75/skills/blob/5380ee80a48b30e9683ce7ef20094752d6481b94/README.md) and [NOTICE](https://github.com/mneves75/skills/blob/5380ee80a48b30e9683ce7ef20094752d6481b94/NOTICE): project claims.

OpenAI's roughly 24-hour robots-policy propagation is not an indexing or citation
deadline. Eligibility, actual crawler access, citations and reader clicks remain
four separate measurements; none guarantees placement.
