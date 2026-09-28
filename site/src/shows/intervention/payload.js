// Intervention share payloads: base64url(JSON { n, r, rel, s, t, f }).
//   n   friend's first name        r   role index            rel  relationship index
//   s   symptom ids (1-5)          t   tone index            f    sender's name (optional)
// Everything decoded from a URL is untrusted: validate strictly, never render it as HTML.
// Pure functions only (no DOM) so they can be unit-tested in Node.

export const NAME_MAX = 24;
export const SYMPTOMS_MAX = 5;
const PAYLOAD_MAX = 1024; // characters of base64url; a real payload is ~150-250

// Letters (any script, precomposed or combining accents), spaces, hyphens, apostrophes, periods.
const NAME_CHARS = /^[\p{L}\p{M} '’.-]+$/u;
const HAS_LETTER = /\p{L}/u;

/** Trim, NFC-normalise and check a name. Returns the clean name or null. */
export function cleanName(value) {
  if (typeof value !== 'string' || value.length > 96) return null;
  let s = value.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (!s || [...s].length > NAME_MAX) return null;
  if (!NAME_CHARS.test(s) || !HAS_LETTER.test(s)) return null;
  return s;
}

// ---------- Tiny profanity / slur blocklist ----------
// Stored ROT13 so the source isn't a wall of slurs. ROOTS match inside a word; WORDS must match a whole word,
// so real names that merely contain a bad substring (Cassandra, Yoshito, Nazira, Faggin) are left alone.
const rot13 = (s) => s.replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97));
const ROOTS = (
  'shpx phag ovgpu jubenr avttre avttn snttbg ergneq encvfg uvgyre nffubyr onfgneq qbhpur wvmm qvyqb chffl cravf ' +
  'intvan genaal jrgonpx enturnq gbjryurnq zbgures jnaxre obyybpxf gjng'
)
  .split(' ')
  .map(rot13);
const WORDS = new Set(
  (
    'fuvg fuvggl fyhg nff gvgf phz pbpx encr anmv jnax cbea snt xvxr fcvp puvax qlxr tbbx pbba cnxv frk nany obbo ' +
    'obbof ohgg cbbc vqvbg zbeba fghcvq qhzo ybfre penc cvff cevpx fynt fxnax gbffre nefr ohttre penpxre ornare'
  )
    .split(' ')
    .map(rot13),
);

const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** True if a name contains a blocked word. */
export function isBlocked(name) {
  const folded = fold(String(name || ''));
  const tokens = folded.split(/[^a-z]+/).filter(Boolean);
  const check = (t) => WORDS.has(t) || ROOTS.some((r) => t.includes(r));
  if (tokens.some(check)) return true;
  // Spaced-out evasions ("f u c k"): if most tokens are single letters, also test them joined.
  const singles = tokens.filter((t) => t.length === 1).length;
  return tokens.length > 1 && singles * 2 >= tokens.length && check(tokens.join(''));
}

// ---------- base64url <-> UTF-8 ----------
function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

const index = (v, len) => (Number.isInteger(v) && v >= 0 && v < len ? v : -1);

/**
 * Validate a decoded (or form-built) config against the brand's option lists.
 * `lists` = { roles: n, relationships: n, tones: n, symptomIds: Set|Array }.
 * Returns { ok: true, value } or { ok: false, reason }.
 */
export function validateConfig(obj, lists) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, reason: 'shape' };
  let n = cleanName(obj.n);
  if (!n) return { ok: false, reason: 'name' };
  const r = index(obj.r, lists.roles);
  const rel = index(obj.rel, lists.relationships);
  const t = index(obj.t, lists.tones);
  if (r < 0 || rel < 0 || t < 0) return { ok: false, reason: 'index' };
  if (!Array.isArray(obj.s) || obj.s.length < 1 || obj.s.length > SYMPTOMS_MAX) return { ok: false, reason: 'symptoms' };
  const known = lists.symptomIds instanceof Set ? lists.symptomIds : new Set(lists.symptomIds || []);
  if (obj.s.some((id) => typeof id !== 'string' || id.length > 40)) return { ok: false, reason: 'symptoms' };
  // Unknown ids are dropped (content can evolve); duplicates collapse; at least one must survive.
  const s = [...new Set(obj.s.filter((id) => known.has(id)))];
  if (!s.length) return { ok: false, reason: 'symptoms' };
  let f = obj.f == null || obj.f === '' ? '' : cleanName(obj.f) || '';
  if (isBlocked(n)) n = 'Friend';
  if (f && isBlocked(f)) f = '';
  return { ok: true, value: { n, r, rel, s, t, f } };
}

/** Encode a validated config into the URL-safe payload. */
export function encodePayload(cfg) {
  const o = { n: cfg.n, r: cfg.r, rel: cfg.rel, s: cfg.s, t: cfg.t };
  if (cfg.f) o.f = cfg.f;
  return toBase64Url(JSON.stringify(o));
}

/** Decode + strictly validate a payload string from a URL. Never throws. */
export function decodePayload(raw, lists) {
  if (typeof raw !== 'string') return { ok: false, reason: 'missing' };
  const s = raw.trim();
  if (!s || s.length > PAYLOAD_MAX || !/^[A-Za-z0-9_-]+$/.test(s)) return { ok: false, reason: 'format' };
  let obj;
  try {
    obj = JSON.parse(fromBase64Url(s));
  } catch {
    return { ok: false, reason: 'decode' };
  }
  return validateConfig(obj, lists);
}
