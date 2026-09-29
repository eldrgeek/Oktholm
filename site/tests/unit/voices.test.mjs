// Voice pipeline against a mock ElevenLabs server: renders, skips what's done, reports missing voices.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectLines, render, estimate, brandLines } from '../../scripts/lib/voices.mjs';
import { lineKey, stripTags, estimateSeconds } from '../../src/engine/speech.js';

const brand = {
  cast: { model: 'eleven_v4', aliases: { narrator: 'pitchman' }, roles: { paramedic: { voiceId: 'v-para' }, doctor: { voiceId: 'v-doc', settings: { stability: 0.4 } }, intake: {} } },
  content: {
    admission: { scenes: [{ id: 'er', lines: [{ voice: 'paramedic', say: 'IT admin, found at their desk.' }, { voice: 'doctor', say: '[sighs] Get them to Intake.' }] }] },
    intake: { voice: 'intake', greeting: ['Hi. I’m Intake.'] },
  },
};

function mockServer() {
  const calls = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const json = JSON.parse(body || '{}');
      calls.push({ url: req.url, key: req.headers['xi-api-key'], json });
      if (!req.url.startsWith('/v1/text-to-speech/')) return res.writeHead(404).end('nope');
      const ends = [...json.text].map((_, i) => +(0.05 * (i + 1)).toFixed(2));
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ audio_base64: Buffer.from('FAKE-MP3 ' + json.text).toString('base64'), alignment: { characters: [...json.text], character_start_times_seconds: ends.map((e) => e - 0.05), character_end_times_seconds: ends } }));
    });
  });
  return new Promise((resolve) => server.listen(0, () => resolve({ server, calls, base: `http://127.0.0.1:${server.address().port}` })));
}

test('stripTags and estimate ignore performance tags', () => {
  assert.equal(stripTags('[sighs] Get  them [whispering] out.'), 'Get them out.');
  assert.equal(estimateSeconds('[laughs nervously] one two three'), estimateSeconds('one two three'));
  assert.equal(lineKey('doctor', 'Get  them out. '), lineKey('doctor', 'Get them out.'));
  assert.notEqual(lineKey('doctor', 'Get them out.'), lineKey('paramedic', 'Get them out.'));
});

test('collectLines merges brand + harvested lines, maps aliases, dedupes', () => {
  const lines = collectLines(brand, [{ role: 'narrator', text: 'Ask your admin.' }, { role: 'pitchman', text: 'Ask your admin.' }]);
  assert.equal(lines.length, 4);
  assert.ok(lines.some((l) => l.role === 'pitchman' && l.text === 'Ask your admin.'));
  const er = brandLines(brand).find((l) => l.role === 'doctor');
  assert.equal(er.prev, 'IT admin, found at their desk.');
  assert.equal(estimate(lines).chars, lines.reduce((n, l) => n + l.text.length, 0));
});

test('render writes clips + manifest, then skips what is done', async () => {
  const { server, calls, base } = await mockServer();
  const dir = await mkdtemp(path.join(tmpdir(), 'voice-'));
  try {
    const lines = collectLines(brand);
    const r1 = await render(lines, { apiKey: 'k-test', base, dir, cast: brand.cast });
    assert.equal(r1.rendered, 2);
    assert.deepEqual(r1.missingVoice, ['intake']);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].key, 'k-test');
    assert.equal(calls[1].json.model_id, 'eleven_v4');
    assert.deepEqual(calls[1].json.voice_settings, { stability: 0.4 });
    assert.equal(calls[1].json.previous_text, 'IT admin, found at their desk.');
    const manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
    const clip = manifest.clips[lineKey('doctor', '[sighs] Get them to Intake.')];
    assert.ok(clip && clip.d > 1);
    assert.equal(clip.t, 'Get them to Intake.');
    assert.equal((await readdir(dir)).filter((f) => f.endsWith('.mp3')).length, 2);
    const r2 = await render(lines, { apiKey: 'k-test', base, dir, cast: brand.cast, voices: { intake: 'v-intake' } });
    assert.equal(r2.skipped, 2);
    assert.equal(r2.rendered, 1);
    assert.equal(calls.length, 3);
    const dry = await render(collectLines(brand, [{ role: 'doctor', text: 'New line.' }]), { dir, cast: brand.cast, voices: { intake: 'v-intake' }, dryRun: true });
    assert.equal(dry.rendered, 1);
    assert.equal(calls.length, 3);
  } finally {
    server.close();
  }
});
