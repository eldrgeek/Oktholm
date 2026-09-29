// Synthesized sound effects (no audio files). The AudioContext is created lazily on first use,
// which browsers only allow after a user gesture; before that every call is a silent no-op.

export function createAudio(store) {
  let ctx = null;
  let master = null;
  let muted = store.get('muted', false);
  const listeners = new Set();

  function ac() {
    if (muted) return null;
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try {
        ctx = new C();
        master = ctx.createGain();
        master.gain.value = 0.9;
        master.connect(ctx.destination);
      } catch {
        return null;
      }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, dur = 0.12, { type = 'square', gain = 0.06, slide = 0, delay = 0, attack = 0.005 } = {}) {
    const a = ac();
    if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise(dur = 0.1, { gain = 0.2, freq = 1200, q = 0.8, delay = 0 } = {}) {
    const a = ac();
    if (!a) return;
    const t = a.currentTime + delay;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = a.createGain();
    g.gain.value = gain;
    src.connect(f).connect(g).connect(master);
    src.start(t);
  }

  const sfx = {
    tone,
    noise,
    click: () => tone(1400, 0.03, { type: 'square', gain: 0.025 }),
    beep: () => tone(1046, 0.09, { type: 'sine', gain: 0.08 }),
    ecg: () => tone(988, 0.07, { type: 'sine', gain: 0.05 }),
    good: () => {
      tone(660, 0.08, { type: 'triangle', gain: 0.08 });
      tone(990, 0.14, { type: 'triangle', gain: 0.08, delay: 0.08 });
    },
    bad: () => tone(150, 0.28, { type: 'sawtooth', gain: 0.06, slide: -50 }),
    stamp: () => {
      noise(0.09, { gain: 0.35, freq: 700, q: 0.6 });
      tone(85, 0.14, { type: 'sine', gain: 0.3, slide: -30 });
    },
    whack: () => {
      noise(0.05, { gain: 0.3, freq: 2400, q: 1.2 });
      tone(220, 0.08, { type: 'square', gain: 0.05, slide: -120 });
    },
    coin: () => [988, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.1, { type: 'square', gain: 0.04, delay: i * 0.07 })),
    alarm: () => [0, 0.25, 0.5].forEach((d) => {
      tone(880, 0.12, { type: 'square', gain: 0.05, delay: d });
      tone(660, 0.12, { type: 'square', gain: 0.05, delay: d + 0.12 });
    }),
    type: () => noise(0.025, { gain: 0.12, freq: 3000, q: 2 }),
    flatline: () => tone(988, 1.6, { type: 'sine', gain: 0.05 }),
  };

  /** Endless lounge-muzak for "your call is important to us". Returns { stop }. */
  function holdMusic() {
    const a = ac();
    if (!a) return { stop() {} };
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0], // Am7
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];
    let step = 0;
    let stopped = false;
    const beat = 0.34;
    function schedule() {
      if (stopped || muted) return;
      const chord = chords[Math.floor(step / 8) % chords.length];
      const note = chord[[0, 2, 1, 3, 2, 1, 3, 2][step % 8]] * (step % 16 < 8 ? 1 : 2);
      tone(note, beat * 0.9, { type: 'triangle', gain: 0.035 });
      if (step % 8 === 0) tone(chord[0] / 2, beat * 3.5, { type: 'sine', gain: 0.05 });
      step++;
      timer = setTimeout(schedule, beat * 1000);
    }
    let timer = setTimeout(schedule, 50);
    return {
      stop() {
        stopped = true;
        clearTimeout(timer);
      },
    };
  }

  function setMuted(v) {
    muted = Boolean(v);
    store.set('muted', muted);
    if (muted && ctx) ctx.suspend().catch(() => {});
    listeners.forEach((fn) => fn(muted));
  }

  return {
    sfx,
    holdMusic,
    setMuted,
    toggle: () => setMuted(!muted),
    isMuted: () => muted,
    onChange: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    unlock: () => ac(),
  };
}
