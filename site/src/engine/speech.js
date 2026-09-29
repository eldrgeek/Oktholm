// Speech: pre-rendered voice clips first (scripts/voices.mjs renders them with ElevenLabs), Web Speech as the
// fallback. say() always returns a promise that resolves when the line *would* have finished, so shows keep
// captions in sync when muted, blocked by autoplay rules, or missing a clip.
//
// Lines may carry performance tags for the renderer ("[sighs] Get them to Intake."). Tags are stripped for
// captions and for the browser fallback; the clip key uses the tagged text, so re-directing a line re-renders it.

import { hashString } from './rng.js';

const WPS = 2.7; // spoken words per second at rate 1.0
// One manifest fetch per page, shared by every speech channel (makeSpeech() creates several).
const manifests = new Map();
const TAG = /\[[^\]]{1,60}\]\s*/g;

/** Remove renderer performance tags: "[sighs] Fine." -> "Fine." */
export const stripTags = (text) => String(text ?? '').replace(TAG, '').replace(/\s+/g, ' ').trim();

export function estimateSeconds(text, rate = 1) {
  const words = stripTags(text).split(/\s+/).filter(Boolean).length;
  return Math.max(0.8, words / (WPS * rate)) + 0.25;
}

/** Manifest key for a line: role + normalized tagged text. Shared with scripts/voices.mjs. */
export function lineKey(role, text) {
  const s = `${role}|${String(text ?? '').replace(/\s+/g, ' ').trim()}`;
  return hashString(s).toString(36) + hashString(s + '#').toString(36);
}

/**
 * createSpeech({ isMuted, onMuteChange, cast, base })
 *   cast: brand.cast ({ roles: { id: { web: 'narrator'|'anchor'|'fast'|'victim', pitch, rate } }, aliases })
 *   base: URL prefix of the rendered clips ("voice/" -> voice/manifest.json, voice/<file>)
 */
export function createSpeech({ isMuted, onMuteChange, cast = {}, base = 'voice/' } = {}) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  let voices = [];
  let generation = 0; // bump to cancel everything in flight
  let current = null; // the clip playing now: { audio, settle, fallback }
  let manifest = null;
  let manifestLoad = null;
  const harvest = typeof location !== 'undefined' && /[?&]harvest=1\b/.test(location.search);
  const harvested = harvest ? (window.__voiceLines = window.__voiceLines || []) : null;

  function loadVoices() {
    try {
      voices = synth ? synth.getVoices() : [];
    } catch {
      voices = [];
    }
  }
  loadVoices();
  if (synth && 'onvoiceschanged' in synth) synth.onvoiceschanged = loadVoices;

  const preferences = {
    narrator: ['Samantha', 'Google US English', 'Microsoft Aria Online (Natural) - English (United States)', 'Microsoft Jenny', 'Karen', 'Moira'],
    anchor: ['Daniel', 'Google UK English Male', 'Microsoft Guy Online (Natural) - English (United States)', 'Alex', 'Fred'],
    fast: ['Google US English', 'Samantha', 'Microsoft Aria', 'Alex'],
    victim: ['Fred', 'Alex', 'Google UK English Male', 'Daniel'],
  };

  const roleOf = (voice = 'narrator') => cast.aliases?.[voice] || voice;
  const roleDef = (voice) => cast.roles?.[roleOf(voice)] || {};

  function pickVoice(kind = 'narrator') {
    if (!voices.length) loadVoices();
    const en = voices.filter((v) => /^en[-_]/i.test(v.lang));
    for (const name of preferences[kind] || []) {
      const v = en.find((x) => x.name.startsWith(name));
      if (v) return v;
    }
    return en.find((v) => /en-US/i.test(v.lang)) || en[0] || null;
  }

  function loadManifest() {
    if (!manifestLoad) {
      const http = typeof location !== 'undefined' && /^https?:$/.test(location.protocol);
      if (http && !manifests.has(base))
        manifests.set(
          base,
          fetch(base + 'manifest.json', { cache: 'no-cache' })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        );
      manifestLoad = (http ? manifests.get(base) : Promise.resolve(null)).then((m) => (manifest = m && m.clips ? m : null));
    }
    return manifestLoad;
  }

  async function clipFor(voice, text) {
    await loadManifest();
    const c = manifest?.clips?.[lineKey(roleOf(voice), text)];
    return c ? { url: base + c.f, d: c.d } : null;
  }

  function wait(ms, gen) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        if (gen !== generation) return resolve('cancelled');
        if (Date.now() - t0 >= ms) return resolve('done');
        setTimeout(tick, 50);
      };
      tick();
    });
  }

  function playClip(clip, gen) {
    return new Promise((resolve) => {
      const audio = new Audio(clip.url);
      const t0 = Date.now();
      let settled = false;
      const settle = (r) => {
        if (settled) return;
        settled = true;
        if (current?.audio === audio) current = null;
        resolve(gen === generation ? r : 'cancelled');
      };
      // Refused, missing or muted mid-line: go quiet but keep the beat's timing.
      const fallback = () => {
        if (settled) return;
        audio.pause();
        wait(Math.max(0, clip.d * 1000 - (Date.now() - t0)), gen).then(settle);
      };
      audio.addEventListener('ended', () => settle('done'));
      audio.addEventListener('error', fallback);
      current = { audio, settle, fallback };
      audio.play().catch(fallback);
    });
  }

  function speakChunk(text, opts, gen) {
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 1;
      u.pitch = opts.pitch ?? 1;
      u.volume = opts.volume ?? 1;
      const v = pickVoice(roleDef(opts.voice).web || opts.voice);
      if (v) u.voice = v;
      // Some engines never fire `end` (headless, background tabs); cap with an estimate.
      const cap = setTimeout(() => resolve('timeout'), estimateSeconds(text, u.rate) * 1000 * 1.6 + 1500);
      const started = Date.now();
      const done = (r) => {
        clearTimeout(cap);
        resolve(gen === generation ? r : 'cancelled');
      };
      u.onend = () => done('done');
      // Blocked (no user activation), interrupted or unsupported: keep the beat's timing anyway.
      u.onerror = (e) => {
        if (e?.error === 'interrupted' || e?.error === 'canceled') return done('cancelled');
        const remaining = estimateSeconds(text, u.rate) * 1000 - (Date.now() - started);
        clearTimeout(cap);
        setTimeout(() => resolve(gen === generation ? 'error' : 'cancelled'), Math.max(0, remaining));
      };
      synth.speak(u);
    });
  }

  /**
   * say(text, { voice, rate, pitch, silent, fallback })
   *   voice     cast role or Web Speech kind ('narrator' | 'anchor' | 'fast' | 'victim' | 'intake' | ...)
   *   fallback  'web' (default): browser voice when there's no clip. 'silent': captions only, for scenes
   *             where a robot voice would do more harm than silence.
   */
  async function say(text, opts = {}) {
    const gen = generation;
    const voice = opts.voice || 'narrator';
    const spoken = stripTags(text);
    // Harvest mode (scripts/voices.mjs harvest): record the line, skip the audio, move on quickly.
    if (harvested) {
      harvested.push({ role: roleOf(voice), text: String(text).replace(/\s+/g, ' ').trim() });
      return wait(15, gen);
    }
    const clip = await clipFor(voice, text);
    if (gen !== generation) return 'cancelled';
    // Browsers refuse audio before the first user gesture; don't even try (it fails instantly).
    const activated = !navigator.userActivation || navigator.userActivation.hasBeenActive;
    const quiet = !activated || isMuted?.() || opts.silent;
    if (clip) return quiet ? wait(clip.d * 1000, gen) : playClip(clip, gen);
    const available = synth && typeof SpeechSynthesisUtterance === 'function';
    if (quiet || !available || opts.fallback === 'silent' || !spoken) return wait(estimateSeconds(spoken, opts.rate ?? 1) * 1000, gen);
    const role = roleDef(voice);
    // Chrome cuts long utterances; speak sentence by sentence.
    const chunks = spoken.match(/[^.!?…]+[.!?…]*\s*/g) || [spoken];
    for (const c of chunks) {
      if (gen !== generation) return 'cancelled';
      const r = await speakChunk(c.trim(), { ...opts, voice, rate: opts.rate ?? role.rate, pitch: opts.pitch ?? role.pitch }, gen);
      if (r === 'cancelled') return r;
    }
    return 'done';
  }

  /**
   * Play a produced sound cue from the manifest (`npm run voices -- sfx`). Resolves to the <audio> element (so
   * the caller can stop or loop it) or null when there's no such cue, no gesture yet, or sound is off.
   */
  async function sfx(id, { volume = 1, loop = false } = {}) {
    await loadManifest();
    const c = manifest?.sfx?.[id];
    const activated = !navigator.userActivation || navigator.userActivation.hasBeenActive;
    if (!c || !activated || isMuted?.()) return null;
    const a = new Audio(base + c.f);
    a.volume = volume;
    a.loop = loop;
    a.play().catch(() => {});
    return a;
  }

  /** Warm the browser cache for lines about to play (cold open, tour) so clips don't gap. */
  async function preload(lines = []) {
    const clips = (await Promise.all(lines.map((l) => clipFor(l.voice, l.text)))).filter(Boolean);
    for (const c of clips) {
      const a = new Audio();
      a.preload = 'auto';
      a.src = c.url;
    }
    return clips.length;
  }

  function stop() {
    generation++;
    if (current) {
      current.audio.pause();
      current.settle('cancelled');
      current = null;
    }
    try {
      synth?.cancel();
    } catch {
      /* ignore */
    }
  }

  onMuteChange?.((muted) => {
    if (muted && current) current.fallback();
  });

  return {
    say,
    stop,
    preload,
    sfx,
    estimate: estimateSeconds,
    hasClip: async (voice, text) => Boolean(await clipFor(voice, text)),
    ready: loadManifest,
    get available() {
      return Boolean(synth);
    },
  };
}
