// Netlify Blobs adapter for the recovery store contract. Uses ETag compare-and-swap
// (setJSON onlyIfMatch / onlyIfNew) so concurrent increments don't lose updates.

import { getStore } from '@netlify/blobs';

const enc = (k) => k.replace(/:/g, '/'); // blob keys read nicer as paths; list() works by prefix
const dec = (k) => k.replace(/\//g, ':');

export function blobStore(name = 'recovery') {
  const store = getStore({ name, consistency: 'strong' });
  return {
    async get(key) {
      return (await store.get(enc(key), { type: 'json' })) ?? null;
    },
    async update(key, fn, attempts = 6) {
      for (let i = 0; i < attempts; i++) {
        const cur = await store.getWithMetadata(enc(key), { type: 'json' });
        const next = fn(cur?.data ?? null);
        const res = cur ? await store.setJSON(enc(key), next, { onlyIfMatch: cur.etag }) : await store.setJSON(enc(key), next, { onlyIfNew: true });
        // Older SDKs return undefined (no conditional support): treat as success.
        if (!res || res.modified !== false) return next;
        await new Promise((r) => setTimeout(r, 15 * (i + 1) + Math.random() * 20));
      }
      throw new Error(`blob update contention on ${key}`);
    },
    async putIfNew(key, value) {
      const res = await store.setJSON(enc(key), value, { onlyIfNew: true });
      return !res || res.modified !== false;
    },
    async list(prefix) {
      const { blobs } = await store.list({ prefix: enc(prefix) });
      return Promise.all(blobs.map(async (b) => ({ key: dec(b.key), value: await store.get(b.key, { type: 'json' }) })));
    },
    async del(key) {
      await store.delete(enc(key));
    },
  };
}
