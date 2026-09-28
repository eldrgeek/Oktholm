// Smoke test: every room and every enabled module renders without console errors or horizontal
// overflow, at desktop and phone widths. Run after `npm run build` (or `npm run preview`).
//   node tests/smoke.mjs [--shots=<dir>]
import { launch, open } from './pw.mjs';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const shots = (process.argv.find((a) => a.startsWith('--shots=')) || '').slice(8);
if (shots && !existsSync(shots)) mkdirSync(shots, { recursive: true });
const target = path.resolve('dist/index.html');
if (!existsSync(target)) {
  console.error('dist/index.html missing: run npm run build first');
  process.exit(1);
}
const rooms = ['/', '/triage', '/arcade', '/tv', '/intervention', '/sponsor', '/therapy', '/dsm', '/gazette', '/cure', '/does-not-exist'];
const browser = await launch();
let failures = 0;
for (const width of [1280, 390]) {
  const page = await open(browser, target, { width, height: width > 600 ? 860 : 844 });
  await page.waitForTimeout(600);
  const mods = await page.evaluate(() => window.__pe?.modules || []);
  const routes = [...rooms, ...mods.filter((m) => m.id !== 'intervention').map((m) => `/${m.kind === 'show' ? 'watch' : 'play'}/${m.id}`)];
  for (const r of routes) {
    const before = page.__errors.length;
    await page.evaluate((r) => (location.hash = '#' + r), r);
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const empty = await page.evaluate(() => (document.getElementById('room')?.innerText || '').trim().length < 20);
    const errs = page.__errors.slice(before);
    const ok = overflow <= 0 && !empty && errs.length === 0;
    if (!ok) failures++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${String(width).padEnd(4)} ${r}${overflow > 0 ? ` overflow=${overflow}px` : ''}${empty ? ' (empty room)' : ''}${errs.length ? '\n       ' + errs.join('\n       ') : ''}`);
    if (shots) await page.screenshot({ path: path.join(shots, `${width}-${r.replace(/\W+/g, '_') || 'lobby'}.png`) });
  }
  await page.close();
}
await browser.close();
console.log(failures ? `\n${failures} failure(s)` : '\nall clear');
process.exit(failures ? 1 : 0);
