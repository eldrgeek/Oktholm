// The captor's texts: a pager card that reacts to what the visitor does on this site, a thread sheet with the
// full history, The Breakup (push your luck) and a PNG export of the thread. Every word comes from
// brand.content.captor; timing and gating rules live in ./captor-rules.js (pure, unit-tested).
//
// The voice is the brand's. The one thing that isn't a joke: Block works. After the captor's last word it stops
// every text and tab title, instantly and for good (until the visitor unblocks). The card is part of this site
// (a pager on the night shift), never an imitation of an operating-system notification.
//
//   s.captor = mountCaptor(s)  ->  { breakup(), openThread(), block(), unblock(), destroy() }
//   Dev builds: ?captor=fast shortens every delay; window.__captor exposes state() and show(id).

import './captor.css';
import { el, disposer, fill, prefersReducedMotion } from '../engine/dom.js';
import { stripTags } from '../engine/speech.js';
import { dayNumber, dailyPick, utcDateKey, seeded } from '../engine/rng.js';
import { wrapLines, roundRect, ensureFonts, downloadCanvas } from '../engine/canvas.js';
import { PRIORITY, parseTrigger, matchRoute, matchEvent, timeActive, nextVisit, pickReturn, gate, pickNext, wantsFiller, scaleRules, breakupFate, shortCode, textVars } from './captor-rules.js';

// Dev builds only (the __DEV__ checks stay inline so production builds drop the code). Read at import time:
// main.js tidies the query string away before anything mounts.
const FAST = typeof __DEV__ !== 'undefined' && __DEV__ && typeof location !== 'undefined' && /[?&]captor=fast\b/.test(location.search);

// Generic interface labels. Brand data can override any of them with captor.ui.
const UI = {
  now: 'now',
  close: 'Close',
  openThread: 'Open thread',
  screenshot: 'Screenshot the thread',
  thread: 'Messages',
  empty: 'No messages yet.',
  edited: '(edited)',
  voice: 'Voice note',
  play: 'Play voice note',
  stop: 'Stop voice note',
  missed: 'Missed call',
  declined: 'Declined call',
  answered: 'Call answered',
  reply: 'Your reply',
  push: 'Leave it on read',
  read: 'Left on read',
  again: 'Try again',
  chip: 'Chip earned',
  unblocked: 'Unblocked.',
};

const HISTORY_MAX = 80;
const CARD_MS = 9000;
const CALL_MS = 14000;
const THREAD_GAP_MS = 1200;
const EDIT_GAP_MS = 1400;
const TYPING_MS = 900;

const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const arr = (v) => (Array.isArray(v) ? v : []);
const slug = (t) => String(t || 'thread').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'thread';
const clock = (secs) => `${Math.floor(secs / 60)}:${String(Math.max(0, secs % 60)).padStart(2, '0')}`;
const nodes = (...list) => list.filter((n) => n instanceof Node);

export function mountCaptor(s) {
  const c = s?.brand?.content?.captor;
  const inert = { breakup() {}, openThread() {}, block() {}, unblock() {}, destroy() {} };
  if (!c || !Array.isArray(c.texts) || typeof document === 'undefined' || typeof s.track?.on !== 'function') return inert;

  const ui = { ...UI, ...obj(c.ui) };
  const contact = { name: '', avatar: '', status: '', ...obj(c.contact) };
  const voiceRole = c.voice || 'captor';
  const rules = scaleRules({ maxPerVisit: 3, minGapMs: 90000, firstDelayMs: 20000, ...obj(c.rules), quietRoutes: arr(c.rules?.quietRoutes) }, FAST);
  const store = s.store.scope('captor');
  const d = disposer();
  // A private speech channel: route changes and shows call s.speech.stop(); voice notes shouldn't care.
  const voice = typeof s.makeSpeech === 'function' ? s.makeSpeech() : s.speech;
  const texts = c.texts.filter((t) => t && t.id).map((t, order) => ({ ...t, order, trig: parseTrigger(t.on) }));
  const byId = new Map(texts.map((t) => [t.id, t]));
  const b = obj(c.breakup);
  const t0 = Date.now();
  let alive = true;

  // ---- Persistent state. The records page prints all of it, so it stays small and legible.
  const seen = obj(store.get('seen', {}));
  const history = arr(store.get('history', [])).filter((e) => e && typeof e.text === 'string');
  const routesSeen = obj(store.get('routes', {})); // only the paths an after: trigger asks about
  let blocked = Boolean(store.get('blocked', false));
  let count = Number(store.get('count', 0)) || 0;
  const { visit } = nextVisit(store.get('visit', null), t0);
  store.set('visit', visit);
  let savedAt = t0;

  const st = {
    route: null, // { room, path }
    admStart: 0,
    admEnded: 0,
    admWas: false,
    tourAt: 0,
    triage: false,
    readyAt: t0 + rules.firstDelayMs,
    queue: [],
    batch: 0,
    fillerQueued: false,
    timeCheckedAt: 0,
    card: null,
    sheet: null,
    game: null,
    title: null, // { ours, original } while the tab title is ours
    interacted: false,
  };

  const live = el('div.cp-sr', { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  document.body.append(live);
  let liveTimer = 0;
  function speak(text) {
    clearTimeout(liveTimer);
    live.textContent = '';
    liveTimer = setTimeout(() => (live.textContent = text), 80);
  }
  const announce = (text) => speak(`${contact.name}: ${text}`);
  d(() => clearTimeout(liveTimer));

  function saveVisit(now = Date.now()) {
    visit.lastAt = now;
    store.set('visit', visit);
    savedAt = now;
  }

  function pushHistory(entries) {
    history.push(...entries);
    if (history.length > HISTORY_MAX) history.splice(0, history.length - HISTORY_MAX);
    store.set('history', history);
  }

  // ---- Gating
  const admissionRunning = (now = Date.now()) =>
    Boolean((st.admStart && !st.admEnded && now - st.admStart < 180000) || s.admissionActive === true || document.querySelector('.adm-overlay'));
  st.admWas = admissionRunning();
  function admissionEnded() {
    st.admEnded = Date.now();
    st.readyAt = Math.max(st.readyAt, st.admEnded + rules.firstDelayMs);
  }
  const tourRunning = (now) => Boolean(st.tourAt) && now - st.tourAt < 10 * 60000;
  const quietRoute = () => Boolean(st.route && rules.quietRoutes.includes(st.route.room));
  const busy = () => Boolean(st.card || st.sheet || document.querySelector('.modal-overlay'));

  function whyNot(now = Date.now()) {
    return gate({
      blocked,
      hidden: document.hidden,
      admission: admissionRunning(now),
      tour: tourRunning(now),
      triage: st.triage,
      quiet: quietRoute(),
      busy: busy(),
      shown: visit.shown,
      maxPerVisit: rules.maxPerVisit,
      now,
      readyAt: st.readyAt,
      lastShownAt: visit.lastShownAt,
      minGapMs: rules.minGapMs,
    });
  }

  // ---- Triggers -> queue
  function enqueue(t, { batch = ++st.batch, vars, kind = t.trig.kind, key = t.id } = {}) {
    if (blocked || seen[key] || st.queue.some((q) => q.key === key)) return;
    const delay = Math.max(0, Number(t.delayMs) || 0);
    st.queue.push({
      key,
      t,
      kind,
      prio: PRIORITY[kind] || 0,
      batch,
      order: t.order || 0,
      dueAt: Date.now() + (rules.delayCapMs != null ? Math.min(delay, rules.delayCapMs) : delay),
      path: t.trig?.path,
      rule: t.trig?.rule,
      vars,
    });
  }

  function checkTime() {
    st.timeCheckedAt = Date.now();
    const now = new Date();
    const batch = ++st.batch;
    for (const t of texts) if (t.trig.kind === 'time' && timeActive(t.trig.rule, now)) enqueue(t, { batch });
  }

  function onRoute(room, path) {
    if (!path) return;
    const p = String(path);
    st.route = { room: String(room || ''), path: p };
    if (st.route.room !== 'triage') st.triage = false; // left triage halfway: it's over
    st.queue = st.queue.filter((q) => q.kind !== 'route' || matchRoute(q.path, p));
    if (quietRoute()) st.card?.dismiss('quiet');
    const batch = ++st.batch;
    for (const t of texts) {
      if (t.trig.kind === 'route' && matchRoute(t.trig.path, p)) enqueue(t, { batch });
      else if (t.trig.kind === 'after' && routesSeen[t.trig.path] && !matchRoute(t.trig.path, p)) enqueue(t, { batch });
    }
    let dirty = false;
    for (const t of texts) {
      if (t.trig.kind === 'after' && !routesSeen[t.trig.path] && matchRoute(t.trig.path, p)) {
        routesSeen[t.trig.path] = Date.now();
        dirty = true;
      }
    }
    if (dirty) store.set('routes', routesSeen);
  }

  // Referral progress, only for visitors who have shared something: nobody else can have referrals, and the
  // site promises it only calls home when you do something that counts.
  async function checkReferrals() {
    if (blocked || !texts.some((t) => t.trig.kind === 'referral') || !s.api?.get || !s.referral) return;
    const prev = obj(store.get('referral', {}));
    const shared = (s.referral.shares?.() || 0) > 0 || Boolean(store.get('exported', false)) || prev.landed > 0 || prev.sponsees > 0;
    if (!shared) return;
    const r = await s.api.get('/sponsor/' + encodeURIComponent(s.referral.patientId()));
    if (!alive || !r || typeof r !== 'object') return;
    const landed = Number(r.landed) || 0;
    const sponsees = Number(r.sponsees) || 0;
    const batch = ++st.batch;
    for (const t of texts) {
      if (t.trig.kind !== 'referral') continue;
      if (t.trig.what === 'landed' && landed > (Number(prev.landed) || 0)) enqueue(t, { batch, vars: { n: landed } });
      if (t.trig.what === 'sponsee' && sponsees > (Number(prev.sponsees) || 0)) enqueue(t, { batch, vars: { n: sponsees } });
    }
    store.set('referral', { landed, sponsees });
    schedule();
  }

  function queueFiller() {
    st.fillerQueued = true;
    const pool = texts.filter((t) => t.trig.kind === 'any' && !seen[t.id]);
    if (pool.length) enqueue(pool[Math.floor(Math.random() * pool.length)], { kind: 'any' });
  }

  function seed() {
    const batch = ++st.batch;
    if (visit.n === 1) for (const t of texts) if (t.trig.kind === 'first-visit') enqueue(t, { batch });
    const back = pickReturn(texts, visit.away, seen);
    if (back) enqueue(back, { batch });
    checkTime();
    const daily = arr(c.daily);
    if (visit.n > 1 && daily.length) {
      const key = utcDateKey();
      if (store.get('daily', null) !== key) {
        const text = dailyPick(daily, 'captor', s.brand.epoch);
        if (text) enqueue({ id: 'daily:' + key, on: 'daily', text, order: 0, trig: { kind: 'daily' } }, { batch, kind: 'daily' });
      }
    }
    const cur = s.router?.current;
    if (cur) onRoute(cur.name, cur.path);
    checkReferrals().catch(() => {});
  }

  // ---- Scheduler
  function tick() {
    if (!alive) return;
    const now = Date.now();
    const adm = admissionRunning(now);
    if (st.admWas && !adm) admissionEnded();
    st.admWas = adm;
    if (now - st.timeCheckedAt > 60000) checkTime();
    if (!document.hidden && now - savedAt > 30000) saveVisit(now);
    // A closed time window can't come back this visit; drop it so it doesn't hold up a filler.
    st.queue = st.queue.filter((q) => q.kind !== 'time' || timeActive(q.rule, new Date(now)));
    if (!blocked && !st.fillerQueued && wantsFiller({ now, fillAt: st.readyAt + rules.firstDelayMs, shown: visit.shown, filler: visit.filler, queue: st.queue })) queueFiller();
    if (whyNot(now)) return;
    const next = pickNext(st.queue, { now, seen, path: st.route ? st.route.path : null, shown: visit.shown, isTimeActive: (r) => timeActive(r, new Date(now)) });
    if (next) present(next);
  }
  let soon = 0;
  function schedule() {
    if (alive && !soon) soon = setTimeout(() => ((soon = 0), tick()), 0);
  }
  d(() => clearTimeout(soon));

  // ---- Presenting a text
  function entriesFor(t, vars, at) {
    const them = (text, extra) => ({ at, from: 'them', text, ...extra });
    if (t.call) return [them(String(t.call.label || ''), { kind: 'call', outcome: 'missed' })];
    if (t.voice) return [them(String(t.voice), { kind: 'voice' })];
    if (Array.isArray(t.edits) && t.edits.length) return [them(fill(t.edits[t.edits.length - 1], vars), t.edits.length > 1 ? { edited: 1 } : {})];
    if (Array.isArray(t.thread)) return t.thread.map((x) => them(fill(x, vars)));
    return [them(fill(t.text || '', vars))];
  }

  function present(item) {
    const now = Date.now();
    st.queue = st.queue.filter((q) => q.key !== item.key);
    if (item.kind === 'daily') store.set('daily', item.key.slice('daily:'.length));
    else {
      seen[item.key] = now;
      store.set('seen', seen);
    }
    visit.shown += 1;
    visit.lastShownAt = now;
    if (item.kind === 'any') visit.filler = true;
    saveVisit(now);
    store.set('count', ++count);
    const vars = textVars(visit.away, item.vars);
    const entries = entriesFor(item.t, vars, now);
    pushHistory(entries);
    s.track('captor_text', { id: item.t.id, trigger: item.t.on });
    arrivalCue(item.t.call ? 'call' : 'text');
    st.card = showCard(item.t, vars, entries);
  }

  function audioUnlocked() {
    const ua = typeof navigator !== 'undefined' ? navigator.userActivation : null;
    return ua ? ua.hasBeenActive : st.interacted;
  }
  const noteInteraction = () => (st.interacted = true);
  d.on(document, 'pointerdown', noteInteraction, { once: true, capture: true });
  d.on(document, 'keydown', noteInteraction, { once: true, capture: true });

  // A soft pager chirp, only once sound is unlocked and on.
  function arrivalCue(kind) {
    const tone = s.sfx?.tone;
    if (!tone || s.audio?.isMuted?.() || !audioUnlocked()) return;
    if (kind === 'call') {
      for (const at of [0, 0.45]) {
        tone(988, 0.1, { type: 'sine', gain: 0.03, delay: at });
        tone(1319, 0.12, { type: 'sine', gain: 0.026, delay: at + 0.12 });
      }
    } else {
      tone(1319, 0.06, { type: 'sine', gain: 0.028 });
      tone(1760, 0.09, { type: 'sine', gain: 0.022, delay: 0.08 });
    }
  }

  // ---- Shared bits: bubbles, typing dots, voice notes, the "how does it know" link
  function bubble(from, text, edited) {
    const txt = el('span.cp-bubble__text', text);
    const tag = el('span.cp-edited', { hidden: !edited }, ' ' + ui.edited);
    const node = el(`div.cp-msg.cp-msg--${from}`, el('p.cp-bubble', txt, tag));
    return { node, txt, tag };
  }

  const typingDots = () => el('div.cp-msg.cp-msg--them', { 'aria-hidden': 'true' }, el('span.cp-typing', el('i'), el('i'), el('i')));

  const howLink = (onClick) => (c.howKnow?.label ? el('a.cp-how', { href: '#' + (c.howKnow.path || '/'), text: c.howKnow.label, onclick: () => onClick?.() }) : null);

  function voiceNote(raw, { onPlaying } = {}) {
    const secs = Math.max(1, Math.round(voice?.estimate ? voice.estimate(raw) : 3));
    const rng = seeded('wave:' + raw);
    const bars = Array.from({ length: 28 }, () => el('i', { style: { height: `${Math.round(22 + rng() * 78)}%` } }));
    const dur = el('span.cp-voice__dur', clock(secs));
    const glyph = el('span', { 'aria-hidden': 'true' }, '▶');
    const btn = el('button.cp-voice__play', { type: 'button', 'aria-label': ui.play, title: ui.play }, glyph);
    let playing = false;
    let timer = 0;
    let token = 0;
    const reset = () => {
      playing = false;
      clearInterval(timer);
      bars.forEach((x) => x.classList.remove('cp-is-on'));
      dur.textContent = clock(secs);
      glyph.textContent = '▶';
      btn.setAttribute('aria-label', ui.play);
      btn.title = ui.play;
      onPlaying?.(false);
    };
    btn.addEventListener('click', async () => {
      if (playing) {
        token++;
        voice.stop?.();
        return reset();
      }
      voice.stop?.();
      s.audio?.unlock?.();
      const mine = ++token;
      playing = true;
      glyph.textContent = '■';
      btn.setAttribute('aria-label', ui.stop);
      btn.title = ui.stop;
      onPlaying?.(true);
      const start = Date.now();
      timer = setInterval(() => {
        const t = Date.now() - start;
        const p = Math.min(1, t / (secs * 1000));
        bars.forEach((x, i) => x.classList.toggle('cp-is-on', i / bars.length < p));
        dur.textContent = clock(Math.max(0, secs - Math.floor(t / 1000)));
      }, 120);
      try {
        await voice.say(raw, { voice: voiceRole, fallback: 'silent' });
      } finally {
        if (mine === token && playing) reset();
      }
    });
    const node = el(
      'div.cp-voicenote',
      el('div.cp-voice', btn, el('div.cp-wave', { 'aria-hidden': 'true' }, bars), dur),
      el('p.cp-transcript', el('span.cp-sr', ui.voice + ': '), stripTags(raw)),
    );
    return {
      node,
      stop() {
        token++;
        if (!playing) return;
        voice.stop?.();
        reset();
      },
    };
  }

  // ---- The card
  function showCard(t, vars, entries) {
    const cd = disposer();
    const kind = t.block ? 'block' : t.call ? 'call' : t.voice ? 'voice' : Array.isArray(t.edits) ? 'edits' : Array.isArray(t.thread) ? 'thread' : 'text';
    const wait = (ms) => new Promise((r) => cd.timeout(r, ms));
    const body = el('div.cp-card__body');
    const closeBtn = el('button.cp-x', { type: 'button', 'aria-label': ui.close, title: ui.close }, el('span', { 'aria-hidden': 'true' }, '✕'));
    // On a call, Answer is the one primary button.
    const openBtn = el(`button.btn.btn--sm.cp-btn.${kind === 'call' ? 'btn--ghost' : 'btn--vital'}`, { type: 'button', text: ui.openThread });
    const blockBtn = el('button.btn.btn--ghost.btn--sm.cp-btn', { type: 'button', text: c.block?.button || 'Block' });
    const foot = el('div.cp-card__foot', el('div.cp-card__actions', openBtn, blockBtn), howLink(() => dismiss('how')));
    const root = el(
      `aside.cp-card.cp-card--${kind}`,
      { 'aria-label': contact.name },
      el(
        'div.cp-card__head',
        el('span.cp-avatar', { 'aria-hidden': 'true' }, contact.avatar),
        el('div.cp-who', el('b.cp-who__name', contact.name), el('span.cp-who__status', contact.status)),
        el('span.cp-card__time', ui.now),
        closeBtn,
      ),
      body,
      foot,
    );
    document.body.append(root);
    s.cue?.suppress?.('captor', true);

    let gone = false;
    let armed = false; // the countdown starts once everything has arrived
    let remaining = kind === 'call' ? CALL_MS : CARD_MS;
    let hover = false;
    let focused = false;
    let holding = false; // a voice note or an answered call is playing
    let note = null;

    cd.on(root, 'mouseenter', () => (hover = true));
    cd.on(root, 'mouseleave', () => {
      hover = false;
      remaining = Math.max(remaining, 3000);
    });
    cd.on(root, 'focusin', () => (focused = true));
    cd.on(root, 'focusout', (e) => {
      if (root.contains(e.relatedTarget)) return;
      focused = false;
      remaining = Math.max(remaining, 3000);
    });
    cd.interval(() => {
      if (!armed || hover || focused || holding || document.hidden) return;
      remaining -= 250;
      if (remaining <= 0) dismiss('timeout');
    }, 250);

    closeBtn.addEventListener('click', () => dismiss('close'));
    openBtn.addEventListener('click', () => openThread('card'));
    blockBtn.addEventListener('click', () => block('card'));

    if (kind === 'text') {
      body.append(bubble('them', entries[0].text).node);
      announce(entries[0].text);
      armed = true;
    } else if (kind === 'thread') {
      (async () => {
        const msgs = entries.map((e) => e.text);
        for (let i = 0; i < msgs.length; i++) {
          if (i > 0) {
            const dots = typingDots();
            body.append(dots);
            await wait(THREAD_GAP_MS);
            dots.remove();
          }
          body.append(bubble('them', msgs[i]).node);
          while (body.children.length > 3) body.firstChild.remove();
          announce(msgs[i]);
        }
        armed = true;
      })();
    } else if (kind === 'edits') {
      const versions = t.edits.map((x) => fill(x, vars));
      const bb = bubble('them', versions[0]);
      body.append(bb.node);
      announce(versions[0]);
      (async () => {
        for (let i = 1; i < versions.length; i++) {
          await wait(EDIT_GAP_MS);
          bb.txt.textContent = versions[i];
          bb.tag.hidden = false;
          bb.node.classList.remove('cp-is-edited');
          void bb.node.offsetWidth;
          bb.node.classList.add('cp-is-edited');
          announce(`${versions[i]} ${ui.edited}`);
        }
        armed = true;
      })();
    } else if (kind === 'voice') {
      note = voiceNote(t.voice, { onPlaying: (on) => (holding = on) });
      body.append(el('div.cp-msg.cp-msg--them', note.node));
      announce(`${ui.voice}. ${stripTags(t.voice)}`);
      armed = true;
    } else if (kind === 'call') {
      const call = obj(t.call);
      const entry = entries[0];
      const answer = el('button.btn.btn--vital.cp-btn', { type: 'button', text: call.answer || 'Answer' });
      const decline = el('button.btn.btn--alarm.cp-btn', { type: 'button', text: call.decline || 'Decline' });
      const btns = el('div.cp-call__btns', answer, decline);
      const caption = el('p.cp-call__caption', { hidden: true });
      body.append(el('div.cp-call', el('p.cp-call__label', call.label || ''), btns, caption));
      root.classList.add('cp-is-ringing');
      announce(call.label || '');
      armed = true;
      const outcome = (o) => {
        entry.outcome = o;
        store.set('history', history);
      };
      answer.addEventListener('click', async () => {
        root.classList.remove('cp-is-ringing');
        holding = true;
        btns.hidden = true;
        caption.hidden = false;
        caption.textContent = stripTags(call.say || '');
        outcome('answered');
        s.audio?.unlock?.();
        voice.stop?.();
        await voice.say(call.say || '', { voice: voiceRole, fallback: 'silent' });
        if (gone) return;
        dismiss('answered');
        if (call.path) {
          if (s.router?.navigate) s.router.navigate(call.path);
          else location.hash = '#' + call.path;
        }
      });
      decline.addEventListener('click', () => {
        outcome('declined');
        dismiss('declined');
      });
    }

    // Blocked: the captor gets its last word, a system line (not the captor) confirms, then the card goes.
    function showBlocked(last, confirm) {
      if (gone) return;
      cd.run();
      note?.stop();
      holding = false;
      root.classList.remove('cp-is-ringing');
      root.classList.add('cp-card--blocked');
      foot.remove();
      body.replaceChildren();
      const beat = last ? 1300 : 0;
      if (last) {
        body.append(bubble('them', last).node);
        announce(last);
      }
      cd.timeout(() => {
        if (!confirm) return;
        body.append(el('p.cp-sys.cp-sys--block', confirm));
        speak(confirm);
      }, beat);
      cd.timeout(() => dismiss('blocked'), beat + 5200);
    }

    function dismiss(reason) {
      if (gone) return;
      gone = true;
      cd.run();
      note?.stop();
      // The gap to the next text counts from when this one leaves, so a long read doesn't shorten it.
      if (kind !== 'block') {
        visit.lastShownAt = Math.max(visit.lastShownAt || 0, Date.now());
        saveVisit();
      }
      if (st.card === ctl) st.card = null;
      s.cue?.suppress?.('captor', false);
      if (root.contains(document.activeElement)) document.activeElement.blur?.();
      root.classList.add('cp-is-out');
      root.dataset.dismissed = reason || '';
      setTimeout(() => root.remove(), prefersReducedMotion() ? 0 : 220);
      schedule();
    }

    const ctl = { root, dismiss, blocked: showBlocked };
    return ctl;
  }

  // ---- The thread sheet
  function openThread(source = 'api') {
    if (st.sheet) {
      st.sheet.focus();
      return st.sheet;
    }
    st.card?.dismiss('thread');
    st.sheet = buildSheet();
    s.track('captor_open', { source });
    return st.sheet;
  }

  function buildSheet() {
    const sd = disposer();
    const prevFocus = document.activeElement;
    const notes = new Set();
    let closed = false;
    const log = el('div.cp-log', { role: 'log', 'aria-live': 'polite', 'aria-label': ui.thread });
    const result = el('div.cp-result', { hidden: true });
    const scroller = el('div.cp-sheet__body', log, result);
    const closeBtn = el('button.cp-x', { type: 'button', 'aria-label': ui.close, title: ui.close }, el('span', { 'aria-hidden': 'true' }, '✕'));
    const foot = el('div.cp-sheet__foot');
    const titleId = 'cp-sheet-title';
    const panel = el(
      'section.cp-sheet__panel',
      { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, tabindex: '-1' },
      el(
        'header.cp-sheet__head',
        el('span.cp-avatar', { 'aria-hidden': 'true' }, contact.avatar),
        el('div.cp-who', el('h2.cp-who__name.cp-sheet__title', { id: titleId }, contact.name), el('span.cp-who__status', contact.status)),
        closeBtn,
      ),
      scroller,
      foot,
    );
    const scrim = el('div.cp-sheet__scrim');
    const root = el('div.cp-sheet', scrim, panel);
    document.body.append(root);
    s.cue?.suppress?.('captor-thread', true);

    const scrollDown = () => (scroller.scrollTop = scroller.scrollHeight);
    const wait = (ms) => new Promise((r) => sd.timeout(r, ms));

    function entryNode(e) {
      if (e.from === 'sys') return el(`p.cp-sys${e.kind === 'block' ? '.cp-sys--block' : ''}`, e.text);
      if (e.kind === 'call') return el('p.cp-sys.cp-sys--call', el('span', { 'aria-hidden': 'true' }, '📞 '), ui[e.outcome] || e.text);
      if (e.kind === 'voice') {
        const n = voiceNote(e.text);
        notes.add(n);
        return el('div.cp-msg.cp-msg--them', n.node);
      }
      return bubble(e.from === 'me' ? 'me' : 'them', e.text, e.edited).node;
    }

    function renderLog() {
      notes.forEach((n) => n.stop());
      notes.clear();
      log.replaceChildren(...(history.length ? history.map(entryNode) : [el('p.cp-sys.cp-sys--empty', ui.empty)]));
      scrollDown();
    }

    /** Append an entry that's already in the history. */
    function show(entry) {
      log.querySelector('.cp-sys--empty')?.remove();
      log.append(entryNode(entry));
      scrollDown();
    }

    function add(entry) {
      pushHistory([entry]);
      show(entry);
    }

    function renderFoot() {
      if (st.game && !st.game.over) return;
      const btn = (cls, text, onClick) => el(`button.btn.btn--sm.cp-btn.${cls}`, { type: 'button', text, onclick: onClick });
      const leave = String(b.open || '').replace(/[.!]+$/, '');
      const canLeave = !blocked && Boolean(leave) && arr(b.rounds).length > 0;
      const compact = !result.hidden; // the result card has its own screenshot and try-again buttons
      foot.replaceChildren(
        ...nodes(
          el(
            'div.cp-sheet__actions',
            canLeave && !compact ? btn('btn--cure.cp-btn--leave', leave, () => startBreakup()) : null,
            compact ? null : btn('btn--ghost', ui.screenshot, () => exportPng()),
            blocked
              ? btn('btn--ghost.cp-btn--toggle', c.block?.unblock || 'Unblock', () => unblock())
              : btn('btn--ghost.cp-btn--toggle', c.block?.button || 'Block', () => block('thread')),
          ),
          howLink(() => close()),
        ),
      );
    }
    const focusToggle = () => foot.querySelector('.cp-btn--toggle')?.focus({ preventScroll: true });

    // Blocked from the thread: Unblock is there at once; the last word and the confirmation play out in the log.
    async function showBlocked(last, confirm) {
      hideResult();
      renderFoot();
      focusToggle();
      if (last) {
        const dots = typingDots();
        log.append(dots);
        scrollDown();
        await wait(prefersReducedMotion() ? 250 : 600);
        dots.remove();
        if (closed) return;
        show({ from: 'them', text: last });
        await wait(1000);
        if (closed) return;
      }
      if (confirm) show({ from: 'sys', kind: 'block', text: confirm });
    }

    function setChoices(list) {
      if (!list) {
        const had = panel.contains(document.activeElement) || document.activeElement === document.body;
        foot.replaceChildren(el('div.cp-choices.cp-choices--wait', { 'aria-hidden': 'true' }));
        if (had) panel.focus({ preventScroll: true });
        return;
      }
      const group = el(
        'div.cp-choices',
        { role: 'group', 'aria-label': ui.reply },
        list.filter(Boolean).map((x) => el(`button.btn.cp-btn.cp-choice.${x.cls}`, { type: 'button', text: x.text, onclick: x.onClick })),
      );
      foot.replaceChildren(group);
      group.querySelector('button')?.focus({ preventScroll: true });
      scrollDown();
    }

    function showResult(text, chip) {
      const title = el('p.cp-result__text', { tabindex: '-1' }, text);
      result.replaceChildren(
        ...nodes(
          title,
          chip ? el('p.cp-result__chip', el('span.cp-result__coin', { 'aria-hidden': 'true' }, chip.icon || '●'), `${ui.chip}: ${chip.name || chip.id}`) : null,
          s.share?.panel ? s.share.panel({ text, kind: 'breakup' }) : null,
          el(
            'div.cp-result__row',
            el('button.btn.btn--vital.btn--sm.cp-btn', { type: 'button', text: ui.screenshot, onclick: () => exportPng() }),
            el('button.btn.btn--ghost.btn--sm.cp-btn', { type: 'button', text: ui.again, onclick: () => startBreakup() }),
          ),
        ),
      );
      result.hidden = false;
      renderFoot();
      title.focus({ preventScroll: true });
      requestAnimationFrame(() => (scroller.scrollTop = Math.max(0, result.offsetTop - 12)));
    }

    function hideResult() {
      if (result.hidden) return;
      result.hidden = true;
      result.replaceChildren();
      renderFoot();
    }

    /** Typing dots, then the captor's line. Resolves false if the sheet closed or the game changed meanwhile. */
    async function typeThen(text, g) {
      const dots = typingDots();
      log.append(dots);
      scrollDown();
      await wait(prefersReducedMotion() ? 350 : TYPING_MS);
      dots.remove();
      if (closed || (g && g !== st.game)) return false;
      add({ at: Date.now(), from: 'them', text });
      return true;
    }

    function focusables() {
      return [...panel.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])')].filter(
        (n) => !n.closest('[hidden]') && n.getClientRects().length,
      );
    }
    sd.on(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        if (document.querySelector('.modal-overlay')) return;
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      const inside = panel.contains(document.activeElement);
      if (e.shiftKey && (!inside || document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || document.activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
    });
    // Keep focus in the dialog (a modal opened above it is the one exception).
    sd.on(document, 'focusin', (e) => {
      if (root.contains(e.target) || e.target.closest?.('.modal-overlay')) return;
      (focusables()[0] || panel).focus({ preventScroll: true });
    });
    scrim.addEventListener('click', () => close());
    closeBtn.addEventListener('click', () => close());

    function close() {
      if (closed) return;
      closed = true;
      sd.run();
      notes.forEach((n) => n.stop());
      if (st.game && !st.game.over) st.game = null; // left mid-breakup: no result
      root.remove();
      s.cue?.suppress?.('captor-thread', false);
      if (st.sheet === ctl) st.sheet = null;
      if (prevFocus && prevFocus.isConnected && prevFocus !== document.body) prevFocus.focus?.({ preventScroll: true });
      schedule();
    }

    renderLog();
    renderFoot();
    requestAnimationFrame(scrollDown);
    closeBtn.focus({ preventScroll: true });

    const ctl = {
      root,
      close,
      add,
      typeThen,
      setChoices,
      showResult,
      hideResult,
      renderFoot,
      blocked: showBlocked,
      focusToggle,
      focus: () => (focusables()[0] || panel).focus({ preventScroll: true }),
    };
    return ctl;
  }

  // ---- The Breakup: push your luck. Each round it counters with a bigger discount. Walk away to lock in what
  // you forced out of it, take the offer, or leave it on read and risk the auto-renewal. The renewal's timing
  // is seeded by the day, so everyone who pushes to the same round today gets the same fate.
  function breakup() {
    openThread('breakup');
    startBreakup();
  }

  async function startBreakup() {
    const sh = st.sheet;
    const rounds = arr(b.rounds);
    if (!sh || blocked || !rounds.length) return;
    if (st.game && !st.game.over) return sh.focus();
    const day = dayNumber(s.brand.epoch);
    const g = { over: false, round: -1, discount: 0, fate: breakupFate(day, arr(b.bustChance), rounds.length, arr(b.bust).length) };
    st.game = g;
    sh.hideResult();
    sh.setChoices(null);
    s.track('breakup_start', { day });
    sh.add({ at: Date.now(), from: 'me', text: String(b.open || '') });
    if (b.opener && !(await sh.typeThen(b.opener, g))) return;
    offer(0, g);
  }

  async function offer(i, g) {
    const sh = st.sheet;
    const rounds = arr(b.rounds);
    if (!sh || g !== st.game) return;
    if (i >= 1 && g.fate.bustAt === i) {
      if (!(await sh.typeThen(arr(b.bust)[g.fate.line] || '', g))) return;
      return finish(g, 'busted', 0);
    }
    const r = obj(rounds[i]);
    if (!(await sh.typeThen(r.offer || '', g))) return;
    g.round = i;
    g.discount = Number(r.discount) || 0;
    sh.setChoices([
      { text: fill(b.stay || '', { d: g.discount }), cls: 'btn--ghost', onClick: () => stay(g) },
      i < rounds.length - 1 ? { text: ui.push, cls: 'btn--amber', onClick: () => push(g) } : null,
      { text: b.walk || '', cls: 'btn--cure', onClick: () => walk(g) },
    ]);
  }

  const playing = (g) => Boolean(st.sheet) && g === st.game && !g.over;

  function stay(g) {
    if (!playing(g)) return;
    st.sheet.setChoices(null);
    st.sheet.add({ at: Date.now(), from: 'me', text: fill(b.stay || '', { d: g.discount }) });
    finish(g, 'stayed', g.discount);
  }

  function push(g) {
    if (!playing(g)) return;
    st.sheet.setChoices(null);
    st.sheet.add({ at: Date.now(), from: 'sys', text: ui.read });
    offer(g.round + 1, g);
  }

  async function walk(g) {
    if (!playing(g)) return;
    st.sheet.setChoices(null);
    st.sheet.add({ at: Date.now(), from: 'me', text: String(b.walk || '') });
    if (b.walked && !(await st.sheet.typeThen(b.walked, g))) return;
    finish(g, 'walked', g.discount);
  }

  function finish(g, result, discount) {
    g.over = true;
    const chipId = result === 'walked' ? 'walked-out' : result === 'busted' ? 'auto-renewed' : null;
    const fresh = chipId ? s.referral?.grantChip?.(chipId) : false;
    s.track('breakup_end', { result, discount });
    if (!st.sheet) return;
    const chip = fresh ? s.referral?.chipDef?.(chipId) || { id: chipId, name: chipId } : null;
    st.sheet.showResult(fill(obj(b.result)[result] || '', { d: discount }), chip);
  }

  // ---- Block: takes effect at once (queue emptied, no texts, no tab titles) and stays until the visitor
  // unblocks from the thread. The captor still gets its last word on the way out; then a system line confirms.
  function block(source = 'api') {
    if (blocked) return;
    blocked = true;
    store.set('blocked', Date.now());
    st.queue = [];
    if (st.game && !st.game.over) st.game = null;
    restoreTitle();
    const last = String(c.block?.lastWord || '');
    const confirm = String(c.block?.confirm || '');
    const now = Date.now();
    pushHistory([last && { at: now, from: 'them', text: last }, confirm && { at: now, from: 'sys', kind: 'block', text: confirm }].filter(Boolean));
    s.referral?.grantChip?.('blocked');
    s.track('captor_block', { texts_seen: count, source });
    if (st.sheet) st.sheet.blocked(last, confirm);
    else {
      if (!st.card) st.card = showCard({ id: 'block', block: true }, {}, []);
      st.card.blocked(last, confirm);
    }
  }

  function unblock() {
    if (!blocked) return;
    blocked = false;
    store.set('blocked', false);
    s.track('captor_unblock', {});
    const entry = { at: Date.now(), from: 'sys', text: ui.unblocked };
    if (!st.sheet) return pushHistory([entry]);
    st.sheet.add(entry);
    st.sheet.renderFoot();
    st.sheet.focusToggle();
  }

  // ---- Tab title while hidden: once per visit, never when blocked, favicon untouched.
  function restoreTitle() {
    if (st.title && document.title === st.title.ours) document.title = st.title.original;
    st.title = null;
  }
  d.on(document, 'visibilitychange', () => {
    const now = Date.now();
    if (!document.hidden) {
      restoreTitle();
      schedule();
      return;
    }
    saveVisit(now);
    const titles = arr(c.tabTitles);
    if (blocked || visit.title || !titles.length || admissionRunning(now)) return;
    const hospital = s.brand.site?.hospital;
    const ours = titles[Math.floor(Math.random() * titles.length)] + (hospital ? ' · ' + hospital : '');
    st.title = { ours, original: document.title };
    document.title = ours;
    visit.title = true;
    saveVisit(now);
  });
  d.on(window, 'pagehide', () => saveVisit());

  // ---- PNG export: 1080x1350, the last few bubbles under the contact header.
  function tokens() {
    const cs = getComputedStyle(document.documentElement);
    const v = (name, fb) => (cs.getPropertyValue(name) || '').trim() || fb;
    return {
      bg: v('--bg', '#070a0f'),
      surface: v('--surface', '#0f1620'),
      surface3: v('--surface-3', '#1a2a3e'),
      line: v('--line', '#1e2c3c'),
      line2: v('--line-2', '#2b3e55'),
      text: v('--text', '#e9f0f7'),
      dim: v('--text-dim', '#a3b3c5'),
      faint: v('--text-faint', '#6f8297'),
      vital: v('--vital', '#36f59a'),
      cure: v('--cure', '#4263eb'),
      cureInk: v('--cure-ink', '#ffffff'),
    };
  }

  function shareLink() {
    let origin = typeof location !== 'undefined' && location.origin && location.origin !== 'null' ? location.origin : '';
    if (!origin) {
      try {
        origin = new URL(s.brand.site?.url || '').origin;
      } catch {
        origin = '';
      }
    }
    return origin + '/r/' + shortCode(s.referral.patientId());
  }

  function drawThread() {
    const W = 1080;
    const H = 1350;
    const M = 72;
    const tk = tokens();
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const g = cv.getContext('2d');
    const display = (px) => `800 ${px}px Archivo, 'Arial Narrow', sans-serif`;
    const text = (w, px) => `${w} ${px}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const mono = (px) => `600 ${px}px 'IBM Plex Mono', ui-monospace, monospace`;

    g.fillStyle = tk.bg;
    g.fillRect(0, 0, W, H);
    g.save();
    g.globalAlpha = 0.35;
    g.strokeStyle = tk.line;
    g.lineWidth = 1;
    for (let x = 0; x <= W; x += 30) g.strokeRect(x, 0, 0.5, H);
    for (let y = 0; y <= H; y += 30) g.strokeRect(0, y, W, 0.5);
    g.restore();

    // Kicker + title
    const hospital = s.brand.site?.hospital || '';
    g.fillStyle = tk.vital;
    g.font = mono(24);
    if (hospital) g.fillText('● ' + hospital.toUpperCase(), M, 104);
    g.fillStyle = tk.text;
    g.font = display(84);
    let y = 196;
    for (const line of wrapLines(g, c.export?.title || '', W - 2 * M).slice(0, 2)) {
      g.fillText(line, M, y);
      y += 84;
    }

    // Phone card with the contact header
    const top = y + 6;
    const bottom = H - 244;
    g.fillStyle = tk.surface;
    roundRect(g, M, top, W - 2 * M, bottom - top, 40);
    g.fill();
    g.strokeStyle = tk.line2;
    g.lineWidth = 2;
    g.stroke();
    const hx = M + 40;
    const hy = top + 34;
    g.fillStyle = tk.surface3;
    g.beginPath();
    g.arc(hx + 38, hy + 38, 38, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = tk.vital;
    g.lineWidth = 3;
    g.stroke();
    g.save();
    g.font = '40px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = tk.text;
    g.fillText(contact.avatar || '', hx + 38, hy + 40);
    g.restore();
    g.fillStyle = tk.text;
    g.font = text(800, 36);
    g.fillText(contact.name, hx + 98, hy + 32);
    g.fillStyle = tk.vital;
    g.font = mono(22);
    g.fillText(contact.status, hx + 98, hy + 66);
    g.fillStyle = tk.line2;
    g.fillRect(M + 2, hy + 104, W - 2 * M - 4, 2);

    // Bubbles: the last few that fit, oldest first.
    const areaTop = hy + 132;
    const areaBottom = bottom - 36;
    const innerL = M + 36;
    const innerR = W - M - 36;
    const maxW = Math.round((innerR - innerL) * 0.8);
    const padX = 26;
    const padY = 18;
    const lineH = 40;
    const gap = 16;
    const label = (e) => {
      if (e.kind === 'voice') return '▶ ' + stripTags(e.text);
      if (e.kind === 'call') return '📞 ' + (ui[e.outcome] || e.text);
      return e.text + (e.edited ? ' ' + ui.edited : '');
    };
    const items = history
      .filter((e) => e && e.text)
      .slice(-6)
      .map((e) => {
        const sys = e.from === 'sys' || e.kind === 'call';
        g.font = sys ? mono(22) : text(400, 30);
        const words = sys ? label(e).toUpperCase() : label(e);
        const lines = wrapLines(g, words, sys ? innerR - innerL - 40 : maxW - 2 * padX).slice(0, sys ? 3 : 7);
        return { e, sys, lines, h: sys ? lines.length * 30 + 12 : lines.length * lineH + 2 * padY };
      });
    if (!items.length) items.push({ e: { from: 'sys' }, sys: true, lines: [ui.empty.toUpperCase()], h: 42 });
    while (items.length > 1 && items.reduce((n, it) => n + it.h + gap, -gap) > areaBottom - areaTop) items.shift();
    let by = areaTop;
    for (const it of items) {
      if (it.sys) {
        g.font = mono(22);
        g.fillStyle = tk.faint;
        g.textAlign = 'center';
        it.lines.forEach((ln, i) => g.fillText(ln, W / 2, by + 26 + i * 30));
        g.textAlign = 'left';
      } else {
        g.font = text(400, 30);
        const w = Math.min(maxW, Math.max(...it.lines.map((ln) => g.measureText(ln).width)) + 2 * padX);
        const me = it.e.from === 'me';
        const x = me ? innerR - w : innerL;
        g.fillStyle = me ? tk.cure : tk.surface3;
        roundRect(g, x, by, w, it.h, 28);
        g.fill();
        g.fillStyle = me ? tk.cureInk : tk.text;
        it.lines.forEach((ln, i) => g.fillText(ln, x + padX, by + padY + 30 + i * lineH));
      }
      by += it.h + gap;
    }

    // Footer: the sign-off and the visitor's short referral link
    g.fillStyle = tk.vital;
    g.font = display(60);
    const fy = H - 150;
    const sign = wrapLines(g, c.export?.footer || '', W - 2 * M)[0] || '';
    g.fillText(sign, M, fy);
    g.fillStyle = tk.dim;
    let px = 28;
    const cta = fill(c.export?.cta || '{link}', { link: shareLink() });
    g.font = mono(px);
    while (px > 16 && g.measureText(cta).width > W - 2 * M) g.font = mono(--px);
    g.fillText(cta, M, fy + 62);
    return cv;
  }

  let exporting = false;
  async function exportPng() {
    if (exporting) return;
    exporting = true;
    try {
      await ensureFonts(['800 84px Archivo', "400 30px 'Plus Jakarta Sans'", "800 36px 'Plus Jakarta Sans'", "600 24px 'IBM Plex Mono'"]);
      const ok = await downloadCanvas(drawThread(), slug(c.export?.title) + '.png');
      if (!ok) return;
      store.set('exported', Date.now());
      s.track('share', { platform: 'download', kind: 'captor-thread' });
      s.referral?.grantChip?.('receipts');
    } catch (e) {
      console.error(e);
    } finally {
      exporting = false;
    }
  }

  // ---- Wiring
  d(
    s.track.on((event, props) => {
      if (!alive || typeof event !== 'string' || event.startsWith('captor_') || event.startsWith('breakup_')) return;
      const p = obj(props);
      const now = Date.now();
      switch (event) {
        case 'room_view':
          onRoute(p.room, p.path);
          break;
        case 'admission_start':
          st.admStart = now;
          st.admEnded = 0;
          st.card?.dismiss('quiet');
          break;
        case 'admission_end':
          admissionEnded();
          break;
        case 'tour_start':
          st.tourAt = now;
          st.card?.dismiss('quiet');
          break;
        case 'tour_end':
          st.tourAt = 0;
          break;
        case 'triage_start':
          st.triage = true;
          st.card?.dismiss('quiet');
          break;
        case 'triage_complete':
          st.triage = false;
          break;
        default:
          break;
      }
      const batch = ++st.batch;
      for (const t of texts) if (t.trig.kind === 'event' && matchEvent(t.trig, event, p)) enqueue(t, { batch });
      schedule();
    }),
  );
  d.interval(tick, 1000);
  seed();
  schedule();

  function destroy() {
    if (!alive) return;
    st.card?.dismiss('destroy');
    st.sheet?.close();
    alive = false;
    d.run();
    restoreTitle();
    voice?.stop?.();
    live.remove();
    if (typeof __DEV__ !== 'undefined' && __DEV__) delete window.__captor;
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    window.__captor = {
      fast: FAST,
      state: () => ({
        visit: { ...visit },
        blocked,
        count,
        route: st.route,
        readyIn: Math.max(0, st.readyAt - Date.now()),
        why: whyNot(),
        queue: st.queue.map((q) => ({ key: q.key, kind: q.kind, dueIn: Math.max(0, q.dueAt - Date.now()) })),
        seen: Object.keys(seen),
        history: history.length,
        card: st.card ? st.card.root.className : null,
        sheet: Boolean(st.sheet),
      }),
      /** Show a text by id right now, skipping the rules (screenshots, QA). */
      show(id) {
        const t = byId.get(id);
        if (!t) return false;
        st.card?.dismiss('forced');
        st.sheet?.close();
        present({ key: t.id, t, kind: t.trig.kind, vars: { n: 3, days: 3 } });
        return true;
      },
      tick,
      api: () => api,
    };
  }

  const api = { breakup, openThread: () => void openThread('api'), block: () => block('api'), unblock, destroy };
  return api;
}
