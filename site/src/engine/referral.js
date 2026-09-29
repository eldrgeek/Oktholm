// Identity for the visitor ("Patient ID"), referral attribution, and chips (achievements).
//
// Flow:  A shares a link with ?ref=<A's id>  ->  B lands, we store referredBy=A (first touch wins)
//        -> B completes a qualifying action (diagnosis, a game shift)  ->  POST /api/referral/qualify
//        -> backend credits A once per B, dedupes, and A's sponsor page shows the count + unlocked tiers.
// Without a backend everything still works locally; only cross-visitor credit is missing.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32: no I, L, O, U

function randomChars(n) {
  const out = [];
  const bytes = new Uint8Array(n);
  (globalThis.crypto || window.msCrypto).getRandomValues(bytes);
  for (const b of bytes) out.push(ALPHABET[b % 32]);
  return out.join('');
}

export function makePatientId(prefix = 'PT') {
  const c = randomChars(6);
  return `${prefix}-${c.slice(0, 4)}-${c.slice(4)}`;
}

export function isPatientId(s) {
  return typeof s === 'string' && /^[A-Z]{2,5}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{2}$/.test(s);
}

export function createReferral({ brand, store, api, track, onChip }) {
  const s = store.scope('referral');
  const chipDefs = new Map((brand.content?.chips || []).map((c) => [c.id, c]));
  const prefix = brand.referral?.prefix || 'PT';

  function patientId() {
    let id = s.get('patientId');
    if (!isPatientId(id)) {
      id = s.set('patientId', makePatientId(prefix));
      s.set('admittedAt', Date.now());
    }
    return id;
  }

  function referredBy() {
    return s.get('referredBy', null);
  }

  /** Read ?ref= from the page URL. First touch wins; you cannot refer yourself. */
  function captureFromUrl(search = location.search) {
    const params = new URLSearchParams(search);
    const ref = (params.get('ref') || '').toUpperCase();
    if (!isPatientId(ref) || ref === patientId() || referredBy()) return referredBy();
    const rec = { id: ref, at: Date.now(), via: params.get('utm_source') || params.get('via') || 'link' };
    s.set('referredBy', rec);
    track?.('referral_landed', { ref, via: rec.via });
    api.post('/referral/landed', { patientId: patientId(), ref, via: rec.via });
    return rec;
  }

  function chips() {
    const earned = s.get('chips', {});
    return Object.entries(earned)
      .map(([id, at]) => ({ ...(chipDefs.get(id) || { id, name: id, icon: '●' }), at }))
      .sort((a, b) => a.at - b.at);
  }

  function hasChip(id) {
    return Boolean(s.get('chips', {})[id]);
  }

  function grantChip(id, meta = {}) {
    if (hasChip(id)) return false;
    s.update('chips', (c) => ({ ...c, [id]: Date.now() }), {});
    const def = chipDefs.get(id) || { id, name: id, icon: '●' };
    track?.('chip_granted', { chip: id, ...meta });
    api.post('/event', { type: 'chip', patientId: patientId(), chip: id });
    onChip?.(def);
    return true;
  }

  /** A qualifying action by a referred visitor is what earns their sponsor credit. Sent once per kind. */
  function qualify(kind) {
    const done = s.get('qualified', {});
    if (done[kind]) return;
    s.set('qualified', { ...done, [kind]: Date.now() });
    const ref = referredBy();
    track?.('qualified', { kind, ref: ref?.id || null });
    if (ref) api.post('/referral/qualify', { patientId: patientId(), ref: ref.id, kind });
  }

  function recordShare(platform, kind) {
    const n = s.update('shares', (x) => x + 1, 0);
    if (n === 1) grantChip('spreader');
    track?.('share', { platform, kind });
    api.post('/event', { type: 'share', patientId: patientId(), platform, kind });
    return n;
  }

  /** Server-side sponsor stats, or null when there is no backend. */
  async function stats() {
    return api.get(`/sponsor/${encodeURIComponent(patientId())}`);
  }

  return {
    patientId,
    referredBy,
    captureFromUrl,
    chips,
    hasChip,
    grantChip,
    qualify,
    recordShare,
    stats,
    shares: () => s.get('shares', 0),
    admittedAt: () => s.get('admittedAt', Date.now()),
    chipDef: (id) => chipDefs.get(id),
  };
}
