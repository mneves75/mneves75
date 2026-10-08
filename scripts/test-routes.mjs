import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
/** sha256 of the cover each og/<slug>.jpg share copy was made from, written by scripts/og-covers.sh. @type {Record<string, string>} */
const ogCoverSources = existsSync(join(projectRoot, 'src/data/og-covers.json')) ? JSON.parse(readFileSync(join(projectRoot, 'src/data/og-covers.json'), 'utf8')) : {};
// Project routes come from the sitemap, so a new project can never be left out of these checks (STOA once was).
// The count below stays hand-written on purpose: changing the inventory is a deliberate edit.
const PROJECTS = 49;
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
// Link-preview images (the site cards and the project covers, each project page's og:image) and the favicon must stay
// embeddable cross-site, so these rules detach CORP. The search contract below also resolves every page's og:image
// against these rules.
for (const asset of ['/og-image.png', '/og-image-pt.png', '/favicon.svg', '/images/projects/*']) {
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

// --- Search contract: sitemap = indexable canonicals with honest lastmod, safe JSON-LD, breadcrumbs, previews. ---
// Every check runs even after one fails, so a regression lists all of them.
const SITE = 'https://mvneves.dev';
/** @type {string[]} */
const searchFailures = [];
/** @param {string} name @param {() => void | Promise<void>} fn */
const searchCheck = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok  ${name}`);
  } catch (error) {
    searchFailures.push(name);
    console.error(`  FAIL ${name}\n       ${error instanceof Error ? error.message.split('\n').join('\n       ') : String(error)}`);
  }
};
/** Every built page keyed by its URL path ('/', '/work/hay/', '/404.html'). @type {Map<string, string>} */
const builtPages = new Map();
/** @param {string} dir */
const collectPages = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) collectPages(file);
    else if (entry.name.endsWith('.html')) builtPages.set(`/${relative(root, file).split(sep).join('/')}`.replace(/(^|\/)index\.html$/, '$1'), readFileSync(file, 'utf8'));
  }
};
collectPages(root);
/** @param {string} text */
const decodeEntities = (text) => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
/** @param {string} html @returns {Record<string, string>[]} */
const metaTags = (html) => [...html.matchAll(/<meta\b([^>]*)>/g)].map(([, attrs]) => Object.fromEntries([...attrs.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])));
/** @param {string} html @param {string} key name= or property= */
const metaContent = (html, key) => metaTags(html).find((tag) => tag.name === key || tag.property === key)?.content;
/** @param {string} html */
const isNoindex = (html) => metaTags(html).some((tag) => tag.name === 'robots' && /noindex/.test(tag.content ?? ''));
/** @param {string} html */
const ldBlocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1] ?? '');
/** @typedef {Record<string, unknown>} LdNode */
/** @param {unknown} value @returns {value is LdNode} */
const isNode = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
/** @param {unknown} node @param {string} key */
const field = (node, key) => (isNode(node) ? node[key] : undefined);
/** @param {unknown} node @param {string} key */
const str = (node, key) => {
  const value = field(node, key);
  return typeof value === 'string' ? value : undefined;
};
/** A JSON-LD value that may be one item or an array, as an array. @param {unknown} node @param {string} key @returns {unknown[]} */
const listOf = (node, key) => {
  const value = field(node, key);
  return value === undefined ? [] : [value].flat();
};
/** Flattens @graph and nested objects so a node is found wherever it sits. @param {unknown} value */
const ldNodes = (value) => {
  /** @type {LdNode[]} */
  const nodes = [];
  /** @param {unknown} node */
  const visit = (node) => {
    if (Array.isArray(node)) node.forEach(visit);
    else if (isNode(node)) {
      if ('@type' in node) nodes.push(node);
      Object.values(node).forEach(visit);
    }
  };
  visit(value);
  return nodes;
};
/** @param {string} html */
const pageNodes = (html) => ldNodes(ldBlocks(html).map((block) => JSON.parse(block)));
/** @param {LdNode[]} nodes @param {string} type */
const ofType = (nodes, type) => nodes.filter((node) => listOf(node, '@type').includes(type));
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
/**
 * Markup a visitor can see: without scripts, closed dialogs (the command palette), templates, and elements that are
 * `hidden` or `aria-hidden="true"`, each with its whole subtree (same-name tags are counted, so nesting is safe).
 * @param {string} html
 */
const visibleMarkup = (html) => {
  let out = html.replace(/<script\b[\s\S]*?<\/script>/g, ' ');
  const open = /<([a-z][\w-]*)\b([^>]*)>/gi;
  for (let match = open.exec(out); match; match = open.exec(out)) {
    const [tag, name = '', attrs = ''] = match;
    // Attribute values are blanked first so class="x hidden" does not read as the hidden attribute.
    const hidden = /\saria-hidden="true"/.test(attrs) || /\shidden(?=[\s=/]|$)/.test(attrs.replace(/"[^"]*"/g, '""'));
    if (!hidden && !/^(?:dialog|template)$/i.test(name)) continue;
    let end = match.index + tag.length;
    if (!VOID_TAGS.has(name.toLowerCase()) && !tag.endsWith('/>')) {
      const tags = new RegExp(`<(/?)${name}(?=[\\s>/])[^>]*>`, 'gi');
      tags.lastIndex = match.index;
      let depth = 0;
      end = out.length;
      for (let found = tags.exec(out); found; found = tags.exec(out)) {
        if (found[0].endsWith('/>')) continue;
        depth += found[1] ? -1 : 1;
        if (depth === 0) {
          end = found.index + found[0].length;
          break;
        }
      }
      assert.ok(end < out.length || depth === 0, `visibleMarkup: <${name}> at ${match.index} is never closed`);
    }
    out = `${out.slice(0, match.index)} ${out.slice(end)}`;
    open.lastIndex = match.index;
  }
  return out;
};
/** Text a visitor can read (see visibleMarkup). @param {string} html */
const visibleText = (html) => decodeEntities(visibleMarkup(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
/** Format and pixel size from a PNG, JPEG or WebP header. @param {Buffer} bytes */
const imageSize = (bytes) => {
  if (bytes.readUInt32BE(0) === 0x89504e47) return { format: 'png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    // Walk the JPEG segments to the first start-of-frame marker (SOF0–SOF15, except DHT/JPG/DAC).
    for (let at = 2; at + 9 < bytes.length;) {
      if (bytes[at] !== 0xff) break;
      const marker = bytes[at + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { format: 'jpeg', width: bytes.readUInt16BE(at + 7), height: bytes.readUInt16BE(at + 5) };
      }
      at += 2 + bytes.readUInt16BE(at + 2);
    }
    throw new Error('JPEG without a start-of-frame marker');
  }
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = bytes.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') return { format: 'webp', width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') { const bits = bytes.readUInt32LE(21); return { format: 'webp', width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 }; }
    if (chunk === 'VP8X') return { format: 'webp', width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
  }
  throw new Error('not a PNG, JPEG or WebP file');
};
// Cloudflare _headers semantics (as in the browser gate): every matching rule applies in order and `! Name` detaches.
/** @type {{ pattern: RegExp, lines: string[] }[]} */
const headerRules = [];
for (const line of headers.split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  if (line.startsWith('/')) headerRules.push({ pattern: new RegExp(`^${line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`), lines: [] });
  else headerRules.at(-1)?.lines.push(line.trim());
}
/** @param {string} path */
const servesCorp = (path) => {
  let corp = false;
  for (const rule of headerRules.filter((candidate) => candidate.pattern.test(path))) {
    for (const line of rule.lines) {
      if (/^! Cross-Origin-Resource-Policy$/i.test(line)) corp = false;
      else if (/^Cross-Origin-Resource-Policy:/i.test(line)) corp = true;
    }
  }
  return corp;
};
const indexable = [...builtPages].filter(([, html]) => !isNoindex(html));
const isProjectRoute = (/** @type {string} */ route) => /^\/(?:pt-br\/)?work\/[^/]+\/$/.test(route);
const localeHome = (/** @type {string} */ route) => `${SITE}${route.startsWith('/pt-br/') ? '/pt-br/' : '/'}`;
const sitemapEntries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => ({
  loc: body?.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '',
  lastmod: body?.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
}));

await searchCheck('sitemap lists exactly the indexable pages, each with one self-referencing canonical', () => {
  for (const [route, html] of indexable) {
    assert.deepEqual([...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((match) => match[1]), [`${SITE}${route}`], `canonical of ${route}`);
  }
  const locs = sitemapEntries.map((entry) => entry.loc);
  assert.equal(new Set(locs).size, locs.length, 'sitemap lists a URL twice');
  assert.deepEqual([...locs].sort(), indexable.map(([route]) => `${SITE}${route}`).sort(), 'sitemap <loc> set differs from the indexable canonical pages');
});

await searchCheck('every sitemap URL carries the manifest lastmod, and the manifest hash matches the built page', async () => {
  const missing = sitemapEntries.filter((entry) => !entry.lastmod);
  assert.equal(missing.length, 0, `${missing.length} of ${sitemapEntries.length} sitemap URLs have no <lastmod> (first: ${missing[0]?.loc})`);
  const { manifestPath, significantHash } = await import('./sitemap-lastmod.mjs');
  /** @type {Record<string, { hash: string, lastmod: string }>} */
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(Object.keys(manifest), sitemapEntries.map((entry) => entry.loc).sort(), 'manifest keys are not exactly the sorted sitemap URLs');
  // A real calendar day: the pattern alone accepts 2026-02-30, which Date.parse silently rolls over to March 2.
  /** @param {string} date */
  const isCalendarDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
  for (const { loc, lastmod } of sitemapEntries) {
    assert.ok(isCalendarDate(lastmod ?? ''), `lastmod of ${loc} is not a W3C calendar date: ${lastmod}`);
    assert.equal(lastmod, manifest[loc]?.lastmod, `lastmod of ${loc} differs from the manifest`);
    assert.equal(manifest[loc]?.hash, significantHash(builtPages.get(new URL(loc).pathname) ?? ''), `manifest hash of ${loc} does not match the built page`);
  }
  // The hash must ignore build noise and see content: otherwise every deploy (or none) would move the dates.
  // Each probe asserts it changed the page, so a sample without that noise cannot pass vacuously.
  const sample = builtPages.get('/work/hay/') ?? '';
  const mainOf = (/** @type {string} */ html) => html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] ?? '';
  const assetNoise = sample.replace(/\/_astro\/([\w.-]+)\.(css|js)/g, '/_astro/$1-x9.$2?v=2');
  assert.notEqual(assetNoise, sample, 'hash noise probe: the sample page links no /_astro/ asset');
  // Inside <main>, the part the hash reads: scoped-style ids, a build comment, a hashed image, cache-busting queries.
  const mainNoise = assetNoise.replace(/<main\b[\s\S]*?<\/main>/, (main) => main
    .replace(/data-astro-cid-([\w-]+)/g, 'data-astro-cid-$1x9')
    .replace(/(<main\b[^>]*>)/, '$1<!-- built 2026-01-01T00:00Z --><img src="/_astro/cover.x9z.webp" alt="" data-astro-cid-x9z>')
    .replace(/href="(\/[^"?#]*)"/g, 'href="$1?v=2"'));
  assert.notEqual(mainOf(mainNoise), mainOf(sample), 'hash noise probe changed nothing inside <main>');
  assert.ok(/data-astro-cid-[\w-]+x9/.test(mainOf(mainNoise)) && /href="\/[^"]*\?v=2"/.test(mainOf(mainNoise)), 'hash noise probe: the sample <main> has no scoped-style id or internal link to vary');
  assert.equal(significantHash(mainNoise), significantHash(sample), 'asset filenames, scoped-style ids, build comments or query strings change the lastmod hash');
  assert.notEqual(significantHash(sample.replace(/(<h1\b[^>]*>)/, '$1Edited ')), significantHash(sample), 'a visible edit inside <main> leaves the lastmod hash unchanged');
  assert.notEqual(significantHash(sample.replace(/(<main\b[\s\S]*?href=")\/work\//, '$1/about/')), significantHash(sample), 'a changed internal link inside <main> leaves the lastmod hash unchanged');
});

await searchCheck('JSON-LD parses on every indexable page and contains no raw "<"', () => {
  for (const [route, html] of indexable) {
    const blocks = ldBlocks(html);
    assert.ok(blocks.length > 0, `no JSON-LD on ${route}`);
    for (const block of blocks) {
      assert.ok(!block.includes('<'), `raw "<" inside JSON-LD on ${route}`);
      try { JSON.parse(block); } catch (error) { assert.fail(`JSON-LD on ${route} does not parse: ${error instanceof Error ? error.message : error}`); }
    }
  }
});

await searchCheck('every page below home has one BreadcrumbList from its locale home to its canonical', () => {
  for (const [route, html] of indexable) {
    if (route === '/' || route === '/pt-br/') continue;
    const trails = ofType(pageNodes(html), 'BreadcrumbList');
    assert.equal(trails.length, 1, `${route}: ${trails.length} BreadcrumbList nodes`);
    const crumbs = listOf(trails[0], 'itemListElement').map((crumb) => ({ position: field(crumb, 'position'), name: str(crumb, 'name') ?? '', item: str(crumb, 'item') ?? '' }));
    assert.deepEqual(crumbs.map((crumb) => crumb.position), crumbs.map((_, index) => index + 1), `${route}: breadcrumb positions`);
    assert.equal(crumbs[0]?.item, localeHome(route), `${route}: breadcrumb does not start at the locale home`);
    assert.equal(crumbs.at(-1)?.item, `${SITE}${route}`, `${route}: last breadcrumb is not the canonical`);
    const shownText = visibleText(html);
    const shownMarkup = visibleMarkup(html);
    crumbs.forEach((crumb, index) => {
      assert.ok(crumb.name, `${route}: breadcrumb ${index + 1} has no name`);
      // Every step above the page is a visible link. The home step's visible form is the brand link, which shows
      // the site name rather than "Home", so its name is not required on the page; the others' names are.
      if (index < crumbs.length - 1) assert.ok(shownMarkup.includes(`href="${new URL(crumb.item).pathname}"`), `${route}: no visible link to breadcrumb "${crumb.name}" (${crumb.item})`);
      if (index > 0) assert.ok(shownText.includes(crumb.name), `${route}: breadcrumb name "${crumb.name}" is not visible on the page`);
    });
    if (isProjectRoute(route)) {
      assert.equal(crumbs.length, 3, `${route}: project breadcrumb is not Home › Work › Project`);
      assert.equal(crumbs[1]?.item, `${localeHome(route)}work/`, `${route}: middle breadcrumb is not the work index`);
      assert.equal(crumbs[2]?.name, decodeEntities(html.match(/<h1\b[^>]*>([^<]+)<\/h1>/)?.[1] ?? ''), `${route}: last breadcrumb is not the project title`);
      // The trail is also shown as one breadcrumb nav above the title: links to the steps above, the page marked current.
      const trail = html.match(/<nav\b[^>]*aria-label="(?:Breadcrumb|Trilha de navegação)"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
      assert.ok(trail, `${route}: no visible breadcrumb nav`);
      assert.deepEqual([...trail.matchAll(/href="([^"]+)"/g)].map((match) => match[1]), crumbs.slice(0, -1).map((crumb) => new URL(crumb.item).pathname), `${route}: breadcrumb nav links differ from the BreadcrumbList`);
      assert.match(trail, /aria-current="page"/, `${route}: breadcrumb nav does not mark the current page`);
    } else {
      assert.equal(crumbs.length, 2, `${route}: section breadcrumb is not Home › Page`);
    }
  }
});

await searchCheck('every project page is a WebPage by the Person whose mainEntity is the project, with no commerce or ratings', () => {
  const projectPages = indexable.filter(([route]) => isProjectRoute(route));
  assert.equal(projectPages.length, 2 * PROJECTS, 'project page count');
  for (const [route, html] of projectPages) {
    const page = ofType(pageNodes(html), 'WebPage')[0];
    assert.equal(str(field(page, 'author'), 'name'), 'Marcus Neves', `${route}: WebPage lost its author`);
    const entity = field(page, 'mainEntity');
    const type = str(entity, '@type') ?? 'missing';
    // No SoftwareApplication (or its Mobile/Web/VideoGame subtypes): Google's Software app rich result requires
    // offers.price plus aggregateRating or review, which the site cannot state truthfully, so every such node would
    // be an invalid item in Search Console. CreativeWork is its truthful supertype; the page text names the platform.
    assert.ok(['SoftwareSourceCode', 'CreativeWork'].includes(type), `${route}: mainEntity is ${type}`);
    assert.equal(str(entity, 'name'), decodeEntities(html.match(/<h1\b[^>]*>([^<]+)<\/h1>/)?.[1] ?? ''), `${route}: mainEntity name is not the visible title`);
    const description = str(entity, 'description');
    assert.ok(description && visibleText(html).includes(description), `${route}: mainEntity description is not the visible summary`);
    assert.match(str(entity, 'url') ?? '', /^https:\/\//, `${route}: mainEntity url`);
    for (const key of ['offers', 'aggregateRating', 'review', 'price']) assert.equal(field(entity, key), undefined, `${route}: mainEntity carries ${key}`);
    if (type === 'SoftwareSourceCode') assert.ok(html.includes(`href="${str(entity, 'codeRepository')}"`), `${route}: codeRepository is not a link on the page`);
  }
});

await searchCheck('home pages carry a WebSite node and a ProfilePage about the Person; Person facts are visible on the page', () => {
  for (const route of ['/', '/pt-br/']) {
    const nodes = pageNodes(builtPages.get(route) ?? '');
    const website = ofType(nodes, 'WebSite')[0];
    assert.equal(str(website, 'url'), `${SITE}/`, `${route}: WebSite url`);
    assert.equal(str(website, 'name'), 'Marcus Neves', `${route}: WebSite name`);
    assert.equal(str(field(ofType(nodes, 'ProfilePage')[0], 'mainEntity'), '@type'), 'Person', `${route}: ProfilePage is not about the Person`);
  }
  for (const [route, html] of indexable) {
    for (const person of ofType(pageNodes(html), 'Person')) {
      assert.equal(str(person, 'name'), 'Marcus Neves', `${route}: Person name`);
      for (const profile of listOf(person, 'sameAs')) assert.ok(typeof profile === 'string' && html.includes(`href="${profile}"`), `${route}: sameAs ${String(profile)} is not linked on the page`);
      const jobTitle = field(person, 'jobTitle');
      if (jobTitle !== undefined) assert.ok(typeof jobTitle === 'string' && visibleText(html).includes(jobTitle), `${route}: jobTitle "${String(jobTitle)}" is not stated on the page`);
    }
  }
});

await searchCheck('the work index describes its list: mainEntity is an ItemList of the project links it shows, in order', () => {
  for (const route of ['/work/', '/pt-br/work/']) {
    const html = builtPages.get(route);
    assert.ok(html, `${route} not built`);
    const page = ofType(pageNodes(html), 'WebPage')[0];
    const list = field(page, 'mainEntity');
    assert.equal(str(list, '@type'), 'ItemList', `${route}: mainEntity is ${str(list, '@type') ?? 'missing'}`);
    const prefix = route === '/work/' ? '/work/' : '/pt-br/work/';
    // The rows' own links, in page order: each project once (a row links its title and its detail button).
    const ledger = [...visibleMarkup(html).matchAll(/<article\b[^>]*\bdata-project-row\b[^>]*>[\s\S]*?<\/article>/g)].map((m) => m[0]).join('');
    const shown = [...new Set([...ledger.matchAll(/href="(\/(?:pt-br\/)?work\/[^"/]+\/)"/g)].map((m) => m[1]).filter((h) => h.startsWith(prefix)))];
    assert.equal(shown.length, PROJECTS, `${route}: ${shown.length} project links shown, expected ${PROJECTS}`);
    const items = listOf(list, 'itemListElement');
    assert.deepEqual(items.map((item) => str(item, 'url')), shown.map((h) => `${SITE}${h}`), `${route}: ItemList urls differ from the rows shown`);
    assert.deepEqual(items.map((item) => field(item, 'position')), shown.map((_, i) => i + 1), `${route}: ItemList positions are not 1..n`);
    assert.equal(field(list, 'numberOfItems'), shown.length, `${route}: numberOfItems`);
    for (const item of items) assert.ok(str(item, 'name'), `${route}: ItemList entry without a name`);
  }
});

await searchCheck('og:image is a built file with its real size, fetchable cross-site; project pages preview their cover', () => {
  let covers = 0;
  for (const [route, html] of builtPages) {
    const image = metaContent(html, 'og:image') ?? '';
    assert.ok(image.startsWith(`${SITE}/`), `${route}: og:image ${image} is not absolute on ${SITE}`);
    const { pathname } = new URL(image);
    const file = join(root, pathname);
    assert.ok(existsSync(file), `${route}: og:image ${pathname} is not in dist`);
    const { format, ...size } = imageSize(readFileSync(file));
    // LinkedIn documents no WebP/AVIF support and several 2026 reports show it dropping them: previews stay PNG/JPEG.
    assert.ok(format === 'png' || format === 'jpeg', `${route}: og:image ${pathname} is ${format}; link previews need PNG or JPEG`);
    assert.deepEqual({ width: Number(metaContent(html, 'og:image:width')), height: Number(metaContent(html, 'og:image:height')) }, size, `${route}: declared og:image size differs from ${pathname}`);
    assert.equal(metaContent(html, 'twitter:image'), image, `${route}: twitter:image differs from og:image`);
    assert.ok(!servesCorp(pathname), `${route}: ${pathname} is served with CORP same-origin, so web-view link previews blank it`);
    const coverTag = html.match(/<figure class="detail-media"[^>]*><img\b[^>]*>/)?.[0];
    const cover = coverTag ? [coverTag, coverTag.match(/\bsrc="([^"]+)"/)?.[1] ?? '', coverTag.match(/\balt="([^"]*)"/)?.[1] ?? ''] : null;
    if (cover) {
      covers += 1;
      // The share copy of the cover: /images/projects/<slug>.webp → /images/projects/og/<slug>.jpg (scripts/og-covers.sh).
      assert.equal(image, `${SITE}${cover[1].replace(/^\/images\/projects\/([^/]+)\.webp$/, '/images/projects/og/$1.jpg')}`, `${route}: og:image is not the JPEG share copy of the project cover`);
      // og-covers.sh records the sha256 of the cover each copy was made from, so a replaced cover with a stale copy fails.
      const slug = cover[1].replace(/^\/images\/projects\/([^/]+)\.webp$/, '$1');
      const sourceHash = createHash('sha256').update(readFileSync(join(projectRoot, 'public', cover[1]))).digest('hex');
      assert.equal(ogCoverSources[slug], sourceHash, `${route}: share copy og/${slug}.jpg was not made from the current cover; run bash scripts/og-covers.sh`);
      assert.equal(metaContent(html, 'og:image:alt'), cover[2], `${route}: og:image:alt is not the cover alt text`);
    } else {
      assert.ok(metaContent(html, 'og:image:alt'), `${route}: og:image:alt missing`);
    }
  }
  assert.ok(covers > 0, 'no project cover found; the cover check would pass vacuously');
});

await searchCheck('titles and descriptions are unique across indexable pages; titles fit 60 characters', () => {
  for (const field of ['title', 'description']) {
    /** @type {Map<string, string[]>} */
    const seen = new Map();
    for (const [route, html] of indexable) {
      const value = field === 'title' ? html.match(/<title>([^<]*)<\/title>/)?.[1] : metaContent(html, 'description');
      assert.ok(value, `${route}: no ${field}`);
      seen.set(value, [...(seen.get(value) ?? []), route]);
    }
    const shared = [...seen].filter(([, owners]) => owners.length > 1);
    assert.equal(shared.length, 0, `${shared.length} duplicate ${field}s, e.g. "${shared[0]?.[0]}" on ${shared[0]?.[1].join(', ')}`);
  }
  const long = indexable.map(([route, html]) => [route, decodeEntities(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '')]).filter(([, title]) => [...(title ?? '')].length > 60);
  assert.equal(long.length, 0, `titles over 60 characters: ${long.map(([route, title]) => `${route} "${title}"`).join('; ')}`);
});

await searchCheck('robots meta: max-image-preview:large on indexable pages, noindex alone on the rest', () => {
  for (const [route, html] of builtPages) {
    const robots = metaTags(html).filter((tag) => tag.name === 'robots').map((tag) => tag.content);
    assert.deepEqual(robots, isNoindex(html) ? ['noindex'] : ['max-image-preview:large'], `${route}: robots meta`);
  }
});

// --- Page hygiene: each finder returns its violations, runs on the build and on a planted sample, so a green result
// is never vacuous (a finder that silently matches nothing would pass every build). ---
const sampleProjectHtml = builtPages.get('/work/hay/') ?? '';
assert.ok(sampleProjectHtml, 'hygiene probes need /work/hay/');
/** @param {string} html */
const headingOneFaults = (html) => {
  const count = (html.match(/<h1\b/g) ?? []).length;
  return count === 1 ? [] : [`${count} <h1>`];
};
// Raster images ship as WebP; og:image share copies are <meta>, not <img>, and stay JPEG/PNG for LinkedIn.
/** @param {string} html */
const imageFaults = (html) => [...html.matchAll(/<img\b[^>]*>/g)].flatMap(([tag]) => {
  const src = tag.match(/\bsrc="([^"]*)"/)?.[1] ?? '';
  return [
    ...(/\balt="[^"]+"/.test(tag) || /\baria-hidden="true"/.test(tag) ? [] : [`no alt text: ${src}`]),
    // The alt a cover once got from a template: it names the project and describes nothing.
    ...(/\balt="[^"]*: (?:product screen|tela do produto)\."/.test(tag) ? [`generated alt text: ${src}`] : []),
    ...(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag) ? [] : [`no width/height (layout shift): ${src}`]),
    ...(/\.(?:webp|avif|svg)(?:[?#]|$)/.test(src) ? [] : [`not WebP/AVIF/SVG: ${src}`]),
  ];
});
/** Same-site paths of URLs matched by `pattern`, resolved against the page, so relative URLs count too.
 * @param {string} html @param {string} route @param {RegExp} pattern */
const sameSitePaths = (html, route, pattern) => [...html.matchAll(pattern)].flatMap(([, raw = '']) => {
  let url;
  try { url = new URL(decodeEntities(raw), `${SITE}${route}`); } catch { return [`unparsable ${raw}`]; }
  return url.origin === SITE ? [url.pathname] : [];
});
/** Every same-site href/src target of a page, plus each srcset candidate. @param {string} html @param {string} route */
const internalTargets = (html, route) => [
  ...sameSitePaths(html, route, /\b(?:href|src)="([^"]+)"/g),
  ...[...html.matchAll(/\bsrcset="([^"]+)"/g)].flatMap(([, list = '']) => list.split(',').flatMap((candidate) => sameSitePaths(`src="${candidate.trim().split(/\s+/)[0]}"`, route, /src="([^"]+)"/g))),
];
// Workers Static Assets answers a path without a trailing slash, and any *.html URL, with a redirect to the canonical
// directory path (https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).
/** @param {string} html @param {string} route */
const linkFaults = (html, route) => internalTargets(html, route).flatMap((path) => {
  if (path.startsWith('unparsable ')) return [path];
  if (path === route) return []; // a fragment or self link (the skip link) navigates nowhere
  const file = join(root, decodeURIComponent(path));
  if (path.endsWith('/')) return existsSync(join(file, 'index.html')) ? [] : [`broken link ${path}`];
  if (path.endsWith('.html')) return [`redirecting link ${path} (link the directory path)`];
  if (!/\.[a-z0-9]+$/i.test(path)) return [`redirecting link ${path} (add the trailing slash)`];
  return existsSync(file) ? [] : [`broken link ${path}`];
});
/** Body anchors only: <head> alternates and canonicals are not navigation. @param {string} html @param {string} route */
const navigationTargets = (html, route) => sameSitePaths(html.slice(html.indexOf('</head>')), route, /<a\b[^>]*?\bhref="([^"]+)"/g);
/** Indexable routes a visitor cannot reach by following links from either home page. @param {[string, string][]} pages */
const orphans = (pages) => {
  const byRoute = new Map(pages);
  const reached = new Set(['/', '/pt-br/']);
  for (const queue = [...reached]; queue.length;) {
    const route = queue.shift() ?? '';
    for (const path of navigationTargets(byRoute.get(route) ?? '', route)) {
      if (byRoute.has(path) && !reached.has(path)) { reached.add(path); queue.push(path); }
    }
  }
  return pages.map(([route]) => route).filter((route) => !reached.has(route));
};
const DESCRIPTION_MIN = 100; // mirrors DESCRIPTION_MIN in src/data/seo.ts, which pads short project descriptions to reach it
const DESCRIPTION_MAX = 165; // mirrors DESCRIPTION_MAX in src/data/seo.ts: a search snippet shows about 160 characters
/** @param {string} html */
const descriptionFaults = (html) => {
  const description = decodeEntities(metaContent(html, 'description') ?? '');
  return [...description].length >= DESCRIPTION_MIN ? [] : [`description of ${[...description].length} characters: "${description}"`];
};
// Mirrors SENTENCE_BREAK in src/data/seo.ts: a sentence ends at . ! ? followed by a space and a capital, digit or quote.
const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[\p{Lu}\d“"'(])/u;
/** Leading whole sentences of a text, shortest first. @param {string} text */
const sentencePrefixes = (text) => text.split(SENTENCE_BREAK).map((_, index, parts) => parts.slice(0, index + 1).join(' '));
/** A description over the limit that could stop at an earlier sentence and still reach the minimum. @param {string} html */
const longDescriptionFaults = (html) => {
  const description = decodeEntities(metaContent(html, 'description') ?? '');
  const size = [...description].length;
  if (size <= DESCRIPTION_MAX) return [];
  const shorter = sentencePrefixes(description).find((prefix) => [...prefix].length >= DESCRIPTION_MIN && [...prefix].length < size);
  return shorter ? [`description of ${size} characters could stop after ${[...shorter].length}: "${description}"`] : [];
};
/** Other project pages of the page's own language linked from its visible <main>. @param {string} html @param {string} route */
const relatedProjectLinks = (html, route) => {
  const main = visibleMarkup(html).match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? '';
  const index = route.startsWith('/pt-br/') ? '/pt-br/work/' : '/work/';
  return [...new Set(sameSitePaths(main, route, /<a\b[^>]*?\bhref="([^"]+)"/g))].filter((path) => path !== route && path !== index && path.startsWith(index));
};
const RELATED_PROJECTS = 3;
/** @param {(html: string, route: string) => string[]} finder @param {[string, string][]} pages */
const faultsOn = (finder, pages) => pages.flatMap(([route, html]) => finder(html, route).map((fault) => `${route}: ${fault}`));

await searchCheck('every page has exactly one <h1>', () => {
  assert.deepEqual(faultsOn(headingOneFaults, [...builtPages]), []);
  assert.equal(headingOneFaults(sampleProjectHtml.replace('</main>', '<h1>Second</h1></main>')).length, 1, 'planted second <h1> not caught');
});

/** Pixel width of a WebP file (lossy VP8, lossless VP8L or extended VP8X). @param {string} file */
const webpWidth = (file) => {
  const bytes = readFileSync(file);
  const chunk = bytes.toString('latin1', 12, 16);
  if (chunk === 'VP8 ') return bytes.readUInt16LE(26) & 0x3fff;
  if (chunk === 'VP8L') return 1 + (bytes.readUInt16LE(21) & 0x3fff);
  if (chunk === 'VP8X') return 1 + bytes.readUIntLE(24, 3);
  throw new Error(`${file} is not a WebP image`);
};
// A phone shows a project cover 300-360px wide and a work row 120-190px wide; the 1600px original alone made the cover
// the slowest part of a project page (LCP over 2 s on simulated mobile). Covers ship 400w and 800w copies.
const COVER_WIDTHS = [400, 800, 1600];
/** @param {string} html @param {string} route */
const coverFaults = (html, route) => [...html.matchAll(/<img\b[^>]*\bsrc="(\/images\/projects\/[^"/]+\.webp)"[^>]*>/g)].flatMap(([tag, src = '']) => {
  const candidates = (tag.match(/\bsrcset="([^"]+)"/)?.[1] ?? '').split(',').map((entry) => entry.trim().split(/\s+/)).filter(([url]) => url);
  const faults = [];
  if (!/\bsizes="[^"]+"/.test(tag)) faults.push(`${src}: no sizes`);
  const widths = candidates.map(([, descriptor = '']) => Number(descriptor.replace(/w$/, '')));
  if (JSON.stringify(widths) !== JSON.stringify(COVER_WIDTHS)) faults.push(`${src}: srcset widths ${widths.join('/') || 'none'}, expected ${COVER_WIDTHS.join('/')}`);
  for (const [url = '', descriptor = ''] of candidates) {
    const path = sameSitePaths(`src="${url}"`, route, /src="([^"]+)"/g)[0] ?? '';
    const file = join(root, path);
    if (!existsSync(file)) faults.push(`${url}: missing`);
    else if (`${webpWidth(file)}w` !== descriptor) faults.push(`${url}: ${webpWidth(file)}px wide, srcset says ${descriptor}`);
  }
  return faults;
});

await searchCheck('every project cover offers 400w and 800w WebP copies through srcset and sizes, each at its stated width', () => {
  assert.deepEqual(faultsOn(coverFaults, [...builtPages]), []);
  assert.ok(projectRoutes.some((route) => /<img\b[^>]*src="\/images\/projects\//.test(builtPages.get(route) ?? '')), 'no project cover found; the cover check would pass vacuously');
  assert.equal(coverFaults('<img src="/images/projects/dnschat.webp" alt="x">', '/work/dnschat/').length, 2, 'planted cover without srcset or sizes not caught');
  assert.deepEqual(coverFaults('<img src="/images/projects/dnschat.webp" srcset="/images/projects/dnschat.webp 400w, /images/projects/dnschat.webp 800w, /images/projects/dnschat.webp 1600w" sizes="1px">', '/work/dnschat/'), ['/images/projects/dnschat.webp: 1600px wide, srcset says 400w', '/images/projects/dnschat.webp: 1600px wide, srcset says 800w'], 'planted wrong srcset width not caught');
});

await searchCheck('every <img> has alt text, width and height, and a WebP/AVIF/SVG source', () => {
  assert.deepEqual(faultsOn(imageFaults, [...builtPages]), []);
  assert.ok((sampleProjectHtml.match(/<img\b/g) ?? []).length > 0, 'the hygiene sample has no <img>; the image check would pass vacuously');
  assert.equal(imageFaults('<img src="/images/x.png" alt="">').length, 3, 'planted image without alt, size or modern format not caught');
  assert.deepEqual(imageFaults('<img src="/images/x.webp" alt="hay: product screen." width="1" height="1">'), ['generated alt text: /images/x.webp'], 'planted generated alt not caught');
});

await searchCheck('every internal link and asset resolves to a built file without a redirect hop', () => {
  assert.deepEqual(faultsOn(linkFaults, [...builtPages]), []);
  assert.ok(internalTargets(sampleProjectHtml, '/work/hay/').length > 10, 'the hygiene sample has almost no internal links; the link check would pass vacuously');
  assert.deepEqual(linkFaults('<a href="/work">x</a><a href="https://mvneves.dev/missing/">y</a><img src="/images/none.webp"><a href="/work/index.html">z</a><a href="./gone/">r</a><img src="cover.webp"><a href="https://example.com/x">e</a><a href="#top">t</a>', '/work/hay/'), ['redirecting link /work (add the trailing slash)', 'broken link /missing/', 'broken link /images/none.webp', 'redirecting link /work/index.html (link the directory path)', 'broken link /work/hay/gone/', 'broken link /work/hay/cover.webp']);
});

await searchCheck('every indexable page except home is linked from another page (no orphans)', () => {
  assert.deepEqual(orphans(indexable), []);
  assert.deepEqual(orphans([...indexable, ['/work/planted-orphan/', sampleProjectHtml]]), ['/work/planted-orphan/'], 'planted orphan not caught');
  // Two pages that point only at each other (head alternates, then body links) are still unreachable from home.
  const island = (/** @type {string} */ other) => `<head><link rel="alternate" hreflang="pt-BR" href="${SITE}${other}"></head><body><a href="${other}">x</a></body>`;
  assert.deepEqual(orphans([...indexable, ['/work/island-a/', island('/work/island-b/')], ['/work/island-b/', island('/work/island-a/')]]), ['/work/island-a/', '/work/island-b/'], 'planted island of pages linking only each other not caught');
});

await searchCheck(`every indexable page has a meta description of at least ${DESCRIPTION_MIN} characters`, () => {
  assert.deepEqual(faultsOn(descriptionFaults, indexable), []);
  assert.equal(descriptionFaults('<meta name="description" content="Short.">').length, 1, 'planted short description not caught');
  // Content truth: a project description is the visible summary, optionally followed by the visible problem statement.
  for (const route of projectRoutes) {
    const html = builtPages.get(route) ?? '';
    const description = decodeEntities(metaContent(html, 'description') ?? '');
    const text = visibleText(html);
    const summary = html.match(/<p class="detail-summary"[^>]*>([^<]+)<\/p>/)?.[1];
    assert.ok(summary, `${route}: no visible summary (.detail-summary) to build the description from`);
    const lede = decodeEntities(summary);
    // The summary's leading sentences, or the whole summary followed by visible text (the problem statement's).
    assert.ok(sentencePrefixes(lede).includes(description) || (description.startsWith(`${lede} `) && text.includes(description.slice(lede.length + 1))), `${route}: description is not the visible summary plus visible text: "${description}"`);
  }
});

await searchCheck(`no description runs past ${DESCRIPTION_MAX} characters when an earlier sentence end would do`, () => {
  assert.deepEqual(faultsOn(longDescriptionFaults, indexable), []);
  const sentence = (/** @type {number} */ size) => `${'A'.repeat(size - 1)}.`;
  assert.equal(longDescriptionFaults(`<meta name="description" content="${sentence(120)} ${sentence(120)}">`).length, 1, 'planted description with a spare sentence not caught');
  assert.equal(longDescriptionFaults(`<meta name="description" content="${sentence(200)}">`).length, 0, 'one long sentence cannot be cut and must pass');
  assert.equal(longDescriptionFaults(`<meta name="description" content="${sentence(90)} ${sentence(90)}">`).length, 0, 'two sentences both needed to reach the minimum must pass');
});

await searchCheck(`every project page links to ${RELATED_PROJECTS} other projects in its own language`, () => {
  for (const route of projectRoutes) {
    const links = relatedProjectLinks(builtPages.get(route) ?? '', route);
    assert.equal(links.length, RELATED_PROJECTS, `${route}: ${links.length} related project links (${links.join(', ')})`);
    for (const path of links) assert.ok(projectRoutes.includes(path), `${route}: related link ${path} is not a project page`);
  }
  assert.deepEqual(relatedProjectLinks('<main><a href="/work/">all</a><a href="/work/hay/">self</a><a href="/pt-br/work/stoa/">other language</a><a aria-hidden="true" href="/work/stoa/">hidden</a></main>', '/work/hay/'), [], 'planted page without related projects not flagged');
  assert.deepEqual(relatedProjectLinks('<main><a href="/work/stoa/">STOA</a></main>', '/work/hay/'), ['/work/stoa/'], 'planted related project link not found');
});

// A section title that is only the nav label ("Work — Marcus Neves") tells a search result nothing about the page.
const SECTION_TITLE_MIN = 40;
await searchCheck(`section pages say what they hold in the title (at least ${SECTION_TITLE_MIN} characters)`, () => {
  for (const route of ['/work/', '/about/', '/recommendations/', '/contact/', '/pt-br/work/', '/pt-br/about/', '/pt-br/recommendations/', '/pt-br/contact/']) {
    const title = decodeEntities(builtPages.get(route)?.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    assert.ok([...title].length >= SECTION_TITLE_MIN, `${route}: title "${title}" has ${[...title].length} characters`);
  }
});

await searchCheck('link previews name the X account the page links to', () => {
  for (const [route, html] of indexable) {
    for (const key of ['twitter:site', 'twitter:creator']) assert.equal(metaContent(html, key), '@mneves75', `${route}: ${key}`);
    assert.ok(html.includes('href="https://x.com/mneves75"'), `${route}: the X profile named in twitter:site is not linked on the page`);
  }
});

// The preloaded fonts sit on the critical path of every first visit; Archivo's unused width axis once tripled its size.
const FONT_PRELOAD_BUDGET = 40 * 1024;
await searchCheck(`every preloaded font exists and is at most ${FONT_PRELOAD_BUDGET / 1024} KiB`, () => {
  const preloads = [...new Set([...builtPages.values()].flatMap((html) => [...html.matchAll(/<link rel="preload" href="([^"]+)" as="font"/g)].map((match) => match[1] ?? '')))];
  assert.ok(preloads.length > 0, 'no font preload found; the budget would pass vacuously');
  for (const href of preloads) {
    const file = join(root, href);
    assert.ok(existsSync(file), `preloaded font missing: ${href}`);
    assert.ok(statSync(file).size <= FONT_PRELOAD_BUDGET, `${href} is ${Math.round(statSync(file).size / 1024)} KiB`);
  }
});

assert.equal(searchFailures.length, 0, `search contract failed: ${searchFailures.join(' | ')}`);
console.log(`route smoke: ${routes.length} outputs verified; pt-BR metadata/content assertions passed; search contract on ${builtPages.size} pages`);
