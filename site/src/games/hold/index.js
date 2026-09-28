// Please Hold: a vendor-support hold simulator. The hold clock is computed from timestamps (Date.now),
// never by counting ticks, so a hidden or throttled tab can't slow time down. Everything the IVR says
// is captioned; it is also spoken when the visitor has sound on. All lines come from ctx.content.

import './style.css';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const LETTERS = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ', 0: 'OPER' };
const DTMF = {
  1: [697, 1209], 2: [697, 1336], 3: [697, 1477],
  4: [770, 1209], 5: [770, 1336], 6: [770, 1477],
  7: [852, 1209], 8: [852, 1336], 9: [852, 1477],
  '*': [941, 1209], 0: [941, 1336], '#': [941, 1477],
};
const LOG_MAX = 40;
const TICK_MS = 250;

// Static, trusted SVG (safe for the `html` prop).
const ICON_PHONE =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>';

const DEFAULTS = {
  vendor: '[REDACTED]',
  phoneLabel: 'Support line',
  greeting: 'Thank you for calling support. Your call is important to us. Please hold.',
  idleCaption: 'Press call to join the queue.',
  intro: ['Press “Call vendor support.”', 'Wait.', 'Hang up when you have had enough.'],
  announcements: [
    'Your call is important to us. Please continue to hold.',
    'All of our representatives are currently assisting other customers.',
    'Please stay on the line. Calls are answered in the order they are received.',
  ],
  waits: ['a while', 'longer than expected'],
  songs: ['Hold Music No. 1'],
  queueUp: ['Your position in the queue has been updated.'],
  nextInLine: 'You are next in line.',
  reps: [{ name: 'Alex', tier: 'Tier 1', lines: ['Hi, thanks for holding. Have you tried turning it off and on again?', 'Let me escalate this for you.'] }],
  transfer: 'Transferring you to {tier}. You are caller number {pos}.',
  sales: { name: 'Sam', tier: 'Sales', lines: ['Hi, Sales here! Let me transfer you back to Support.'], back: 'Transferred back. You are caller number {pos}.' },
  aiName: 'AI Assistant',
  ai: ['I am an AI assistant. Please hold.'],
  keys: {},
  repeatEmpty: 'There is no message to repeat yet.',
  drop: 'Call dropped. Please call again.',
  operator: 'Transferring you to an operator. You are now caller number {pos}.',
  noCall: 'Press call first.',
  repBusy: '{name} cannot hear the keypad.',
  invalidKey: 'That is not a valid option. Please hold.',
  milestones: [
    { at: 60, text: 'One minute on hold.' },
    { at: 300, text: 'Five minutes on hold.' },
    { at: 600, text: 'Ten minutes on hold.' },
  ],
  chipAt: 600,
  copy: {
    kicker: 'Support simulator',
    callLabel: 'Call support',
    hangupLabel: 'Hang up',
    againLabel: 'Call again',
    lineLabel: 'LINE 1',
    endedCaption: 'Call ended.',
    statusReady: 'READY',
    statusDialing: 'DIALING…',
    statusHold: 'ON HOLD',
    statusHoldTier: 'ON HOLD · {tier}',
    statusLive: 'CONNECTED · {tier}',
    statusEnded: 'CALL ENDED',
    holdTime: 'HOLD TIME',
    callerLabel: 'YOU ARE CALLER #',
    waitLabel: 'EST. WAIT',
    nowPlaying: 'NOW PLAYING',
    dialing: 'Dialing…',
    ivrName: 'IVR',
    milestoneName: 'Milestone',
    systemName: 'Line 1',
    repJoined: '{name} ({tier}) has joined the call.',
    youPressed: 'You pressed {key}.',
    queueLog: '{line} Now caller #{pos}.',
    newBest: 'New personal best.',
    pbTag: 'NEW PERSONAL BEST',
    soundOn: 'SPKR ON',
    soundOff: 'CAPTIONS ONLY',
    transcriptTitle: 'Live transcript',
    bestLabel: 'Your personal best:',
    bestNone: 'none yet',
    lifetime: 'Lifetime on hold: {time} across {calls} {callsWord}.',
    callWord: 'call',
    callsWord: 'calls',
    summaryKicker: 'Case #{ticket}',
    summaryTitle: 'Call summary',
    statusClosed: 'Status: Closed',
    statusDropped: 'Status: Disconnected',
    sumTime: 'Time on hold',
    sumEscalations: 'Times escalated',
    sumTransfers: 'Transfers',
    sumPosition: 'Final queue position',
    sumAnnouncements: 'Announcements endured',
    sumKeys: 'Buttons pressed',
    sumResolution: 'Resolution',
    resolutionNone: 'none',
    stamp: 'Unresolved',
    csat: 'A satisfaction survey has been sent.',
    bestNote: 'New personal best. Previous record: {prev}.',
    firstNote: 'First call on record.',
    bestSoFar: 'Personal best: {best}.',
    shareTitle: 'Share your hold time',
    timesOnce: 'once',
    timesTwice: 'twice',
    timesMany: '{n} times',
  },
  share: {
    text: 'I stayed on hold with {vendor} support for {time}. I’m not okay.',
    escalated: 'I stayed on hold with {vendor} support for {time}. Escalated {times}. Resolution: none.',
    quick: 'I lasted {time} on hold with {vendor} support before hanging up.',
  },
  cta: { kicker: 'Prescription', title: 'Skip the queue', facts: ['pricing', 'free'], kind: 'pricing' },
};

export function formatDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}

function mergeContent(content = {}) {
  const list = (v, d) => (Array.isArray(v) && v.length ? v : d);
  return {
    ...DEFAULTS,
    ...content,
    intro: list(content.intro, DEFAULTS.intro),
    announcements: list(content.announcements, DEFAULTS.announcements),
    waits: list(content.waits, DEFAULTS.waits),
    songs: list(content.songs, DEFAULTS.songs),
    queueUp: list(content.queueUp, DEFAULTS.queueUp),
    reps: list(content.reps, DEFAULTS.reps).filter((r) => r && Array.isArray(r.lines) && r.lines.length),
    ai: list(content.ai, DEFAULTS.ai),
    milestones: list(content.milestones, DEFAULTS.milestones)
      .filter((m) => m && Number(m.at) > 0)
      .sort((a, b) => a.at - b.at),
    sales: { ...DEFAULTS.sales, ...(content.sales || {}) },
    keys: { ...DEFAULTS.keys, ...(content.keys || {}) },
    copy: { ...DEFAULTS.copy, ...(content.copy || {}) },
    share: { ...DEFAULTS.share, ...(content.share || {}) },
    cta: { ...DEFAULTS.cta, ...(content.cta || {}) },
  };
}

export default {
  id: 'hold',
  kind: 'toy',
  title: 'Please Hold',
  blurb: 'A vendor-support hold simulator. Your call is important to us.',
  emoji: '☎️',
  minutes: '∞ min',
  therapy: 'Treats: Support Ticket Time Dilation',

  mount(root, ctx) {
    const { el, fill, disposer, sleep, prefersReducedMotion } = ctx.dom;
    const c = mergeContent(ctx.content);
    if (!c.reps.length) c.reps = DEFAULTS.reps;
    const t = c.copy;
    const R = ctx.rng.random;
    const reduce = prefersReducedMotion();
    const site = ctx.brand?.site?.name || '';
    const chipMs = (Number(c.chipAt) || 600) * 1000;
    const d = disposer();
    let mounted = true;
    let call = null; // the active (or last) call
    let music = null;
    d(() => {
      mounted = false;
    });

    // Shuffled decks: cycle through every line before repeating one.
    const deck = (items) => {
      let order = [];
      let i = 0;
      return () => {
        if (!items.length) return '';
        if (i >= order.length) {
          order = R.shuffle(items);
          i = 0;
        }
        return order[i++];
      };
    };
    const nextAnnouncement = deck(c.announcements);
    const nextWait = deck(c.waits);
    const nextSong = deck(c.songs);
    const nextQueueUp = deck(c.queueUp);
    const nextAi = deck(c.ai);

    const isLive = (cl) => mounted && cl && cl === call && !cl.ended;

    // ---------- Sounds (synth only) ----------
    const tone = (f, dur, opts = {}) => ctx.sfx.tone(f, dur, { type: 'sine', gain: 0.035, ...opts });
    const dtmf = (k) => (DTMF[k] || []).forEach((f) => tone(f, 0.14, { gain: 0.04 }));
    const ringback = () => [440, 480].forEach((f) => tone(f, 1.7, { gain: 0.022, attack: 0.03 }));
    const busySignal = () => [0, 0.7, 1.4].forEach((delay) => [480, 620].forEach((f) => tone(f, 0.35, { gain: 0.03, delay })));
    const sfxPickup = () => {
      ctx.sfx.noise(0.05, { gain: 0.14, freq: 1800 });
      tone(1400, 0.04, { type: 'square', gain: 0.02, delay: 0.05 });
    };
    const sfxHangup = () => {
      ctx.sfx.noise(0.08, { gain: 0.25, freq: 600 });
      tone(120, 0.1, { type: 'square', gain: 0.04 });
    };

    // ---------- DOM ----------
    const led = el('span.hold-led', { 'aria-hidden': 'true' });
    const statusEl = el('span.hold-lcd__status', t.statusReady);
    const timerEl = el('div.hold-timer', { role: 'timer', 'aria-label': t.holdTime }, '00:00');
    const pbTag = el('span.hold-pb', { hidden: true }, t.pbTag);
    const posEl = el('b.hold-pos', '--');
    const deltaEl = el('span.hold-delta', { 'aria-hidden': 'true' });
    const waitEl = el('span.hold-lcd__value', '--');
    const songEl = el('span.hold-song__title', '--');
    const lcd = el(
      'div.hold-lcd',
      el('div.hold-lcd__row', el('span.hold-lcd__line', led, t.lineLabel), statusEl),
      el('div.hold-lcd__row.hold-lcd__row--label', el('span.hold-lcd__label', t.holdTime), pbTag),
      timerEl,
      el(
        'div.hold-lcd__grid',
        el('div.hold-lcd__cell', el('span.hold-lcd__label', t.callerLabel), el('span.hold-lcd__pos', posEl, deltaEl)),
        el('div.hold-lcd__cell', el('span.hold-lcd__label', t.waitLabel), waitEl),
      ),
      el('div.hold-song', el('span.hold-song__label', `♪ ${t.nowPlaying}`), songEl),
    );

    const capWho = el('span.hold-caption__who', t.ivrName);
    const capText = el('p.hold-caption__text', c.idleCaption);
    const caption = el('div.hold-caption', { 'aria-live': 'polite', dataset: { kind: 'idle' } }, capWho, capText);

    const callBtn = el('button.btn.btn--lg.btn--block.hold-call', { type: 'button', onclick: () => (isLive(call) ? endCall('hangup') : startCall()) });

    const canToggle = typeof ctx.audio.toggle === 'function';
    const spk = el(canToggle ? 'button.hold-spk' : 'span.hold-spk', canToggle ? { type: 'button', onclick: () => ctx.audio.toggle() } : {});

    const keyEls = new Map();
    const keypad = el(
      'div.hold-keypad',
      { role: 'group', 'aria-label': 'Keypad' },
      KEYS.map((k) => {
        const b = el(
          'button.hold-key',
          { type: 'button', 'aria-label': `Key ${k}`, onclick: () => pressKey(k) },
          el('span.hold-key__digit', k),
          el('span.hold-key__letters', LETTERS[k] || ' '),
        );
        keyEls.set(k, b);
        return b;
      }),
    );

    const phone = el(
      'div.hold-phone',
      { dataset: { mode: 'idle' } },
      el('div.hold-phone__top', el('span.hold-phone__brand', c.phoneLabel), spk),
      lcd,
      caption,
      callBtn,
      keypad,
    );

    const bestEl = el('b');
    const lifetimeEl = el('p.hold-lifetime', { hidden: true });
    const logEl = el('ol.hold-log', { 'aria-label': t.transcriptTitle });
    const feed = el(
      'section.hold-feed.card.card--raised',
      el('div.hold-feed__head', el('span.kicker', t.transcriptTitle), el('span.hold-best', t.bestLabel, ' ', bestEl)),
      el('div.hold-log-wrap', logEl),
      lifetimeEl,
    );

    const summary = el('div.hold-summary');
    const section = el(
      'section.hold',
      el('header.hold-head', el('div.kicker', t.kicker), el('h2.hold-title', ctx.meta?.title || 'Please Hold'), ctx.meta?.blurb && el('p.hold-blurb', ctx.meta.blurb)),
      el('div.hold-layout', phone, feed),
      summary,
    );
    root.append(section);

    // ---------- Rendering helpers ----------
    // h:mm:ss needs a smaller face than mm:ss to fit the display.
    function setTimer(ms) {
      timerEl.textContent = formatDuration(ms);
      timerEl.classList.toggle('is-long', ms >= 3600000);
    }

    function setStatus(text, mode) {
      statusEl.textContent = text;
      phone.dataset.mode = mode;
    }

    function setCallBtn(state) {
      const live = state === 'live';
      callBtn.classList.toggle('btn--vital', !live);
      callBtn.classList.toggle('btn--alarm', live);
      callBtn.classList.toggle('is-live', live);
      callBtn.replaceChildren(el('span.hold-call__icon', { html: ICON_PHONE }), el('span', live ? t.hangupLabel : state === 'ended' ? t.againLabel : t.callLabel));
    }

    function renderSpk() {
      const muted = ctx.audio.isMuted();
      spk.textContent = `${muted ? '🔇' : '🔊'} ${muted ? t.soundOff : t.soundOn}`;
      spk.dataset.on = String(!muted);
      if (canToggle) spk.setAttribute('aria-pressed', String(!muted));
    }

    function renderBest() {
      const best = Number(ctx.store.get('best', 0)) || 0;
      const calls = Number(ctx.store.get('calls', 0)) || 0;
      const total = Number(ctx.store.get('total', 0)) || 0;
      bestEl.textContent = best ? formatDuration(best) : t.bestNone;
      lifetimeEl.hidden = !calls;
      lifetimeEl.textContent = calls ? fill(t.lifetime, { time: formatDuration(total), calls, callsWord: calls === 1 ? t.callWord : t.callsWord }) : '';
    }

    function renderIntro() {
      logEl.replaceChildren(
        ...c.intro.map((line, i) => el('li.hold-log__item.hold-log__item--intro', el('span.hold-log__num', String(i + 1)), el('span.hold-log__text', line))),
      );
    }

    function renderQueue(delta = 0) {
      posEl.textContent = call && call.phase !== 'dialing' ? String(call.pos) : '--';
      deltaEl.textContent = delta > 0 ? `▲${delta}` : delta < 0 ? `▼${-delta}` : '';
      deltaEl.dataset.dir = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
      if (delta && !reduce) {
        posEl.classList.remove('is-bump');
        void posEl.offsetWidth; // restart the animation
        posEl.classList.add('is-bump');
      }
    }

    function showCaption(kind, who, text) {
      caption.dataset.kind = kind;
      capWho.textContent = who;
      capText.textContent = text;
      if (!reduce) {
        caption.classList.remove('is-new');
        void caption.offsetWidth;
        caption.classList.add('is-new');
      }
    }

    const TAGS = { ivr: 'IVR', sys: 'LINE', queue: 'QUEUE', milestone: 'TIME', key: 'KEY' };
    function log(kind, text, who = '') {
      if (!call) return null;
      const stamp = formatDuration(Date.now() - call.startedAt);
      const bubble = kind === 'rep' || kind === 'sales' || kind === 'ai';
      const item = bubble
        ? el(
            `li.hold-log__item.hold-log__item--bubble.hold-log__item--${kind}`,
            el('div.hold-bubble', el('div.hold-bubble__who', el('span', who), el('span.hold-log__time', stamp)), el('p.hold-bubble__text', text)),
          )
        : el(`li.hold-log__item.hold-log__item--${kind}`, el('span.hold-log__time', stamp), el('span.hold-log__tag', TAGS[kind] || 'LOG'), el('span.hold-log__text', text));
      logEl.append(item);
      while (logEl.children.length > LOG_MAX) logEl.firstElementChild.remove();
      logEl.scrollTop = logEl.scrollHeight;
      return item;
    }

    function showTyping(who, kind = 'rep') {
      const item = el(
        'li.hold-log__item.hold-log__item--bubble.hold-log__item--typing',
        el('div.hold-bubble', el('div.hold-bubble__who', el('span', who)), el('span.hold-dots', { 'aria-hidden': 'true' }, el('i'), el('i'), el('i'))),
      );
      logEl.append(item);
      logEl.scrollTop = logEl.scrollHeight;
      showCaption(kind, who, '…');
      return item;
    }

    // Replays a one-shot CSS animation class (removed again on animationend).
    function flash(node, cls) {
      if (reduce) return;
      node.classList.remove(cls);
      void node.offsetWidth;
      node.classList.add(cls);
      node.addEventListener('animationend', () => node.classList.remove(cls), { once: true });
    }

    // ---------- Audio ----------
    function startMusic() {
      if (music || !isLive(call) || call.phase !== 'hold' || ctx.audio.isMuted()) return;
      music = ctx.audio.holdMusic();
    }

    function stopMusic() {
      if (!music) return;
      music.stop();
      music = null;
    }

    /** Caption + transcript, and speech when sound is on. Resolves when the line would have finished. */
    async function speak(cl, kind, who, text, voice = {}, { duck = false } = {}) {
      const seq = ++cl.seq;
      showCaption(kind, who, text);
      log(kind, text, who);
      const audible = !ctx.audio.isMuted() && !document.hidden;
      if (cl.talking) ctx.speech.stop(); // the IVR interrupts itself, as IVRs do
      cl.talking = true;
      if (duck && audible) stopMusic(); // ...and the music restarts from the top afterwards, as it does
      await ctx.speech.say(text, audible ? voice : { ...voice, silent: true });
      if (!isLive(cl) || seq !== cl.seq) return false;
      cl.talking = false;
      if (duck) startMusic();
      return true;
    }

    const IVR_VOICE = { voice: 'narrator' };
    const holdStatus = (cl) => fill(t.statusHoldTier || t.statusHold, { tier: String(c.reps[cl.repIndex % c.reps.length].tier || '').toUpperCase() });

    // ---------- Call flow ----------
    function startCall() {
      if (isLive(call)) return;
      call?.d.run();
      const now = Date.now();
      const cl = {
        d: disposer(),
        startedAt: now,
        phase: 'dialing',
        pos: R.int(38, 64),
        startPos: 0,
        escalations: 0,
        transfers: 0,
        announcements: 0,
        keys: 0,
        repIndex: 0,
        seq: 0,
        talking: false,
        ended: false,
        last: '',
        nextQueueAt: Infinity,
        nextAnnounceAt: Infinity,
        nextRepAt: Infinity,
        milestones: new Set(),
        pending: null,
        chip: false,
        best: false,
        prevBest: Number(ctx.store.get('best', 0)) || 0,
      };
      cl.startPos = cl.pos;
      call = cl;
      summary.replaceChildren();
      logEl.replaceChildren();
      pbTag.hidden = true;
      setTimer(0);
      waitEl.textContent = '--';
      songEl.textContent = '--';
      renderQueue(0);
      setCallBtn('live');
      setStatus(t.statusDialing, 'dialing');
      showCaption('sys', t.systemName, t.dialing);
      log('sys', t.dialing, t.systemName);
      ringback();
      cl.d.timeout(() => connect(cl), 2300);
      cl.d.interval(tick, TICK_MS);
      ctx.track('hold_start');
    }

    function connect(cl) {
      if (!isLive(cl)) return;
      const now = Date.now();
      cl.phase = 'hold';
      cl.last = c.greeting;
      cl.nextQueueAt = now + R.int(4000, 7000);
      cl.nextAnnounceAt = now + R.int(22000, 32000);
      cl.nextRepAt = now + R.int(75000, 120000); // first "representative" between 1:15 and 2:00
      sfxPickup();
      setStatus(holdStatus(cl), 'hold');
      waitEl.textContent = nextWait();
      songEl.textContent = nextSong();
      renderQueue(0);
      speak(cl, 'ivr', t.ivrName, c.greeting, IVR_VOICE, { duck: true });
    }

    function tick() {
      const cl = call;
      if (!isLive(cl)) return;
      const now = Date.now();
      const elapsed = now - cl.startedAt;
      setTimer(elapsed);
      checkMilestones(cl, elapsed);
      if (!cl.best && cl.prevBest > 0 && elapsed > cl.prevBest) {
        cl.best = true;
        pbTag.hidden = false;
        log('milestone', t.newBest);
      }
      if (cl.phase !== 'hold') return;
      if (now >= cl.nextRepAt) {
        repPickup(cl);
        return;
      }
      if (now >= cl.nextQueueAt) stepQueue(cl, now);
      // Queued captions (milestones, "next in line") wait for silence and then get a few seconds on screen.
      if (cl.pending && !cl.talking) {
        const p = cl.pending;
        cl.pending = null;
        showCaption(p.kind, p.who, p.text);
        cl.nextAnnounceAt = Math.max(cl.nextAnnounceAt, now + 7000);
        return;
      }
      if (now >= cl.nextAnnounceAt && !cl.talking) announce(cl);
    }

    function checkMilestones(cl, elapsed) {
      const due = c.milestones.filter((m) => elapsed >= m.at * 1000 && !cl.milestones.has(m.at));
      for (const m of due) {
        cl.milestones.add(m.at);
        log('milestone', m.text);
      }
      if (due.length) {
        // After a long hidden stretch several can be due at once: caption only the latest.
        const m = due[due.length - 1];
        cl.pending = { kind: 'milestone', who: `${t.milestoneName} · ${formatDuration(m.at * 1000)}`, text: m.text };
        flash(timerEl, 'is-milestone');
        ctx.sfx.ecg();
      }
      if (!cl.chip && elapsed >= chipMs) {
        cl.chip = true;
        ctx.referral.grantChip('on-hold-10');
      }
    }

    function stepQueue(cl, now) {
      cl.nextQueueAt = now + R.int(3500, 8000);
      if (cl.pos <= 1) return;
      const r = R();
      // Mostly down, sometimes UP. Never predictable.
      const delta = r < 0.68 ? -R.int(1, 3) : r < 0.9 ? R.int(1, 2) : 0;
      if (!delta) return;
      cl.pos = Math.max(1, cl.pos + delta);
      renderQueue(delta);
      if (delta > 0 && R.chance(0.45)) log('queue', fill(t.queueLog, { line: nextQueueUp(), pos: cl.pos }));
      if (cl.pos === 1) {
        log('queue', c.nextInLine);
        cl.pending = { kind: 'queue', who: t.systemName, text: c.nextInLine };
        cl.nextRepAt = Math.min(cl.nextRepAt, now + R.int(4000, 7000));
      }
    }

    function announce(cl, text) {
      const line = text || nextAnnouncement();
      cl.last = line;
      cl.announcements += 1;
      cl.nextAnnounceAt = Date.now() + R.int(20000, 40000);
      waitEl.textContent = nextWait();
      if (cl.announcements % 3 === 0) songEl.textContent = nextSong();
      return speak(cl, 'ivr', t.ivrName, line, IVR_VOICE, { duck: true });
    }

    /** A human (or Sales) picks up, reads a script, and hands you back to the queue. */
    async function converse(cl, convo, kind) {
      cl.phase = 'rep'; // set synchronously so tick() won't start another pickup
      cl.speaker = convo.name;
      stopMusic();
      if (cl.talking) ctx.speech.stop();
      sfxPickup();
      setStatus(fill(t.statusLive, { tier: String(convo.tier || '').toUpperCase() }), 'live');
      log('sys', fill(t.repJoined, { name: convo.name, tier: convo.tier }), t.systemName);
      const who = `${convo.name} · ${convo.tier}`;
      const voice = kind === 'sales' ? { voice: 'fast', rate: 1.15 } : { voice: 'anchor' };
      for (const line of convo.lines) {
        const typing = showTyping(who, kind);
        await sleep(R.int(700, 1200));
        typing.remove();
        if (!isLive(cl)) return false;
        await speak(cl, kind, who, line, voice);
        if (!isLive(cl)) return false;
      }
      return true;
    }

    function backToHold(cl, line, delta) {
      cl.phase = 'hold';
      cl.speaker = '';
      const now = Date.now();
      cl.nextQueueAt = now + R.int(5000, 9000);
      cl.nextAnnounceAt = now + R.int(18000, 28000);
      setStatus(holdStatus(cl), 'hold');
      renderQueue(delta);
      speak(cl, 'sys', t.systemName, line, IVR_VOICE, { duck: true });
    }

    async function repPickup(cl) {
      const convo = c.reps[cl.repIndex % c.reps.length];
      cl.repIndex += 1;
      if (!(await converse(cl, convo, 'rep'))) return;
      cl.escalations += 1;
      const tier = c.reps[cl.repIndex % c.reps.length].tier;
      const pos = Math.max(cl.pos, cl.startPos) + R.int(15, 40); // "escalated" means "further back"
      const delta = pos - cl.pos;
      cl.pos = pos;
      cl.nextRepAt = Date.now() + R.int(150000, 240000);
      backToHold(cl, fill(c.transfer, { tier, pos }), delta);
    }

    async function salesPickup(cl) {
      cl.transfers += 1;
      if (!(await converse(cl, c.sales, 'sales'))) return;
      const add = R.int(10, 25);
      cl.pos += add;
      backToHold(cl, fill(c.sales.back || DEFAULTS.sales.back, { pos: cl.pos }), add);
    }

    function pressKey(k) {
      dtmf(k);
      const key = keyEls.get(k);
      if (key) flash(key, 'is-press');
      const cl = call;
      if (!isLive(cl)) {
        showCaption('sys', t.systemName, c.noCall);
        return;
      }
      if (cl.phase === 'dialing') return;
      cl.keys += 1;
      ctx.track('hold_key', { key: k });
      log('key', fill(t.youPressed, { key: k }));
      if (cl.phase === 'rep') {
        log('sys', fill(c.repBusy, { name: cl.speaker || 'The representative' }), t.systemName);
        return;
      }
      if (k === '1') {
        if (cl.last) announce(cl, cl.last);
        else speak(cl, 'ivr', t.ivrName, c.repeatEmpty, IVR_VOICE, { duck: true });
      } else if (k === '2') {
        log('ivr', c.drop, t.ivrName);
        endCall('dropped');
        busySignal();
        showCaption('ivr', t.ivrName, c.drop);
        if (!ctx.audio.isMuted()) ctx.speech.say(c.drop, IVR_VOICE);
      } else if (k === '3') {
        speak(cl, 'ai', c.aiName, nextAi(), { voice: 'narrator', pitch: 1.35, rate: 1.05 }, { duck: true });
      } else if (k === '8') {
        salesPickup(cl);
      } else if (k === '0') {
        const add = R.int(20, 45);
        cl.pos += add;
        cl.transfers += 1;
        renderQueue(add);
        speak(cl, 'ivr', t.ivrName, fill(c.operator, { pos: cl.pos }), IVR_VOICE, { duck: true });
      } else {
        speak(cl, 'ivr', t.ivrName, c.keys[k] || c.invalidKey, IVR_VOICE, { duck: true });
      }
    }

    function endCall(reason = 'hangup') {
      const cl = call;
      if (!isLive(cl)) return;
      const elapsed = Date.now() - cl.startedAt;
      cl.ended = true;
      cl.phase = 'ended';
      cl.d.run();
      stopMusic();
      ctx.speech.stop();
      logEl.querySelectorAll('.hold-log__item--typing').forEach((n) => n.remove());
      sfxHangup();
      setTimer(elapsed);
      setStatus(t.statusEnded, 'ended');
      setCallBtn('ended');
      if (reason !== 'dropped') showCaption('sys', t.systemName, t.endedCaption);

      const prevBest = Number(ctx.store.get('best', 0)) || 0;
      const isBest = elapsed > prevBest;
      if (isBest) ctx.store.set('best', elapsed);
      ctx.store.update('calls', (n) => (Number(n) || 0) + 1, 0);
      ctx.store.update('total', (n) => (Number(n) || 0) + elapsed, 0);
      if (elapsed >= 60000) ctx.referral.qualify('hold');
      if (elapsed >= chipMs) ctx.referral.grantChip('on-hold-10');
      ctx.track('hold_end', { seconds: Math.round(elapsed / 1000), escalations: cl.escalations, reason });
      renderBest();
      renderSummary(cl, elapsed, reason, isBest, prevBest);
    }

    // ---------- Summary ----------
    function shareText(cl, elapsed) {
      const n = cl.escalations;
      const times = n === 1 ? t.timesOnce : n === 2 ? t.timesTwice : fill(t.timesMany, { n });
      const tpl = elapsed < 30000 && c.share.quick ? c.share.quick : n > 0 && c.share.escalated ? c.share.escalated : c.share.text;
      return fill(tpl, { time: formatDuration(elapsed), site, vendor: c.vendor, times, escalations: n });
    }

    function ctaCard() {
      const cta = c.cta || {};
      const facts = ctx.brand?.sponsor?.facts || {};
      const factText = (cta.facts || [])
        .map((k) => facts[k])
        .filter(Boolean)
        .join(' ');
      const body = [factText, cta.after].filter(Boolean).join(' ');
      return ctx.cta.card({ kicker: cta.kicker, title: cta.title, body: body || undefined, kind: cta.kind || 'pricing', label: cta.label, content: 'hold', secondary: cta.secondary });
    }

    function renderSummary(cl, elapsed, reason, isBest, prevBest) {
      const best = Math.max(prevBest, elapsed);
      const rows = [
        [t.sumTime, formatDuration(elapsed)],
        [t.sumEscalations, String(cl.escalations)],
        [t.sumTransfers, String(cl.transfers)],
        [t.sumPosition, String(cl.pos)],
        [t.sumAnnouncements, String(cl.announcements)],
        [t.sumKeys, String(cl.keys)],
      ];
      const note = isBest ? (prevBest ? fill(t.bestNote, { prev: formatDuration(prevBest) }) : t.firstNote) : fill(t.bestSoFar, { best: formatDuration(best) });
      const ticket = el(
        'article.hold-ticket.paper',
        el('div.hold-ticket__head', el('span.kicker', fill(t.summaryKicker, { ticket: String(R.int(10000000, 99999999)) })), el('span.hold-ticket__status', reason === 'dropped' ? t.statusDropped : t.statusClosed)),
        el('h3.hold-ticket__title', t.summaryTitle),
        reason === 'dropped' && el('p.hold-ticket__drop', c.drop),
        el(
          'dl.hold-ticket__rows',
          rows.map(([k, v]) => el('div.hold-ticket__row', el('dt', k), el('dd', v))),
          el('div.hold-ticket__row.hold-ticket__row--resolution', el('dt', t.sumResolution), el('dd', t.resolutionNone)),
        ),
        el('p.hold-ticket__note', note),
        el('p.hold-ticket__foot', t.csat),
        el(`span.stamp.stamp--denied.hold-ticket__stamp${reduce ? '' : '.is-slam'}`, { 'aria-hidden': 'true' }, t.stamp),
      );
      const again = el(
        'button.btn.btn--vital.hold-again',
        {
          type: 'button',
          onclick: () => {
            startCall();
            phone.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          },
        },
        el('span.hold-call__icon', { html: ICON_PHONE }),
        el('span', t.againLabel),
      );
      summary.replaceChildren(
        el(
          'div.hold-summary__grid',
          el('div.hold-summary__main', ticket, again),
          el('div.hold-summary__side', ctx.share.panel({ text: shareText(cl, elapsed), params: { play: 'hold' }, kind: 'hold', title: t.shareTitle }), ctaCard()),
        ),
      );
      d.timeout(() => {
        if (mounted && summary.isConnected) summary.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }, 600);
    }

    // ---------- Wiring ----------
    const offAudio = ctx.audio.onChange?.((muted) => {
      renderSpk();
      if (muted) {
        stopMusic();
        ctx.speech.stop();
      } else if (isLive(call) && call.phase === 'hold' && !call.talking) startMusic();
    });
    if (typeof offAudio === 'function') d(offAudio);
    // Timers are throttled in background tabs; catch the display up the moment the tab is visible again.
    d.on(document, 'visibilitychange', () => {
      if (!document.hidden) tick();
    });
    d(() => {
      call?.d.run();
      stopMusic();
      ctx.speech.stop();
    });

    setCallBtn('idle');
    setStatus(t.statusReady, 'idle');
    renderSpk();
    renderBest();
    renderIntro();

    return () => d.run();
  },
};
