// Post-build: replace script-src 'unsafe-inline' in dist/_headers with sha256 hashes of the
// inline scripts Astro actually emitted. Static host, so hashes — nonces need a server.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const hashes = new Set();
/** @param {string} dir */
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else if (name.endsWith('.html')) collect(readFileSync(file, 'utf8'));
  }
};
/** @param {string} html */
const collect = (html) => {
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs) || /ld\+json/.test(attrs)) continue; // external, or data blocks the browser never executes
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
};
walk(dist);
if (hashes.size === 0) throw new Error('no inline scripts found; refusing to write an unverified CSP');
const headersPath = join(dist, '_headers');
const before = readFileSync(headersPath, 'utf8');
const after = before.replace("script-src 'self' 'unsafe-inline'", `script-src 'self' ${[...hashes].join(' ')}`);
if (after === before) throw new Error("_headers has no script-src 'self' 'unsafe-inline' placeholder to replace");
writeFileSync(headersPath, after);
console.log(`csp: ${hashes.size} inline script hash(es) written to dist/_headers`);
