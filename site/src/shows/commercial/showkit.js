// OKTV show kit: the shared player behind every captioned "video" on the network
// (commercial, hostage, intervention, news). Nothing here names a brand.
//
// A show is an array of beats played in order:
//   { scene, caption, say, who, voice, rate, pitch, hold, pre, silent, run, await, mark, capStyle }
//     scene    string handed to spec.scene(name) when the beat starts (swap CSS scene states)
//     caption  on-screen text (defaults to `say`); long captions are split into readable chunks
//     say      spoken text (defaults to `caption`); `false` = silent beat that shows the caption for `hold` ms
//     who      optional speaker label shown with the caption
//     hold     ms to wait after the line (or the whole beat length for silent beats)
//     pre      ms to wait before the line
//     run(api) called at beat start; may return a cleanup (called on pause/stop/end)
//     await()  promise the beat also waits for (e.g. a blink sequence finishing)
//     mark     false = not a resume point (resume() backs up to the previous marked beat)
//
// Timing is built on ctx.speech.say(), which resolves at the estimated end even when muted, so
// captions stay in sync with or without sound. A floor keeps captions readable when the browser
// refuses to speak (autoplay rules, no voices) and returns early.
//
// Shared by all four OKTV shows; a candidate for promotion to src/engine/show.js.

import './showkit.css';

const DEV = typeof __DEV__ !== 'undefined' && __DEV__;

/** Test hook (dev harness builds only): ?fast=1 divides every wait by 10 (?fast=N by N). */
export function speedFromUrl() {
  if (!DEV || typeof location === 'undefined') return 1;
  const p = new URLSearchParams(location.search);
  if (!p.has('fast')) return 1;
  const n = Number(p.get('fast'));
  return n > 1 ? n : 10;
}

export const wordCount = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;

function sentences(text) {
  const out = String(text).match(/[^.!?…]+(?:[.!?…]+[”"’')\]]*)?\s*/g);
  return (out || [String(text)]).map((s) => s.trim()).filter(Boolean);
}

function greedy(parts, max) {
  const out = [];
  let cur = '';
  for (const p of parts) {
    if (!cur) cur = p;
    else if ((cur + ' ' + p).length <= max) cur += ' ' + p;
    else {
      out.push(cur);
      cur = p;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * Plan how a line is spoken and captioned: [{ speak, captions: [...] }].
 * Short sentences are merged up to `max` characters; a long sentence is spoken in one go while its
 * caption advances clause by clause.
 */
export function planCaption(text, max = 84) {
  const groups = [];
  for (const g of greedy(sentences(text), max)) {
    if (g.length <= max) groups.push({ speak: g, captions: [g] });
    else {
      const caps = greedy(g.replace(/([,;:—–])\s+/g, '$1\u0000').split('\u0000'), max).flatMap((c) => (c.length > max ? greedy(c.split(/\s+/), max) : [c]));
      groups.push({ speak: g, captions: caps });
    }
  }
  return groups;
}

function compilePronounce(map = {}) {
  const rules = Object.entries(map).map(([from, to]) => [new RegExp(`(^|[^\\p{L}\\p{N}])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^\\p{L}\\p{N}])`, 'gu'), to]);
  return (text) => rules.reduce((t, [re, to]) => t.replace(re, (m, pre) => pre + to), String(text));
}

/** Beat sequencer with pause/resume/stop. Returns a controller; play() resolves 'ended' | 'stopped'. */
export function createTimeline(ctx, opts = {}) {
  const speed = opts.speed || 1;
  const maxChars = opts.maxChars || 84;
  const pron = compilePronounce(opts.pronounce);
  const onCaption = opts.onCaption || (() => {});
  const onBeat = opts.onBeat || (() => {});
  const defaults = { voice: 'narrator', rate: 1, pitch: 1, ...(opts.defaults || {}) };

  let token = 0;
  let state = 'idle';
  let list = [];
  let idx = 0;
  let finish = null;
  const pending = new Set();
  const cancelWaiters = new Set();
  const cleanups = [];

  function wait(ms, tk) {
    if (tk !== token) return Promise.resolve(false);
    return new Promise((resolve) => {
      const p = { resolve, id: 0 };
      p.id = setTimeout(() => {
        pending.delete(p);
        resolve(tk === token);
      }, Math.max(0, ms) / speed);
      pending.add(p);
    });
  }

  function later(fn, ms, tk) {
    if (tk !== token) return null;
    const p = { resolve: () => {}, id: 0 };
    p.id = setTimeout(() => {
      pending.delete(p);
      if (tk === token) fn();
    }, Math.max(0, ms) / speed);
    pending.add(p);
    return p;
  }

  function untilCancelled(tk) {
    if (tk !== token) return Promise.resolve();
    return new Promise((resolve) => cancelWaiters.add(resolve));
  }

  function runCleanups() {
    while (cleanups.length) {
      try {
        cleanups.pop()();
      } catch (e) {
        console.error(e);
      }
    }
  }

  function cancel() {
    token++;
    for (const p of pending) {
      clearTimeout(p.id);
      p.resolve(false);
    }
    pending.clear();
    cancelWaiters.forEach((r) => r());
    cancelWaiters.clear();
    runCleanups();
    try {
      ctx.speech.stop();
    } catch {
      /* speech is optional */
    }
  }

  function plan(b) {
    if (b.say === false) return [];
    const caption = b.caption ?? b.say;
    if (caption == null || caption === '') return [];
    if (b.say != null && b.caption != null && b.say !== b.caption) return [{ speak: String(b.say), captions: [String(b.caption)] }];
    return planCaption(caption, b.maxChars || maxChars);
  }

  const readMs = (text) => ctx.speech.estimate(text, 1.15) * 1000;

  /** Estimated duration of a beat in ms (at speed 1). */
  function estimate(b) {
    let ms = (b.pre || 0) + (b.hold || 0) + (b.extra || 0);
    const groups = plan(b);
    for (const g of groups) ms += ctx.speech.estimate(pron(g.speak), b.rate ?? defaults.rate) * 1000;
    if (!groups.length && b.hold == null && b.caption) ms += readMs(b.caption);
    return ms;
  }

  async function speak(text, b, est, tk) {
    if (b.silent || speed !== 1) return wait(est, tk);
    const t0 = performance.now();
    let r = 'error';
    try {
      r = await ctx.speech.say(pron(text), { voice: b.voice || defaults.voice, rate: b.rate ?? defaults.rate, pitch: b.pitch ?? defaults.pitch });
    } catch {
      r = 'error';
    }
    if (tk !== token) return false;
    const elapsed = performance.now() - t0;
    const floor = r === 'done' ? est * 0.72 : est;
    if (elapsed < floor) return wait(floor - elapsed, tk);
    return true;
  }

  async function speakGroup(g, b, tk) {
    // Estimate on the spoken form: respellings like "C F O" add words, and the engine times what it says.
    const est = ctx.speech.estimate(pron(g.speak), b.rate ?? defaults.rate) * 1000;
    onCaption(g.captions[0], b);
    const timers = [];
    if (g.captions.length > 1) {
      const total = g.captions.reduce((n, c) => n + wordCount(c), 0) || 1;
      let acc = wordCount(g.captions[0]);
      for (let i = 1; i < g.captions.length; i++) {
        const c = g.captions[i];
        timers.push(later(() => onCaption(c, b), (est - 250) * (acc / total), tk));
        acc += wordCount(c);
      }
    }
    const ok = await speak(g.speak, b, est, tk);
    for (const t of timers) {
      if (!t) continue;
      clearTimeout(t.id);
      pending.delete(t);
    }
    return ok;
  }

  async function runBeat(b, i, tk) {
    onBeat(b, i);
    let beatCleanup = null;
    if (typeof b.run === 'function') {
      const api = {
        wait: (ms) => wait(ms, tk),
        later: (fn, ms) => later(fn, ms, tk),
        alive: () => tk === token,
        // Cleanup that outlives the beat (effects spanning several beats): runs on pause/stop/end.
        onStop: (fn) => cleanups.push(fn),
        speed,
        index: i,
      };
      const c = b.run(api);
      if (typeof c === 'function') {
        beatCleanup = c;
        cleanups.push(c);
      }
    }
    const ok = await runBeatBody(b, tk);
    // A cleanup returned by run() is beat-scoped: it runs when the beat finishes (or on pause/stop).
    if (ok && beatCleanup) {
      const at = cleanups.indexOf(beatCleanup);
      if (at >= 0) cleanups.splice(at, 1);
      try {
        beatCleanup();
      } catch (e) {
        console.error(e);
      }
    }
    return ok;
  }

  async function runBeatBody(b, tk) {
    if (b.pre && !(await wait(b.pre, tk))) return false;
    const groups = plan(b);
    if (groups.length) {
      for (const g of groups) if (!(await speakGroup(g, b, tk))) return false;
      if (b.hold && !(await wait(b.hold, tk))) return false;
    } else {
      if (!b.keepCaption) onCaption(b.caption || '', b);
      const ms = b.hold ?? (b.caption ? readMs(b.caption) : 0);
      if (ms && !(await wait(ms, tk))) return false;
    }
    if (typeof b.await === 'function') {
      await Promise.race([Promise.resolve().then(b.await).catch(() => null), untilCancelled(tk)]);
      if (tk !== token) return false;
    }
    return tk === token;
  }

  async function loop(tk) {
    while (idx < list.length) {
      if (tk !== token) return;
      const ok = await runBeat(list[idx], idx, tk);
      if (!ok || tk !== token) return;
      idx++;
    }
    if (tk !== token) return;
    state = 'ended';
    runCleanups();
    const f = finish;
    finish = null;
    f?.('ended');
  }

  function settle(result) {
    const f = finish;
    finish = null;
    f?.(result);
  }

  return {
    speed,
    plan,
    estimate,
    play(beats, from = 0) {
      cancel();
      settle('stopped');
      list = beats.filter(Boolean);
      idx = Math.max(0, Math.min(from, list.length));
      state = 'playing';
      const p = new Promise((r) => (finish = r));
      loop(token);
      return p;
    },
    pause() {
      if (state !== 'playing') return false;
      cancel();
      state = 'paused';
      return true;
    },
    resume() {
      if (state !== 'paused') return false;
      while (idx > 0 && list[idx]?.mark === false) idx--;
      state = 'playing';
      loop(token);
      return true;
    },
    stop() {
      cancel();
      state = 'stopped';
      settle('stopped');
    },
    get state() {
      return state;
    },
    get index() {
      return idx;
    },
  };
}

const fmt = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * Mount a show. In 'tv' mode `root` is the 16:9 screen: autoplay, no controls, opts.onEnd() once.
 * In 'page' mode the kit builds the screen, a poster with a big play button, a control bar
 * (play/pause, sound, replay, extras) and whatever spec.below() returns under the player.
 *
 * spec: { prefix, label, stage({screen, mode, speed}) -> Element, beats() -> Beat[], scene(name, beat),
 *         reset(), onBeat(beat, i), onComplete({mode}), poster: {kicker,title,sub,cta}, below(ctl) -> Node,
 *         controls(ctl) -> Node[], endActions(ctl) -> Node[], caption(parts, text, beat), pronounce, voice,
 *         maxChars, autoplay }
 */
export function mountShow(root, ctx, opts = {}, spec = {}) {
  const { el } = ctx.dom;
  const P = spec.prefix || 'show';
  const mode = opts.mode === 'tv' ? 'tv' : 'page';
  const speed = spec.speed || speedFromUrl();
  const d = ctx.dom.disposer();
  let destroyed = false;
  let endFired = false;
  let state = 'idle';
  let est = [];
  let total = 0;
  let base = 0;
  let curEst = 0;
  let beatStart = 0;
  let frozenAt = 0;
  let plays = 0;

  const screen = mode === 'tv' ? root : el(`div.tv-screen.crt.${P}-screen`, { tabindex: '0', role: 'region', 'aria-label': spec.label || ctx.meta?.title || 'Show' });
  const addedClasses = [`${P}-screen`, `${P}-screen--${mode}`];
  screen.classList.add(...addedClasses);
  if (speed !== 1) screen.style.setProperty('--sk-speed', String(1 / speed));

  const capWho = el(`span.${P}-cap__who`);
  const capText = el(`span.${P}-cap__text`);
  const cap = el(`div.${P}-cap`, { role: 'status', 'aria-live': 'polite' }, capWho, capText);
  capWho.hidden = true;

  const stage = spec.stage({ screen, mode, speed });
  stage.classList.add(`${P}-stage`);
  screen.append(stage, cap);

  let lastCap = null;
  function setCaption(text, beat = {}) {
    const t = text == null ? '' : String(text);
    const key = `${beat.who || ''}\u0000${beat.capStyle || ''}\u0000${t}`;
    if (key === lastCap) return; // same line again (e.g. a bleep split into beats): don't flicker
    lastCap = key;
    if (spec.caption) {
      spec.caption({ cap, who: capWho, text: capText }, t, beat);
    } else {
      capWho.textContent = beat.who || '';
      capWho.hidden = !beat.who || !t;
      capText.textContent = t;
    }
    cap.dataset.style = beat.capStyle || '';
    cap.classList.toggle('is-on', Boolean(t));
    cap.classList.remove('is-new');
    void cap.offsetWidth;
    if (t) cap.classList.add('is-new');
  }

  const tl = createTimeline(ctx, {
    speed,
    pronounce: spec.pronounce,
    maxChars: spec.maxChars,
    defaults: spec.voice,
    onCaption: setCaption,
    onBeat: (b, i) => {
      if (b.scene != null) spec.scene?.(b.scene, b, i);
      spec.onBeat?.(b, i);
      progressAt(i);
    },
  });

  const ctl = {
    mode,
    speed,
    screen,
    stage,
    cap,
    get page() {
      return page;
    },
    get state() {
      return state;
    },
    start,
    replay: start,
    pause,
    resume,
    toggle,
    stop: () => {
      tl.stop();
      setState('idle');
    },
    setPoster,
    setCaption,
    destroy,
    disposer: d,
  };

  // ---------- page chrome ----------
  let page = null;
  let poster = null;
  let endEl = null;
  let progressBar = null;
  let playBtn = null;
  let soundBtn = null;
  let timeEl = null;

  const btn = (cls, label, onclick, extra = {}) => el(`button.btn.btn--sm.${cls}`, { type: 'button', onclick, ...extra }, label);
  const soundLabel = () => (ctx.audio.isMuted() ? '🔇 Sound off' : '🔊 Sound on');

  function setPoster(p = {}) {
    if (!poster) return;
    const cfg = { ...(spec.poster || {}), ...p };
    poster.replaceChildren(
      cfg.kicker ? el(`span.${P}-poster__kicker`, cfg.kicker) : '',
      el(`span.${P}-poster__title`, cfg.title || ctx.meta?.title || ''),
      cfg.sub ? el(`span.${P}-poster__sub`, cfg.sub) : '',
      el(`span.${P}-poster__btn`, { 'aria-hidden': 'true' }, el(`span.${P}-poster__tri`)),
      el(`span.${P}-poster__cta`, cfg.cta || 'Play'),
    );
    poster.setAttribute('aria-label', `Play: ${cfg.title || ctx.meta?.title || 'show'}`);
  }

  if (mode === 'page') {
    poster = el(`button.${P}-poster`, { type: 'button', onclick: () => start() });
    setPoster();
    endEl = el(`div.${P}-end`, { hidden: true });
    progressBar = el('i');
    screen.append(poster, el(`div.${P}-paused`, { 'aria-hidden': 'true' }, el('span', '❚❚  Paused')), endEl, el(`div.${P}-progress`, { 'aria-hidden': 'true' }, progressBar));

    playBtn = btn(`${P}-bar__play.btn--vital`, '▶ Play', () => toggle());
    soundBtn = btn(`${P}-bar__sound.btn--ghost`, soundLabel(), () => ctx.audio.toggle(), { 'aria-pressed': String(!ctx.audio.isMuted()) });
    const replayBtn = btn(`${P}-bar__replay.btn--ghost`, '↻ Replay', () => start());
    timeEl = el(`span.${P}-time`, '0:00');
    const bar = el(`div.${P}-bar`, playBtn, soundBtn, replayBtn, ...(spec.controls?.(ctl) || []), timeEl);
    page = el(`section.${P}-page`, el(`div.${P}-player`, screen, bar));
    root.append(page);
    d.interval(tick, 250);
    d.on(screen, 'click', (e) => {
      if (e.target.closest('button, a, input, select, textarea, label')) return;
      if (state === 'playing' || state === 'paused') toggle();
    });
    d.on(screen, 'keydown', (e) => {
      if (e.target !== screen) return;
      if (e.key === ' ' || e.key === 'k' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });
  }

  d(
    ctx.audio.onChange((muted) => {
      if (soundBtn) {
        soundBtn.textContent = soundLabel();
        soundBtn.setAttribute('aria-pressed', String(!muted));
      }
      // Cut speech off mid-line when the viewer mutes; the timeline waits out the rest of the line.
      if (muted && state === 'playing') ctx.speech.stop();
    }),
  );

  function setState(s) {
    state = s;
    screen.dataset.state = s;
    if (playBtn) playBtn.textContent = s === 'playing' ? '❚❚ Pause' : s === 'paused' ? '▶ Resume' : s === 'ended' ? '↻ Watch again' : '▶ Play';
    if (poster) poster.hidden = s !== 'idle';
    if (endEl && s !== 'ended') endEl.hidden = true;
  }

  function progressAt(i) {
    base = est.slice(0, i).reduce((a, b) => a + b, 0);
    curEst = est[i] || 0;
    beatStart = performance.now();
    if (!progressBar || !total) return;
    progressBar.style.transition = 'none';
    progressBar.style.transform = `scaleX(${base / total})`;
    void progressBar.offsetWidth;
    progressBar.style.transition = `transform ${curEst / speed}ms linear`;
    progressBar.style.transform = `scaleX(${Math.min(1, (base + curEst) / total)})`;
  }

  function elapsed() {
    if (state === 'ended') return total;
    if (state === 'paused') return frozenAt;
    if (state !== 'playing') return 0;
    return base + Math.min(curEst, (performance.now() - beatStart) * speed);
  }

  function tick() {
    if (timeEl) timeEl.textContent = total ? `${fmt(elapsed())} / ${fmt(total)}` : '0:00';
  }

  function start() {
    if (destroyed) return;
    try {
      ctx.audio.unlock?.();
    } catch {
      /* optional */
    }
    spec.reset?.();
    const beats = (spec.beats?.() || []).filter(Boolean);
    est = beats.map((b) => tl.estimate(b));
    total = est.reduce((a, b) => a + b, 0);
    setCaption('');
    setState('playing');
    plays++;
    const run = plays;
    ctx.track?.('show_play', { mode, plays });
    tl.play(beats).then((r) => {
      if (r === 'ended' && !destroyed && run === plays) finished();
    });
  }

  function finished() {
    setState('ended');
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.transform = 'scaleX(1)';
    }
    tick();
    ctx.track?.('show_complete', { mode });
    try {
      spec.onComplete?.({ mode });
    } catch (e) {
      console.error(e);
    }
    if (mode === 'tv') {
      if (!endFired && !destroyed) {
        endFired = true;
        try {
          opts.onEnd?.();
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }
    if (endEl) {
      const actions = spec.endActions?.(ctl) || [];
      endEl.replaceChildren(
        el(`div.${P}-end__inner`, el(`button.btn.btn--vital.${P}-end__again`, { type: 'button', onclick: () => start() }, '↻ Watch again'), ...actions),
      );
      endEl.hidden = false;
    }
  }

  function pause() {
    if (state !== 'playing') return;
    frozenAt = elapsed();
    if (tl.pause()) {
      setState('paused');
      if (progressBar && total) {
        progressBar.style.transition = 'none';
        progressBar.style.transform = `scaleX(${frozenAt / total})`;
      }
    }
  }

  function resume() {
    if (state !== 'paused') return;
    setState('playing');
    tl.resume();
  }

  function toggle() {
    if (state === 'playing') pause();
    else if (state === 'paused') resume();
    else start();
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    tl.stop();
    d.run();
    try {
      spec.destroy?.();
    } catch (e) {
      console.error(e);
    }
    if (mode === 'tv') {
      screen.replaceChildren();
      screen.classList.remove(...addedClasses);
      screen.style.removeProperty('--sk-speed');
      delete screen.dataset.state;
    } else {
      page?.remove();
    }
  }

  setState('idle');
  spec.reset?.();

  if (mode === 'page' && spec.below) {
    const below = spec.below(ctl);
    if (below) page.append(el(`div.${P}-below`, below));
  }
  if (mode === 'tv' || spec.autoplay) d.timeout(() => start(), 60);
  return ctl;
}

/** Toggle `.is-on` on the layer whose data-layer matches `name`. */
export function switchLayers(stage, name, selector = '[data-layer]') {
  for (const layer of stage.querySelectorAll(selector)) layer.classList.toggle('is-on', layer.dataset.layer === name);
  stage.dataset.scene = name;
}

/** Static, trusted SVG markup -> element. Never pass user-controlled strings here. */
export function svg(ctx, cls, markup) {
  return ctx.dom.el(cls, { html: markup });
}
