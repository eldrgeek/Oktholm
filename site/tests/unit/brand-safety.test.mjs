// The parodied vendor is never named anywhere a visitor can see: not in copy, not in the shipped bundle.
// The banned list lives here (tests never ship), not in brand data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BANNED = [/\bokta\b/i, /\bauth0\b/i];
const TEXT = /\.(js|mjs|css|html|json|txt|md|svg)$/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (TEXT.test(name)) yield p;
  }
}

test('no banned vendor names in shipped sources', () => {
  const hits = [];
  for (const dir of ['src', 'brands', 'netlify', 'public']) {
    for (const f of walk(path.join(root, dir))) {
      const text = readFileSync(f, 'utf8');
      for (const re of BANNED) if (re.test(text)) hits.push(`${path.relative(root, f)}: ${re}`);
    }
  }
  assert.deepEqual(hits, []);
});

test('no banned vendor names in the built bundle (when built)', (t) => {
  const f = path.join(root, 'dist', 'index.html');
  if (!existsSync(f)) return t.skip('no build');
  const html = readFileSync(f, 'utf8');
  for (const re of BANNED) assert.ok(!re.test(html), `dist/index.html matches ${re}`);
});
