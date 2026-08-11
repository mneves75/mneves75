import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const routes = [
  '/', '/work/', '/about/', '/recommendations/', '/contact/', '/404.html',
  '/pt-br/', '/pt-br/work/', '/pt-br/about/', '/pt-br/recommendations/', '/pt-br/contact/',
  '/work/dnschat/', '/work/ai-health-sync/', '/work/ffts-grep/', '/work/open-profile-manager/', '/work/llmdeepdive/', '/work/msx-expert-xp800/', '/work/cf-toolkit/', '/work/megasena-analyzer/', '/work/bolao-2026/', '/work/diario-neutro/', '/work/openclaw-club-brasil/', '/work/conhecendo-ia/', '/work/terroir-atelier/', '/work/whatsimovel/', '/work/ia-travel/', '/work/event-management-system/', '/work/event-services-platform/', '/work/maturity-toolbox/', '/work/babimakeup/', '/work/weathersunscreen/', '/work/cigarinfo-ai/', '/work/ai-pedometer/', '/work/swift-fast-markdown/', '/work/cruzadas-rubro-negras/', '/work/cruzadas-tricolores/', '/work/cruzadas-alvinegras/', '/work/cruzadas-fluminense/', '/work/skills/', '/work/language-benchmarks/', '/work/polymarket-analyzer/',
  '/pt-br/work/dnschat/', '/pt-br/work/ai-health-sync/', '/pt-br/work/ffts-grep/', '/pt-br/work/open-profile-manager/', '/pt-br/work/llmdeepdive/', '/pt-br/work/msx-expert-xp800/', '/pt-br/work/cf-toolkit/', '/pt-br/work/megasena-analyzer/', '/pt-br/work/bolao-2026/', '/pt-br/work/diario-neutro/', '/pt-br/work/openclaw-club-brasil/', '/pt-br/work/conhecendo-ia/', '/pt-br/work/terroir-atelier/', '/pt-br/work/whatsimovel/', '/pt-br/work/ia-travel/', '/pt-br/work/event-management-system/', '/pt-br/work/event-services-platform/', '/pt-br/work/maturity-toolbox/', '/pt-br/work/babimakeup/', '/pt-br/work/weathersunscreen/', '/pt-br/work/cigarinfo-ai/', '/pt-br/work/ai-pedometer/', '/pt-br/work/swift-fast-markdown/', '/pt-br/work/cruzadas-rubro-negras/', '/pt-br/work/cruzadas-tricolores/', '/pt-br/work/cruzadas-alvinegras/', '/pt-br/work/cruzadas-fluminense/', '/pt-br/work/skills/', '/pt-br/work/language-benchmarks/', '/pt-br/work/polymarket-analyzer/',
];
for (const route of routes) {
  const file = route === '/404.html' ? join(root, route) : join(root, route, 'index.html');
  assert.ok(existsSync(file), `missing output for ${route}`);
  const html = readFileSync(file, 'utf8');
  assert.match(html, /<html lang="(?:en|pt-BR)">/, `missing language on ${route}`);
  assert.match(html, /<title>[^<]+<\/title>/, `missing title on ${route}`);
  assert.doesNotMatch(html, /pt-br\/pt-br/, `duplicated locale prefix on ${route}`);
  assert.match(html, /hreflang="en"/, `missing English alternate on ${route}`);
  assert.match(html, /hreflang="pt-BR"/, `missing pt-BR alternate on ${route}`);
  for (const [, link] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    if (/\.[a-z0-9]+$/i.test(link)) continue; // asset files (/favicon.svg, /images/…) keep no trailing slash
    assert.ok(link.endsWith('/'), `internal link without trailing slash: ${link} on ${route}`);
  }
  if (route === '/pt-br/') assert.match(html, /<link rel="canonical" href="https:\/\/mvneves\.dev\/pt-br\/">/, 'malformed pt-BR homepage canonical');
}
const home = readFileSync(join(root, 'index.html'), 'utf8');
const ptHome = readFileSync(join(root, 'pt-br', 'index.html'), 'utf8');
const recommendations = readFileSync(join(root, 'recommendations', 'index.html'), 'utf8');
const ptRecommendations = readFileSync(join(root, 'pt-br', 'recommendations', 'index.html'), 'utf8');
const work = readFileSync(join(root, 'work', 'index.html'), 'utf8');
const ptWork = readFileSync(join(root, 'pt-br', 'work', 'index.html'), 'utf8');
const bolao = readFileSync(join(root, 'work', 'bolao-2026', 'index.html'), 'utf8');
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const headers = readFileSync(join(root, '_headers'), 'utf8');
// Security headers are invisible until production serves them; assert them here, not in review.
for (const header of ['Strict-Transport-Security: max-age=31536000; includeSubDomains', 'X-Content-Type-Options: nosniff', "frame-ancestors 'none'", "base-uri 'self'"]) {
  assert.ok(headers.includes(header), `security header missing from _headers: ${header}`);
}
assert.match(home, /Three decades shipping/);
assert.match(home, /data-theme-toggle/);
assert.match(home, /command-palette/);
assert.equal((recommendations.match(/class="recommendation"/g) ?? []).length, 7, 'recommendation count changed; verify source quotes before editing');
assert.equal((work.match(/data-project-row data-category/g) ?? []).length, 30, 'portfolio project count changed; verify source inventory before editing');
assert.equal((ptWork.match(/data-project-row data-category/g) ?? []).length, 30, 'Portuguese portfolio project count changed; verify source inventory before editing');
assert.match(work, /Bolão 2026/);
assert.match(bolao, /Free web app for 2026 World Cup predictions/);
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 70, 'sitemap URL count changed; verify all locale routes');
assert.match(sitemap, /https:\/\/mvneves\.dev\/work\/bolao-2026\//);
assert.match(sitemap, /https:\/\/mvneves\.dev\/pt-br\/work\/cruzadas-fluminense\//);
assert.match(ptRecommendations, /lang="pt-BR"/);
assert.match(ptRecommendations, /Para quem já viu Pulp Fiction/);
assert.doesNotMatch(ptRecommendations, /For everyone who’s seen Pulp Fiction/);
assert.doesNotMatch(ptHome, />(?:AI systems|Developer tools|Data \/ analytics|Creative engineering|LLM reply|incremental index|read-only status)</, 'English project labels leaked into pt-BR output');
console.log(`route smoke: ${routes.length} outputs verified; pt-BR metadata/content assertions passed`);
