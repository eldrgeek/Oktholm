// Voice pipeline CLI: renders the brand's spoken lines with ElevenLabs into brands/<id>/voice/ (committed;
// the site plays those files and never calls the API). Calls that hit the API need ELEVENLABS_API_KEY.
//
//   node scripts/voices.mjs lines                     what will be spoken: lines, characters, cost
//   node scripts/voices.mjs harvest [--days=60]       run every show in harvest mode and record its lines
//   node scripts/voices.mjs cast [--roles=a,b]        design 3 preview voices per role that has none -> voice-work/casting/
//   node scripts/voices.mjs pick paramedic=B doctor=A save the chosen previews as voices -> brands/<id>/voices.json
//   node scripts/voices.mjs render [--only=a,b] [--limit=N] [--dry-run]
//   node scripts/voices.mjs sfx [--force]             sound cues listed in brand.cast.sounds
//   node scripts/voices.mjs prune                     delete clips that no line uses
//
// BRAND=<id> picks the brand pack (default oktholm). ELEVENLABS_BASE_URL overrides the API host (tests).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { collectLines, estimate, render, cast, pick, sfx, prune, readManifest } from './lib/voices.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [cmd = 'lines', ...rest] = process.argv.slice(2);
const flag = (k, d) => {
  const a = rest.find((x) => x === `--${k}` || x.startsWith(`--${k}=`));
  if (!a) return d;
  return a.includes('=') ? a.split('=').slice(1).join('=') : true;
};
const brandId = process.env.BRAND || flag('brand', 'oktholm');
const brandDir = path.join(root, 'brands', brandId);
const brand = (await import(pathToFileURL(path.join(brandDir, 'index.js')).href)).default;
const voiceDir = path.join(brandDir, 'voice');
const workDir = path.join(root, 'voice-work', brandId);
const voicesFile = path.join(brandDir, 'voices.json');
const readJson = async (f, d) => (existsSync(f) ? JSON.parse(await readFile(f, 'utf8')) : d);
const harvested = await readJson(path.join(workDir, 'harvest.json'), []);
const voices = await readJson(voicesFile, {});
const roles = brand.cast?.roles || {};
const api = () => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY is not set. Add it to the environment (never commit it).');
    process.exit(2);
  }
  return { apiKey, base: process.env.ELEVENLABS_BASE_URL || undefined, log: console.log };
};

const lines = collectLines(brand, harvested);

if (cmd === 'lines') {
  const manifest = await readManifest(voiceDir);
  const todo = lines.filter((l) => !manifest.clips[l.key]);
  const all = estimate(lines, { pricePer1k: 0.08 });
  const left = estimate(todo, { pricePer1k: 0.08 });
  console.log(`brand ${brandId}: ${all.lines} lines, ${all.chars.toLocaleString()} characters (${harvested.length ? 'including' : 'not including'} harvested show lines)`);
  console.log(`rendered: ${all.lines - left.lines}; to render: ${left.lines} lines, ${left.chars.toLocaleString()} chars`);
  console.log(`cost to render, one take: $${left.usd} at $0.08/1K (v4 list); $${estimate(todo, { pricePer1k: 0.022 }).usd} at the v4 launch price`);
  console.log('by role:', Object.entries(left.byRole).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} ${n}`).join(', ') || '—');
  const noVoice = [...new Set(todo.map((l) => l.role))].filter((r) => !voices[r] && !roles[r]?.voiceId);
  if (noVoice.length) console.log(`roles without a voice yet (run "cast", then "pick"): ${noVoice.join(', ')}`);
} else if (cmd === 'harvest') {
  await harvest(Number(flag('days', 60)));
} else if (cmd === 'cast') {
  const only = flag('roles', '') ? String(flag('roles')).split(',') : null;
  const todo = Object.fromEntries(Object.entries(roles).filter(([id, r]) => (only ? only.includes(id) : !voices[id] && !r.voiceId) && r.design));
  if (!Object.keys(todo).length) console.log('Every role has a voice. Use --roles=a,b to recast.');
  else {
    await cast(todo, { ...api(), workDir: path.join(workDir, 'casting') });
    console.log(`Previews in ${path.relative(root, path.join(workDir, 'casting'))}/index.html — reply with picks, then run "pick".`);
  }
} else if (cmd === 'pick') {
  const picks = Object.fromEntries(rest.filter((a) => a.includes('=') && !a.startsWith('--')).map((a) => a.split('=')));
  const record = await readJson(path.join(workDir, 'casting', 'casting.json'), {});
  const chosen = await pick(picks, roles, record, api());
  await writeFile(voicesFile, JSON.stringify({ ...voices, ...chosen }, null, 1) + '\n');
  console.log('saved', Object.keys(chosen).join(', '), '->', path.relative(root, voicesFile));
} else if (cmd === 'render') {
  const dryRun = Boolean(flag('dry-run', false));
  const opts = dryRun ? { log: console.log } : api();
  const only = flag('only', '') ? String(flag('only')).split(',') : null;
  const r = await render(lines, { ...opts, dir: voiceDir, cast: brand.cast, voices, dryRun, only, limit: flag('limit') ? Number(flag('limit')) : undefined });
  console.log(`${dryRun ? 'would render' : 'rendered'} ${r.rendered}, already done ${r.skipped}${r.missingVoice.length ? `, no voice for: ${r.missingVoice.join(', ')}` : ''}${r.errors.length ? `, ${r.errors.length} errors` : ''}`);
  if (r.errors.length) process.exitCode = 1;
} else if (cmd === 'sfx') {
  await mkdir(voiceDir, { recursive: true });
  await sfx(brand.cast?.sounds || [], { ...api(), dir: voiceDir, force: Boolean(flag('force', false)) });
} else if (cmd === 'prune') {
  console.log(`removed ${await prune(lines, voiceDir)} files`);
} else {
  console.error(`unknown command "${cmd}"`);
  process.exit(2);
}

// Runs each voiced show in a dev harness with ?harvest=1 (speech records every line and skips audio), once per
// day across the daily rotation, so headline-driven lines are covered too.
async function harvest(days) {
  const { launch } = await import('../tests/pw.mjs');
  const shows = Object.keys(brand.modules || {}).filter((id) => ['commercial', 'hostage', 'intervention', 'news', 'hold'].includes(id));
  const epoch = Date.parse((brand.epoch || '2026-09-01') + 'T12:00:00Z');
  const browser = await launch();
  const found = new Map();
  for (const id of shows) {
    execFileSync(process.execPath, ['build.mjs', `--game=${id}`], { cwd: root, stdio: 'ignore', env: { ...process.env, BRAND: brandId } });
    const file = pathToFileURL(path.join(root, 'dist', 'dev', `${id}.html`)).href;
    const runs = ['news', 'hostage'].includes(id) ? days : Math.min(days, 7);
    for (let day = 0; day < runs; day++) {
      const page = await browser.newPage();
      // Shift the clock to day N of the rotation but let it keep running (the shows time themselves with it).
      await page.addInitScript((offset) => {
        const RealDate = Date;
        const now = () => RealDate.now() + offset;
        class ShiftedDate extends RealDate {
          constructor(...a) {
            super(...(a.length ? a : [now()]));
          }
          static now() {
            return now();
          }
        }
        globalThis.Date = ShiftedDate;
      }, epoch + day * 864e5 - Date.now());
      await page.goto(`${file}?mode=tv&harvest=1&fast=20`);
      let last = -1;
      for (let t = 0; t < 40; t++) {
        await page.waitForTimeout(500);
        const n = await page.evaluate(() => (window.__voiceLines || []).length);
        if (n === last && n > 0 && t > 6) break;
        last = n;
      }
      for (const l of await page.evaluate(() => window.__voiceLines || [])) found.set(`${l.role}|${l.text}`, l);
      await page.close();
    }
    console.log(`  ${id}: ${[...found.values()].length} lines so far`);
  }
  await browser.close();
  await mkdir(workDir, { recursive: true });
  await writeFile(path.join(workDir, 'harvest.json'), JSON.stringify([...found.values()], null, 1));
  console.log(`harvested ${found.size} lines -> ${path.relative(root, path.join(workDir, 'harvest.json'))}`);
}
