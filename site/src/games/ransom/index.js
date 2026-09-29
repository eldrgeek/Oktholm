import './style.css';

/*
 * Renewal Ransom Note (toy)
 *
 * Form (company, seats, current spend, vendor mood) -> three pieces of "evidence":
 *   1. a ransom note built from magazine cut-out letters on crumpled paper,
 *   2. an itemized renewal quote whose total lands exactly on the note's percentage,
 *   3. a proof-of-life polaroid of the admin holding today's date.
 * The page shows DOM versions. "Download PNG" re-renders everything on a 1080x1350 canvas (no DOM screenshot).
 * All copy comes from ctx.content (brands/<brand>/modules/ransom.js); FALLBACK keeps it working without it.
 */

const FALLBACK = {
  intro: { kicker: 'Renewal season', title: 'Renewal Ransom Note', lede: 'Tell us what they have. We’ll print what they want.' },
  form: {
    company: 'Company name',
    companyPlaceholder: 'Acme Corp',
    companyFallback: 'Your company',
    seats: 'Seats',
    seatsDefault: 250,
    spend: 'Current annual spend',
    spendOptional: 'optional',
    spendPlaceholder: 'e.g. 48,000',
    spendHelp: '',
    mood: 'Vendor mood',
    submit: 'Open the envelope',
    regenerate: 'Regenerate',
    download: 'Download PNG',
    downloading: 'Rendering…',
  },
  envelope: {
    stamp: 'Renewal enclosed',
    urgent: 'Time sensitive',
    to: 'To: {company} IT',
    from: 'From: your vendor',
    line: 'You have (1) new renewal notice.',
    cta: 'Open the envelope',
  },
  moods: [
    { id: 'aggressive', label: 'Aggressive', pct: [38, 64], stamp: 'Final offer' },
    { id: 'passive', label: 'Passive-aggressive', pct: [17, 33], stamp: 'Per my last email' },
    { id: 'contractual', label: 'Contractually obligated', pct: [9, 19], stamp: 'Non-negotiable' },
    { id: 'partner', label: '“Strategic partner”', pct: [26, 47], stamp: 'Mutual success' },
  ],
  salutations: [{ text: 'DEAR {company},' }],
  templates: [{ text: 'WE HAVE YOUR SSO. PAY {pct}% MORE BY {deadline} OR THE LOGOUT BUTTON GETS IT.' }],
  postscripts: [{ text: 'NO COPS. NO COMPETITORS. NO SCIM.' }],
  signoffs: { default: ['— your vendor'] },
  deadlines: ['FRIDAY'],
  footnotes: ['This message is confidential.'],
  quote: {
    title: 'Renewal Quote',
    vendor: 'Renewals Division',
    labels: { number: 'Quote no.', date: 'Issued', company: 'Prepared for', seats: 'Seats', valid: 'Valid until', terms: 'Terms' },
    validUntil: 'Yesterday',
    terms: 'Due on receipt',
    head: { item: 'Description', qty: 'Qty × rate', amount: 'Amount' },
    flat: 'flat fee',
    subtotal: 'Subtotal',
    uplift: 'Loyalty uplift',
    upliftNote: '',
    total: 'Total due',
    lastYear: 'Last year',
    lastYearEstimated: 'Last year (estimated)',
    increase: 'Increase vs last year',
    more: '+ {n} more line items',
    finePrint: ['Prices exclude tax, fees and surcharges.'],
  },
  lineItems: [
    { name: 'SSO Enablement Fee', basis: 'seat', rate: 6, always: true },
    { name: 'SCIM Surcharge', basis: 'app', rate: 900 },
    { name: 'Second Factor', basis: 'seat', rate: 4.5 },
    { name: 'Audit Log Retention (7 days)', basis: 'day', rate: 1400 },
    { name: 'Admin Console Access', basis: 'admin', rate: 1800 },
    { name: 'Logout Button', basis: 'seat', rate: 2 },
    { name: 'Premium Support', basis: 'flat', rate: 24000 },
    { name: 'Named CSM', basis: 'flat', rate: 18000 },
    { name: 'Price Increase Protection Fee', basis: 'flat', rate: 9500 },
    { name: 'Professional Services', basis: 'month', qty: 9, rate: 14000 },
    { name: 'Loyalty Surcharge', basis: 'seat', rate: 3 },
    { name: 'API Access', basis: 'flat', rate: 15000 },
  ],
  polaroid: { sign: ['STILL ALIVE', '{date}'], caption: 'Proof of life', note: '' },
  tag: { exhibit: 'Exhibit A', case: 'Case {number}', seats: '{seats} seats held', demand: 'Demand: +{pct}%' },
  poster: { footer: 'Make yours:' },
  share: { title: 'Share', text: 'My renewal came with a ransom note. {pct}% or the logout button gets it. Make yours:' },
  cta: { kicker: 'Prescription', title: 'Pay for software, not ransoms.', label: '', secondaryLabel: 'See the SSO tax, itemized' },
};

// Canvas font specs to preload before drawing (fonts are self-hosted; see public/fonts).
const FONT_LOADS = [
  '400 40px Anton',
  "400 40px 'Special Elite'",
  "400 40px 'Permanent Marker'",
  "400 40px 'IBM Plex Mono'",
  "600 40px 'IBM Plex Mono'",
  "700 40px 'IBM Plex Mono'",
  "800 40px 'Plus Jakarta Sans'",
  '400 40px DotGothic16',
];

// Magazine cut-out faces. `k` normalizes visual size between faces.
const FONTS = {
  anton: { k: 1, canvas: (px) => `400 ${px}px Anton, Impact, sans-serif` },
  type: { k: 1.04, canvas: (px) => `400 ${px}px 'Special Elite', 'Courier New', monospace` },
  marker: { k: 0.9, canvas: (px) => `400 ${px}px 'Permanent Marker', cursive` },
  mono: { k: 0.9, canvas: (px) => `700 ${px}px 'IBM Plex Mono', monospace` },
  body: { k: 0.92, canvas: (px) => `800 ${px}px 'Plus Jakarta Sans', sans-serif` },
  pixel: { k: 0.98, canvas: (px) => `400 ${px}px DotGothic16, monospace` },
  serif: { k: 1.04, canvas: (px, it) => `${it ? 'italic ' : ''}700 ${px}px Georgia, 'Times New Roman', serif` },
};
const FONT_IDS = Object.keys(FONTS);

// Paper stocks: newsprint, glossy magazine colors, black/white. `w` = pick weight.
const SWATCHES = [
  { id: 'news', bg: '#ebe4d1', ink: '#1b1a17', w: 15, lines: true },
  { id: 'white', bg: '#fbfaf4', ink: '#121212', w: 13 },
  { id: 'black', bg: '#151515', ink: '#f6f2e9', w: 9 },
  { id: 'red', bg: '#d7263d', ink: '#ffffff', w: 6, gloss: true },
  { id: 'yellow', bg: '#ffd23f', ink: '#151515', w: 6, gloss: true },
  { id: 'blue', bg: '#2952c4', ink: '#ffffff', w: 5, gloss: true },
  { id: 'magenta', bg: '#c2185b', ink: '#ffffff', w: 4, gloss: true },
  { id: 'teal', bg: '#1b8a6b', ink: '#ffffff', w: 4, gloss: true },
  { id: 'orange', bg: '#f77f00', ink: '#161616', w: 4, gloss: true },
  { id: 'pink', bg: '#ffc8dd', ink: '#9d0208', w: 4 },
  { id: 'sky', bg: '#bde0fe', ink: '#0b2545', w: 4 },
  { id: 'kraft', bg: '#c9a36b', ink: '#2b1d0e', w: 3 },
];
const HOT = { id: 'hot', bg: '#ffd23f', ink: '#c1121f', gloss: true };

// How many units each quote line bills for.
const BASIS = {
  seat: { unit: 'seat', qty: (s) => s },
  app: { unit: 'app', qty: (s) => Math.min(450, Math.max(6, Math.round(Math.sqrt(s) * 2.2))) },
  admin: { unit: 'admin', qty: (s) => Math.min(500, Math.max(1, Math.ceil(s / 60))) },
  day: { unit: 'day', qty: () => 7 },
  month: { unit: 'month', qty: () => 12 },
  flat: { unit: '', qty: () => 1 },
  press: { unit: 'press', qty: (s) => s * 3 },
  push: { unit: 'push', qty: (s) => s * 220 },
  leaver: { unit: 'leaver', qty: (s) => Math.max(1, Math.round(s * 0.18)) },
  joiner: { unit: 'joiner', qty: (s) => Math.max(1, Math.round(s * 0.2)) },
  group: { unit: 'group', qty: (s) => Math.max(10, Math.round(s * 1.6)) },
  redline: { unit: 'redline', qty: (s, rng) => rng.int(12, 48) },
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/* ---------------------------------------------------------------- utils */

const round2 = (n) => Math.round(n * 100) / 100;
const rad = (d) => (d * Math.PI) / 180;
const sumBy = (list, f) => list.reduce((s, x) => s + f(x), 0);
const pad2 = (n) => String(n).padStart(2, '0');

function money(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function rateText(r) {
  return r >= 0.1 ? money(r) : '$' + r.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function plural(unit, n) {
  if (!unit || n === 1) return unit;
  return /(sh|ss|ch|x)$/.test(unit) ? unit + 'es' : unit + 's';
}

function weighted(list, rng) {
  let r = rng() * sumBy(list, (x) => x.w || 1);
  for (const x of list) {
    r -= x.w || 1;
    if (r <= 0) return x;
  }
  return list[list.length - 1];
}

function resolveContent(content = {}) {
  const C = { ...FALLBACK, ...content };
  for (const k of ['intro', 'form', 'envelope', 'quote', 'polaroid', 'tag', 'poster', 'share', 'cta']) {
    C[k] = { ...FALLBACK[k], ...(content[k] || {}) };
  }
  C.quote.labels = { ...FALLBACK.quote.labels, ...(content.quote?.labels || {}) };
  C.quote.head = { ...FALLBACK.quote.head, ...(content.quote?.head || {}) };
  C.signoffs = { ...FALLBACK.signoffs, ...(content.signoffs || {}) };
  for (const k of ['moods', 'templates', 'postscripts', 'salutations', 'deadlines', 'footnotes', 'lineItems']) {
    if (!Array.isArray(C[k]) || !C[k].length) C[k] = FALLBACK[k];
  }
  return C;
}

/* ---------------------------------------------------------------- model */

/** Letters, digits and a little punctuation only: no markup, no control/bidi characters, max 40 chars. */
function sanitizeCompany(raw, max = 40) {
  return String(raw ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, '')
    .replace(/[^\p{L}\p{N}\s&.,'’!?@#+\-:()/]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
}

function parseSeats(raw, fallback) {
  const n = parseInt(String(raw ?? '').replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 500000) : fallback;
}

/** "48,000", "$48k", "1.2m" -> number. Blank or junk -> 0 (unknown). */
function parseSpend(raw) {
  const s = String(raw ?? '').trim().toLowerCase().replace(/[\s,$€£_]/g, '');
  const m = /^(\d+(?:\.\d+)?)([km]?)$/.exec(s);
  if (!m) return 0;
  const n = parseFloat(m[1]) * (m[2] === 'k' ? 1e3 : m[2] === 'm' ? 1e6 : 1);
  return Math.min(999999999, Math.max(0, Math.round(n)));
}

function dateBits(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const opts = { year: 'numeric', month: 'short', day: 'numeric' };
  return {
    year: y,
    sign: `${MONTHS[m]} ${d} ${y}`,
    stamp: `'${String(y).slice(2)} ${pad2(m + 1)} ${pad2(d)}`,
    long: now.toLocaleDateString('en-US', opts),
    yesterday: new Date(now.getTime() - 86400000).toLocaleDateString('en-US', opts),
  };
}

/** Mood-specific lines if any exist (strict), otherwise a mix where mood lines are twice as likely. */
function forMood(list, moodId, strict = false) {
  const tagged = list.filter((x) => x && typeof x === 'object' && x.mood === moodId);
  const generic = list.filter((x) => typeof x === 'string' || (x && !x.mood));
  if (strict) return tagged.length ? tagged : generic.length ? generic : list;
  const pool = generic.concat(tagged, tagged);
  return pool.length ? pool : list;
}

const textOf = (x) => (typeof x === 'string' ? x : x?.text || '');

/**
 * Pick 8-12 line items, then scale every rate so subtotal + loyalty uplift lands on the mood's increase.
 * The note quotes the percentage computed from the final (rounded) totals, so note and quote always agree.
 */
function buildQuote(input, C, rng, dates) {
  const { seats, spend, mood } = input;
  const [lo, hi] = Array.isArray(mood.pct) ? mood.pct : [15, 40];
  const targetPct = rng.int(lo, hi);
  const estimated = !spend;
  const lastYear = spend || Math.max(600, seats * rng.int(54, 96));
  const upliftPct = rng.int(7, 12);
  const subTarget = (lastYear * (1 + targetPct / 100)) / (1 + upliftPct / 100);

  const pool = C.lineItems;
  const always = pool.filter((i) => i.always);
  const rest = rng.shuffle(pool.filter((i) => !i.always));
  const picked = always.concat(rest).slice(0, Math.min(pool.length, rng.int(8, 12)));
  const rows = picked.map((it) => {
    const b = BASIS[it.basis] || BASIS.flat;
    const qty = Math.max(1, Math.round(it.qty || b.qty(seats, rng)));
    return { it, b, qty, weight: Math.max(1, (Number(it.rate) || 1000) * qty) * (0.7 + rng() * 0.6) };
  });
  const totalWeight = sumBy(rows, (r) => r.weight);
  const items = rows.map((r) => {
    let rate = (subTarget * (r.weight / totalWeight)) / r.qty;
    rate = rate >= 0.1 ? Math.round(rate * 100) / 100 : Math.max(0.0001, Math.round(rate * 10000) / 10000);
    return { name: r.it.name, unit: r.b.unit, qty: r.qty, rate, amount: round2(rate * r.qty) };
  });
  const subtotal = round2(sumBy(items, (i) => i.amount));
  const uplift = round2((subtotal * upliftPct) / 100);
  const total = round2(subtotal + uplift);
  const pct = Math.max(1, Math.round((total / lastYear - 1) * 100));
  const number = `Q-${dates.year}-${rng.int(10000, 99999)}-R${rng.int(3, 19)}`;
  return { items, subtotal, uplift, upliftPct, total, lastYear, estimated, pct, number };
}

function buildNote(input, quote, C, rng, fill, fmt) {
  const vars = { company: input.companyUpper, pct: quote.pct, seats: fmt(input.seats), deadline: rng.pick(C.deadlines) };
  const salutation = fill(textOf(rng.pick(forMood(C.salutations, input.mood.id))), vars);
  const main = fill(textOf(rng.pick(forMood(C.templates, input.mood.id, true))), vars);
  const ps = fill(textOf(rng.pick(forMood(C.postscripts, input.mood.id))), vars);
  const signoff = fill(rng.pick(C.signoffs[input.mood.id] || C.signoffs.default || ['—']), vars);
  const footnote = rng.pick(C.footnotes) || '';
  return {
    segments: [
      { text: salutation, scale: 0.7 },
      { text: main, scale: 1 },
      { text: ps, scale: 0.78 },
    ],
    signoff,
    footnote,
    plain: [salutation, main, ps, signoff].join(' '),
  };
}

/** Mostly single letters, sometimes 2-3 letter cuts or a whole short word; the percentage is one big cut. */
function chunkWord(word, rng) {
  if (/\d%/.test(word)) return [{ text: word, hot: true }];
  const chars = Array.from(word);
  if (chars.length <= 3 && rng.chance(0.3)) return [{ text: word }];
  const out = [];
  for (let i = 0; i < chars.length; ) {
    const r = rng();
    const n = r < 0.15 ? 2 : r < 0.19 ? 3 : 1;
    const text = chars.slice(i, i + n).join('');
    i += n;
    if (out.length && /^[.,:;!?’')\]”]+$/.test(text)) out[out.length - 1].text += text;
    else out.push({ text });
  }
  return out;
}

function cutShape(rng) {
  const j = () => Math.round(rng() * 70) / 10; // 0-7% inset per corner: scissors, not a guillotine
  return [
    [j(), j()],
    [100 - j(), j()],
    [100 - j(), 100 - j()],
    [j(), 100 - j()],
  ];
}

function styleTile(text, rng, prev, hot) {
  const clip = cutShape(rng);
  if (hot) return { text, font: 'anton', sw: HOT, scale: 1.42, rot: (rng() - 0.5) * 8, dy: 0, pad: [0.08, 0.16], clip, italic: false, hot: true };
  let sw = SWATCHES[0];
  let font = 'anton';
  for (let guard = 0; guard < 6; guard++) {
    sw = weighted(SWATCHES, rng);
    font = rng.pick(FONT_IDS);
    if (!prev || (sw.id !== prev.sw.id && font !== prev.font)) break;
  }
  const lower = /\p{L}/u.test(text) && rng.chance(0.26);
  return {
    text: lower ? text.toLowerCase() : text.toUpperCase(),
    font,
    sw,
    scale: (0.84 + rng() * 0.4) * FONTS[font].k,
    rot: (rng() + rng() - 1) * 9,
    dy: (rng() - 0.5) * 0.16,
    pad: [0.05 + rng() * 0.09, 0.09 + rng() * 0.1],
    clip,
    italic: font === 'serif' && rng.chance(0.45),
  };
}

/** segments -> [{ scale, words: [[tile, tile...], ...] }] */
function makeTiles(segments, rng) {
  let prev = null;
  let idx = 0;
  return segments.map((seg) => ({
    scale: seg.scale,
    words: seg.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) =>
        chunkWord(word, rng).map((c) => {
          const t = styleTile(c.text, rng, prev, c.hot);
          t.i = idx++;
          prev = t;
          return t;
        }),
      ),
  }));
}

function qtyText(it, C) {
  return it.unit ? `${it.qty.toLocaleString('en-US')} ${plural(it.unit, it.qty)} × ${rateText(it.rate)}` : C.quote.flat;
}

/* ---------------------------------------------------------------- canvas painter */

function createPainter({ kit, C, brand, seeded, fill, fmt }) {
  const INK = '#1f1c17';
  const DIM = '#6b6152';
  const RED = '#b3001b';
  const type = (px) => `400 ${px}px 'Special Elite', 'Courier New', monospace`;
  const mono = (px, wt = 400) => `${wt} ${px}px 'IBM Plex Mono', ui-monospace, monospace`;
  const marker = (px) => `400 ${px}px 'Permanent Marker', 'Comic Sans MS', cursive`;
  const anton = (px) => `400 ${px}px Anton, Impact, sans-serif`;
  const pixel = (px) => `400 ${px}px DotGothic16, monospace`;

  function withBox(g, { x, y, w, h, rot = 0 }, fn) {
    g.save();
    g.translate(x + w / 2, y + h / 2);
    g.rotate(rot);
    fn(-w / 2, -h / 2, w, h);
    g.restore();
  }

  function fitFont(g, text, maxW, px, mk, minPx = 8) {
    let p = px;
    g.font = mk(p);
    while (p > minPx && g.measureText(text).width > maxW) g.font = mk(--p);
    return p;
  }

  function ellipsize(g, text, maxW) {
    const s = String(text);
    if (g.measureText(s).width <= maxW) return s;
    let lo = 0;
    let hi = s.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (g.measureText(s.slice(0, mid) + '…').width <= maxW) lo = mid;
      else hi = mid - 1;
    }
    return s.slice(0, lo).trimEnd() + '…';
  }

  function shade(s) {
    return s >= 0 ? `rgba(255,255,255,${(s * 0.5).toFixed(3)})` : `rgba(96,72,40,${(-s * 0.3).toFixed(3)})`;
  }

  /** Crumpled paper: a jittered triangle mesh, each facet shaded like it catches the light differently. */
  function drawCrumpled(g, x, y, w, h, rng, base = '#f0eadc') {
    g.save();
    g.beginPath();
    g.rect(x, y, w, h);
    g.clip();
    g.fillStyle = base;
    g.fillRect(x, y, w, h);
    const cols = 6;
    const rows = Math.max(4, Math.round((cols * h) / w));
    const cw = w / cols;
    const ch = h / rows;
    const P = [];
    for (let j = 0; j <= rows; j++) {
      P.push([]);
      for (let i = 0; i <= cols; i++) {
        const jx = i > 0 && i < cols ? (rng() - 0.5) * cw * 0.9 : 0;
        const jy = j > 0 && j < rows ? (rng() - 0.5) * ch * 0.9 : 0;
        P[j].push([x + i * cw + jx, y + j * ch + jy]);
      }
    }
    const tris = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = P[j][i];
        const b = P[j][i + 1];
        const c = P[j + 1][i + 1];
        const d = P[j + 1][i];
        if (rng() < 0.5) tris.push([a, b, c], [a, c, d]);
        else tris.push([a, b, d], [b, c, d]);
      }
    }
    for (const [p0, p1, p2] of tris) {
      const grad = g.createLinearGradient(p0[0], p0[1], (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2);
      grad.addColorStop(0, shade(rng() - 0.5));
      grad.addColorStop(1, shade(rng() - 0.5));
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(p0[0], p0[1]);
      g.lineTo(p1[0], p1[1]);
      g.lineTo(p2[0], p2[1]);
      g.closePath();
      g.fill();
    }
    // Creases: a highlight with a soft shadow right next to it.
    g.lineWidth = 1;
    for (const [p0, p1] of tris) {
      if (rng() < 0.45) continue;
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.beginPath();
      g.moveTo(p0[0], p0[1]);
      g.lineTo(p1[0], p1[1]);
      g.stroke();
      g.strokeStyle = 'rgba(90,70,40,0.16)';
      g.beginPath();
      g.moveTo(p0[0] + 1.2, p0[1] + 1.2);
      g.lineTo(p1[0] + 1.2, p1[1] + 1.2);
      g.stroke();
    }
    for (let k = 0; k < (w * h) / 900; k++) {
      g.fillStyle = `rgba(80,60,30,${(rng() * 0.08).toFixed(3)})`;
      g.fillRect(x + rng() * w, y + rng() * h, 1.2, 1.2);
    }
    if (rng() < 0.45) {
      // A coffee ring. Renewal season is long.
      const r = Math.min(w, h) * (0.1 + rng() * 0.05);
      g.strokeStyle = 'rgba(140,95,40,0.12)';
      g.lineWidth = r * 0.12;
      g.beginPath();
      g.arc(x + w * (0.1 + rng() * 0.2), y + h * (0.62 + rng() * 0.25), r, 0.3, Math.PI * 1.8);
      g.stroke();
    }
    const cx = x + w / 2;
    const cy = y + h / 2;
    const v = g.createRadialGradient(cx, cy, Math.min(w, h) * 0.35, cx, cy, Math.hypot(w, h) * 0.6);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(90,65,30,0.22)');
    g.fillStyle = v;
    g.fillRect(x, y, w, h);
    g.restore();
  }

  let textureCache = { seed: null, url: '' };
  function paperTexture(seed) {
    if (textureCache.seed === seed) return textureCache.url;
    const c = document.createElement('canvas');
    c.width = 760;
    c.height = 600;
    drawCrumpled(c.getContext('2d'), 0, 0, c.width, c.height, seeded((seed + 11) >>> 0));
    let url = '';
    try {
      url = c.toDataURL('image/jpeg', 0.84);
    } catch {
      url = '';
    }
    textureCache = { seed, url };
    return url;
  }

  function measureTile(g, t, segPx) {
    const px = Math.max(6, segPx * t.scale);
    g.font = FONTS[t.font].canvas(px, t.italic);
    const m = g.measureText(t.text);
    const fin = (v, d) => (Number.isFinite(v) ? v : d);
    const left = fin(m.actualBoundingBoxLeft, 0);
    const right = fin(m.actualBoundingBoxRight, m.width);
    const asc = Math.max(fin(m.actualBoundingBoxAscent, px * 0.72), px * 0.46);
    const desc = Math.max(fin(m.actualBoundingBoxDescent, px * 0.1), px * 0.04);
    const padX = px * t.pad[1];
    const padY = px * t.pad[0];
    return { t, px, w: left + right + padX * 2, h: asc + desc + padY * 2, asc, left, padX, padY };
  }

  /** Flow layout: words never split unless a single word is wider than the note. */
  function layoutTiles(g, tiles, maxW, base) {
    const gapT = base * 0.05;
    const gapW = base * 0.34;
    const gapL = base * 0.14;
    const gapS = base * 0.34;
    const lines = [];
    let line = null;
    const newLine = () => (line = { items: [], w: 0, h: 0 });
    for (const seg of tiles) {
      newLine();
      const segPx = base * seg.scale;
      for (const word of seg.words) {
        const boxes = word.map((t) => measureTile(g, t, segPx));
        const ww = sumBy(boxes, (b) => b.w) + gapT * (boxes.length - 1);
        if (line.items.length && line.w + gapW + ww > maxW) {
          lines.push(line);
          newLine();
        }
        let x = line.items.length ? line.w + gapW : 0;
        for (const b of boxes) {
          if (line.items.length && x + b.w > maxW) {
            lines.push(line);
            newLine();
            x = 0;
          }
          line.items.push({ ...b, x });
          line.w = x + b.w;
          line.h = Math.max(line.h, b.h);
          x += b.w + gapT;
        }
      }
      line.segEnd = true;
      lines.push(line);
    }
    let y = 0;
    lines.forEach((ln, i) => {
      ln.y = y;
      y += ln.h + (i < lines.length - 1 ? (ln.segEnd ? gapS : gapL) : 0);
    });
    return { lines, height: y };
  }

  function drawTile(g, b, cx, cy) {
    const t = b.t;
    g.save();
    g.translate(cx, cy + t.dy * b.px);
    g.rotate(rad(t.rot));
    const x0 = -b.w / 2;
    const y0 = -b.h / 2;
    const path = () => {
      g.beginPath();
      t.clip.forEach(([px, py], i) => {
        const X = x0 + (px / 100) * b.w;
        const Y = y0 + (py / 100) * b.h;
        if (i) g.lineTo(X, Y);
        else g.moveTo(X, Y);
      });
      g.closePath();
    };
    path();
    g.shadowColor = 'rgba(0,0,0,0.38)';
    g.shadowBlur = Math.max(2, b.px * 0.06);
    g.shadowOffsetX = b.px * 0.02;
    g.shadowOffsetY = b.px * 0.045;
    g.fillStyle = t.sw.bg;
    g.fill();
    g.shadowColor = 'transparent';
    g.shadowBlur = 0;
    g.shadowOffsetX = 0;
    g.shadowOffsetY = 0;
    g.save();
    path();
    g.clip();
    if (t.sw.lines) {
      g.fillStyle = 'rgba(0,0,0,0.07)';
      const step = Math.max(3, b.px * 0.09);
      for (let yy = y0 + 2; yy < y0 + b.h; yy += step) g.fillRect(x0, yy, b.w, 1);
    }
    if (t.sw.gloss) {
      const gr = g.createLinearGradient(x0, y0, x0 + b.w * 0.6, y0 + b.h);
      gr.addColorStop(0, 'rgba(255,255,255,0.38)');
      gr.addColorStop(0.5, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(x0, y0, b.w, b.h);
    }
    g.fillStyle = t.sw.ink;
    g.font = FONTS[t.font].canvas(b.px, t.italic);
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.fillText(t.text, x0 + b.padX + b.left, y0 + b.padY + b.asc);
    g.restore();
    g.restore();
  }

  function drawTiles(g, lay, x0, y0, maxW) {
    for (const ln of lay.lines) {
      const ox = x0 + (maxW - ln.w) / 2;
      for (const it of ln.items) drawTile(g, it, ox + it.x + it.w / 2, y0 + ln.y + ln.h / 2);
    }
  }

  function drawTape(g, cx, cy, w, h, rot) {
    g.save();
    g.translate(cx, cy);
    g.rotate(rot);
    g.fillStyle = 'rgba(255, 236, 170, 0.62)';
    g.shadowColor = 'rgba(0,0,0,0.18)';
    g.shadowBlur = 3;
    g.beginPath();
    const teeth = 7;
    g.moveTo(-w / 2, -h / 2);
    g.lineTo(w / 2, -h / 2);
    for (let i = 1; i <= teeth; i++) g.lineTo(w / 2 + (i % 2 ? -3 : 0), -h / 2 + (h * i) / teeth);
    g.lineTo(-w / 2, h / 2);
    for (let i = teeth - 1; i >= 0; i--) g.lineTo(-w / 2 + (i % 2 ? 3 : 0), -h / 2 + (h * i) / teeth);
    g.closePath();
    g.fill();
    g.restore();
  }

  function drawPin(g, x, y, color = '#d62839') {
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath();
    g.ellipse(x + 5, y + 8, 11, 7, 0, 0, Math.PI * 2);
    g.fill();
    const grd = g.createRadialGradient(x - 4, y - 4, 1, x, y, 13);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(0.25, color);
    grd.addColorStop(1, 'rgba(0,0,0,0.85)');
    g.fillStyle = color;
    g.beginPath();
    g.arc(x, y, 12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = grd;
    g.globalAlpha = 0.55;
    g.fill();
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.beginPath();
    g.arc(x - 4, y - 4, 2.8, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  /** Rubber stamp: double border, Anton caps, ink dropouts. Drawn offscreen so the dropouts stay inside it. */
  function drawStamp(g, text, cx, cy, rot, color, size, rng) {
    const label = String(text).toUpperCase();
    const off = document.createElement('canvas');
    const o = off.getContext('2d');
    o.font = anton(size);
    const w = o.measureText(label).width + size * 0.95;
    const h = size * 1.55;
    off.width = Math.ceil(w + 16);
    off.height = Math.ceil(h + 16);
    o.strokeStyle = color;
    o.fillStyle = color;
    o.lineWidth = size * 0.1;
    kit.roundRect(o, 8, 8, w, h, size * 0.2);
    o.stroke();
    o.lineWidth = size * 0.04;
    kit.roundRect(o, 8 + size * 0.17, 8 + size * 0.17, w - size * 0.34, h - size * 0.34, size * 0.12);
    o.stroke();
    o.font = anton(size);
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillText(label, 8 + w / 2, 8 + h / 2 + size * 0.04);
    o.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < (off.width * off.height) / 38; i++) {
      o.globalAlpha = rng() * 0.75;
      o.fillRect(rng() * off.width, rng() * off.height, 1 + rng() * 2.4, 1 + rng() * 1.8);
    }
    g.save();
    g.translate(cx, cy);
    g.rotate(rot);
    g.globalAlpha = 0.86;
    g.drawImage(off, -off.width / 2, -off.height / 2);
    g.restore();
  }

  function drawCork(g, W, H, rng) {
    const grad = g.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#9b7249');
    grad.addColorStop(1, '#7a5634');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = rng() < 0.5 ? `rgba(58,34,14,${(0.15 + rng() * 0.3).toFixed(2)})` : `rgba(222,182,122,${(0.1 + rng() * 0.25).toFixed(2)})`;
      g.beginPath();
      g.arc(rng() * W, rng() * H, 0.6 + rng() * 1.8, 0, Math.PI * 2);
      g.fill();
    }
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.5)');
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
  }

  function drawNote(g, st, box) {
    withBox(g, box, (x, y, w, h) => {
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 28;
      g.shadowOffsetY = 12;
      g.fillStyle = '#efe9dc';
      g.fillRect(x, y, w, h);
      g.restore();
      drawCrumpled(g, x, y, w, h, seeded((st.seed + 11) >>> 0));
      const px = 40;
      const pt = 46;
      const pb = 24;
      const innerW = w - px * 2;
      const footPx = 13;
      g.font = type(footPx);
      const foot = st.note.footnote ? kit.wrapLines(g, st.note.footnote, innerW) : [];
      const footH = foot.length * footPx * 1.4;
      const avail = h - pt - pb - footH - 14;
      let base = 64;
      let lay = null;
      let signPx = 24;
      for (let i = 0; i < 40; i++) {
        lay = layoutTiles(g, st.tiles, innerW, base);
        signPx = Math.max(18, Math.round(base * 0.6));
        if (lay.height + base * 0.4 + signPx * 1.25 <= avail || base < 18) break;
        base *= 0.95;
      }
      const block = lay.height + base * 0.4 + signPx * 1.25;
      const top = y + pt + Math.max(0, (avail - block) / 2);
      drawTiles(g, lay, x + px, top, innerW);
      g.save();
      fitFont(g, st.note.signoff, innerW * 0.92, signPx, marker, 14);
      g.fillStyle = '#1e2a66';
      g.textAlign = 'right';
      g.textBaseline = 'top';
      g.translate(x + w - px, top + lay.height + base * 0.4);
      g.rotate(rad(-2.5));
      g.fillText(st.note.signoff, 0, 0);
      g.restore();
      g.font = type(footPx);
      g.fillStyle = 'rgba(66,55,38,0.85)';
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      foot.forEach((ln, i) => g.fillText(ln, x + px, y + h - pb - footH + footPx + i * footPx * 1.4));
      drawTape(g, x + 74, y + 2, 132, 34, rad(-7));
      drawTape(g, x + w - 74, y + 2, 132, 34, rad(6));
    });
  }

  /** Walks the quote layout; measures when draw=false, paints when draw=true. Returns the height used. */
  function quoteLayout(g, st, innerW, f, draw, ox, oy, maxItems, spread = 0) {
    const Q = C.quote;
    const L = Q.labels;
    const q = st.quote;
    const items = q.items.slice(0, maxItems);
    const hiddenCount = q.items.length - items.length;
    let y = 0;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';

    const tPx = Math.round(f * 2.1);
    if (draw) {
      g.font = type(tPx);
      g.fillStyle = INK;
      g.fillText(String(Q.title).toUpperCase(), ox, oy + tPx * 0.82);
    }
    y += tPx * 0.95;
    const vPx = Math.max(10, Math.round(f * 0.66));
    if (draw) {
      g.font = mono(vPx, 600);
      g.fillStyle = DIM;
      g.fillText(ellipsize(g, String(Q.vendor).toUpperCase(), innerW * 0.68), ox, oy + y + vPx * 1.1);
    }
    y += vPx * 2.1;
    if (draw) {
      g.fillStyle = INK;
      g.fillRect(ox, oy + y, innerW, 2);
      g.fillRect(ox, oy + y + 4, innerW, 1);
    }
    y += f * 0.95;

    const cells = [
      [L.number, q.number],
      [L.date, st.dates.long],
      [L.valid, `${Q.validUntil} (${st.dates.yesterday})`, true],
      [L.company, st.input.companyDisplay],
      [L.seats, fmt(st.input.seats)],
      [L.terms, Q.terms],
    ];
    const colW = innerW / 3;
    const lPx = Math.max(9, Math.round(f * 0.58));
    const vvPx = Math.round(f * 0.86);
    for (let r = 0; r < 2; r++) {
      if (draw) {
        for (let c = 0; c < 3; c++) {
          const [label, value, red] = cells[r * 3 + c];
          const cx = ox + c * colW;
          g.font = mono(lPx, 600);
          g.fillStyle = DIM;
          g.fillText(String(label).toUpperCase(), cx, oy + y + lPx);
          g.fillStyle = red ? RED : INK;
          fitFont(g, value, colW - 14, vvPx, type, Math.round(vvPx * 0.72));
          g.fillText(ellipsize(g, value, colW - 14), cx, oy + y + lPx + vvPx * 1.2);
        }
      }
      y += lPx + vvPx * 1.2 + f * 0.62;
    }
    y += f * 0.75 + spread;

    const dPx = Math.round(f * 0.95);
    const qPx = Math.max(9, Math.round(f * 0.68));
    g.font = type(dPx);
    const amtW = Math.max(g.measureText(Q.head.amount).width, ...items.map((i) => g.measureText(money(i.amount)).width)) + 4;
    g.font = mono(qPx);
    const qtyTexts = items.map((i) => qtyText(i, C));
    const qtyW = Math.min(innerW * 0.3, Math.max(g.measureText(Q.head.qty).width, ...qtyTexts.map((t) => g.measureText(t).width)));
    const gap = f * 0.9;
    const descW = innerW - amtW - qtyW - gap * 2;
    const hPx = Math.max(9, Math.round(f * 0.58));
    if (draw) {
      g.font = mono(hPx, 600);
      g.fillStyle = DIM;
      g.fillText(String(Q.head.item).toUpperCase(), ox, oy + y + hPx);
      g.textAlign = 'right';
      g.fillText(String(Q.head.qty).toUpperCase(), ox + descW + gap + qtyW, oy + y + hPx);
      g.fillText(String(Q.head.amount).toUpperCase(), ox + innerW, oy + y + hPx);
      g.textAlign = 'left';
      g.fillStyle = INK;
      g.fillRect(ox, oy + y + hPx + 6, innerW, 1.2);
    }
    y += hPx + 6 + f * 0.55;

    const lineH = dPx * 1.16;
    items.forEach((it, i) => {
      g.font = type(dPx);
      const lines = kit.wrapLines(g, it.name, descW);
      if (draw) {
        g.fillStyle = INK;
        lines.forEach((ln, k) => g.fillText(ln, ox, oy + y + dPx + k * lineH));
        g.font = mono(qPx);
        g.fillStyle = DIM;
        g.textAlign = 'right';
        g.fillText(ellipsize(g, qtyTexts[i], qtyW), ox + descW + gap + qtyW, oy + y + dPx);
        g.font = type(dPx);
        g.fillStyle = INK;
        g.fillText(money(it.amount), ox + innerW, oy + y + dPx);
        g.textAlign = 'left';
      }
      y += lines.length * lineH + f * 0.3 + spread;
      if (draw) {
        g.fillStyle = 'rgba(0,0,0,0.22)';
        for (let dx = 0; dx < innerW; dx += 5) g.fillRect(ox + dx, oy + y - f * 0.12, 2, 1);
      }
      y += f * 0.12;
    });
    if (hiddenCount > 0) {
      if (draw) {
        g.font = type(Math.round(f * 0.78));
        g.fillStyle = DIM;
        g.fillText(fill(Q.more, { n: hiddenCount }), ox, oy + y + f * 0.8);
      }
      y += f * 1.2;
    }
    y += f * 0.55 + spread * 2;

    // Totals (right) with the fine print beside them (left).
    const totW = Math.min(innerW * 0.52, 470);
    const tx = ox + innerW - totW;
    let ty = y;
    const trow = (label, value, px, color, bold) => {
      if (draw) {
        g.font = type(px);
        g.fillStyle = color;
        g.textAlign = 'left';
        g.fillText(label, tx, oy + ty + px);
        g.textAlign = 'right';
        g.fillText(value, tx + totW, oy + ty + px);
        if (bold) g.fillText(value, tx + totW + 0.7, oy + ty + px);
        g.textAlign = 'left';
      }
      ty += px * 1.38;
    };
    trow(Q.subtotal, money(q.subtotal), Math.round(f * 0.92), INK);
    trow(`${Q.uplift} (${q.upliftPct}%)`, money(q.uplift), Math.round(f * 0.92), INK);
    if (draw) {
      g.fillStyle = INK;
      g.fillRect(tx, oy + ty + 2, totW, 2);
    }
    ty += f * 0.45;
    trow(Q.total, money(q.total), Math.round(f * 1.22), INK, true);
    trow(q.estimated ? Q.lastYearEstimated : Q.lastYear, money(q.lastYear), Math.round(f * 0.8), DIM);
    const pPx = Math.round(f * 1.9);
    if (draw) {
      g.fillStyle = RED;
      g.font = type(Math.round(f * 0.8));
      g.fillText(Q.increase, tx, oy + ty + pPx * 0.72);
      g.font = anton(pPx);
      g.textAlign = 'right';
      g.fillText(`+${q.pct}%`, tx + totW, oy + ty + pPx * 0.86);
      g.textAlign = 'left';
    }
    ty += pPx * 1.05;

    const fw = innerW - totW - f * 1.4;
    const fPx = Math.max(9, Math.round(f * 0.6));
    g.font = mono(fPx);
    let fy = y;
    for (const line of Q.finePrint || []) {
      const ls = kit.wrapLines(g, '* ' + line, fw);
      if (draw) {
        g.fillStyle = DIM;
        ls.forEach((l, k) => g.fillText(l, ox, oy + fy + fPx + k * fPx * 1.35));
      }
      fy += ls.length * fPx * 1.35 + fPx * 0.5;
    }
    return Math.max(ty, fy);
  }

  function drawQuote(g, st, box) {
    withBox(g, box, (x, y, w, h) => {
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.45)';
      g.shadowBlur = 24;
      g.shadowOffsetY = 10;
      g.fillStyle = '#f6f2e7';
      g.fillRect(x, y, w, h);
      g.restore();
      const tooth = g.createLinearGradient(0, y, 0, y + h);
      tooth.addColorStop(0, 'rgba(255,255,255,0.35)');
      tooth.addColorStop(1, 'rgba(120,100,60,0.08)');
      g.fillStyle = tooth;
      g.fillRect(x, y, w, h);
      const pad = 38;
      const innerW = w - pad * 2;
      const innerH = h - pad * 2 + 10;
      let f = 23;
      let max = st.quote.items.length;
      let need = 0;
      for (let guard = 0; guard < 30; guard++) {
        need = quoteLayout(g, st, innerW, f, false, 0, 0, max);
        if (need <= innerH) break;
        if (f > 13) f -= 1;
        else if (max > 6) max -= 1;
        else break;
      }
      // Font sizes step coarsely; hand the leftover height back as row spacing so the page looks typed to fit.
      const shown = Math.min(max, st.quote.items.length);
      const spread = Math.max(0, Math.min(f * 0.8, (innerH - need) / (shown + 3)));
      quoteLayout(g, st, innerW, f, true, x + pad, y + pad, max, spread);
      drawStamp(g, st.input.mood.stamp || 'Final offer', x + w - 190, y + 64, rad(-10), '#c8102e', 30, seeded((st.seed + 5) >>> 0));
      drawPin(g, x + 28, y + 22, '#2f6fdf');
      drawPin(g, x + w - 28, y + 22, '#2f6fdf');
    });
  }

  /** The proof-of-life photo: a flash-lit wall, a server rack, one stick-figure admin holding today's date. */
  function drawPhoto(g, x, y, w, h, st) {
    const rng = seeded((st.seed ^ 0x5bd1e995) >>> 0);
    const line = (x1, y1, x2, y2) => {
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
    };
    const dot = (cx, cy, r) => {
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
    };
    g.save();
    g.beginPath();
    g.rect(x, y, w, h);
    g.clip();
    const wall = g.createRadialGradient(x + w * 0.58, y + h * 0.38, w * 0.04, x + w * 0.5, y + h * 0.5, w * 0.9);
    wall.addColorStop(0, '#f1ecdf');
    wall.addColorStop(0.5, '#c9bea6');
    wall.addColorStop(1, '#3f392e');
    g.fillStyle = wall;
    g.fillRect(x, y, w, h);
    const fy = y + h * 0.79;
    const floor = g.createLinearGradient(0, fy, 0, y + h);
    floor.addColorStop(0, 'rgba(60,50,38,0.55)');
    floor.addColorStop(1, 'rgba(25,20,15,0.85)');
    g.fillStyle = floor;
    g.fillRect(x, fy, w, y + h - fy);

    const rx = x + w * 0.05;
    const ry = y + h * 0.2;
    const rw = w * 0.2;
    const rh = fy - ry + h * 0.02;
    g.fillStyle = '#23272e';
    g.fillRect(rx, ry, rw, rh);
    const units = 8;
    const uh = (rh - 12) / units;
    for (let i = 0; i < units; i++) {
      const uy = ry + 6 + i * uh;
      g.fillStyle = '#343a44';
      g.fillRect(rx + 4, uy, rw - 8, uh - 3);
      const r = rng();
      g.fillStyle = r < 0.25 ? '#ff4757' : r < 0.5 ? '#ffb627' : '#36f59a';
      g.fillRect(rx + rw - w * 0.05, uy + uh * 0.35, w * 0.015, w * 0.015);
      g.fillStyle = '#36f59a';
      g.fillRect(rx + rw - w * 0.08, uy + uh * 0.35, w * 0.015, w * 0.015);
    }
    g.strokeStyle = 'rgba(40,120,220,0.75)';
    g.lineWidth = Math.max(1, w * 0.007);
    g.beginPath();
    g.moveTo(rx + rw, ry + rh * 0.3);
    g.bezierCurveTo(rx + rw + w * 0.09, ry + rh * 0.5, rx + rw - w * 0.02, ry + rh * 0.8, rx + rw + w * 0.07, fy + h * 0.03);
    g.stroke();

    const cx = x + w * 0.6;
    const lw = Math.max(2, w * 0.021);
    g.strokeStyle = '#161616';
    g.fillStyle = '#161616';
    g.lineWidth = lw;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    const hr = h * 0.08;
    const hy = y + h * 0.235;
    g.beginPath();
    g.arc(cx, hy, hr, 0, Math.PI * 2);
    g.stroke();
    for (let i = -1; i <= 1; i++) line(cx + i * hr * 0.35, hy - hr, cx + i * hr * 0.6, hy - hr * 1.45);
    dot(cx - hr * 0.36, hy - hr * 0.1, lw * 0.75);
    dot(cx + hr * 0.36, hy - hr * 0.1, lw * 0.75);
    g.lineWidth = lw * 0.5;
    for (const sx of [-1, 1]) {
      g.beginPath();
      g.arc(cx + sx * hr * 0.36, hy + hr * 0.1, hr * 0.18, 0.2 * Math.PI, 0.8 * Math.PI);
      g.stroke();
    }
    g.lineWidth = lw * 0.7;
    g.beginPath();
    g.moveTo(cx - hr * 0.32, hy + hr * 0.5);
    g.quadraticCurveTo(cx, hy + hr * 0.38, cx + hr * 0.32, hy + hr * 0.52);
    g.stroke();
    g.lineWidth = lw;
    const neck = hy + hr;
    const hip = y + h * 0.63;
    line(cx, neck, cx, hip);
    line(cx, hip, cx - w * 0.075, fy + h * 0.06);
    line(cx, hip, cx + w * 0.07, fy + h * 0.06);
    line(cx - w * 0.075, fy + h * 0.06, cx - w * 0.11, fy + h * 0.065);
    line(cx + w * 0.07, fy + h * 0.06, cx + w * 0.105, fy + h * 0.065);

    const sw = w * 0.52;
    const sh = h * 0.25;
    const sx = cx - sw / 2;
    const sy = neck + h * 0.05;
    const shoulder = neck + h * 0.035;
    const grip = [sx + sw * 0.05, sy + sh * 0.1, sx + sw * 0.95, sy + sh * 0.1];
    line(cx, shoulder, grip[0], grip[1]);
    line(cx, shoulder, grip[2], grip[3]);
    g.save();
    g.translate(cx, sy + sh / 2);
    g.rotate(rad(-3));
    g.fillStyle = '#c9a36b';
    g.fillRect(-sw / 2, -sh / 2, sw, sh);
    g.strokeStyle = 'rgba(80,55,25,0.55)';
    g.lineWidth = 1;
    g.strokeRect(-sw / 2 + 0.5, -sh / 2 + 0.5, sw - 1, sh - 1);
    const lines = (C.polaroid.sign || ['STILL ALIVE', '{date}']).slice(0, 3).map((s) => fill(s, { date: st.dates.sign }));
    g.fillStyle = '#111111';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const top = sh * 0.2;
    const lh = (sh - top) / (lines.length + 0.15);
    lines.forEach((ln, i) => {
      fitFont(g, ln, sw * 0.84, Math.round(lh * 0.82), marker, 6);
      g.fillText(ln, 0, -sh / 2 + top + lh * (i + 0.5));
    });
    g.restore();
    g.fillStyle = '#161616';
    dot(grip[0], grip[1], lw * 1.35);
    dot(grip[2], grip[3], lw * 1.35);

    const vg = g.createRadialGradient(x + w / 2, y + h / 2, w * 0.3, x + w / 2, y + h / 2, w * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.35)');
    g.fillStyle = vg;
    g.fillRect(x, y, w, h);
    g.font = pixel(Math.round(h * 0.075));
    g.textAlign = 'right';
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#ff9d2e';
    g.shadowColor = 'rgba(255,110,0,0.9)';
    g.shadowBlur = h * 0.02;
    g.fillText(st.dates.stamp, x + w * 0.95, y + h * 0.95);
    g.restore();
  }

  function drawPolaroid(g, st, box) {
    withBox(g, box, (x, y, w, h) => {
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 20;
      g.shadowOffsetY = 10;
      g.fillStyle = '#fbfbf6';
      g.fillRect(x, y, w, h);
      g.restore();
      const m = Math.round(w * 0.06);
      const pw = w - m * 2;
      drawPhoto(g, x + m, y + m, pw, pw, st);
      g.fillStyle = '#1b1a17';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const capY = y + m + pw + (h - m - pw) * (C.polaroid.note ? 0.36 : 0.5);
      fitFont(g, C.polaroid.caption, w - m * 2, Math.round(w * 0.1), marker, 12);
      g.fillText(C.polaroid.caption, x + w / 2, capY);
      if (C.polaroid.note) {
        g.fillStyle = '#5b5b5b';
        fitFont(g, C.polaroid.note, w - m * 2, Math.round(w * 0.052), marker, 9);
        g.fillText(C.polaroid.note, x + w / 2, capY + w * 0.09);
      }
      drawTape(g, x + w / 2, y - 2, w * 0.44, 30, rad(-4));
    });
  }

  function drawTag(g, st, box) {
    withBox(g, box, (x, y, w, h) => {
      const cut = 24;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.45)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 6;
      g.beginPath();
      g.moveTo(x + cut, y);
      g.lineTo(x + w, y);
      g.lineTo(x + w, y + h);
      g.lineTo(x + cut, y + h);
      g.lineTo(x, y + h - cut);
      g.lineTo(x, y + cut);
      g.closePath();
      g.fillStyle = '#e2c78c';
      g.fill();
      g.restore();
      g.fillStyle = '#c7a869';
      g.beginPath();
      g.arc(x + 22, y + h / 2, 11, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#6e4f31';
      g.beginPath();
      g.arc(x + 22, y + h / 2, 5.5, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#efe6d2';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x + 22, y + h / 2);
      g.bezierCurveTo(x - 24, y + h * 0.2, x - 10, y - 30, x + 34, y - 44);
      g.stroke();
      const tx = x + 44;
      const tw = w - 44 - 14;
      const T = C.tag;
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillStyle = '#7a1f16';
      g.font = mono(13, 700);
      g.fillText(String(T.exhibit).toUpperCase(), tx, y + 27);
      g.fillStyle = '#2a2116';
      fitFont(g, st.input.companyUpper, tw, 24, type, 13);
      g.fillText(ellipsize(g, st.input.companyUpper, tw), tx, y + 57);
      const rows = [fill(T.case, { number: st.quote.number }), fill(T.seats, { seats: fmt(st.input.seats) })];
      rows.forEach((r, i) => {
        fitFont(g, r, tw, 15, type, 10);
        g.fillText(r, tx, y + 84 + i * 22);
      });
      g.fillStyle = RED;
      const demand = fill(T.demand, { pct: st.quote.pct });
      fitFont(g, demand, tw, 18, type, 11);
      g.fillText(demand, tx, y + 134);
    });
  }

  function drawFooter(g, W, H) {
    const hh = 50;
    g.fillStyle = 'rgba(12,9,6,0.84)';
    g.fillRect(0, H - hh, W, hh);
    g.textBaseline = 'middle';
    let host = '';
    try {
      host = new URL(brand.site?.url || '').host.replace(/^www\./, '');
    } catch {
      host = '';
    }
    g.font = mono(16, 700);
    g.fillStyle = '#ffd23f';
    g.textAlign = 'left';
    g.fillText(`${brand.site?.name || ''} · ${C.intro.title}`.toUpperCase(), 26, H - hh / 2);
    g.font = mono(16, 600);
    g.fillStyle = '#f4efe4';
    g.textAlign = 'right';
    g.fillText(`${C.poster.footer} ${host}`.trim(), W - 26, H - hh / 2);
  }

  async function poster(st) {
    await kit.ensureFonts(FONT_LOADS);
    const W = 1080;
    const H = 1350;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const g = cv.getContext('2d');
    drawCork(g, W, H, seeded((st.seed + 99) >>> 0));
    drawQuote(g, st, { x: 40, y: 636, w: 1000, h: 650, rot: rad(0.7) });
    drawNote(g, st, { x: 34, y: 40, w: 716, h: 574, rot: rad(-1.3) });
    drawTag(g, st, { x: 792, y: 430, w: 246, h: 152, rot: rad(-4) });
    drawPolaroid(g, st, { x: 780, y: 62, w: 262, h: 322, rot: rad(4.5) });
    drawFooter(g, W, H);
    return cv;
  }

  return { paperTexture, drawPhoto, poster };
}

/* ---------------------------------------------------------------- module */

export default {
  id: 'ransom',
  kind: 'toy',
  title: 'Renewal Ransom Note',
  blurb: 'Your identity provider sent the renewal. It came with a ransom note. Make yours.',
  emoji: '✂️',
  minutes: '1 min',
  therapy: 'Treats: Renewal Quote Shock',

  mount(root, ctx) {
    const d = ctx.dom.disposer();
    const { el, fill, formatNumber } = ctx.dom;
    const C = resolveContent(ctx.content);
    const P = createPainter({ kit: ctx.canvas, C, brand: ctx.brand, seeded: ctx.rng.seeded, fill, fmt: formatNumber });
    const facts = ctx.brand.sponsor?.facts || {};
    const reduced = ctx.dom.prefersReducedMotion();
    const uid = Math.random().toString(36).slice(2, 8);
    let state = null;
    let generated = false;
    let busy = false;
    let alive = true;
    d(() => (alive = false));

    /* ----- form ----- */
    const company = el('input.input', {
      type: 'text',
      name: 'company',
      maxLength: 40,
      placeholder: C.form.companyPlaceholder,
      autocomplete: 'organization',
      spellcheck: false,
    });
    const seats = el('input.input', { type: 'number', name: 'seats', min: 1, max: 500000, step: 1, inputmode: 'numeric', value: String(C.form.seatsDefault || 250) });
    const spend = el('input.input', { type: 'text', name: 'spend', inputmode: 'decimal', placeholder: C.form.spendPlaceholder, autocomplete: 'off' });
    const moodInputs = C.moods.map((m, i) => el('input', { type: 'radio', name: `rn-mood-${uid}`, value: m.id, checked: i === 0 }));
    const moodLabels = C.moods.map((m, i) =>
      el('label.rn-mood' + (i === 0 ? '.is-on' : ''), moodInputs[i], el('span.rn-mood__label', m.label), m.hint && el('span.rn-mood__hint', m.hint)),
    );
    moodInputs.forEach((inp) =>
      d.on(inp, 'change', () => {
        moodLabels.forEach((l, i) => l.classList.toggle('is-on', moodInputs[i].checked));
        ctx.sfx.click();
      }),
    );
    const form = el(
      'form.rn-form.card.card--raised',
      { novalidate: true },
      el(
        'div.rn-form__grid',
        el('label.field', el('span', C.form.company), company),
        el('label.field', el('span', C.form.seats), seats),
        el(
          'label.field',
          el('span', C.form.spend, ' ', el('em.rn-opt', `(${C.form.spendOptional})`)),
          el('span.rn-money', el('span.rn-money__sym', { 'aria-hidden': 'true' }, '$'), spend),
          C.form.spendHelp && el('small.rn-help', C.form.spendHelp),
        ),
      ),
      el('fieldset.rn-moods', el('legend', C.form.mood), el('div.rn-moods__grid', moodLabels)),
      el('div.rn-form__go', el('button.btn.btn--alarm.btn--lg', { type: 'submit' }, C.form.submit)),
    );
    d.on(form, 'submit', (e) => {
      e.preventDefault();
      generate(false);
    });

    function readForm() {
      const name = sanitizeCompany(company.value);
      const display = name || C.form.companyFallback;
      const moodId = (moodInputs.find((i) => i.checked) || moodInputs[0]).value;
      const n = parseSeats(seats.value, C.form.seatsDefault || 250);
      seats.value = String(n);
      return {
        companyDisplay: display,
        companyUpper: display.toUpperCase(),
        seats: n,
        spend: parseSpend(spend.value),
        mood: C.moods.find((m) => m.id === moodId) || C.moods[0],
      };
    }

    /* ----- sealed envelope (before the first generation) ----- */
    const envTo = el('span.rn-env__to');
    const updateEnvelope = () => {
      const name = sanitizeCompany(company.value) || C.form.companyFallback;
      envTo.textContent = fill(C.envelope.to, { company: name.toUpperCase() });
    };
    updateEnvelope();
    d.on(company, 'input', updateEnvelope);
    const envelope = el(
      'button.rn-env',
      { type: 'button', 'aria-label': C.envelope.cta, onclick: () => generate(false) },
      el('span.rn-env__flap', { 'aria-hidden': 'true' }),
      el('span.rn-env__postage', { 'aria-hidden': 'true' }, el('b', '+%'), el('small', 'POSTAGE DUE')),
      el('span.rn-env__addr', el('span.rn-env__from', C.envelope.from), envTo, el('span.rn-env__line', C.envelope.line)),
      el('span.stamp.stamp--denied.rn-env__stamp', C.envelope.stamp),
      el('span.rn-env__tape', { 'aria-hidden': 'true' }, `${C.envelope.urgent} · ${C.envelope.urgent} · ${C.envelope.urgent}`),
      el('span.btn.btn--alarm.btn--sm.rn-env__cta', C.envelope.cta),
    );

    const result = el('section.rn-result', envelope);
    const status = el('p.sr-only', { role: 'status', 'aria-live': 'polite' });

    root.append(
      el(
        'div.rn',
        el('header.rn-intro', el('div.kicker.kicker--alarm', C.intro.kicker), el('h2.display.rn-title', C.intro.title), el('p.rn-lede.dim', C.intro.lede)),
        form,
        status,
        result,
      ),
    );

    /* ----- generation ----- */
    function generate(isRegen) {
      const input = readForm();
      const seed = (Math.random() * 2 ** 31) >>> 0;
      const rng = ctx.rng.seeded(seed);
      const dates = dateBits();
      const quote = buildQuote(input, C, rng, dates);
      const note = buildNote(input, quote, C, rng, fill, formatNumber);
      const tiles = makeTiles(note.segments, rng);
      state = { input, quote, note, tiles, seed, dates };
      renderResult(!reduced);
      status.textContent = `${C.intro.title}: +${quote.pct}%. ${note.plain}`;
      playSounds();
      if (!generated) {
        generated = true;
        ctx.referral.grantChip('ransom-paid');
        ctx.referral.qualify('ransom');
      }
      ctx.track('ransom_generated', { mood: input.mood.id, regen: Boolean(isRegen), estimated: quote.estimated });
      if (!isRegen) result.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }

    function snip(delay) {
      ctx.sfx.noise(0.035, { gain: 0.16, freq: 5200, q: 4, delay });
      ctx.sfx.noise(0.03, { gain: 0.12, freq: 3400, q: 4, delay: delay + 0.07 });
    }
    function playSounds() {
      for (let i = 0; i < 5; i++) snip(i * 0.17);
      d.timeout(() => alive && ctx.sfx.stamp(), reduced ? 0 : 1450);
    }

    function tileEl(t, animate) {
      const cls = `span.rn-cut.rn-f-${t.font}${t.sw.lines ? '.rn-cut--lines' : ''}${t.sw.gloss ? '.rn-cut--gloss' : ''}`;
      const cut = el(cls, { text: t.text });
      cut.style.backgroundColor = t.sw.bg;
      cut.style.color = t.sw.ink;
      cut.style.clipPath = `polygon(${t.clip.map(([x, y]) => `${x}% ${y}%`).join(', ')})`;
      cut.style.padding = `${t.pad[0].toFixed(3)}em ${t.pad[1].toFixed(3)}em`;
      if (t.italic) cut.style.fontStyle = 'italic';
      const tile = el('span.rn-tile', cut);
      tile.style.fontSize = `${t.scale.toFixed(3)}em`;
      tile.style.transform = `translateY(${t.dy.toFixed(3)}em) rotate(${t.rot.toFixed(2)}deg)`;
      if (animate) {
        tile.classList.add('is-in');
        tile.style.animationDelay = `${Math.min(t.i * 13, 1300)}ms`;
      }
      return tile;
    }

    function noteEl(st, animate) {
      const tiles = el('div.rn-note__tiles', { 'aria-hidden': 'true' });
      for (const seg of st.tiles) {
        const segEl = el('div.rn-seg');
        segEl.style.fontSize = `${seg.scale}em`;
        for (const word of seg.words) segEl.append(el('span.rn-word', word.map((t) => tileEl(t, animate))));
        tiles.append(segEl);
      }
      const note = el(
        'article.rn-note',
        el('span.rn-note__tape.rn-note__tape--l', { 'aria-hidden': 'true' }),
        el('span.rn-note__tape.rn-note__tape--r', { 'aria-hidden': 'true' }),
        el('p.sr-only', st.note.plain),
        tiles,
        el('p.rn-note__sign', st.note.signoff),
        st.note.footnote && el('p.rn-note__foot', st.note.footnote),
      );
      const tex = P.paperTexture(st.seed);
      if (tex) note.style.backgroundImage = `url("${tex}")`;
      return note;
    }

    function polaroidEl(st, animate) {
      const cv = el('canvas.rn-polaroid__photo', { width: 440, height: 440, 'aria-hidden': 'true' });
      const draw = () => P.drawPhoto(cv.getContext('2d'), 0, 0, 440, 440, st);
      draw();
      ctx.canvas.ensureFonts(FONT_LOADS).then(() => alive && state === st && draw());
      return el(
        'figure.rn-polaroid' + (animate ? '.is-developing' : ''),
        cv,
        el('figcaption.rn-polaroid__cap', C.polaroid.caption),
        C.polaroid.note && el('div.rn-polaroid__note', C.polaroid.note),
      );
    }

    function tagEl(st) {
      const T = C.tag;
      return el(
        'div.rn-tag-wrap',
        el(
          'div.rn-tag',
          el('div.rn-tag__k', T.exhibit),
          el('div.rn-tag__co', st.input.companyUpper),
          el('div.rn-tag__l', fill(T.case, { number: st.quote.number })),
          el('div.rn-tag__l', fill(T.seats, { seats: formatNumber(st.input.seats) })),
          el('div.rn-tag__l.rn-tag__demand', fill(T.demand, { pct: st.quote.pct })),
        ),
      );
    }

    function quoteEl(st, animate) {
      const q = st.quote;
      const Q = C.quote;
      const L = Q.labels;
      const meta = [
        [L.number, q.number],
        [L.date, st.dates.long],
        [L.valid, `${Q.validUntil} (${st.dates.yesterday})`, true],
        [L.company, st.input.companyDisplay],
        [L.seats, formatNumber(st.input.seats)],
        [L.terms, Q.terms],
      ];
      const rows = q.items.map((it, i) => {
        const row = el(
          'div.rn-qrow',
          { role: 'row' },
          el('span.rn-qrow__item', { role: 'cell' }, it.name),
          el('span.rn-qrow__qty', { role: 'cell' }, qtyText(it, C)),
          el('span.rn-qrow__amt', { role: 'cell' }, money(it.amount)),
        );
        if (animate) {
          row.classList.add('is-typed');
          row.style.animationDelay = `${500 + i * 70}ms`;
        }
        return row;
      });
      const stamp = el('div.stamp.stamp--denied.rn-quote__stamp' + (animate ? '.is-slam' : ''), st.input.mood.stamp || 'Final offer');
      if (animate) stamp.style.animationDelay = '1.4s';
      return el(
        'section.rn-quote.paper',
        { 'aria-label': Q.title },
        el('header.rn-quote__head', el('div', el('h3.rn-quote__title', Q.title), el('div.rn-quote__vendor', Q.vendor)), stamp),
        el(
          'dl.rn-quote__meta',
          meta.map(([k, v, red]) => el('div', el('dt', k), el('dd' + (red ? '.is-red' : ''), v))),
        ),
        el(
          'div.rn-quote__table',
          { role: 'table' },
          el(
            'div.rn-qrow.rn-qrow--head',
            { role: 'row' },
            el('span', { role: 'columnheader' }, Q.head.item),
            el('span.rn-qrow__qty', { role: 'columnheader' }, Q.head.qty),
            el('span.rn-qrow__amt', { role: 'columnheader' }, Q.head.amount),
          ),
          rows,
        ),
        el(
          'div.rn-quote__foot',
          el('ul.rn-quote__fine', (Q.finePrint || []).map((t) => el('li', t))),
          el(
            'div.rn-quote__totals',
            el('div.rn-trow', el('span', Q.subtotal), el('span', money(q.subtotal))),
            el(
              'div.rn-trow',
              el('span', `${Q.uplift} (${q.upliftPct}%)`, Q.upliftNote && el('em', ` ${Q.upliftNote}`)),
              el('span', money(q.uplift)),
            ),
            el('div.rn-trow.rn-trow--total', el('span', Q.total), el('span', money(q.total))),
            el('div.rn-trow.rn-trow--dim', el('span', q.estimated ? Q.lastYearEstimated : Q.lastYear), el('span', money(q.lastYear))),
            el('div.rn-trow.rn-trow--pct', el('span', Q.increase), el('span', `+${q.pct}%`)),
          ),
        ),
      );
    }

    const dlBtn = el('button.btn.btn--vital', { type: 'button', onclick: () => download() }, C.form.download);
    const regenBtn = el(
      'button.btn.btn--amber',
      {
        type: 'button',
        onclick: () => {
          ctx.sfx.click();
          generate(true);
        },
      },
      C.form.regenerate,
    );

    function renderResult(animate) {
      const st = state;
      const shareText = fill(C.share.text, { pct: st.quote.pct, company: st.input.companyDisplay, seats: formatNumber(st.input.seats) });
      const cta = ctx.cta.card({
        kicker: C.cta.kicker,
        title: C.cta.title,
        body: [facts.pricing, facts.free].filter(Boolean).join(' '),
        kind: 'pricing',
        label: C.cta.label || undefined,
        content: 'ransom',
        secondary: { kind: 'ssotax', label: C.cta.secondaryLabel },
      });
      result.replaceChildren(
        el('div.rn-stage', noteEl(st, animate), el('div.rn-side', polaroidEl(st, animate), tagEl(st))),
        quoteEl(st, animate),
        el('div.rn-actions', regenBtn, dlBtn),
        ctx.share.panel({ text: shareText, params: { play: 'ransom' }, kind: 'ransom', title: C.share.title }),
        cta,
      );
    }

    async function download() {
      if (!state || busy) return;
      busy = true;
      dlBtn.disabled = true;
      dlBtn.textContent = C.form.downloading;
      try {
        const canvas = await P.poster(state);
        const slug = state.input.companyDisplay.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'company';
        await ctx.canvas.downloadCanvas(canvas, `renewal-ransom-${slug}.png`);
        ctx.sfx.click();
        ctx.track('ransom_download', { mood: state.input.mood.id });
      } catch (e) {
        console.warn('[ransom] render failed', e);
        ctx.ui.toast('The printer is also on a support contract. Try again.', { kind: 'bad' });
      } finally {
        busy = false;
        dlBtn.disabled = false;
        dlBtn.textContent = C.form.download;
      }
    }

    return () => d.run();
  },
};
