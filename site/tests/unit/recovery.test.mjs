import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRecovery, memoryStore, HttpError, LIMITS } from '../../netlify/lib/recovery.mjs';

const A = 'OKT-AAAA-11';
const B = 'OKT-BBBB-22';
const C = 'OKT-CCCC-33';

test('credits a sponsor once per referred patient, only for diagnosis', async () => {
  const r = createRecovery(memoryStore());
  assert.deepEqual(await r.qualify({ patientId: B, ref: A, kind: 'idle' }), { ok: true, credited: false });
  const first = await r.qualify({ patientId: B, ref: A, kind: 'diagnosis' });
  assert.equal(first.credited, true);
  assert.equal(first.sponsees, 1);
  const again = await r.qualify({ patientId: B, ref: A, kind: 'diagnosis' });
  assert.equal(again.credited, false);
  // A different sponsor can't steal an already-credited patient.
  const stolen = await r.qualify({ patientId: B, ref: C, kind: 'diagnosis' });
  assert.equal(stolen.credited, false);
  assert.equal((await r.sponsor(A)).sponsees, 1);
  assert.equal((await r.sponsor(C)).sponsees, 0);
});

test('rejects self-referral and malformed ids', async () => {
  const r = createRecovery(memoryStore());
  await assert.rejects(r.qualify({ patientId: A, ref: A, kind: 'diagnosis' }), (e) => e instanceof HttpError && e.status === 400);
  await assert.rejects(r.qualify({ patientId: '<script>', ref: A, kind: 'diagnosis' }), (e) => e.status === 400);
  await assert.rejects(r.sponsor('nope'), (e) => e.status === 400);
});

test('landed counts once per visitor', async () => {
  const r = createRecovery(memoryStore());
  await r.landed({ patientId: B, ref: A, via: 'x' });
  await r.landed({ patientId: B, ref: A, via: 'x' });
  await r.landed({ patientId: C, ref: A, via: 'linkedin' });
  assert.equal((await r.sponsor(A)).landed, 2);
});

test('leaderboard orders sponsors by sponsees', async () => {
  const r = createRecovery(memoryStore());
  const ids = ['OKT-DDDD-01', 'OKT-DDDD-02', 'OKT-DDDD-03'];
  for (const [i, p] of ids.entries()) await r.qualify({ patientId: p, ref: i < 2 ? B : A, kind: 'diagnosis' });
  const lb = await r.leaderboard();
  assert.deepEqual(lb.top.map((x) => [x.name, x.count]), [[B, 2], [A, 1]]);
});

test('per-IP daily rate limits are bucketed', async () => {
  const r = createRecovery(memoryStore());
  for (let i = 0; i < LIMITS.perIpPerDay.event; i++) await r.event({ type: 'share' }, { ipHash: 'x' });
  await assert.rejects(r.event({ type: 'share' }, { ipHash: 'x' }), (e) => e.status === 429);
  // Another IP is unaffected, and the same IP can still earn referral credit.
  // The response carries today's running total for that event type.
  assert.deepEqual(await r.event({ type: 'share' }, { ipHash: 'y' }), { ok: true, count: LIMITS.perIpPerDay.event + 1 });
  assert.equal((await r.qualify({ patientId: B, ref: A, kind: 'diagnosis' }, { ipHash: 'x' })).credited, true);
});

test('confessions go to moderation and only approved ones are listed', async () => {
  const r = createRecovery(memoryStore());
  await assert.rejects(r.confess({ text: 'short' }), (e) => e.status === 400);
  await r.confess({ text: 'I gave the intern Global Admin for the afternoon.\u0000', who: 'Sysadmin' });
  assert.equal((await r.approved()).items.length, 0);
  const [p] = (await r.pending()).items;
  assert.ok(!p.text.includes('\u0000'));
  await r.moderate({ key: p.key, approve: true });
  const { items } = await r.approved();
  assert.equal(items.length, 1);
  assert.equal(items[0].who, 'Sysadmin');
  assert.equal((await r.pending()).items.length, 0);
});

test('reactions validate input and count', async () => {
  const r = createRecovery(memoryStore());
  await assert.rejects(r.react({ key: 'seed:1', reaction: 'lol' }), (e) => e.status === 400);
  await r.react({ key: 'seed:1', reaction: 'same' });
  const { counts } = await r.react({ key: 'seed:1', reaction: 'same' });
  assert.equal(counts.same, 2);
});

test('unique events count each patient once per day', async () => {
  const r = createRecovery(memoryStore());
  assert.equal((await r.event({ type: 'denial', patientId: A, unique: true }, { ipHash: 'a' })).count, 1);
  assert.deepEqual(await r.event({ type: 'denial', patientId: A, unique: true }, { ipHash: 'a' }), { ok: true, count: 1, repeat: true });
  assert.equal((await r.event({ type: 'denial', patientId: B, unique: true }, { ipHash: 'b' })).count, 2);
});
