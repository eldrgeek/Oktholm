// Intake: the front desk. A scripted, self-aware parody of the "Hi 👋 how can I help?" widget every B2B site
// has, plus the lobby's guided tour. Not an LLM: every line is brand content (brand.content.intake), voiced
// ahead of time, and nothing a visitor types leaves the browser. Commands run locally; analytics only ever get
// the first word of a command Intake recognized.
//
//   s.intake = mountIntake(s)       once, after the shell and before the router starts; adds the launcher
//   const off = s.intake.embed(el)  the lobby hero: the same conversation, rendered inline (returns cleanup)
//   s.intake.open() / .close()      the docked panel. It never opens by itself.
//   s.intake.startTour()            spotlight tour over the lobby's [data-tour] sections
//   s.intake.destroy()
//
// One transcript, many views: messages go into `history` and every mounted view (embedded panels, the dock)
// renders them. Events: intake_open {via}, intake_choice {option}, intake_command {cmd}, tour_start,
// tour_step {step, id}, tour_end {completed, step}.

import './intake.css';
import { el, disposer, prefersReducedMotion, fill, clamp, formatNumber } from '../engine/dom.js';
import { stripTags } from '../engine/speech.js';
import { dailyPick } from '../engine/rng.js';

const MAX_INPUT = 200;
// Terminal lines drop voice direction ("[beat]") but keep their spacing (traceroute columns).
const untag = (t) => String(t ?? '').replace(/\[[^\]]{1,60}\]\s*/g, '');
const norm = (t) => String(t ?? '').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const DOMAIN = /\b([a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|gov|help))\b/i;
const pxVar = (name, fallback) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;
const media = (q) => (typeof matchMedia === 'function' ? matchMedia(q) : { matches: false });

export function mountIntake(s) {
  const c = s.brand.content?.intake || {};
  const L = c.labels || {};
  const store = s.store.scope('intake');
  const voice = s.makeSpeech(); // private channel: route changes and shows can't cut Intake off
  const role = c.voice || 'intake';
  const d = disposer();
  const reduced = prefersReducedMotion;
  const mobile = media('(max-width: 560px)');
  const finePointer = media('(pointer: fine)');
  const pid = () => s.referral.patientId();

  let destroyed = false;
  let started = false;
  let dockOpen = false;
  let dockView = null;
  let returnFocus = null;
  let tour = null;
  let unread = 0;
  let lastTyped = '';
  let fallbackTurn = 0;
  const used = new Set(); // quick replies already taken this visit

  // ---------- The transcript ----------
  const history = []; // { id, from: 'intake' | 'user', kind: 'text' | 'term' | 'plain' | 'count' | 'teaser', ... }
  let replies = [];
  let typing = false;
  let lastId = 0;
  const views = new Set();
  const embeds = new Set();
  const each = (fn) =>
    views.forEach((v) => {
      try {
        fn(v);
      } catch (e) {
        console.error(e);
      }
    });
  const embedOnScreen = () => [...embeds].some((v) => v.visible);
  const onScreen = () => dockOpen || embedOnScreen();

  function post(msg) {
    msg.id = ++lastId;
    history.push(msg);
    each((v) => v.add(msg));
    if (msg.from !== 'user' && !onScreen()) setUnread(unread + 1);
    return msg;
  }
  function addLine(msg, line) {
    msg.lines.push(line);
    each((v) => v.line(msg, line));
  }
  function setReplies(list) {
    replies = list;
    each((v) => v.replies(list));
  }
  function setTyping(on) {
    typing = on;
    each((v) => v.typing(on));
  }

  // ---------- Turns: one reply types out at a time ----------
  // A new user action fast-forwards whatever is still typing (the rest lands at once, unvoiced, so the
  // transcript stays whole), then the new reply starts. Nothing waits on the voice for more than a capped beat.
  let queue = Promise.resolve();
  const live = new Set();
  function interrupt() {
    live.forEach((t) => t.skip());
    voice.stop();
  }
  function run(script) {
    interrupt();
    const t = newTurn();
    live.add(t);
    queue = queue
      .then(() => (destroyed ? null : script(t)))
      .catch((e) => console.error(e))
      .finally(() => live.delete(t));
    return queue;
  }
  function newTurn() {
    const wakers = new Set();
    const t = {
      ff: false,
      skip() {
        t.ff = true;
        wakers.forEach((w) => w());
      },
      /** A pause that a fast-forward (or destroy) cuts short. */
      wait(ms) {
        if (t.ff || destroyed || !(ms > 0)) return Promise.resolve();
        return new Promise((resolve) => {
          const done = () => {
            clearTimeout(timer);
            wakers.delete(done);
            resolve();
          };
          const timer = setTimeout(done, ms);
          wakers.add(done);
        });
      },
      /** Typing theatre: none at all with reduced motion. */
      type(ms) {
        return reduced() ? Promise.resolve() : t.wait(ms);
      },
    };
    return t;
  }

  const typeMs = (text) => clamp(460 + text.length * 7, 500, 1100);
  async function typeOut(t, text) {
    if (t.ff || reduced()) return;
    setTyping(true);
    await t.wait(typeMs(text));
    setTyping(false);
  }

  /** An Intake line: typing indicator, the bubble (tags stripped), then the voice if it's allowed. */
  async function say(t, raw, { voiced = true } = {}) {
    const text = stripTags(raw);
    if (!text) return;
    await typeOut(t, text);
    post({ from: 'intake', kind: 'text', text });
    if (voiced) await speak(t, raw);
  }

  // Voice only after the visitor has interacted with the page, never when muted, never from a hidden widget.
  const activated = () => !navigator.userActivation || navigator.userActivation.hasBeenActive;
  const voiceOn = () => activated() && !s.audio.isMuted();
  async function speak(t, raw) {
    if (t.ff || destroyed || !voiceOn() || !onScreen()) return;
    const playing = voice.say(raw, { voice: role, fallback: 'silent' });
    // Hold the next line only while a real clip plays (silence never holds the text), and never for long.
    let clip = false;
    try {
      clip = await voice.hasClip(role, raw);
    } catch {
      clip = false;
    }
    if (clip) await Promise.race([playing, t.wait(15000)]);
  }

  /** Command output: one monospace bubble whose lines print like a terminal. Never voiced. */
  async function term(t, lines) {
    if (!t.ff && !reduced()) {
      setTyping(true);
      await t.wait(380);
      setTyping(false);
    }
    const msg = post({ from: 'intake', kind: 'term', lines: [] });
    for (const raw of lines) {
      if (msg.lines.length) await t.type(/^\s*\[/.test(raw) ? 900 : 190);
      addLine(msg, fill(untag(raw), { pid: pid() }));
    }
  }

  const go = (path) => {
    // On phones the dock covers the page it's sending you to.
    if (dockOpen && mobile.matches) closeDock(false);
    if (s.router?.navigate) s.router.navigate(path);
    else location.hash = '#' + path;
  };

  // ---------- Greeting ----------
  function greetingLines() {
    const g = (c.greeting || []).slice();
    const last = g[g.length - 1];
    if (!store.get('greetedAt') && s.referral.referredBy() && c.referredGreeting) {
      g.splice(1, g.length > 2 ? 1 : 0, c.referredGreeting);
      return g;
    }
    if (store.get('closedAt') && c.returningGreeting) {
      store.remove('closedAt'); // the joke works once per close
      return [c.returningGreeting, last].filter(Boolean);
    }
    if (g.length > 2 && c.greetingAlt?.length) {
      // Half the days keep the usual second line; the rest cycle through the alternates.
      const alt = dailyPick([...c.greetingAlt.map(() => null), ...c.greetingAlt], 'intake-greeting', s.brand.epoch);
      if (alt) g[1] = alt;
    }
    return g;
  }

  function start() {
    if (started || destroyed) return;
    started = true;
    const lines = greetingLines();
    if (!store.get('greetedAt')) store.set('greetedAt', Date.now());
    run(async (t) => {
      for (const line of lines) await say(t, line);
      if (c.teaser?.length) {
        await t.type(300);
        post({ from: 'intake', kind: 'teaser', items: c.teaser });
      }
      offerBase();
    });
  }

  // ---------- Quick replies ----------
  function offerBase() {
    const r = c.replies || {};
    setReplies(
      [
        r.tour && !used.has('tour') && { label: r.tour, option: 'tour', act: () => startTour() },
        r.diagnose && { label: r.diagnose, option: 'diagnose', path: '/triage' },
        r.denial && !used.has('denial') && { label: r.denial, option: 'denial', act: denial },
      ].filter(Boolean),
    );
  }

  function choose(reply, view) {
    if (destroyed) return;
    setReplies([]);
    post({ from: 'user', kind: 'text', text: reply.label });
    used.add(reply.option);
    s.track('intake_choice', { option: reply.option });
    view?.holdFocus();
    if (reply.path) {
      run(async (t) => {
        await t.wait(450);
        go(reply.path);
        offerBase();
      });
    } else reply.act?.();
  }

  function denial() {
    const cfg = c.denial || {};
    // Count at the tap, so the request is in flight while the line types. Offline resolves to null.
    const counted = s.api.post('/event', { type: 'denial', patientId: pid(), unique: true });
    run(async (t) => {
      const line = dailyPick(cfg.lines || [], 'intake-denial', s.brand.epoch);
      if (line) await say(t, line);
      const res = await counted;
      const n = Math.round(Number(res?.count));
      const k = cfg.count;
      if (res && n > 0 && k) {
        const tpl = n <= 1 ? k.first : n < (k.manyFrom || 25) ? k.few : k.many;
        if (tpl) {
          const text = fill(tpl, { N: formatNumber(n) });
          await typeOut(t, text);
          post({ from: 'intake', kind: 'count', text });
        }
      }
      s.referral.grantChip('in-denial');
      setReplies(
        [
          cfg.prove && { label: cfg.prove, option: 'prove', path: '/triage' },
          c.replies?.tour && !tour && !used.has('tour') && { label: c.replies.tour, option: 'tour', act: () => startTour() },
        ].filter(Boolean),
      );
    });
  }

  // ---------- Typed input ----------
  function submit(raw) {
    const text = String(raw ?? '').slice(0, MAX_INPUT).trim();
    if (!text || destroyed) return;
    lastTyped = text;
    post({ from: 'user', kind: 'text', text });
    const q = norm(text);
    // Someone might actually be struggling: step out of the bit before any joke can match. Not tracked, not voiced.
    if ((c.distress?.match || []).some((m) => m && q.includes(norm(m)))) {
      setReplies([]);
      run(async (t) => {
        await t.wait(reduced() ? 0 : 400);
        post({ from: 'intake', kind: 'plain', lines: (c.distress.reply || []).map((l) => stripTags(l)) });
      });
      return;
    }
    const cmd = (c.commands || []).find((k) => (k.match || []).some((m) => norm(m) === q) || (k.prefix && (q === norm(k.prefix) || q.startsWith(norm(k.prefix) + ' '))));
    // Analytics get the first word of a recognized command, never the text; anything else is "unknown".
    s.track('intake_command', { cmd: cmd ? q.split(' ')[0].slice(0, 24) : 'unknown' });
    if (!cmd) {
      const list = c.fallback || [];
      const line = list[fallbackTurn++ % Math.max(1, list.length)];
      run((t) => say(t, line));
      return;
    }
    run(async (t) => {
      const lines = cmd.fridayOnly && new Date().getDay() !== 5 ? [cmd.fridayOnly] : cmd.reply || [];
      await term(t, lines);
      const action = String(cmd.action || '');
      const i = action.indexOf(':');
      const kind = i < 0 ? action : action.slice(0, i);
      const arg = i < 0 ? '' : action.slice(i + 1);
      if (kind === 'chip' && arg) s.referral.grantChip(arg);
      else if (kind === 'route' && arg) {
        await t.wait(900);
        go(arg);
      } else if (kind === 'tour') {
        await t.wait(500);
        startTour();
      } else if (kind === 'breakup') {
        await t.wait(700);
        s.captor?.breakup?.();
      }
    });
  }

  // ---------- A view: one rendering of the transcript ----------
  function createView(kind) {
    const vd = disposer();
    const boxes = new Map(); // terminal message id -> its line container
    const log = el('div.in-log', { role: 'log', 'aria-live': 'polite', 'aria-relevant': 'additions', 'aria-label': c.name || '' });
    const dots = el('div.in-typing', { hidden: true, 'aria-hidden': 'true', title: L.typing || '' }, el('span'), el('span'), el('span'));
    const bar = el('div.in-replies', { role: 'group', 'aria-label': L.replies || '', 'aria-live': 'polite', tabindex: '-1' });
    const scroller = el('div.in-scroll', log, dots, bar);
    const input = el('input.in-input', {
      type: 'text',
      name: 'intake',
      maxlength: MAX_INPUT,
      autocomplete: 'off',
      autocapitalize: 'off',
      autocorrect: 'off',
      spellcheck: 'false',
      enterkeyhint: 'send',
      placeholder: L.placeholder || '',
      'aria-label': L.placeholder || '',
    });
    const form = el(
      'form.in-form',
      {
        onsubmit: (e) => {
          e.preventDefault();
          const value = input.value;
          input.value = '';
          submit(value);
        },
      },
      input,
      // Narrow screens swap the word for an arrow; the name stays the label either way.
      el('button.in-send', { type: 'submit', 'aria-label': L.send || '' }, el('span.in-send__label', L.send || ''), el('span.in-send__icon', { 'aria-hidden': 'true' }, '↑')),
    );
    const head = el(
      'div.in-head',
      el('span.in-avatar', { 'aria-hidden': 'true' }, c.avatar || ''),
      el('div.in-head__text', kind === 'dock' ? el('h2.in-name#in-dock-title', c.name || '') : el('p.in-name', c.name || ''), c.role && el('p.in-role', c.role)),
      kind === 'dock' && el('button.in-close', { type: 'button', 'aria-label': L.close || '', title: L.close || '', onclick: () => closeDock(true) }, el('span', { 'aria-hidden': 'true' }, '×')),
    );
    const panel =
      kind === 'dock'
        ? el('div.in-panel.in-panel--dock#in-dock', { role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'in-dock-title', tabindex: '-1', hidden: true }, head, scroller, form)
        : el('section.in-panel.in-panel--embed', { 'aria-label': L.open || c.name || '' }, head, scroller, form);

    if (kind === 'dock')
      vd.on(panel, 'keydown', (e) => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        closeDock(true);
      });
    // Terminal habit: ↑ on an empty prompt recalls the last thing you typed (kept in memory only).
    vd.on(input, 'keydown', (e) => {
      if (e.key === 'ArrowUp' && !input.value && lastTyped) {
        e.preventDefault();
        input.value = lastTyped;
      }
    });

    const nearBottom = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 72;
    const toBottom = () => {
      scroller.scrollTop = scroller.scrollHeight;
    };
    const keep = (fn, force) => {
      const stick = force || nearBottom();
      fn();
      if (stick) toBottom();
    };
    const termLine = (text) => el('div.in-term__line', text);
    const linkify = (text) => String(text).split(DOMAIN).map((part, i) => (i % 2 ? el('a', { href: `https://${part}`, target: '_blank', rel: 'noopener' }, part) : part));

    function render(msg) {
      const who = el('span.sr-only', `${msg.from === 'user' ? L.you || '' : c.name || ''}: `);
      if (msg.kind === 'teaser') return el('div.in-msg.in-msg--teaser', teaser(msg.items));
      if (msg.kind === 'term') {
        const box = el('div.in-term', msg.lines.map((l) => termLine(l)));
        boxes.set(msg.id, box);
        return el('div.in-msg.in-msg--intake', who, box);
      }
      if (msg.kind === 'plain') return el('div.in-msg.in-msg--plain', who, el('div.in-plain', msg.lines.map((l) => el('p', linkify(l)))));
      const bubble = el('p.in-bubble', msg.text);
      if (msg.kind === 'count') bubble.append(' ', el('span.in-real', { title: L.realHint || '' }, L.real || ''));
      return el(`div.in-msg.in-msg--${msg.from === 'user' ? 'user' : 'intake'}`, who, bubble);
    }

    function teaser(items) {
      return el(
        'ul.in-teaser',
        { role: 'list', 'aria-label': L.rooms || '' },
        items.map((it) =>
          el(
            'li',
            el(
              'a.in-tile',
              {
                href: '#' + it.path,
                onclick: () => {
                  s.track('intake_choice', { option: `teaser-${it.id}` });
                  if (dockOpen && mobile.matches) closeDock(false);
                },
              },
              art(it.art),
              el('span.in-tile__label', it.label),
              it.sub && el('span.in-tile__sub', it.sub),
            ),
          ),
        ),
      );
    }

    const view = {
      kind,
      el: panel,
      log,
      bar,
      visible: kind === 'embed', // embeds count as on screen until their observer says otherwise
      add: (msg) => keep(() => log.append(render(msg)), msg.from === 'user'),
      line: (msg, text) => {
        const box = boxes.get(msg.id);
        if (box) keep(() => box.append(termLine(text)));
      },
      replies: (list) =>
        keep(() =>
          bar.replaceChildren(
            ...list.map((r, i) => el(`button.in-reply${i === 0 ? '.in-reply--primary' : ''}`, { type: 'button', onclick: () => choose(r, view) }, r.label)),
          ),
        ),
      typing: (on) =>
        keep(() => {
          dots.hidden = !on;
        }),
      toBottom,
      /** After a tap removes the button you were on, keep keyboard focus in the reply area (no page scroll). */
      holdFocus: () => {
        if (panel.isConnected) bar.focus({ preventScroll: true });
      },
      /** Opening the dock: the prompt on desktop; the dialog itself on touch, so no keyboard pops up. */
      focusStart: () => (finePointer.matches ? input : panel).focus({ preventScroll: true }),
      destroy: () => {
        vd.run();
        views.delete(view);
        panel.remove();
      },
    };
    history.forEach((m) => log.append(render(m)));
    view.replies(replies);
    view.typing(typing);
    views.add(view);
    requestAnimationFrame(toBottom);
    return view;
  }

  // Two presentations of one conversation: only one log should announce, or screen readers hear it twice.
  function syncLive() {
    embeds.forEach((v) => {
      v.log.setAttribute('aria-live', dockOpen ? 'off' : 'polite');
      v.bar.setAttribute('aria-live', dockOpen ? 'off' : 'polite');
    });
  }

  // ---------- Launcher + docked panel ----------
  const badge = el('span.in-launcher__badge', { hidden: true, 'aria-hidden': 'true' });
  const launcher = el(
    'button.in-launcher.is-hidden',
    { type: 'button', 'aria-label': L.open || '', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', onclick: () => openDock('launcher') },
    el('span.in-launcher__icon', { 'aria-hidden': 'true' }, c.avatar || ''),
    badge,
    el('span.in-launcher__tip', { 'aria-hidden': 'true' }, L.open || ''),
  );
  document.body.append(launcher);

  function setUnread(n) {
    unread = n;
    badge.hidden = !n;
    badge.textContent = n > 9 ? '9+' : String(n);
    launcher.setAttribute('aria-label', n && L.unread ? `${L.open || ''} · ${fill(L.unread, { n })}` : L.open || '');
  }

  function syncLauncher() {
    // Hidden while the embedded panel is on screen, while the dock is open, and during the tour.
    launcher.classList.toggle('is-hidden', destroyed || dockOpen || Boolean(tour) || embedOnScreen());
    launcher.setAttribute('aria-expanded', String(dockOpen));
  }

  function openDock(via = 'api', { track = true } = {}) {
    if (destroyed) return;
    if (tour) endTour(false);
    if (!dockView) {
      dockView = createView('dock');
      document.body.append(dockView.el);
      launcher.setAttribute('aria-controls', dockView.el.id);
    }
    if (!dockOpen) {
      const active = document.activeElement;
      returnFocus = active && active !== document.body && !dockView.el.contains(active) ? active : null;
      dockOpen = true;
      dockView.el.hidden = false;
      setUnread(0);
      syncLauncher();
      syncLive();
      syncKeyboard();
      dockView.toBottom();
      if (track) s.track('intake_open', { via });
    }
    dockView.focusStart();
    start();
  }

  function closeDock(byUser = false) {
    if (!dockOpen) return;
    dockOpen = false;
    dockView.el.hidden = true;
    if (byUser) store.set('closedAt', Date.now()); // next visit opens with the returning greeting
    voice.stop();
    syncLauncher();
    syncLive();
    if (!byUser) return;
    const back = !launcher.classList.contains('is-hidden') ? launcher : returnFocus;
    if (back?.isConnected) back.focus({ preventScroll: true });
  }

  // Phones: keep the dock above the on-screen keyboard.
  const vv = window.visualViewport;
  function syncKeyboard() {
    if (!dockView || !vv) return;
    const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
    dockView.el.style.setProperty('--in-kb', `${kb}px`);
  }
  if (vv) {
    d.on(vv, 'resize', syncKeyboard);
    d.on(vv, 'scroll', syncKeyboard);
  }

  // The "Learn more" pill sits bottom-center; on narrow screens the launcher steps up while it shows.
  if (s.cue?.el && typeof MutationObserver === 'function') {
    const syncCue = () => launcher.classList.toggle('is-raised', !s.cue.el.hidden);
    const mo = new MutationObserver(syncCue);
    mo.observe(s.cue.el, { attributes: true, attributeFilter: ['hidden'] });
    syncCue();
    d(() => mo.disconnect());
  }

  // ---------- Embedded panel (the lobby hero) ----------
  /** Is the panel really visible, or is something (the cold open, a modal) drawn over it? */
  function unoccluded(node) {
    const r = node.getBoundingClientRect();
    const top = Math.max(r.top, pxVar('--topbar-h', 60));
    const bottom = Math.min(r.bottom, window.innerHeight - pxVar('--ticker-h', 38));
    if (bottom - top < 24) return false;
    const hit = document.elementFromPoint(r.left + r.width / 2, (top + bottom) / 2);
    return !hit || node.contains(hit);
  }

  function embed(host) {
    if (!host || destroyed) return () => {};
    const v = createView('embed');
    embeds.add(v);
    host.append(v.el);
    syncLauncher();
    syncLive();
    // The greeting starts when the panel is actually seen: on screen, tab visible, no cold open over it.
    let retry = 0;
    const check = () => {
      clearTimeout(retry);
      if (started || destroyed || !v.visible || !v.el.isConnected) return;
      if (!tour && !s.admissionActive && document.visibilityState === 'visible' && unoccluded(v.el)) start();
      else retry = setTimeout(check, 400);
    };
    v.check = check;
    let io = null;
    if (typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver(
        (entries) => {
          const e = entries[entries.length - 1];
          v.visible = e.isIntersecting && e.intersectionRatio >= 0.25;
          v.el.classList.toggle('is-away', !v.visible);
          if (v.visible) setUnread(0);
          syncLauncher();
          check();
        },
        { rootMargin: `-${pxVar('--topbar-h', 60)}px 0px -${pxVar('--ticker-h', 38)}px 0px`, threshold: [0, 0.25, 0.5] },
      );
      io.observe(v.el);
    } else check();
    const cleanup = () => {
      clearTimeout(retry);
      io?.disconnect();
      embeds.delete(v);
      v.destroy();
      syncLauncher();
      if (!onScreen()) voice.stop();
    };
    v.cleanup = cleanup;
    return cleanup;
  }

  // The cold open ends: a panel that was waiting behind it can greet now.
  if (s.track?.on)
    d(
      s.track.on((event) => {
        if (event === 'admission_end') setTimeout(() => embeds.forEach((v) => v.check?.()), 300);
      }),
    );

  // ---------- Tour ----------
  const onLobby = () => {
    const h = location.hash.replace(/^#/, '').split('?')[0];
    return h === '' || h === '/';
  };
  const targetFor = (id) => {
    try {
      return document.querySelector(`[data-tour="${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id}"]`);
    } catch {
      return null;
    }
  };
  const waitFor = (cond, timeout, t) =>
    new Promise((resolve) => {
      const t0 = Date.now();
      (function poll() {
        if (t.ended || destroyed) return resolve(false);
        if (cond()) return setTimeout(() => resolve(true), 150); // let the room settle in
        if (Date.now() - t0 > timeout) return resolve(false);
        setTimeout(poll, 100);
      })();
    });

  function startTour() {
    if (tour || destroyed) return;
    const all = c.tour?.stops || [];
    if (!all.length) return;
    const t = (tour = { i: -1, stops: [], ended: false, resumeDock: dockOpen, token: 0, d: disposer() });
    started = true; // a visitor who went straight to the tour doesn't need "want the tour?"
    if (dockOpen) closeDock(false);
    interrupt();
    used.add('tour');
    setReplies([]);
    s.track('tour_start');
    s.cue?.suppress?.('tour', true);
    syncLauncher();
    if (c.tour.intro) post({ from: 'intake', kind: 'text', text: stripTags(c.tour.intro) });
    if (voiceOn()) voice.preload([c.tour.intro, ...all.map((x) => x.say)].filter(Boolean).map((text) => ({ voice: role, text }))).catch(() => {});
    const here = onLobby();
    if (!here) {
      t.navigating = true;
      go('/');
    }
    waitFor(() => onLobby() && all.some((x) => targetFor(x.target)), here ? 1500 : 6000, t).then((ok) => {
      t.navigating = false;
      if (t.ended) return;
      t.stops = all.filter((x) => targetFor(x.target));
      if (!ok || !t.stops.length) return endTour(false);
      buildTour(t);
      showStop(t, 0);
    });
  }

  function buildTour(t) {
    t.spot = el('div.in-spot');
    t.blocks = [0, 1, 2, 3].map(() => el('div.in-block'));
    t.overlay = el('div.in-tour', { 'aria-hidden': 'true' }, t.spot, t.blocks);
    t.stepEl = el('p.in-card__step', { id: 'in-tour-step' });
    t.introEl = el('p.in-card__intro', { hidden: true });
    t.textEl = el('p.in-card__text', { id: 'in-tour-text' });
    t.dots = t.stops.map(() => el('span'));
    t.nextBtn = el('button.btn.btn--vital.in-card__next', { type: 'button', onclick: nextStop }, L.next || '');
    t.goBtn = el('button.btn.btn--ghost.in-card__go', { type: 'button', onclick: goStop });
    t.card = el(
      'div.in-card.is-moving',
      { role: 'dialog', 'aria-modal': 'true', 'aria-label': L.tour || c.name || '', 'aria-describedby': 'in-tour-step in-tour-text' },
      el('div.in-card__head', el('span.in-avatar', { 'aria-hidden': 'true' }, c.avatar || ''), el('div.in-card__who', el('p.in-card__name', c.name || ''), t.stepEl), el('div.in-card__dots', { 'aria-hidden': 'true' }, t.dots)),
      t.introEl,
      t.textEl,
      el('div.in-card__actions', t.nextBtn, t.goBtn, el('button.in-card__end', { type: 'button', onclick: () => endTour(false) }, L.end || '')),
    );
    document.body.append(t.overlay, t.card);
    t.metrics = { top: pxVar('--topbar-h', 60), ticker: pxVar('--ticker-h', 38) };
    t.scrolledAt = 0;
    t.d.on(window, 'scroll', () => (t.scrolledAt = performance.now()), { passive: true });
    t.d.on(window, 'resize', () => (t.metrics = { top: pxVar('--topbar-h', 60), ticker: pxVar('--ticker-h', 38) }));
    t.d.on(document, 'keydown', (e) => tourKey(e, t), true);
    t.d.raf(() => follow(t)); // keeps the cutout and card on the target through scrolling, resizing, reflow
  }

  function tourKey(e, t) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      endTour(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const f = [...t.card.querySelectorAll('button')].filter((b) => !b.hidden);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (!t.card.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // The part of a stop worth lighting: the first boxed element (card, band) down a chain of plain wrappers,
  // or the union of the wrapper's children, so section padding doesn't get spotlit.
  function spotNodes(target) {
    let node = target;
    for (let depth = 0; depth < 5; depth++) {
      const cs = getComputedStyle(node);
      const boxed = parseFloat(cs.borderTopWidth) > 0 || cs.backgroundImage !== 'none' || !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor);
      if (boxed && node !== target) return [node];
      const kids = [...node.children].filter((k) => k.getClientRects().length);
      if (kids.length !== 1) return kids.length ? kids : [node];
      node = kids[0];
    }
    return [node];
  }
  function spotRect(t) {
    const rs = t.nodes.filter((n) => n.isConnected).map((n) => n.getBoundingClientRect());
    if (!rs.length) return t.target.getBoundingClientRect();
    return { left: Math.min(...rs.map((r) => r.left)), top: Math.min(...rs.map((r) => r.top)), right: Math.max(...rs.map((r) => r.right)), bottom: Math.max(...rs.map((r) => r.bottom)) };
  }

  function showStop(t, i) {
    t.i = i;
    const stop = t.stops[i];
    t.target = targetFor(stop.target);
    if (!t.target) return i + 1 < t.stops.length ? showStop(t, i + 1) : endTour(false);
    t.nodes = spotNodes(t.target);
    t.stepEl.textContent = fill(L.step || '{n}/{total}', { n: i + 1, total: t.stops.length });
    const intro = i === 0 && c.tour?.intro ? stripTags(c.tour.intro) : '';
    t.introEl.textContent = intro;
    t.introEl.hidden = !intro;
    t.textEl.textContent = stripTags(stop.say);
    t.goBtn.textContent = stop.cta?.label || L.go || '';
    t.goBtn.hidden = !stop.cta?.path;
    t.dots.forEach((dot, k) => dot.classList.toggle('is-on', k <= i));
    // The dialog's description covers the first stop; later stops announce themselves.
    if (i > 0) t.textEl.setAttribute('aria-live', 'polite');
    t.side = null;
    t.size = null;
    t.settled = false;
    t.stepAt = performance.now();
    t.card.classList.add('is-moving');
    scrollToStop(t);
    t.nextBtn.focus({ preventScroll: true });
    narrate(t, intro ? [c.tour.intro, stop.say] : [stop.say]);
    s.track('tour_step', { step: i + 1, id: stop.id });
  }

  // Tour geometry, shared by the scroll and the per-frame follow so they always agree. The stage runs from under
  // the top bar to the bottom of the viewport (desktop: the card may sit over the dimmed ticker) or to the top
  // of the bottom sheet (phones).
  const PAD = 10; // cutout breathing room around the stop
  const GAP = 14; // cutout to card
  const EDGE = 12; // card to viewport edge
  function cardSize(t) {
    const key = `${document.documentElement.clientWidth}x${window.innerHeight}`;
    if (!t.size || t.size.key !== key) t.size = { key, w: t.card.offsetWidth, h: t.card.offsetHeight };
    return t.size;
  }
  function stage(t) {
    const vh = window.innerHeight;
    const { h } = cardSize(t);
    const top = t.metrics.top + 8;
    const bottom = mobile.matches ? vh - h - 8 : vh - EDGE;
    return { top, bottom, cardH: h, vh };
  }
  /** Desktop: does the stop plus its card fit on screen? If not, light the top of the stop and put the card below. */
  const isTall = (t, r, st) => !mobile.matches && r.bottom - r.top + 2 * PAD + GAP + st.cardH > st.bottom - st.top;

  function scrollToStop(t) {
    const r = spotRect(t);
    const st = stage(t);
    const spotH = r.bottom - r.top + 2 * PAD;
    // Center (block: center) within the stage: the stop and its card together on desktop, the stop alone above
    // the sheet on phones. Anything taller aligns to the top of the stage.
    const block = mobile.matches ? spotH : isTall(t, r, st) ? Infinity : spotH + GAP + st.cardH;
    const room = st.bottom - st.top;
    const spotTop = st.top + (block <= room ? (room - block) / 2 : 0);
    const y = window.scrollY + r.top - PAD - spotTop;
    window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: reduced() ? 'auto' : 'smooth' });
  }

  const place = (node, x, y, w, h) => {
    node.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    node.style.width = `${Math.max(0, Math.round(w))}px`;
    node.style.height = `${Math.max(0, Math.round(h))}px`;
  };

  function follow(t) {
    if (t.ended) return;
    if (!t.target?.isConnected) return endTour(false);
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const r = spotRect(t);
    const st = stage(t);
    const tall = isTall(t, r, st);
    const x0 = clamp(r.left - PAD, 4, vw - 4);
    const x1 = clamp(r.right + PAD, x0, vw - 4);
    const y0 = clamp(r.top - PAD, t.metrics.top + 4, vh - 4);
    // Never light what the card will cover: stop above the sheet (phones) or above the card (tall stops).
    const floor = mobile.matches ? st.bottom : tall ? vh - EDGE - st.cardH - GAP : vh - 4;
    const y1 = clamp(r.bottom + PAD, y0, Math.max(y0, floor));
    const key = [x0, y0, x1, y1, vw, vh].map(Math.round).join();
    if (key !== t.key) {
      t.key = key;
      place(t.spot, x0, y0, x1 - x0, y1 - y0);
      // Four transparent blocks catch clicks on the dimmed page; the lit stop stays usable.
      place(t.blocks[0], 0, 0, vw, y0);
      place(t.blocks[1], 0, y1, vw, vh - y1);
      place(t.blocks[2], 0, y0, x0, y1 - y0);
      place(t.blocks[3], x1, y0, vw - x1, y1 - y0);
    }
    // The card waits for the scroll to land, then follows the stop.
    const now = performance.now();
    if (!t.settled && ((now - t.scrolledAt > 160 && now - t.stepAt > 120) || now - t.stepAt > 1800)) {
      t.settled = true;
      t.card.classList.remove('is-moving');
    }
    if (!t.settled || mobile.matches) return; // phones: a bottom sheet, placed by CSS
    const { w, h } = cardSize(t);
    const below = y1 + GAP + h <= vh - EDGE;
    const above = y0 - GAP - h >= t.metrics.top + EDGE;
    if (tall) t.side = 'below';
    else if (!t.side || (t.side === 'below' && !below) || (t.side === 'above' && !above)) t.side = below ? 'below' : above ? 'above' : 'over';
    const y = t.side === 'below' ? Math.min(y1 + GAP, vh - EDGE - h) : t.side === 'above' ? y0 - GAP - h : vh - EDGE - h;
    const x = clamp(x0, EDGE, Math.max(EDGE, vw - w - EDGE));
    t.card.style.setProperty('--x', `${Math.round(x)}px`);
    t.card.style.setProperty('--y', `${Math.round(y)}px`);
  }

  function narrate(t, lines) {
    const token = ++t.token;
    voice.stop();
    if (!voiceOn()) return;
    (async () => {
      for (const line of lines) {
        if (t.ended || token !== t.token) return;
        if ((await voice.say(line, { voice: role, fallback: 'silent' })) === 'cancelled') return;
      }
    })().catch(() => {});
  }

  function nextStop() {
    const t = tour;
    if (!t) return;
    if (t.i + 1 < t.stops.length) showStop(t, t.i + 1);
    else endTour(true);
  }

  function goStop() {
    const t = tour;
    if (!t) return;
    // Taking the last stop's door still counts as hearing the whole tour.
    endTour(t.i === t.stops.length - 1, { path: t.stops[t.i]?.cta?.path });
  }

  function endTour(completed, { path } = {}) {
    const t = tour;
    if (!t || t.ended) return;
    t.ended = true;
    tour = null;
    t.d.run();
    t.overlay?.remove();
    t.card?.remove();
    voice.stop();
    s.cue?.suppress?.('tour', false);
    s.track('tour_end', { completed: Boolean(completed), step: t.i + 1 });
    syncLauncher();
    if (destroyed) return;
    if (completed) {
      s.referral.grantChip('guided-tour');
      run(async (tt) => {
        await say(tt, c.tour?.outro || '');
        setReplies((c.tour?.next || []).map((x) => ({ label: x.label, option: x.id || String(x.path || '').split('/').filter(Boolean).pop() || 'next', path: x.path })));
      });
    } else {
      used.delete('tour');
      if (!replies.length) offerBase();
    }
    if (path) return go(path);
    if (completed) {
      // Back to the front desk: the lobby's panel if there is one, else the dock.
      const v = [...embeds].find((x) => x.el.isConnected);
      if (v) {
        v.el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
        v.holdFocus();
      } else openDock('tour', { track: false });
      return;
    }
    if (t.resumeDock) return openDock('tour', { track: false });
    if (!launcher.classList.contains('is-hidden')) launcher.focus({ preventScroll: true });
    else [...embeds].find((x) => x.visible)?.holdFocus();
  }

  // Leaving the lobby mid-tour ends it (the tour's own trip to the lobby doesn't count).
  const offRoute = s.router?.onChange?.(() => {
    if (tour && !tour.navigating && !onLobby()) endTour(false);
  });
  if (typeof offRoute === 'function') d(offRoute);

  // First appearance a beat after load; the lobby's embed (same tick) keeps it hidden.
  d.timeout(syncLauncher, 700);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    endTour(false);
    interrupt();
    [...embeds].forEach((v) => v.cleanup());
    dockView?.destroy();
    launcher.remove();
    d.run();
  }

  return {
    embed,
    open: () => openDock('api'),
    close: () => closeDock(false),
    startTour,
    destroy,
  };
}

/** Teaser art: tiny CSS-only loops (see intake.css). Decorative, so hidden from assistive tech. */
function art(kind) {
  const parts = {
    stamp: () => [el('i.in-art__paper'), el('i.in-art__stamp', 'DIAGNOSED')],
    ticket: () => [el('i.in-art__ticket'), el('i.in-art__stamp.in-art__stamp--ok', 'APPROVED'), el('i.in-art__stamp.in-art__stamp--no', 'DENIED')],
    tiles: () => Array.from({ length: 8 }, () => el('i')),
    tv: () => [el('i.in-art__tv', el('i.in-art__eye', el('i.in-art__pupil')))],
    chips: () => Array.from({ length: 4 }, () => el('i')),
  };
  const make = parts[kind];
  return el(`span.in-art.in-art--${make ? kind : 'none'}`, { 'aria-hidden': 'true' }, make ? make() : []);
}
