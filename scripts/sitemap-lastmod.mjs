// Post-build: stamp dist/sitemap.xml with <lastmod> from the committed content-hash manifest.
// Google and Bing use lastmod only when it is the page's last significant change, never a build date. So the
// date moves only when a page's significant content changes: title, meta description, canonical, the text and
// internal links of <main>, and the JSON-LD. Asset filenames, scripts and build noise are not content.
// Unchanged hash keeps the stored date; a new URL or changed hash gets LASTMOD_DATE (YYYY-MM-DD) or today in
// America/Sao_Paulo. URLs no longer in the sitemap leave the manifest. Commit the manifest with the change.
// LASTMOD_CHECK=1 (CI) refuses a stale manifest instead of rewriting it: a content change committed without its
// manifest would otherwise pass, and every later clean-checkout build would re-date those pages to its build day.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const manifestPath = fileURLToPath(new URL('../src/data/sitemap-lastmod.json', import.meta.url));
const dist = fileURLToPath(new URL('../dist/', import.meta.url));

/** @param {string} html @param {RegExp} pattern */
const first = (html, pattern) => html.match(pattern)?.[1] ?? '';

/** The parts of a built page whose change is a real content change. @param {string} html */
export function significantContent(html) {
  const main = first(html, /<main\b[^>]*>([\s\S]*?)<\/main>/) || first(html, /<body\b[^>]*>([\s\S]*?)<\/body>/);
  const content = main.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/g, ' ');
  const links = [...content.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)]
    .map((match) => (match[1] ?? '').replace(/^https:\/\/mvneves\.dev(?=\/)/, '').split('?')[0] ?? '')
    .filter((href) => href.startsWith('/') && !href.startsWith('//'));
  return {
    title: first(html, /<title>([\s\S]*?)<\/title>/),
    description: first(html, /<meta name="description" content="([^"]*)"/),
    canonical: first(html, /<link rel="canonical" href="([^"]*)"/),
    text: content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    links: [...new Set(links)].sort(),
    jsonLd: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]),
  };
}

/** @param {string} html */
export const significantHash = (html) => createHash('sha256').update(JSON.stringify(significantContent(html))).digest('hex');

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

/** A real calendar day: Date.parse alone rolls 2026-02-30 over to March 2. @param {string} date */
const isCalendarDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;

function stamp() {
  const date = process.env.LASTMOD_DATE ?? today();
  if (!isCalendarDate(date)) throw new Error(`LASTMOD_DATE must be a real YYYY-MM-DD date, got "${date}"`);
  const mode = process.env.LASTMOD_CHECK ?? '';
  if (!['', '0', '1'].includes(mode)) throw new Error(`LASTMOD_CHECK must be 1 (check) or 0/unset (write), got "${mode}"`);
  const sitemapPath = join(dist, 'sitemap.xml');
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '');
  if (locs.length === 0) throw new Error('dist/sitemap.xml lists no URLs');
  /** @type {Record<string, { hash: string, lastmod: string }>} */
  const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
  /** @type {Record<string, { hash: string, lastmod: string }>} */
  const next = {};
  /** @type {string[]} */
  const moved = [];
  for (const loc of [...locs].sort()) {
    const file = join(dist, new URL(loc).pathname, 'index.html');
    if (!existsSync(file)) throw new Error(`sitemap lists ${loc}, but ${file} was not built`);
    const hash = significantHash(readFileSync(file, 'utf8'));
    const stored = previous[loc];
    if (stored?.hash !== hash) moved.push(loc);
    next[loc] = { hash, lastmod: stored?.hash === hash ? stored.lastmod : date };
  }
  const json = `${JSON.stringify(next, null, 2)}\n`;
  const dropped = Object.keys(previous).filter((loc) => !(loc in next));
  if (!existsSync(manifestPath) || readFileSync(manifestPath, 'utf8') !== json) {
    if (mode === '1') {
      throw new Error(`LASTMOD_CHECK: src/data/sitemap-lastmod.json is stale (${moved.length} new or changed, ${dropped.length} dropped: ${[...moved, ...dropped].slice(0, 5).join(', ')}${moved.length + dropped.length > 5 ? ', …' : ''}). Run bun run build and commit the manifest with the content change.`);
    }
    writeFileSync(manifestPath, json);
  }
  let stamped = 0;
  // Idempotent: an already stamped entry is rewritten, so running this twice on one dist is harmless.
  const out = sitemap.replace(/<url><loc>([^<]+)<\/loc>(?:<lastmod>[^<]*<\/lastmod>)?<\/url>/g, (_, loc) => {
    stamped += 1;
    return `<url><loc>${loc}</loc><lastmod>${next[loc]?.lastmod}</lastmod></url>`;
  });
  if (stamped !== locs.length) throw new Error(`stamped ${stamped} of ${locs.length} sitemap URLs; unexpected <url> markup`);
  writeFileSync(sitemapPath, out);
  console.log(`lastmod: ${locs.length} sitemap URLs, ${moved.length} new or changed (dated ${date}), ${dropped.length} dropped${mode === '1' ? ' (LASTMOD_CHECK: manifest is current)' : ''}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) stamp();
