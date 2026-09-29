// #/chart: the visitor's "medical records". Everything this site stores in the browser, every request it
// made this visit, and a one-click wipe. #/break-glass: the staff-only joke robots.txt points at.

import { el } from '../engine/dom.js';
import { link } from './common.js';

export function renderChart(root, s) {
  const r = s.brand.content?.records?.chart || {};
  const storage = el('pre.chart__pre');
  const requests = el('div.chart__requests');
  const draw = () => {
    storage.textContent = JSON.stringify(s.store.dump(), null, 2) || '{}';
    const log = s.api.log || [];
    requests.replaceChildren(
      log.length
        ? el(
            'table.chart__table',
            el('thead', el('tr', el('th', 'Time'), el('th', 'Request'), el('th', 'Fields sent'), el('th', 'Status'))),
            el(
              'tbody',
              log
                .slice()
                .reverse()
                .map((e) => el('tr', el('td', new Date(e.at).toLocaleTimeString()), el('td', `${e.method} ${e.path}`), el('td', e.fields.join(', ') || '—'), el('td', String(e.status)))),
            ),
          )
        : el('p.dim', r.noRequests || ''),
    );
  };
  draw();
  const timer = setInterval(draw, 2000);

  const discharge = el('button.btn.btn--alarm', { type: 'button', text: r.discharge || 'Delete my data' });
  discharge.addEventListener('click', () =>
    s.ui.modal({
      title: r.discharge,
      body: r.dischargeBody,
      actions: [
        { label: 'Stay admitted' },
        {
          label: r.dischargeConfirm || 'Delete',
          kind: 'alarm',
          onClick: () => {
            s.store.clear();
            s.track('records_discharge');
            s.ui.toast(r.discharged || 'Deleted.');
            setTimeout(() => location.replace(location.pathname), 1600);
          },
        },
      ],
    }),
  );

  root.append(
    el(
      'section.section.chart',
      el(
        'div.wrap',
        el('div.kicker', r.kicker || ''),
        el('h1.page-title', r.title || ''),
        el('p.section__body', r.lede || ''),
        el(
          'div.card.card--raised.pad.chart__know',
          el('p', { style: { margin: 0 } }, r.howKnow || ''),
          s.captor?.openThread && el('button.btn.btn--ghost.btn--sm', { type: 'button', style: { marginTop: '12px' }, text: r.threadLabel || 'Open the thread', onclick: () => s.captor.openThread() }),
        ),
        el('h2.chart__h', 'What leaves this browser'),
        el('ul.chart__list', (r.sends || []).map((x) => el('li', x))),
        el('p.dim', r.never || ''),
        el('h2.chart__h', r.requestsTitle || 'Requests'),
        requests,
        el('h2.chart__h', r.storageTitle || 'Storage'),
        storage,
        el('div.card.card--raised.pad.chart__discharge', el('p', { style: { marginTop: 0 } }, r.dischargeBody || ''), discharge),
      ),
    ),
  );
  s.referral.grantChip('records');
  return () => clearInterval(timer);
}

export function renderBreakGlass(root, s) {
  const b = s.brand.content?.records?.breakGlass || {};
  const glass = el('button.glassbox', { type: 'button', 'aria-label': 'Break the glass' }, el('span.glassbox__label', 'BREAK GLASS'), el('span.glassbox__env', '✉️'));
  const note = el('div.glassbox__note', { hidden: true }, el('p', b.envelope || ''), el('p.dim', b.dave || ''), link('/play/leaver', b.cta || 'Offboard Dave', 'btn btn--vital'));
  glass.addEventListener('click', () => {
    glass.classList.add('is-broken');
    s.sfx.bad();
    note.hidden = false;
    s.track('break_glass');
  });
  root.append(el('section.section', el('div.wrap.glass-page', el('div.kicker.kicker--alarm', b.kicker || ''), el('h1.page-title', b.title || ''), el('p.section__body', b.lede || ''), glass, note)));
}
