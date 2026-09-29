import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanName, isBlocked, encodePayload, decodePayload, validateConfig } from '../../src/shows/intervention/payload.js';

const lists = { roles: 5, relationships: 6, tones: 3, symptomIds: new Set(['rollout', 'groups', 'hold', 'terraform', 'renewal', 'ssotax']) };
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o), 'utf8').toString('base64url');

test('round trip', () => {
  const cfg = { n: 'Tomás', r: 2, rel: 4, s: ['groups', 'hold'], t: 2, f: "D'Arcy O’Neil" };
  const p = encodePayload(cfg);
  assert.match(p, /^[A-Za-z0-9_-]+$/);
  const d = decodePayload(p, lists);
  assert.equal(d.ok, true);
  assert.deepEqual(d.value, cfg);
});

test('names', () => {
  assert.equal(cleanName('  Anne-Marie  '), 'Anne-Marie');
  assert.equal(cleanName('José'), 'José');
  assert.equal(cleanName('José'), 'José'); // NFC
  assert.equal(cleanName('Dr. Chen'), 'Dr. Chen');
  assert.equal(cleanName('Zoë   Kravitz'), 'Zoë Kravitz');
  assert.equal(cleanName('<script>alert(1)</script>'), null);
  assert.equal(cleanName('Bob<b>'), null);
  assert.equal(cleanName('R2D2'), null);
  assert.equal(cleanName('x'.repeat(25)), null);
  assert.equal(cleanName('x'.repeat(500)), null);
  assert.equal(cleanName('...'), null);
  assert.equal(cleanName(''), null);
  assert.equal(cleanName(42), null);
  assert.equal(cleanName('Ana‮evil'), null); // bidi override
  assert.equal(cleanName('李小龙'), '李小龙');
});

test('blocklist', () => {
  for (const bad of ['ass', 'Hitler', 'f u c k', 'Stupid Head', 'motherfucker']) assert.equal(isBlocked(bad), true, bad);
  for (const ok of ['Cassandra', 'Yoshito', 'Nazira', 'Dick', 'Faggin', 'Tess Hitchens', 'Scott', 'Kevin', 'Tomás']) assert.equal(isBlocked(ok), false, ok);
  const d = validateConfig({ n: 'Hitler', r: 0, rel: 0, s: ['groups'], t: 0, f: 'Shit' }, lists);
  assert.equal(d.ok, true);
  assert.equal(d.value.n, 'Friend');
  assert.equal(d.value.f, '');
});

test('malicious payloads are rejected or neutralised', () => {
  const bad = [
    undefined, '', '!!!', 'a'.repeat(2000), 'not base64 at all%%', b64('not json'), b64('[1,2,3]'), b64('null'),
    b64({ n: '<img src=x onerror=alert(1)>', r: 0, rel: 0, s: ['groups'], t: 0 }),
    b64({ n: 'x'.repeat(500), r: 0, rel: 0, s: ['groups'], t: 0 }),
    b64({ n: 'Kev', r: 9, rel: 0, s: ['groups'], t: 0 }),
    b64({ n: 'Kev', r: '1', rel: 0, s: ['groups'], t: 0 }),
    b64({ n: 'Kev', r: 1.5, rel: 0, s: ['groups'], t: 0 }),
    b64({ n: 'Kev', r: 0, rel: -1, s: ['groups'], t: 0 }),
    b64({ n: 'Kev', r: 0, rel: 0, s: [], t: 0 }),
    b64({ n: 'Kev', r: 0, rel: 0, s: ['nope', '<b>'], t: 0 }),
    b64({ n: 'Kev', r: 0, rel: 0, s: ['groups', 'hold', 'terraform', 'renewal', 'ssotax', 'rollout'], t: 0 }),
    b64({ n: 'Kev', r: 0, rel: 0, s: [{}], t: 0 }),
    b64({ n: 'Kev', r: 0, rel: 0, s: 'groups', t: 0 }),
    b64({ n: 'Kev', r: 0, rel: 0, s: ['groups'], t: 3 }),
    Buffer.from([0xff, 0xfe, 0x00]).toString('base64url'),
  ];
  for (const p of bad) assert.equal(decodePayload(p, lists).ok, false, String(p).slice(0, 60));
  // Unknown ids dropped, dupes collapsed, bad from-name dropped
  const d = decodePayload(b64({ n: 'Kev', r: 0, rel: 0, s: ['groups', 'groups', 'bogus'], t: 1, f: '<i>x</i>', extra: '__proto__' }), lists);
  assert.equal(d.ok, true);
  assert.deepEqual(d.value, { n: 'Kev', r: 0, rel: 0, s: ['groups'], t: 1, f: '' });
});
