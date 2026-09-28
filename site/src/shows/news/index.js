// "Oktholm Nightly News": anchor desk, lower thirds, a BREAKING banner, a mini ticker, today's top three
// headlines (brand gazette, picked with the daily RNG) with cutaway graphics, then Outbreak Weather.
import { mountShow, switchLayers } from '../commercial/showkit.js';
import { desk, weather, chart, field, REGION_AT } from './art.js';
import './style.css';

const FALLBACK = {
  network: 'OKTV',
  showName: 'Nightly News',
  slogan: 'Recovery is possible.',
  anchor: { name: 'The Anchor', title: 'Anchor' },
  weather: { name: 'The Meteorologist', title: 'Meteorologist', segment: 'Outbreak Weather' },
  clock: '11:00 PM',
  intro: 'Good evening, and welcome to the nightly news.',
  leadIns: ['Our top story tonight.', 'Also tonight.', 'And finally.'],
  toss: 'Now, the weather.',
  weatherHello: 'Thanks.',
  forecastCount: 2,
  signoff: 'Good night, and good luck with your tickets.',
  forecast: [
    { text: 'Ninety percent chance of SAML errors.', region: 'hq', icon: '⛈️', badge: '90%' },
    { text: 'Scattered groups moving in from the west.', region: 'engineering', icon: '🌧️', badge: 'AD' },
  ],
  regions: { engineering: 'Engineering', helpdesk: 'Help Desk', finance: 'Finance', marketing: 'Marketing', sales: 'Sales', hq: 'HQ', remote: 'Remote', closet: 'Server Closet' },
  breaking: 'Breaking news',
  chart: { y: 'Concern', x: 'This week' },
  fieldLive: 'Live',
  fieldLocations: ['Outside the server closet'],
  headlines: [{ headline: 'Local Admin Has Too Many Groups', report: 'Sources say the groups have groups.' }],
  genericReports: ['Sources close to the ticket queue say the situation is developing.'],
  topics: [],
  defaultTopic: { icon: '📰', tag: 'Developing', slug: 'Developing story' },
  ticker: [],
  about: { kicker: 'Tonight', title: 'Nightly News', text: 'Today’s top stories, plus the weather.' },
  share: { title: 'Share tonight’s broadcast', text: 'Tonight on the nightly news: {headline}' },
  cta: { kicker: 'Sponsored forecast', title: 'Tomorrow’s forecast can change.', facts: ['rae', 'free'], kind: 'primary' },
};

function normalize(list, reportKey) {
  if (!Array.isArray(list)) return null;
  const out = list
    .map((h) => (typeof h === 'string' ? { headline: h, report: '' } : { headline: h?.headline || h?.title || '', report: h?.[reportKey] || h?.report || h?.dek || '' }))
    .filter((h) => typeof h.headline === 'string' && h.headline.trim());
  return out.length ? out : null;
}

export default {
  id: 'news',
  kind: 'show',
  title: 'Nightly News',
  blurb: 'Tonight’s top stories from the front lines of identity, plus the weather. New headlines every day.',
  emoji: '📺',
  minutes: '1 min',
  therapy: 'Treats: Doomscrolling the Status Page',

  mount(root, ctx, opts = {}) {
    const { el, fill } = ctx.dom;
    const raw = ctx.content || {};
    const c = { ...FALLBACK, ...raw };
    for (const k of ['anchor', 'weather', 'chart', 'about', 'share', 'cta', 'regions', 'defaultTopic']) c[k] = { ...FALLBACK[k], ...(raw[k] || {}) };
    const facts = ctx.brand?.sponsor?.facts || {};
    const sfx = ctx.sfx || {};

    // ---------- tonight's rundown (same for everyone today) ----------
    const pool = normalize(ctx.brand?.content?.gazette, 'dek') || normalize(c.headlines, 'report') || FALLBACK.headlines;
    const todays = ctx.today?.gazette?.headline;
    const lead = (todays && pool.find((p) => p.headline === todays)) || ctx.rng.dailyPick(pool, 'lead') || pool[0];
    const rest = ctx.rng.daily('rest').shuffle(pool.filter((p) => p !== lead));
    const snappy = rest.filter((p) => p.headline.length <= 92 && (p.report || '').length <= 120);
    const topicDefs = (Array.isArray(c.topics) ? c.topics : [])
      .map((t) => {
        try {
          return { ...t, re: new RegExp(t.match, 'i') };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const rng = ctx.rng.daily('reports');
    const stories = [lead, ...(snappy.length >= 2 ? snappy : rest).slice(0, 2)].filter(Boolean).map((p) => {
      const topic = topicDefs.find((t) => t.re.test(p.headline)) || c.defaultTopic;
      return { headline: p.headline, report: p.report || rng.pick(c.genericReports), topic };
    });
    const forecast = ctx.rng.daily('forecast').sample(c.forecast.length ? c.forecast : FALLBACK.forecast, Math.max(1, Math.min(3, c.forecastCount || 2)));
    const location = ctx.rng.daily('field').pick(c.fieldLocations) || '';
    const tickerItems = ctx.rng.daily('ticker').shuffle([...rest.slice(2, 8).map((p) => p.headline), ...(c.ticker || [])]);
    const today = new Date();
    const dateLine = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // ---------- stage ----------
    const refs = {};
    const scene = (name, ...kids) => el(`div.nw-scene.nw-scene--${name}`, { dataset: { layer: name } }, ...kids);

    function buildStage() {
      refs.otsIcon = el('span.nw-ots__icon');
      refs.otsTag = el('span.nw-ots__tag');
      refs.otsSlug = el('span.nw-ots__slug');
      refs.ots = el('div.nw-ots', el('div.nw-ots__art', refs.otsIcon), el('div.nw-ots__bar', refs.otsTag, refs.otsSlug));
      refs.cam = el('div.nw-cam', el('div.nw-art', { html: desk() }), el('div.nw-desklogo', el('b', c.network), el('span', c.showName)), refs.ots);

      refs.cutIcon0 = el('span.nw-cut__icon');
      refs.cutTag0 = el('span.nw-cut__tag');
      refs.cutIcon1 = el('span.nw-cut__icon.nw-cut__icon--small');
      refs.cutTag1 = el('span.nw-cut__tag');
      refs.cutTag2 = el('span.nw-cut__tag');
      const logo = (cls) => el(`div.nw-logo${cls}`, el('span.nw-logo__net', c.network), el('b.nw-logo__name', c.showName), el('span.nw-logo__bar'), el('span.nw-logo__date', dateLine));

      refs.wx = forecast.map((f) => {
        const at = REGION_AT[f.region] || REGION_AT.all;
        return el('div.nw-wx', { style: `left:${at[0]}%;top:${at[1]}%` }, el('i.nw-wx__ring'), el('span.nw-wx__icon', f.icon || '⛅'), f.badge ? el('b.nw-wx__badge', f.badge) : null);
      });
      const regionLabels = Object.entries(c.regions)
        .filter(([k]) => REGION_AT[k])
        .map(([k, label]) => el('span.nw-region', { style: `left:${REGION_AT[k][0]}%;top:${REGION_AT[k][1] + 5.2}%` }, label));

      refs.l3Tag = el('span.nw-l3__tag');
      refs.l3Main = el('span.nw-l3__main');
      refs.l3Sub = el('span.nw-l3__sub');
      refs.l3 = el('div.nw-l3', el('div.nw-l3__top', refs.l3Tag, refs.l3Main), refs.l3Sub);
      refs.ticker = el(
        'div.nw-ticker',
        el('span.nw-ticker__live', el('i'), 'Live'),
        el('div.nw-ticker__view', el('div.nw-ticker__track', [0, 1].map((n) => el('div.nw-ticker__run', n ? { 'aria-hidden': 'true' } : {}, tickerItems.map((t) => el('span', t)))))),
        el('span.nw-ticker__bug', c.network),
        el('span.nw-ticker__clock', c.clock),
      );

      refs.stage = el(
        'div',
        scene('title', el('div.nw-rays'), logo('')),
        scene('desk', refs.cam),
        scene('cut0', el('div.nw-rays.nw-rays--red'), el('div.nw-cut0', refs.cutIcon0, el('div.nw-cut__slab', c.breaking), refs.cutTag0)),
        scene(
          'cut1',
          el('div.nw-cut1', el('div.nw-cut1__head', refs.cutIcon1, refs.cutTag1), el('div.nw-cut1__plot', { html: chart() }, el('span.nw-cut1__y', c.chart.y), el('span.nw-cut1__x', c.chart.x))),
        ),
        scene(
          'cut2',
          el('div.nw-art', { html: field() }),
          el('div.nw-reporter', { 'aria-hidden': 'true' }, el('span', '🧑🏽‍💼'), el('i', '🎤')),
          el('div.nw-fieldtag', el('b', c.fieldLive), el('span', location), refs.cutTag2),
        ),
        scene('weather', el('div.nw-art', { html: weather() }), regionLabels, refs.wx),
        scene('end', el('div.nw-rays'), logo('.nw-logo--end'), el('div.nw-end__slogan', c.slogan)),
        el('div.nw-breaking', { 'aria-hidden': 'true' }, el('b', c.breaking)),
        refs.l3,
        refs.ticker,
      );
      requestAnimationFrame(() => {
        const run = refs.ticker.querySelector('.nw-ticker__run');
        const track = refs.ticker.querySelector('.nw-ticker__track');
        if (run && track) track.style.animationDuration = `${Math.max(18, run.scrollWidth / 60)}s`;
      });
      return refs.stage;
    }

    function l3(on, { tag = '', main = '', sub = '', tone = '' } = {}) {
      if (on) {
        refs.l3Tag.textContent = tag;
        refs.l3Main.textContent = main;
        refs.l3Sub.textContent = sub;
        refs.l3.dataset.tone = tone;
        refs.l3.classList.remove('is-on');
        void refs.l3.offsetWidth;
      }
      refs.l3.classList.toggle('is-on', Boolean(on));
    }
    const talking = (who, on) => refs.stage.classList.toggle(`is-${who}-talking`, on);
    const sting = () => [523, 659, 784, 1047].forEach((f, i) => sfx.tone?.(f, 0.22, { type: 'triangle', gain: 0.05, delay: i * 0.09 }));
    const whoosh = () => sfx.noise?.(0.3, { gain: 0.12, freq: 1400, q: 0.6 });

    // ---------- the rundown as beats ----------
    function beats() {
      const anchor = { who: c.anchor.name, voice: 'anchor', rate: 1.06 };
      const misty = { who: c.weather.name, voice: 'narrator', rate: 1.04, pitch: 1.1 };
      const tags = ['Breaking', 'Developing', 'Also tonight'];
      const list = [
        { scene: 'title', caption: '[news theme plays]', say: false, capStyle: 'sdh', hold: 1900, run: () => sting() },
        {
          ...anchor,
          scene: 'desk',
          caption: c.intro,
          hold: 250,
          run: () => {
            l3(true, { tag: c.network, main: c.anchor.name.toUpperCase(), sub: `${c.anchor.title} · ${c.showName}`, tone: 'name' });
            talking('anchor', true);
            return () => talking('anchor', false);
          },
        },
      ];
      stories.forEach((st, i) => {
        list.push({
          ...anchor,
          scene: 'desk',
          caption: `${(c.leadIns || [])[i] || ''} ${st.headline}`.trim(),
          hold: 250,
          run: () => {
            refs.otsIcon.textContent = st.topic.icon;
            refs.otsTag.textContent = st.topic.tag;
            refs.otsSlug.textContent = st.topic.slug;
            refs.ots.classList.remove('is-on');
            void refs.ots.offsetWidth;
            refs.ots.classList.add('is-on');
            refs.cam.classList.add('is-push');
            l3(true, { tag: tags[i] || 'News', main: st.headline, sub: `${c.showName} · ${st.topic.slug}`, tone: i === 0 ? 'breaking' : '' });
            if (i === 0) {
              refs.stage.classList.remove('is-breaking');
              void refs.stage.offsetWidth;
              refs.stage.classList.add('is-breaking');
              sfx.alarm?.();
            } else whoosh();
            talking('anchor', true);
            return () => {
              talking('anchor', false);
              refs.cam.classList.remove('is-push');
            };
          },
        });
        list.push({
          ...anchor,
          scene: `cut${i % 3}`,
          caption: st.report,
          hold: 350,
          run: () => {
            refs.ots.classList.remove('is-on');
            if (i % 3 === 0) {
              refs.cutIcon0.textContent = st.topic.icon;
              refs.cutTag0.textContent = st.topic.slug;
            } else if (i % 3 === 1) {
              refs.cutIcon1.textContent = st.topic.icon;
              refs.cutTag1.textContent = st.topic.slug;
            } else refs.cutTag2.textContent = st.topic.slug;
            whoosh();
          },
        });
      });
      list.push({
        ...anchor,
        scene: 'desk',
        caption: c.toss,
        hold: 200,
        run: () => {
          l3(true, { tag: c.network, main: c.anchor.name.toUpperCase(), sub: `${c.anchor.title} · ${c.showName}`, tone: 'name' });
          talking('anchor', true);
          return () => talking('anchor', false);
        },
      });
      const wxBeat = (caption, idx) => ({
        ...misty,
        scene: 'weather',
        caption,
        hold: idx < 0 ? 100 : 350,
        run: () => {
          if (idx < 0) whoosh();
          l3(true, { tag: c.weather.segment, main: c.weather.name.toUpperCase(), sub: c.weather.title, tone: 'weather' });
          refs.wx.forEach((w, j) => w.classList.toggle('is-active', j === idx));
          talking('weather', true);
          return () => talking('weather', false);
        },
      });
      list.push(wxBeat(c.weatherHello, -1));
      forecast.forEach((f, j) => list.push(wxBeat(f.text, j)));
      list.push({
        ...anchor,
        scene: 'desk',
        caption: c.signoff,
        hold: 400,
        run: () => {
          refs.ots.classList.remove('is-on');
          refs.cam.classList.add('is-pull');
          l3(true, { tag: c.network, main: c.showName.toUpperCase(), sub: c.slogan, tone: 'name' });
          talking('anchor', true);
          return () => talking('anchor', false);
        },
      });
      list.push({ scene: 'end', caption: '', say: false, hold: 1700, run: () => (l3(false), sting()) });
      return list;
    }

    function reset() {
      if (!refs.stage) return;
      switchLayers(refs.stage, 'title');
      refs.stage.classList.remove('is-breaking', 'is-anchor-talking', 'is-weather-talking');
      refs.cam.classList.remove('is-push', 'is-pull');
      refs.ots.classList.remove('is-on');
      refs.wx.forEach((w) => w.classList.remove('is-active'));
      l3(false);
    }

    const shareText = fill(c.share.text, { headline: stories[0]?.headline || '' });
    const show = mountShow(root, ctx, opts, {
      prefix: 'nw',
      label: c.showName,
      stage: buildStage,
      beats,
      reset,
      scene: (name) => switchLayers(refs.stage, name),
      pronounce: c.pronounce,
      voice: { voice: 'anchor', rate: 1.06 },
      maxChars: 96,
      poster: { kicker: `${c.network} · ${dateLine}`, title: c.showName, sub: `Tonight: ${stories[0]?.headline || ''}`, cta: 'Watch tonight’s broadcast · 1 min' },
      onComplete: ({ mode }) => {
        if (mode === 'page') ctx.referral.qualify('news');
      },
      below: () => [
        el(
          'div.nw-about',
          el('span.kicker', c.about.kicker),
          el('h2', c.about.title),
          el('p', c.about.text),
          el('ol.nw-rundown', stories.map((s) => el('li', el('span.nw-rundown__icon', s.topic.icon), el('span', s.headline)))),
        ),
        ctx.share.panel({ text: shareText, params: { watch: 'news' }, kind: 'news', title: c.share.title }),
        ctx.cta.card({
          kicker: c.cta.kicker,
          title: c.cta.title,
          body: (c.cta.facts || []).map((k) => facts[k]).filter(Boolean).join(' '),
          kind: c.cta.kind || 'primary',
          label: c.cta.label,
          content: 'news',
        }),
      ],
    });

    return () => show.destroy();
  },
};
