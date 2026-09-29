// The lobby, laid out as a case file: the admission hero (with Intake at the desk), symptoms, today,
// the arcade, OKTV, interventions, sponsorship, the cure. Every section carries data-cue (the "Learn more"
// label) and, where Intake's tour stops, data-tour.

import { el, disposer } from '../engine/dom.js';
import { dailyPick, dayNumber, seeded } from '../engine/rng.js';
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

  // ---- Admission: the brand's main line, the definition, and Intake at the front desk.
  const [lead, kicker] = brand.site?.tagline || [dailyPick(hero.headlines || [''], 'hero', brand.epoch), ''];
  const intakeHost = el('div.hero__intake');
  root.append(
    el(
      'section.hero',
      { dataset: { cue: 'Admission' } },
      el(
        'div.wrap.hero__grid',
        el(
          'div.hero__copy',
          el('div.kicker', el('span.live-dot'), ' ', hero.kicker || ''),
          el('h1.hero__title', lead + ' ', kicker && el('em', kicker)),
          el('p.hero__body', hero.body || ''),
          el(
            'div.hero__ctas',
            hero.primary && el('a.btn.btn--vital.btn--lg', { href: '#' + hero.primary.path, text: hero.primary.label }),
            hero.secondary && el('a.btn.btn--ghost.btn--lg', { href: '#' + hero.secondary.path, text: hero.secondary.label }),
          ),
          el('p.hero__fine', `Patient ${s.referral.patientId()} · No login required · Sponsored by ${brand.sponsor?.name}`),
        ),
        intakeHost,
      ),
    ),
  );
  const offIntake = s.intake?.embed?.(intakeHost);
  if (typeof offIntake === 'function') d(offIntake);

  // ---- Symptoms: four signs (rotating daily) and the satirical outbreak dashboard.
  const sy = home.symptoms || {};
  const featured = seeded(`symptoms:${day}`).sample(c.symptoms || [], 4);
  root.append(
    el(
      'section.section',
      { dataset: { cue: sy.cue || 'Symptoms', tour: 'triage' } },
      el(
        'div.wrap',
        sectionHead({ kicker: sy.kicker, title: sy.title, body: sy.body, actions: link('/triage', sy.cta || 'Get screened', 'btn btn--vital') }),
        el(
          'div.signs',
          featured.map((x, i) =>
            el(
              'a.card.card--raised.card--link.sign',
              { href: '#/dsm', style: { '--i': i } },
              el('div.sign__ecg', { 'aria-hidden': 'true' }),
              el('div.kicker.kicker--alarm', el('span', x.code), severityTag(x.severity)),
              el('h3.sign__name', x.name),
              el('p.sign__desc', x.desc),
            ),
          ),
        ),
        vitalsPanel(home.vitals || [], d),
      ),
    ),
  );

  // ---- Today: the Gazette, a confession, the overhead page and the daily games. New every UTC day.
  const gz = c.gazette || [];
  const story = dailyPick(gz, 'gazette', brand.epoch);
  const confession = dailyPick(c.confessions || [], 'confession', brand.epoch);
  const page = dailyPick(c.admission?.pages || [], 'pa', brand.epoch);
  const idle = getModule('idle');
  const shift = getModule('access-please');
  root.append(
    el(
      'section.section',
      { dataset: { cue: 'Today' } },
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
            story && el('h3.gazette-card__headline', story.headline),
            story && el('p.gazette-card__dek', story.dek),
          ),
          el(
            'div.today__side',
            page && overheadPage(s, page, d),
            confession &&
              el(
                'div.card.card--raised.tile',
                el('div.kicker.kicker--amber', el('span', 'Confession of the day'), el('span', '🕯️')),
                el('p', { style: { margin: 0, fontSize: '17px' } }, `“${confession.text}”`),
                el('div.tile__foot', el('span.faint.mono', { style: { fontSize: '12px' } }, `— ${confession.who}`), link('/therapy', 'Group Therapy', 'btn btn--sm btn--ghost')),
              ),
          ),
          el(
            'div.today__row.today__row--2',
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
          ),
        ),
      ),
    ),
  );

  // ---- Arcade
  root.append(
    el(
      'section.section',
      { dataset: { cue: home.arcade?.title || 'The Arcade', tour: 'arcade' } },
      el('div.wrap', sectionHead({ kicker: home.arcade?.kicker, title: home.arcade?.title, body: home.arcade?.body, actions: link('/arcade', 'All games ▸') }), arcadeGrid(brand, ['game', 'toy'])),
    ),
  );

  // ---- OKTV: the channel lives here now (the hero belongs to Intake).
  const tvHost = el('div.lobby-tv');
  const nowPlaying = el('span');
  const upNext = el('span');
  root.append(
    el(
      'section.section',
      { dataset: { cue: s.brand.site?.network || 'OKTV', tour: 'oktv' } },
      el(
        'div.wrap',
        sectionHead({ kicker: home.tv?.kicker, title: home.tv?.title, body: home.tv?.body, actions: link('/tv', 'Watch full screen ▸', 'btn btn--cure') }),
        el('div.lobby-tv__grid', el('div', tvHost, el('div.channel__meta', nowPlaying, upNext)), guideList(home.tv?.guide || [], 6, brand)),
      ),
    ),
  );
  let channel = null;
  const startChannel = () => {
    if (channel) return;
    channel = mountChannel(tvHost, s, {
      rotation: home.tv?.rotation || [],
      startAt: day,
      onProgram: (mod, next) => {
        nowPlaying.textContent = `Now: ${moduleMeta(mod, brand).title}`;
        upNext.textContent = next ? `Up next: ${moduleMeta(next, brand).title}` : '';
      },
    });
  };
  d(() => channel?.destroy());
  // Don't run the channel under the admission overlay; don't let it talk over Intake's tour.
  d(
    s.track.on((event) => {
      if (event === 'admission_end') startChannel();
      if (event === 'tour_start') channel?.setSound?.(false);
    }),
  );
  if (!s.admissionActive) startChannel();

  // ---- Interventions
  const iv = home.intervention || {};
  root.append(
    el(
      'section.section',
      { dataset: { cue: iv.cue || 'Interventions', tour: 'intervention' } },
      el(
        'div.wrap',
        el(
          'div.card.card--raised.pad.iv-band',
          el(
            'div',
            el('div.kicker.kicker--amber', iv.kicker || ''),
            el('h2.section__title', iv.title || ''),
            el('p.section__body', iv.body || ''),
            el('div.row', { style: { marginTop: '16px' } }, link('/intervention', iv.cta || 'Stage an intervention', 'btn btn--amber btn--lg')),
          ),
          el('div.iv-band__couch', { 'aria-hidden': 'true' }, (iv.couch || []).map((e, i) => el('span', { style: { '--i': i } }, e))),
        ),
      ),
    ),
  );

  // ---- Sponsorship teaser
  const sp = c.sponsorship || {};
  root.append(
    el(
      'section.section',
      { dataset: { cue: 'Sponsorship', tour: 'sponsor' } },
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
      { dataset: { cue: 'The Cure', tour: 'cure' } },
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

/** Today's overhead page, voiced by the hospital PA on request. */
function overheadPage(s, text, d) {
  const voice = s.makeSpeech();
  let playing = false;
  const btn = el('button.btn.btn--sm.btn--ghost', { type: 'button', text: '▶ Play the page' });
  const render = () => (btn.textContent = playing ? '■ Stop' : '▶ Play the page');
  btn.addEventListener('click', async () => {
    if (playing) {
      voice.stop();
      return;
    }
    if (s.audio.isMuted()) s.audio.setMuted(false);
    s.audio.unlock();
    playing = true;
    render();
    s.track('pa_play');
    await voice.say(text, { voice: 'pa' });
    playing = false;
    render();
  });
  d(() => voice.stop());
  return el(
    'div.card.card--raised.tile.pa-tile',
    el('div.kicker', el('span', 'Overhead page'), el('span', '📢')),
    el('p.pa-tile__text', `“${text}”`),
    el('div.tile__foot', el('span.faint.mono', { style: { fontSize: '12px' } }, 'Oktholm General PA'), btn),
  );
}
