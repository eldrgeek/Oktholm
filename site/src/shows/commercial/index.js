// "Yeshidumab": a 45-60 second pharmaceutical-ad parody. Gloomy 11:47 PM cold open, diagnosis,
// soft-focus product reveal, happy montage, fine print read at 1.9x, end card with sponsor facts.
// All script lines come from brand content (ctx.content); the fallbacks below keep it brand-neutral.
import { mountShow, switchLayers, svg } from './showkit.js';
import * as art from './scenes.js';
import './style.css'; // after the kit so show styles override kit defaults

const FALLBACK = {
  poster: { kicker: 'A word from our sponsor', cta: 'Play · 1 min · captions on' },
  clock: '11:47 PM',
  unread: 400,
  queueTitle: 'My queue',
  tickets: ['P1: “SSO is down”', 'Access request: “everything”', 'New hire starts in 10 minutes', 'Quick question (not quick)'],
  stickyNote: 'DO NOT REBOOT',
  script: {
    questions: ['Do you create three groups for every new hire?', 'Do you defend your renewal quote at family dinners?'],
    diagnosis: 'You may be suffering from {condition}.',
    diagnosisTitle: '{condition}',
    diagnosisNote: '*Not a real medical condition.',
    symptoms: ['Defending your vendor', 'Ticket-induced insomnia'],
    hope: 'But there is hope.',
    reveal: 'Introducing {drug}.',
    ask: 'Ask your CFO if {drug} is right for you.',
    montage: [
      { shot: 'five', line: 'Imagine leaving work at five.', super: '5:00 PM' },
      { shot: 'beach', line: 'Walking the dog.' },
      { shot: 'kite', line: 'Flying a kite. On a Tuesday.' },
      { shot: 'latte', line: 'Offboarding with one click.' },
      { shot: 'cfo', line: 'Even your CFO is smiling.' },
    ],
    finePrint: ['Side effects may include leaving work on time.', 'Consult procurement before switching.'],
    end: '{drug}.',
  },
  legal: ['This is a parody of a pharmaceutical commercial.'],
  bottle: { lines: ['Take as needed'] },
  cfo: { name: 'The', title: 'CFO' },
  endcard: { kicker: 'Available without a prescription', ask: 'Ask your CFO.', ingredient: 'Active ingredient:', disclaimer: '{drug} is a parody. {sponsor} is real.' },
  share: { title: 'Share the commercial', text: 'I watched the {drug} commercial. Side effects may include leaving work on time.' },
  cta: { kicker: 'Actual prescription', title: '{drug} is a joke. {sponsor} is not.', facts: ['lifecycle', 'free'], kind: 'primary' },
};

const APPS = ['SF', 'Sl', 'Zm', 'Fg', 'Jf', 'Nt', 'Dx', 'Gh', 'Mr', 'Tr', 'As', 'Hb', 'Zd', 'Dk', 'Lo', 'Cn', 'Bx', 'Wk', 'Pd', 'Mn'];
const TILE_COLORS = ['#4263eb', '#e8590c', '#12b886', '#ae3ec9', '#f59f00', '#1c7ed6', '#d6336c', '#2b8a3e', '#5f3dc4', '#0c8599'];

export default {
  id: 'commercial',
  kind: 'show',
  title: 'Ask Your Doctor',
  blurb: 'A pharmaceutical commercial for your identity crisis. Side effects may include leaving work on time.',
  emoji: '💊',
  minutes: '1 min',
  therapy: 'Treats: Chronic Renewal Anxiety',

  mount(root, ctx, opts = {}) {
    const { el, fill } = ctx.dom;
    const c = ctx.content || {};
    const brand = ctx.brand || {};
    const facts = brand.sponsor?.facts || {};
    const sponsor = brand.sponsor?.name || 'the sponsor';
    const drug = c.drug || `${sponsor.replace(/[^a-z]/gi, '') || 'Cure'}umab`;
    const vars = { drug, sponsor, condition: brand.site?.condition || 'the syndrome' };
    const pick = (key) => c[key] ?? FALLBACK[key];
    const S = { ...FALLBACK.script, ...(c.script || {}) };
    const T = (s) => fill(String(s ?? ''), vars);
    const endcard = { ...FALLBACK.endcard, ...(c.endcard || {}) };
    const bottleCopy = { name: drug.toUpperCase(), phonetic: c.phonetic ? `(${c.phonetic})` : '', ...FALLBACK.bottle, ...(c.bottle || {}) };
    const tickets = pick('tickets');
    const unread = Number(pick('unread')) || 400;

    // ---------- stage ----------
    const refs = {};
    const layer = (name, ...kids) => el(`div.cm-layer.cm-layer--${name}`, { dataset: { layer: name } }, el('div.cm-kb', ...kids));

    function buildStage() {
      refs.count = el('b.cm-queue__count', String(unread));
      refs.rows = el(
        'ul.cm-queue__rows',
        tickets.map((t, i) => el('li', el(`i.cm-dot.cm-dot--${i % 3}`), el('span', t), el('em', `${2 + i * 3}m`))),
      );
      const gloom = layer(
        'gloom',
        svg(ctx, 'div.cm-art', art.gloom()),
        el('div.cm-rain', { 'aria-hidden': 'true' }, el('i'), el('i')),
        el('div.cm-flash', { 'aria-hidden': 'true' }),
        el('div.cm-clock', el('span', pick('clock'))),
        el('div.cm-poster-cat', { 'aria-hidden': 'true' }, el('span.cm-poster-cat__cat', '🐈'), el('span.cm-poster-cat__txt', 'HANG IN THERE')),
        el('div.cm-queue', el('div.cm-queue__head', el('span', T(pick('queueTitle'))), el('span.cm-queue__badge', refs.count, ' unread')), el('div.cm-queue__view', refs.rows)),
        el('div.cm-sticky', pick('stickyNote')),
      );

      refs.symptoms = el(
        'ul.cm-dx__list',
        (S.symptoms || []).map((s) => el('li', T(s))),
      );
      const dx = layer(
        'diagnosis',
        svg(ctx, 'div.cm-art', art.diagnosis()),
        el('div.cm-dx', el('div.cm-dx__kicker', 'Condition'), el('div.cm-dx__title', T(S.diagnosisTitle)), refs.symptoms, el('div.cm-dx__note', T(S.diagnosisNote))),
      );

      const label = () =>
        el(
          'div.cm-label',
          el('div.cm-label__band', 'Rx only*'),
          el('div.cm-label__name', bottleCopy.name),
          bottleCopy.phonetic && el('div.cm-label__phon', bottleCopy.phonetic),
          el('div.cm-label__rule'),
          ...(bottleCopy.lines || []).map((l) => el('div.cm-label__line', T(l))),
        );
      refs.wordmark = el(
        'div.cm-wordmark',
        el('div.cm-wordmark__name', drug, el('sup', '™')),
        c.phonetic && el('div.cm-wordmark__phon', `(${c.phonetic})`),
        el('div.cm-wordmark__for', `For the treatment of ${vars.condition}`),
      );
      const reveal = layer('reveal', svg(ctx, 'div.cm-art', art.reveal()), el('div.cm-bokeh', { 'aria-hidden': 'true' }, [1, 2, 3, 4, 5, 6, 7].map(() => el('i'))), label(), refs.wordmark);

      const five = layer('five', svg(ctx, 'div.cm-art', art.five()), el('div.cm-exit', 'EXIT'));
      const beach = layer('beach', svg(ctx, 'div.cm-art', art.beach()));
      const kite = layer('kite', svg(ctx, 'div.cm-art', art.kite()));

      refs.tiles = Array.from({ length: 40 }, (_, i) =>
        el('span.cm-tile', { style: `--c:${TILE_COLORS[i % TILE_COLORS.length]}` }, el('b', APPS[i % APPS.length]), el('i', '✓')),
      );
      refs.offboard = el('div.cm-laptop__done', '✓ 40 apps offboarded');
      const latte = layer(
        'latte',
        svg(ctx, 'div.cm-art', art.latte()),
        el(
          'div.cm-laptop',
          el('div.cm-laptop__head', el('span.cm-laptop__who', 'Offboarding: Dave (Marketing)'), el('span.cm-laptop__btn', 'Offboard')),
          el('div.cm-laptop__grid', refs.tiles),
          refs.offboard,
        ),
      );

      const cfoCopy = { ...FALLBACK.cfo, ...(c.cfo || {}) };
      const cfo = layer(
        'cfo',
        svg(ctx, 'div.cm-art', art.cfo()),
        el('div.cm-thumb', { 'aria-hidden': 'true' }, '👍'),
        el('div.cm-sparkle', { 'aria-hidden': 'true' }, el('i', '✨'), el('i', '✨'), el('i', '✨')),
        el('div.cm-plate', `${cfoCopy.name} · ${cfoCopy.title}`),
      );

      const legal = pick('legal');
      const fine = layer(
        'fine',
        svg(ctx, 'div.cm-art', art.fine()),
        el('div.cm-legal', { 'aria-hidden': 'true' }, el('div.cm-legal__roll', [0, 1].map(() => el('p', [...(S.finePrint || []), ...legal].map(T).join(' '))))),
      );

      const end = layer(
        'end',
        svg(ctx, 'div.cm-art', art.endcard()),
        label(),
        el(
          'div.cm-endcard',
          el('div.cm-endcard__kicker', T(endcard.kicker)),
          el('div.cm-endcard__name', drug, el('sup', '™')),
          c.phonetic && el('div.cm-endcard__phon', `(${c.phonetic})`),
          el('ul.cm-endcard__facts', [facts.free, facts.trial].filter(Boolean).map((f) => el('li', f))),
          el('div.cm-endcard__ing', T(endcard.ingredient), ' ', el('b', sponsor)),
          el('div.cm-endcard__ask', T(endcard.ask)),
          el('div.cm-endcard__legal', T(endcard.disclaimer)),
        ),
      );

      refs.super = el('div.cm-super', { 'aria-hidden': 'true' });
      refs.disclaimer = el('div.cm-disclaimer', { 'aria-hidden': 'true' });
      const bug = el('div.cm-bug', { 'aria-hidden': 'true' }, drug, el('sup', '™'));
      refs.stage = el('div', gloom, dx, reveal, five, beach, kite, latte, cfo, fine, end, el('div.cm-soft', { 'aria-hidden': 'true' }), refs.super, refs.disclaimer, bug);
      return refs.stage;
    }

    // ---------- beat effects ----------
    const sfx = ctx.sfx || {};
    function gloomIntro(api) {
      let n = unread - 9;
      refs.count.textContent = String(n);
      const step = () => {
        if (!api.alive() || n >= unread) return;
        n++;
        refs.count.textContent = String(n);
        refs.count.classList.remove('is-bump');
        void refs.count.offsetWidth;
        refs.count.classList.add('is-bump');
        api.later(step, 260 + (n % 3) * 90);
      };
      api.later(step, 300);
      api.later(() => sfx.noise?.(1.4, { gain: 0.12, freq: 160, q: 0.4 }), 200);
    }
    function showSymptoms(api) {
      const items = [...refs.symptoms.children];
      items.forEach((li) => li.classList.remove('is-on'));
      items.forEach((li, i) => api.later(() => li.classList.add('is-on'), 500 + i * 650));
    }
    function revealRun(api) {
      refs.wordmark.classList.remove('is-on');
      [523, 659, 784, 1047, 1319].forEach((f, i) => sfx.tone?.(f, 0.5, { type: 'sine', gain: 0.035, delay: i * 0.07 }));
      api.later(() => {
        refs.wordmark.classList.add('is-on');
        sfx.good?.();
      }, 1100);
    }
    function cornerRun({ sup, disclaimer, tiles } = {}) {
      return (api) => {
        if (tiles) tilesRun(api);
        if (sup) {
          refs.super.textContent = sup;
          refs.super.classList.add('is-on');
        }
        if (disclaimer) {
          refs.disclaimer.textContent = disclaimer;
          refs.disclaimer.classList.add('is-on');
        }
        return () => {
          refs.super.classList.remove('is-on');
          refs.disclaimer.classList.remove('is-on');
        };
      };
    }
    function tilesRun(api) {
      refs.tiles.forEach((t) => t.classList.remove('is-done'));
      refs.offboard.classList.remove('is-on');
      refs.tiles.forEach((t, i) => api.later(() => t.classList.add('is-done'), 700 + i * 55));
      api.later(() => {
        refs.offboard.classList.add('is-on');
        sfx.good?.();
      }, 700 + 40 * 55 + 150);
    }

    // ---------- script ----------
    function beats() {
      const q = S.questions || [];
      return [
        { scene: 'gloom', say: false, hold: 900, run: gloomIntro },
        ...q.map((line, i) => ({ scene: 'gloom', caption: T(line), hold: i === q.length - 1 ? 400 : 200 })),
        { scene: 'diagnosis', caption: T(S.diagnosis), hold: 800, run: showSymptoms },
        { scene: 'reveal', caption: `${T(S.hope)} ${T(S.reveal)}`.trim(), hold: 350, run: revealRun },
        { scene: 'reveal', caption: T(S.ask), hold: 400 },
        ...(S.montage || []).map((m) => ({
          scene: m.shot,
          caption: T(m.line),
          hold: 200,
          run: cornerRun({ sup: m.super && T(m.super), disclaimer: m.disclaimer && T(m.disclaimer), tiles: m.shot === 'latte' }),
        })),
        ...(S.finePrint || []).map((line, i, all) => ({
          scene: 'fine',
          caption: T(line),
          voice: 'fast',
          rate: 1.9,
          capStyle: 'fine',
          maxChars: 64,
          hold: i === all.length - 1 ? 450 : 60,
          run: cornerRun({ disclaimer: S.fineDisclaimer && T(S.fineDisclaimer) }),
        })),
        { scene: 'end', caption: [T(S.end), facts.free, facts.trial].filter(Boolean).join(' '), hold: 1600, run: () => sfx.good?.() },
      ];
    }

    function reset() {
      if (!refs.stage) return;
      switchLayers(refs.stage, 'gloom');
      refs.count.textContent = String(unread);
      refs.wordmark.classList.remove('is-on');
      refs.super.classList.remove('is-on');
      refs.disclaimer.classList.remove('is-on');
      refs.tiles.forEach((t) => t.classList.remove('is-done'));
      refs.offboard.classList.remove('is-on');
      [...refs.symptoms.children].forEach((li) => li.classList.remove('is-on'));
    }

    const shareText = T(c.share?.text || FALLBACK.share.text);
    const ctaCfg = { ...FALLBACK.cta, ...(c.cta || {}) };
    const about = c.about || {};

    const show = mountShow(root, ctx, opts, {
      prefix: 'cm',
      label: `${drug} commercial`,
      stage: buildStage,
      beats,
      reset,
      scene: (name) => switchLayers(refs.stage, name),
      pronounce: c.pronounce,
      voice: { voice: 'narrator', rate: 1 },
      poster: { title: drug, ...FALLBACK.poster, ...(c.poster || {}) },
      onComplete: ({ mode }) => {
        if (mode !== 'page') return;
        ctx.referral.grantChip('side-effects');
        ctx.referral.qualify('commercial');
      },
      endActions: () => [el('a.btn.btn--cure', { href: ctx.cta.url(ctaCfg.kind || 'primary', 'commercial-endcard'), target: '_blank', rel: 'noopener', onclick: () => ctx.track('cta_click', { kind: ctaCfg.kind, content: 'commercial-endcard' }) }, `Ask about ${sponsor}`)],
      below: () => [
        el('div.cm-about', el('span.kicker', T(about.kicker || 'Paid programming')), el('h2', T(about.title || drug)), el('p', T(about.text || ctx.meta.blurb))),
        ctx.share.panel({ text: shareText, params: { watch: 'commercial' }, kind: 'commercial', title: T(c.share?.title || FALLBACK.share.title) }),
        ctx.cta.card({
          kicker: T(ctaCfg.kicker),
          title: T(ctaCfg.title),
          body: (ctaCfg.facts || []).map((k) => facts[k]).filter(Boolean).join(' '),
          kind: ctaCfg.kind || 'primary',
          label: ctaCfg.label,
          content: 'commercial',
        }),
      ],
    });

    return () => show.destroy();
  },
};
