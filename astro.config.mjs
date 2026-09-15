import { rename, rmdir } from 'node:fs/promises';
import { defineConfig } from 'astro/config';

/**
 * Cloudflare's `not_found_handling: "404-page"` serves the nearest `404.html`; Astro emits the pt-BR one as `pt-br/404/index.html`.
 * @type {import('astro').AstroIntegration}
 */
const localizedNotFound = {
  name: 'localized-404',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const locale = new URL('pt-br/', dir);
      await rename(new URL('404/index.html', locale), new URL('404.html', locale));
      await rmdir(new URL('404/', locale));
    },
  },
};

export default defineConfig({
  site: 'https://mvneves.dev',
  output: 'static',
  // External stylesheets only: the CSP has no style-src 'unsafe-inline' (scripts/test-routes.mjs asserts it).
  build: { format: 'directory', inlineStylesheets: 'never' },
  trailingSlash: 'always',
  integrations: [localizedNotFound],
});
