// The desk: one shift of tickets, the reference binder, the stamps, the clock.
// runDesk() renders into the module via setScreen() and calls onFinish(summary) exactly once.

import { evaluate, explain, ruleFor, fmt, firstName, varsFor } from './logic.js';
import { renderTicket, createBinder, TABS, pips, revealTop } from './views.js';

const pickOne = (list) => (list && list.length ? list[Math.floor(Math.random() * list.length)] : '');

export function runDesk({ ctx, C, data, cfg, reduced, setScreen, onFinish }) {
  const { el, formatNumber, clamp } = ctx.dom;
  const t = C.copy;
  const sd = ctx.dom.disposer();
  const total = cfg.reqs.length;
  const S = {
    i: 0,
    results: [],
    csat: C.shift?.csatStart ?? 88,
    queue: (C.shift?.queueStart ?? 4200) + (cfg.day || 1) * 173 + Math.floor(Math.random() * 900),
    elapsed: 0,
    ticketAt: 0,
    locked: false,
    over: false,
    warned: 0,
    findings: 0,
  };
  let ticketEl = null;

  // ---- HUD ----
  const clock = el('span.ap-clock', '09:00');
  const clockFill = el('span.ap-clockbar__fill');
  const miniClock = el('span.ap-dock__clock', '09:00');
  const miniCount = el('span.ap-dock__count');
  const countEl = el('b.ap-hud__v');
  const queueEl = el('b.ap-hud__v.ap-hud__v--queue', formatNumber(S.queue));
  const csatEl = el('b.ap-hud__v', `${S.csat}%`);
  const hud = el(
    'div.ap-hud',
    el('div.ap-hud__label', el('span.ap-hud__k', cfg.daily ? t.dailyKicker : t.campaignKicker), el('b.ap-hud__title', cfg.label)),
    el('div.ap-hud__clockwrap', clock, el('span.ap-clockbar', { 'aria-hidden': 'true' }, clockFill)),
    el('div.ap-hud__item.ap-hud__item--count', el('span.ap-hud__k', t.nowServing), countEl),
    el('div.ap-hud__item', el('span.ap-hud__k', t.queue), queueEl),
    el('div.ap-hud__item', el('span.ap-hud__k', t.csat), csatEl),
    el('div.ap-hud__item', el('span.ap-hud__k', t.sanity), pips(el, cfg.sanity, C.budget?.max || 10)),
    cfg.auditor && el('div.ap-hud__auditor', { title: t.auditorPresent }, el('span', { 'aria-hidden': 'true' }, '🕵️‍♀️'), el('span', t.auditorPresent)),
  );

  // ---- Desk ----
  const feedback = el(
    'div.ap-feedback',
    { 'aria-live': 'polite' },
    el('div.ap-slip.ap-slip--window', el('span', { 'aria-hidden': 'true' }, '🛎️ '), el('span', fmt(t.window, { n: total }), t.windowTip && el('span.ap-slip__tip', ` ${t.windowTip}`))),
  );
  const slot = el('div.ap-slot');
  const binder = createBinder({ el, C, data, checks: cfg.checks, newChecks: cfg.newChecks, day: cfg.day, daily: cfg.daily, reduced });
  const stampBtn = (approve) =>
    el(
      `button.btn.btn--lg.ap-stampbtn.${approve ? 'btn--vital.ap-stampbtn--approve' : 'btn--alarm.ap-stampbtn--deny'}`,
      { type: 'button', 'aria-keyshortcuts': approve ? 'A' : 'D', onclick: () => decide(approve) },
      el('span.ap-stampbtn__icon', { 'aria-hidden': 'true' }, approve ? '✔' : '✖'),
      el('span.ap-stampbtn__label', approve ? t.approve : t.deny),
      el('span.kbd.ap-kbd', { 'aria-hidden': 'true' }, approve ? 'A' : 'D'),
    );
  const approveBtn = stampBtn(true);
  const denyBtn = stampBtn(false);
  const dock = el('div.ap-dock', el('div.ap-dock__info', miniClock, miniCount), el('div.ap-dock__btns', denyBtn, approveBtn));
  const overlay = el('div.ap-timeup', { hidden: true });
  const desk = el('div.ap-desk', feedback, slot, binder.el, dock, overlay);
  const root = el('div.ap-shift', hud, desk);
  setScreen(root, () => {
    sd.run();
    if (typeof window !== 'undefined' && window.__ap?.owner === S) delete window.__ap;
  });

  const setButtons = (on) => {
    approveBtn.disabled = !on;
    denyBtn.disabled = !on;
  };

  function renderClock() {
    const frac = clamp(S.elapsed / cfg.seconds, 0, 1);
    const mins = 9 * 60 + Math.floor(frac * 8 * 60);
    const txt = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    clock.textContent = txt;
    miniClock.textContent = txt;
    clockFill.style.width = `${(frac * 100).toFixed(2)}%`;
    const left = cfg.seconds - S.elapsed;
    root.classList.toggle('is-late', left <= 30);
    if (left <= 30 && S.warned < 1) {
      S.warned = 1;
      ctx.sfx.beep();
    } else if (left <= 10 && S.warned < 2) {
      S.warned = 2;
      ctx.sfx.alarm();
    }
  }

  function renderHud() {
    countEl.textContent = fmt(t.ticketOf, { i: Math.min(S.i + 1, total), n: total });
    miniCount.textContent = countEl.textContent;
    queueEl.textContent = formatNumber(S.queue);
    csatEl.textContent = `${S.csat}%`;
    csatEl.classList.toggle('is-bad', S.csat < 60);
  }

  function showTicket() {
    const req = cfg.reqs[S.i];
    S.ticketAt = S.elapsed;
    binder.setRequest(req);
    ticketEl = renderTicket({
      el,
      req,
      C,
      data,
      onLookup: (kind, id) => {
        ctx.sfx.click();
        binder.lookup(kind, id);
      },
    });
    if (!reduced) ticketEl.classList.add('is-in');
    slot.replaceChildren(ticketEl);
    renderHud();
    // The window bell.
    ctx.sfx.tone(1318, 0.07, { type: 'sine', gain: 0.035 });
    ctx.sfx.tone(1760, 0.1, { type: 'sine', gain: 0.03, delay: 0.07 });
    setButtons(true);
  }

  function slip(res) {
    const { req, type, v, approve } = res;
    const vars = varsFor(req, data);
    const story = req.story;
    const auditorLine = cfg.auditor && Math.random() < 0.55 && el('p.ap-auditor', el('span', { 'aria-hidden': 'true' }, '🕵️‍♀️ '), pickOne(C.replies?.auditor));
    const reply = res.reply && el('p.ap-reply', el('span.ap-reply__who', `${req.person.avatar || '🙂'} ${firstName(req.person.name)}:`), ` “${fmt(res.reply, vars)}”`);
    const head = (icon, label, right) => el('div.ap-slip__head', el('span', `${icon} ${label}`), right && el('span.ap-slip__rule', right));
    const ruleRef = (check) => {
      const r = ruleFor(C, check);
      return r ? fmt(t.policyRef, { n: r.n, title: r.title }) : '';
    };
    if (type === 'correct') {
      const why = res.legit ? fmt(t.legitWhy, vars) : explain(v[0], req, data);
      return el('div.ap-slip.ap-slip--good', head('✔', t.correct, !res.legit && ruleRef(v[0].check)), el('p.ap-slip__text', why), reply, auditorLine);
    }
    if (type === 'finding') {
      return el(
        'div.ap-slip.ap-slip--finding',
        head('▲', fmt(t.finding, { n: S.findings }), ruleRef(v[0].check)),
        el('p.ap-slip__text', v.map((x) => explain(x, req, data)).join(' ')),
        res.consequence && el('p.ap-conseq', el('b', `${t.consequenceLead} `), fmt(res.consequence, vars)),
        auditorLine,
      );
    }
    return el('div.ap-slip.ap-slip--escalation', head('✉', t.escalation, `${t.csat} ${S.csat}%`), reply, el('p.ap-slip__text', fmt(t.legitWhy, vars)), auditorLine);
  }

  function decide(approve) {
    if (S.locked || S.over) return;
    const req = cfg.reqs[S.i];
    if (!req) return;
    S.locked = true;
    setButtons(false);
    const v = evaluate(req, cfg.checks, data);
    const legit = v.length === 0;
    const correct = approve === legit;
    const type = correct ? 'correct' : approve ? 'finding' : 'escalation';
    const story = req.story;
    const res = { req, approve, legit, correct, type, v, secs: S.elapsed - S.ticketAt };
    if (approve) res.reply = story?.replies?.approve || (legit ? pickOne(C.replies?.approvedLegit) : '');
    else res.reply = story?.replies?.deny || pickOne(legit ? C.replies?.deniedLegit : C.replies?.deniedViolation);
    if (type === 'finding') {
      S.findings++;
      res.consequence = story?.consequence && story.expect === 'deny' ? story.consequence : pickOne(C.consequences?.[v[0].check]);
    }
    S.results.push(res);
    if (type === 'escalation') {
      S.csat = clamp(S.csat - 14, 0, 100);
      S.queue += 12; // escalations breed follow-up tickets
    }
    else if (correct && approve) S.csat = clamp(S.csat + 3, 0, 100);
    S.queue += 2 + Math.floor(Math.random() * 4);

    ctx.sfx.stamp();
    ticketEl?.append(el(`div.stamp.ap-stampmark.stamp--${approve ? 'approved' : 'denied'}${reduced ? '' : '.is-slam'}`, approve ? t.approve : t.deny));
    ticketEl?.classList.add(approve ? 'is-approved' : 'is-denied');
    sd.timeout(() => {
      if (type === 'correct') ctx.sfx.good();
      else ctx.sfx.bad();
      feedback.replaceChildren(slip(res));
      renderHud();
      // On small screens the player may be deep in the binder: bring the result and the next ticket into view.
      revealTop(feedback, { smooth: !reduced });
    }, reduced ? 40 : 280);
    sd.timeout(() => ticketEl?.classList.add(approve ? 'is-out-right' : 'is-out-left'), reduced ? 200 : 700);
    sd.timeout(() => {
      if (S.over) return;
      S.i++;
      if (S.i >= total) return finish('queue');
      showTicket();
      S.locked = false;
    }, reduced ? 260 : 980);
  }

  function summarize(reason) {
    const res = S.results;
    const correct = res.filter((r) => r.correct).length;
    const findings = res.filter((r) => r.type === 'finding').length;
    const escalations = res.filter((r) => r.type === 'escalation').length;
    const approved = res.filter((r) => r.approve).length;
    const left = total - res.length;
    const secondsLeft = Math.max(0, Math.round(cfg.seconds - S.elapsed));
    const grid = res.map((r) => (r.type === 'correct' ? '🟩' : r.type === 'finding' ? '🟥' : '🟨')).join('') + '⬜'.repeat(left);
    const bossRes = res.find((r) => r.req.boss);
    const share = bossRes?.req.story?.share || {};
    return {
      reason,
      results: res,
      total,
      processed: res.length,
      correct,
      findings,
      escalations,
      approved,
      denied: res.length - approved,
      left,
      csat: S.csat,
      seconds: Math.round(S.elapsed),
      score: Math.max(0, correct * 100 - findings * 50 - escalations * 25 + (left === 0 ? secondsLeft * 2 : 0)),
      grid,
      boss: bossRes ? { denied: bossRes.correct && !bossRes.approve, text: bossRes.correct ? share.denied : share.approved } : null,
    };
  }

  function finish(reason) {
    if (S.over) return;
    S.over = true;
    setButtons(false);
    const done = () => onFinish(summarize(reason));
    if (reason === 'clock') {
      ctx.sfx.alarm();
      overlay.hidden = false;
      overlay.replaceChildren(
        el('div.ap-timeup__card', el(`div.stamp.stamp--denied.ap-timeup__stamp${reduced ? '' : '.is-slam'}`, '17:00'), el('p', fmt(t.timeUp, { left: total - S.results.length, tickets: total - S.results.length === 1 ? t.ticketOne : t.ticketMany }))),
      );
      sd.timeout(done, reduced ? 700 : 2400);
    } else sd.timeout(done, reduced ? 120 : 420);
  }

  // ---- Input ----
  sd.on(document, 'keydown', (e) => {
    if (S.over || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.target?.isContentEditable || document.querySelector('.modal-overlay')) return;
    const k = String(e.key || '').toLowerCase();
    if (k === 'a') {
      e.preventDefault();
      decide(true);
    } else if (k === 'd') {
      e.preventDefault();
      decide(false);
    } else if (/^[1-4]$/.test(k)) {
      e.preventDefault();
      binder.show(TABS[Number(k) - 1]);
    }
  });

  // ---- Clock (pauses while the tab is hidden) ----
  let last = performance.now();
  sd.interval(() => {
    const now = performance.now();
    const dt = Math.min(1, (now - last) / 1000);
    last = now;
    if (S.over || document.hidden) return;
    S.elapsed += dt;
    renderClock();
    if (S.elapsed >= cfg.seconds) finish('clock');
  }, 200);
  sd.interval(() => {
    if (S.over || document.hidden) return;
    S.queue += 1 + Math.floor(Math.random() * 8);
    queueEl.textContent = formatNumber(S.queue);
  }, 1700);

  if (typeof __DEV__ !== 'undefined' && __DEV__ && typeof window !== 'undefined') {
    // Test hook (dev harness only): lets automated checks read the correct call for the current ticket.
    window.__ap = {
      owner: S,
      state: S,
      current: () => {
        const r = cfg.reqs[S.i];
        return r && !S.over ? { i: S.i, n: total, legit: evaluate(r, cfg.checks, data).length === 0, kind: r.kind, story: r.story?.id || null, locked: S.locked } : null;
      },
      finish: () => finish('clock'),
    };
  }

  showTicket();
  renderClock();
}
