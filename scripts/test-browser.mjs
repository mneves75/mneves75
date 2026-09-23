// Browser gate: drives the built site in real Chrome with the CSP from dist/_headers enforced.
// The route test only reads static HTML; every JS bug fixed in 1.6.x slipped past it.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

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

const server = createServer((req, res) => {
  let path;
  try { path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.writeHead(400).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  const found = existsSync(file);
  if (!found) file = notFoundFile(path);
  res.writeHead(found ? 200 : 404, { ...headersFor(path), 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
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
/**
 * @param {string} name @param {(page: import('playwright-core').Page) => Promise<void>} fn
 * @param {import('playwright-core').BrowserContextOptions} [options]
 * @param {{ plantsViolations?: boolean, visitsMissingRoutes?: boolean }} [flags] opt out of the console-error assertion
 *   for violations the check plants itself, or tolerate the 404 document load of a deliberately missing route
 */
const check = async (name, fn, options = {}, { plantsViolations = false, visitsMissingRoutes = false } = {}) => {
  const context = await browser.newContext(options);
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
    failures.push(name);
    console.error(`  FAIL ${name}\n       ${error instanceof Error ? error.message.split('\n').join('\n       ') : String(error)}`);
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
