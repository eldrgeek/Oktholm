// Web Speech wrapper. Always returns a promise that resolves when the line *would* have finished,
// so shows keep captions in sync even when muted or when speechSynthesis is missing/broken.

const WPS = 2.7; // spoken words per second at rate 1.0

export function estimateSeconds(text, rate = 1) {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(0.8, words / (WPS * rate)) + 0.25;
}

export function createSpeech({ isMuted }) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  let voices = [];
  let generation = 0; // bump to cancel everything in flight

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

  function pickVoice(kind = 'narrator') {
    if (!voices.length) loadVoices();
    const en = voices.filter((v) => /^en[-_]/i.test(v.lang));
    for (const name of preferences[kind] || []) {
      const v = en.find((x) => x.name.startsWith(name));
      if (v) return v;
    }
    return en.find((v) => /en-US/i.test(v.lang)) || en[0] || null;
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

  function speakChunk(text, opts, gen) {
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 1;
      u.pitch = opts.pitch ?? 1;
      u.volume = opts.volume ?? 1;
      const v = pickVoice(opts.voice);
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

  /** say(text, { rate, pitch, voice: 'narrator'|'anchor'|'fast'|'victim' }) */
  async function say(text, opts = {}) {
    const gen = generation;
    const available = synth && typeof SpeechSynthesisUtterance === 'function';
    // Browsers refuse speech before the first user gesture; don't even try (it fails instantly).
    const activated = !navigator.userActivation || navigator.userActivation.hasBeenActive;
    if (!available || !activated || isMuted?.() || opts.silent) {
      return wait(estimateSeconds(text, opts.rate ?? 1) * 1000, gen);
    }
    // Chrome cuts long utterances; speak sentence by sentence.
    const chunks = String(text).match(/[^.!?…]+[.!?…]*\s*/g) || [String(text)];
    for (const c of chunks) {
      if (gen !== generation) return 'cancelled';
      const r = await speakChunk(c.trim(), opts, gen);
      if (r === 'cancelled') return r;
    }
    return 'done';
  }

  function stop() {
    generation++;
    try {
      synth?.cancel();
    } catch {
      /* ignore */
    }
  }

  return { say, stop, estimate: estimateSeconds, get available() { return Boolean(synth); } };
}
