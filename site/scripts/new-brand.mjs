// Scaffold a new brand pack from brands/_template.
//   npm run new-brand -- acme            -> brands/acme/ (then: BRAND=acme npm run build)
import { cpSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = (process.argv[2] || '').trim();
if (!/^[a-z][a-z0-9-]{1,30}$/.test(id)) {
  console.error('Usage: npm run new-brand -- <brand-id>   (lowercase letters, digits, dashes)');
  process.exit(1);
}
const dest = path.join(root, 'brands', id);
if (existsSync(dest)) {
  console.error(`brands/${id} already exists`);
  process.exit(1);
}
cpSync(path.join(root, 'brands', '_template'), dest, { recursive: true });
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(path.join(dir, f)).isDirectory() ? walk(path.join(dir, f)) : [path.join(dir, f)]));
for (const f of walk(dest)) {
  const s = readFileSync(f, 'utf8').replaceAll('__BRAND_ID__', id).replaceAll('__EPOCH__', new Date().toISOString().slice(0, 10));
  writeFileSync(f, s);
}
console.log(`Created brands/${id}. Next:\n  1. Edit brands/${id}/index.js (site, sponsor facts, theme)\n  2. Rewrite brands/${id}/content/index.js for your audience\n  3. BRAND=${id} npm run build`);
