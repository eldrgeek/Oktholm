// The lobby: broadcast hero, vitals, today's rotating content, arcade, OKTV guide, sponsorship, therapy, cure.

import { el, disposer } from '../engine/dom.js';
import { dailyPick, dayNumber } from '../engine/rng.js';
import { getModule, moduleMeta } from '../engine/modules.js';
import { mountChannel } from './channel.js';
import { sectionHead, vitalsPanel, arcadeGrid, guideList, link, severityTag } from './common.js';

export function renderLobby(root, s) {
  const d = disposer();
  const { brand } = s;
  const c = brand.content || {};
  const home = c.home || {};
  const hero = home.hero || {};
  const day = dayNumber(brand.epoch);

  // ---- Hero
  const headline = dailyPick(hero.headlines || ['It’s not you.'], 'hero', brand.epoch);
  const title = el('h1.hero__title');
  // Emphasize the last sentence fragment in phosphor green.
  // Sentence split without regex lookbehind (a parse-time SyntaxError on Safari < 16.4).
  const parts = (headline.match(/[^.!?]+[.!?]*/g) || [headline]).map((p) => p.trim()).filter(Boolean);
  parts.forEach((p, i) => (i === parts.length - 1 && parts.length > 1 ? title.append(el('em', p)) : title.append(p + (i < parts.length - 1 ? ' ' : ''))));
  const tvHost = el('div');
  root.append(
    el(
      'section.hero',
      el(
        'div.wrap.hero__grid',
        el(
          'div',
          el('div.kicker', el('span.live-dot'), ' ', hero.kicker || ''),
          title,
          el('p.hero__body', hero.body || ''),
          el(
            'div.hero__ctas',
            hero.primary && el('a.btn.btn--vital.btn--lg', { href: '#' + hero.primary.path, text: hero.primary.label }),
            hero.secondary && el('a.btn.btn--ghost.btn--lg', { href: '#' + hero.secondary.path, text: hero.secondary.label }),
            hero.tertiary && el('a.btn.btn--ghost.btn--lg', { href: '#' + hero.tertiary.path, text: hero.tertiary.label }),
          ),
          el('p.hero__fine', `Patient ${s.referral.patientId()} · No login required · Sponsored by ${brand.sponsor?.name}`),
        ),
        tvHost,
      ),
      el('div.wrap', vitalsPanel(home.vitals || [], d)),
    ),
  );
  const nowPlaying = el('span');
  const upNext = el('span');
  const channel = mountChannel(tvHost, s, {
    rotation: home.tv?.rotation || [],
    startAt: day,
    onProgram: (mod, next) => {
      nowPlaying.textContent = `Now: ${moduleMeta(mod, brand).title}`;
      upNext.textContent = next ? `Up next: ${moduleMeta(next, brand).title}` : '';
    },
  });
  tvHost.append(el('div.channel__meta', nowPlaying, upNext, link('/tv', 'Full channel ▸', 'btn btn--ghost btn--sm')));
  d(() => channel.destroy());

  // ---- Today
  const gz = c.gazette || [];
  const lead = dailyPick(gz, 'gazette', brand.epoch);
  const symptom = dailyPick(c.symptoms || [], 'symptom', brand.epoch);
  const confession = dailyPick(c.confessions || [], 'confession', brand.epoch);
  const idle = getModule('idle');
  const shift = getModule('access-please');
  root.append(
    el(
      'section.section',
      el(
        'div.wrap',
        sectionHead({ kicker: `${home.today?.kicker || 'Today'} · Day ${day}`, title: home.today?.title || 'Today' }),
        el(
          'div.today',
          el(
            'a.today__lead.paper.gazette-card',
            { href: '#/gazette', style: { textDecoration: 'none' } },
            el('div.gazette-card__mast', el('span', `Vol. 1 · No. ${day}`), el('span', new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })), el('span', 'Price: 1 SSO tax')),
            el('div.gazette-card__name', 'The Oktholm Gazette'),
            lead && el('h3.gazette-card__headline', lead.headline),
            lead && el('p.gazette-card__dek', lead.dek),
          ),
          el(
            'div.today__side',
            symptom &&
              el(
                'div.card.card--raised.tile',
                el('div.kicker.kicker--alarm', el('span', 'Symptom of the day'), el('span', symptom.code)),
                el('div.tile__big', symptom.name),
                el('p.dim', { style: { margin: 0 } }, symptom.desc),
                el('div.tile__foot', severityTag(symptom.severity), link('/triage', 'Get screened', 'btn btn--sm btn--ghost')),
              ),
            confession &&
              el(
                'div.card.card--raised.tile',
                el('div.kicker.kicker--amber', el('span', 'Confession of the day'), el('span', '🕯️')),
                el('p', { style: { margin: 0, fontSize: '17px' } }, `“${confession.text}”`),
                el('div.tile__foot', el('span.faint.mono', { style: { fontSize: '12px' } }, `— ${confession.who}`), link('/therapy', 'Group Therapy', 'btn btn--sm btn--ghost')),
              ),
          ),
          el(
            'div.today__row',
            idle &&
              el(
                'a.card.card--raised.card--link.tile',
                { href: '#/play/idle' },
                el('div.kicker', el('span', `${moduleMeta(idle, brand).title} #${day}`), el('span', '🔤')),
                el('div.tile__big', 'Today’s word is ready'),
                el('p.dim', { style: { margin: 0 } }, 'Five letters. Six tries. One identity crisis. Same word for everyone today.'),
                el('div.tile__foot', el('span.btn.btn--sm.btn--vital', 'Play')),
              ),
            shift &&
              el(
                'a.card.card--raised.card--link.tile',
                { href: '#/play/access-please' },
                el('div.kicker', el('span', `Daily Shift #${day}`), el('span', '🛂')),
                el('div.tile__big', 'Access, Please'),
                el('p.dim', { style: { margin: 0 } }, 'Today’s queue is the same for every admin on Earth. Stamp wisely. Glory to Compliance.'),
                el('div.tile__foot', el('span.btn.btn--sm.btn--vital', 'Clock in')),
              ),
            el(
              'a.card.card--raised.card--link.tile',
              { href: '#/intervention' },
              el('div.kicker', el('span', 'Referral of the day'), el('span', '💌')),
              el('div.tile__big', 'Stage an intervention'),
              el('p.dim', { style: { margin: 0 } }, 'Know an admin who defends their renewal quote at dinner? Send them a personalized intervention. It’s what friends do.'),
              el('div.tile__foot', el('span.btn.btn--sm.btn--amber', 'Start')),
            ),
          ),
        ),
      ),
    ),
  );

  // ---- Arcade
  root.append(
    el(
      'section.section',
      el(
        'div.wrap',
        sectionHead({ kicker: home.arcade?.kicker, title: home.arcade?.title, body: home.arcade?.body, actions: link('/arcade', 'All games ▸') }),
        arcadeGrid(brand, ['game', 'toy']),
      ),
    ),
  );

  // ---- OKTV guide + shows
  root.append(
    el(
      'section.section',
      el(
        'div.wrap',
        sectionHead({ kicker: home.tv?.kicker, title: home.tv?.title, body: home.tv?.body, actions: link('/tv', 'Watch OKTV ▸', 'btn btn--cure') }),
        el('div.grid.grid--2', guideList(home.tv?.guide || [], 6, brand), arcadeGrid(brand, 'show')),
      ),
    ),
  );

  // ---- Sponsorship teaser
  const sp = c.sponsorship || {};
  root.append(
    el(
      'section.section',
      el(
        'div.wrap',
        el(
          'div.card.card--raised.pad.sponsor-teaser',
          el(
            'div',
            el('div.kicker.kicker--amber', sp.kicker || 'Sponsorship'),
            el('h2.section__title', sp.title || ''),
            el('p.section__body', sp.body || ''),
            el('p.faint', { style: { fontSize: '13px', marginTop: '10px' } }, sp.honesty || ''),
            el('div.row', { style: { marginTop: '14px' } }, link('/sponsor', 'Get your sponsor link', 'btn btn--amber'), link('/intervention', 'Stage an intervention')),
          ),
          el(
            'div.tier-strip',
            (sp.tiers || []).map((t) => el('div.tier-strip__item', el('div.chip-coin', t.icon), el('div.tier-strip__count', `${t.count}`), el('div.tier-strip__reward', t.reward))),
          ),
        ),
      ),
    ),
  );

  // ---- Cure
  const facts = brand.sponsor?.facts || {};
  root.append(
    el(
      'section.section',
      el(
        'div.wrap',
        el(
          'div.cure-band',
          el(
            'div',
            el('div.kicker.kicker--cure', c.cure?.kicker || 'There is a cure'),
            el('h2.section__title', c.cure?.title || ''),
            el('ul.cure-band__list', ['lifecycle', 'requests', 'shadow', 'reviews'].filter((k) => facts[k]).map((k) => el('li', facts[k]))),
          ),
          el(
            'div.cure-band__cta',
            el('div.cure-band__dose', el('b', facts.free || ''), el('span', facts.trial || '')),
            s.cta.button('primary', brand.sponsor?.ctaLabel || 'Start', { content: 'lobby-cure', size: 'lg' }),
            s.cta.button('demo', 'Book a treatment session', { content: 'lobby-cure', variant: 'ghost' }),
            link('/cure', 'Read the full treatment plan ▸', 'btn btn--ghost btn--sm'),
          ),
        ),
      ),
    ),
  );

  return () => d.run();
}
