// The captor's pure rules: triggers, time windows, visits, gating, queue order and The Breakup's fate.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIORITY,
  parseTrigger,
  matchRoute,
  matchEvent,
  eventNames,
  timeActive,
  nextVisit,
  pickReturn,
  gate,
  pickNext,
  wantsFiller,
  scaleRules,
  breakupFate,
  shortCode,
  textVars,
  VISIT_GAP_MS,
} from '../../src/experience/captor-rules.js';
import captor from '../../brands/oktholm/content/captor.js';

const DAY = 86400000;

test('parseTrigger understands every on: form', () => {
  assert.deepEqual(parseTrigger('first-visit'), { kind: 'first-visit' });
  assert.deepEqual(parseTrigger('any'), { kind: 'any' });
  assert.deepEqual(parseTrigger('return:7'), { kind: 'return', days: 7 });
  assert.deepEqual(parseTrigger('route:/cure'), { kind: 'route', path: '/cure' });
  assert.deepEqual(parseTrigger('after:/cure/'), { kind: 'after', path: '/cure' });
  assert.deepEqual(parseTrigger('event:share'), { kind: 'event', name: 'share', value: null });
  assert.deepEqual(parseTrigger('event:triage_complete:Stage IV'), { kind: 'event', name: 'triage_complete', value: 'Stage IV' });
  assert.deepEqual(parseTrigger('event:x:a:b'), { kind: 'event', name: 'x', value: 'a:b' });
  assert.deepEqual(parseTrigger('time:late-night'), { kind: 'time', rule: 'late-night' });
  assert.deepEqual(parseTrigger('referral:sponsee'), { kind: 'referral', what: 'sponsee' });
  assert.equal(PRIORITY[parseTrigger('bogus:1').kind], undefined);
});

test('every trigger in the brand data parses to a known kind', () => {
  for (const t of captor.texts) assert.ok(PRIORITY[parseTrigger(t.on).kind], `${t.id}: ${t.on}`);
  const ids = captor.texts.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, 'text ids are unique');
});

test('matchRoute matches whole path segments', () => {
  assert.ok(matchRoute('/cure', '/cure'));
  assert.ok(matchRoute('/cure', '/cure/'));
  assert.ok(matchRoute('/play', '/play/hold'));
  assert.ok(!matchRoute('/cure', '/cured'));
  assert.ok(!matchRoute('/', '/triage'));
  assert.ok(matchRoute('/', '/'));
});

test('matchEvent: name, optional value against any prop, game_end aliases', () => {
  assert.ok(matchEvent(parseTrigger('event:share'), 'share', { platform: 'x', kind: 'breakup' }));
  assert.ok(matchEvent(parseTrigger('event:triage_complete:Stage IV'), 'triage_complete', { stage: 'Stage IV', score: 30 }));
  assert.ok(!matchEvent(parseTrigger('event:triage_complete:Stage IV'), 'triage_complete', { stage: 'Stage 0' }));
  assert.ok(!matchEvent(parseTrigger('event:share'), 'share_x', {}));
  assert.ok(matchEvent(parseTrigger('event:game_end:hold'), 'game_end', { module: 'hold' }));
  assert.ok(matchEvent(parseTrigger('event:game_end:hold'), 'hold_end', { module: 'hold', seconds: 70 }));
  assert.ok(!matchEvent(parseTrigger('event:game_end:hold'), 'game_end', { module: 'leaver' }));
  // Games name their ends differently: access-please says "finish", hold "hold_end", idle "idle_finish".
  assert.ok(matchEvent(parseTrigger('event:game_end:access-please'), 'finish', { module: 'access-please', correct: 9 }));
  assert.ok(matchEvent(parseTrigger('event:game_end:leaver'), 'game_end', { module: 'leaver', reason: 'done' }));
  assert.ok(!matchEvent(parseTrigger('event:game_end:leaver'), 'finish', { module: 'access-please' }));
  assert.ok(!matchEvent(parseTrigger('event:game_end'), 'finish', {}), 'no module, no alias');
  assert.deepEqual(eventNames('hold_end', { module: 'hold' }), ['hold_end', 'game_end']);
  assert.deepEqual(eventNames('idle_finish', { module: 'idle' }), ['idle_finish', 'game_end']);
  assert.deepEqual(eventNames('start', { module: 'access-please' }), ['start', 'game_start']);
  assert.deepEqual(eventNames('show_complete', { module: 'news' }), ['show_complete']);
  assert.deepEqual(eventNames('game_end', { module: 'leaver' }), ['game_end']);
});

test('time rules use local time windows', () => {
  const at = (y, m, d, h, min = 0) => new Date(y, m - 1, d, h, min);
  // 2026-09-28 is a Monday, 2026-10-02 a Friday.
  assert.ok(timeActive('late-night', at(2026, 10, 1, 23, 30)));
  assert.ok(timeActive('late-night', at(2026, 10, 1, 4, 59)));
  assert.ok(!timeActive('late-night', at(2026, 10, 1, 5, 0)));
  assert.ok(!timeActive('late-night', at(2026, 10, 1, 22, 59)));
  assert.ok(timeActive('monday-morning', at(2026, 9, 28, 8, 0)));
  assert.ok(timeActive('monday-morning', at(2026, 9, 28, 9, 59)));
  assert.ok(!timeActive('monday-morning', at(2026, 9, 28, 10, 0)));
  assert.ok(!timeActive('monday-morning', at(2026, 9, 29, 8, 30)));
  assert.ok(timeActive('friday-afternoon', at(2026, 10, 2, 16, 55)));
  assert.ok(!timeActive('friday-afternoon', at(2026, 10, 2, 17, 0)));
  assert.ok(!timeActive('friday-afternoon', at(2026, 10, 1, 16, 0)));
  assert.ok(timeActive('quarter-end', at(2026, 9, 24, 12)));
  assert.ok(timeActive('quarter-end', at(2026, 9, 30, 12)));
  assert.ok(!timeActive('quarter-end', at(2026, 9, 23, 12)));
  assert.ok(timeActive('quarter-end', at(2026, 12, 25, 12)));
  assert.ok(timeActive('quarter-end', at(2026, 3, 31, 12)));
  assert.ok(!timeActive('quarter-end', at(2026, 10, 31, 12)));
  assert.ok(!timeActive('quarter-end', at(2026, 2, 27, 12)));
  assert.ok(timeActive('december', at(2026, 12, 1, 0)));
  assert.ok(timeActive('december', at(2026, 12, 31, 23, 59)));
  assert.ok(!timeActive('december', at(2027, 1, 1, 0)));
  assert.ok(!timeActive('december', at(2026, 11, 30, 23, 59)));
  assert.ok(!timeActive('nope', at(2026, 9, 28, 9)));
});

test('visits: reloads continue a visit, 30 idle minutes start a new one', () => {
  const t0 = Date.UTC(2026, 8, 1, 12);
  const first = nextVisit(null, t0);
  assert.equal(first.fresh, true);
  assert.equal(first.visit.n, 1);
  assert.equal(first.visit.away, null);
  const reload = nextVisit({ ...first.visit, shown: 2 }, t0 + 60000);
  assert.equal(reload.fresh, false);
  assert.equal(reload.visit.shown, 2, 'counters survive a reload');
  const back = nextVisit({ ...reload.visit, lastAt: t0 }, t0 + 8 * DAY);
  assert.equal(back.fresh, true);
  assert.equal(back.visit.n, 2);
  assert.equal(back.visit.shown, 0);
  assert.equal(Math.round(back.visit.away), 8);
  assert.equal(nextVisit({ n: 3, lastAt: t0 }, t0 + VISIT_GAP_MS).fresh, true);
});

test('textVars fills {days} from the last absence and keeps extras', () => {
  assert.deepEqual(textVars(null), {});
  assert.deepEqual(textVars(2.6), { days: 3 });
  assert.deepEqual(textVars(1.2, { n: 4 }), { days: 1, n: 4 });
  assert.deepEqual(textVars(undefined, { n: 1 }), { n: 1 });
});

test('pickReturn picks the longest absence that applies and skips seen texts', () => {
  const texts = [
    { id: 'back', on: 'return:1' },
    { id: 'back-week', on: 'return:7' },
  ];
  assert.equal(pickReturn(texts, null), null);
  assert.equal(pickReturn(texts, 0.5), null);
  assert.equal(pickReturn(texts, 2).id, 'back');
  assert.equal(pickReturn(texts, 8).id, 'back-week');
  assert.equal(pickReturn(texts, 8, { 'back-week': 1 }).id, 'back');
});

test('gate: blocked, hidden, cold open, tour, triage, quiet routes, caps, warm-up and gap', () => {
  const ok = { now: 100000, readyAt: 50000, shown: 0, maxPerVisit: 3, lastShownAt: 0, minGapMs: 90000 };
  assert.equal(gate(ok), null);
  assert.equal(gate({ ...ok, blocked: true }), 'blocked');
  assert.equal(gate({ ...ok, hidden: true }), 'hidden');
  assert.equal(gate({ ...ok, admission: true }), 'admission');
  assert.equal(gate({ ...ok, tour: true }), 'tour');
  assert.equal(gate({ ...ok, triage: true }), 'triage');
  assert.equal(gate({ ...ok, quiet: true }), 'quiet-route');
  assert.equal(gate({ ...ok, busy: true }), 'busy');
  assert.equal(gate({ ...ok, shown: 3 }), 'max-per-visit');
  assert.equal(gate({ ...ok, now: 40000 }), 'warming-up');
  assert.equal(gate({ ...ok, lastShownAt: 50000 }), 'gap');
  assert.equal(gate({ ...ok, lastShownAt: 10000 - 1 }), null);
});

test('pickNext: priority, freshness, due time, route and time validity, fillers', () => {
  const q = (key, kind, extra = {}) => ({ key, kind, prio: PRIORITY[kind], batch: 1, order: 0, dueAt: 0, ...extra });
  const base = { now: 1000, path: '/cure' };
  const queue = [q('daily', 'daily'), q('time', 'time', { rule: 'x' }), q('ref', 'referral'), q('any', 'any')];
  assert.equal(pickNext(queue, base).key, 'ref');
  assert.equal(pickNext([...queue, q('ev', 'event')], base).key, 'ev');
  assert.equal(pickNext(queue, { ...base, seen: { ref: 1 } }).key, 'time');
  assert.equal(pickNext(queue, { ...base, seen: { ref: 1 }, isTimeActive: () => false }).key, 'daily');
  assert.equal(pickNext([q('any', 'any')], { ...base, shown: 1 }), null, 'no filler once something ran');
  assert.equal(pickNext([q('late', 'event', { dueAt: 5000 })], base), null, 'not due yet');
  assert.equal(pickNext([q('r', 'route', { path: '/cure' })], { ...base, path: '/arcade' }), null, 'left the route');
  assert.equal(pickNext([q('r', 'route', { path: '/cure' })], base).key, 'r');
  // Same priority: the newest trigger wins, then data order.
  const tie = [q('triage', 'route', { path: '/triage', batch: 1 }), q('stage', 'event', { batch: 2 })];
  assert.equal(pickNext(tie, { ...base, path: '/triage' }).key, 'stage');
  const order = [q('b', 'route', { path: '/cure', order: 2 }), q('a', 'route', { path: '/cure', order: 1 })];
  assert.equal(pickNext(order, base).key, 'a');
});

test('wantsFiller: once per visit, only when nothing specific ran or waits', () => {
  const base = { now: 100, fillAt: 50, shown: 0, filler: false, queue: [] };
  assert.equal(wantsFiller(base), true);
  assert.equal(wantsFiller({ ...base, now: 10 }), false);
  assert.equal(wantsFiller({ ...base, shown: 1 }), false);
  assert.equal(wantsFiller({ ...base, filler: true }), false);
  assert.equal(wantsFiller({ ...base, queue: [{ kind: 'route' }] }), false);
  assert.equal(wantsFiller({ ...base, queue: [{ kind: 'any' }] }), true);
});

test('scaleRules only shortens timings in fast mode', () => {
  const rules = { maxPerVisit: 3, minGapMs: 90000, firstDelayMs: 20000, quietRoutes: ['play'] };
  assert.equal(scaleRules(rules, false), rules);
  const fast = scaleRules(rules, true);
  assert.equal(fast.firstDelayMs, 1500);
  assert.equal(fast.minGapMs, 4000);
  assert.deepEqual(fast.quietRoutes, ['play']);
});

test('breakupFate is the same for everyone on a day and honors the chances', () => {
  const chances = captor.breakup.bustChance;
  const n = captor.breakup.rounds.length;
  assert.deepEqual(breakupFate(29, chances, n, 3), breakupFate(29, chances, n, 3));
  const fates = Array.from({ length: 400 }, (_, i) => breakupFate(i + 1, chances, n, 3));
  for (const f of fates) {
    assert.notEqual(f.bustAt, 0, 'the first offer can always be taken');
    assert.ok(f.bustAt === -1 || (f.bustAt >= 1 && f.bustAt < n));
    assert.ok(f.line >= 0 && f.line < 3);
  }
  const survived = fates.filter((f) => f.bustAt === -1).length / fates.length;
  // P(no bust) = 0.88 * 0.8 * 0.7 * 0.55 ≈ 0.27
  assert.ok(survived > 0.15 && survived < 0.4, `survival rate ${survived}`);
  assert.ok(new Set(fates.map((f) => f.bustAt)).size > 2, 'fates vary by day');
  assert.equal(breakupFate(5, [0, 1, 1], 3).bustAt, 1);
  assert.equal(breakupFate(5, [0, 0, 0], 3).bustAt, -1);
});

test('shortCode drops the brand prefix only', () => {
  assert.equal(shortCode('OKT-AB12-CD'), 'AB12-CD');
  assert.equal(shortCode('PT-0000-ZZ'), '0000-ZZ');
  assert.equal(shortCode(''), '');
});

test('brand data keeps the shape the engine reads', () => {
  const b = captor.breakup;
  assert.equal(b.rounds.length, b.bustChance.length);
  assert.equal(b.bustChance[0], 0);
  for (const k of ['walked', 'stayed', 'busted']) assert.equal(typeof b.result[k], 'string');
  assert.ok(b.stay.includes('{d}'));
  assert.ok(captor.export.cta.includes('{link}'));
  for (const t of captor.texts) {
    const kinds = ['text', 'thread', 'edits', 'voice', 'call'].filter((k) => t[k] != null);
    assert.equal(kinds.length, 1, `${t.id} has exactly one body`);
  }
});
