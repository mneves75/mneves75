// Root language for mvneves.dev, run only for "/" (assets.run_worker_first in wrangler.jsonc). Only the default
// export may live here: workerd refuses a main module with a named export that is not a handler (see language.js).
import { choiceCookie, explicitChoice, redirectsToPortuguese } from './language.js';

const VARY = 'Accept-Language, Cookie';

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch: (request: Request) => Promise<Response> } }} env
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const choice = explicitChoice(request);
    if (url.pathname === '/' && redirectsToPortuguese(request)) {
      // Fixed path plus the request's own query: no open redirect. Never cached, since it depends on the visitor.
      const headers = new Headers({ location: `/pt-br/${url.search}`, 'cache-control': 'no-store', vary: VARY });
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
