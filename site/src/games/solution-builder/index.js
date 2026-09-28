import './style.css';

/*
 * Build Your Own Oktholm™ Solution (toy)
 *
 * A parody of enterprise "Build & Price" configurators. Pick components; their dependencies add themselves (with a
 * cha-ching), cost/timeline/complexity balloon in a live stats panel, and the SVG architecture diagram drifts from
 * tidy swimlanes into spaghetti as chaos nodes ("Dave's Script (cron, undocumented)") join on their own.
 * "Get quote" reveals the hidden fees, a Gantt chart that ends after several renewals, a verdict stamp, a 1200x630
 * share card drawn on canvas, and a side-by-side with the sponsor (facts read from ctx.brand.sponsor.facts only).
 * All copy and the whole catalog come from ctx.content (brands/<brand>/modules/solution-builder.js).
 */

const FALLBACK = {
  header: {
    kicker: 'Build & Price',
    title: 'Build Your Own Solution',
    sub: 'Configure the identity platform of your nightmares.',
    seats: 'Seats',
    seatsUnit: 'seats',
    tier: 'Tier: {tier} · Pricing: {note}',
    presets: 'Start from a preset',
    reset: 'Start over',
    catalog: 'Components',
    catalogNote: 'Tap to add. Dependencies add themselves.',
    requires: 'Requires {list}',
    services: '+{amount} services',
    included: 'Included',
    perSeat: '{price}/seat/mo',
    perApp: '{price}/app/yr',
    flat: '{price}/yr',
    legend: { dep: 'depends on', chaos: 'nobody approved this', undoc: 'undocumented' },
  },
  seats: { min: 25, max: 25000, default: 500 },
  startWith: ['login'],
  tiers: [{ max: 1e9, name: 'Enterprise', note: 'Contact Sales' }],
  categories: [
    { id: 'core', name: 'Core', blurb: '' },
    { id: 'auth', name: 'Authentication', blurb: '' },
  ],
  components: [
    { id: 'login', name: 'Login Page (Base)', short: 'Login Page', category: 'core', desc: 'A login page.', pricing: { perSeat: 4 }, months: 1, groups: 6, terraform: 150, sanity: 2, requires: [] },
    { id: 'sso', name: 'SSO Enablement Tier', short: 'SSO', category: 'auth', desc: 'SSO, as an upgrade.', pricing: { perSeat: 6 }, oneTime: 15000, months: 2, consultants: 1, groups: 25, terraform: 500, sanity: 6, requires: ['login'], apps: true },
  ],
  hidden: [{ id: 'platform', name: 'Platform Fee', desc: '', pricing: { pctOfSubscription: 12 } }],
  chaos: [],
  presets: [],
  stats: {
    title: 'Your configuration',
    skus: '{n} SKUs',
    annual: 'Annual cost',
    oneTime: 'One-time services',
    months: 'Implementation',
    monthsUnit: 'months',
    consultants: 'Consultants',
    groups: 'AD groups spawned',
    terraform: 'Terraform lines',
    sanity: 'Admin sanity',
    golive: 'Probability of go-live',
    fees: '+ fees calculated at checkout',
    quote: 'Get quote',
    details: 'Details',
    hide: 'Hide',
    mini: { annual: '/yr', months: 'mo', golive: 'go-live' },
  },
  diagram: {
    title: 'Reference architecture',
    version: 'v{n}',
    complexity: 'Complexity: {label}',
    users: 'Your {seats} users',
    apps: 'Your {apps} apps',
    levels: [{ max: 2, label: 'Complicated' }],
  },
  toasts: {
    requires: '{name} requires {deps}. Added.',
    loadBearingTitle: '{short} is load-bearing',
    loadBearingBody: 'Removing {name} also removes {count} that depend on it: {list}.',
    loadBearingConfirm: 'Remove all {n}',
    loadBearingCancel: 'Keep it',
    chaos: '{name} has joined your architecture.',
    preset: '{preset}: you picked {asked}. Dependencies picked {extra} more.',
    presetNoExtra: '{preset}: {n} SKUs.',
    empty: 'Add at least one component.',
    reset: 'Configuration cleared.',
  },
  quote: {
    kicker: 'Quote',
    title: 'Your Quote',
    numberPrefix: 'Q',
    fields: [],
    head: { item: 'Component', basis: 'Basis', annual: 'Annual', oneTime: 'One-time' },
    included: 'Included',
    servicesOnly: 'Services only',
    perSeat: '{price}/seat/mo × {seats}',
    perApp: '{price}/app/yr × {apps} apps',
    flat: 'Flat, per year',
    hiddenTitle: 'Fees calculated at checkout',
    hiddenNote: '',
    newBadge: 'New',
    totals: {
      subscription: 'Subscription',
      hidden: 'Fees revealed at checkout',
      annual: 'Total annual',
      oneTime: 'One-time professional services',
      year1: 'Year 1 total',
      tco: '3-year total',
    },
    timeline: {
      title: 'Implementation timeline',
      kickoff: 'Kickoff: next quarter ({q})',
      golive: 'Go-live: {q} (pending)',
      procurement: 'Procurement',
      phases: [{ name: 'Implementation', share: 1 }],
      today: 'Today',
      renewal: 'Renewal {n}',
      golivePin: 'Go-live?',
      renewals: 'You will renew {n} times before go-live.',
      renewalsOne: 'You will renew once before go-live.',
      renewalsNone: '',
    },
    verdict: 'Verdict',
    back: 'Back to the configurator',
    cardTitle: 'Your shareable quote card',
    download: 'Download PNG',
    downloading: 'Rendering…',
  },
  verdicts: [{ min: 0, text: 'Go-live: TBD', tone: 'denied' }],
  card: {
    kicker: 'Build & Price · Quote {number}',
    title: 'My Solution',
    perYear: '/yr',
    lines: [{ text: '{months}-month rollout' }, { text: '{golive} chance of go-live', alarm: true }],
    diagram: 'Reference architecture {version} · {complexity}',
    footer: 'Build yours:',
  },
  share: { title: 'Share', text: 'I built my own identity stack: {annual}/yr, {months}-month rollout, {golive} chance of go-live. Build yours:' },
  yeshid: {
    kicker: 'Second opinion',
    title: 'Or: the same requirements, one box',
    sub: '',
    themTitle: 'Your solution',
    themStats: ['{skusText}', '{months}-month rollout'],
    usTitle: '',
    usBox: '',
    users: 'Your {seats} users',
    apps: 'Your {apps} apps',
    rowsHead: ['Requirement', 'Your configuration', 'Instead'],
    rows: [],
    pricingLabel: 'See pricing',
  },
  cta: { kicker: 'Prescription', title: 'Replace the diagram with a box.', label: '', secondaryLabel: 'Get a demo' },
};

// Category colors (brand content may override with `color` on a category).
const CAT_COLORS = ['#6b86ff', '#36f59a', '#ffb627', '#c084fc', '#22d3ee', '#fb7185', '#a3e635', '#f97316'];
// Canvas can't read CSS variables; these mirror src/styles/tokens.css.
const TOK = { bg: '#070a0f', surface: '#0f1620', surface2: '#142030', line: '#1e2c3c', line2: '#2b3e55', text: '#e9f0f7', dim: '#a3b3c5', faint: '#6f8297', vital: '#36f59a', alarm: '#ff4757', amber: '#ffb627', cure: '#4263eb', cure2: '#6b86ff' };
const CHAOS_STYLE = {
  sheet: { fill: '#0f4d31', stroke: '#36f59a', text: '#eafff3', note: '#8ff0bf' },
  terminal: { fill: '#04070a', stroke: '#36f59a', text: '#36f59a', note: '#6f8297', mono: true },
  box: { fill: '#262c36', stroke: '#8a96a8', text: '#e9f0f7', note: '#a3b3c5', dash: true },
  legacy: { fill: '#3a2410', stroke: '#e0913a', text: '#ffb627', note: '#d6a56a' },
  laptop: { fill: '#d5dbe3', stroke: '#9aa5b1', text: '#16181d', note: '#545a66' },
  sticky: { fill: '#ffe066', stroke: '#e0b400', text: '#1a1400', note: '#5a4a00', marker: true },
};
const CARD_FONTS = ['400 40px Anton', "600 20px 'IBM Plex Mono'", "700 20px 'IBM Plex Mono'", "800 20px 'Plus Jakarta Sans'", "600 20px 'Plus Jakarta Sans'", "400 20px 'Permanent Marker'"];
const SVGNS = 'http://www.w3.org/2000/svg';

/* ---------------------------------------------------------------- utils */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const rad = (d) => (d * Math.PI) / 180;
const sumBy = (list, f) => list.reduce((s, x) => s + f(x), 0);

function usd(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function usdCompact(n) {
  const a = Math.abs(n);
  if (a >= 1e9) return '$' + (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (a >= 1e6) return '$' + (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (a >= 1e4) return '$' + Math.round(n / 1e3) + 'K';
  return usd(n);
}

function priceText(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

/** 0-100 -> "73%", "3%", "0.4%", "<0.1%". */
function pctText(v) {
  if (v >= 99.5) return '100%';
  if (v >= 1) return Math.round(v) + '%';
  if (v >= 0.1) return v.toFixed(1) + '%';
  return '<0.1%';
}

function listJoin(items) {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function svgEl(tag, attrs = {}, ...kids) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) n.setAttribute(k, String(v));
  for (const k of kids) if (k != null) n.append(k);
  return n;
}

function svgText(attrs, text) {
  const t = svgEl('text', attrs);
  t.textContent = text;
  return t;
}

function wrapLabel(measure, text, font, maxW, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (line && measure(test, font) > maxW) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const keep = lines.slice(0, maxLines);
  let last = keep[maxLines - 1] + ' ' + lines.slice(maxLines).join(' ');
  while (last.length > 1 && measure(last + '…', font) > maxW) last = last.slice(0, -1);
  keep[maxLines - 1] = last.trimEnd() + '…';
  return keep;
}

function resolveContent(content = {}) {
  const C = { ...FALLBACK, ...content };
  for (const k of ['header', 'seats', 'stats', 'diagram', 'toasts', 'quote', 'card', 'share', 'yeshid', 'cta']) C[k] = { ...FALLBACK[k], ...(content[k] || {}) };
  C.header.legend = { ...FALLBACK.header.legend, ...(content.header?.legend || {}) };
  C.stats.mini = { ...FALLBACK.stats.mini, ...(content.stats?.mini || {}) };
  C.quote.totals = { ...FALLBACK.quote.totals, ...(content.quote?.totals || {}) };
  C.quote.timeline = { ...FALLBACK.quote.timeline, ...(content.quote?.timeline || {}) };
  C.quote.head = { ...FALLBACK.quote.head, ...(content.quote?.head || {}) };
  for (const k of ['components', 'categories', 'tiers', 'verdicts']) if (!Array.isArray(C[k]) || !C[k].length) C[k] = FALLBACK[k];
  for (const k of ['hidden', 'chaos', 'presets', 'startWith']) if (!Array.isArray(C[k])) C[k] = FALLBACK[k];
  if (!Array.isArray(C.diagram.levels) || !C.diagram.levels.length) C.diagram.levels = FALLBACK.diagram.levels;
  // Categories referenced by components but missing from the list still get a lane.
  const known = new Set(C.categories.map((c) => c.id));
  for (const comp of C.components) {
    if (!known.has(comp.category)) {
      known.add(comp.category);
      C.categories = C.categories.concat({ id: comp.category, name: comp.category, blurb: '' });
    }
  }
  C.categories = C.categories.map((c, i) => ({ ...c, color: c.color || CAT_COLORS[i % CAT_COLORS.length] }));
  return C;
}

/* ---------------------------------------------------------------- model */

function createModel(C) {
  const catIndex = new Map(C.categories.map((c, i) => [c.id, i]));
  const comps = C.components.map((c, i) => ({ ...c, requires: (c.requires || []).filter((r) => r !== c.id), order: i }));
  const byId = new Map(comps.map((c) => [c.id, c]));
  const cat = new Map(C.categories.map((c) => [c.id, c]));

  /** ids plus everything they (transitively) require */
  function closure(ids) {
    const out = new Set();
    const visit = (id) => {
      if (out.has(id) || !byId.has(id)) return;
      out.add(id);
      for (const r of byId.get(id).requires) visit(r);
    };
    ids.forEach(visit);
    return out;
  }

  /** selected components that transitively depend on id */
  function dependents(id, selected) {
    const out = new Set();
    let grew = true;
    while (grew) {
      grew = false;
      for (const s of selected) {
        if (s === id || out.has(s)) continue;
        const req = byId.get(s)?.requires || [];
        if (req.includes(id) || req.some((r) => out.has(r))) {
          out.add(s);
          grew = true;
        }
      }
    }
    return out;
  }

  function ordered(selected) {
    return comps
      .filter((c) => selected.has(c.id))
      .sort((a, b) => (catIndex.get(a.category) ?? 99) - (catIndex.get(b.category) ?? 99) || a.order - b.order);
  }

  return { comps, byId, cat, closure, dependents, ordered };
}

const appsFor = (seats) => clamp(Math.round(8 + Math.sqrt(seats) * 1.6), 10, 400);
const seatBonus = (seats) => Math.max(0, Math.floor(Math.log10(Math.max(1, seats / 25)) * 1.5));

function annualFor(c, seats, apps) {
  const p = c.pricing || {};
  if (p.perSeat) return p.perSeat * seats * 12;
  if (p.perApp) return p.perApp * apps;
  return p.flat || 0;
}

/** Everything the stats panel, diagram and quote need, derived from (selection, seats). */
function computeStats(M, C, selected, seats) {
  const apps = appsFor(seats);
  const sizeScale = clamp(0.6 + Math.log10(Math.max(1, seats / 25)) * 0.35, 0.6, 1.8);
  const groupScale = 0.35 + Math.log10(seats) * 0.3;
  const list = M.ordered(selected);
  let annual = 0;
  let oneTime = 0;
  let monthsSum = 0;
  let consultants = 0;
  let groups = 0;
  let terraform = 0;
  let sanity = 1;
  const lines = [];
  for (const c of list) {
    const a = annualFor(c, seats, apps);
    const o = Math.round(((c.oneTime || 0) * sizeScale) / 500) * 500;
    annual += a;
    oneTime += o;
    monthsSum += c.months || 0;
    consultants += c.consultants || 0;
    groups += (c.groups || 0) * groupScale;
    terraform += c.terraform || 0;
    sanity *= 1 - (c.sanity || 0) / 100;
    lines.push({ c, annual: a, oneTime: o });
  }
  const score = list.length + seatBonus(seats);
  const chaos = list.length ? C.chaos.filter((x) => score >= (x.at ?? 99)) : [];
  for (const x of chaos) {
    const e = x.effects || {};
    monthsSum += e.months || 0;
    consultants += e.consultants || 0;
    groups += e.groups || 0;
    terraform += e.terraform || 0;
    sanity *= 1 - (e.sanity || 0) / 100;
  }
  const months = list.length ? Math.max(1, Math.round(1 + monthsSum * 0.6)) : 0;
  const goLive = list.length ? 97 * Math.exp(-(months / 15) - consultants / 14 - chaos.length * 0.18) : 100;
  return {
    seats,
    apps,
    count: list.length,
    annual,
    oneTime,
    months,
    consultants,
    groups: Math.round(groups),
    terraform: Math.round(terraform * (1 + apps / 150)),
    sanity: sanity * 100,
    goLive,
    chaos,
    score,
    entropy: clamp((score - 5) / 30, 0, 1),
    lines,
  };
}

function computeHidden(C, stats, fill, formatNumber) {
  return C.hidden.map((h) => {
    const p = h.pricing || {};
    let amount = 0;
    let desc = h.desc || '';
    let basis = '';
    if (p.pctOfSubscription) {
      amount = (stats.annual * p.pctOfSubscription) / 100;
      basis = `${p.pctOfSubscription}% of subscription`;
    } else if (p.seatMinimum) {
      const rate = p.perSeat || 4;
      if (stats.seats < p.seatMinimum) {
        const ghosts = p.seatMinimum - stats.seats;
        amount = ghosts * rate * 12;
        desc = fill(h.desc, { seats: formatNumber(stats.seats), min: formatNumber(p.seatMinimum), ghosts: formatNumber(ghosts) });
        basis = `${formatNumber(ghosts)} ghost seats × ${priceText(rate)}/mo`;
      } else {
        const extra = Math.max(1, Math.round((stats.seats * (p.overPct || 5)) / 100));
        amount = extra * rate * 12;
        desc = h.descOver || h.desc;
        basis = `${formatNumber(extra)} future seats × ${priceText(rate)}/mo`;
      }
    } else {
      amount = p.flat || 0;
      basis = 'Flat';
    }
    return { ...h, amount: Math.round(amount), desc, basis };
  });
}

const quarterOf = (d) => `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;

/** Months measured from today. Kickoff is always "next quarter". */
function buildTimeline(months, now = new Date()) {
  const MS = 30.4375 * 86400000;
  const earliest = new Date(now.getTime() + 2.5 * MS); // procurement + security questionnaire, at minimum
  let kickoff = new Date(earliest.getFullYear(), Math.floor(earliest.getMonth() / 3) * 3, 1);
  if (kickoff < earliest) kickoff = new Date(kickoff.getFullYear(), kickoff.getMonth() + 3, 1);
  const lead = (kickoff - now) / MS;
  const m = Math.max(1, months);
  const golive = new Date(kickoff.getFullYear(), kickoff.getMonth() + Math.round(m), 1);
  const end = lead + m;
  const span = Math.max(12, Math.ceil(end + Math.max(2, end * 0.08)));
  const renewals = [];
  for (let k = 12; k <= span - 0.5; k += 12) renewals.push(k);
  const years = [];
  for (let y = now.getFullYear() + 1; y < now.getFullYear() + 40; y++) {
    const at = (new Date(y, 0, 1) - now) / MS;
    if (at >= span) break;
    if (at > span * 0.1) years.push({ y, at });
  }
  return { lead, m, end, span, renewals, before: renewals.filter((k) => k < end).length, years, qKick: quarterOf(kickoff), qLive: quarterOf(golive) };
}

/* ---------------------------------------------------------------- diagram layout */

/**
 * Swimlane layout, top to bottom: users, one lane per category, apps. Chaos nodes sit between lanes. Entropy (0..1)
 * then nudges, tilts and overlaps everything, and bends the edges into loops. Deterministic per id, so the diagram
 * drifts a little further each time instead of reshuffling.
 */
function layoutDiagram(o) {
  const W = Math.max(280, Math.round(o.W));
  const n = o.comps.length;
  const narrow = W < 460;
  const compact = Boolean(o.compact);
  const dense = compact || n > 22 || (narrow && n > 14);
  const pad = compact ? 8 : 12;
  const nodeH = compact ? 28 : dense ? 34 : 40;
  const minW = compact ? 104 : narrow ? 118 : dense ? 116 : 134;
  const gapX = compact ? 8 : 10;
  const gapY = compact ? 7 : dense ? 9 : 12;
  const bandHead = compact ? 16 : 20;
  const emptyGap = compact ? 14 : 26;
  const anchorH = compact ? 24 : 30;
  const cols = Math.max(2, Math.floor((W - pad * 2 + gapX) / (minW + gapX)));
  const nodeW = Math.min(182, Math.floor((W - pad * 2 - gapX * (cols - 1)) / cols));
  const font = compact ? 10 : dense ? 10.5 : 11.5;
  const compFont = `600 ${font}px 'Plus Jakarta Sans', sans-serif`;
  const boxes = new Map();
  const bands = [];
  const e = o.entropy;

  const present = o.cats.filter((c) => o.comps.some((x) => x.cat === c.id));
  const boundaries = present.length + 1;
  const chaosW = Math.min(204, Math.max(150, Math.floor(W * (narrow ? 0.5 : 0.42))));
  const chaosH = compact ? 28 : 38;
  const chaosGap = 18;
  // Chaos lives between lanes (never above the users), each on a stable boundary picked from its id.
  const byBoundary = Array.from({ length: boundaries }, () => []);
  const slots = Math.max(1, boundaries - 1);
  for (const c of o.chaos) byBoundary[boundaries > 1 ? 1 + Math.min(slots - 1, Math.floor(o.R('cb:' + c.id)() * slots)) : 0].push(c);
  const perRow = Math.max(1, Math.floor((W - pad * 2 + chaosGap) / (chaosW + chaosGap)));

  let y = pad;
  const anchor = (id, label) => {
    const w = Math.min(W - pad * 2, Math.max(150, o.measure(label, "700 12px 'IBM Plex Mono', monospace") + 40));
    boxes.set(id, { id, kind: 'anchor', x: (W - w) / 2, y, w, h: anchorH, lines: [label], rot: 0 });
    y += anchorH;
  };
  const placeChaos = (b) => {
    const list = byBoundary[b];
    if (!list.length) {
      y += emptyGap;
      return;
    }
    y += compact ? 10 : 16;
    for (let i = 0; i < list.length; i += perRow) {
      const row = list.slice(i, i + perRow);
      const rowW = row.length * chaosW + (row.length - 1) * chaosGap;
      let x = pad + Math.max(0, W - pad * 2 - rowW) * o.R('cx:' + row[0].id)();
      for (const c of row) {
        const st = CHAOS_STYLE[c.style] || CHAOS_STYLE.box;
        const label = (st.mono ? '$ ' : '') + c.label;
        const sizes = st.marker ? [12, 11, 10] : [11, 10, 9];
        let fs = sizes[0];
        for (const size of sizes) {
          fs = size;
          if (o.measure(label, chaosFont(st, size)) <= chaosW - 26) break;
        }
        boxes.set(c.id, {
          id: c.id,
          kind: 'chaos',
          style: c.style || 'box',
          x,
          y,
          w: chaosW,
          h: chaosH,
          lines: wrapLabel(o.measure, label, chaosFont(st, fs), chaosW - 26, 1),
          labelFont: fs,
          note: c.note && !compact ? `(${c.note})` : '',
          rot: (o.R('cr:' + c.id)() - 0.5) * 7,
        });
        x += chaosW + chaosGap;
      }
      y += chaosH + (compact ? 8 : 12);
    }
    y += compact ? 4 : 6;
  };

  anchor('__users', o.usersLabel);
  placeChaos(0);
  present.forEach((cat, bi) => {
    const band = { id: cat.id, name: cat.name, color: cat.color, y0: y };
    y += bandHead;
    const list = o.comps.filter((x) => x.cat === cat.id);
    for (let i = 0; i < list.length; i += cols) {
      const row = list.slice(i, i + cols);
      const rowW = row.length * nodeW + (row.length - 1) * gapX;
      const x0 = (W - rowW) / 2;
      row.forEach((c, k) =>
        boxes.set(c.id, {
          id: c.id,
          kind: 'comp',
          x: x0 + k * (nodeW + gapX),
          y,
          w: nodeW,
          h: nodeH,
          lines: wrapLabel(o.measure, c.label, compFont, nodeW - 20, 2),
          color: cat.color,
          font,
          rot: 0,
        }),
      );
      y += nodeH + gapY;
    }
    y += (compact ? 6 : 8) - gapY;
    band.y1 = y;
    bands.push(band);
    placeChaos(bi + 1);
  });
  anchor('__apps', o.appsLabel);
  y += pad;
  const H = y;

  if (e > 0) {
    for (const b of boxes.values()) {
      if (b.kind === 'anchor') continue;
      const r = o.R('j:' + b.id);
      const k = b.kind === 'chaos' ? 0.8 : 1;
      b.x = clamp(b.x + (r() - 0.5) * 2 * e * b.w * 0.34 * k, 2, W - b.w - 2);
      b.y = clamp(b.y + (r() - 0.5) * 2 * e * b.h * 0.6 * k, 2, H - b.h - 2);
      b.rot += (r() - 0.5) * 2 * e * 6 * k;
    }
  }

  const wob = (key) => {
    const r = o.R('w:' + key);
    return [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, r() * 2 - 1];
  };
  const edges = [];
  const has = (id) => boxes.has(id);
  for (const [from, to] of o.deps) if (has(from) && has(to)) edges.push({ key: `d:${from}>${to}`, from, to, kind: 'dep', color: boxes.get(to).color, w: wob(from + '>' + to) });
  for (const id of o.userLinks) if (has(id)) edges.push({ key: `u:${id}`, from: '__users', to: id, kind: 'anchor', w: wob('u' + id) });
  for (const id of o.appLinks) if (has(id)) edges.push({ key: `a:${id}`, from: id, to: '__apps', kind: 'anchor', w: wob('a' + id) });
  for (const [from, to] of o.chaosLinks) if (has(from) && has(to)) edges.push({ key: `c:${from}>${to}`, from, to, kind: 'chaos', w: wob('c' + from + to) });
  for (const [from, to] of o.undoc) if (has(from) && has(to)) edges.push({ key: `x:${from}>${to}`, from, to, kind: 'undoc', w: wob('x' + from + to) });
  return { W, H, boxes, bands, edges, entropy: e, dense, compact };
}

function chaosFont(st, size) {
  if (st.marker) return `400 ${size + 1}px 'Permanent Marker', cursive`;
  if (st.mono) return `700 ${size}px 'IBM Plex Mono', monospace`;
  return `800 ${size}px 'Plus Jakarta Sans', sans-serif`;
}

/** Cubic edge between two boxes; entropy bends dependency edges gently at first, then into loops. */
function edgeGeom(A, B, e, entropy) {
  const ax = A.x + A.w / 2;
  const ay = A.y + A.h / 2;
  const bx = B.x + B.w / 2;
  const by = B.y + B.h / 2;
  let sx;
  let sy;
  let tx;
  let ty;
  let c1x;
  let c1y;
  let c2x;
  let c2y;
  if (Math.abs(by - ay) > (A.h + B.h) * 0.5) {
    const down = by > ay;
    const fan = clamp((bx - ax) / 420, -1, 1) * 0.32;
    sx = ax + fan * A.w;
    sy = down ? A.y + A.h : A.y;
    tx = bx - fan * B.w;
    ty = down ? B.y : B.y + B.h;
    const k = Math.max(22, Math.abs(ty - sy) * 0.5);
    c1x = sx;
    c1y = sy + (down ? k : -k);
    c2x = tx;
    c2y = ty + (down ? -k : k);
  } else {
    // Same row: a U-turn underneath (sometimes over) both boxes rather than a knot in the gap between them.
    const right = bx >= ax;
    const under = e.w[1] > -0.4;
    sx = ax + (right ? 0.28 : -0.28) * A.w;
    tx = bx + (right ? -0.28 : 0.28) * B.w;
    sy = under ? A.y + A.h : A.y;
    ty = under ? B.y + B.h : B.y;
    const dip = (under ? 1 : -1) * Math.max(18, Math.abs(tx - sx) * 0.22);
    c1x = sx;
    c1y = sy + dip;
    c2x = tx;
    c2y = ty + dip;
  }
  const wild = e.kind === 'chaos' || e.kind === 'undoc';
  const amp = wild ? (e.kind === 'chaos' ? 150 : 190) * Math.max(0.45, entropy) : 125 * (entropy * entropy * 1.1 + entropy * 0.25);
  c1x += e.w[0] * amp;
  c1y += e.w[1] * amp * 0.8;
  c2x += e.w[2] * amp;
  c2y += e.w[3] * amp * 0.8;
  return { sx, sy, c1x, c1y, c2x, c2y, tx, ty };
}

const pathD = (q) => `M${q.sx.toFixed(1)} ${q.sy.toFixed(1)}C${q.c1x.toFixed(1)} ${q.c1y.toFixed(1)} ${q.c2x.toFixed(1)} ${q.c2y.toFixed(1)} ${q.tx.toFixed(1)} ${q.ty.toFixed(1)}`;

/* ---------------------------------------------------------------- SVG renderer (tweened) */

function paintNode(g, b) {
  g.replaceChildren();
  g.setAttribute('class', `sb-node sb-node--${b.kind}${b.style ? ' sb-node--' + b.style : ''}`);
  if (b.kind === 'anchor') {
    g.append(svgEl('rect', { class: 'sb-node__box', width: b.w, height: b.h, rx: b.h / 2 }));
    g.append(svgText({ class: 'sb-node__anchor', x: b.w / 2, y: b.h / 2 + 4, 'text-anchor': 'middle' }, b.lines[0]));
    return;
  }
  if (b.kind === 'comp') {
    g.append(svgEl('rect', { class: 'sb-node__box', width: b.w, height: b.h, rx: 7, style: `stroke:${b.color}` }));
    g.append(svgEl('rect', { x: 5, y: 5, width: 4, height: b.h - 10, rx: 2, fill: b.color }));
    const lh = b.font * 1.18;
    const y0 = b.h / 2 - ((b.lines.length - 1) * lh) / 2 + b.font * 0.36;
    const t = svgEl('text', { class: 'sb-node__label', 'font-size': b.font });
    b.lines.forEach((ln, i) => {
      const s = svgEl('tspan', { x: 15, y: (y0 + i * lh).toFixed(1) });
      s.textContent = ln;
      t.append(s);
    });
    g.append(t);
    return;
  }
  const st = CHAOS_STYLE[b.style] || CHAOS_STYLE.box;
  g.append(svgEl('rect', { class: 'sb-node__box', width: b.w, height: b.h, rx: b.style === 'sticky' ? 2 : 6, fill: st.fill, stroke: st.stroke, 'stroke-dasharray': st.dash ? '5 3' : null }));
  if (b.style === 'sheet') for (let i = 1; i < 4; i++) g.append(svgEl('line', { x1: (b.w * i) / 4, y1: 0, x2: (b.w * i) / 4, y2: b.h, stroke: 'rgba(255,255,255,0.08)' }));
  const label = svgText({ class: `sb-node__chaos${st.mono ? ' is-mono' : ''}${st.marker ? ' is-marker' : ''}`, x: 10, y: b.note ? 16 : b.h / 2 + 4, fill: st.text }, b.lines[0]);
  if (b.labelFont) label.style.fontSize = `${st.marker ? b.labelFont + 1 : b.labelFont}px`;
  g.append(label);
  if (b.note) g.append(svgText({ class: 'sb-node__note', x: 10, y: 30, fill: st.note }, b.note));
  g.append(svgEl('circle', { cx: b.w - 2, cy: 2, r: 7, class: 'sb-node__warn' }));
  g.append(svgText({ class: 'sb-node__bang', x: b.w - 2, y: 5.5, 'text-anchor': 'middle' }, '!'));
}

function createDiagram(host, { reduced, label }) {
  const svg = svgEl('svg', { class: 'sb-svg', role: 'img', 'aria-label': label || 'Architecture diagram', preserveAspectRatio: 'xMidYMin meet' });
  const gBands = svgEl('g', { class: 'sb-bands' });
  const gEdges = svgEl('g', { class: 'sb-edges' });
  const gNodes = svgEl('g', { class: 'sb-nodes' });
  svg.append(gBands, gEdges, gNodes);
  host.append(svg);
  const nodes = new Map();
  const edges = new Map();
  const bands = new Map();
  const DUR = reduced ? 0 : 560;
  let lay = null;
  let raf = 0;
  let t0 = 0;
  const H = { from: 0, to: 0, cur: 0 };
  const E = { from: 0, to: 0, cur: 0 };

  function update(next) {
    lay = next;
    const seen = new Set();
    for (const b of next.boxes.values()) {
      seen.add(b.id);
      const tgt = { x: b.x, y: b.y, r: b.rot, s: 1, o: 1 };
      let rec = nodes.get(b.id);
      if (!rec) {
        rec = { g: svgEl('g'), cur: DUR ? { ...tgt, s: 0.4, o: 0 } : { ...tgt } };
        gNodes.append(rec.g);
        nodes.set(b.id, rec);
      }
      rec.from = { ...rec.cur };
      rec.to = tgt;
      rec.box = b;
      paintNode(rec.g, b);
    }
    for (const [id, rec] of nodes) {
      if (!seen.has(id)) {
        rec.g.remove();
        nodes.delete(id);
      }
    }
    // Chaos nodes and anchors on top of components.
    for (const b of next.boxes.values()) if (b.kind !== 'comp') gNodes.append(nodes.get(b.id).g);

    const seenB = new Set();
    for (const b of next.bands) {
      seenB.add(b.id);
      let rec = bands.get(b.id);
      if (!rec) {
        const rect = svgEl('rect', { class: 'sb-band', x: 4, rx: 10 });
        const text = svgText({ class: 'sb-band__label', x: 14 }, '');
        const g = svgEl('g', {}, rect, text);
        gBands.append(g);
        rec = { g, rect, text, cur: { y0: b.y0, y1: b.y0 + 20 } };
        bands.set(b.id, rec);
      }
      rec.rect.setAttribute('width', next.W - 8);
      rec.rect.style.fill = hexA(b.color, 0.045);
      rec.rect.style.stroke = hexA(b.color, 0.2);
      rec.text.textContent = b.name.toUpperCase();
      rec.text.style.fill = hexA(b.color, 0.85);
      rec.from = { ...rec.cur };
      rec.to = { y0: b.y0, y1: b.y1 };
    }
    for (const [id, rec] of bands) {
      if (!seenB.has(id)) {
        rec.g.remove();
        bands.delete(id);
      }
    }

    const seenE = new Set();
    for (const e of next.edges) {
      seenE.add(e.key);
      let rec = edges.get(e.key);
      if (!rec) {
        rec = { path: svgEl('path', { class: `sb-edge sb-edge--${e.kind}${DUR ? ' is-new' : ''}` }) };
        gEdges.append(rec.path);
        edges.set(e.key, rec);
      }
      rec.e = e;
      if (e.color) rec.path.style.stroke = e.color;
    }
    for (const [k, rec] of edges) {
      if (!seenE.has(k)) {
        rec.path.remove();
        edges.delete(k);
      }
    }
    H.from = H.cur || next.H;
    H.to = next.H;
    E.from = E.cur;
    E.to = next.entropy;
    t0 = performance.now();
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    raf = 0;
    if (!lay) return;
    const p = DUR ? clamp((now - t0) / DUR, 0, 1) : 1;
    const k = easeOut(p);
    for (const rec of nodes.values()) {
      const c = rec.cur;
      const f = rec.from;
      const t = rec.to;
      c.x = lerp(f.x, t.x, k);
      c.y = lerp(f.y, t.y, k);
      c.r = lerp(f.r, t.r, k);
      c.s = lerp(f.s, t.s, k);
      c.o = lerp(f.o, t.o, k);
      const b = rec.box;
      rec.g.setAttribute('transform', `translate(${(c.x + b.w / 2).toFixed(1)} ${(c.y + b.h / 2).toFixed(1)}) rotate(${c.r.toFixed(2)}) scale(${c.s.toFixed(3)}) translate(${(-b.w / 2).toFixed(1)} ${(-b.h / 2).toFixed(1)})`);
      rec.g.style.opacity = c.o < 0.999 ? c.o.toFixed(3) : '';
    }
    for (const rec of bands.values()) {
      rec.cur.y0 = lerp(rec.from.y0, rec.to.y0, k);
      rec.cur.y1 = lerp(rec.from.y1, rec.to.y1, k);
      rec.rect.setAttribute('y', rec.cur.y0.toFixed(1));
      rec.rect.setAttribute('height', Math.max(0, rec.cur.y1 - rec.cur.y0).toFixed(1));
      rec.text.setAttribute('y', (rec.cur.y0 + 14).toFixed(1));
    }
    E.cur = lerp(E.from, E.to, k);
    for (const rec of edges.values()) {
      const A = nodes.get(rec.e.from);
      const B = nodes.get(rec.e.to);
      if (!A || !B) continue;
      rec.path.setAttribute('d', pathD(edgeGeom({ ...A.cur, w: A.box.w, h: A.box.h }, { ...B.cur, w: B.box.w, h: B.box.h }, rec.e, E.cur)));
    }
    H.cur = lerp(H.from, H.to, k);
    svg.setAttribute('viewBox', `0 0 ${lay.W} ${Math.round(H.cur)}`);
    if (p < 1) raf = requestAnimationFrame(frame);
  }

  return {
    update,
    svg,
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lay = null;
    },
  };
}

/* ---------------------------------------------------------------- canvas helpers */

function roundRectPath(g, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + rr, y);
  g.arcTo(x + w, y, x + w, y + h, rr);
  g.arcTo(x + w, y + h, x, y + h, rr);
  g.arcTo(x, y + h, x, y, rr);
  g.arcTo(x, y, x + w, y, rr);
  g.closePath();
}

/** Draws a layout (from layoutDiagram) scaled into box. Labels only where they would still be readable. */
function drawMini(g, lay, box, { labels = true } = {}) {
  const s = Math.min(box.w / lay.W, box.h / lay.H);
  const ox = box.x + (box.w - lay.W * s) / 2;
  const oy = box.y + (box.h - lay.H * s) / 2;
  g.save();
  g.translate(ox, oy);
  g.scale(s, s);
  g.lineCap = 'round';
  for (const b of lay.bands) {
    roundRectPath(g, 4, b.y0, lay.W - 8, b.y1 - b.y0, 10);
    g.fillStyle = hexA(b.color, 0.06);
    g.fill();
    g.setLineDash([4, 4]);
    g.strokeStyle = hexA(b.color, 0.25);
    g.lineWidth = 1;
    g.stroke();
    g.setLineDash([]);
    if (labels && s * 9.5 >= 6.5) {
      g.fillStyle = hexA(b.color, 0.85);
      g.font = "600 9.5px 'IBM Plex Mono', monospace";
      g.textBaseline = 'alphabetic';
      g.textAlign = 'left';
      g.fillText(b.name.toUpperCase(), 14, b.y0 + 14);
    }
  }
  for (const e of lay.edges) {
    const A = lay.boxes.get(e.from);
    const B = lay.boxes.get(e.to);
    if (!A || !B) continue;
    const q = edgeGeom(A, B, e, lay.entropy);
    g.beginPath();
    g.moveTo(q.sx, q.sy);
    g.bezierCurveTo(q.c1x, q.c1y, q.c2x, q.c2y, q.tx, q.ty);
    if (e.kind === 'chaos') {
      g.strokeStyle = hexA(TOK.alarm, 0.85);
      g.setLineDash([6, 4]);
      g.lineWidth = 1.7;
    } else if (e.kind === 'undoc') {
      g.strokeStyle = hexA(TOK.amber, 0.7);
      g.setLineDash([2, 5]);
      g.lineWidth = 1.4;
    } else if (e.kind === 'anchor') {
      g.strokeStyle = hexA(TOK.faint, 0.8);
      g.setLineDash([3, 4]);
      g.lineWidth = 1.2;
    } else {
      g.strokeStyle = hexA(e.color || TOK.dim, 0.6);
      g.setLineDash([]);
      g.lineWidth = 1.6;
    }
    g.stroke();
  }
  g.setLineDash([]);
  const order = [...lay.boxes.values()].sort((a, b) => (a.kind === 'comp' ? 0 : 1) - (b.kind === 'comp' ? 0 : 1));
  for (const b of order) {
    g.save();
    g.translate(b.x + b.w / 2, b.y + b.h / 2);
    g.rotate(rad(b.rot || 0));
    g.translate(-b.w / 2, -b.h / 2);
    if (b.kind === 'anchor') {
      roundRectPath(g, 0, 0, b.w, b.h, b.h / 2);
      g.fillStyle = TOK.bg;
      g.fill();
      g.setLineDash([4, 3]);
      g.strokeStyle = TOK.dim;
      g.lineWidth = 1.2;
      g.stroke();
      g.setLineDash([]);
      if (labels && s * 12 >= 6.5) {
        g.fillStyle = TOK.dim;
        g.font = "700 12px 'IBM Plex Mono', monospace";
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(b.lines[0], b.w / 2, b.h / 2 + 1);
      }
    } else if (b.kind === 'comp') {
      roundRectPath(g, 0, 0, b.w, b.h, 7);
      g.fillStyle = TOK.surface2;
      g.fill();
      g.strokeStyle = b.color;
      g.lineWidth = 1.3;
      g.stroke();
      g.fillStyle = b.color;
      roundRectPath(g, 5, 5, 4, b.h - 10, 2);
      g.fill();
      if (labels && s * b.font >= 6.5) {
        g.fillStyle = TOK.text;
        g.font = `600 ${b.font}px 'Plus Jakarta Sans', sans-serif`;
        g.textAlign = 'left';
        g.textBaseline = 'alphabetic';
        const lh = b.font * 1.18;
        const y0 = b.h / 2 - ((b.lines.length - 1) * lh) / 2 + b.font * 0.36;
        b.lines.forEach((ln, i) => g.fillText(ln, 15, y0 + i * lh));
      }
    } else {
      const st = CHAOS_STYLE[b.style] || CHAOS_STYLE.box;
      roundRectPath(g, 0, 0, b.w, b.h, b.style === 'sticky' ? 2 : 6);
      g.fillStyle = st.fill;
      g.fill();
      g.strokeStyle = st.stroke;
      g.lineWidth = 1.3;
      if (st.dash) g.setLineDash([5, 3]);
      g.stroke();
      g.setLineDash([]);
      if (labels && s * 11 >= 6.5) {
        g.fillStyle = st.text;
        g.font = chaosFont(st, b.labelFont || 11);
        g.textAlign = 'left';
        g.textBaseline = 'alphabetic';
        g.fillText(b.lines[0], 10, b.note ? 16 : b.h / 2 + 4);
        if (b.note) {
          g.fillStyle = st.note;
          g.font = "italic 400 9.5px 'IBM Plex Mono', monospace";
          g.fillText(b.note, 10, 30);
        }
      }
      g.fillStyle = TOK.alarm;
      g.beginPath();
      g.arc(b.w - 2, 2, 7, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff';
      g.font = "800 10px 'Plus Jakarta Sans', sans-serif";
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('!', b.w - 2, 2.5);
    }
    g.restore();
  }
  g.restore();
}

function drawStampCanvas(g, text, cx, cy, rot, color, size) {
  const label = String(text).toUpperCase();
  const off = document.createElement('canvas');
  const o = off.getContext('2d');
  o.font = `400 ${size}px Anton, Impact, sans-serif`;
  const w = o.measureText(label).width + size * 0.95;
  const h = size * 1.55;
  off.width = Math.ceil(w + 16);
  off.height = Math.ceil(h + 16);
  o.strokeStyle = color;
  o.fillStyle = color;
  o.lineWidth = size * 0.1;
  roundRectPath(o, 8, 8, w, h, size * 0.2);
  o.stroke();
  o.lineWidth = size * 0.04;
  roundRectPath(o, 8 + size * 0.17, 8 + size * 0.17, w - size * 0.34, h - size * 0.34, size * 0.12);
  o.stroke();
  o.font = `400 ${size}px Anton, Impact, sans-serif`;
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.fillText(label, 8 + w / 2, 8 + h / 2 + size * 0.04);
  o.globalCompositeOperation = 'destination-out';
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < (off.width * off.height) / 40; i++) {
    o.globalAlpha = rnd() * 0.75;
    o.fillRect(rnd() * off.width, rnd() * off.height, 1 + rnd() * 2.4, 1 + rnd() * 1.8);
  }
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  g.globalAlpha = 0.92;
  g.drawImage(off, -off.width / 2, -off.height / 2);
  g.restore();
}

/* ---------------------------------------------------------------- module */

export default {
  id: 'solution-builder',
  kind: 'toy',
  title: 'Build Your Own Oktholm™ Solution',
  blurb: 'Configure the identity platform of your nightmares. Watch the diagram turn into spaghetti.',
  emoji: '🏗️',
  minutes: '3 min',
  therapy: 'Treats: Enterprise Architecture Envy',

  mount(root, ctx) {
    const d = ctx.dom.disposer();
    const { el, fill, formatNumber } = ctx.dom;
    const C = resolveContent(ctx.content);
    const M = createModel(C);
    const H = C.header;
    const S = C.stats;
    const D = C.diagram;
    const T = C.toasts;
    // Sponsor facts, minus any clause that names a term the brand never says (content: yeshid.neverSay).
    const neverSay = (C.yeshid.neverSay || []).filter(Boolean).map((t) => new RegExp('\\b' + String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i'));
    const safeFact = (text) => {
      if (!text || !neverSay.some((re) => re.test(text))) return text || '';
      const kept = String(text)
        .replace(/[.\s]+$/, '')
        .split(/,\s+and\s+|;\s+|,\s+but\s+/)
        .filter((clause) => !neverSay.some((re) => re.test(clause)));
      return kept.length ? kept.join(', ') + '.' : '';
    };
    const facts = Object.fromEntries(Object.entries(ctx.brand.sponsor?.facts || {}).map(([k, v]) => [k, safeFact(v)]));
    const reduced = ctx.dom.prefersReducedMotion();
    const R = (key) => ctx.rng.seeded('sb:' + key);
    const mctx = document.createElement('canvas').getContext('2d');
    const measure = (text, font) => {
      mctx.font = font;
      return mctx.measureText(text).width;
    };
    let alive = true;
    d(() => (alive = false));

    const SMIN = Math.max(1, C.seats.min || 25);
    const SMAX = Math.max(SMIN + 1, C.seats.max || 25000);
    const niceSeats = (x) => {
      const r = x < 100 ? 5 : x < 1000 ? 25 : x < 10000 ? 250 : 500;
      return clamp(Math.round(x / r) * r, SMIN, SMAX);
    };
    const toSlider = (s) => Math.round((1000 * Math.log(s / SMIN)) / Math.log(SMAX / SMIN));
    const fromSlider = (v) => niceSeats(SMIN * Math.pow(SMAX / SMIN, v / 1000));
    const tierFor = (s) => C.tiers.find((t) => s <= t.max) || C.tiers[C.tiers.length - 1];
    const catOf = (id) => M.cat.get(id) || { name: id, color: TOK.dim };
    const nameOf = (id) => M.byId.get(id)?.name || id;
    const shortOf = (id) => M.byId.get(id)?.short || nameOf(id);
    const chaosName = (x) => (x.note ? `${x.label} (${x.note})` : x.label);

    // Stable pseudo-random structure: which components each chaos node latches onto, and the undocumented links.
    const allIds = M.comps.map((c) => c.id);
    const chaosOrder = new Map(C.chaos.map((x) => [x.id, R('ct:' + x.id).shuffle(allIds)]));
    const undocOrder = (() => {
      const pairs = [];
      for (const a of allIds) for (const b of allIds) if (a !== b) pairs.push([a, b]);
      return R('undoc').shuffle(pairs);
    })();

    /* ----- state ----- */
    const saved = ctx.store.get('config', null);
    let seats = niceSeats(Number(saved?.seats) || C.seats.default || 500);
    let selected = M.closure(Array.isArray(saved?.selected) ? saved.selected : C.startWith);
    let stats = computeStats(M, C, selected, seats);
    let chaosSeen = new Set(stats.chaos.map((x) => x.id));
    let version = 1;
    let quotedOnce = false;
    let quoteToken = 0;

    function chaChing(big) {
      ctx.sfx.noise(0.05, { gain: 0.16, freq: 2600, q: 1.4 });
      ctx.sfx.tone(1568, 0.09, { type: 'triangle', gain: 0.06, delay: 0.05 });
      ctx.sfx.tone(2093, 0.24, { type: 'triangle', gain: 0.06, delay: 0.12 });
      if (big) ctx.sfx.tone(2637, 0.28, { type: 'triangle', gain: 0.05, delay: 0.2 });
    }

    /* ----- header + controls ----- */
    const seatsOut = el('output.sb-seats__n');
    const tierOut = el('div.sb-seats__tier');
    const sliderId = `sb-seats-${Math.random().toString(36).slice(2, 7)}`;
    const slider = el('input.sb-range', { type: 'range', id: sliderId, min: 0, max: 1000, step: 1 });
    slider.value = String(toSlider(seats));
    const scaleMarks = [SMIN, SMIN * Math.pow(SMAX / SMIN, 1 / 3), SMIN * Math.pow(SMAX / SMIN, 2 / 3), SMAX].map((v) => el('span', formatNumber(niceSeats(v))));
    const presetBtns = C.presets.map((p) => el('button.btn.btn--ghost.btn--sm.sb-preset', { type: 'button', onclick: () => applyPreset(p) }, p.name));
    const resetBtn = el('button.btn.btn--ghost.btn--sm.sb-reset', { type: 'button', onclick: () => reset() }, H.reset);

    const controls = el(
      'section.sb-controls.card',
      el(
        'div.sb-seats',
        el('div.sb-seats__head', el('label.sb-label', { for: sliderId }, H.seats), el('div.sb-seats__val', seatsOut, ' ', el('span.sb-seats__unit', H.seatsUnit))),
        slider,
        el('div.sb-seats__scale', { 'aria-hidden': 'true' }, scaleMarks),
        tierOut,
      ),
      C.presets.length ? el('div.sb-presets', el('div.sb-label', H.presets), el('div.sb-presets__row', presetBtns, resetBtn)) : null,
    );

    /* ----- diagram ----- */
    const diagVersion = el('span.sb-diag__version');
    const diagComplexity = el('span.sb-diag__complexity');
    const viewport = el('div.sb-diag__viewport');
    const legend = el(
      'div.sb-diag__legend',
      { 'aria-hidden': 'true' },
      el('span.sb-leg.sb-leg--dep', H.legend.dep),
      el('span.sb-leg.sb-leg--undoc', H.legend.undoc),
      el('span.sb-leg.sb-leg--chaos', H.legend.chaos),
    );
    const diagramCard = el(
      'section.sb-diag.card',
      el('header.sb-diag__head', el('div', el('div.kicker', D.title, ' ', diagVersion)), diagComplexity),
      viewport,
      legend,
    );
    const diagram = createDiagram(viewport, { reduced, label: D.title });
    d(() => diagram.destroy());

    /* ----- catalog ----- */
    const cards = new Map();
    const catCounts = new Map();
    function priceLabel(c) {
      const p = c.pricing || {};
      if (p.perSeat) return fill(H.perSeat, { price: priceText(p.perSeat) });
      if (p.perApp) return fill(H.perApp, { price: priceText(p.perApp) });
      if (p.flat) return fill(H.flat, { price: priceText(p.flat) });
      return H.included;
    }
    function compCard(c) {
      const cat = catOf(c.category);
      const btn = el(
        'button.sb-comp',
        { type: 'button', 'aria-pressed': 'false', onclick: () => toggle(c.id) },
        el('span.sb-comp__check', { 'aria-hidden': 'true' }),
        el(
          'span.sb-comp__body',
          el('span.sb-comp__name', c.name),
          el('span.sb-comp__desc', c.desc),
          el(
            'span.sb-comp__meta',
            el('span.sb-comp__price', priceLabel(c)),
            c.oneTime ? el('span.sb-comp__setup', fill(H.services, { amount: usd(c.oneTime) })) : null,
            c.requires.length ? el('span.sb-comp__req', fill(H.requires, { list: listJoin(c.requires.map(shortOf)) })) : null,
          ),
        ),
      );
      btn.style.setProperty('--c', cat.color);
      cards.set(c.id, btn);
      return btn;
    }
    const catalog = el(
      'section.sb-catalog',
      el('header.sb-catalog__head', el('h3.sb-h3', H.catalog), el('p.sb-catalog__note', H.catalogNote)),
      C.categories.map((cat) => {
        const comps = M.comps.filter((c) => c.category === cat.id);
        if (!comps.length) return null;
        const count = el('span.sb-cat__count');
        catCounts.set(cat.id, { count, total: comps.length });
        const sec = el(
          'section.sb-cat',
          el('header.sb-cat__head', el('h4.sb-cat__name', cat.name), cat.blurb ? el('span.sb-cat__blurb', cat.blurb) : null, count),
          el('div.sb-cat__grid', comps.map(compCard)),
        );
        sec.style.setProperty('--c', cat.color);
        return sec;
      }),
    );

    /* ----- stats (sticky aside on desktop, bottom bar on mobile) ----- */
    const counters = new Map();
    let counterRaf = 0;
    function out(key, node, fmt) {
      if (!counters.has(key)) counters.set(key, { from: 0, to: 0, cur: 0, t0: 0, outs: [], bars: [] });
      counters.get(key).outs.push({ node, fmt });
    }
    function bar(key, node) {
      counters.get(key).bars.push(node);
    }
    function paintCounter(c) {
      for (const o of c.outs) o.node.textContent = o.fmt(c.cur);
      for (const b of c.bars) {
        b.style.width = `${clamp(c.cur, 0, 100).toFixed(1)}%`;
        b.dataset.level = c.cur >= 50 ? 'ok' : c.cur >= 15 ? 'warn' : 'bad';
      }
    }
    function setCounters(values, animate) {
      const now = performance.now();
      for (const [key, v] of Object.entries(values)) {
        const c = counters.get(key);
        if (!c) continue;
        c.from = c.cur;
        c.to = v;
        c.t0 = now;
        if (!animate) {
          c.cur = v;
          paintCounter(c);
        }
      }
      if (animate && !counterRaf) counterRaf = requestAnimationFrame(stepCounters);
    }
    function stepCounters(now) {
      counterRaf = 0;
      let busy = false;
      for (const c of counters.values()) {
        if (c.cur === c.to) continue;
        const p = clamp((now - c.t0) / 650, 0, 1);
        c.cur = p >= 1 ? c.to : lerp(c.from, c.to, easeOut(p));
        paintCounter(c);
        if (p < 1) busy = true;
      }
      if (busy && alive) counterRaf = requestAnimationFrame(stepCounters);
    }
    d(() => counterRaf && cancelAnimationFrame(counterRaf));

    const statDefs = [
      ['annual', S.annual, usd, 'big'],
      ['oneTime', S.oneTime, usd],
      ['months', S.months, (v) => `${Math.round(v)} ${S.monthsUnit}`],
      ['consultants', S.consultants, (v) => formatNumber(v)],
      ['groups', S.groups, (v) => formatNumber(v)],
      ['terraform', S.terraform, (v) => formatNumber(v)],
      ['sanity', S.sanity, pctText, 'bar'],
      ['goLive', S.golive, pctText, 'bar'],
    ];
    const statsList = el(
      'dl.sb-stats__list',
      statDefs.map(([key, label, fmt, mod]) => {
        const dd = el('dd.sb-stat__v');
        const fillBar = mod === 'bar' ? el('i') : null;
        const row = el('div.sb-stat' + (mod ? '.sb-stat--' + mod : ''), el('dt.sb-stat__k', label), dd, fillBar ? el('span.sb-stat__bar', fillBar) : null);
        out(key, dd, fmt);
        if (fillBar) bar(key, fillBar);
        return row;
      }),
    );
    const miniAnnual = el('b.sb-mini__annual');
    const miniMonths = el('span.sb-mini__item');
    const miniGo = el('span.sb-mini__item.sb-mini__go');
    out('annual', miniAnnual, (v) => usdCompact(v) + S.mini.annual);
    out('months', miniMonths, (v) => `${Math.round(v)} ${S.mini.months}`);
    out('goLive', miniGo, (v) => `${pctText(v)} ${S.mini.golive}`);
    const skuCount = el('span.sb-stats__skus');
    const quoteBtn = el('button.btn.btn--amber.btn--block.btn--lg.sb-stats__quote', { type: 'button', onclick: () => showQuote() }, S.quote);
    const miniQuote = el('button.btn.btn--amber.btn--sm.sb-mini__quote', { type: 'button', onclick: () => showQuote() }, S.quote);
    const aside = el('aside.sb-stats', { 'aria-label': S.title });
    const miniToggle = el(
      'button.sb-mini__toggle',
      {
        type: 'button',
        'aria-expanded': 'false',
        onclick: () => {
          const open = !aside.classList.contains('is-open');
          aside.classList.toggle('is-open', open);
          miniToggle.setAttribute('aria-expanded', String(open));
          miniToggle.textContent = open ? S.hide : S.details;
          ctx.sfx.click();
        },
      },
      S.details,
    );
    aside.append(
      el('div.sb-mini', el('div.sb-mini__nums', miniAnnual, miniMonths, miniGo), miniToggle, miniQuote),
      el('div.sb-stats__panel', el('header.sb-stats__head', el('span.kicker', S.title), skuCount), statsList, el('p.sb-stats__fees', S.fees), quoteBtn),
    );

    const bottomQuote = el('button.btn.btn--amber.btn--lg', { type: 'button', onclick: () => showQuote() }, S.quote);
    const builder = el('div.sb-builder', el('div.sb-main', controls, diagramCard, catalog, el('div.sb-bottom', bottomQuote)), aside);
    const quoteView = el('div.sb-quoteview', { hidden: true });
    const wrap = el('div.sb', el('header.sb-head', el('div.kicker.kicker--amber', H.kicker), el('h2.display.sb-title', H.title), el('p.sb-sub', H.sub)), builder, quoteView);
    root.append(wrap);

    /* ----- diagram model ----- */
    function fitLayout(box, sel, st) {
      let best = null;
      let bestScale = 0;
      for (let Wv = 420; Wv <= 980; Wv += 40) {
        const lay = diagramLayout(Wv, sel, st, true);
        const sc = Math.min(box.w / lay.W, box.h / lay.H);
        if (sc > bestScale) {
          bestScale = sc;
          best = lay;
        }
      }
      return best;
    }

    function diagramLayout(W, sel = selected, st = stats, compact = false) {
      const list = M.ordered(sel);
      const deps = [];
      for (const c of list) for (const r of c.requires) if (sel.has(r)) deps.push([r, c.id]);
      const coreRoots = list.filter((c) => !c.requires.some((r) => sel.has(r)));
      const userLinks = sel.has('login') ? ['login'] : coreRoots.slice(0, 2).map((c) => c.id);
      const appLinks = list.filter((c) => c.apps).map((c) => c.id);
      const k = 2 + Math.round(st.entropy * 3);
      const chaosLinks = [];
      for (const x of st.chaos) for (const id of (chaosOrder.get(x.id) || []).filter((cid) => sel.has(cid)).slice(0, k)) chaosLinks.push([x.id, id]);
      const undoc = [];
      const want = st.entropy > 0.3 ? Math.round((st.entropy - 0.3) * list.length * 0.8) : 0;
      if (want) {
        const depKeys = new Set(deps.map(([a, b]) => a + '>' + b));
        for (const [a, b] of undocOrder) {
          if (undoc.length >= want) break;
          if (sel.has(a) && sel.has(b) && !depKeys.has(a + '>' + b) && !depKeys.has(b + '>' + a)) undoc.push([a, b]);
        }
      }
      return layoutDiagram({
        W,
        comps: list.map((c) => ({ id: c.id, label: c.short || c.name, cat: c.category })),
        cats: C.categories,
        chaos: st.chaos,
        deps,
        userLinks,
        appLinks,
        chaosLinks,
        undoc,
        entropy: st.entropy,
        usersLabel: fill(D.users, { seats: formatNumber(st.seats) }),
        appsLabel: fill(D.apps, { apps: formatNumber(st.apps) }),
        measure,
        R,
        compact,
      });
    }
    const complexityLabel = (e) => (D.levels.find((l) => e <= l.max) || D.levels[D.levels.length - 1]).label;

    let lastW = 0;
    let diagRaf = 0;
    function renderDiagram() {
      diagRaf = 0;
      if (!alive || builder.hidden) return;
      const w = Math.round(viewport.clientWidth);
      if (w < 120) return;
      lastW = w;
      const lay = diagramLayout(w);
      diagram.update(lay);
      diagram.svg.setAttribute('aria-label', `${D.title}: ${stats.count} components, ${stats.chaos.length} unplanned additions, ${lay.edges.length} connections.`);
      diagVersion.textContent = fill(D.version, { n: version });
      diagComplexity.textContent = fill(D.complexity, { label: complexityLabel(stats.entropy) });
      diagComplexity.dataset.level = stats.entropy > 0.62 ? 'bad' : stats.entropy > 0.2 ? 'warn' : 'ok';
    }
    const scheduleDiagram = () => {
      if (!diagRaf) diagRaf = requestAnimationFrame(renderDiagram);
    };
    d(() => diagRaf && cancelAnimationFrame(diagRaf));
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(() => {
        const w = Math.round(viewport.clientWidth);
        if (w >= 120 && Math.abs(w - lastW) > 4) scheduleDiagram();
      });
      ro.observe(viewport);
      d(() => ro.disconnect());
    } else d.on(window, 'resize', scheduleDiagram);

    /* ----- render ----- */
    function renderAll(animate) {
      for (const [id, btn] of cards) {
        const on = selected.has(id);
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-pressed', String(on));
      }
      for (const [catId, { count, total }] of catCounts) {
        const n = M.comps.filter((c) => c.category === catId && selected.has(c.id)).length;
        count.textContent = `${n}/${total}`;
        count.classList.toggle('is-some', n > 0);
      }
      seatsOut.textContent = formatNumber(seats);
      const tier = tierFor(seats);
      tierOut.textContent = fill(H.tier, { tier: tier.name, note: tier.note });
      skuCount.textContent = fill(stats.count === 1 && S.skuOne ? S.skuOne : S.skus, { n: stats.count });
      const empty = stats.count === 0;
      for (const b of [quoteBtn, miniQuote, bottomQuote]) b.disabled = empty;
      setCounters(
        {
          annual: stats.annual,
          oneTime: stats.oneTime,
          months: stats.months,
          consultants: stats.consultants,
          groups: stats.groups,
          terraform: stats.terraform,
          sanity: stats.sanity,
          goLive: stats.goLive,
        },
        animate && !reduced,
      );
      scheduleDiagram();
    }

    function changed({ silentChaos = false } = {}) {
      version++;
      stats = computeStats(M, C, selected, seats);
      const fresh = stats.chaos.filter((x) => !chaosSeen.has(x.id));
      chaosSeen = new Set(stats.chaos.map((x) => x.id));
      if (fresh.length && !silentChaos) {
        ctx.ui.toast(fill(T.chaos, { name: chaosName(fresh[fresh.length - 1]) }), { kind: 'bad', icon: '🍝' });
      }
      renderAll(true);
      ctx.store.set('config', { seats, selected: [...selected] });
    }

    function toggle(id) {
      const c = M.byId.get(id);
      if (!c) return;
      if (selected.has(id)) {
        const deps = [...M.dependents(id, selected)];
        if (deps.length) {
          ctx.sfx.bad();
          const names = deps.map(nameOf);
          ctx.ui.modal({
            title: fill(T.loadBearingTitle, { short: c.short || c.name }),
            body: fill(T.loadBearingBody, { name: c.name, count: `${deps.length} component${deps.length === 1 ? '' : 's'}`, list: listJoin(names) }),
            actions: [
              {
                label: fill(T.loadBearingConfirm, { n: deps.length + 1 }),
                kind: 'alarm',
                onClick: () => {
                  selected.delete(id);
                  deps.forEach((x) => selected.delete(x));
                  ctx.sfx.whack();
                  changed();
                },
              },
              { label: T.loadBearingCancel, kind: 'ghost' },
            ],
          });
          return;
        }
        selected.delete(id);
        ctx.sfx.click();
        changed();
        return;
      }
      const missing = [...M.closure([id])].filter((x) => x !== id && !selected.has(x));
      selected.add(id);
      missing.forEach((x) => selected.add(x));
      chaChing(missing.length > 0);
      if (missing.length) ctx.ui.toast(fill(T.requires, { name: c.name, deps: listJoin(missing.map(nameOf)) }), { icon: '🧾' });
      ctx.track('solution_add', { component: id, auto: missing.length });
      changed();
    }

    function applyPreset(p) {
      const asked = (p.components === 'all' ? M.comps.filter((c) => !(p.exclude || []).includes(c.category)).map((c) => c.id) : p.components || []).filter((id) => M.byId.has(id));
      selected = M.closure(asked);
      if (p.seats) seats = niceSeats(p.seats);
      slider.value = String(toSlider(seats));
      const extra = selected.size - asked.length;
      chaChing(true);
      ctx.ui.toast(
        extra > 0
          ? fill(T.preset, { preset: p.name, asked: `${asked.length} SKU${asked.length === 1 ? '' : 's'}`, extra })
          : fill(T.presetNoExtra, { preset: p.name, n: selected.size }),
        { icon: '🧾' },
      );
      ctx.track('solution_preset', { preset: p.id });
      changed({ silentChaos: true });
    }

    function reset() {
      selected = M.closure(C.startWith);
      ctx.sfx.click();
      ctx.ui.toast(T.reset);
      changed({ silentChaos: true });
    }

    let seatRaf = 0;
    d.on(slider, 'input', () => {
      seats = fromSlider(Number(slider.value));
      seatsOut.textContent = formatNumber(seats);
      if (!seatRaf) {
        seatRaf = requestAnimationFrame(() => {
          seatRaf = 0;
          if (alive) changed();
        });
      }
    });
    d(() => seatRaf && cancelAnimationFrame(seatRaf));

    /* ----- quote ----- */
    function buildQuote() {
      const st = computeStats(M, C, selected, seats);
      const hidden = computeHidden(C, st, fill, formatNumber);
      const hiddenTotal = sumBy(hidden, (h) => h.amount);
      const annual = st.annual + hiddenTotal;
      const verdict = C.verdicts.find((v) => st.goLive >= (v.min ?? 0)) || C.verdicts[C.verdicts.length - 1];
      return {
        st,
        sel: new Set(selected),
        hidden,
        totals: { subscription: st.annual, hiddenTotal, annual, oneTime: st.oneTime, year1: annual + st.oneTime, tco: annual * (1 + 1.09 + 1.09 * 1.09) + st.oneTime },
        verdict,
        tl: buildTimeline(st.months),
        number: `${C.quote.numberPrefix}-${new Date().getFullYear()}-${ctx.rng.random.int(10000, 99999)}`,
        tier: tierFor(seats),
        version,
        complexity: complexityLabel(st.entropy),
      };
    }

    function vars(q) {
      return {
        annual: usdCompact(q.totals.annual),
        months: q.st.months,
        consultants: formatNumber(q.st.consultants),
        consultantsText: `${formatNumber(q.st.consultants)} consultant${q.st.consultants === 1 ? '' : 's'}`,
        skusText: `${q.st.count} SKU${q.st.count === 1 ? '' : 's'}`,
        chaosText: `${q.st.chaos.length} surprise${q.st.chaos.length === 1 ? '' : 's'}`,
        groups: formatNumber(q.st.groups),
        terraform: formatNumber(q.st.terraform),
        golive: pctText(q.st.goLive),
        skus: q.st.count,
        chaos: q.st.chaos.length,
        hiddenCount: q.hidden.length,
        seats: formatNumber(q.st.seats),
        apps: formatNumber(q.st.apps),
        number: q.number,
      };
    }

    function showQuote() {
      if (!selected.size) {
        ctx.sfx.bad();
        ctx.ui.toast(T.empty, { kind: 'bad' });
        return;
      }
      const q = buildQuote();
      builder.hidden = true;
      quoteView.hidden = false;
      renderQuote(q);
      quoteView.querySelector('.sb-q__title')?.focus({ preventScroll: true });
      ctx.sfx.stamp();
      wrap.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      if (!quotedOnce) {
        quotedOnce = true;
        ctx.referral.grantChip('architect');
        ctx.referral.qualify('solution-builder');
      }
      ctx.track('solution_quote', { skus: q.st.count, seats: q.st.seats, annual: Math.round(q.totals.annual) });
    }

    function backToBuilder() {
      quoteToken++;
      quoteView.hidden = true;
      quoteView.replaceChildren();
      builder.hidden = false;
      ctx.sfx.click();
      lastW = 0;
      scheduleDiagram();
      wrap.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }

    function basisText(c, st) {
      const p = c.pricing || {};
      const Q = C.quote;
      if (p.perSeat) return fill(Q.perSeat, { price: priceText(p.perSeat), seats: formatNumber(st.seats) });
      if (p.perApp) return fill(Q.perApp, { price: priceText(p.perApp), apps: formatNumber(st.apps) });
      if (p.flat) return Q.flat;
      return c.oneTime ? Q.servicesOnly : Q.included;
    }

    function ganttEl(tl) {
      const TL = C.quote.timeline;
      const pos = (v) => `${((v / tl.span) * 100).toFixed(2)}%`;
      const rows = [{ name: TL.procurement, start: 0, len: tl.lead, kind: 'proc' }];
      let at = tl.lead;
      for (const ph of TL.phases) {
        const len = (ph.share || 0) * tl.m;
        rows.push({ name: ph.name, start: at, len });
        at += len;
      }
      return el(
        'div.sb-gantt',
        el('div.sb-gantt__labels', rows.map((r) => el('div.sb-gantt__label', r.name))),
        el(
          'div.sb-gantt__chart',
          rows.map((r, i) => {
            const b = el('span.sb-gantt__bar' + (r.kind ? '.sb-gantt__bar--' + r.kind : ''));
            b.style.left = pos(r.start);
            b.style.width = `max(5px, ${pos(r.len)})`;
            if (!reduced) b.style.animationDelay = `${200 + i * 90}ms`;
            return el('div.sb-gantt__row', b);
          }),
          tl.renewals.map((m, i) => {
            const mk = el('div.sb-gantt__mark.sb-gantt__mark--renewal', el('span', { dataset: { short: 'R' + (i + 1) } }, fill(TL.renewal, { n: i + 1 })));
            mk.style.left = pos(m);
            if (m / tl.span > 0.7) mk.classList.add('is-flip');
            return mk;
          }),
          (() => {
            const mk = el('div.sb-gantt__mark.sb-gantt__mark--golive', el('span', TL.golivePin));
            mk.style.left = pos(tl.end);
            if (tl.end / tl.span > 0.7) mk.classList.add('is-flip');
            return mk;
          })(),
          el('div.sb-gantt__axis', el('span.sb-gantt__today', TL.today), tl.years.map((y) => {
            const s = el('span' + (y.at / tl.span < 0.24 ? '.is-near' : ''), String(y.y));
            s.style.left = pos(y.at);
            return s;
          })),
        ),
      );
    }

    function tweenText(node, from, to, fmt, ms, token) {
      if (reduced || ms <= 0) {
        node.textContent = fmt(to);
        return;
      }
      const t0 = performance.now();
      const step = (now) => {
        if (!alive || token !== quoteToken) return;
        const p = clamp((now - t0) / ms, 0, 1);
        node.textContent = fmt(lerp(from, to, easeOut(p)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    function renderQuote(q) {
      const token = ++quoteToken;
      const Q = C.quote;
      const TT = Q.totals;
      const TL = Q.timeline;
      const v = vars(q);
      const back = () => el('button.btn.btn--ghost.btn--sm.sb-back', { type: 'button', onclick: backToBuilder }, '‹ ' + Q.back);

      const rows = q.st.lines.map(({ c, annual, oneTime }) =>
        el(
          'div.sb-qrow',
          el('span.sb-qrow__name', c.name, el('small', catOf(c.category).name)),
          el('span.sb-qrow__basis', basisText(c, q.st)),
          el('span.sb-qrow__num', { 'data-label': Q.head.annual }, annual ? usd(annual) : '—'),
          el('span.sb-qrow__num' + (oneTime ? '' : '.is-empty'), { 'data-label': Q.head.oneTime }, oneTime ? usd(oneTime) : '—'),
        ),
      );
      const hiddenRows = q.hidden.map((h) =>
        el(
          'div.sb-qrow.sb-qrow--hidden',
          el('span.sb-qrow__name', h.name, ' ', el('span.sb-new', Q.newBadge), el('small', h.desc)),
          el('span.sb-qrow__basis', h.basis),
          el('span.sb-qrow__num', { 'data-label': Q.head.annual }, usd(h.amount)),
          el('span.sb-qrow__num.is-empty', { 'data-label': Q.head.oneTime }, '—'),
        ),
      );
      const hiddenOut = el('span', usd(0));
      const annualOut = el('span', usd(q.totals.subscription));
      const trow = (label, value, mod) => el('div.sb-trow' + (mod ? '.sb-trow--' + mod : ''), el('span', label), value instanceof Node ? value : el('span', value));
      const stamp = el(`div.stamp.stamp--${q.verdict.tone || 'denied'}.sb-verdict__stamp`, q.verdict.text);
      const renewalsNote =
        q.tl.before === 0 ? TL.renewalsNone : q.tl.before === 1 ? TL.renewalsOne : q.tl.before === 2 && TL.renewalsTwo ? TL.renewalsTwo : fill(TL.renewals, { n: q.tl.before });

      const paper = el(
        'section.sb-q.paper',
        el(
          'header.sb-q__head',
          el('div', el('div.kicker', Q.kicker, ' · ', q.number), el('h3.sb-q__title', { tabindex: '-1' }, Q.title)),
          el('div.sb-verdict', el('span.sb-verdict__k', Q.verdict), stamp),
        ),
        Q.fields.length
          ? el(
              'dl.sb-q__fields',
              Q.fields.map(([k, val]) => el('div', el('dt', k), el('dd', fill(val, { tier: q.tier.name, seats: v.seats })))),
            )
          : null,
        el(
          'div.sb-qtable',
          el('div.sb-qrow.sb-qrow--head', el('span', Q.head.item), el('span.sb-qrow__basis', Q.head.basis), el('span.sb-qrow__num', Q.head.annual), el('span.sb-qrow__num', Q.head.oneTime)),
          rows,
          el('div.sb-qsep', el('span', Q.hiddenTitle), Q.hiddenNote ? el('em', Q.hiddenNote) : null),
          hiddenRows,
        ),
        el(
          'div.sb-qtotals',
          trow(TT.subscription, usd(q.totals.subscription)),
          trow(TT.hidden, hiddenOut, 'hidden'),
          trow(TT.annual, annualOut, 'big'),
          trow(TT.oneTime, usd(q.totals.oneTime)),
          trow(TT.year1, usd(q.totals.year1)),
          trow(TT.tco, usd(q.totals.tco), 'alarm'),
        ),
        el(
          'section.sb-tl',
          el('h4.sb-tl__title', TL.title),
          el('p.sb-tl__sum', el('b', fill(TL.kickoff, { q: q.tl.qKick })), el('span.sb-tl__dot', ' · '), el('b.sb-tl__live', fill(TL.golive, { q: q.tl.qLive }))),
          ganttEl(q.tl),
          renewalsNote ? el('p.sb-tl__note', renewalsNote) : null,
        ),
      );

      // Share card (canvas) + share panel
      const cardCanvas = el('canvas.sb-sharecard', { width: 1200, height: 630, role: 'img', 'aria-label': fill(C.share.text, v) });
      const dl = el('button.btn.btn--vital', { type: 'button' }, Q.download);
      dl.addEventListener('click', async () => {
        dl.disabled = true;
        dl.textContent = Q.downloading;
        try {
          await drawShareCard(cardCanvas, q);
          await ctx.canvas.downloadCanvas(cardCanvas, 'my-oktholm-solution.png');
          ctx.sfx.click();
          ctx.track('solution_download', { skus: q.st.count });
        } catch (e) {
          console.warn('[solution-builder] render failed', e);
          ctx.ui.toast('The PNG needs Professional Services. Try again.', { kind: 'bad' });
        } finally {
          dl.disabled = false;
          dl.textContent = Q.download;
        }
      });
      const cardSection = el('section.sb-cardwrap', el('h3.sb-h3', Q.cardTitle), cardCanvas, el('div.sb-cardwrap__actions', dl));

      quoteView.replaceChildren(
        el('div.sb-quoteview__top', back()),
        paper,
        cardSection,
        ctx.share.panel({ text: fill(C.share.text, v), params: { play: 'solution-builder' }, kind: 'solution-builder', title: C.share.title }),
        yeshidPanel(q, v),
        ctx.cta.card({
          kicker: C.cta.kicker,
          title: C.cta.title,
          body: [facts.setup, facts.free].filter(Boolean).join(' '),
          kind: 'primary',
          label: C.cta.label || undefined,
          content: 'solution-builder',
          secondary: { kind: 'demo', label: C.cta.secondaryLabel },
        }),
        el('div.sb-quoteview__bottom', back()),
      );
      drawShareCard(cardCanvas, q).catch((e) => console.warn('[solution-builder] card', e));

      // Reveal the fees one by one, then total them up, then stamp the verdict.
      const finish = () => {
        if (!alive || token !== quoteToken) return;
        tweenText(hiddenOut, 0, q.totals.hiddenTotal, usd, 700, token);
        tweenText(annualOut, q.totals.subscription, q.totals.annual, usd, 900, token);
        stamp.classList.add('is-slam');
        ctx.sfx.stamp();
      };
      if (reduced) {
        hiddenRows.forEach((r) => r.classList.add('is-revealed'));
        finish();
      } else {
        hiddenRows.forEach((r, i) =>
          d.timeout(() => {
            if (!alive || token !== quoteToken) return;
            r.classList.add('is-revealed');
            chaChing(false);
          }, 700 + i * 360),
        );
        d.timeout(finish, 800 + hiddenRows.length * 360);
      }
    }

    function yeshidPanel(q, v) {
      const Y = C.yeshid;
      const sponsorName = ctx.brand.sponsor?.name || 'Sponsor';
      const them = el('canvas.sb-vs__spaghetti', { width: 640, height: 500, 'aria-hidden': 'true' });
      const lay = fitLayout({ w: 620, h: 480 }, q.sel, q.st);
      const g = them.getContext('2d');
      const paintThem = () => {
        g.clearRect(0, 0, 640, 500);
        drawMini(g, lay, { x: 10, y: 10, w: 620, h: 480 }, { labels: false });
      };
      paintThem();
      ctx.canvas.ensureFonts(CARD_FONTS).then(() => alive && paintThem());

      const rowText = (row) => {
        const variant = (row.variants || []).find((x) => !x.needs || q.sel.has(x.needs)) || { text: '' };
        return fill(variant.text, v);
      };
      const rows = (Y.rows || []).filter((r) => facts[r.fact]);
      return el(
        'section.sb-vs',
        el('header.sb-vs__head', el('div.kicker.kicker--cure', Y.kicker), el('h3.sb-vs__title', Y.title), Y.sub ? el('p.sb-vs__sub', Y.sub) : null),
        el(
          'div.sb-vs__cols',
          el(
            'div.sb-vs__col.sb-vs__col--them',
            el('h4', Y.themTitle),
            them,
            el('ul.sb-vs__stats', (Y.themStats || []).map((s) => el('li', fill(s, v)))),
          ),
          el(
            'div.sb-vs__col.sb-vs__col--us',
            el('h4', Y.usTitle || sponsorName),
            oneBox(fill(Y.users, v), Y.usBox || sponsorName, fill(Y.apps, v)),
            el(
              'ul.sb-vs__facts',
              ['setup', 'lifecycle', 'reviews'].filter((k) => facts[k]).map((k) => el('li', facts[k])),
            ),
          ),
        ),
        rows.length
          ? el(
              'div.sb-vs__table',
              { role: 'table' },
              el('div.sb-vs__row.sb-vs__row--head', { role: 'row' }, (Y.rowsHead || []).map((h) => el('span', { role: 'columnheader' }, h))),
              rows.map((r) =>
                el(
                  'div.sb-vs__row',
                  { role: 'row' },
                  el('span.sb-vs__label', { role: 'rowheader' }, r.label),
                  el('span.sb-vs__them', { role: 'cell', dataset: { h: (Y.rowsHead || [])[1] || '' } }, rowText(r)),
                  el('span.sb-vs__us', { role: 'cell', dataset: { h: (Y.rowsHead || [])[2] || '' } }, facts[r.fact]),
                ),
              ),
            )
          : null,
        el(
          'div.sb-vs__foot',
          facts.free ? el('p.sb-vs__free', facts.free) : null,
          ctx.cta.button('pricing', Y.pricingLabel, { content: 'solution-builder', variant: 'ghost' }),
        ),
      );
    }

    function oneBox(users, box, apps) {
      const W = 320;
      const Hh = 214;
      return svgEl(
        'svg',
        { class: 'sb-onebox', viewBox: `0 0 ${W} ${Hh}`, role: 'img', 'aria-label': `${users} → ${box} → ${apps}` },
        svgEl('path', { class: 'sb-onebox__edge', d: `M${W / 2} 42 L${W / 2} 78` }),
        svgEl('path', { class: 'sb-onebox__edge', d: `M${W / 2} 136 L${W / 2} 172` }),
        svgEl('rect', { class: 'sb-onebox__pill', x: 50, y: 12, width: W - 100, height: 30, rx: 15 }),
        svgText({ class: 'sb-onebox__pilltext', x: W / 2, y: 31, 'text-anchor': 'middle' }, users),
        svgEl('rect', { class: 'sb-onebox__box', x: 70, y: 78, width: W - 140, height: 58, rx: 14 }),
        svgText({ class: 'sb-onebox__boxtext', x: W / 2, y: 116, 'text-anchor': 'middle' }, box),
        svgEl('rect', { class: 'sb-onebox__pill', x: 50, y: 172, width: W - 100, height: 30, rx: 15 }),
        svgText({ class: 'sb-onebox__pilltext', x: W / 2, y: 191, 'text-anchor': 'middle' }, apps),
      );
    }

    async function drawShareCard(canvas, q) {
      await ctx.canvas.ensureFonts(CARD_FONTS);
      if (!alive) return;
      const K = C.card;
      const v = vars(q);
      const W = 1200;
      const Hc = 630;
      const g = canvas.getContext('2d');
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#0a1120';
      g.fillRect(0, 0, W, Hc);
      g.lineWidth = 1;
      for (let x = 0; x <= W; x += 30) {
        g.strokeStyle = x % 150 === 0 ? 'rgba(107,134,255,0.13)' : 'rgba(107,134,255,0.055)';
        g.beginPath();
        g.moveTo(x + 0.5, 0);
        g.lineTo(x + 0.5, Hc);
        g.stroke();
      }
      for (let y = 0; y <= Hc; y += 30) {
        g.strokeStyle = y % 150 === 0 ? 'rgba(107,134,255,0.13)' : 'rgba(107,134,255,0.055)';
        g.beginPath();
        g.moveTo(0, y + 0.5);
        g.lineTo(W, y + 0.5);
        g.stroke();
      }
      g.fillStyle = TOK.amber;
      g.fillRect(0, 0, W, 6);

      const L = 56;
      const colW = 540;
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillStyle = TOK.amber;
      g.font = "600 17px 'IBM Plex Mono', monospace";
      g.fillText(fill(K.kicker, v).toUpperCase(), L, 58);
      let tp = 60;
      g.font = `400 ${tp}px Anton, Impact, sans-serif`;
      const title = String(K.title).toUpperCase();
      while (tp > 36 && g.measureText(title).width > colW) g.font = `400 ${--tp}px Anton, Impact, sans-serif`;
      g.fillStyle = TOK.text;
      g.fillText(title, L, 126);

      let bp = 120;
      const big = usdCompact(q.totals.annual);
      g.font = `400 ${bp}px Anton, Impact, sans-serif`;
      while (bp > 60 && g.measureText(big).width > colW - 110) g.font = `400 ${--bp}px Anton, Impact, sans-serif`;
      g.fillStyle = TOK.amber;
      g.fillText(big, L, 268);
      const bw = g.measureText(big).width;
      g.font = '400 44px Anton, Impact, sans-serif';
      g.fillStyle = TOK.dim;
      g.fillText(K.perYear, L + bw + 10, 268);

      let y = 326;
      for (const line of K.lines || []) {
        const text = fill(line.text, v);
        g.fillStyle = line.alarm ? TOK.alarm : TOK.vital;
        g.fillRect(L, y - 17, 12, 12);
        g.fillStyle = line.alarm ? TOK.alarm : TOK.text;
        let lp = 27;
        g.font = `800 ${lp}px 'Plus Jakarta Sans', sans-serif`;
        while (lp > 16 && g.measureText(text).width > colW - 28) g.font = `800 ${--lp}px 'Plus Jakarta Sans', sans-serif`;
        g.fillText(text, L + 26, y);
        y += 44;
      }

      let host = '';
      try {
        host = new URL(ctx.brand.site?.url || '').host.replace(/^www\./, '');
      } catch {
        host = '';
      }
      g.font = "600 17px 'IBM Plex Mono', monospace";
      g.fillStyle = TOK.dim;
      g.fillText(`${K.footer} ${host}`.trim(), L, Hc - 34);

      const P = { x: 632, y: 58, w: 518, h: 514 };
      roundRectPath(g, P.x, P.y, P.w, P.h, 18);
      g.fillStyle = '#0c1628';
      g.fill();
      g.strokeStyle = TOK.line2;
      g.lineWidth = 2;
      g.stroke();
      g.fillStyle = TOK.faint;
      g.font = "600 13px 'IBM Plex Mono', monospace";
      const diagLabel = fill(K.diagram, { version: fill(D.version, { n: q.version }), complexity: q.complexity }).toUpperCase();
      let dlw = 13;
      while (dlw > 9 && g.measureText(diagLabel).width > P.w - 36) g.font = `600 ${--dlw}px 'IBM Plex Mono', monospace`;
      g.fillText(diagLabel, P.x + 18, P.y + 30);
      // Lay out wide enough that the diagram's aspect roughly matches the panel.
      // The diagram gets the panel minus a strip at the bottom, where the verdict gets stamped.
      const inner = { x: P.x + 14, y: P.y + 44, w: P.w - 28, h: P.h - 112 };
      drawMini(g, fitLayout(inner, q.sel, q.st), inner, { labels: true });
      const tone = q.verdict.tone === 'approved' ? TOK.vital : q.verdict.tone === 'diagnosed' ? '#ff2d55' : TOK.alarm;
      drawStampCanvas(g, q.verdict.text, P.x + P.w - 150, P.y + P.h - 36, rad(-6), tone, 32);
      g.fillStyle = TOK.text;
      g.font = "700 15px 'IBM Plex Mono', monospace";
      g.textAlign = 'right';
      g.fillText(String(ctx.brand.site?.name || '').toUpperCase(), W - 50, Hc - 34);
      g.textAlign = 'left';
    }

    // Initial paint (no animation).
    renderAll(false);
    return () => d.run();
  },
};
