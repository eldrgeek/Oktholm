// "Hostage Video": a VHS proof-of-life tape. Kevin reads a statement written by his identity provider
// while his eyelids blink Y-E-S-H-I-D, then H-E-L-P, in Morse code. Page mode adds a decode replay.
import { mountShow, speedFromUrl } from '../commercial/showkit.js';
import { room, CONTRACT_ARM } from './art.js';
import { blinkSchedule, createBlinker, MORSE } from './morse.js';
import './style.css';

const FALLBACK = {
  victim: { name: 'Kevin', title: 'IT Administrator' },
  tape: { number: 'Tape 3 of 7', label: 'Proof of life', note: 'watch his eyes' },
  clock: { hour: 3, minute: 14 },
  banner: { lead: 'Proud partner of', redacted: '[REDACTED BY LEGAL]' },
  poster: { word: 'Partnership', line: 'Together, we renew.' },
  contract: { title: 'Renewal agreement', line: '+40% · auto-renews', sign: 'Sign here' },
  sdh: { tape: '[tape whirs]', hum: '[fluorescent light buzzing]', paper: '[holds up today’s paper]', stare: '[long stare into the camera]', stop: '[tape ends]' },
  statement: ['My name is Kevin.', 'I am being treated well.', 'My identity provider is very reasonable.', 'I do not need to be rescued.'],
  contractLine: -1,
  morse: null, // default: the sponsor's name, then HELP
  masthead: 'The Morning Gazette',
  headlines: ['Local Admin Insists Everything Is Fine'],
  hint: 'Watch his eyes.',
  about: { kicker: 'Recovered footage', title: 'The Hostage Video', text: 'Kevin says he is fine. Watch his eyes.' },
  decode: {
    button: 'Decode his blinks',
    kicker: 'Blink decoder',
    signal: 'Signal',
    message: 'Message',
    enhance: 'Enhance',
    chartTitle: 'Morse code',
    chartHint: 'Short blink = dot. Long blink = dash.',
    done: 'Message received.',
  },
  share: { title: 'Share the tape', text: 'Watch the hostage video. Then watch his eyes.' },
  cta: { kicker: 'Rescue plan', title: 'Kevin can’t ask for help. You can.', facts: ['pricing', 'free'], kind: 'primary' },
};

const pad = (n) => String(n).padStart(2, '0');

function headlineList(src) {
  if (!Array.isArray(src)) return null;
  const list = src.map((h) => (typeof h === 'string' ? h : h?.headline || h?.title || '')).filter((h) => typeof h === 'string' && h.trim());
  return list.length ? list : null;
}

export default {
  id: 'hostage',
  kind: 'show',
  title: 'Hostage Video',
  blurb: 'Recovered footage. Kevin wants you to know he is being treated well. Watch his eyes.',
  emoji: '📼',
  minutes: '1 min',
  therapy: 'Treats: Captor Loyalty',

  mount(root, ctx, opts = {}) {
    const { el } = ctx.dom;
    const raw = ctx.content || {};
    const c = { ...FALLBACK, ...raw };
    for (const k of ['victim', 'tape', 'clock', 'banner', 'poster', 'contract', 'sdh', 'about', 'decode', 'share', 'cta']) c[k] = { ...FALLBACK[k], ...(raw[k] || {}) };
    const facts = ctx.brand?.sponsor?.facts || {};
    const sfx = ctx.sfx || {};
    const d = ctx.dom.disposer();

    const sponsorWord = String(ctx.brand?.sponsor?.name || 'HELP').toUpperCase().replace(/[^A-Z]/g, '') || 'SOS';
    const words = (Array.isArray(c.morse) && c.morse.length ? c.morse : [sponsorWord, 'HELP']).map((w) => String(w).toUpperCase().replace(/[^A-Z]/g, '')).filter(Boolean);
    const schedule = blinkSchedule(words);
    const headlines = headlineList(ctx.brand?.content?.gazette) || headlineList(c.headlines) || FALLBACK.headlines;
    const todays = ctx.today?.gazette?.headline;
    const headline = (todays && headlines.includes(todays) && todays) || ctx.rng.dailyPick(headlines, 'proof-of-life') || headlines[0];
    const today = new Date();
    const dateLong = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const dateOsd = `${today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${pad(today.getDate())} ${today.getFullYear()}`;

    const refs = {};
    const speed = speedFromUrl();
    let decode = false; // the current run is a decode replay
    let pendingDecode = false; // set by the decode button, consumed by the next start
    let decoded = 0;
    let blinkDone = Promise.resolve();
    let tapeStart = 0;
    let mode = opts.mode === 'tv' ? 'tv' : 'page';

    // ---------- stage ----------
    function buildStage() {
      refs.lids = [];
      refs.time = el('span.hs-clock__time');
      refs.decodeSignal = el('div.hs-decode__signal');
      refs.decodeSlots = [];
      const slotRow = el(
        'div.hs-decode__msg',
        words.map((w, wi) => {
          const group = el('span.hs-decode__word', [...w].map((ch) => {
            const s = el('span.hs-decode__slot', { dataset: { ch } }, '_');
            refs.decodeSlots.push(s);
            return s;
          }));
          return wi ? [el('span.hs-decode__gap'), group] : group;
        }),
      );
      refs.decode = el(
        'div.hs-decode',
        { 'aria-hidden': 'true' },
        el('div.hs-decode__kicker', el('i'), c.decode.kicker),
        el('div.hs-decode__row', el('span.hs-decode__label', c.decode.signal), refs.decodeSignal),
        el('div.hs-decode__row', el('span.hs-decode__label', c.decode.message), slotRow),
      );
      refs.contract = el(
        'div.hs-contract',
        { 'aria-hidden': 'true' },
        el('div.hs-contract__paper', el('b', c.contract.title), el('span', c.contract.line), el('i', `✕ ${c.contract.sign} ________`)),
        el('div.hs-contract__arm', { html: CONTRACT_ARM }),
      );
      refs.cam = el(
        'div.hs-cam',
        el('div.hs-art', { html: room() }),
        el('div.hs-banner', el('span.hs-banner__lead', c.banner.lead), el('span.hs-banner__bar', c.banner.redacted)),
        el('div.hs-poster-text', el('b', c.poster.word), el('span', c.poster.line)),
        el('div.hs-tent', el('b', c.victim.name), el('span', c.victim.title)),
        el(
          'div.hs-paper',
          el('div.hs-paper__mast', c.masthead),
          el('div.hs-paper__date', dateLong),
          el('div.hs-paper__head', headline),
          el('div.hs-paper__cols', { 'aria-hidden': 'true' }, [0, 1, 2].map(() => el('i'))),
        ),
        el('div.hs-hand.hs-hand--l', { 'aria-hidden': 'true' }),
        el('div.hs-hand.hs-hand--r', { 'aria-hidden': 'true' }),
        refs.contract,
      );
      refs.stage = el(
        'div',
        refs.cam,
        el('div.hs-noise', { 'aria-hidden': 'true' }),
        el('div.hs-tracking', { 'aria-hidden': 'true' }),
        el(
          'div.hs-osd',
          { 'aria-hidden': 'true' },
          el('div.hs-rec', el('i'), 'REC'),
          el('div.hs-bat', el('span', 'SP'), el('b')),
          el('div.hs-clock', refs.time, el('span', dateOsd)),
          el('div.hs-enhance', `${c.decode.enhance} ×4`),
        ),
        refs.decode,
        el(
          'div.hs-blue',
          { 'aria-hidden': 'true' },
          el('div.hs-blue__play', 'PLAY ▶'),
          el('div.hs-label', el('span.hs-label__num', c.tape.number), el('b', c.tape.label), el('span.hs-label__note', c.tape.note)),
        ),
        el('div.hs-stop', { 'aria-hidden': 'true' }, el('div.hs-blue__play', 'STOP ■')),
        el('div.hs-static', { 'aria-hidden': 'true' }),
      );
      return refs.stage;
    }

    function setClosed(on) {
      if (!refs.lids.length) refs.lids = [...refs.stage.querySelectorAll('.hs-lid')];
      for (const l of refs.lids) l.classList.toggle('is-closed', on);
    }

    function tickClock() {
      if (!refs.time) return;
      const secs = tapeStart ? Math.floor(((performance.now() - tapeStart) * speed) / 1000) : 0;
      const total = c.clock.hour * 3600 + c.clock.minute * 60 + secs;
      const h = Math.floor(total / 3600) % 24;
      refs.time.textContent = `${pad(((h + 11) % 12) + 1)}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)} ${h < 12 ? 'AM' : 'PM'}`;
    }

    function staticBurst(ms = 450) {
      refs.stage.classList.remove('is-static');
      void refs.stage.offsetWidth;
      refs.stage.classList.add('is-static');
      sfx.noise?.(ms / 1000, { gain: 0.07, freq: 3200, q: 0.4 });
    }

    function resetDecode() {
      decoded = 0;
      refs.decodeSignal.replaceChildren();
      refs.decodeSlots.forEach((s) => {
        s.textContent = '_';
        s.classList.remove('is-done');
      });
      chart?.cells.forEach((cell) => cell.classList.remove('is-now', 'is-done'));
    }

    function onSymbol(e) {
      if (!decode) return;
      if (e.symbol === 0) refs.decodeSignal.replaceChildren();
      refs.decodeSignal.append(el(`span.hs-sym.hs-sym--${e.sym === '.' ? 'dot' : 'dash'}`, e.sym === '.' ? '•' : '—'));
      chart?.cells.forEach((cell) => cell.classList.toggle('is-now', cell.dataset.ch === e.ch));
    }

    function onLetter(l) {
      if (!decode) return;
      const slot = refs.decodeSlots[l.letter];
      if (slot) {
        slot.textContent = l.ch;
        slot.classList.add('is-done');
      }
      chart?.cells.forEach((cell) => {
        if (cell.dataset.ch === l.ch) cell.classList.add('is-done');
        cell.classList.remove('is-now');
      });
      decoded++;
      sfx.beep?.();
    }

    function startBlinks(api) {
      resetDecode();
      let resolveDone;
      blinkDone = new Promise((r) => (resolveDone = r));
      const b = createBlinker({
        setClosed,
        speed: api.speed,
        onSymbol,
        onLetter,
        onDone: () => {
          if (decode && decoded >= schedule.letters.length) finishDecode();
          resolveDone();
        },
      });
      const t = api.later(() => b.start(schedule), 650);
      api.onStop(() => {
        b.stop();
        if (t) clearTimeout(t.id);
        resolveDone();
      });
    }

    function finishDecode() {
      refs.decode.classList.add('is-complete');
      if (mode === 'page') {
        ctx.referral.grantChip('morse');
        ctx.track('hostage_decoded', {});
        if (chartDone) chartDone.textContent = c.decode.done;
      }
    }

    // ---------- script ----------
    function beats() {
      const S = Array.isArray(c.statement) && c.statement.length ? c.statement : FALLBACK.statement;
      const talk = { voice: 'victim', rate: 0.88, pitch: 0.95 };
      const last = S.length - 1;
      return [
        {
          scene: 'blue',
          caption: c.sdh.tape,
          say: false,
          capStyle: 'sdh',
          hold: 2300,
          run: () => sfx.noise?.(0.5, { gain: 0.05, freq: 5000, q: 0.3 }),
        },
        {
          scene: 'room',
          caption: c.sdh.hum,
          say: false,
          capStyle: 'sdh',
          hold: 1500,
          run: () => {
            staticBurst();
            tapeStart = performance.now();
            tickClock();
          },
        },
        {
          caption: c.sdh.paper,
          say: false,
          capStyle: 'sdh',
          hold: 3200,
          run: () => {
            refs.cam.classList.add('is-paper');
            return () => refs.cam.classList.remove('is-paper');
          },
        },
        ...S.map((line, i) => ({
          ...talk,
          caption: line,
          hold: 450,
          mark: i === 0,
          run: (api) => {
            refs.stage.classList.add('is-talking');
            if (i === 0) {
              if (decode) {
                refs.cam.classList.add('is-enhance');
                refs.stage.classList.add('is-decoding');
                api.onStop(() => {
                  refs.cam.classList.remove('is-enhance');
                  refs.stage.classList.remove('is-decoding');
                });
              }
              startBlinks(api);
            }
            if (i === c.contractLine) {
              refs.contract.classList.add('is-on');
              sfx.noise?.(0.4, { gain: 0.04, freq: 900, q: 0.5 });
            }
            return () => {
              refs.stage.classList.remove('is-talking');
              if (i === c.contractLine) refs.contract.classList.remove('is-on');
            };
          },
          await: i === last ? () => blinkDone : undefined,
        })),
        { caption: c.sdh.stare, say: false, capStyle: 'sdh', hold: 1400, mark: false },
        {
          scene: 'stop',
          caption: c.sdh.stop,
          say: false,
          capStyle: 'sdh',
          hold: 1300,
          mark: false,
          run: () => {
            staticBurst(700);
            refs.cam.classList.remove('is-enhance');
          },
        },
      ];
    }

    // Called by the kit before every run (and once at mount).
    function reset() {
      if (!refs.stage) return;
      decode = pendingDecode;
      pendingDecode = false;
      refs.stage.classList.toggle('is-decode-run', decode);
      refs.stage.dataset.scene = 'blue';
      refs.stage.classList.remove('is-talking', 'is-decoding', 'is-static');
      refs.cam.classList.remove('is-paper', 'is-enhance');
      refs.contract.classList.remove('is-on');
      refs.decode.classList.remove('is-complete');
      tapeStart = 0;
      setClosed(false);
      resetDecode();
      tickClock();
    }

    // ---------- page extras: Morse chart ----------
    let chart = null;
    let chartDone = null;
    function buildChart() {
      const msg = new Set(words.join(''));
      const cells = Object.entries(MORSE).map(([ch, code]) =>
        el(`div.hs-chart__cell${msg.has(ch) ? '.is-msg' : ''}`, { dataset: { ch } }, el('b', ch), el('span', [...code].map((s) => (s === '.' ? '•' : '—')).join(' '))),
      );
      chartDone = el('p.hs-chart__done', { 'aria-live': 'polite' });
      const node = el('section.hs-chart', el('div.hs-chart__head', el('span.kicker', c.decode.chartTitle), el('span.dim', c.decode.chartHint)), el('div.hs-chart__grid', cells), chartDone);
      chart = { node, cells };
      return node;
    }

    function startDecode() {
      pendingDecode = true;
      show.start();
      ctx.track('hostage_decode_start', {});
    }

    const show = mountShow(root, ctx, opts, {
      prefix: 'hs',
      label: 'Hostage video',
      stage: buildStage,
      beats,
      reset,
      scene: (name) => (refs.stage.dataset.scene = name),
      pronounce: c.pronounce,
      voice: { voice: 'victim', rate: 0.88 },
      poster: { kicker: `${c.tape.number} · ${c.tape.label}`, title: ctx.meta?.title || 'Hostage Video', sub: c.posterSub || c.victim.name + ' says he is fine.', cta: 'Play tape · captions on' },
      controls: () => [el('button.btn.btn--sm.btn--amber.hs-bar__decode', { type: 'button', onclick: () => startDecode() }, `👁 ${c.decode.button}`)],
      endActions: () => (decode ? [] : [el('button.btn.btn--amber', { type: 'button', onclick: () => startDecode() }, `👁 ${c.decode.button}`)]),
      onComplete: ({ mode: m }) => {
        if (m === 'page') ctx.referral.qualify('hostage');
      },
      below: () => [
        el('div.hs-about', el('span.kicker', c.about.kicker), el('h2', c.about.title), el('p', c.about.text)),
        buildChart(),
        ctx.share.panel({ text: c.share.text, params: { watch: 'hostage' }, kind: 'hostage', title: c.share.title }),
        ctx.cta.card({
          kicker: c.cta.kicker,
          title: c.cta.title,
          body: (c.cta.facts || []).map((k) => facts[k]).filter(Boolean).join(' '),
          kind: c.cta.kind || 'primary',
          label: c.cta.label,
          content: 'hostage',
          secondary: c.cta.secondary,
        }),
      ],
    });
    mode = show.mode;

    d.interval(tickClock, 1000);
    return () => {
      d.run();
      show.destroy();
    };
  },
};
