// Root language decision for worker/index.js. Kept apart because workerd treats every named export of the main
// module as an entrypoint and refuses the Worker when one is not a handler.

const LANGUAGE_COOKIE = 'mn-lang';
// RFC 9110 §12.4.2: qvalue = ( "0" [ "." 0*3DIGIT ] ) / ( "1" [ "." 0*3("0") ] ). Number() alone accepts 1e0 or 0x1.
const QVALUE = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/;

/** @param {unknown} value @returns {value is 'en' | 'pt'} */
const isLanguage = (value) => value === 'en' || value === 'pt';

/**
 * Portuguese when the browser's top language is Portuguese (any pt-* tag), English for everything else: the owner's
 * rule, "pt-br or other → us". Top: highest q, the first listed on a tie; q=0 excludes; a range whose q is not a valid
 * qvalue is ignored; `*` names no language.
 * @param {string | null} header
 * @returns {'en' | 'pt'}
 */
export function negotiate(header) {
  let top = '';
  let topQ = 0;
  for (const part of (header ?? '').split(',')) {
    const [range = '', ...params] = part.split(';').map((piece) => piece.trim().toLowerCase());
    if (!range) continue;
    const qParam = params.find((param) => param.startsWith('q='));
    if (qParam !== undefined && !QVALUE.test(qParam.slice(2))) continue;
    const q = qParam === undefined ? 1 : Number(qParam.slice(2));
    if (q > topQ) {
      top = range;
      topQ = q;
    }
  }
  return top.split('-')[0] === 'pt' ? 'pt' : 'en';
}

/** @param {string | null} header @param {string} name */
function readCookie(header, name) {
  for (const pair of (header ?? '').split(';')) {
    const [key, ...value] = pair.split('=');
    if (key?.trim() === name) return value.join('=').trim();
  }
  return null;
}

/**
 * The language the visitor picked with the site's language control, if any.
 * @param {Request} request
 * @returns {'en' | 'pt' | null}
 */
export function explicitChoice(request) {
  const value = readCookie(request.headers.get('cookie'), LANGUAGE_COOKIE);
  return isLanguage(value) ? value : null;
}

/**
 * The choice as a server-set cookie. BaseLayout.astro writes it with document.cookie, which Safari keeps only 7 days;
 * the same cookie re-issued by the server keeps its year.
 * @param {'en' | 'pt'} choice
 */
export function choiceCookie(choice) {
  return `${LANGUAGE_COOKIE}=${choice}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
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
 * An arrival at / that should see /pt-br/: the explicit choice wins; without one, the browser's top language decides.
 * @param {Request} request
 */
export function redirectsToPortuguese(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  if (isInternalNavigation(request)) return false;
  const choice = explicitChoice(request);
  if (choice) return choice === 'pt';
  return negotiate(request.headers.get('accept-language')) === 'pt';
}
