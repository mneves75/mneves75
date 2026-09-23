import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
// Project routes come from the sitemap, so a new project can never be left out of these checks (STOA once was).
// The count below stays hand-written on purpose: changing the inventory is a deliberate edit.
const PROJECTS = 48;
const sitemapXml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const projectRoutes = [...sitemapXml.matchAll(/<loc>https:\/\/mvneves\.dev(\/(?:pt-br\/)?work\/[^<]+\/)<\/loc>/g)].map((match) => match[1]);
assert.equal(projectRoutes.length, 2 * PROJECTS, 'sitemap project routes do not match the inventory count');
const routes = [
  '/', '/work/', '/about/', '/recommendations/', '/contact/', '/404.html',
  '/pt-br/', '/pt-br/work/', '/pt-br/about/', '/pt-br/recommendations/', '/pt-br/contact/', '/pt-br/404.html',
  ...projectRoutes,
];
/** @param {string} route */
const outputFile = (route) => (route.endsWith('.html') ? join(root, route) : join(root, route, 'index.html'));
for (const route of routes) {
  const file = outputFile(route);
  assert.ok(existsSync(file), `missing output for ${route}`);
  const html = readFileSync(file, 'utf8');
  assert.match(html, /<html lang="(?:en|pt-BR)">/, `missing language on ${route}`);
  assert.match(html, /<title>[^<]+<\/title>/, `missing title on ${route}`);
  assert.doesNotMatch(html, /pt-br\/pt-br/, `duplicated locale prefix on ${route}`);
  assert.match(html, /<meta property="og:locale" content="(?:en_US|pt_BR)">/, `missing og:locale on ${route}`);
  if (route.endsWith('404.html')) {
    // Not-found pages are noindex and must not advertise a canonical or alternates for a URL that does not exist.
    assert.match(html, /<meta name="robots" content="noindex">/, `404 page is indexable: ${route}`);
    assert.doesNotMatch(html, /rel="canonical"|hreflang=|application\/ld\+json/, `404 page carries canonical/alternate/JSON-LD: ${route}`);
    continue;
  }
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
const sitemap = sitemapXml;
const headers = readFileSync(join(root, '_headers'), 'utf8');
// Security headers are invisible until production serves them; assert them here, not in review.
for (const header of ['Strict-Transport-Security: max-age=31536000; includeSubDomains', 'X-Content-Type-Options: nosniff', "frame-ancestors 'none'", "base-uri 'self'", 'Cross-Origin-Resource-Policy: same-origin', 'X-Frame-Options: DENY']) {
  assert.ok(headers.includes(header), `security header missing from _headers: ${header}`);
}
// Link-preview images and the favicon must stay embeddable cross-site; only these paths detach CORP.
for (const asset of ['/og-image.png', '/og-image-pt.png', '/favicon.svg']) {
  assert.ok(headers.includes(`${asset}\n! Cross-Origin-Resource-Policy`), `${asset} does not detach Cross-Origin-Resource-Policy`);
}
assert.match(home, /Three decades shipping/);
// The post-build step replaces 'unsafe-inline' with hashes of the emitted inline scripts; a served policy must never regress to it.
assert.doesNotMatch(headers, /script-src [^;]*'unsafe-inline'/, "script-src still allows 'unsafe-inline'");
assert.match(headers, /script-src 'self' 'sha256-[A-Za-z0-9+/=]+'/, 'script-src has no inline script hash');
// The only third-party script is the Cloudflare Web Analytics beacon the zone injects (it reports to same-origin
// /cdn-cgi/rum, so connect-src stays 'self'). Any other external host is a policy change, not a drive-by edit.
// Every source that is not a quoted keyword or hash (hosts, schemes, wildcards) must be exactly that beacon path;
// its trailing slash prefix-matches the versioned beacon URL (…/beacon.min.js/v31…) and nothing else on the host.
const scriptSources = (headers.match(/script-src ([^;]*)/)?.[1] ?? '').split(/\s+/).filter((source) => source && !source.startsWith("'"));
assert.deepEqual(scriptSources, ['https://static.cloudflareinsights.com/beacon.min.js/'], `unexpected script-src sources: ${scriptSources.join(' ')}`);
assert.match(headers, /connect-src 'self';/, 'connect-src must stay same-origin');
// style-src carries no 'unsafe-inline', so no built page may contain an inline <style> block or style attribute.
assert.doesNotMatch(headers, /style-src [^;]*'unsafe-inline'/, "style-src still allows 'unsafe-inline'");
for (const route of routes) {
  assert.doesNotMatch(readFileSync(outputFile(route), 'utf8'), /<style\b|\sstyle="/, `inline style on ${route} would be blocked by style-src`);
}
assert.match(readFileSync(join(root, 'pt-br', '404.html'), 'utf8'), /Caminho errado\./, 'pt-BR 404 page is not localized');
assert.ok(!existsSync(join(root, 'pt-br', '404')), 'pt-BR 404 left behind as a routable /pt-br/404/ directory');
// Accessibility contracts that axe cannot see in static output.
assert.match(home, /<span class="decoder"[^>]*aria-hidden="true"/, 'hero decoder must stay out of the heading accessible name');
assert.match(home, /data-motion-toggle[^>]*aria-pressed=/, 'motion pause control missing (WCAG 2.2.2)');
assert.match(home, /<svg class="signal-trace"[^>]*aria-hidden="true"/, 'decorative signal trace exposed to assistive tech');
assert.equal((home.match(/data-palette-item/g) ?? []).length, 7 + 5 + PROJECTS, 'palette must list actions, pages and every project');
assert.match(ptHome, /Abrir GitHub/, 'pt-BR palette label not localized');
assert.match(home, /"@type":"ProfilePage"/, 'home JSON-LD should be ProfilePage');
assert.match(work, /"@type":"WebPage"/, 'work index JSON-LD should be WebPage');
const hay = readFileSync(join(root, 'pt-br', 'work', 'hay', 'index.html'), 'utf8');
assert.match(hay, /avaliação pareada/, 'hay pt-BR diagram label missing');
assert.match(home, /data-theme-toggle/);
assert.match(home, /command-palette/);
assert.equal((recommendations.match(/class="recommendation"/g) ?? []).length, 7, 'recommendation count changed; verify source quotes before editing');
assert.equal((work.match(/data-project-row data-category/g) ?? []).length, PROJECTS, 'portfolio project count changed; verify source inventory before editing');
assert.equal((ptWork.match(/data-project-row data-category/g) ?? []).length, PROJECTS, 'Portuguese portfolio project count changed; verify source inventory before editing');
assert.match(work, /Bolão 2026/);
assert.match(bolao, /Free web app for 2026 World Cup predictions/);
assert.doesNotMatch(bolao, /class="detail-pending"/, 'a case-study TODO block reappeared on a project page');
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 2 * (5 + PROJECTS), 'sitemap URL count changed; verify all locale routes');
assert.match(sitemap, /https:\/\/mvneves\.dev\/work\/bolao-2026\//);
assert.match(sitemap, /https:\/\/mvneves\.dev\/pt-br\/work\/cruzadas-fluminense\//);
assert.match(ptRecommendations, /lang="pt-BR"/);
assert.match(ptRecommendations, /Para quem já viu Pulp Fiction/);
assert.doesNotMatch(ptRecommendations, /For everyone who’s seen Pulp Fiction/);
assert.doesNotMatch(ptHome, />(?:AI systems|Developer tools|Data \/ analytics|Creative engineering|LLM reply|incremental index|read-only status)</, 'English project labels leaked into pt-BR output');
// Honest status: anything not live carries a visible text badge, and the public count excludes it.
assert.match(work, /data-stage="building"[\s\S]*?class="stage-badge"[^>]*>In construction</, 'stage badge missing on an unreleased project');
assert.match(ptWork, /class="stage-badge"[^>]*>Em revisão na App Store</, 'pt-BR stage badge missing');
assert.match(work, /data-filter="in-motion"/, 'in-motion filter missing');
assert.match(work, /data-archive-group/, 'archive group missing');
assert.doesNotMatch(recommendations, /Slot 08/, 'recommendation TODO slot is public again');
assert.match(home, /data-countup="(\d+)"[^>]*>\1<[\s\S]*?public projects/, 'stat rail lost its server-rendered final value');
console.log(`route smoke: ${routes.length} outputs verified; pt-BR metadata/content assertions passed`);
