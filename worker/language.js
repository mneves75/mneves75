// Root language decision for worker/index.js. Kept apart because workerd treats every named export of the main
// module as an entrypoint and refuses the Worker when one is not a handler.

const LANGUAGE_COOKIE = 'mn-lang';

/**
 * Best of the two site languages for an Accept-Language header (RFC 9110 §12.5.4): highest q wins, the first listed
 * wins a tie, q=0 excludes, a malformed or out-of-range q is ignored. English when nothing matches.
 * @param {string | null} header
 * @returns {'en' | 'pt'}
 */
export function negotiate(header) {
  /** @type {'en' | 'pt'} */
  let best = 'en';
  let bestQ = 0;
  for (const part of (header ?? '').split(',')) {
    const [range = '', ...params] = part.split(';').map((piece) => piece.trim().toLowerCase());
    const primary = range.split('-')[0];
    if (primary !== 'en' && primary !== 'pt') continue;
    const qParam = params.find((param) => param.startsWith('q='));
    const q = qParam === undefined ? 1 : Number(qParam.slice(2));
    if (!Number.isFinite(q) || q <= 0 || q > 1) continue;
    if (q > bestQ) {
      best = primary;
      bestQ = q;
    }
  }
  return best;
}

/** @param {string | null} header @param {string} name */
function cookie(header, name) {
  for (const pair of (header ?? '').split(';')) {
    const [key, ...value] = pair.split('=');
    if (key?.trim() === name) return value.join('=').trim();
  }
  return null;
}

/** A click on a link of this site: never redirect it. @param {Request} request */
function isInternalNavigation(request) {
  const site = request.headers.get('sec-fetch-site');
  if (site) return site === 'same-origin';
  // Browsers without Fetch Metadata: the site sends a same-origin Referer (strict-origin-when-cross-origin).
  const referer = request.headers.get('referer');
  if (!referer) return false;
  try {
    return new URL(referer).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

/**
 * An arrival at / that should see /pt-br/: the visitor's explicit choice (the `mn-lang` cookie set by the language
 * control in BaseLayout.astro) wins; without one, the browser's Accept-Language decides.
 * @param {Request} request
 */
export function redirectsToPortuguese(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  if (isInternalNavigation(request)) return false;
  const choice = cookie(request.headers.get('cookie'), LANGUAGE_COOKIE);
  if (choice === 'en' || choice === 'pt') return choice === 'pt';
  return negotiate(request.headers.get('accept-language')) === 'pt';
}
