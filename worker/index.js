// Root language for mvneves.dev. wrangler.jsonc runs this Worker only for `/` (`run_worker_first: ["/"]`); every
// other path is served straight from the static assets. `/` is the English page and the hreflang x-default. An
// arrival there from a browser that prefers Portuguese goes to /pt-br/, unless the visitor chose a language with the
// site's language control. Internal navigation never redirects, so the control always works, and crawlers, which
// send no Accept-Language, get English. Only the default export may live here (see language.js).
import { redirectsToPortuguese } from './language.js';

const VARY = 'Accept-Language, Cookie';

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch: (request: Request) => Promise<Response> } }} env
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/' && redirectsToPortuguese(request)) {
      // Fixed path plus the request's own query: no open redirect. Never cached, since it depends on the visitor.
      return new Response(null, {
        status: 302,
        headers: { location: `/pt-br/${url.search}`, 'cache-control': 'no-store', vary: VARY },
      });
    }
    const response = await env.ASSETS.fetch(request);
    if (url.pathname !== '/') return response;
    // The English root must not be reused for a visitor who would have been redirected.
    const varied = new Response(response.body, response);
    varied.headers.append('vary', VARY);
    return varied;
  },
};
