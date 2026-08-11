import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mvneves.dev',
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'always',
});
