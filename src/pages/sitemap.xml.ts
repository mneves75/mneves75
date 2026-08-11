import type { APIRoute } from 'astro';
import { href, localeConfig, projects, site } from '../data/site';

// Generated from `projects` so a new entry can never be missing from the sitemap.
const locales = Object.keys(localeConfig) as (keyof typeof localeConfig)[];
const pages = ['', '/work/', '/about/', '/recommendations/', '/contact/'];

const urls = [
  ...locales.flatMap((locale) => pages.map((page) => href(locale, page))),
  ...locales.flatMap((locale) => projects.map((project) => href(locale, `/work/${project.slug}/`))),
].map((path) => `${site.domain}${path}`);

export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((url) => `  <url><loc>${url}</loc></url>`)
      .join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
