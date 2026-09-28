// Shared room building blocks.

import { el, formatNumber } from '../engine/dom.js';
import { getModule, moduleMeta, listModules } from '../engine/modules.js';

export function sectionHead({ kicker, title, body, actions, level = 'h2' }) {
  return el(
    'div.section__head',
    el('div', kicker && el('div.kicker', kicker), el(`${level}.section__title`, title), body && el('p.section__body', body)),
    actions && el('div.row', actions),
  );
}

export function link(path, label, cls = 'btn btn--ghost') {
  return el('a', { href: '#' + path, class: cls, text: label });
}

/** A classic P-QRS-T heartbeat, repeated. */
export function ecgSvg({ beats = 6, width = 1200, height = 70 } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const w = width / beats;
  const mid = height * 0.58;
  let d = `M0 ${mid}`;
  for (let i = 0; i < beats; i++) {
    const x = i * w;
    d += ` L${x + w * 0.18} ${mid} Q${x + w * 0.24} ${mid - 8} ${x + w * 0.3} ${mid} L${x + w * 0.38} ${mid} L${x + w * 0.41} ${mid + 7} L${x + w * 0.45} ${height * 0.06} L${x + w * 0.49} ${height * 0.94} L${x + w * 0.53} ${mid} L${x + w * 0.64} ${mid} Q${x + w * 0.72} ${mid - 13} ${x + w * 0.8} ${mid} L${x + w} ${mid}`;
  }
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', d);
  path.setAttribute('class', 'ecg-line');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(path);
  return svg;
}

export function brandIcon() {
  const wrap = el('span');
  wrap.innerHTML =
    '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#0f1620" stroke="#2b3e55"/><path d="M4 36h14l5-14 8 28 7-22 4 8h18" fill="none" stroke="#36f59a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  return wrap.firstChild;
}

/** Deterministic "live" counter value for a vital definition at time t (same for every visitor). */
export function vitalValue(v, t = Date.now()) {
  if (v.fixed) return v.fixed;
  const day = 86400000;
  const frac = (t % day) / day;
  const wobble = v.wobble ? Math.sin(t / 7000) * v.wobble + Math.sin(t / 2300) * v.wobble * 0.3 : 0;
  return v.base + v.perDay * frac + wobble;
}

export function vitalsPanel(vitals, d) {
  const cells = vitals.map((v, i) => {
    const value = el(`div.vital__value${i === 1 ? '.is-amber' : ''}${v.fixed ? '.is-alarm' : ''}`);
    return { v, value, node: el('div.vital', el('div.vital__label', v.label), value) };
  });
  const tick = () => cells.forEach(({ v, value }) => (value.textContent = v.fixed ? v.fixed : formatNumber(vitalValue(v))));
  tick();
  d.interval(tick, 1000);
  return el('div.vitals', el('div.vitals__ecg', ecgSvg({ beats: 7 })), el('div.vitals__grid', cells.map((c) => c.node)));
}

/** Program guide slots: 30-minute blocks cycling through brand guide entries. */
export function guideSlots(guide, count = 6, now = Date.now()) {
  const slotMs = 30 * 60 * 1000;
  const start = Math.floor(now / slotMs);
  return Array.from({ length: count }, (_, i) => {
    const idx = (start + i) % guide.length;
    const at = new Date((start + i) * slotMs);
    return { ...guide[idx], at, now: i === 0 };
  });
}

export function guideList(guide, count, brand) {
  return el(
    'div.guide',
    guideSlots(guide, count).map((g) => {
      const href = g.path ? '#' + g.path : g.module ? `#/${getModule(g.module)?.kind === 'show' ? 'watch' : 'play'}/${g.module}` : '#/tv';
      return el(
        `a.guide__row${g.now ? '.is-now' : ''}`,
        { href },
        el('span.guide__time', g.now ? '● ON NOW' : g.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })),
        el('span.guide__title', g.title),
        el('span.guide__genre', g.genre || ''),
      );
    }),
  );
}

export function moduleHref(mod) {
  if (mod.id === 'intervention') return '#/intervention';
  return `#/${mod.kind === 'show' ? 'watch' : 'play'}/${mod.id}`;
}

export function moduleCard(mod, brand) {
  const m = moduleMeta(mod, brand);
  return el(
    `a.card.card--raised.card--link.game-card.game-card--${mod.kind}`,
    { href: moduleHref(mod) },
    el('div.game-card__emoji', m.emoji || '●'),
    el('div.kicker', mod.kind === 'show' ? 'OKTV · On demand' : mod.kind === 'toy' ? 'Generator' : 'Game', m.minutes ? ` · ${m.minutes}` : ''),
    el('h3.game-card__title', m.title),
    el('p.game-card__blurb', m.blurb || ''),
    el('div.game-card__foot', el('span.game-card__therapy', m.therapy || ''), el('span.btn.btn--sm.btn--vital', mod.kind === 'show' ? 'Watch' : 'Play')),
  );
}

export function arcadeGrid(brand, kinds) {
  const mods = listModules(brand, kinds);
  if (!mods.length) return el('p.dim', 'The arcade is being sanitized. Check back after the next shift change.');
  return el('div.arcade-grid', mods.map((m) => moduleCard(m, brand)));
}

export function severityTag(sev) {
  return el(`span.tag.tag--${sev}`, sev);
}
