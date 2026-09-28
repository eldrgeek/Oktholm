// Deterministic randomness. "New content every day" without a backend: everyone sees the same
// daily headline / word / shift because they all seed from the same UTC day number.

export function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32: returns a function producing floats in [0, 1). */
export function seeded(seed) {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  const rand = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return withHelpers(rand);
}

export function withHelpers(rand) {
  rand.int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  rand.pick = (arr) => arr[Math.floor(rand() * arr.length)];
  rand.chance = (p) => rand() < p;
  rand.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  rand.sample = (arr, n) => rand.shuffle(arr).slice(0, n);
  return rand;
}

export const random = withHelpers(Math.random);

const DAY = 86400000;

/** Whole UTC days since `epoch` (YYYY-MM-DD). Day 1 is the epoch day itself. */
export function dayNumber(epoch = '2026-09-01', now = Date.now()) {
  const e = Date.UTC(...epoch.split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))));
  return Math.floor((now - e) / DAY) + 1;
}

export function utcDateKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

/** Seeded RNG that changes once per UTC day. `salt` keeps different features from correlating. */
export function daily(salt = '', now = Date.now()) {
  return seeded(`${utcDateKey(now)}:${salt}`);
}

/** Pick today's item from a list, cycling through a per-list shuffled order so nothing repeats until all have aired. */
export function dailyPick(list, salt = '', epoch = '2026-09-01', now = Date.now()) {
  if (!list.length) return undefined;
  const n = dayNumber(epoch, now) - 1;
  const cycle = Math.floor(n / list.length);
  const order = seeded(`${salt}:cycle:${cycle}`).shuffle(list.map((_, i) => i));
  return list[order[((n % list.length) + list.length) % list.length]];
}
