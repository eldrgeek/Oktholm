// "Stage an Intervention": the referral engine.
//   create (default page mode): form + live preview -> share link carrying a base64url payload
//   view   (opts.payload):      strictly validated playback for the recipient -> Accept treatment / Stage one back
//   tv:                          a daily sample intervention for OKTV, no form
// Payload text is only ever rendered with textContent (see payload.js for validation).
import { mountShow } from '../commercial/showkit.js';
import { createRoom } from './room.js';
import { decodePayload, encodePayload, validateConfig, cleanName, isBlocked, SYMPTOMS_MAX, NAME_MAX } from './payload.js';
import './style.css';

const FALLBACK = {
  roles: ['Sysadmin', 'IT Manager', 'Security Engineer', 'The person who does IT because they sit closest to the router', 'Founder who is also IT'],
  roleShort: ['Sysadmin', 'IT Manager', 'Security Engineer', 'Sits closest to the router', 'Founder / also IT'],
  roleEmoji: ['🧑‍💻', '🧑‍💼', '🕵️', '🧑‍🔧', '🧑‍🚀'],
  roleIntros: ['{name} works in IT. {name} has not had a day off in a while.'],
  relationships: ['Coworker', 'Manager', 'Direct report', 'Spouse / partner', 'Fellow on-call sufferer', 'Concerned vendor-neutral friend'],
  relLabel: ['coworker', 'manager', 'direct report', 'partner', 'fellow on-call sufferer', 'vendor-neutral friend'],
  relationshipLines: ['{name}, we are worried about you.'],
  relInverse: [0, 2, 1, 3, 4, 5],
  tones: [
    { id: 'gentle', label: 'Gentle', hint: 'Soft lighting.' },
    { id: 'firm', label: 'Firm', hint: 'No excuses.' },
    { id: 'reality', label: 'Full reality TV', hint: 'Zooms, a bleep, a chair spin.' },
  ],
  symptoms: [
    { id: 'hold', label: 'On hold with vendor support', line: '{name}, you have been on hold with vendor support for months.', fact: 'pricing' },
    { id: 'groups', label: 'Too many groups', line: 'You have too many groups, {name}. We counted.', fact: 'rbac' },
    { id: 'offboard', label: 'Offboards by hand', line: 'You offboard people by hand, {name}. One app at a time.', fact: 'lifecycle' },
  ],
  cast: [
    { emoji: '👩🏽‍💼', label: 'A coworker', voice: 'narrator', pitch: 1.1 },
    { emoji: '🧔🏻', label: 'Another admin', voice: 'anchor', pitch: 0.92 },
    { emoji: '👵🏿', label: 'Your mom', voice: 'victim', pitch: 1.2 },
    { emoji: '🧑🏼‍💻', label: 'The intern', voice: 'fast', pitch: 1.05 },
  ],
  castFallbackLabel: 'A concerned coworker',
  host: { emoji: '🧑🏾‍⚕️', label: 'The interventionist', voice: 'narrator', pitch: 0.95 },
  senderEmoji: '🧑🏽',
  coldOpens: ['{name} thinks this is a regular meeting.'],
  hostLines: { gentle: '{name}, everyone here loves you.', firm: '{name}, sit down.', reality: '{name}. Sit down. This is an intervention.' },
  openers: { gentle: ['{name}, I love you.'], firm: ['{name}, I will be direct.'], reality: ['I am just going to say it.'] },
  bleepLines: ['{name}, that was {bleep}.'],
  reactions: ['[dramatic sting]'],
  finale: '{name}, we’ve arranged treatment.',
  cliffhanger: 'Will {name} accept treatment?',
  treatment: { title: 'Treatment plan', patient: 'Patient', prescribedBy: 'Prescribed by', everyone: 'everyone in this room', stamp: 'Approved' },
  names: ['Kevin', 'Priya', 'Marcus', 'Dana', 'Tomás', 'Aisha'],
  ui: {
    kicker: 'Family services',
    title: 'Stage an intervention',
    lede: 'Pick the symptoms. We write the letters. You send the link.',
    step1: 'Who needs help?',
    nameLabel: 'Their first name',
    namePlaceholder: 'e.g. Kevin',
    roleLabel: 'Their role',
    relLabel: 'You are their…',
    step2: 'Symptoms',
    step2Hint: 'Pick up to five.',
    pickForMe: 'Pick for me',
    step3: 'Tone',
    step4: 'Sign it',
    fromLabel: 'Your first name (optional)',
    fromPlaceholder: 'Leave blank to stay anonymous',
    fromHint: 'You read the last letter. Leave it blank to stay anonymous.',
    preview: 'Preview it',
    stage: 'Stage it & get the link',
    previewNote: 'Live preview. This is what {name} will see.',
    errName: 'Letters, spaces, hyphens, apostrophes and periods only (24 max).',
    errNameMissing: 'Who is this intervention for?',
    errSymptoms: 'Pick at least one symptom.',
    maxed: 'Five symptoms selected.',
    kindNote: 'Let’s keep it kind. We’ll call them “Friend.”',
    stagedKicker: 'Intervention staged',
    stagedTitle: 'Now send it to {name}.',
    stagedText: 'The link carries the whole intervention.',
    shareTitle: 'Send it to them',
    shareText: 'An intervention has been staged for {name}. Please watch it. We love you.',
    watchAs: 'Watch it as {name} will',
    edit: 'Edit the letters',
    viewKicker: 'Family services',
    viewTitle: 'Someone who cares about you staged an intervention.',
    viewText: 'It takes about a minute.',
    viewPoster: '{name}, please sit down.',
    accept: 'Accept treatment',
    stageBack: 'Stage one back',
    afterTitle: 'The first step is admitting you have a vendor.',
    afterText: '',
    damagedTitle: 'This intervention link is damaged. Probably SAML.',
    damagedText: 'You can still stage your own.',
    damagedCta: 'Stage an intervention',
    triage: 'Get diagnosed instead',
  },
  cta: { kicker: 'Actual treatment', title: 'Interventions work better with a plan.', facts: ['free', 'lifecycle'], kind: 'primary' },
};

const SEATS = ['cast0', 'cast1', 'cast2', 'cast3'];
let uid = 0;

export default {
  id: 'intervention',
  kind: 'show',
  title: 'Stage an Intervention',
  blurb: 'Someone you love is bonded to their identity provider. Write the letters. Send the link.',
  emoji: '💌',
  minutes: '2 min',
  therapy: 'Treats: Vendor Denial (in someone else)',

  mount(root, ctx, opts = {}) {
    const { el, fill } = ctx.dom;
    const raw = ctx.content || {};
    const C = { ...FALLBACK, ...raw, ui: { ...FALLBACK.ui, ...(raw.ui || {}) }, treatment: { ...FALLBACK.treatment, ...(raw.treatment || {}) } };
    const facts = ctx.brand?.sponsor?.facts || {};
    const symptomsById = new Map(C.symptoms.map((s) => [s.id, s]));
    const lists = { roles: C.roles.length, relationships: C.relationships.length, tones: C.tones.length, symptomIds: new Set(symptomsById.keys()) };
    const sfx = ctx.sfx || {};
    let current = null;

    root.classList.add('iv-root');

    // ---------- the script ----------
    function castFor(name) {
      const lower = String(name || '').toLocaleLowerCase();
      return SEATS.map((_, i) => {
        const c = C.cast[i % C.cast.length] || FALLBACK.cast[i];
        const first = String(c.label || '').split(/[ ,]/)[0].toLocaleLowerCase();
        return first && first === lower ? { ...c, label: C.castFallbackLabel } : c;
      });
    }

    const toneId = (cfg) => C.tones[cfg.t]?.id || 'gentle';
    const senderLabel = (cfg) => {
      const rel = C.relLabel?.[cfg.rel] || String(C.relationships[cfg.rel] || '').toLowerCase();
      return cfg.f ? `${cfg.f}, your ${rel}` : `Your ${rel}`;
    };

    function dressRoom(room, cfg) {
      room.reset();
      room.setTone(toneId(cfg));
      room.setCast({
        cast: castFor(cfg.n),
        host: C.host,
        sender: { emoji: C.senderEmoji, label: senderLabel(cfg) },
        targetEmoji: C.roleEmoji?.[cfg.r] || FALLBACK.roleEmoji[0],
        name: cfg.n,
      });
      room.away(toneId(cfg) === 'reality');
      room.scene('room');
    }

    function treatmentFacts(cfg) {
      const keys = [...new Set(cfg.s.map((id) => symptomsById.get(id)?.fact).filter(Boolean))];
      const list = keys.map((k) => facts[k]).filter(Boolean).slice(0, 2);
      if (facts.free) list.push(facts.free);
      return list;
    }

    function buildBeats(cfg, room) {
      const tone = toneId(cfg);
      const reality = tone === 'reality';
      const name = cfg.n;
      const vars = { name, from: cfg.f || '', role: C.roles[cfg.r], rel: C.relLabel?.[cfg.rel] || '' };
      const F = (s) => fill(String(s ?? ''), vars);
      const rng = ctx.rng.seeded(`iv:${name}:${cfg.s.join('.')}:${cfg.t}:${cfg.rel}:${cfg.r}`);
      const rate = reality ? 1.04 : tone === 'firm' ? 1 : 0.96;
      const cast = castFor(name);
      const host = C.host;
      const sting = () => {
        sfx.tone?.(196, 0.32, { type: 'sawtooth', gain: 0.045 });
        sfx.tone?.(185, 0.32, { type: 'sawtooth', gain: 0.045, delay: 0.34 });
        sfx.tone?.(147, 0.9, { type: 'sawtooth', gain: 0.05, delay: 0.68 });
      };
      const whoosh = () => sfx.noise?.(0.35, { gain: 0.18, freq: 900, q: 0.5 });
      const chime = () => sfx.tone?.(784, 0.6, { type: 'sine', gain: 0.03 });
      const beats = [];

      beats.push({
        scene: 'title',
        caption: F(rng.pick(C.coldOpens)),
        voice: 'narrator',
        rate,
        hold: 350,
        run: () => (reality ? sting() : chime()),
      });
      beats.push({
        scene: 'room',
        caption: F(C.roleIntros[cfg.r] || C.roleIntros[0]),
        voice: 'narrator',
        rate,
        hold: 250,
        run: () => {
          room.lower(true, name.toLocaleUpperCase(), C.roleShort?.[cfg.r] || C.roles[cfg.r]);
          if (!reality) room.push(true);
          return () => room.lower(false);
        },
      });
      beats.push({
        who: host.label,
        caption: F(C.hostLines[tone]),
        voice: host.voice,
        pitch: host.pitch,
        rate,
        hold: reality ? 800 : 300,
        run: (api) => {
          room.speak('host');
          if (tone === 'firm') sfx.stamp?.();
          if (reality) {
            api.later(() => {
              room.spin();
              whoosh();
              room.flash();
            }, 1300);
            api.later(() => room.zoom('target', 1.5, true), 2300);
            return () => room.unzoom();
          }
          return null;
        },
      });

      const n = cfg.s.length;
      const bleepAt = reality && C.bleepLines?.length ? Math.min(1, n - 1) : -1;
      cfg.s.forEach((id, i) => {
        const sym = symptomsById.get(id);
        if (!sym) return;
        const key = SEATS[i % SEATS.length];
        const sp = cast[i % cast.length];
        const base = { who: sp.label, voice: sp.voice, pitch: sp.pitch, rate };
        const useOpener = i === 0 || (n <= 3 && rng() < 0.5);
        const opener = useOpener ? F(rng.pick(C.openers[tone] || C.openers.gentle)) : '';
        beats.push({
          ...base,
          caption: [opener, F(sym.line)].filter(Boolean).join(' '),
          hold: 350,
          run: () => {
            room.speak(key);
            if (reality && i % 2 === 0) {
              room.zoom(key, 1.45, true);
              whoosh();
              return () => room.unzoom(true);
            }
            if (tone === 'gentle') chime();
            return null;
          },
        });
        if (i === bleepAt) {
          const [before, after = ''] = F(rng.pick(C.bleepLines)).split('{bleep}');
          const shown = `${before}████${after}`;
          beats.push({ ...base, caption: shown, say: before.trim() || false, hold: 0, run: () => room.speak(key) });
          beats.push({ ...base, caption: shown, say: false, keepCaption: true, hold: 560, mark: false, run: () => sfx.tone?.(1000, 0.5, { type: 'sine', gain: 0.12 }) });
          if (after.replace(/[\s.!?”"]/g, '')) beats.push({ ...base, caption: shown, say: after.trim(), hold: 250, mark: false });
        }
        if (reality && (i === 0 || i === 2)) {
          beats.push({
            caption: rng.pick(C.reactions),
            say: false,
            capStyle: 'sfx',
            hold: 1100,
            run: () => {
              room.zoom('target', 1.7, true);
              room.react(rng.pick(['😳', '😬', '🥲', '😧']));
              sting();
              return () => {
                room.unzoom(true);
                room.react('');
              };
            },
          });
        }
      });

      beats.push({
        who: senderLabel(cfg),
        caption: F(C.relationshipLines[cfg.rel] || C.relationshipLines[0]),
        voice: 'narrator',
        pitch: 1.08,
        rate,
        hold: 500,
        run: () => {
          room.speak('sender');
          room.stand('sender', true);
          if (reality) room.zoom('sender', 1.3, false);
          else chime();
          return () => {
            room.stand('sender', false);
            room.unzoom();
          };
        },
      });
      beats.push({
        who: host.label,
        caption: F(C.finale),
        voice: host.voice,
        pitch: host.pitch,
        rate,
        hold: 2400,
        run: () => {
          room.speak('host');
          room.rx(true, {
            title: C.treatment.title,
            patientLabel: C.treatment.patient,
            patient: name,
            facts: treatmentFacts(cfg),
            fromLabel: C.treatment.prescribedBy,
            from: cfg.f || C.treatment.everyone,
            stamp: C.treatment.stamp,
          });
          sfx.good?.();
        },
      });
      beats.push({
        scene: 'cliff',
        caption: F(C.cliffhanger),
        voice: 'narrator',
        rate,
        hold: 1500,
        run: () => {
          room.rx(false);
          room.clearSpeaker();
          room.cliff(true, F(C.cliffhanger));
          sting();
        },
      });
      return beats;
    }

    function player(host, cfgRef, spec = {}) {
      const room = createRoom(ctx);
      const show = mountShow(host, ctx, spec.mode ? { ...opts, mode: spec.mode } : { mode: 'page' }, {
        prefix: 'iv',
        label: 'Intervention',
        stage: () => room.stage,
        beats: () => buildBeats(cfgRef(), room),
        reset: () => dressRoom(room, cfgRef()),
        scene: (name) => room.scene(name),
        pronounce: C.pronounce,
        voice: { voice: 'narrator', rate: 1 },
        maxChars: 90,
        ...spec,
      });
      return { room, show };
    }

    // ---------- TV: today's sample intervention ----------
    function mountTv() {
      const rng = ctx.rng.daily('tv-sample');
      const ids = C.symptoms.map((s) => s.id);
      const res = validateConfig(
        {
          n: ctx.rng.dailyPick(C.names, 'tv-name') || 'Kevin',
          r: rng.int(0, C.roles.length - 1),
          rel: rng.int(0, C.relationships.length - 1),
          s: rng.sample(ids, Math.min(3, ids.length)),
          t: rng.pick([2, 2, 1, 0].filter((t) => t < C.tones.length)),
          f: '',
        },
        lists,
      );
      const cfg = res.ok ? res.value : { n: 'Kevin', r: 0, rel: 0, s: ids.slice(0, 3), t: 0, f: '' };
      const { show } = player(root, () => cfg, { mode: 'tv' });
      return () => show.destroy();
    }

    // ---------- VIEW: the recipient ----------
    function mountView(payload, { fromCreate = false } = {}) {
      const ui = C.ui;
      const res = decodePayload(payload, lists);
      const d = ctx.dom.disposer();
      if (!res.ok) {
        ctx.track('intervention_link_damaged', { reason: res.reason });
        root.append(
          el(
            'section.iv-damaged.card.card--raised',
            el('div.iv-damaged__tape', { 'aria-hidden': 'true' }, '📼'),
            el('h2', ui.damagedTitle),
            el('p.dim', ui.damagedText),
            el(
              'div.row',
              el('button.btn.btn--vital', { type: 'button', onclick: () => go('create') }, ui.damagedCta),
              el('button.btn.btn--ghost', { type: 'button', onclick: () => ctx.navigate('/triage') }, ui.triage),
            ),
          ),
        );
        return () => d.run();
      }
      const cfg = res.value;
      const name = cfg.n;
      const accept = () => {
        ctx.track('intervention_accept', {});
        ctx.navigate('/triage');
      };
      const stageBack = () =>
        go('create', { prefill: { n: cfg.f || '', f: cleanName(name) && name !== 'Friend' ? name : '', rel: C.relInverse?.[cfg.rel] ?? cfg.rel, t: cfg.t, s: [] } });
      const after = el(
        'div.iv-after.card',
        { hidden: true },
        el('span.kicker', C.treatment.title),
        el('h3', ui.afterTitle),
        ui.afterText && el('p.dim', ui.afterText),
        el('div.row', el('button.btn.btn--cure.btn--lg', { type: 'button', onclick: accept }, ui.accept), el('button.btn.btn--ghost.btn--lg', { type: 'button', onclick: stageBack }, ui.stageBack)),
      );
      const playerHost = el('div.iv-view__player');
      const head = el(
        'header.iv-view__head',
        fromCreate
          ? el('div.iv-previewbar', el('span', `Preview: this is exactly what ${name} will see.`), el('button.btn.btn--sm.btn--ghost', { type: 'button', onclick: () => go('create') }, C.ui.edit))
          : null,
        el('span.kicker', ui.viewKicker),
        el('h1.iv-view__title', ui.viewTitle),
        el('p.dim', ui.viewText),
      );
      const cta = ctx.cta.card({
        kicker: C.cta.kicker,
        title: C.cta.title,
        body: (C.cta.facts || []).map((k) => facts[k]).filter(Boolean).join(' '),
        kind: C.cta.kind || 'primary',
        content: 'intervention-view',
      });
      cta.hidden = true;
      root.append(el('section.iv-view', head, playerHost, after, cta));
      const { show } = player(playerHost, () => cfg, {
        poster: { kicker: ui.viewKicker, title: fill(ui.viewPoster, { name }), sub: ui.viewTitle, cta: 'Play · about a minute · captions on' },
        endActions: () => [
          el('button.btn.btn--cure', { type: 'button', onclick: accept }, ui.accept),
          el('button.btn.btn--ghost.iv-end-ghost', { type: 'button', onclick: stageBack }, ui.stageBack),
        ],
        onComplete: ({ mode }) => {
          if (mode !== 'page') return;
          after.hidden = false;
          cta.hidden = false;
          if (!fromCreate) ctx.referral.qualify('intervention-viewed');
          ctx.track('intervention_viewed', { fromCreate });
        },
      });
      return () => {
        show.destroy();
        d.run();
      };
    }

    // ---------- CREATE: the form ----------
    function mountCreate({ prefill } = {}) {
      const ui = C.ui;
      const d = ctx.dom.disposer();
      const id = `iv${++uid}`;
      const saved = prefill ? null : ctx.store.get('draft', null);
      const state = { n: '', r: 0, rel: 0, s: [], t: 2, f: '', ...(saved && typeof saved === 'object' ? saved : {}), ...(prefill || {}) };
      // Draft comes from localStorage: re-check everything before trusting it.
      state.n = typeof state.n === 'string' ? state.n.slice(0, NAME_MAX) : '';
      state.f = typeof state.f === 'string' ? state.f.slice(0, NAME_MAX) : '';
      state.r = Number.isInteger(state.r) && state.r >= 0 && state.r < C.roles.length ? state.r : 0;
      state.rel = Number.isInteger(state.rel) && state.rel >= 0 && state.rel < C.relationships.length ? state.rel : 0;
      state.t = Number.isInteger(state.t) && state.t >= 0 && state.t < C.tones.length ? state.t : Math.min(2, C.tones.length - 1);
      state.s = Array.isArray(state.s) ? state.s.filter((x) => symptomsById.has(x)).slice(0, SYMPTOMS_MAX) : [];

      const field = (label, input, extra) => el('label.field', el('span', label), input, extra);
      const nameInput = el('input.input', { id: `${id}-name`, type: 'text', maxLength: NAME_MAX, autocomplete: 'off', spellcheck: 'false', placeholder: ui.namePlaceholder, required: true });
      nameInput.value = state.n;
      const roleSel = el('select.select', C.roles.map((r, i) => el('option', { value: String(i) }, r)));
      roleSel.value = String(state.r);
      const relSel = el('select.select', C.relationships.map((r, i) => el('option', { value: String(i) }, r)));
      relSel.value = String(state.rel);
      const fromInput = el('input.input', { type: 'text', maxLength: NAME_MAX, autocomplete: 'off', spellcheck: 'false', placeholder: ui.fromPlaceholder });
      fromInput.value = state.f;
      const nameMsg = el('small.iv-msg', { 'aria-live': 'polite' });
      const fromMsg = el('small.iv-msg', { 'aria-live': 'polite' });

      const counter = el('span.pill-count');
      const maxedMsg = el('small.iv-msg', { 'aria-live': 'polite' });
      const boxes = C.symptoms.map((s) => {
        const input = el('input', { type: 'checkbox', value: s.id, checked: state.s.includes(s.id) });
        const label = el('label.check.iv-sym', input, el('span', s.label));
        return { s, input, label };
      });
      const tones = C.tones.map((t, i) => {
        const input = el('input', { type: 'radio', name: `${id}-tone`, value: String(i), checked: state.t === i });
        return { input, label: el('label.iv-tone', input, el('b', t.label), el('small', t.hint)) };
      });
      const error = el('p.iv-error', { role: 'alert' });

      const previewBtn = el('button.btn.btn--ghost', { type: 'button' }, `▶ ${ui.preview}`);
      const stageBtn = el('button.btn.btn--vital.btn--lg', { type: 'submit' }, `💌 ${ui.stage}`);
      const form = el(
        'form.iv-form.card.card--raised',
        { novalidate: true },
        el('fieldset.iv-fs', el('legend', el('b', '1'), ui.step1), field(ui.nameLabel + ' *', nameInput, nameMsg), el('div.iv-two', field(ui.roleLabel, roleSel), field(ui.relLabel, relSel))),
        el(
          'fieldset.iv-fs',
          el('legend', el('b', '2'), ui.step2, ' ', counter),
          el('div.iv-fs__hint', el('span.dim', ui.step2Hint), el('button.btn.btn--sm.btn--ghost', { type: 'button', onclick: pickForMe }, `🎲 ${ui.pickForMe}`)),
          el('div.iv-syms', boxes.map((b) => b.label)),
          maxedMsg,
        ),
        el('fieldset.iv-fs', el('legend', el('b', '3'), ui.step3), el('div.iv-tones', { role: 'radiogroup' }, tones.map((t) => t.label))),
        el('fieldset.iv-fs', el('legend', el('b', '4'), ui.step4), field(ui.fromLabel, fromInput, el('small.iv-hint', ui.fromHint)), fromMsg),
        error,
        el('div.iv-actions', previewBtn, stageBtn),
      );

      const shareBox = el('section.iv-staged.card.card--raised', { hidden: true });
      const previewHost = el('div.iv-preview__player');
      const previewNote = el('p.iv-preview__note');
      const preview = el('aside.iv-preview', previewHost, previewNote);
      const cta = ctx.cta.card({
        kicker: C.cta.kicker,
        title: C.cta.title,
        body: (C.cta.facts || []).map((k) => facts[k]).filter(Boolean).join(' '),
        kind: C.cta.kind || 'primary',
        content: 'intervention-create',
      });
      const page = el(
        'section.iv-create',
        el('header.iv-hero', el('span.kicker', ui.kicker), el('h1.iv-hero__title', ui.title), el('p.iv-hero__lede', ui.lede)),
        el('div.iv-layout', el('div.iv-main', form, shareBox), preview),
        cta,
      );
      root.append(page);

      // Preview uses a best-effort config so it can play while the form is still being filled in.
      function previewConfig() {
        const clean = cleanName(state.n);
        const n = clean && !isBlocked(clean) ? clean : 'Friend';
        const f = cleanName(state.f);
        return { n, r: state.r, rel: state.rel, s: state.s.length ? state.s : C.symptoms.slice(0, 3).map((s) => s.id), t: state.t, f: f && !isBlocked(f) ? f : '' };
      }
      const { room, show } = player(previewHost, previewConfig, {
        poster: { kicker: 'Live preview', title: 'We love you, Friend', cta: 'Play preview · captions on' },
      });

      function refresh() {
        const cfg = previewConfig();
        counter.textContent = `${state.s.length}/${SYMPTOMS_MAX}`;
        const full = state.s.length >= SYMPTOMS_MAX;
        for (const b of boxes) {
          const on = b.input.checked;
          b.label.classList.toggle('is-on', on);
          b.input.disabled = full && !on;
          b.label.classList.toggle('is-disabled', full && !on);
        }
        maxedMsg.textContent = full ? ui.maxed : '';
        for (const t of tones) t.label.classList.toggle('is-on', t.input.checked);
        const clean = cleanName(state.n);
        nameMsg.textContent = state.n.trim() && !clean ? ui.errName : clean && isBlocked(clean) ? ui.kindNote : '';
        const fclean = cleanName(state.f);
        fromMsg.textContent = state.f.trim() && !fclean ? ui.errName : fclean && isBlocked(fclean) ? ui.kindNote : '';
        previewNote.textContent = fill(ui.previewNote, { name: cfg.n });
        if (show.state === 'idle' || show.state === 'ended') {
          dressRoom(room, cfg);
          show.setPoster({ kicker: 'Live preview', title: `We love you, ${cfg.n}`, cta: 'Play preview · captions on' });
        }
        ctx.store.set('draft', { n: state.n, r: state.r, rel: state.rel, s: state.s, t: state.t, f: state.f });
      }

      function readForm() {
        state.n = nameInput.value;
        state.f = fromInput.value;
        state.r = Number(roleSel.value) || 0;
        state.rel = Number(relSel.value) || 0;
        state.s = boxes.filter((b) => b.input.checked).map((b) => b.s.id).slice(0, SYMPTOMS_MAX);
        state.t = Number(tones.find((t) => t.input.checked)?.input.value ?? state.t);
        error.textContent = '';
        refresh();
      }

      function pickForMe() {
        const pick = ctx.rng.random.sample(C.symptoms, 3).map((s) => s.id);
        for (const b of boxes) b.input.checked = pick.includes(b.s.id);
        readForm();
        sfx.click?.();
      }

      function validate() {
        const res = validateConfig({ n: state.n, r: state.r, rel: state.rel, s: state.s, t: state.t, f: cleanName(state.f) || '' }, lists);
        if (res.ok) return res.value;
        if (!state.n.trim()) error.textContent = ui.errNameMissing;
        else if (!cleanName(state.n)) error.textContent = ui.errName;
        else if (!state.s.length) error.textContent = ui.errSymptoms;
        else error.textContent = ui.errName;
        if (!cleanName(state.n)) nameInput.focus();
        return null;
      }

      function showShare(cfg) {
        const payload = encodePayload(cfg);
        const name = cfg.n;
        ctx.referral.grantChip('interventionist');
        ctx.referral.qualify('intervention');
        ctx.track('intervention_staged', { symptoms: cfg.s.length, tone: toneId(cfg), role: cfg.r, rel: cfg.rel });
        shareBox.replaceChildren(
          el('span.kicker', `✓ ${ui.stagedKicker}`),
          el('h2.iv-staged__title', fill(ui.stagedTitle, { name })),
          el('p.dim', fill(ui.stagedText, { name })),
          ctx.share.panel({ text: fill(ui.shareText, { name }), params: { i: payload }, kind: 'intervention', title: ui.shareTitle }),
          el(
            'div.iv-actions',
            el('button.btn.btn--vital', { type: 'button', onclick: () => go('view', payload, { fromCreate: true }) }, `▶ ${fill(ui.watchAs, { name })}`),
            el(
              'button.btn.btn--ghost',
              {
                type: 'button',
                onclick: () => {
                  shareBox.hidden = true;
                  form.hidden = false;
                  form.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
                },
              },
              `✎ ${ui.edit}`,
            ),
          ),
        );
        shareBox.dataset.payload = payload;
        form.hidden = true;
        shareBox.hidden = false;
        shareBox.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      }

      d.on(form, 'input', readForm);
      d.on(form, 'change', readForm);
      d.on(form, 'submit', (e) => {
        e.preventDefault();
        readForm();
        const cfg = validate();
        if (cfg) showShare(cfg);
      });
      d.on(previewBtn, 'click', () => {
        readForm();
        preview.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        show.start();
      });
      refresh();
      return () => {
        show.destroy();
        d.run();
      };
    }

    function go(mode, arg, { init = false, fromCreate = false } = {}) {
      try {
        current?.();
      } catch (e) {
        console.error(e);
      }
      current = null;
      root.replaceChildren();
      if (mode === 'tv') current = mountTv();
      else if (mode === 'view') current = mountView(arg, { fromCreate });
      else current = mountCreate(arg || {});
      if (!init && mode !== 'tv') root.scrollIntoView?.({ block: 'start' });
    }

    if (opts.mode === 'tv') go('tv', null, { init: true });
    else if (opts.mode === 'view' || (opts.payload && opts.mode !== 'create')) go('view', opts.payload || '', { init: true });
    else go('create', {}, { init: true });

    return () => {
      try {
        current?.();
      } finally {
        current = null;
        root.classList.remove('iv-root');
      }
    };
  },
};
