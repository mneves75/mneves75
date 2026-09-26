// Root language for mvneves.dev, run only for "/" and "/lang" (assets.run_worker_first in wrangler.jsonc). Only the
// default export may live here: workerd refuses a main module with a named export that is not a handler (see
// language.js).
import { choiceCookie, explicitChoice, isLanguage, isSameOrigin, redirectsToPortuguese } from './language.js';

const VARY = 'Accept-Language, Cookie';
// Describe the root page's body, not the site: never copied onto a response the Worker builds itself.
const PAGE_ONLY = new Set(['content-type', 'content-length', 'content-encoding', 'etag', 'last-modified', 'cache-control', 'vary', 'age', 'accept-ranges', 'date']);

/**
 * The headers every response of this site carries (public/_headers "/*": CSP, HSTS, framing, CORP…). _headers applies
 * only to asset responses, so the Worker borrows them from the root page instead of keeping a second copy.
 * @param {Request} request
 * @param {{ ASSETS: { fetch: (request: Request) => Promise<Response> } }} env
 */
async function siteHeaders(request, env) {
  const page = await env.ASSETS.fetch(new Request(new URL('/', request.url), { method: 'HEAD' }));
  const headers = new Headers();
  for (const [name, value] of page.headers) if (!PAGE_ONLY.has(name)) headers.set(name, value);
  return headers;
}

/**
 * POST /lang?set=en|pt, sent by the language control on click: the choice as an HTTP cookie, which Safari keeps its
 * full year (a document.cookie one only 7 days). Only the site's own pages may set it.
 * @param {Request} request
 * @param {Headers} headers
 */
function storeChoice(request, headers) {
  headers.set('cache-control', 'no-store');
  if (request.method !== 'POST') {
    headers.set('allow', 'POST');
    return new Response(null, { status: 405, headers });
  }
  if (!isSameOrigin(request)) return new Response(null, { status: 403, headers });
  const choice = new URL(request.url).searchParams.get('set');
  if (!isLanguage(choice)) return new Response(null, { status: 400, headers });
  headers.append('set-cookie', choiceCookie(choice));
  return new Response(null, { status: 204, headers });
}

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch: (request: Request) => Promise<Response> } }} env
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/lang') return storeChoice(request, await siteHeaders(request, env));
    const choice = explicitChoice(request);
    if (url.pathname === '/' && redirectsToPortuguese(request)) {
      // Fixed path plus the request's own query: no open redirect. Never cached, since it depends on the visitor.
      const headers = await siteHeaders(request, env);
      headers.set('location', `/pt-br/${url.search}`);
      headers.set('cache-control', 'no-store');
      headers.set('vary', VARY);
      if (choice) headers.append('set-cookie', choiceCookie(choice));
      return new Response(null, { status: 302, headers });
    }
    const response = await env.ASSETS.fetch(request);
    if (url.pathname !== '/') return response;
    // The English root must not be reused for a visitor who would have been redirected.
    const varied = new Response(response.body, response);
    varied.headers.append('vary', VARY);
    if (choice) {
      varied.headers.append('set-cookie', choiceCookie(choice));
      varied.headers.set('cache-control', 'private, max-age=0, must-revalidate');
    }
    return varied;
  },
};
