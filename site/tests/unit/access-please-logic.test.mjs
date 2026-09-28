// Access, Please game logic (pure): every handcrafted story resolves to its intended verdict, shifts are
// full and balanced, generated text has no unfilled {tokens}, and the Daily Shift is deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seeded } from '../../src/engine/rng.js';
import { DEFAULTS } from '../../src/games/access-please/defaults.js';
import brand from '../../brands/oktholm/modules/access-please.js';
import { resolveContent, indexData, buildShift, evaluate, rulesFor, checksOf, storyReq, storyValid } from '../../src/games/access-please/logic.js';

for (const [label, content] of [['brand', brand], ['defaults-only', {}]]) {
  const C = resolveContent(content, DEFAULTS);
  const data = indexData(C);

  test(`${label}: stories are valid and resolve as written`, () => {
    for (const s of C.stories) {
      assert.ok(storyValid(s, data), `story ${s.id} references unknown people/apps`);
      if (!s.expect) continue;
      const req = storyReq(s, data, seeded(1));
      const got = evaluate(req, checksOf(rulesFor(C, s.day)), data).length ? 'deny' : 'approve';
      assert.equal(got, s.expect, `story ${s.id} on day ${s.day}`);
    }
  });

  test(`${label}: shifts are full, balanced and fully rendered`, () => {
    for (const day of [1, 2, 3, 4, 5, 'daily']) {
      const daily = day === 'daily';
      const count = C.shift.counts[day];
      let total = 0;
      let legit = 0;
      for (let i = 0; i < 120; i++) {
        const { reqs, checks } = buildShift({ C, data, rng: seeded(`t:${day}:${i}`), day: daily ? 5 : day, daily, count });
        assert.equal(reqs.length, count, `day ${day} shift ${i} is short`);
        for (const r of reqs) {
          total++;
          if (!evaluate(r, checks, data).length) legit++;
          assert.ok(r.text && !r.text.includes('{'), `unfilled template on day ${day}: ${r.text}`);
        }
      }
      const pct = legit / total;
      assert.ok(pct > 0.3 && pct < 0.75, `day ${day}: ${Math.round(pct * 100)}% legitimate requests`);
    }
  });

  test(`${label}: the Daily Shift is deterministic per seed`, () => {
    const make = () => buildShift({ C, data, rng: seeded('2026-09-28:shift'), day: 5, daily: true, count: C.shift.counts.daily }).reqs.map((r) => `${r.person.name}|${r.app.name}|${r.text}`).join('\n');
    assert.equal(make(), make());
  });
}
