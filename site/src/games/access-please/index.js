// Access, Please: the lone IT admin stamps access requests against a binder of ever-growing rules.
// Screens: lobby (orientation memo + modes) -> morning bulletin -> desk -> end-of-shift report
// (+ sanity budget) -> next day / game over / promotion. All copy comes from ctx.content (see defaults.js).

import './style.css';
import { DEFAULTS } from './defaults.js';
import { resolveContent, indexData, buildShift, fmt, explain, ruleFor, budgetOutcome, greedyAlloc } from './logic.js';
import { pips, revealTop } from './views.js';
import { runDesk } from './desk.js';

export default {
  id: 'access-please',
  kind: 'game',
  title: 'Access, Please',
  blurb: 'Be the lone IT admin. Stamp access requests before the auditor notices.',
  emoji: '🛂',
  minutes: '4 min',
  therapy: 'Treats: Approval Chain Psychosis',

  mount(root, ctx) {
    const { el, formatNumber } = ctx.dom;
    const d = ctx.dom.disposer();
    const C = resolveContent(ctx.content, DEFAULTS);
    const data = indexData(C);
    const t = C.copy;
    const B = C.budget;
    const MAX = B.max || 10;
    const reduced = ctx.dom.prefersReducedMotion();
    const wrap = el('div.ap');
    root.append(wrap);
    let screenCleanup = null;

    function setScreen(node, cleanup) {
      const prev = screenCleanup;
      screenCleanup = null;
      try {
        prev?.();
      } catch (e) {
        console.error(e);
      }
      screenCleanup = cleanup || null;
      wrap.replaceChildren(node);
      revealTop(wrap);
    }

    // ---------- Persistence ----------
    const getCamp = () => {
      const c = ctx.store.get('campaign', null);
      return c && typeof c === 'object' && c.day ? c : null;
    };
    const saveCamp = (c) => ctx.store.set('campaign', c);
    const freshCamp = () => ({ day: 1, sanity: B.start ?? MAX, run: Math.random().toString(36).slice(2, 8), history: [], conditions: [], status: 'active', pending: null });

    /** Applies the (possibly unsigned) sanity budget of the last shift. */
    function finalizePending(c) {
      const p = c?.pending;
      if (!p) return c;
      const out = budgetOutcome({ sanity: c.sanity, max: MAX, earned: p.earned, eventCost: p.eventCost, findings: p.findings, clean: p.clean, alloc: p.alloc || {}, B });
      c.sanity = out.next;
      c.conditions = out.effects.filter((e) => !e.funded).map((e) => e.it.id);
      c.pending = null;
      if (c.sanity <= 0) {
        c.status = 'dead';
        c.diedOn = p.day;
      } else if (p.day >= 5) c.status = 'complete';
      saveCamp(c);
      return c;
    }

    function ctaCard(key) {
      const def = C.cta?.[key] || C.cta?.daily || {};
      const facts = ctx.brand?.sponsor?.facts || {};
      const body = (def.facts || []).map((k) => facts[k]).filter(Boolean).join(' ');
      return ctx.cta.card({ kicker: C.cta?.kicker, title: def.title, body, kind: def.kind || 'primary', label: C.cta?.label, content: `access-please-${key}` });
    }

    const sharePanel = (text) => ctx.share.panel({ text, kind: 'access-please', params: { play: 'access-please' }, title: t.shareTitle });
    const memoHead = (title, right) => el('div.ap-memo__head', el('div.ap-memo__title', title), el('div.ap-memo__dept', right));
    const meta = (pairs) => el('dl.ap-memo__meta', pairs.filter(Boolean).map(([k, v]) => [el('dt', k), el('dd', v)]));

    // ---------- Lobby ----------
    function lobby() {
      const n = ctx.rng.dayNumber();
      const today = (ctx.store.get('daily', {}) || {})[n];
      let camp = getCamp();
      if (camp?.pending) camp = finalizePending(camp);

      const memo = el(
        'article.ap-memo.paper',
        memoHead(t.memoTitle, C.company.dept),
        meta([
          [t.labelTo, t.memoTo],
          [t.labelFrom, t.memoFrom],
          [t.labelRe, t.memoRe],
        ]),
        el('div.ap-memo__body', t.memoBody.map((p) => el('p', p))),
        el('p.ap-memo__sign', t.memoSign),
        el('div.stamp.stamp--approved.ap-memo__stamp', t.memoStamp),
      );

      const dailyCard = el(
        'section.ap-mode.ap-mode--daily',
        el('div.kicker', t.dailyKicker),
        el('h2.ap-mode__title', fmt(t.dailyTitle, { n })),
        el('p.ap-mode__blurb', t.dailyBlurb),
        today && el('p.ap-mode__done', fmt(t.dailyDone, { ...today, findingsWord: today.findings === 1 ? t.findingOne : t.findingMany }), el('span.ap-mode__grid', today.grid)),
        el('button.btn.btn--vital.btn--lg.btn--block.ap-clockin', { type: 'button', onclick: () => start('daily') }, today ? t.replay : t.clockIn),
      );

      const newRun = () => {
        saveCamp(freshCamp());
        start('campaign');
      };
      let campBody;
      if (!camp) campBody = [el('button.btn.btn--amber.btn--block', { type: 'button', onclick: newRun }, t.campaignStart)];
      else if (camp.status === 'active')
        campBody = [
          el('div.ap-mode__status', el('span', fmt(t.campaignDay, { day: camp.day, sanity: camp.sanity })), pips(el, camp.sanity, MAX)),
          el(
            'div.ap-mode__row',
            el('button.btn.btn--amber', { type: 'button', onclick: () => start('campaign') }, fmt(t.campaignContinue, { day: camp.day })),
            el('button.btn.btn--ghost.btn--sm', { type: 'button', onclick: newRun }, t.campaignRestart),
          ),
        ];
      else
        campBody = [
          el('p.ap-mode__status', camp.status === 'dead' ? fmt(t.campaignDead, { day: camp.diedOn }) : t.campaignDone),
          el('button.btn.btn--amber.btn--block', { type: 'button', onclick: newRun }, t.newCampaign),
        ];
      const campCard = el('section.ap-mode.ap-mode--campaign', el('div.kicker.kicker--amber', t.campaignKicker), el('h2.ap-mode__title', t.campaignTitle), el('p.ap-mode__blurb', t.campaignBlurb), campBody);
      const howto = el('details.ap-howto', el('summary', t.howToTitle), el('ol', t.howTo.map((x) => el('li', x))));
      const hero = el('header.ap-hero', el('div.kicker', t.kicker), el('h1.ap-title.display', `${ctx.meta.title}`), el('p.ap-tagline', t.tagline));
      setScreen(el('div.ap-lobby', hero, el('div.ap-lobby__grid', memo, el('div.ap-lobby__modes', dailyCard, campCard, howto))));
    }

    // ---------- Shift setup ----------
    function makeShift(mode) {
      const daily = mode === 'daily';
      let camp = daily ? null : getCamp() || saveCamp(freshCamp());
      if (camp?.pending) camp = finalizePending(camp);
      if (camp && camp.status !== 'active') camp = saveCamp(freshCamp());
      const day = daily ? 5 : Math.min(5, camp.day);
      const n = ctx.rng.dayNumber();
      const rng = daily ? ctx.rng.daily('shift') : ctx.rng.seeded(`${camp.run}:day${day}`);
      const count = C.shift?.counts?.[daily ? 'daily' : day] || 10;
      let seconds = C.shift?.seconds?.[daily ? 'daily' : day] || 150;
      if (camp?.conditions?.includes('coffee')) seconds -= 15;
      const built = buildShift({ C, data, rng, day, daily, count });
      const eventIdx = rng.int(0, Math.max(0, (B.events || []).length - 1));
      const label = daily ? fmt(t.dailyTitle, { n }) : C.bulletins?.[day]?.title || `${day}`;
      return { mode, daily, day, n, count, seconds, label, eventIdx, auditor: daily || day >= 5, sanity: daily ? B.start ?? MAX : camp.sanity, conditions: camp?.conditions || [], ...built };
    }

    function start(mode) {
      const cfg = makeShift(mode);
      ctx.track('start', { mode, day: cfg.daily ? null : cfg.day });
      bulletin(cfg);
    }

    // ---------- Morning bulletin ----------
    function bulletin(cfg) {
      const b = (cfg.daily ? C.bulletins?.daily : C.bulletins?.[cfg.day]) || {};
      const conds = cfg.conditions.map((id) => C.conditions?.[id]).filter(Boolean);
      const go = el('button.btn.btn--vital.btn--lg', { type: 'button', onclick: () => runDesk({ ctx, C, data, cfg, reduced, setScreen, onFinish: (sum) => report(cfg, sum) }) }, t.startShift);
      setScreen(
        el(
          'div.ap-bulletin-wrap',
          el(
            'article.ap-bulletin.paper',
            el('div.kicker', C.company.dept),
            el('h2.ap-bulletin__title', fmt(b.title || cfg.label, { n: cfg.n })),
            el('p.ap-bulletin__body', fmt(b.body || '', { n: cfg.n })),
            conds.length > 0 && el('ul.ap-conditions', conds.map((c) => el('li', c))),
            el('h3.ap-bulletin__h', t.rulesToday),
            el(
              'ol.ap-policy.ap-policy--compact',
              cfg.rules.map((r) =>
                el(
                  'li.ap-rule',
                  el('div.ap-rule__n', String(r.n)),
                  el('div', el('div.ap-rule__title', el('span.ap-rule__icon', { 'aria-hidden': 'true' }, r.icon || '§'), ` ${r.title}`, !cfg.daily && r.day === cfg.day && el('span.ap-new', t.newRule)), el('p.ap-rule__text', r.text)),
                ),
              ),
            ),
            el('div.ap-bulletin__actions', go, el('button.btn.btn--ghost', { type: 'button', onclick: lobby }, t.toLobby)),
          ),
        ),
      );
      go.focus({ preventScroll: true });
    }

    // ---------- End of shift ----------
    function findingItem(r) {
      const who = `${r.req.no} · ${r.req.person.name}`;
      if (r.type === 'finding') {
        const rule = ruleFor(C, r.v[0].check);
        return el('li.ap-finding.ap-finding--bad', el('b', who), rule && el('span.ap-finding__rule', fmt(t.policyRef, { n: rule.n, title: rule.title })), el('span', r.v.map((x) => explain(x, r.req, data)).join(' ')));
      }
      return el('li.ap-finding.ap-finding--esc', el('b', who), el('span.ap-finding__rule', t.escalation), r.reply && el('span', `“${r.reply}”`));
    }

    function report(cfg, sum) {
      const mode = cfg.daily ? 'daily' : 'campaign';
      ctx.track('finish', { mode, day: cfg.daily ? null : cfg.day, correct: sum.correct, total: sum.total, findings: sum.findings, escalations: sum.escalations, reason: sum.reason });
      ctx.store.update('shifts', (x) => (Number(x) || 0) + 1, 0);
      ctx.referral.qualify('access-please');
      ctx.referral.grantChip('first-shift');
      if (sum.findings === 0 && sum.escalations === 0 && sum.left === 0 && sum.processed >= 6) ctx.referral.grantChip('glory-to-compliance');
      if (sum.boss?.denied) ctx.referral.grantChip('ceo-denied');

      const events = B.events || [];
      const event = events.length ? events[cfg.eventIdx % events.length] : null;
      const eventCost = event?.cost || 0;
      const sanityNow = cfg.sanity;
      const clean = sum.findings === 0 && sum.escalations === 0 && sum.left === 0 && sum.processed > 0;
      let alloc = greedyAlloc(Math.max(0, sum.correct - eventCost), B);
      let camp = null;
      if (cfg.daily) {
        ctx.store.update(
          'daily',
          (m) => {
            const o = m && typeof m === 'object' ? { ...m } : {};
            if (!o[cfg.n]) o[cfg.n] = { correct: sum.correct, total: sum.total, findings: sum.findings, grid: sum.grid };
            const keep = Object.keys(o).map(Number).sort((a, b) => b - a).slice(0, 14);
            return Object.fromEntries(keep.map((k) => [k, o[k]]));
          },
          {},
        );
      } else {
        camp = getCamp() || freshCamp();
        camp.history = [...(camp.history || []), { day: cfg.day, correct: sum.correct, total: sum.total, findings: sum.findings, escalations: sum.escalations, grid: sum.grid }].slice(-10);
        camp.pending = { day: cfg.day, earned: sum.correct, eventCost, findings: sum.findings, clean, alloc };
        camp.day = cfg.day + 1;
        saveCamp(camp);
      }

      // Memo
      const verdict = clean ? 'perfect' : sum.findings + sum.escalations <= 1 ? 'good' : sum.findings + sum.escalations <= 3 ? 'meh' : 'bad';
      const stampTxt = verdict === 'perfect' ? t.stampPerfect : verdict === 'good' ? t.stampGood : t.stampBad;
      const stampCls = verdict === 'perfect' || verdict === 'good' ? 'stamp--approved' : 'stamp--denied';
      const mistakes = sum.results.filter((r) => !r.correct);
      const stats = [
        [t.stats.processed, `${sum.processed}/${sum.total}`],
        [t.stats.approved, sum.approved],
        [t.stats.denied, sum.denied],
        [t.stats.correct, sum.correct],
        [t.stats.findings, sum.findings],
        [t.stats.escalations, sum.escalations],
        [t.stats.csat, `${sum.csat}%`],
        [t.stats.left, sum.left],
        [t.stats.score, formatNumber(sum.score)],
      ];
      const memo = el(
        'article.ap-memo.ap-memo--report.paper',
        memoHead(t.reportTitle, C.company.dept),
        meta([
          [t.labelTo, t.reportTo],
          [t.labelRe, cfg.label],
        ]),
        el('div.ap-emoji-grid', { role: 'img', 'aria-label': `${sum.correct}/${sum.total}` }, sum.grid),
        el('p.ap-legend', t.legend),
        el('dl.ap-stats', stats.map(([k, v]) => el('div.ap-stat', el('dt', k), el('dd', String(v))))),
        sum.reason === 'clock' && sum.left > 0 && el('p.ap-note', fmt(t.timeUp, { left: sum.left, tickets: sum.left === 1 ? t.ticketOne : t.ticketMany })),
        el('h3.ap-memo__h', t.findingsTitle),
        mistakes.length ? el('ol.ap-findings', mistakes.map(findingItem)) : el('p.ap-findings__none', t.noFindings),
        el('p.ap-verdict', t.verdicts?.[verdict] || ''),
        el(`div.stamp.${stampCls}.ap-memo__stamp${reduced ? '' : '.is-slam'}`, stampTxt),
      );

      // Sanity budget
      const budgetBox = el('article.ap-budget.paper');
      let signed = false;
      let signedMsg = '';
      const nextBtn = !cfg.daily && el('button.btn.btn--vital', { type: 'button', disabled: true, onclick: () => start('campaign') }, t.signFirst);
      const line = (k, v, cls = '') => el(`div.ap-bline${cls ? '.' + cls : ''}`, el('span', k), el('b', v));
      function renderBudget() {
        const out = budgetOutcome({ sanity: sanityNow, max: MAX, earned: sum.correct, eventCost, findings: sum.findings, clean, alloc, B });
        const items = (B.items || []).map((it) => {
          const on = Boolean(alloc[it.id]);
          const afford = on || out.remaining >= it.cost;
          return el(
            `button.ap-bitem${on ? '.is-on' : ''}`,
            {
              type: 'button',
              'aria-pressed': on ? 'true' : 'false',
              disabled: signed || !afford,
              onclick: () => {
                alloc = { ...alloc, [it.id]: !on };
                if (camp?.pending) {
                  camp.pending.alloc = alloc;
                  saveCamp(camp);
                }
                ctx.sfx.click();
                renderBudget();
              },
            },
            el('span.ap-bitem__check', { 'aria-hidden': 'true' }, on ? '☑' : '☐'),
            el('span.ap-bitem__icon', { 'aria-hidden': 'true' }, it.icon),
            el('span.ap-bitem__main', el('b', it.name), el('small', it.note)),
            el('span.ap-bitem__side', el('b', `${it.cost} ${t.sp}`), el('small', on ? (it.fund ? fmt(t.fundGain, { n: it.fund }) : '') : fmt(t.skipCost, { n: it.skip }))),
          );
        });
        // Native replaceChildren() would print `false` for skipped rows, so build through el().
        budgetBox.replaceChildren(
          ...el(
            'div',
            memoHead(t.budgetTitle, cfg.label),
          el('div.ap-bline.ap-bline--sanity', el('span', t.budgetNow), pips(el, sanityNow, MAX), el('b', `${sanityNow}/${MAX}`)),
          line(t.budgetEarned, `+${sum.correct} ${t.sp}`),
          event && line(`${t.budgetEvent}: ${event.text}`, `−${eventCost} ${t.sp}`),
          line(t.budgetAvailable, `${out.available} ${t.sp}`, 'is-total'),
          el('div.ap-bitems', items),
          line(t.budgetRemaining, `${out.remaining} ${t.sp}`),
          out.stress > 0 && line(fmt(t.budgetStress, { n: sum.findings }), `−${out.stress}`),
          out.bonus > 0 && line(t.budgetClean, `+${out.bonus}`),
          el(`div.ap-bline.ap-bline--sanity.is-next${out.next <= 2 ? '.is-danger' : ''}`, el('span', t.budgetNext), pips(el, out.next, MAX), el('b', `${out.next}/${MAX}`)),
            signed ? el('p.ap-budget__signed', signedMsg) : el('button.btn.btn--paper.btn--block.ap-sign', { type: 'button', onclick: sign }, t.budgetSign),
          ).childNodes,
        );
      }
      function sign() {
        const out = budgetOutcome({ sanity: sanityNow, max: MAX, earned: sum.correct, eventCost, findings: sum.findings, clean, alloc, B });
        signed = true;
        ctx.sfx.stamp();
        if (cfg.daily) {
          signedMsg = `${fmt(t.budgetSigned, { sanity: out.next })} ${t.budgetDaily}`;
          return renderBudget();
        }
        const c = finalizePending(getCamp() || camp);
        if (c.status === 'dead') return gameOver(sum, c);
        if (c.status === 'complete') return complete(sum, c);
        signedMsg = fmt(t.budgetSigned, { sanity: c.sanity });
        renderBudget();
        nextBtn.disabled = false;
        nextBtn.textContent = fmt(t.nextDay, { day: c.day });
        nextBtn.focus({ preventScroll: true });
      }
      renderBudget();

      // Share + sponsor
      const findingsWord = sum.findings === 1 ? t.findingOne : t.findingMany;
      let text;
      if (cfg.daily) {
        const extra = (sum.escalations ? fmt(t.shareEscalations, { n: sum.escalations }) : '') + (sum.boss?.text ? `, ${sum.boss.text}` : '');
        text = fmt(t.shareDaily, { n: cfg.n, correct: sum.correct, total: sum.total, findings: sum.findings, findingsWord, extra, grid: sum.grid });
      } else {
        text = fmt(t.shareCampaign, { day: cfg.day, company: C.company.short || C.company.name, correct: sum.correct, total: sum.total, findings: sum.findings, findingsWord, sanity: sanityNow, grid: sum.grid });
      }
      if (sum.findings === 0 && sum.left === 0) text += `\n${t.shareGlory}`;

      const actions = el(
        'div.ap-report__actions',
        cfg.daily
          ? [
              el(
                'button.btn.btn--amber',
                {
                  type: 'button',
                  onclick: () => {
                    const c = getCamp();
                    if (!c || c.status !== 'active') saveCamp(freshCamp());
                    start('campaign');
                  },
                },
                t.playCampaign,
              ),
              el('button.btn.btn--ghost', { type: 'button', onclick: () => start('daily') }, t.replay),
            ]
          : nextBtn,
        el('button.btn.btn--ghost', { type: 'button', onclick: lobby }, t.toLobby),
      );
      setScreen(el('div.ap-report', el('div.ap-report__grid', memo, el('div.ap-report__side', budgetBox, actions)), el('div.ap-report__share', sharePanel(text), ctaCard(cfg.daily ? 'daily' : cfg.day))));
    }

    // ---------- Game over: Oktholm Syndrome ----------
    function gameOver(sum, camp) {
      ctx.track('gameover', { day: camp.diedOn });
      ctx.sfx.flatline();
      const dx = C.diagnosis || {};
      const syms = ctx.rng.random.sample(dx.symptoms || [], 3);
      const days = camp.diedOn || 1;
      const text = fmt(t.shareGameover, { day: days, symptom: syms[0] || '', grid: sum.grid });
      setScreen(
        el(
          'div.ap-end',
          el(
            'article.ap-dx.paper',
            el('div.kicker', dx.kicker),
            el('h2.ap-dx__title', t.dxTitle),
            meta([[t.dxPatient, `${t.reportTo}, ${C.company.name}`]]),
            el('p', fmt(dx.intro, { days: `${days} ${days === 1 ? t.shiftOne : t.shiftMany}` })),
            el('ul.ap-dx__symptoms', syms.map((s) => el('li', s))),
            el(`div.stamp.stamp--diagnosed.ap-dx__stamp${reduced ? '' : '.is-slam'}`, dx.stamp),
            el('p.ap-dx__prognosis', dx.prognosis),
          ),
          el(
            'div.ap-report__actions.ap-report__actions--center',
            el(
              'button.btn.btn--amber',
              {
                type: 'button',
                onclick: () => {
                  saveCamp(freshCamp());
                  start('campaign');
                },
              },
              t.newCampaign,
            ),
            el('button.btn.btn--ghost', { type: 'button', onclick: lobby }, t.toLobby),
          ),
          el('div.ap-report__share', sharePanel(text), ctaCard('gameover')),
        ),
      );
    }

    // ---------- Campaign complete ----------
    function complete(sum, camp) {
      ctx.track('campaign_complete', { sanity: camp.sanity });
      ctx.ui.confetti();
      const hist = (camp.history || []).slice(-5);
      const totalFindings = hist.reduce((s, h) => s + (h.findings || 0), 0);
      const grid = hist.map((h) => h.grid).join('\n');
      const text = fmt(t.shareComplete, { company: C.company.short || C.company.name, grid });
      setScreen(
        el(
          'div.ap-end',
          el(
            'article.ap-memo.ap-memo--complete.paper',
            memoHead(t.completeTitle, C.company.dept),
            el('p', fmt(t.completeBody, { findings: totalFindings, findingsWord: totalFindings === 1 ? t.findingOne : t.findingMany })),
            el('div.ap-emoji-grid.ap-emoji-grid--multi', hist.map((h) => el('div', el('span.ap-emoji-grid__day', `${h.day}`), h.grid))),
            el(`div.stamp.stamp--approved.ap-memo__stamp${reduced ? '' : '.is-slam'}`, t.completeStamp),
          ),
          el(
            'div.ap-report__actions.ap-report__actions--center',
            el(
              'button.btn.btn--amber',
              {
                type: 'button',
                onclick: () => {
                  saveCamp(freshCamp());
                  start('campaign');
                },
              },
              t.newCampaign,
            ),
            el('button.btn.btn--ghost', { type: 'button', onclick: lobby }, t.toLobby),
          ),
          el('div.ap-report__share', sharePanel(text), ctaCard('complete')),
        ),
      );
    }

    lobby();
    return () => {
      const c = screenCleanup;
      screenCleanup = null;
      try {
        c?.();
      } catch (e) {
        console.error(e);
      }
      d.run();
      wrap.remove();
    };
  },
};
