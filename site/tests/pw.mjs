// Playwright helpers for local checks. Uses the preinstalled Chromium in this environment.
//   node tests/pw.mjs dist/dev/<id>.html out.png [--width=390] [--height=844] [--wait=1500] [--click=<css>]... [--eval=<js>]
import { chromium } from 'playwright';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function launch() {
  try {
    return await chromium.launch();
  } catch {
    const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
    const dir = readdirSync(base).filter((d) => d.startsWith('chromium-')).sort().pop();
    const exe = [path.join(base, dir, 'chrome-linux', 'chrome'), path.join(base, dir, 'chrome-linux64', 'chrome'), '/opt/pw-browsers/chromium'].find(existsSync);
    return chromium.launch({ executablePath: exe });
  }
}

/** Opens a page, collecting console errors and page errors in page.__errors */
export async function open(browser, target, { width = 1280, height = 800 } = {}) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.__errors = [];
  page.on('pageerror', (e) => page.__errors.push('pageerror: ' + e.message));
  page.on('console', (m) => m.type() === 'error' && page.__errors.push('console: ' + m.text()));
  // pathToFileURL would percent-encode "?" and "#", so split the query and hash off the file path first.
  const [beforeHash, hash] = target.split('#');
  const [file, query] = beforeHash.split('?');
  const url = /^https?:/.test(target) ? target : pathToFileURL(path.resolve(file)).href + (query ? '?' + query : '') + (hash ? '#' + hash : '');
  await page.goto(url);
  return page;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [target, out = 'shot.png', ...rest] = process.argv.slice(2);
  const opt = (k, d) => (rest.find((a) => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=') || d;
  const browser = await launch();
  const page = await open(browser, target, { width: Number(opt('width', 1280)), height: Number(opt('height', 800)) });
  await page.waitForTimeout(Number(opt('wait', 800)));
  for (const a of rest.filter((a) => a.startsWith('--click='))) {
    await page.click(a.slice(8));
    await page.waitForTimeout(400);
  }
  const ev = opt('eval', '');
  if (ev) console.log('eval:', await page.evaluate(ev));
  await page.screenshot({ path: out, fullPage: rest.includes('--full') });
  console.log(page.__errors.length ? page.__errors.join('\n') : 'no console errors');
  await browser.close();
}
