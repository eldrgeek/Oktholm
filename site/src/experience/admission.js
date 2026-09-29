// Admission: the landing cold open, shot from a gurney. "Tap if you can hear me" is also the gesture browsers
// need before sound; no tap and the scene plays muted and captioned. A POV ride through the ER, a printed
// wristband and a dictionary title card hand over to the lobby. Copy: brand.content.admission and
// brand.site.tagline. Lines play rendered clips when they exist; produced sound cues fall back to synthesized ones.
//
//   mountAdmission(s, { onDone, replay }) -> { skip(), destroy() } | null
//   Ends with s.track('admission_end', ...), then onDone({ skipped, sound, scene, tracked: true }).
//   destroy() tears down silently: no events, no onDone.

import './admission.css';
import { el, disposer, fill, prefersReducedMotion } from '../engine/dom.js';
import { stripTags, lineKey } from '../engine/speech.js';

const RATE = 1.3; // caption pace for lines with no rendered clip
const BEATS = ['ride', 'doctor', 'monitor', 'doors', 'sign']; // what the picture does as each line starts
// One heartbeat as [seconds, height]: P wave, QRS, T wave.
const PQRST = [[0, 0], [0.04, 0], [0.08, 0.1], [0.12, 0], [0.16, 0], [0.18, -0.12], [0.21, 1], [0.24, -0.28], [0.27, 0], [0.34, 0], [0.42, 0.2], [0.5, 0]];

export function mountAdmission(s, { onDone, replay } = {}) {
  const c = s.brand.content?.admission;
  if (!c?.scenes?.length) return null;
  // First visits get the first scene; each replay rotates to the next.
  const scene = c.scenes[(replay ? s.store.scope('admission').update('replays', (x) => x + 1, 0) : 0) % c.scenes.length];
  const lines = scene.lines || [];
  const wake = c.wake || {};
  const lab = c.labels || {};
  const w = c.wristband || {};
  const d = disposer();
  const voice = s.makeSpeech();
  const still = prefersReducedMotion();
  const { tone, noise } = s.sfx;
  const html = document.documentElement;
  const overflow = html.style.overflow;
  const everyone = c.scenes.flatMap((x) => x.lines || []);
  const whoOf = (l) => l.who || everyone.find((x) => x.voice === l.voice)?.who || '';
  const cast = [...new Set([wake.voice, ...lines.map((l) => l.voice)])];
  const t0 = performance.now();
  let run = 0, phase = 'idle', sound = false, ended = false, torn = false, manifest = null;
  let rattle = 0, media = [], monText = '', signAt = 0, lastWho = null, landed = null, sfxTimer = 0;
  let tag = null, tagWrap = null, tagK = 1, tagW = 0;

  // ---- DOM
  const skipBtn = el('button.adm-skip', { type: 'button', onclick: () => exit('skipped') }, lab.skip || '✕');
  const soundBtn = el('button.adm-sound', { type: 'button', hidden: true, 'aria-label': lab.sound, onclick: () => listen() }, '🔊 ', lab.sound || '');
  const tapBtn = el('button.adm-tap', { type: 'button' }, el('span.adm-tap__ring'), el('span.adm-tap__label', wake.tapLabel || ''), lab.tapHint && el('span.adm-tap__hint', lab.tapHint));
  const plane = el('div.adm-plane', [0, 1, 2, 3, 4].map((i) => el('i.adm-light', { style: `--adm-i:${i}` })));
  const cv = el('canvas.adm-mon__trace');
  const bpmEl = el('b.adm-mon__bpm', '72');
  const heartEl = el('i.adm-mon__heart', '♥');
  const mon = el('div.adm-mon', { 'aria-hidden': 'true' }, cv, el('div.adm-mon__read', heartEl, bpmEl));
  const ledText = el('span');
  const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const band = el(
    'div.adm-band',
    el('i.adm-band__snap'),
    el(
      'div',
      el('div.adm-band__hosp', [w.hospital, w.ward].filter(Boolean).join(' · ')),
      el('div.adm-band__id', [w.patient, s.referral.patientId()].filter(Boolean).join(' ')),
      el('div', fill(w.admitted || '{time}', { time })),
      el('div.adm-band__dx', w.condition || ''),
      el('div.adm-band__note', (s.referral.referredBy() ? w.broughtIn : w.selfAdmit) || ''),
      el('div.adm-band__alg', w.allergies || ''),
    ),
    el('i.adm-band__code'),
  );
  const capSfx = el('div.adm-cap__sfx');
  const capWho = el('div.adm-cap__who');
  const capSay = el('div.adm-cap__say');
  const cap = el('div.adm-cap', { 'aria-live': 'polite' }, capSfx, el('div.adm-cap__line', capWho, capSay));
  const card = el('div.adm-card', { 'aria-live': 'polite' });
  const root = el(
    `div.adm-overlay${still ? '.adm-still' : ''}`,
    { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Admission', tabindex: '-1' },
    el('div.adm-ctl', skipBtn, soundBtn),
    el(
      'div.adm-world',
      { 'aria-hidden': 'true' },
      el('div.adm-ceil', plane),
      el('div.adm-bloom'),
      el('div.adm-doc', el('i.adm-doc__body'), el('i.adm-doc__head')),
      el('i.adm-pen'),
      el('div.adm-doors', el('i'), el('i')),
    ),
    el('div.adm-lids', { 'aria-hidden': 'true' }, el('i'), el('i')),
    el('div.adm-white', { 'aria-hidden': 'true' }),
    mon,
    el('div.adm-led', { 'aria-hidden': 'true' }, ledText),
    el('div.adm-feed', el('i.adm-slot'), el('div.adm-feed__clip', band)),
    card,
    cap,
    tapBtn,
  );

  // ---- Helpers
  const at = (ms, fn, r = run) => d.timeout(() => r === run && !ended && fn(), ms);
  const later = (ms, r = run) => new Promise((res) => d.timeout(() => res(r === run && !ended), ms));
  const audible = () => sound && !s.audio.isMuted();
  const dur = (l) => manifest?.clips?.[lineKey(s.brand.cast?.aliases?.[l.voice] || l.voice, l.say)]?.d || voice.estimate(l.say, RATE);

  function caption(l, text) {
    const who = l ? whoOf(l) : '';
    capWho.textContent = who;
    capWho.dataset.c = String(Math.max(0, cast.indexOf(l?.voice)) % 4);
    capSay.textContent = text;
    cap.classList.remove('adm-cap--in', 'adm-cap--swap');
    void cap.offsetWidth;
    cap.classList.add(who === lastWho ? 'adm-cap--in' : 'adm-cap--swap');
    lastWho = who;
  }

  /** Muted runs mirror the sound design as bracketed captions: "[wheels rattling]". */
  function sfxCap(id) {
    if (!c.sounds?.[id]) return;
    capSfx.textContent = `[${c.sounds[id]}]`;
    clearTimeout(sfxTimer);
    sfxTimer = setTimeout(() => (capSfx.textContent = ''), 2600);
  }

  /** A produced cue when it's rendered, else the synthesized fallback. */
  function cue(id, synth, opts) {
    if (!audible()) return sfxCap(id);
    const r = run;
    voice.sfx(id, opts).then((a) => {
      if (a) return r === run && !ended ? media.push(a) : a.pause();
      if (r === run && !ended && audible()) synth?.();
    });
  }

  function hush() {
    clearInterval(rattle);
    media.forEach((a) => a.pause());
    media = [];
  }

  const SYN = {
    gurney: () => {
      clearInterval(rattle);
      rattle = setInterval(() => {
        if (!audible()) return;
        if (Math.random() < 0.7) noise(0.03, { gain: 0.02 + Math.random() * 0.05, freq: 1400 + Math.random() * 2600, q: 2.5 });
        if (Math.random() < 0.1) noise(0.6, { gain: 0.05, freq: 140, q: 0.7 });
      }, 60);
    },
    steps: () => [0, 0.34, 0.66].forEach((t) => noise(0.1, { gain: 0.25, freq: 200, q: 0.8, delay: t })),
    doors: () => {
      tone(60, 0.45, { type: 'sine', gain: 0.35, slide: -25 });
      noise(0.3, { gain: 0.3, freq: 520, q: 0.6 });
      noise(0.25, { gain: 0.18, freq: 420, q: 0.6, delay: 0.16 });
    },
    chime: () => [784, 659, 523].forEach((f, i) => tone(f, 1.2, { type: 'sine', gain: 0.07, delay: i * 0.34, attack: 0.02 })),
    printer: () => {
      for (let i = 0; i < 24; i++) noise(0.012, { gain: 0.1, freq: 3400, q: 3, delay: i * 0.04 });
      noise(0.18, { gain: 0.12, freq: 2600, q: 0.5, delay: 1.05 });
    },
    motif: () => [220, 262, 247].forEach((f, i) => tone(f, 1.8, { type: 'triangle', gain: 0.07, delay: i * 0.45, attack: 0.03 })),
  };

  // ---- The monitor: its beeps (only after a tap) follow the rate.
  const ecg = makeEcg(cv, getComputedStyle(html).getPropertyValue('--vital').trim() || '#36f59a', () => {
    if (ecg.st.flat) return;
    if (audible()) s.sfx.ecg();
    if (!monText) bpmEl.textContent = Math.round(ecg.st.bpm);
    if (!still) heartEl.animate?.([{ transform: 'scale(1.4)', opacity: 1 }, { transform: 'none', opacity: 0.55 }], 280);
  });

  // ---- Flow
  function wakeUp() {
    if (phase !== 'idle') return;
    if (!c.wake) return play(false);
    phase = 'wake';
    root.classList.add('adm-waking');
    caption(wake, wake.caption || stripTags(wake.say));
    voice.say(wake.say, { voice: wake.voice, fallback: 'silent', silent: s.audio.isMuted() });
    at(wake.timeoutMs || 5000, () => phase === 'wake' && play(false));
  }

  // The tap, or "Sound on" after a muted start: unmute, unlock, and (re)start the scene with sound.
  function listen() {
    if (ended) return;
    if (s.audio.isMuted()) s.audio.setMuted(false);
    s.audio.unlock();
    s.track('sound_on', { surface: 'admission' });
    play(true);
  }

  async function play(withSound) {
    const r = ++run;
    voice.stop();
    hush();
    root.classList.remove('adm-waking', 'adm-open', 'adm-doc-in', 'adm-burst', 'adm-signed', 'adm-print', 'adm-zap');
    mon.classList.remove('adm-mon--hot', 'adm-mon--msg');
    ecg.reset();
    monText = '';
    signAt = 0;
    bpmEl.textContent = '72';
    void root.offsetWidth; // restart the CSS animations
    sound = withSound;
    phase = 'scene';
    soundBtn.hidden = withSound;
    if (root.contains(document.activeElement) && document.activeElement !== skipBtn) root.focus({ preventScroll: true });
    root.classList.add('adm-open');
    cue('room-tone', null, { loop: true, volume: 0.3 });
    cue('gurney', SYN.gurney, { loop: true, volume: 0.5 });
    if (!(withSound && wake.afterTap ? await say(wake.afterTap, r) : await later(400, r))) return;
    for (let i = 0; i < lines.length; i++) {
      beat(lines[i], i, r);
      const said = say(lines[i], r);
      if (lines[i].sign && i === lines.length - 1) break; // the sign carries it; the voice rings on under the cut
      if (!(await said) || !(await later(80, r))) return;
    }
    // The band prints for a second, is read for a second, then the card.
    if (!(await later(Math.max(300, signAt + 2400 - performance.now()), r))) return;
    cut();
    if (await later(2800, r)) exit('completed');
  }

  async function say(l, r) {
    caption(l, l.caption || stripTags(l.say));
    const res = await voice.say(l.say, { voice: l.voice, fallback: 'silent', rate: RATE, silent: !audible() });
    return res !== 'cancelled' && r === run && !ended;
  }

  // Stage directions a line may carry: beat, monitor (text in place of the rate), ecg { bpm, spike, heart,
  // flat } (spike and heart name a phrase to land on), sign (the LED sign that replaces the caption), sfx.
  function beat(l, i, r) {
    const b = l.beat || BEATS[i];
    const ms = dur(l) * 1000;
    const e = l.ecg || {};
    const text = stripTags(l.say);
    if (e.flat && !ecg.st.flat) audible() ? s.sfx.flatline() : sfxCap('flatline');
    ecg.st.flat = Boolean(e.flat);
    monText = l.monitor || '';
    mon.classList.toggle('adm-mon--msg', Boolean(monText));
    bpmEl.textContent = monText || (e.flat ? '--' : Math.round(ecg.st.bpm));
    if (b === 'monitor' || e.bpm) {
      ecg.ramp(e.bpm || 110, ms / 1000);
      mon.classList.add('adm-mon--hot');
      if (!audible()) sfxCap('monitor');
    }
    for (const k of ['spike', 'heart']) {
      const j = e[k] ? text.indexOf(e[k]) : -1;
      if (j >= 0) at((j / text.length) * ms, ecg[k], r);
    }
    if (b === 'doctor') {
      root.classList.add('adm-doc-in');
      cue('steps', SYN.steps);
    }
    if (b === 'doors') {
      root.classList.add('adm-burst');
      cue('doors', SYN.doors);
    }
    if (b === 'sign') {
      signAt = performance.now();
      if (l.sign) {
        ledText.textContent = l.sign;
        root.classList.add('adm-signed');
      }
      cue('pa-chime', SYN.chime);
      at(400, () => (root.classList.add('adm-print'), cue('wristband', SYN.printer)), r);
    }
    if (l.sfx === 'defib') {
      const hit = ms * 0.8;
      cue('defib', () => {
        tone(400, hit / 1000, { type: 'sine', gain: 0.03, slide: 2400 });
        tone(60, 0.4, { type: 'sine', gain: 0.4, slide: -25, delay: hit / 1000 });
        noise(0.3, { gain: 0.35, freq: 300, q: 0.5, delay: hit / 1000 });
      });
      // One soft white-out on "Clear!", never a strobe; the trace comes back.
      at(hit, () => {
        root.classList.add('adm-zap');
        ecg.st.flat = false;
        monText = '';
        mon.classList.remove('adm-mon--msg');
        ecg.spike();
      }, r);
    } else if (l.sfx) cue(l.sfx);
  }

  function cut() {
    phase = 'card';
    hush();
    ecg.stop();
    flyBand();
    capWho.textContent = capSay.textContent = capSfx.textContent = '';
    root.classList.add('adm-carded');
    const t = c.title || {};
    const [a, b] = s.brand.site?.tagline || [];
    card.append(
      el(
        'div.adm-card__in',
        el('p.adm-card__hw', el('b', t.headword || t.name || ''), t.pos && el('i', `\u00a0(${t.pos})`)),
        t.definition && el('p.adm-card__def', t.definition),
        t.seeAlso && el('p.adm-card__see', t.seeAlso),
        a && (tagWrap = el('div.adm-card__tag', (tag = el('p.adm-tag', `${a} `, b && el('em', b))))),
      ),
    );
    fitTag();
    at(600, () => cue('motif', SYN.motif));
  }

  // The card's tagline is set exactly like the lobby headline (font, size, width) and scaled down, so the exit
  // can grow it into place.
  function fitTag() {
    const h = document.querySelector('.hero__title');
    const hr = h?.getBoundingClientRect();
    if (!tag || still || !hr?.width) return;
    const cs = getComputedStyle(h);
    for (const p of ['fontFamily', 'fontSize', 'fontWeight', 'fontStretch', 'lineHeight', 'letterSpacing']) tag.style[p] = cs[p];
    tag.style.width = (tagW = hr.width) + 'px';
    tagK = Math.min(1, tagWrap.clientWidth / hr.width, (innerWidth < 600 ? 26 : 38) / parseFloat(cs.fontSize));
    tag.classList.add('adm-tag--fit');
    tag.style.transform = `scale(${tagK})`;
    tagWrap.style.height = tag.offsetHeight * tagK + 'px';
  }

  function morph() {
    const h = document.querySelector('.hero__title');
    const hr = h?.getBoundingClientRect();
    if (!tagW || !hr || Math.abs(hr.width - tagW) > 2 || hr.top < 0 || hr.bottom > innerHeight || !tag.animate) return false;
    const wr = tagWrap.getBoundingClientRect();
    tag.animate([{ transform: `scale(${tagK})` }, { transform: `translate(${hr.left - wr.left}px, ${hr.top - wr.top}px)` }], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
    h.animate({ opacity: [0, 0] }, 690); // back just before the overlay goes, under an identical copy
    return true;
  }

  // The band flies into the topbar wristband when that's on screen; otherwise it goes with the cut.
  function flyBand() {
    const tb = document.querySelector('.topbar .wristband');
    const r = tb?.getBoundingClientRect();
    const b = band.getBoundingClientRect();
    if (!root.classList.contains('adm-print') || still || !r?.width || !b.width || !band.animate) return;
    const to = `translate(${r.left + r.width / 2 - b.left - b.width / 2}px, ${r.top + r.height / 2 - b.top - b.height / 2}px) scale(${r.width / b.width}, ${r.height / b.height})`;
    root.classList.add('adm-flying');
    band.animate([{ transform: 'none' }, { transform: to, opacity: 1, offset: 0.8 }, { transform: to, opacity: 0 }], { duration: 850, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' });
    landed = tb;
  }

  function exit(result) {
    if (ended) return;
    const skipped = result === 'skipped';
    const snd = audible();
    ended = true;
    run++;
    voice.stop();
    hush();
    s.track('admission_end', { result, seconds: Math.round((performance.now() - t0) / 100) / 10, sound: snd, scene: scene.id });
    try {
      onDone?.({ skipped, sound: snd, scene: scene.id, tracked: true });
    } catch (e) {
      console.error(e);
    }
    html.style.overflow = overflow; // before measuring: a returning scrollbar would move the headline
    const m = !skipped && morph();
    root.classList.add(m ? 'adm-morph' : 'adm-out');
    if (skipped) root.classList.add('adm-fast');
    d.timeout(
      () => {
        teardown();
        if (!skipped && snd) s.referral.grantChip('code-oktholm');
        landed?.animate([{ transform: 'scale(1.15)', boxShadow: '0 0 0 5px #36f59a73' }, { transform: 'none', boxShadow: '0 0 0 0 #36f59a00' }], { duration: 800, easing: 'ease-out' });
      },
      m ? 760 : skipped ? 260 : 620,
    );
  }

  function teardown() {
    if (torn) return;
    torn = ended = true;
    run++;
    voice.stop();
    const focused = root.contains(document.activeElement);
    d.run();
    root.remove();
    if (!document.querySelector('.adm-overlay')) html.style.overflow = overflow; // a replay may already be up
    s.cue?.suppress?.('admission', false);
    if (focused || document.activeElement === document.body) document.querySelector('main')?.focus({ preventScroll: true });
  }

  // ---- Input
  d.on(root, 'click', (e) => {
    if (e.target.closest('.adm-ctl')) return;
    if (phase === 'wake') listen();
    else if (phase === 'card') exit('completed');
  });
  d.on(document, 'keydown', (e) => {
    if (torn) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      exit('skipped');
    } else if (e.key === 'Tab') {
      // Focus stays in the dialog: Skip, Sound on, the tap target.
      const f = [skipBtn, soundBtn, tapBtn].filter((b) => b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden');
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[i < 0 ? (e.shiftKey ? f.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus();
    } else if (phase === 'wake' && (e.key === 'Enter' || e.key === ' ') && !e.target.closest?.('button')) {
      e.preventDefault();
      listen();
    }
  });
  d.on(window, 'hashchange', () => exit('skipped'));
  d.on(window, 'resize', ecg.size);
  d.on(plane, 'animationiteration', () => phase === 'scene' && audible() && noise(0.5, { gain: 0.035, freq: 360, q: 0.5 }));
  d(s.audio.onChange((muted) => muted && hush()));
  d(() => (hush(), ecg.stop(), clearTimeout(sfxTimer)));

  // ---- Mount
  document.body.append(root);
  html.style.overflow = 'hidden';
  s.cue?.suppress?.('admission', true);
  s.track('admission_start', { scene: scene.id, referred: Boolean(s.referral.referredBy()), replay: Boolean(replay) });
  voice.ready().then((m) => (manifest = m));
  voice.preload([wake, wake.afterTap, ...lines].filter((l) => l?.say).map((l) => ({ voice: l.voice, text: l.say })));
  skipBtn.focus({ preventScroll: true });
  ecg.size();
  ecg.start();
  // A tab opened in the background waits until someone is looking.
  if (document.hidden) d.on(document, 'visibilitychange', () => !document.hidden && wakeUp());
  else wakeUp();

  return { skip: () => exit('skipped'), destroy: teardown };
}

/** A sweeping ECG on a small canvas: ramp(bpm, secs), spike(), heart(), st.flat; onBeat() on each R wave. */
function makeEcg(cv, color, onBeat) {
  const g = cv.getContext('2d');
  const st = {};
  let W = 0, H = 0, pts = [], pen = 0, T = 0, beatT = 0, amp = 1, fired = true, raf = 0, last = 0;

  function wave(t) {
    const i = PQRST.findIndex(([x]) => t < x);
    if (i < 1) return 0;
    const [[a, ya], [b, yb]] = [PQRST[i - 1], PQRST[i]];
    return ya + ((yb - ya) * (t - a)) / (b - a);
  }

  function step(dt) {
    T += dt;
    if (st.rD) st.bpm = st.from + (st.to - st.from) * Math.min(1, (T - st.rT) / st.rD);
    const hw = H * 0.25;
    if (st.h >= 0) {
      // Drawing the heart; the beat clock waits for it.
      beatT += dt;
      if ((st.h += dt / 0.8) < 1) {
        const a = Math.PI * (1 + 2 * st.h);
        return pts.push([pen + hw * Math.sin(a) ** 3, (0.8 * (17 + 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))) / 29]);
      }
      st.h = -1;
    }
    let tb = T - beatT;
    if (st.hq && tb > 0.5) {
      st.hq = false;
      st.h = 0;
      return pts.push([(pen += hw), 0]);
    }
    pen += (W / 2.4) * dt;
    if (tb >= 60 / st.bpm) {
      beatT = T;
      tb = 0;
      fired = false;
      amp = st.big > 0 ? (st.big--, 1.9) : 1;
    }
    if (!fired && tb >= 0.21) {
      fired = true;
      onBeat();
    }
    pts.push([pen, st.flat ? 0 : wave(tb) * amp]);
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.2, (t - (last || t)) / 1000);
    last = t;
    for (let i = 0, k = Math.ceil(dt * 120); i < k; i++) step(dt / k);
    while (pts.length && pts[0][0] < pen - W + 14) pts.shift();
    if (!g || !W) return;
    g.clearRect(0, 0, W, H);
    g.strokeStyle = g.shadowColor = color;
    g.lineWidth = 1.6;
    g.shadowBlur = 6;
    g.beginPath();
    let px = -1e9, x = 0, y = 0;
    for (const [x0, v] of pts) {
      x = x0 % W;
      y = H * (0.7 - v * 0.55);
      if (x < px - W / 2) g.moveTo(x, y);
      else g.lineTo(x, y);
      px = x;
    }
    g.stroke();
    g.fillStyle = '#fff';
    g.fillRect(x - 1.5, y - 1.5, 3, 3);
  }

  const api = {
    st,
    reset: () => Object.assign(st, { bpm: 72, from: 72, to: 72, rD: 0, big: 0, flat: false, hq: false, h: -1 }),
    size() {
      const r = cv.getBoundingClientRect();
      const k = Math.min(2, devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * k);
      cv.height = Math.round(H * k);
      g?.setTransform(k, 0, 0, k, 0, 0);
    },
    ramp: (to, secs) => Object.assign(st, { from: st.bpm, to, rT: T, rD: Math.max(0.1, secs) }),
    spike: () => (st.big = 2),
    heart: () => (st.hq = true),
    start() {
      if (!raf) raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = last = 0;
    },
  };
  api.reset();
  return api;
}
