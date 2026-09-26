// Browser gate: drives the built site in real Chrome with the CSP from dist/_headers enforced.
// The route test only reads static HTML; every JS bug fixed in 1.6.x slipped past it.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import worker from '../worker/index.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
/** @type {Record<string, string>} */
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };

// Cloudflare _headers semantics: every matching rule applies in order, repeated names comma-join, `! Name` detaches.
/** @type {{ pattern: RegExp, lines: string[] }[]} */
const rules = [];
for (const line of readFileSync(join(root, '_headers'), 'utf8').split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  if (line.startsWith('/')) rules.push({ pattern: new RegExp(`^${line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`), lines: [] });
  else rules.at(-1)?.lines.push(line.trim());
}
/** @param {string} path */
const headersFor = (path) => {
  /** @type {Record<string, string>} */
  const out = {};
  for (const rule of rules.filter((r) => r.pattern.test(path))) {
    for (const line of rule.lines) {
      if (line.startsWith('! ')) { delete out[line.slice(2).toLowerCase()]; continue; }
      const [name, ...value] = line.split(':');
      const key = name.trim().toLowerCase();
      out[key] = out[key] ? `${out[key]}, ${value.join(':').trim()}` : value.join(':').trim();
    }
  }
  return out;
};
/** Cloudflare `not_found_handling: "404-page"`: the nearest 404.html up the directory tree. @param {string} path */
const notFoundFile = (path) => {
  for (let dir = dirname(path.endsWith('/') ? `${path}x` : path); ; dir = dirname(dir)) {
    const candidate = join(root, dir, '404.html');
    if (existsSync(candidate)) return candidate;
    if (dir === '/') throw new Error('dist has no 404.html');
  }
};

/** Workers Static Assets for one path: status, `_headers` and body. @param {string} path */
const asset = (path) => {
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) return { status: 400, headers: {}, body: Buffer.alloc(0) };
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  const found = existsSync(file);
  if (!found) file = notFoundFile(path);
  return { status: found ? 200 : 404, headers: { ...headersFor(path), 'content-type': types[extname(file)] ?? 'application/octet-stream' }, body: readFileSync(file) };
};
// `run_worker_first: ["/"]` in wrangler.jsonc: only the root goes through worker/index.js, whose ASSETS binding is the
// static server above.
const ASSETS = {
  /** @param {Request} request */
  fetch: async (request) => {
    const { status, headers, body } = asset(decodeURIComponent(new URL(request.url).pathname));
    return new Response(request.method === 'HEAD' ? null : new Uint8Array(body), { status, headers });
  },
};

const server = createServer(async (req, res) => {
  let path;
  try { path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  if (path === '/') {
    /** @type {[string, string][]} */
    const headers = Object.entries(req.headers).flatMap(([name, value]) => (value === undefined ? [] : [[name, Array.isArray(value) ? value.join(', ') : value]]));
    const response = await worker.fetch(new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers }), { ASSETS });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }
  const { status, headers, body } = asset(path);
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(undefined)));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('test server has no TCP address');
// BASE_URL points the same checks at a deployed site (post-deploy smoke); by default they run on the local dist/.
const base = process.env.BASE_URL?.replace(/\/$/, '') ?? `http://127.0.0.1:${address.port}`;

/** @typedef {Window & { __csp: string[], __errors: string[] }} ProbedWindow */
// Records CSP violations and script errors from document start, before any page script runs.
const probe = () => {
  const w = /** @type {ProbedWindow} */ (/** @type {unknown} */ (window));
  w.__csp = []; w.__errors = [];
  document.addEventListener('securitypolicyviolation', (e) => w.__csp.push(`${e.violatedDirective} ${e.blockedURI || 'inline'}`));
  window.addEventListener('error', (e) => w.__errors.push(String(e.message)));
  window.addEventListener('unhandledrejection', (e) => w.__errors.push(`rejection: ${String(e.reason)}`));
};

// The system Chrome (preinstalled on GitHub's ubuntu runners) avoids a browser download; CHROME_PATH overrides.
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });
/** @type {string[]} */
const failures = [];
/** @param {string} name @param {unknown} error */
const fail = (name, error) => {
  failures.push(name);
  console.error(`  FAIL ${name}\n       ${error instanceof Error ? error.message.split('\n').join('\n       ') : String(error)}`);
};
/**
 * @param {string} name @param {(page: import('playwright-core').Page) => Promise<void>} fn
 * @param {import('playwright-core').BrowserContextOptions} [options]
 * @param {{ plantsViolations?: boolean, visitsMissingRoutes?: boolean }} [flags] opt out of the console-error assertion
 *   for violations the check plants itself, or tolerate the 404 document load of a deliberately missing route
 */
const check = async (name, fn, options = {}, { plantsViolations = false, visitsMissingRoutes = false } = {}) => {
  // English by default: a Portuguese system locale would send the root to /pt-br/ and move every check that opens /.
  const context = await browser.newContext({ locale: 'en-US', ...options });
  await context.addInitScript(probe);
  const page = await context.newPage();
  /** @type {string[]} */
  const consoleErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  try {
    await fn(page);
    assert.deepEqual(await page.evaluate(() => /** @type {ProbedWindow} */ (/** @type {unknown} */ (window)).__errors), [], 'script errors');
    const expected = (/** @type {string} */ text) => visitsMissingRoutes && /Failed to load resource: the server responded with a status of 404/.test(text);
    if (!plantsViolations) assert.deepEqual(consoleErrors.filter((text) => !expected(text)), [], 'console errors');
    console.log(`  ok  ${name}`);
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
};
/** @param {import('playwright-core').Page} page @returns {Promise<string[]>} */
const violations = (page) => page.evaluate(() => /** @type {ProbedWindow} */ (/** @type {unknown} */ (window)).__csp);
/** Waits until the probe has recorded at least `n` violations. @param {import('playwright-core').Page} page @param {number} n */
const violationsReach = (page, n) => page.waitForFunction((min) => /** @type {ProbedWindow} */ (/** @type {unknown} */ (window)).__csp.length >= min, n);
const settle = (/** @type {import('playwright-core').Page} */ page, ms = 300) => page.waitForTimeout(ms);

console.log(`browser gate on ${base} (${browser.version()})`);

await check('CSP detector catches planted violations (positive control)', async (page) => {
  await page.goto(`${base}/`);
  await page.evaluate(() => {
    const style = document.createElement('style'); style.textContent = 'b{color:red}'; document.head.append(style);
    const script = document.createElement('script'); script.src = 'https://evil.example/x.js'; document.head.append(script);
  });
  await violationsReach(page, 2);
  const seen = await violations(page);
  assert.ok(seen.some((v) => v.startsWith('style-src')), `planted inline style not reported: ${seen}`);
  assert.ok(seen.some((v) => v.includes('evil.example')), `planted external script not reported: ${seen}`);
}, {}, { plantsViolations: true });

await check('script-src allows the analytics beacon path and nothing else on its host', async (page) => {
  // Stand in for the edge-injected beacon without the network. Routing is scoped to this check: request
  // interception on every context disturbs cross-document view transitions (spurious InvalidStateError).
  await page.route('https://static.cloudflareinsights.com/**', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.goto(`${base}/`);
  await page.evaluate(() => {
    for (const src of ['https://static.cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85', 'https://static.cloudflareinsights.com/other.js']) {
      const s = document.createElement('script'); s.src = src; document.head.append(s);
    }
  });
  // Scripts are checked in insertion order, so once other.js is reported the beacon has been judged too.
  await violationsReach(page, 1);
  assert.deepEqual(await violations(page), ['script-src-elem https://static.cloudflareinsights.com/other.js']);
}, {}, { plantsViolations: true });

const pages = ['/', '/pt-br/', '/work/', '/pt-br/work/', '/work/skills/', '/pt-br/work/dnschat/', '/about/', '/pt-br/about/', '/recommendations/', '/pt-br/recommendations/', '/contact/', '/pt-br/contact/'];
await check(`no CSP violations on ${pages.length} pages and both 404s`, async (page) => {
  for (const path of [...pages, '/missing/', '/pt-br/missing/']) {
    await page.goto(`${base}${path}`);
    await settle(page, 150);
    assert.deepEqual(await violations(page), [], `CSP violation on ${path}`);
  }
}, {}, { visitsMissingRoutes: true });

await check('missing /pt-br/ route serves the localized 404', async (page) => {
  const response = await page.goto(`${base}/pt-br/missing/`);
  assert.equal(response?.status(), 404);
  assert.match(await page.textContent('body') ?? '', /Caminho errado\./);
}, {}, { visitsMissingRoutes: true });

await check('⌘K palette: filter, arrows, Enter, Esc; empty Enter does nothing', async (page) => {
  await page.goto(`${base}/`);
  const palette = page.locator('#command-palette');
  const paletteOpen = () => palette.evaluate((d) => /** @type {HTMLDialogElement} */ (d).open);
  await page.keyboard.press('Meta+k');
  assert.equal(await paletteOpen(), true, '⌘K did not open the palette');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+k');
  assert.equal(await paletteOpen(), true, 'Ctrl+K did not open the palette');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('dialog[open]').count(), 1, 'empty-query Enter opened another dialog');
  assert.equal(await page.locator('#mn-terminal').evaluate((d) => /** @type {HTMLDialogElement} */ (d).open), false, 'empty-query Enter opened the terminal');
  await page.keyboard.type('dnschat');
  assert.equal(await page.locator('[data-palette-item]:visible').count(), 1, 'filter did not narrow to one item');
  await page.keyboard.press('ArrowDown');
  assert.match(await page.evaluate(() => document.activeElement?.textContent ?? ''), /DNSChat/, 'ArrowDown did not focus the match');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(), 0, 'Esc did not close the palette in one press');
  await page.keyboard.press('Control+k');
  await page.keyboard.type('skills');
  await Promise.all([page.waitForURL('**/work/skills/', { waitUntil: 'load' }), page.keyboard.press('Enter')]);
});

await check('pause control: marquee scrolls, state persists, resume restores', async (page) => {
  await page.goto(`${base}/`);
  const glyph = () => page.locator('.motion-glyph').evaluate((el) => getComputedStyle(el, '::before').content);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.motion), 'on');
  await page.click('[data-motion-toggle]');
  const marquee = await page.locator('.page-home .marquee').evaluate((m) => ({ overflowX: getComputedStyle(m).overflowX, scrollable: m.scrollWidth > m.clientWidth, animations: m.getAnimations({ subtree: true }).length }));
  assert.deepEqual(marquee, { overflowX: 'auto', scrollable: true, animations: 0 }, 'paused marquee is not a still, scrollable strip');
  await page.goto(`${base}/work/`);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.motion), undefined, 'pause did not persist');
  assert.equal(await glyph(), '"▶"');
  assert.equal(await page.getAttribute('[data-motion-toggle]', 'aria-pressed'), 'true');
  await page.click('[data-motion-toggle]');
  assert.equal(await glyph(), '"❚❚"');
  assert.equal(await page.evaluate(() => document.documentElement.dataset.motion), 'on');
});

await check('reduced motion: no animation, no pause control, scrollable marquee', async (page) => {
  await page.goto(`${base}/`);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.motion), undefined);
  assert.equal(await page.isVisible('[data-motion-toggle]'), false, 'pause control shown to reduced-motion users');
  assert.equal(await page.locator('.page-home .marquee').evaluate((m) => getComputedStyle(m).overflowX), 'auto');
}, { reducedMotion: 'reduce' });

await check('work filter hides rows with [hidden] and announces the count', async (page) => {
  await page.goto(`${base}/work/`);
  const rows = page.locator('[data-project-row]');
  const total = await rows.count();
  assert.ok(total > 1, 'work index rendered no project rows');
  await page.locator('[data-filter]:not([data-filter="all"])').first().click();
  const visible = await page.locator('[data-project-row]:visible').count();
  assert.ok(visible > 0 && visible < total, `filter showed ${visible} of ${total}`);
  assert.equal(await page.locator('[data-project-row][hidden]').count(), total - visible, 'filtered rows not hidden via the hidden attribute');
  assert.match(await page.textContent('[data-filter-status]') ?? '', new RegExp(`^${visible} `));
  await page.click('[data-filter="all"]');
  assert.equal(await page.locator('[data-project-row]:visible').count(), total);
});

await check('in-motion filter shows only unreleased work, each with a stage badge, and hides an empty archive', async (page) => {
  await page.goto(`${base}/work/`);
  const unreleased = await page.locator('[data-project-row]:not([data-stage="live"])').count();
  assert.ok(unreleased > 0, 'no unreleased project rendered; the check would pass vacuously');
  await page.click('[data-filter="in-motion"]');
  const visible = page.locator('[data-project-row]:visible');
  assert.equal(await visible.count(), unreleased, 'in-motion filter shows the wrong rows');
  assert.equal(await page.locator('[data-project-row]:visible[data-stage="live"]').count(), 0, 'a live project leaked into in-motion');
  assert.equal(await page.locator('[data-project-row]:visible .stage-badge').count(), unreleased, 'an unreleased row lacks its text badge');
  assert.equal(await page.locator('[data-archive-group]:visible').count(), 0, 'archive heading shown over an empty archive');
  await page.click('[data-filter="Promotional"]');
  assert.equal(await page.locator('[data-archive-group]:visible').count(), 1, 'archive group stayed hidden while it has matches');
});

await check('terminal stops writing once closed', async (page) => {
  await page.goto(`${base}/`);
  await page.keyboard.press('Control+k');
  await page.click('[data-palette-terminal]');
  await page.waitForSelector('#mn-terminal[open]');
  const lines = () => page.locator('#mn-screen > *').count();
  await settle(page, 900); // boot lines arrive on 110ms timers
  const booted = await lines();
  await page.keyboard.type('matrix');
  await page.keyboard.press('Enter');
  // Prove matrix is running (echo + at least two frames) before closing, or a dead terminal would pass.
  await page.waitForFunction((n) => document.querySelectorAll('#mn-screen > *').length >= n, booted + 3);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(), 0, 'Esc did not close the terminal');
  const atClose = await lines();
  await settle(page, 1500);
  assert.equal(await lines(), atClose, 'matrix kept writing after close');
});

// Root language (worker/index.js): an arrival at / whose browser's top language is Portuguese, or whose explicit
// choice is Portuguese, goes to /pt-br/; every other language stays on the English x-default ("pt-br or other → us").
// Crawlers send no Accept-Language; internal navigation never bounces.
/** @param {string} name @param {() => Promise<void>} fn */
const httpCheck = async (name, fn) => {
  try { await fn(); console.log(`  ok  ${name}`); } catch (error) { fail(name, error); }
};
/** @param {string} path @param {Record<string, string>} headers @param {string} [method] */
const rootFetch = (path, headers, method = 'GET') => fetch(`${base}${path}`, { method, headers, redirect: 'manual' });
/** @type {[string | null, Record<string, string>, 'pt' | 'en'][]} */
const languageCases = [
  ['pt-BR,pt;q=0.9,en;q=0.8', {}, 'pt'],
  ['pt-PT', {}, 'pt'],
  ['PT-br', {}, 'pt'],
  ['en;q=0.5,pt;q=0.6', {}, 'pt'],
  ['fr;q=0.5,pt-BR;q=0.9', {}, 'pt'],
  ['pt;q=1.000,en', {}, 'pt'],
  ['es-ES,es;q=0.9,pt;q=0.8', {}, 'en'],
  ['de,pt;q=0.1', {}, 'en'],
  ['en-US,en;q=0.9', {}, 'en'],
  ['en-US,pt-BR;q=0.9', {}, 'en'],
  ['en,pt', {}, 'en'],
  ['es-ES,es;q=0.9', {}, 'en'],
  ['pt;q=0,en;q=0.5', {}, 'en'],
  ['*', {}, 'en'],
  ['*,pt;q=0.9', {}, 'en'],
  [null, {}, 'en'],
  [';;q=abc,,pt;q=2', {}, 'en'],
  ['pt;q=1e0,en;q=0.9', {}, 'en'],
  ['pt;q=0x1,en;q=0.9', {}, 'en'],
  ['pt;q=.9,en;q=0.8', {}, 'en'],
  ['pt;q=0.9999,en;q=0.8', {}, 'en'],
  ['pt-BR', { cookie: 'mn-lang=en' }, 'en'],
  ['en-US', { cookie: 'mn-theme=dark; mn-lang=pt' }, 'pt'],
  ['pt-BR', { cookie: 'mn-lang=fr' }, 'pt'],
  ['pt-BR', { 'sec-fetch-site': 'same-origin' }, 'en'],
  ['pt-BR', { 'sec-fetch-site': 'none' }, 'pt'],
  ['pt-BR', { 'sec-fetch-site': 'cross-site' }, 'pt'],
  ['pt-BR', { referer: `${base}/pt-br/` }, 'en'],
  ['pt-BR', { referer: 'https://www.google.com/' }, 'pt'],
];
await httpCheck(`root language: ${languageCases.length} Accept-Language, cookie and navigation cases`, async () => {
  for (const [acceptLanguage, extra, expected] of languageCases) {
    const response = await rootFetch('/', { ...(acceptLanguage === null ? {} : { 'accept-language': acceptLanguage }), ...extra });
    const label = `${JSON.stringify(acceptLanguage)} ${JSON.stringify(extra)}`;
    if (expected === 'pt') {
      assert.equal(response.status, 302, `${label}: expected a redirect, got ${response.status}`);
      assert.equal(new URL(response.headers.get('location') ?? '', base).pathname, '/pt-br/', `${label}: wrong Location`);
    } else {
      assert.equal(response.status, 200, `${label}: expected the English root, got ${response.status} → ${response.headers.get('location')}`);
    }
  }
});
await httpCheck('root language: headers, query, HEAD, POST and other paths', async () => {
  const redirect = await rootFetch('/?utm_source=test', { 'accept-language': 'pt-BR' });
  assert.equal(redirect.status, 302);
  const target = new URL(redirect.headers.get('location') ?? '', base);
  assert.equal(`${target.pathname}${target.search}`, '/pt-br/?utm_source=test', 'query string dropped');
  assert.match(redirect.headers.get('cache-control') ?? '', /no-store/, 'redirect may be cached');
  for (const response of [redirect, await rootFetch('/', { 'accept-language': 'en-US' })]) {
    const vary = (response.headers.get('vary') ?? '').toLowerCase();
    assert.ok(vary.includes('accept-language') && vary.includes('cookie'), `${response.status} lacks Vary: Accept-Language, Cookie (${vary})`);
  }
  const english = await rootFetch('/', { 'accept-language': 'en-US' });
  assert.match(english.headers.get('content-security-policy') ?? '', /default-src 'self'/, 'root lost the _headers security headers');
  assert.match(await english.text(), /<html[^>]*lang="en"/);
  assert.equal((await rootFetch('/', { 'accept-language': 'pt-BR' }, 'HEAD')).status, 302, 'HEAD not redirected like GET');
  assert.notEqual((await rootFetch('/', { 'accept-language': 'pt-BR' }, 'POST')).status, 302, 'POST redirected');
  for (const path of ['/pt-br/', '/work/', '/about/']) {
    assert.equal((await rootFetch(path, { 'accept-language': 'pt-BR' })).status, 200, `${path} redirected`);
  }
});
await httpCheck('root language: an explicit choice is re-issued by the server (Safari caps script-set cookies at 7 days)', async () => {
  /** @type {[string, string, number][]} */
  const refreshCases = [['en', 'pt-BR', 200], ['pt', 'en-US', 302]];
  for (const [choice, acceptLanguage, status] of refreshCases) {
    const response = await rootFetch('/', { 'accept-language': acceptLanguage, cookie: `mn-lang=${choice}` });
    assert.equal(response.status, status);
    const setCookie = response.headers.get('set-cookie') ?? '';
    assert.match(setCookie, new RegExp(`^mn-lang=${choice};`), `choice ${choice} not re-issued: ${setCookie}`);
    for (const attribute of ['Path=/', 'Max-Age=31536000', 'SameSite=Lax', 'Secure']) assert.ok(setCookie.includes(attribute), `Set-Cookie lacks ${attribute}`);
  }
  for (const cookie of [null, 'mn-lang=fr', 'other=1']) {
    const response = await rootFetch('/', { 'accept-language': 'pt-BR', ...(cookie ? { cookie } : {}) });
    assert.equal(response.headers.get('set-cookie'), null, `a cookie was set without a valid choice (${cookie})`);
  }
});
await check('root language: a Portuguese browser lands on /pt-br/, and choosing English sticks', async (page) => {
  await page.goto(`${base}/`);
  assert.equal(new URL(page.url()).pathname, '/pt-br/', 'pt-BR browser not sent to /pt-br/');
  await Promise.all([page.waitForURL(`${base}/`), page.click('.header-control[data-lang-switch="en"]')]);
  assert.equal(await page.getAttribute('html', 'lang'), 'en', 'switching to English bounced back to Portuguese');
  await page.goto(`${base}/`);
  assert.equal(new URL(page.url()).pathname, '/', 'the English choice was not remembered on the next visit');
}, { locale: 'pt-BR' });
await check('root language: an English browser stays on /, and choosing Portuguese sticks', async (page) => {
  await page.goto(`${base}/`);
  assert.equal(new URL(page.url()).pathname, '/', 'en-US browser was redirected');
  await Promise.all([page.waitForURL(`${base}/pt-br/`), page.click('.header-control[data-lang-switch="pt"]')]);
  await page.goto(`${base}/`);
  assert.equal(new URL(page.url()).pathname, '/pt-br/', 'the Portuguese choice was not remembered on the next visit');
}, { locale: 'en-US' });

await check('no horizontal overflow at 360px', async (page) => {
  for (const path of ['/', '/pt-br/', '/work/', '/pt-br/work/skills/', '/about/', '/contact/']) {
    await page.goto(`${base}${path}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `horizontal overflow on ${path}`);
  }
}, { viewport: { width: 360, height: 780 } });

await browser.close();
server.close();
assert.equal(failures.length, 0, `${failures.length} browser check(s) failed: ${failures.join('; ')}`);
console.log('browser gate: all checks passed');
