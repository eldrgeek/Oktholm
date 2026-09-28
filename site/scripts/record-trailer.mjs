// Records a silent, captioned walkthrough "trailer" of the built site with Playwright, as WebM.
// Convert to MP4 (and a 9:16 vertical cut) with ffmpeg afterwards; see the command printed at the end.
//   npm run preview && node scripts/record-trailer.mjs [--vertical] [--out=trailer]
import { launch } from '../tests/pw.mjs';
import { mkdirSync, renameSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vertical = process.argv.includes('--vertical');
const outName = (process.argv.find((a) => a.startsWith('--out=')) || '--out=trailer').slice(6) + (vertical ? '-vertical' : '');
const outDir = path.join(root, 'dist', 'video');
mkdirSync(outDir, { recursive: true });
const viewport = vertical ? { width: 405, height: 720 } : { width: 1280, height: 720 };
const size = vertical ? { width: 540, height: 960 } : { width: 1280, height: 720 };
const base = pathToFileURL(path.join(root, 'dist', 'index.html')).href;

const browser = await launch();
const context = await browser.newContext({ viewport, deviceScaleFactor: 1, recordVideo: { dir: outDir, size } });
const page = await context.newPage();
const wait = (ms) => page.waitForTimeout(ms);
const go = async (hash, ms = 1200) => {
  await page.evaluate((h) => (location.hash = h), hash);
  await wait(ms);
};
const has = (id) => page.evaluate((id) => (window.__pe?.modules || []).some((m) => m.id === id), id);
const clickText = async (text, ms = 600) => {
  const el = page.getByText(text, { exact: false }).first();
  if (await el.count()) {
    await el.click({ timeout: 2000 }).catch(() => {});
    await wait(ms);
    return true;
  }
  return false;
};
const smoothScroll = (y, ms = 1200) => page.evaluate(([y, ms]) => new Promise((r) => { const y0 = scrollY; const t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / ms); scrollTo(0, y0 + (y - y0) * (1 - Math.pow(1 - k, 3))); k < 1 ? requestAnimationFrame(f) : r(); })(t0); }), [y, ms]);

// Caption overlay burned into the recording (social video is watched muted).
async function caption(text) {
  await page.evaluate((text) => {
    let c = document.getElementById('__cap');
    if (!c) {
      c = document.createElement('div');
      c.id = '__cap';
      c.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;padding:10px 18px;border-radius:12px;background:rgba(0,0,0,.82);color:#fff;font:400 26px/1.1 Anton,Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 10px 30px rgba(0,0,0,.5);border:2px solid #36f59a;max-width:92vw;text-align:center';
      document.body.append(c);
    }
    c.textContent = text;
  }, text);
}

await page.goto(base + '#/');
await wait(600);
await caption('Your IT team has a condition');
await wait(2600);
await caption('Live vitals. Updated every second.');
await smoothScroll(vertical ? 1250 : 560);
await wait(1800);

await go('#/triage', 500);
await caption('Get diagnosed in two minutes');
await clickText('Begin intake', 500);
for (let i = 0; i < 12; i++) {
  const answers = await page.$$('.triage__answer');
  if (!answers.length) break;
  await answers[[2, 3, 1, 3, 2, 2, 3, 2, 2, 1, 2, 3][i]].click();
  await wait(170);
}
await page.waitForSelector('.cert', { timeout: 8000 }).catch(() => {});
await caption('Stage IV. Terminal loyalty.');
await wait(2400);
if (vertical) {
  await smoothScroll(900, 1200);
  await wait(1000);
}

if (await has('access-please')) {
  await go('#/play/access-please', 1000);
  await caption('Access, Please. Glory to Compliance.');
  await clickText('Clock in', 1100);
  for (const t of ['Open the window', 'Start shift', 'Begin', 'Next']) if (await clickText(t, 900)) break;
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press(i % 2 ? 'd' : 'a');
    await wait(900);
  }
}

if (await has('leaver')) {
  await go('#/play/leaver', 900);
  await caption('Dave rage-quit. Revoke everything.');
  await clickText('Start offboarding', 900);
  for (let i = 0; i < 22; i++) {
    const lit = await page.$$('.lv-tile.is-active');
    if (lit[0]) await lit[0].click().catch(() => {});
    await wait(240);
  }
}

if (await has('solution-builder')) {
  await go('#/play/solution-builder', 900);
  await caption('Build your own Oktholm™ solution');
  for (const t of ['Procurement said yes', 'Enterprise']) if (await clickText(t, 1400)) break;
  await smoothScroll(vertical ? 900 : 400, 1400);
  await wait(900);
}

if (await has('ransom')) {
  await go('#/play/ransom', 800);
  await caption('Your renewal came with a ransom note');
  await clickText('Open the envelope', 900);
  for (const t of ['Generate', 'Print', 'Make', 'Create', 'Demand']) if (await clickText(t, 1600)) break;
  await smoothScroll(vertical ? 700 : 320, 1200);
  await wait(900);
}

if (await has('hostage')) {
  await go('#/watch/hostage', 800);
  await caption('Hostage video. Watch his eyes.');
  if (!(await clickText('Decode his blinks', 300))) await clickText('Play', 300);
  await page.evaluate(() => document.querySelector('#room .tv-screen')?.scrollIntoView({ block: 'center' }));
  await wait(5600);
}

if (await has('intervention')) {
  await go('#/intervention', 800);
  await caption('Stage an intervention for a coworker');
  const name = page.locator('input').first();
  if (await name.count()) {
    await name.fill('');
    await name.type('Kevin', { delay: 110 });
  }
  const boxes = await page.$$('input[type=checkbox]');
  for (const b of boxes.slice(0, 3)) {
    await b.check().catch(() => {});
    await wait(200);
  }
  for (const t of ['Preview', 'Play', 'Stage']) if (await clickText(t, 300)) break;
  await wait(3800);
}

await go('#/sponsor', 700);
await caption('Refer admins. Earn chips. Win the Big Red Button.');
await smoothScroll(vertical ? 1700 : 900, 1600);
await wait(1400);

await caption('It’s not you. It’s your identity provider.');
await go('#/', 600);
await wait(2600);

const video = page.video();
await context.close();
await browser.close();
const raw = await video.path();
const dest = path.join(outDir, `${outName}.webm`);
if (existsSync(raw)) renameSync(raw, dest);
console.log(`wrote ${path.relative(root, dest)}`);
console.log(`MP4: ffmpeg -y -i ${path.relative(root, dest)} -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart ${path.relative(root, dest).replace('.webm', '.mp4')}`);
