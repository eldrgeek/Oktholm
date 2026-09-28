// The Oktholm Gazette: today's front page plus the back issues (the same daily rotation for everyone).

import { el } from '../engine/dom.js';
import { dailyPick, dayNumber } from '../engine/rng.js';

export function renderGazette(root, s) {
  const gz = s.brand.content?.gazette || [];
  const epoch = s.brand.epoch;
  const today = dayNumber(epoch);
  const DAY = 86400000;
  const issue = (offset) => ({ n: today - offset, date: new Date(Date.now() - offset * DAY), item: dailyPick(gz, 'gazette', epoch, Date.now() - offset * DAY) });
  const lead = issue(0);
  const below = [1, 2, 3].map(issue);
  const back = Array.from({ length: Math.min(21, Math.max(0, today - 4)) }, (_, i) => issue(i + 4)).filter((x) => x.n >= 1);

  root.append(
    el(
      'div.wrap',
      el(
        'article.paper.newspaper',
        el('div.newspaper__top', el('span', `Vol. 1 · No. ${today}`), el('span', lead.date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })), el('span', 'Price: one (1) SSO tax')),
        el('h1.newspaper__mast', 'The Oktholm Gazette'),
        el('div.newspaper__motto', '“All the news that’s fit to provision”'),
        lead.item && el('h2.newspaper__lead', lead.item.headline),
        lead.item && el('p.newspaper__dek', lead.item.dek),
        el(
          'div.newspaper__cols',
          below.filter((b) => b.item).map((b) => el('div.newspaper__col', el('div.newspaper__kicker', `No. ${b.n} · ${b.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`), el('h3', b.item.headline), el('p', b.item.dek))),
        ),
        el('div.newspaper__foot', el('span', 'A new front page every day at midnight UTC.'), el('a.btn.btn--paper.btn--sm', { href: '#/tv', text: 'Watch tonight’s broadcast' })),
      ),
      back.length > 0 &&
        el(
          'section.section',
          el('div.kicker', 'Back issues'),
          el(
            'ol.backissues',
            back.map((b) => el('li', el('span.mono.faint', `No. ${b.n}`), ' ', b.item?.headline || '')),
          ),
        ),
    ),
  );
}
