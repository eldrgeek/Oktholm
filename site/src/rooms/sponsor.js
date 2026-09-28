// The Sponsorship Program: your code, your link, the reward ladder, your chips, the leaderboard.

import { el, disposer } from '../engine/dom.js';
import { sectionHead } from './common.js';

export function renderSponsor(root, s) {
  const d = disposer();
  const sp = s.brand.content?.sponsorship || {};
  const chipsAll = s.brand.content?.chips || [];
  const pid = s.referral.patientId();
  const link = s.share.url({}, { platform: 'sponsor-link' });

  const countEl = el('div.sponsor__count', '—');
  const countNote = el('p.faint', { style: { fontSize: '13px', margin: '6px 0 0' } }, 'Checking the recovery network…');
  const ladder = el('div.ladder');
  const board = el('div.board');

  function renderLadder(count) {
    ladder.innerHTML = '';
    for (const t of sp.tiers || []) {
      const unlocked = count != null && count >= t.count;
      ladder.append(
        el(
          `div.ladder__tier${unlocked ? '.is-unlocked' : ''}`,
          el(`div.chip-coin${unlocked ? '' : '.is-locked'}`, t.icon),
          el(
            'div.ladder__body',
            el('div.ladder__top', el('span.ladder__count', `${t.count} sponsee${t.count > 1 ? 's' : ''}`), el('span.ladder__name', t.name)),
            el('div.ladder__reward', t.reward),
            el('p.ladder__detail', t.detail),
          ),
          el('div.ladder__state', unlocked ? el('span.tag.tag--vital', 'Unlocked') : el('span.tag', count == null ? 'Locked' : `${Math.max(0, t.count - count)} to go`)),
        ),
      );
    }
  }

  function renderBoard(rows, sample) {
    board.innerHTML = '';
    board.append(
      el('div.board__head', el('span.kicker', 'Top sponsors this week'), sample && el('span.tag', 'Sample data — live board arrives with the backend')),
      el(
        'ol.board__list',
        rows.map((r, i) => el('li.board__row', el('span.board__rank', `#${i + 1}`), el('span.board__name.mono', r.name), el('span.board__title', r.title || ''), el('span.board__city.faint', r.city || ''), el('span.board__count', `${r.count}`))),
      ),
    );
  }

  renderLadder(null);
  renderBoard(sp.sampleLeaderboard || [], true);

  const earned = new Set(s.referral.chips().map((c) => c.id));
  const engagement = chipsAll.filter((c) => c.kind === 'engagement');

  root.append(
    el(
      'div.wrap',
      el('header.page-head', el('div.kicker.kicker--amber', sp.kicker || 'Sponsorship'), el('h1.page-title', sp.title || ''), el('p.section__body', sp.body || ''), el('p.faint', { style: { maxWidth: '70ch', fontSize: '14px' } }, sp.honesty || '')),
      el(
        'div.sponsor__grid',
        el(
          'div.card.card--raised.pad.sponsor__code',
          el('div.kicker', 'Your sponsor code'),
          el('div.sponsor__band', el('span.wristband__dot'), el('span', pid)),
          el('div.field', { style: { marginTop: '14px' } }, el('span', 'Your link'), el('div.sponsor__link', el('input.input.mono', { value: link, readOnly: true, onfocus: (e) => e.target.select() }), el('button.btn.btn--vital', { type: 'button', text: 'Copy', onclick: async () => s.ui.toast((await s.share.copy(link)) ? 'Link copied. Go forth and sponsor.' : 'Copy failed.') }))),
          el('div', { style: { marginTop: '16px' } }, s.share.panel({ text: 'I got diagnosed with Oktholm Syndrome. You should get screened too. It’s free, it takes two minutes, and it’s not you, it’s your identity provider.', kind: 'sponsor', title: 'Or share with a message' })),
          el('div.row', { style: { marginTop: '14px' } }, el('a.btn.btn--amber', { href: '#/intervention', text: 'Stage an intervention' }), el('a.btn.btn--ghost', { href: '#/triage', text: 'Get diagnosed first' })),
        ),
        el(
          'div.card.card--raised.pad.sponsor__stats',
          el('div.kicker', 'Your sponsees'),
          countEl,
          countNote,
          el('div.sponsor__minis', el('div', el('b', String(s.referral.shares())), el('span', 'shares from this device')), el('div', el('b', String(earned.size)), el('span', 'chips earned'))),
          el('p.dim', { style: { fontSize: '14px', marginTop: '14px' } }, sp.sponseeGift || ''),
        ),
      ),
      el('section.section', sectionHead({ kicker: 'The ladder', title: 'Rewards' }), el('p.faint', { style: { fontSize: '13px', marginTop: '-8px' } }, sp.fulfillmentNote || ''), ladder),
      el('section.section', sectionHead({ kicker: 'How it works', title: 'Three steps. No steak dinner.' }), el('div.grid.grid--3', (sp.howItWorks || []).map((h) => el('div.card.pad', el('div.howto__step', h.step), el('h3', h.title), el('p.dim', h.body))))),
      el(
        'section.section',
        sectionHead({ kicker: 'Recovery chips', title: 'Your chips', body: 'Earned on this device by playing, watching and admitting things. Referral chips arrive from the backend when your sponsees get diagnosed.' }),
        el(
          'div.chips-grid',
          engagement.map((c) => el(`div.chips-grid__item${earned.has(c.id) ? '.is-earned' : ''}`, el(`div.chip-coin${earned.has(c.id) ? '' : '.is-locked'}`, c.icon), el('div.chips-grid__name', c.name), el('div.chips-grid__desc', c.desc))),
        ),
      ),
      el('section.section', board),
    ),
  );

  // Live numbers if the backend is deployed.
  s.referral.stats().then((stats) => {
    if (!root.isConnected) return;
    if (stats && typeof stats.sponsees === 'number') {
      countEl.textContent = String(stats.sponsees);
      countNote.textContent = stats.sponsees ? 'People who arrived through your link and finished triage.' : 'Nobody yet. Your coworkers are in denial.';
      renderLadder(stats.sponsees);
      // Referral chips are derived from the brand's tier ladder, so the backend stays brand-agnostic.
      for (const t of sp.tiers || []) if (stats.sponsees >= t.count && t.chip) s.referral.grantChip(t.chip);
    } else {
      countEl.textContent = '0';
      countNote.textContent = 'Sponsee counts appear here once the recovery network backend is live. Your links already carry your code.';
      renderLadder(0);
    }
  });
  s.api.get('/leaderboard').then((rows) => {
    if (root.isConnected && Array.isArray(rows?.top) && rows.top.length) renderBoard(rows.top, false);
  });
  return () => d.run();
}
