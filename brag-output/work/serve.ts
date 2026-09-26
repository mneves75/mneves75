// Serves the built site (dist/) at / and the composition at /__brag/ on one origin,
// so the composition can script same-origin iframes of the real pages.
import { join, normalize } from 'node:path';
const repo = join(import.meta.dir, '..', '..');
const dist = join(repo, 'dist');
const comp = join(import.meta.dir, 'composition');
Bun.serve({
  port: Number(process.env.PORT ?? 4789),
  async fetch(req) {
    let p = decodeURIComponent(new URL(req.url).pathname);
    let root = dist;
    if (p.startsWith('/__brag/')) { root = comp; p = p.slice('/__brag'.length); }
    if (p.endsWith('/')) p += 'index.html';
    const file = Bun.file(join(root, normalize(p)));
    if (await file.exists()) return new Response(file);
    return new Response('not found', { status: 404 });
  },
});
console.log('ready');
