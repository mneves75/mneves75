import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
for (const [name, url] of [['home','/'],['work','/work/'],['hay','/work/hay/'],['pt','/pt-br/']]) {
  await p.goto('http://localhost:4789' + url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `ref/${name}.png`, fullPage: true });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  const marks = await p.evaluate(() => [...document.querySelectorAll('h1,h2,.term,.index-row,.stage-badge')].slice(0,40).map(e => `${e.tagName}.${e.className.toString().split(' ')[0]} y=${Math.round(e.getBoundingClientRect().top + scrollY)} "${e.textContent.trim().slice(0,50)}"`));
  console.log(name, h); console.log(marks.join('\n'));
}
await b.close();
