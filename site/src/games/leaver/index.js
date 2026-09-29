// The Leaver: offboarding whack-a-mole.
//
// Today's leaver (seeded daily, same for everyone) has sessions lighting up across a grid of apps. Tap a red
// tile to revoke it before the export finishes; every live second fills the exfiltration meter. Shadow-IT
// tiles slide in mid-round, amber trap tiles (the CEO, payroll...) cost time if you revoke them.
// All copy lives in ctx.content (brands/<brand>/modules/leaver.js). DEFAULTS keep the module brand-agnostic.
import './style.css';

const DEFAULTS = {
  seconds: 30,
  knownApps: 24,
  // Accounts whose OAuth token survives the first revoke and lights up once more.
  tokens: 8,
  penaltySeconds: 3,
  shadowWaves: [
    { at: 7, count: 3 },
    { at: 13.5, count: 3 },
    { at: 20.5, count: 2 },
  ],
  // Exfiltration meter, in %: per finished export, per second per live session, and relief per revoke.
  exfil: { chunk: 4, trickle: 0.5, relief: 1.5 },
  // Difficulty curve from the first to the last second: how long a session stays live, the gap between
  // new sessions, and how many can be live at once. Tuned with a player model (see the module's notes).
  tuning: { windowStart: 2200, windowEnd: 1250, gapStart: 760, gapEnd: 280, liveStart: 2, liveGrowth: 4, tokenCooldown: 900 },
  leavers: [{ name: 'the leaver', who: 'an employee', team: 'Unknown', exit: 'just resigned', loot: 'the customer list' }],
  apps: [
    { name: 'CRM', emoji: '☁️', doing: 'exporting contacts…', keeps: 'the CRM' },
    { name: 'Chat', emoji: '💬', doing: 'posting in #general…', keeps: 'the chat workspace' },
    { name: 'Video', emoji: '🎥', doing: 'recording a meeting…', keeps: 'a video-call license' },
    { name: 'Code', emoji: '🧑‍💻', doing: 'pushing to main…', keeps: 'the code repository' },
    { name: 'Design', emoji: '🎨', doing: 'duplicating files…', keeps: 'the design files' },
    { name: 'Wiki', emoji: '📓', doing: 'sharing pages publicly…', keeps: 'the wiki' },
    { name: 'Tickets', emoji: '🎫', doing: 'closing tickets…', keeps: 'the ticket tracker' },
    { name: 'File sync', emoji: '📦', doing: 'syncing folders…', keeps: 'the shared drive' },
    { name: 'Tasks', emoji: '✅', doing: 'reassigning tasks…', keeps: 'the task board' },
    { name: 'E-sign', emoji: '🖊️', doing: 'signing documents…', keeps: 'an e-signature account' },
    { name: 'Vault', emoji: '🔑', doing: 'exporting passwords…', keeps: 'the password vault' },
    { name: 'HR', emoji: '🌙', doing: 'approving expenses…', keeps: 'HR system access' },
    { name: 'Calendar', emoji: '📅', doing: 'booking rooms…', keeps: 'the room calendar' },
    { name: 'Helpdesk', emoji: '🎧', doing: 'answering customers…', keeps: 'a helpdesk seat' },
    { name: 'Roadmap', emoji: '📋', doing: 'archiving the roadmap…', keeps: 'the roadmap' },
    { name: 'Ledger', emoji: '📒', doing: 'exporting the ledger…', keeps: 'the ledger' },
  ],
  shadow: [
    { name: 'Office speakers', emoji: '🔊', detail: 'paired to a personal phone', doing: 'queuing music…', keeps: 'the office speakers', always: true },
    { name: 'Side project', emoji: '🗒️', detail: 'a workspace on your SSO', doing: 'working on the side project…', keeps: 'a side-project workspace' },
    { name: 'Email blasts', emoji: '📨', detail: 'on the corporate card', doing: 'emailing customers…', keeps: 'an email tool on the corporate card' },
    { name: 'AI notetaker', emoji: '🤖', detail: 'in every meeting', doing: 'joining a meeting…', keeps: 'an AI notetaker' },
    { name: 'Social', emoji: '📣', detail: 'shared password', doing: 'drafting a post…', keeps: 'the corporate social account' },
    { name: 'Domain', emoji: '🌐', detail: 'registered personally', doing: 'turning off auto-renew…', keeps: 'the company domain' },
    { name: 'Automations', emoji: '⚡', detail: 'nobody documented them', doing: 'forwarding email…', keeps: 'undocumented automations' },
    { name: 'Sheet CRM', emoji: '📊', detail: 'the real CRM', doing: 'deleting rows…', keeps: 'the spreadsheet that is the real CRM' },
  ],
  traps: [
    { emoji: '👔', label: 'The CEO', note: 'Wrong human', hit: 'You logged the CEO out.' },
    { emoji: '💸', label: 'Payroll run', note: 'In progress', hit: 'You interrupted payroll.' },
  ],
  copy: {
    kicker: 'Incident {day} · Offboarding',
    briefing: '{Who} {exit}.',
    stakes: '{Name} has accounts in {total} apps. You know about {known} of them. You have {seconds} seconds.',
    rules: [
      ['🟥', 'Tap a tile while it’s red to revoke it.'],
      ['🔑', 'Some come back: the OAuth token outlives the session.'],
      ['⚠️', 'Leave amber tiles alone.'],
      ['🔍', 'Shadow IT will appear mid-round.'],
    ],
    start: 'Start offboarding',
    badgeOrg: 'Employee',
    badgeStamp: 'Leaver',
    dailyNote: '',
    ticket: 'Ticket {day} · Terminate access: {who}',
    countdown: ['3', '2', '1', 'Go!'],
    idle: 'Idle',
    active: 'Active',
    revoked: 'Revoked',
    exported: 'Exported',
    hidden: 'Unscanned',
    token: 'Token live',
    tokenTag: 'Token',
    tokenDoing: 'refreshing an OAuth token…',
    tokenPop: 'Token!',
    shadowTag: 'Shadow IT',
    trapTag: 'Do not revoke',
    fast: 'Fast',
    combo: 'Combo ×{n}',
    trapPenalty: '−{s}s',
    timeLabel: 'Time',
    revokedLabel: 'Revoked',
    streakLabel: 'Streak',
    exfilLabel: 'Exfiltration',
    feedStart: 'Ticket opened. Watch for red.',
    feedActive: '{app}: {doing}',
    feedRevoke: '{app}: revoked.',
    feedToken: '{app}: session killed. The OAuth token is still valid.',
    feedExport: '{app}: export complete.',
    feedShadow: 'Shadow IT detected: {count} new apps.',
  },
  results: {
    kicker: 'Offboarding report · {day}',
    clear: { stamp: 'Offboarded', title: 'Clean break.', sub: 'Every account revoked in {time}s.' },
    time: { stamp: 'Time', title: 'Time’s up.', sub: '{revoked} of {total} accounts revoked.' },
    exfil: { stamp: 'Exfiltrated', title: 'Data exfiltrated.', sub: '{Name} left with {loot}.' },
    statRevoked: 'Revoked',
    statTime: 'Time',
    statStreak: 'Best streak',
    statExfil: 'Exfiltrated',
    controlsTitle: '{Name} still controls:',
    controlsNone: 'Nothing.',
    unrevealed: '…and {count} apps nobody knew about',
    more: '…and {count} more',
    viaToken: '{keeps} (via an OAuth token)',
    collateral: 'Collateral damage',
    best: 'Personal best: {revoked}/{total} in {time}s',
    newBest: 'New personal best.',
    replay: 'Play again',
    shareTitle: 'Challenge a coworker',
  },
  share: {
    clear: 'I offboarded all {total} of {possessive} accounts in {time}s on The Leaver. Beat me:',
    time: 'I offboarded {revoked}/{total} of {possessive} accounts in {time}s on The Leaver. {Name} still controls {thing}. Beat me:',
    exfil: '{Name} got away after {time}s on The Leaver. I revoked {revoked}/{total} accounts first. Beat me:',
  },
  cta: { kicker: 'Prescription', title: 'Offboarding in one workflow', body: '{lifecycle} {shadow}' },
};

function isObj(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

/** Deep-merge plain objects; arrays and scalars from `over` replace the defaults (empty arrays don't). */
function merge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over || {})) {
    if (v == null) continue;
    if (isObj(v) && isObj(base[k])) out[k] = merge(base[k], v);
    else if (Array.isArray(v) && !v.length && Array.isArray(base[k])) continue;
    else out[k] = v;
  }
  return out;
}

const lerp = (a, b, k) => a + (b - a) * k;

export default {
  id: 'leaver',
  kind: 'game',
  title: 'The Leaver',
  blurb: 'Someone just quit. They still have 30+ logins. You have 30 seconds.',
  emoji: '🚪',
  minutes: '1 min',
  therapy: 'Treats: Phantom Access Syndrome',

  mount(root, ctx) {
    const { el, disposer, fill, clamp, prefersReducedMotion } = ctx.dom;
    const d = disposer();
    const C = merge(DEFAULTS, ctx.content || {});
    const facts = ctx.brand?.sponsor?.facts || {};
    const reduced = prefersReducedMotion();
    const rand = ctx.rng.random;

    // ---------- Today's incident: the same leaver and board for everyone today ----------
    const dayNo = typeof ctx.rng.dayNumber === 'function' ? ctx.rng.dayNumber() : 1;
    const today = ctx.rng.daily('leaver');
    const leaver = { ...DEFAULTS.leavers[0], ...today.pick(C.leavers) };
    const waves = C.shadowWaves.map((w) => ({ at: Number(w.at) * 1000, count: Math.max(0, Math.round(Number(w.count) || 0)) }));
    const shadowCount = Math.min(C.shadow.length, waves.reduce((n, w) => n + w.count, 0));
    const knownDefs = today.sample(C.apps, Math.min(Number(C.knownApps) || 24, C.apps.length));
    const pinned = C.shadow.filter((s) => s.always).slice(0, shadowCount);
    const shadowDefs = today.shuffle([...pinned, ...today.sample(C.shadow.filter((s) => !s.always), shadowCount - pinned.length)]);
    const trapDefs = C.traps
      .map((tr) => (tr.twin ? (leaver.twin ? { ...tr, label: leaver.twin.label, hit: leaver.twin.hit } : null) : tr))
      .filter((tr) => tr && tr.label);
    const total = knownDefs.length + shadowDefs.length;
    const tokenSet = new Set(today.sample(knownDefs, Math.min(knownDefs.length, Math.max(0, Math.round(Number(C.tokens) || 0)))));
    const TN = { ...DEFAULTS.tuning, ...C.tuning };
    const EX = { ...DEFAULTS.exfil, ...C.exfil };
    const dur = Math.max(5, Number(C.seconds) || 30) * 1000;
    const penaltyMs = Math.max(0, Number(C.penaltySeconds) || 0) * 1000;

    const cap = (s) => {
      const str = String(s ?? '');
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const possess = (s) => `${s}’s`;
    const V = {
      name: leaver.name,
      Name: cap(leaver.name),
      possessive: possess(leaver.name),
      Possessive: cap(possess(leaver.name)),
      who: leaver.who || leaver.name,
      Who: cap(leaver.who || leaver.name),
      team: leaver.team || '',
      exit: leaver.exit || '',
      loot: leaver.loot || '',
      seconds: Math.round(dur / 1000),
      known: knownDefs.length,
      total,
      day: `OFF-${String(dayNo).padStart(4, '0')}`,
    };
    const T = (s, extra) => fill(s ?? '', extra ? { ...V, ...extra } : V);

    // ---------- Layout ----------
    const wrap = el('div.lv');
    root.append(wrap);

    const startBtn = el('button.btn.btn--alarm.btn--lg.lv-start', { type: 'button', onclick: () => start() }, C.copy.start);
    const bestLine = el('p.lv-best.mono');
    const intro = el(
      'section.lv-intro.card.card--raised',
      el('div.lv-intro__head', el('div.kicker.kicker--alarm', T(C.copy.kicker)), el('h2.lv-title.display', ctx.meta?.title || 'The Leaver')),
      el(
        'div.lv-intro__body',
        renderBadge(),
        el(
          'div.lv-brief',
          el('p.lv-brief__lead', T(C.copy.briefing)),
          el('p.lv-brief__stakes', T(C.copy.stakes)),
          el(
            'ul.lv-rules',
            C.copy.rules.map((r) => {
              const [icon, text] = Array.isArray(r) ? r : [r.icon, r.text];
              return el('li', el('span.lv-rules__icon', { 'aria-hidden': 'true' }, icon), el('span', T(text)));
            }),
          ),
          el('div.lv-intro__actions', startBtn, bestLine),
          C.copy.dailyNote && el('p.lv-daily', T(C.copy.dailyNote)),
        ),
      ),
    );

    const ui = {
      timer: el('div.lv-stat__val.lv-timer.pixel'),
      revoked: el('div.lv-stat__val.pixel'),
      streak: el('div.lv-stat__val.pixel'),
      exfilFill: el('div.lv-exfil__fill'),
      exfilPct: el('span.lv-exfil__pct.pixel'),
      status: el('p.lv-status.mono'),
      board: el('div.lv-board', { role: 'group', 'aria-label': T(C.copy.ticket) }),
      fx: el('div.lv-fx', { 'aria-hidden': 'true' }),
      overlay: el('div.lv-overlay', { hidden: true }),
    };
    ui.exfil = el(
      'div.lv-exfil',
      el('div.lv-exfil__row', el('span.lv-exfil__label', T(C.copy.exfilLabel)), ui.exfilPct),
      el('div.lv-exfil__bar', ui.exfilFill),
    );
    const consoleEl = el(
      'section.lv-console',
      { hidden: true },
      el(
        'header.lv-hud',
        el('div.lv-ticket.mono', el('span.live-dot', { 'aria-hidden': 'true' }), el('span.lv-ticket__text', T(C.copy.ticket))),
        el(
          'div.lv-stats',
          el('div.lv-stat.lv-stat--time', el('div.lv-stat__label', C.copy.timeLabel), ui.timer),
          el('div.lv-stat', el('div.lv-stat__label', C.copy.revokedLabel), ui.revoked),
          el('div.lv-stat', el('div.lv-stat__label', C.copy.streakLabel), ui.streak),
        ),
        ui.exfil,
      ),
      ui.status,
      el('div.lv-board-wrap', ui.board, ui.fx, ui.overlay),
    );
    const results = el('section.lv-results', { hidden: true });
    wrap.append(intro, consoleEl, results);
    showBest();

    function renderBadge() {
      return el(
        'div.lv-badge.paper',
        { 'aria-hidden': 'true' },
        el('div.lv-badge__clip'),
        el('div.lv-badge__org.mono', T(C.copy.badgeOrg)),
        el(
          'div.lv-badge__main',
          el('div.lv-badge__photo', '👤'),
          el('div.lv-badge__id', el('div.lv-badge__name.display', V.Name), el('div.lv-badge__team.mono', V.team), el('div.lv-badge__barcode')),
        ),
        el('div.lv-badge__stamp.stamp.stamp--denied', T(C.copy.badgeStamp)),
      );
    }

    function showBest() {
      const best = ctx.store.get('best', null);
      bestLine.textContent = best ? T(C.results.best, { revoked: best.revoked, total: best.total, time: best.time }) : '';
      bestLine.hidden = !best;
    }

    // ---------- Tiles ----------
    let tiles = [];
    let S = null;
    let raf = 0;
    d(() => cancelAnimationFrame(raf));

    function makeTile(def, kind, i) {
      const node = el('button.lv-tile', { type: 'button', dataset: { i: String(i) } });
      const parts = {
        tag: el('span.lv-tile__tag'),
        emoji: el('span.lv-tile__emoji', { 'aria-hidden': 'true' }),
        name: el('span.lv-tile__name'),
        status: el('span.lv-tile__status'),
        detail: el('span.lv-tile__detail'),
        bar: el('span.lv-tile__bar', { 'aria-hidden': 'true' }),
        stamp: el('span.lv-tile__stamp', { 'aria-hidden': 'true' }, C.copy.revoked),
      };
      node.append(parts.tag, parts.emoji, parts.name, parts.status, parts.detail, parts.bar, parts.stamp);
      return { i, def, kind, node, parts, name: T(def.name), state: kind === 'shadow' ? 'hidden' : 'idle', since: 0, window: 1, cool: 0, trap: null, token: tokenSet.has(def), tokenStage: false };
    }

    function paint(t) {
      const { node, parts: p, trap } = t;
      const st = trap ? 'trap' : t.state;
      for (const s of ['idle', 'active', 'revoked', 'hidden', 'trap']) node.classList.toggle(`is-${s}`, s === st);
      const shadowShown = t.kind === 'shadow' && t.state !== 'hidden' && !trap;
      const tokenShown = t.tokenStage && !trap && t.state !== 'revoked';
      node.classList.toggle('is-shadow', shadowShown && !tokenShown);
      node.classList.toggle('is-token', tokenShown);
      let emoji = t.def.emoji || '▪️';
      let name = t.name;
      let status = C.copy.idle;
      let detail = t.def.detail ? T(t.def.detail) : '';
      if (trap) {
        emoji = trap.emoji || '⚠️';
        name = T(trap.label);
        status = C.copy.trapTag;
        detail = T(trap.note || '');
      } else if (t.state === 'hidden') {
        emoji = '?';
        name = '???';
        status = C.copy.hidden;
        detail = '';
      } else if (t.state === 'active') {
        status = C.copy.active;
        detail = T((t.tokenStage ? C.copy.tokenDoing : t.def.doing) || '');
      } else if (t.state === 'revoked') {
        status = C.copy.revoked;
      } else if (tokenShown) {
        status = C.copy.token;
      }
      p.tag.textContent = tokenShown ? `🔑 ${C.copy.tokenTag}` : shadowShown ? C.copy.shadowTag : '';
      p.emoji.textContent = emoji;
      p.name.textContent = name;
      p.status.textContent = status;
      p.detail.textContent = detail;
      node.tabIndex = t.state === 'hidden' ? -1 : 0;
      node.setAttribute('aria-label', t.state === 'hidden' ? C.copy.hidden : `${name}: ${status}${detail ? `, ${detail}` : ''}`);
      if (t.state !== 'active') p.bar.style.transform = '';
    }

    function buildBoard() {
      tiles = [...knownDefs.map((def) => ['app', def]), ...shadowDefs.map((def) => ['shadow', def])].map(([kind, def], i) => makeTile(def, kind, i));
      ui.board.replaceChildren(...tiles.map((t) => t.node));
      tiles.forEach(paint);
    }

    // Tap as soon as the finger lands (pointerdown); keyboard users get the click with detail 0.
    const tileFrom = (e) => {
      const n = e.target?.closest?.('.lv-tile');
      return n ? tiles[Number(n.dataset.i)] : null;
    };
    d.on(ui.board, 'pointerdown', (e) => {
      if (e.button > 0) return;
      const t = tileFrom(e);
      if (!t) return;
      e.preventDefault();
      hit(t);
    });
    d.on(ui.board, 'click', (e) => {
      if (e.detail !== 0) return;
      const t = tileFrom(e);
      if (t) hit(t);
    });
    d.on(ui.board, 'contextmenu', (e) => e.preventDefault());

    // ---------- Round ----------
    function start() {
      ctx.sfx.click();
      buildBoard();
      S = {
        phase: 'countdown',
        T: 0,
        last: 0,
        penalty: 0,
        exfil: 0,
        revoked: 0,
        streak: 0,
        bestStreak: 0,
        exports: 0,
        fast: 0,
        traps: [],
        wave: 0,
        nextAct: 300,
        nextTrap: 5200 + rand() * 1800,
        statusPri: 0,
        statusUntil: 0,
        tick: 0,
        hud: {},
      };
      intro.hidden = true;
      results.hidden = true;
      results.replaceChildren();
      consoleEl.hidden = false;
      consoleEl.classList.remove('is-over');
      ui.fx.replaceChildren();
      setStatus(T(C.copy.feedStart), 'good', 0);
      hud(true);
      const top = consoleEl.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * 0.3) consoleEl.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      countdown(() => {
        S.phase = 'play';
        S.last = performance.now();
        raf = requestAnimationFrame(frame);
        ctx.track('game_start', { leaver: leaver.name });
      });
    }

    function countdown(done) {
      const steps = C.copy.countdown?.length ? C.copy.countdown : DEFAULTS.copy.countdown;
      const run = S;
      let i = 0;
      ui.overlay.hidden = false;
      const next = () => {
        if (S !== run) return;
        if (i >= steps.length) {
          ui.overlay.hidden = true;
          ui.overlay.replaceChildren();
          done();
          return;
        }
        const last = i === steps.length - 1;
        ui.overlay.replaceChildren(el(`div.lv-count${last ? '.is-go' : ''}`, steps[i]));
        if (last) ctx.sfx.tone(1318, 0.2, { type: 'square', gain: 0.05 });
        else ctx.sfx.beep();
        i += 1;
        d.timeout(next, last ? 420 : 560);
      };
      next();
    }

    function frame(now) {
      if (!S || S.phase !== 'play') return;
      const dt = Math.min(100, Math.max(0, now - S.last));
      S.last = now;
      S.T += dt;
      step(dt);
      if (S && S.phase === 'play') raf = requestAnimationFrame(frame);
    }

    function step(dt) {
      const clock = S.T + S.penalty;
      const p = clamp(clock / dur, 0, 1);

      while (S.wave < waves.length && clock >= waves[S.wave].at) revealWave(waves[S.wave++]);

      let live = 0;
      for (const t of tiles) {
        if (t.state === 'active') {
          const prog = (S.T - t.since) / t.window;
          if (prog >= 1) exportDone(t);
          else {
            live += 1;
            t.parts.bar.style.transform = `scaleX(${prog.toFixed(3)})`;
          }
        }
        if (t.trap && S.T >= t.trap.until) clearTrap(t);
      }

      const maxLive = TN.liveStart + Math.floor(p * TN.liveGrowth);
      if (S.T >= S.nextAct && live < maxLive) {
        const pool = tiles.filter((t) => t.state === 'idle' && !t.trap && S.T >= t.cool);
        if (pool.length) {
          activate(rand.pick(pool), p);
          live += 1;
        }
        S.nextAct = S.T + lerp(TN.gapStart, TN.gapEnd, p) * (0.7 + rand() * 0.6);
      }

      if (trapDefs.length && S.T >= S.nextTrap) {
        spawnTrap();
        S.nextTrap = S.T + 4200 + rand() * 2600;
      }

      S.exfil += (live * EX.trickle * dt) / 1000;

      if (S.exfil >= 100) return end('exfil');
      if (S.revoked >= total) return end('clear');
      if (clock >= dur) return end('time');
      hud(false);
    }

    function activate(t, p) {
      t.state = 'active';
      t.since = S.T;
      t.window = lerp(TN.windowStart, TN.windowEnd, p) * (0.9 + rand() * 0.2);
      paint(t);
      setStatus(T(C.copy.feedActive, { app: t.name, doing: T(t.def.doing || '') }), 'bad', 0);
      ctx.sfx.tone(880 + rand() * 200, 0.035, { type: 'square', gain: 0.016 });
    }

    function exportDone(t) {
      t.state = 'idle';
      t.cool = S.T + 650;
      S.exfil += EX.chunk;
      S.exports += 1;
      S.streak = 0;
      paint(t);
      flashClass(t.node, 'is-exported', 520);
      popup(t, C.copy.exported, 'bad');
      setStatus(T(C.copy.feedExport, { app: t.name, file: t.def.file || 'export.zip' }), 'alarm', 1);
      ctx.sfx.tone(196, 0.16, { type: 'sawtooth', gain: 0.04, slide: -70 });
    }

    function revoke(t) {
      const reaction = S.T - t.since;
      const tokenLeft = t.token && !t.tokenStage;
      S.exfil = Math.max(0, S.exfil - EX.relief);
      S.streak += 1;
      S.bestStreak = Math.max(S.bestStreak, S.streak);
      ctx.sfx.whack();
      if (tokenLeft) {
        // The session dies; the OAuth token doesn't. It will light up once more.
        t.tokenStage = true;
        t.state = 'idle';
        t.cool = S.T + TN.tokenCooldown;
        paint(t);
        popup(t, `🔑 ${C.copy.tokenPop}`, 'fast');
        setStatus(T(C.copy.feedToken, { app: t.name }), 'amber', 1);
        hud(false);
        return;
      }
      t.state = 'revoked';
      S.revoked += 1;
      paint(t);
      if (!reduced) flashClass(t.node, 'is-slam', 420);
      if (reaction < 420) {
        S.fast += 1;
        popup(t, `⚡ ${C.copy.fast}`, 'fast');
      } else popup(t, '+1', 'good');
      if (S.streak >= 3 && (S.streak <= 5 || S.streak % 5 === 0)) {
        centerPop(fill(C.copy.combo, { n: S.streak }));
        ctx.sfx.tone(520 + Math.min(S.streak, 30) * 28, 0.1, { type: 'triangle', gain: 0.05, delay: 0.05 });
      }
      setStatus(T(C.copy.feedRevoke, { app: t.name }), 'good', 0);
      hud(false);
    }

    function hitTrap(t) {
      const trap = t.trap;
      t.trap = null;
      t.cool = S.T + 400;
      paint(t);
      S.penalty += penaltyMs;
      S.streak = 0;
      S.traps.push(trap);
      popup(t, fill(C.copy.trapPenalty, { s: Math.round(penaltyMs / 1000) }), 'bad');
      setStatus(T(trap.hit || ''), 'alarm', 3);
      ctx.sfx.bad();
      shake();
      hud(false);
    }

    function nudge(t) {
      S.streak = 0;
      ctx.sfx.click();
      if (!reduced) flashClass(t.node, 'is-nudge', 260);
      hud(false);
    }

    function hit(t) {
      if (!S || S.phase !== 'play') return;
      if (t.trap) hitTrap(t);
      else if (t.state === 'active') revoke(t);
      else if (t.state === 'idle') nudge(t);
    }

    function spawnTrap() {
      const pool = tiles.filter((t) => (t.state === 'idle' || t.state === 'revoked') && !t.trap && S.T >= t.cool);
      if (!pool.length) return;
      const t = rand.pick(pool);
      t.trap = { ...rand.pick(trapDefs), until: S.T + 2300 };
      paint(t);
      ctx.sfx.tone(392, 0.12, { type: 'triangle', gain: 0.045 });
    }

    function clearTrap(t) {
      t.trap = null;
      t.cool = S.T + 300;
      paint(t);
    }

    function revealWave(w) {
      const fresh = tiles.filter((t) => t.state === 'hidden').slice(0, w.count);
      if (!fresh.length) return;
      fresh.forEach((t, k) => {
        t.state = 'idle';
        t.cool = S.T + 1000 + k * 200;
        paint(t);
        if (!reduced) {
          t.node.style.animationDelay = `${k * 110}ms`;
          t.node.classList.add('is-arriving');
          d.timeout(() => {
            t.node.classList.remove('is-arriving');
            t.node.style.animationDelay = '';
          }, 800 + k * 110);
        }
      });
      setStatus(T(C.copy.feedShadow, { count: fresh.length }), 'amber', 2);
      ctx.sfx.tone(523, 0.08, { type: 'square', gain: 0.04 });
      ctx.sfx.tone(784, 0.12, { type: 'square', gain: 0.04, delay: 0.09 });
    }

    // ---------- Feedback ----------
    function hud(force) {
      const left = Math.max(0, dur - S.T - S.penalty);
      const secs = (left / 1000).toFixed(1);
      if (force || S.hud.t !== secs) {
        S.hud.t = secs;
        ui.timer.textContent = secs;
        ui.timer.classList.toggle('is-warn', left < 10000 && left >= 5000);
        ui.timer.classList.toggle('is-crit', left < 5000);
        const whole = Math.ceil(left / 1000);
        if (S.phase === 'play' && left < 5000 && left > 0 && whole !== S.tick) {
          S.tick = whole;
          ctx.sfx.tone(1250, 0.03, { type: 'square', gain: 0.02 });
        }
      }
      const rv = `${S.revoked}/${total}`;
      if (force || S.hud.r !== rv) {
        S.hud.r = rv;
        ui.revoked.textContent = rv;
      }
      if (force || S.hud.s !== S.streak) {
        S.hud.s = S.streak;
        ui.streak.textContent = String(S.streak);
        ui.streak.classList.toggle('is-hot', S.streak >= 5);
      }
      const ex = clamp(S.exfil, 0, 100);
      ui.exfilFill.style.transform = `scaleX(${(ex / 100).toFixed(4)})`;
      const pct = `${Math.floor(ex)}%`;
      if (force || S.hud.x !== pct) {
        S.hud.x = pct;
        ui.exfilPct.textContent = pct;
        ui.exfil.classList.toggle('is-hot', ex >= 70);
      }
    }

    // Priority keeps an alarm on screen for a moment instead of being overwritten by routine feed lines.
    const HOLD = [0, 700, 1800, 2400];
    function setStatus(text, kind, pri) {
      if (S && S.phase === 'play' && pri < S.statusPri && S.T < S.statusUntil) return;
      if (S) {
        S.statusPri = pri;
        S.statusUntil = S.T + HOLD[pri];
      }
      const clock = S ? Math.min(dur, S.T + S.penalty) : 0;
      ui.status.className = `lv-status mono${kind ? ` is-${kind}` : ''}`;
      ui.status.replaceChildren(el('span.lv-status__t', `T+${(clock / 1000).toFixed(1).padStart(4, '0')}`), el('span.lv-status__msg', text));
    }

    function popup(t, text, kind) {
      const x = t.node.offsetLeft + t.node.offsetWidth / 2;
      const y = t.node.offsetTop + t.node.offsetHeight / 2;
      const n = el(`div.lv-pop.lv-pop--${kind}`, { style: { left: `${x}px`, top: `${y}px` } }, text);
      ui.fx.append(n);
      d.timeout(() => n.remove(), 800);
    }

    function centerPop(text) {
      const n = el('div.lv-pop.lv-pop--combo', text);
      ui.fx.querySelector('.lv-pop--combo')?.remove();
      ui.fx.append(n);
      d.timeout(() => n.remove(), 900);
    }

    function flashClass(node, cls, ms) {
      node.classList.remove(cls);
      void node.offsetWidth;
      node.classList.add(cls);
      d.timeout(() => node.classList.remove(cls), ms);
    }

    function shake() {
      if (reduced) return;
      flashClass(consoleEl, 'is-shake', 420);
    }

    // ---------- End ----------
    function end(reason) {
      if (!S || S.phase !== 'play') return;
      S.phase = 'over';
      cancelAnimationFrame(raf);
      for (const t of tiles) {
        t.trap = null;
        paint(t);
      }
      hud(true);
      consoleEl.classList.add('is-over');

      const clock = Math.min(dur, S.T + S.penalty);
      const time = reason === 'time' ? String(Math.round(dur / 1000)) : (clock / 1000).toFixed(1);
      const left = tiles.filter((t) => t.state !== 'revoked' && t.state !== 'hidden');
      const unrevealed = tiles.filter((t) => t.state === 'hidden').length;
      const weight = (t) => (t.def.always ? 4 : 0) + (t.kind === 'shadow' ? 2 : 0);
      left.sort((a, b) => weight(b) - weight(a));
      const o = { reason, time, clock, left, unrevealed, revoked: S.revoked, exfil: S.exfil, bestStreak: S.bestStreak, traps: S.traps.slice() };

      const prev = ctx.store.get('best', null);
      const better = !prev || o.revoked > prev.revoked || (o.revoked === prev.revoked && o.clock < (prev.clock ?? Infinity));
      if (better) ctx.store.set('best', { revoked: o.revoked, total, time, clock, perfect: reason === 'clear', day: dayNo });
      o.newBest = better && Boolean(prev);
      ctx.store.update('plays', (n) => (Number(n) || 0) + 1, 0);
      ctx.referral.qualify('leaver');
      let chip = false;
      if (reason === 'clear') chip = ctx.referral.grantChip('clean-offboard');
      ctx.track('game_end', { reason, revoked: o.revoked, total, time, traps: o.traps.length });

      const r = C.results[reason] || {};
      ui.overlay.hidden = false;
      ui.overlay.replaceChildren(el(`div.lv-endstamp.is-${reason}${reduced ? '' : '.is-slam'}`, T(r.stamp || reason)));
      if (reason === 'clear') {
        ctx.sfx.coin();
        if (!chip) ctx.ui.confetti();
      } else if (reason === 'exfil') ctx.sfx.flatline();
      else ctx.sfx.alarm();

      const run = S;
      d.timeout(() => S === run && showResults(o), reduced ? 500 : 1500);
    }

    function keepsText(t) {
      const keeps = T(t.def.keeps || t.name);
      return t.tokenStage ? T(C.results.viaToken, { keeps }) : keeps;
    }

    function showResults(o) {
      const r = C.results[o.reason] || {};
      const vars = { revoked: o.revoked, total, time: o.time };
      const best = ctx.store.get('best', null);
      const title = el('h2.lv-report__title.display', { tabindex: '-1' }, T(r.title, vars));
      const stat = (label, value) => el('div.lv-rstat', el('div.lv-rstat__label', label), el('div.lv-rstat__val.pixel', value));
      const report = el(
        'div.lv-report.card.card--raised',
        { class: `is-${o.reason}` },
        el('div.kicker', T(C.results.kicker)),
        title,
        el('p.lv-report__sub', T(r.sub, vars)),
        el(
          'div.lv-report__stats',
          stat(C.results.statRevoked, `${o.revoked}/${total}`),
          stat(C.results.statTime, `${o.time}s`),
          stat(C.results.statStreak, String(o.bestStreak)),
          stat(C.results.statExfil, `${Math.min(100, Math.floor(o.exfil))}%`),
        ),
        el(
          'div.lv-report__actions',
          el('button.btn.btn--vital', { type: 'button', onclick: () => start() }, C.results.replay),
          best &&
            el(
              'span.lv-best.mono',
              o.newBest && el('b', `${C.results.newBest} `),
              T(C.results.best, { revoked: best.revoked, total: best.total, time: best.time }),
            ),
        ),
      );

      const shown = o.left.slice(0, 6);
      const list = el(
        'ul.lv-memo__list',
        shown.map((t) => el('li', el('span.lv-memo__icon', { 'aria-hidden': 'true' }, t.def.emoji || '•'), el('span', cap(keepsText(t))))),
        o.left.length > shown.length && el('li.lv-memo__more', el('span.lv-memo__icon', '+'), el('span', T(C.results.more, { count: o.left.length - shown.length }))),
        o.unrevealed > 0 && el('li.lv-memo__more', el('span.lv-memo__icon', '?'), el('span', T(C.results.unrevealed, { count: o.unrevealed }))),
      );
      const memo = el(
        'div.lv-memo.paper',
        el('div.lv-memo__head', el('span.kicker', V.day), el('span.lv-memo__stamp', o.reason === 'clear' ? '✓' : '!')),
        el('h3.lv-memo__title.type', T(C.results.controlsTitle)),
        o.left.length || o.unrevealed ? list : el('p.lv-memo__none.type', T(C.results.controlsNone)),
        o.traps.length > 0 &&
          el(
            'div.lv-memo__collateral',
            el('h4.lv-memo__sub.type', C.results.collateral),
            el('ul.lv-memo__list', o.traps.map((tr) => el('li', el('span.lv-memo__icon', { 'aria-hidden': 'true' }, tr.emoji || '⚠️'), el('span', T(tr.hit || tr.label))))),
          ),
      );

      const cta = ctx.cta.card({
        kicker: T(C.cta.kicker),
        title: T(C.cta.title),
        body: T(C.cta.body, { revoked: o.revoked, lifecycle: facts.lifecycle || '', shadow: facts.shadow || '' })
          .replace(/\s+/g, ' ')
          .trim(),
        kind: 'trial',
        content: 'leaver',
      });

      const thingTile = o.left[0] || tiles.find((t) => t.state === 'hidden') || tiles.find((t) => t.def.always) || tiles[tiles.length - 1];
      const thing = thingTile ? keepsText(thingTile) : '';
      const shareText = T(C.share[o.reason] || C.share.time, { ...vars, thing });
      const share = ctx.share.panel({ text: shareText, params: { play: 'leaver' }, kind: 'leaver', title: C.results.shareTitle });

      results.replaceChildren(report, el('div.lv-results__grid', memo, cta), share);
      results.hidden = false;
      results.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      title.focus({ preventScroll: true });
    }

    return () => {
      S = null;
      d.run();
    };
  },
};
