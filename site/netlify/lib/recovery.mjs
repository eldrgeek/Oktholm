// Recovery Network backend logic: referral credit, sponsor stats, leaderboard, confessions, reactions.
// Storage-agnostic: works against any store implementing
//   get(key) -> value|null
//   update(key, fn(current|null) -> next) -> next      (atomic read-modify-write; adapters retry on conflict)
//   putIfNew(key, value) -> boolean                   (true if created)
//   list(prefix) -> [{ key, value }]
//   del(key)
// Brand-agnostic: it only knows patient IDs. Reward tiers are computed by the frontend from brand content.
//
// Fraud posture: this is a marketing toy. Chips are cheap; anything physical must be verified by a human
// (e.g. confirm the sponsees are distinct real people) before shipping a hoodie or a Big Red Button.

export const PATIENT_ID = /^[A-Z]{2,5}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{2}$/;
export const CREDIT_KINDS = new Set(['diagnosis']);
// Per-IP daily budgets, kept separate so a chatty player can't exhaust the budget that earns credit.
export const LIMITS = { perIpPerDay: { credit: 40, event: 300, ugc: 60 }, confessionMax: 280, whoMax: 60, leaderboardSize: 50 };
const REACTIONS = new Set(['same', 'oof', 'dead']);

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const day = (now) => new Date(now).toISOString().slice(0, 10);

function assertId(id, field) {
  if (typeof id !== 'string' || !PATIENT_ID.test(id)) throw new HttpError(400, `invalid ${field}`);
  return id;
}

function clean(text, max) {
  return String(text ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function createRecovery(store, { now = () => Date.now() } = {}) {
  async function rateLimit(ipHash, bucket) {
    if (!ipHash) return;
    const n = await store.update(`rl:${day(now())}:${bucket}:${ipHash}`, (c) => (c || 0) + 1);
    if (n > LIMITS.perIpPerDay[bucket]) throw new HttpError(429, 'slow down, patient');
  }

  async function bumpLeaderboard(id, count) {
    await store.update('leaderboard', (lb) => {
      const top = (lb?.top || []).filter((r) => r.id !== id);
      top.push({ id, count });
      top.sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
      return { top: top.slice(0, LIMITS.leaderboardSize), updatedAt: now() };
    });
  }

  return {
    /** A visitor arrived via someone's link. Counted once per (ref, visitor). */
    async landed({ patientId, ref, via }, { ipHash } = {}) {
      assertId(patientId, 'patientId');
      assertId(ref, 'ref');
      if (patientId === ref) throw new HttpError(400, 'self-referral');
      await rateLimit(ipHash, 'credit');
      const fresh = await store.putIfNew(`landed:${ref}:${patientId}`, { at: now(), via: clean(via, 24) });
      if (fresh) await store.update(`sponsor:${ref}`, (s) => ({ ...(s || { sponsees: 0, landed: 0 }), landed: (s?.landed || 0) + 1, updatedAt: now() }));
      return { ok: true, counted: fresh };
    },

    /** A referred visitor did something meaningful. Only CREDIT_KINDS earn sponsor credit, once per visitor ever. */
    async qualify({ patientId, ref, kind }, { ipHash } = {}) {
      assertId(patientId, 'patientId');
      assertId(ref, 'ref');
      if (patientId === ref) throw new HttpError(400, 'self-referral');
      const k = clean(kind, 40);
      await rateLimit(ipHash, 'credit');
      await store.update(`event:${day(now())}:qualify:${k}`, (c) => (c || 0) + 1);
      if (!CREDIT_KINDS.has(k)) return { ok: true, credited: false };
      // First sponsor to get credit for this patient keeps it; clearing localStorage makes a new patient,
      // which is why the per-IP limit exists and why physical rewards need human verification.
      const created = await store.putIfNew(`patient:${patientId}`, { sponsor: ref, kind: k, at: now(), ipHash: ipHash || null });
      if (!created) return { ok: true, credited: false, reason: 'already-credited' };
      const s = await store.update(`sponsor:${ref}`, (cur) => ({ ...(cur || { landed: 0 }), sponsees: (cur?.sponsees || 0) + 1, updatedAt: now() }));
      await bumpLeaderboard(ref, s.sponsees);
      return { ok: true, credited: true, sponsees: s.sponsees };
    },

    async sponsor(id) {
      assertId(id, 'id');
      const s = (await store.get(`sponsor:${id}`)) || {};
      return { id, sponsees: s.sponsees || 0, landed: s.landed || 0 };
    },

    async leaderboard(limit = 10) {
      const lb = (await store.get('leaderboard')) || { top: [] };
      return { top: lb.top.slice(0, Math.min(limit, LIMITS.leaderboardSize)).map((r) => ({ name: r.id, count: r.count })) };
    },

    async event({ type, patientId }, { ipHash } = {}) {
      const t = clean(type, 24).replace(/[^\w-]/g, '');
      if (!t) throw new HttpError(400, 'invalid type');
      if (patientId !== undefined) assertId(patientId, 'patientId');
      await rateLimit(ipHash, 'event');
      await store.update(`event:${day(now())}:${t}`, (c) => (c || 0) + 1);
      return { ok: true };
    },

    async confess({ text, who, patientId }, { ipHash } = {}) {
      const t = clean(text, LIMITS.confessionMax);
      if (t.length < 12) throw new HttpError(400, 'too short');
      if (patientId !== undefined) assertId(patientId, 'patientId');
      await rateLimit(ipHash, 'ugc');
      const key = `confession:pending:${now()}:${Math.random().toString(36).slice(2, 8)}`;
      await store.putIfNew(key, { text: t, who: clean(who, LIMITS.whoMax) || 'Anonymous', patientId: patientId || null, at: now() });
      return { ok: true, status: 'pending' };
    },

    async approved(limit = 50) {
      const rows = await store.list('confession:approved:');
      return {
        items: rows
          .map((r) => r.value)
          .sort((a, b) => b.at - a.at)
          .slice(0, limit)
          .map(({ text, who, at }) => ({ text, who, at })),
      };
    },

    async pending() {
      return { items: (await store.list('confession:pending:')).map((r) => ({ key: r.key, ...r.value })) };
    },

    async moderate({ key, approve }) {
      if (typeof key !== 'string' || !key.startsWith('confession:pending:')) throw new HttpError(400, 'invalid key');
      const item = await store.get(key);
      if (!item) throw new HttpError(404, 'not found');
      if (approve) await store.putIfNew(key.replace(':pending:', ':approved:'), item);
      await store.del(key);
      return { ok: true };
    },

    async react({ key, reaction }, { ipHash } = {}) {
      if (typeof key !== 'string' || !/^[\w:.-]{1,80}$/.test(key)) throw new HttpError(400, 'invalid key');
      if (!REACTIONS.has(reaction)) throw new HttpError(400, 'invalid reaction');
      await rateLimit(ipHash, 'ugc');
      const counts = await store.update(`react:${key}`, (c) => ({ ...(c || {}), [reaction]: ((c || {})[reaction] || 0) + 1 }));
      return { ok: true, counts };
    },
  };
}

/** In-memory store with the same contract (tests, local dev). */
export function memoryStore() {
  const m = new Map();
  const clone = (v) => (v == null ? null : JSON.parse(JSON.stringify(v)));
  return {
    async get(k) {
      return clone(m.get(k) ?? null);
    },
    async update(k, fn) {
      const next = fn(clone(m.get(k) ?? null));
      m.set(k, clone(next));
      return clone(next);
    },
    async putIfNew(k, v) {
      if (m.has(k)) return false;
      m.set(k, clone(v));
      return true;
    },
    async list(prefix) {
      return [...m.entries()].filter(([k]) => k.startsWith(prefix)).map(([key, value]) => ({ key, value: clone(value) }));
    },
    async del(k) {
      m.delete(k);
    },
    _map: m,
  };
}
