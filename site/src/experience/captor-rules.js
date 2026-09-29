// Pure rules behind the captor's texts: trigger parsing, time windows, visits, gating, queue order and
// The Breakup's daily fate. No DOM and no services, so tests/unit/captor-rules.test.mjs can run it in Node.

import { seeded } from '../engine/rng.js';

const DAY = 86400000;
export const VISIT_GAP_MS = 30 * 60 * 1000; // a new visit starts after 30 idle minutes (reloads don't count)

/** Queue order: event/route triggers > referral > time > daily > any. Unknown kinds never fire. */
export const PRIORITY = { event: 5, route: 5, after: 5, 'first-visit': 5, return: 5, referral: 4, time: 3, daily: 2, any: 1 };

export function normalizePath(p) {
  let s = String(p || '').trim();
  if (!s.startsWith('/')) s = '/' + s;
  while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
  return s;
}

/**
 * 'first-visit' | 'return:<days>' | 'route:<path>' | 'after:<path>' | 'event:<name>[:<value>]' | 'time:<rule>' |
 * 'referral:landed' | 'referral:sponsee' | 'any'  ->  { kind, ...args }
 */
export function parseTrigger(on) {
  const s = String(on || '').trim();
  const i = s.indexOf(':');
  const kind = i < 0 ? s : s.slice(0, i);
  const rest = i < 0 ? '' : s.slice(i + 1);
  switch (kind) {
    case 'event': {
      const j = rest.indexOf(':');
      return { kind, name: j < 0 ? rest : rest.slice(0, j), value: j < 0 ? null : rest.slice(j + 1) };
    }
    case 'return':
      return { kind, days: Math.max(0, Number(rest) || 0) };
    case 'route':
    case 'after':
      return { kind, path: normalizePath(rest) };
    case 'time':
      return { kind, rule: rest };
    case 'referral':
      return { kind, what: rest };
    default:
      return { kind };
  }
}

/** '/cure' matches '/cure' and '/cure/anything', not '/cured'. */
export function matchRoute(pattern, path) {
  const p = normalizePath(pattern);
  const q = normalizePath(path);
  return p === q || (p !== '/' && q.startsWith(p + '/'));
}

/**
 * Names an event can be matched under. Games name their end events differently ("finish", "hold_end",
 * "idle_finish"); a module event called finish / <module>_end / <module>_finish also counts as game_end for that
 * module, and start / <module>_start as game_start. (Module events carry `module`; see engine/modules.js.)
 */
export function eventNames(name, props = {}) {
  const out = [name];
  const m = props && props.module;
  if (!m) return out;
  if (name !== 'game_end' && (name === 'finish' || name === `${m}_end` || name === `${m}_finish`)) out.push('game_end');
  if (name !== 'game_start' && (name === 'start' || name === `${m}_start`)) out.push('game_start');
  return out;
}

/** event:<name>[:<value>]: the value matches any prop of the event (stage, module, platform...). */
export function matchEvent(trig, name, props = {}) {
  if (!trig || trig.kind !== 'event' || !eventNames(name, props).includes(trig.name)) return false;
  if (trig.value == null || trig.value === '') return true;
  return Object.values(props || {}).some((v) => v != null && typeof v !== 'object' && String(v) === trig.value);
}

/**
 * Time rules, in the visitor's local time:
 *   late-night 23:00–04:59 · monday-morning Mon 08:00–09:59 · friday-afternoon Fri 15:00–16:59 ·
 *   quarter-end the last 7 days of Mar/Jun/Sep/Dec · december the whole month
 */
export function timeActive(rule, d = new Date()) {
  const h = d.getHours();
  const wd = d.getDay();
  switch (rule) {
    case 'december':
      return d.getMonth() === 11;
    case 'late-night':
      return h >= 23 || h < 5;
    case 'monday-morning':
      return wd === 1 && h >= 8 && h < 10;
    case 'friday-afternoon':
      return wd === 5 && h >= 15 && h < 17;
    case 'quarter-end': {
      const m = d.getMonth();
      if (m % 3 !== 2) return false;
      const last = new Date(d.getFullYear(), m + 1, 0).getDate();
      return d.getDate() > last - 7;
    }
    default:
      return false;
  }
}

/**
 * Visit bookkeeping. Returns { visit, fresh }. A visit carries its counters so a reload can't reset them:
 *   n (visit number, 1 = first), startedAt, lastAt, away (days since the previous visit, null on the first),
 *   shown, lastShownAt, filler (an `any` text ran), title (the tab title ran)
 */
export function nextVisit(prev, now, gap = VISIT_GAP_MS) {
  if (prev && typeof prev === 'object' && now - (Number(prev.lastAt) || 0) < gap) return { visit: { ...prev, lastAt: now }, fresh: false };
  const last = prev && Number(prev.lastAt);
  return {
    visit: { n: (Number(prev?.n) || 0) + 1, startedAt: now, lastAt: now, away: last ? (now - last) / DAY : null, shown: 0, lastShownAt: 0, filler: false, title: false },
    fresh: true,
  };
}

/** Placeholders for a text: {days} (whole days since the previous visit, when there was one) plus extras ({n}). */
export function textVars(away, extra = {}) {
  const out = {};
  if (away != null && Number.isFinite(Number(away))) out.days = Math.round(Number(away));
  return { ...out, ...extra };
}

/** return:<N>: the unseen text with the largest N the visitor has been away for. */
export function pickReturn(texts, away, seen = {}) {
  if (away == null) return null;
  let best = null;
  for (const t of texts) {
    const trig = t.trig || parseTrigger(t.on);
    if (trig.kind !== 'return' || seen[t.id] || away < trig.days) continue;
    if (!best || trig.days > (best.trig || parseTrigger(best.on)).days) best = t;
  }
  return best;
}

/** Why a text can't be shown right now (a string), or null when it can. */
export function gate(st) {
  if (st.blocked) return 'blocked';
  if (st.hidden) return 'hidden';
  if (st.admission) return 'admission';
  if (st.tour) return 'tour';
  if (st.triage) return 'triage';
  if (st.quiet) return 'quiet-route';
  if (st.busy) return 'busy';
  if ((st.shown || 0) >= (st.maxPerVisit ?? Infinity)) return 'max-per-visit';
  if (st.now < (st.readyAt || 0)) return 'warming-up';
  if (st.lastShownAt && st.now - st.lastShownAt < (st.minGapMs || 0)) return 'gap';
  return null;
}

/**
 * The next queued text to show, or null. Queue items: { key, kind, prio, batch, order, dueAt, path?, rule? }.
 * Route texts only count while the visitor is still on that route, time texts while the window is open,
 * `any` fillers only while nothing else has been shown this visit. Ties: newest trigger first, then data order.
 */
export function pickNext(queue, { now, seen = {}, path = null, shown = 0, isTimeActive = () => true } = {}) {
  const ok = queue.filter((q) => {
    if (q.dueAt > now || seen[q.key]) return false;
    if (q.kind === 'route') return path != null && matchRoute(q.path, path);
    if (q.kind === 'time') return isTimeActive(q.rule);
    if (q.kind === 'any') return shown === 0;
    return true;
  });
  ok.sort((a, b) => b.prio - a.prio || b.batch - a.batch || a.order - b.order);
  return ok[0] || null;
}

/** Is it time to queue an `any` filler? Once per visit, and only when nothing specific ran or is pending. */
export function wantsFiller({ now, fillAt, shown, filler, queue = [] }) {
  if (filler || shown > 0 || now < fillAt) return false;
  return !queue.some((q) => q.kind !== 'any');
}

/** Scale the data's timings down for ?captor=fast (dev builds only). */
export function scaleRules(rules, fast) {
  if (!fast) return rules;
  return { ...rules, firstDelayMs: Math.min(rules.firstDelayMs, 1500), minGapMs: Math.min(rules.minGapMs, 4000), delayCapMs: 1500 };
}

/**
 * The Breakup's fate for a day: seeded('breakup:' + day) rolls once per round from the second round on, so
 * everyone who pushes to the same round that day gets the same answer. Returns the round index that busts
 * (the renewal lands before that round's offer can be taken) or -1, plus which bust line to use.
 */
export function breakupFate(day, bustChance = [], rounds = 0, lines = 1) {
  const rng = seeded('breakup:' + day);
  let bustAt = -1;
  for (let i = 1; i < rounds; i++) {
    if (rng() < (Number(bustChance[i]) || 0)) {
      bustAt = i;
      break;
    }
  }
  const line = Math.floor(seeded('breakup-line:' + day)() * Math.max(1, lines));
  return { bustAt, line };
}

/** The visitor's short referral path code: 'OKT-AB12-CD' -> 'AB12-CD' (the brand prefix is dropped). */
export function shortCode(patientId) {
  return String(patientId || '').replace(/^[A-Z]{2,5}-/, '');
}
