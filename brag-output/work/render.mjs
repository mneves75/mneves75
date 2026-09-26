// Usage: node render.mjs stills t1 t2 ...   |   node render.mjs frames
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
const mode = process.argv[2];
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--hide-scrollbars', '--force-color-profile=srgb'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light' });
p.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
p.on('pageerror', (e) => console.error('pageerror:', e.message));
await p.goto('http://localhost:4789/__brag/', { waitUntil: 'load' });
await p.evaluate(() => window.ready);
const motion = await p.evaluate(() => document.getElementById('f-home').contentDocument.documentElement.dataset.motion ?? 'off');
console.error('iframe data-motion:', motion);
if (mode === 'stills') {
  mkdirSync('stills', { recursive: true });
  for (const t of process.argv.slice(3).map(Number)) {
    await p.evaluate((t) => window.renderAt(t), t);
    await p.screenshot({ path: `stills/t${t.toFixed(2)}.png` });
  }
} else {
  mkdirSync('frames', { recursive: true });
  const fps = 30; const dur = await p.evaluate(() => window.DURATION); const n = Math.round(dur * fps);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => window.renderAt(t), i / fps);
    await p.screenshot({ path: `frames/f${String(i).padStart(4, '0')}.png` });
    if (i % 60 === 0) console.error(`frame ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}
await b.close();
