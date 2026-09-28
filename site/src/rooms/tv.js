// OKTV: the full channel page with program guide and on-demand shows.

import { el, disposer } from '../engine/dom.js';
import { dayNumber } from '../engine/rng.js';
import { moduleMeta } from '../engine/modules.js';
import { mountChannel } from './channel.js';
import { sectionHead, guideList, arcadeGrid } from './common.js';

export function renderTv(root, s) {
  const d = disposer();
  const tv = s.brand.content?.home?.tv || {};
  const host = el('div.tv-page__screen');
  const now = el('div.tv-page__now');
  root.append(
    el(
      'div.wrap',
      el('header.page-head', el('div.kicker', el('span.live-dot'), ' ', tv.kicker || 'TV'), el('h1.page-title', tv.title || 'TV'), el('p.section__body', tv.body || '')),
      el('div.tv-page', host, el('aside.tv-page__side', now, el('div.kicker', { style: { margin: '18px 0 10px' } }, 'Program guide'), guideList(tv.guide || [], 8, s.brand))),
      el('section.section', sectionHead({ kicker: 'On demand', title: 'Watch from the top' }), arcadeGrid(s.brand, 'show')),
    ),
  );
  const ch = mountChannel(host, s, {
    rotation: tv.rotation || [],
    startAt: dayNumber(s.brand.epoch) + 1,
    onProgram: (mod, next) => {
      now.innerHTML = '';
      now.append(
        el('div.kicker', 'On now'),
        el('div.tv-page__title', `${moduleMeta(mod, s.brand).emoji || ''} ${moduleMeta(mod, s.brand).title}`),
        el('p.dim', moduleMeta(mod, s.brand).blurb || ''),
        next && el('p.faint.mono', { style: { fontSize: '12px' } }, `Up next: ${moduleMeta(next, s.brand).title}`),
        el('div.row', el('button.btn.btn--ghost.btn--sm', { type: 'button', text: 'Next program ▸', onclick: () => ch.next() }), el('a.btn.btn--sm.btn--vital', { href: `#/watch/${mod.id}`, text: 'Watch from the start' })),
      );
    },
  });
  d(() => ch.destroy());
  return () => d.run();
}
