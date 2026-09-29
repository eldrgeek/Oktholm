// Voice pipeline library (used by scripts/voices.mjs and tests). Renders a brand's spoken lines with the
// ElevenLabs API into brands/<id>/voice/: one mp3 per line plus manifest.json, which the site's speech
// service reads at runtime (src/engine/speech.js). Nothing calls ElevenLabs from the browser.
//
// Lines come from two places:
//   1. brand data that declares its speech (cold open, Intake, captor voice notes, sound cues)
//   2. voice-work/harvest.json: lines recorded by running the shows in harvest mode (scripts/voices.mjs harvest)

import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { lineKey, stripTags } from '../../src/engine/speech.js';

export const API = 'https://api.elevenlabs.io';

/** Every line the brand's own data says will be spoken: [{ role, text, context? }] */
export function brandLines(brand) {
  const c = brand.content || {};
  const out = [];
  const push = (role, text, extra = {}) => text && out.push({ role, text: String(text).replace(/\s+/g, ' ').trim(), ...extra });
  const adm = c.admission || {};
  if (adm.wake) {
    push(adm.wake.voice || 'paramedic', adm.wake.say);
    if (adm.wake.afterTap) push(adm.wake.afterTap.voice || adm.wake.voice || 'paramedic', adm.wake.afterTap.say);
  }
  for (const scene of adm.scenes || [])
    scene.lines?.forEach((l, i, arr) => push(l.voice, l.say, { scene: scene.id, prev: arr[i - 1]?.say, next: arr[i + 1]?.say }));
  for (const p of adm.pages || []) push('pa', p);
  // Intake speaks its greetings, denial replies and the tour. Command output stays text (it's a terminal joke),
  // and the distress reply is never performed.
  const intake = c.intake || {};
  const iv = intake.voice || 'intake';
  const t = intake.tour || {};
  for (const l of [...(intake.greeting || []), ...(intake.greetingAlt || []), intake.referredGreeting, intake.returningGreeting, ...(intake.denial?.lines || []), t.intro, ...(t.stops || []).map((s) => s.say), t.outro]) push(iv, l);
  const captor = c.captor || {};
  for (const x of captor.texts || []) {
    if (x.voice) push(captor.voice || 'captor', x.voice);
    if (x.call?.say) push(captor.voice || 'captor', x.call.say);
  }
  return out;
}

/** Merge brand lines with harvested lines; dedupe by manifest key. */
export function collectLines(brand, harvested = []) {
  const aliases = brand.cast?.aliases || {};
  const seen = new Map();
  for (const l of [...brandLines(brand), ...harvested]) {
    const role = aliases[l.role] || l.role;
    const key = lineKey(role, l.text);
    if (!seen.has(key)) seen.set(key, { ...l, role, key });
  }
  return [...seen.values()];
}

/** Characters billed per line: ElevenLabs bills the text sent, tags included. */
export function estimate(lines, { pricePer1k = 0.08, takes = 1 } = {}) {
  const byRole = {};
  let chars = 0;
  for (const l of lines) {
    byRole[l.role] = (byRole[l.role] || 0) + l.text.length;
    chars += l.text.length;
  }
  return { lines: lines.length, chars, byRole, usd: +(((chars * takes) / 1000) * pricePer1k).toFixed(2) };
}

export async function readManifest(dir) {
  try {
    return JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
  } catch {
    return { v: 1, clips: {}, sfx: {} };
  }
}

async function call(opts, route, body) {
  const res = await (opts.fetch || fetch)(`${opts.base || API}${route}`, {
    method: 'POST',
    headers: { 'xi-api-key': opts.apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${route} → ${res.status} ${detail.slice(0, 300)}`);
  }
  return res;
}

/**
 * Render every line that has no clip yet. Returns { rendered, skipped, missingVoice, errors }.
 *   opts: { apiKey, base, fetch, dir, cast, format, dryRun, only, limit, log }
 */
export async function render(lines, opts) {
  const { dir, cast = {} } = opts;
  const log = opts.log || (() => {});
  const manifest = await readManifest(dir);
  const voices = opts.voices || {};
  const result = { rendered: 0, skipped: 0, missingVoice: new Set(), errors: [] };
  await mkdir(dir, { recursive: true });
  let budget = opts.limit ?? Infinity;
  for (const l of lines) {
    if (opts.only && !opts.only.includes(l.role)) continue;
    if (manifest.clips[l.key] && existsSync(path.join(dir, manifest.clips[l.key].f))) {
      result.skipped++;
      continue;
    }
    const role = cast.roles?.[l.role] || {};
    const voiceId = voices[l.role] || role.voiceId;
    if (!voiceId) {
      result.missingVoice.add(l.role);
      continue;
    }
    if (budget-- <= 0) break;
    if (opts.dryRun) {
      result.rendered++;
      continue;
    }
    try {
      const res = await call(opts, `/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=${opts.format || cast.format || 'mp3_44100_64'}`, {
        text: l.text,
        model_id: role.model || cast.model || 'eleven_v4',
        ...(role.settings ? { voice_settings: role.settings } : {}),
        ...(l.prev ? { previous_text: l.prev } : {}),
        ...(l.next ? { next_text: l.next } : {}),
      });
      const json = await res.json();
      const audio = Buffer.from(json.audio_base64, 'base64');
      const ends = json.alignment?.character_end_times_seconds || [];
      const d = +((ends.length ? ends[ends.length - 1] : stripTags(l.text).split(/\s+/).length / 2.7) + 0.15).toFixed(2);
      const f = `${l.key}-${createHash('sha1').update(audio).digest('hex').slice(0, 6)}.mp3`;
      await writeFile(path.join(dir, f), audio);
      manifest.clips[l.key] = { f, d, r: l.role, t: stripTags(l.text).slice(0, 80) };
      result.rendered++;
      log(`  ✓ ${l.role.padEnd(12)} ${d.toFixed(1)}s  ${stripTags(l.text).slice(0, 70)}`);
      // Save as we go: a long run that dies halfway keeps what it paid for.
      await writeManifest(dir, manifest);
    } catch (e) {
      result.errors.push(`${l.role}: ${e.message}`);
      log(`  ✗ ${l.role}: ${e.message}`);
    }
  }
  if (!opts.dryRun) await writeManifest(dir, manifest);
  result.missingVoice = [...result.missingVoice];
  return result;
}

export async function writeManifest(dir, manifest) {
  manifest.v = 1;
  manifest.generated = new Date().toISOString();
  await writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
}

/** Delete clips no line refers to any more. */
export async function prune(lines, dir) {
  const manifest = await readManifest(dir);
  const keep = new Set(lines.map((l) => l.key));
  let removed = 0;
  for (const [k, c] of Object.entries(manifest.clips)) {
    if (keep.has(k)) continue;
    await rm(path.join(dir, c.f), { force: true });
    delete manifest.clips[k];
    removed++;
  }
  const referenced = new Set([...Object.values(manifest.clips), ...Object.values(manifest.sfx || {})].map((c) => c.f));
  for (const f of existsSync(dir) ? readdirSync(dir) : []) {
    if (f.endsWith('.mp3') && !referenced.has(f)) {
      await rm(path.join(dir, f), { force: true });
      removed++;
    }
  }
  await writeManifest(dir, manifest);
  return removed;
}

/**
 * Voice design ("casting"): three previews per role that has no voice yet, for a human to pick by ear.
 * Writes previews + casting.json + index.html into workDir. Returns the casting record.
 */
export async function cast(roles, opts) {
  const { workDir } = opts;
  await mkdir(workDir, { recursive: true });
  const record = {};
  for (const [id, r] of Object.entries(roles)) {
    const sample = [r.sample, ...(r.samples || [])].filter(Boolean).join(' ');
    const text = sample.length >= 100 ? sample.slice(0, 1000) : (sample + ' ' + 'This is a voice test for Oktholm General. Please hold. Your call is important to us.').slice(0, 1000);
    const res = await call(opts, '/v1/text-to-voice/design', { voice_description: r.design, model_id: opts.designModel || 'eleven_ttv_v3', text });
    const json = await res.json();
    record[id] = [];
    for (const [i, p] of (json.previews || []).slice(0, 3).entries()) {
      const f = `${id}-${'abc'[i]}.mp3`;
      await writeFile(path.join(workDir, f), Buffer.from(p.audio_base_64, 'base64'));
      record[id].push({ option: 'ABC'[i], generated_voice_id: p.generated_voice_id, file: f, secs: p.duration_secs });
    }
    opts.log?.(`  cast ${id}: ${record[id].length} previews`);
  }
  await writeFile(path.join(workDir, 'casting.json'), JSON.stringify(record, null, 1));
  await writeFile(path.join(workDir, 'index.html'), castingPage(roles, record));
  return record;
}

/** Save the chosen previews as voices. picks: { role: 'A'|'B'|'C' }. Returns { role: voiceId }. */
export async function pick(picks, roles, record, opts) {
  const out = {};
  for (const [id, letter] of Object.entries(picks)) {
    const p = record[id]?.find((x) => x.option === String(letter).toUpperCase());
    if (!p) throw new Error(`No preview ${letter} for ${id}`);
    const res = await call(opts, '/v1/text-to-voice', { voice_name: `${opts.prefix || 'OKT'} ${roles[id]?.label || id}`, voice_description: roles[id]?.design || id, generated_voice_id: p.generated_voice_id });
    out[id] = (await res.json()).voice_id;
  }
  return out;
}

/** Sound cues (stingers, ambience) via the sound-effects API. cues: [{ id, prompt, seconds }] */
export async function sfx(cues, opts) {
  const manifest = await readManifest(opts.dir);
  manifest.sfx = manifest.sfx || {};
  for (const q of cues) {
    if (manifest.sfx[q.id] && !opts.force) continue;
    const res =
      q.kind === 'music'
        ? await call(opts, '/v1/music', { prompt: q.prompt, music_length_ms: Math.round((q.seconds || 6) * 1000) })
        : await call(opts, '/v1/sound-generation', { text: q.prompt, ...(q.seconds ? { duration_seconds: q.seconds } : {}), prompt_influence: q.influence ?? 0.5 });
    const audio = Buffer.from(await res.arrayBuffer());
    const f = `sfx-${q.id}-${createHash('sha1').update(audio).digest('hex').slice(0, 6)}.mp3`;
    await writeFile(path.join(opts.dir, f), audio);
    manifest.sfx[q.id] = { f, d: q.seconds || null };
    opts.log?.(`  ♪ ${q.id}`);
  }
  await writeManifest(opts.dir, manifest);
}

function castingPage(roles, record) {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Casting call</title><style>body{margin:0;background:#070a0f;color:#e9f0f7;font:16px/1.5 system-ui,sans-serif;padding:24px 16px 80px}main{max-width:860px;margin:0 auto}
h1{font:800 34px/1 system-ui;margin:0 0 6px}.role{border:1px solid #2b3e55;border-radius:14px;padding:16px;margin:16px 0;background:#0f1620}.role h2{margin:0;font-size:20px}
.d{color:#a3b3c5;margin:4px 0 12px}.opts{display:grid;gap:10px}.opt{display:flex;gap:12px;align-items:center}.opt b{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:#36f59a;color:#04110a}
audio{width:100%;max-width:560px}</style><main><h1>Casting call</h1><p class="d">Listen, then reply with one letter per role, e.g. “paramedic B, doctor A”.</p>
${Object.entries(record)
  .map(([id, previews]) => `<section class="role"><h2>${esc(roles[id]?.label || id)} <small style="color:#6f8297">(${esc(id)})</small></h2><p class="d">${esc(roles[id]?.design)}</p><div class="opts">${previews.map((p) => `<div class="opt"><b>${p.option}</b><audio controls preload="none" src="${esc(p.file)}"></audio></div>`).join('')}</div></section>`)
  .join('\n')}</main>`;
}
