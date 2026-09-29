// Flat-vector "puppets" shared by the OKTV shows (part of the show kit, see showkit.js).
// person() returns static SVG markup for a character whose head is centred on (0,0), radius 62.
// Everything passed in comes from module code, never from users: this markup is inserted as trusted HTML.

const INK = '#1b1512';

/** Darken (amt < 0) or lighten (amt > 0) a #rrggbb colour. */
export function shade(hex, amt) {
  const n = parseInt(String(hex).slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
}

const HAIR = {
  messy: (c) =>
    `<path fill="${c}" d="M-65 4 C-74 -52 -38 -84 4 -82 C50 -86 78 -52 65 4 C61 -20 51 -33 35 -40 C31 -26 12 -26 2 -43 C-8 -28 -28 -26 -37 -41 C-51 -31 -61 -16 -65 4Z"/>` +
    `<path fill="${c}" d="M-26 -76 L-14 -100 L-2 -80 L14 -102 L22 -79 L36 -92 L34 -70Z"/>`,
  side: (c) => `<path fill="${c}" d="M-65 6 C-72 -58 -32 -86 8 -84 C54 -86 76 -50 65 6 C62 -22 50 -44 22 -50 C-6 -44 -30 -52 -44 -40 C-56 -30 -62 -14 -65 6Z"/>`,
  swoop: (c) =>
    `<path fill="${c}" d="M-66 10 C-76 -58 -34 -92 10 -90 C58 -92 80 -54 66 8 C62 -18 54 -36 40 -44 C20 -60 -20 -70 -36 -44 C-52 -34 -62 -16 -66 10Z"/>` +
    `<path fill="${shade(c, 0.18)}" d="M-30 -62 C-6 -86 36 -82 52 -58 C30 -70 0 -70 -30 -62Z" opacity=".7"/>`,
  bun: (c) =>
    `<circle fill="${c}" cx="0" cy="-86" r="26"/>` +
    `<path fill="${c}" d="M-66 22 C-78 -52 -36 -86 4 -84 C50 -86 80 -52 66 22 C62 -8 56 -30 42 -40 C12 -30 -18 -42 -44 -30 C-56 -16 -62 2 -66 22Z"/>`,
  long: (c) =>
    `<path fill="${c}" d="M-70 90 C-86 10 -82 -60 -30 -82 C10 -96 60 -84 76 -40 C88 -6 84 50 70 90 C66 40 64 0 52 -30 C20 -26 -20 -40 -48 -24 C-60 10 -62 50 -70 90Z"/>`,
  curly: (c) =>
    [[-50, -30, 22], [-30, -58, 24], [0, -68, 26], [30, -58, 24], [52, -32, 22], [-60, -4, 16], [62, -6, 16]]
      .map(([x, y, r]) => `<circle fill="${c}" cx="${x}" cy="${y}" r="${r}"/>`)
      .join(''),
  buzz: (c) => `<path fill="${c}" d="M-63 -6 C-64 -56 -30 -76 4 -76 C40 -76 66 -54 63 -6 C52 -40 30 -52 0 -52 C-30 -52 -52 -40 -63 -6Z"/>`,
  bald: (c) => `<path fill="${c}" d="M-64 10 C-66 -10 -60 -26 -52 -34 C-54 -14 -52 2 -48 16Z M64 10 C66 -10 60 -26 52 -34 C54 -14 52 2 48 16Z"/>`,
};

function eyes(kind, ink, skin, lidClass) {
  switch (kind) {
    case 'tired':
      return (
        `<path d="M-36 7 h22 M14 7 h22" stroke="${ink}" stroke-width="6.5" stroke-linecap="round"/>` +
        `<path d="M-38 21 q12 8 25 0 M13 21 q12 8 25 0" stroke="#7d4f6e" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>` +
        `<path d="M-40 -12 q13 -3 26 4 M14 -8 q13 -7 26 -4" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      );
    case 'happy':
      return (
        `<path d="M-37 9 q12 -15 24 0 M13 9 q12 -15 24 0" stroke="${ink}" stroke-width="6.5" fill="none" stroke-linecap="round"/>` +
        `<path d="M-40 -16 q13 -9 26 -2 M14 -18 q13 -7 26 2" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<circle cx="-38" cy="27" r="10" fill="#ff7a7a" opacity=".32"/><circle cx="38" cy="27" r="10" fill="#ff7a7a" opacity=".32"/>`
      );
    case 'lids':
      // Whites + pupils + eyelids that CSS can close (scaleY) for blinks.
      return (
        `<g><ellipse cx="-24" cy="4" rx="15" ry="12" fill="#fbfaf6"/><ellipse cx="24" cy="4" rx="15" ry="12" fill="#fbfaf6"/>` +
        `<circle cx="-22" cy="6" r="6.5" fill="${ink}"/><circle cx="26" cy="6" r="6.5" fill="${ink}"/>` +
        `<circle cx="-20" cy="4" r="2" fill="#fff"/><circle cx="28" cy="4" r="2" fill="#fff"/>` +
        `<g class="${lidClass}"><path d="M-40 4 C-40 -12 -8 -12 -8 4 Z" fill="${shade(skin, -0.12)}"/><path d="M8 4 C8 -12 40 -12 40 4 Z" fill="${shade(skin, -0.12)}"/>` +
        `<path d="M-40 4 C-40 18 -8 18 -8 4 Z" fill="${shade(skin, -0.12)}"/><path d="M8 4 C8 18 40 18 40 4 Z" fill="${shade(skin, -0.12)}"/>` +
        `<path d="M-40 4 H-8 M8 4 H40" stroke="${shade(skin, -0.45)}" stroke-width="3" stroke-linecap="round"/></g></g>` +
        `<path d="M-42 -16 q16 -8 30 0 M12 -16 q14 -8 30 0" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      );
    case 'wide':
      return (
        `<ellipse cx="-24" cy="4" rx="14" ry="15" fill="#fff"/><ellipse cx="24" cy="4" rx="14" ry="15" fill="#fff"/>` +
        `<circle cx="-24" cy="6" r="6" fill="${ink}"/><circle cx="24" cy="6" r="6" fill="${ink}"/>` +
        `<path d="M-40 -20 q14 -10 28 -2 M12 -22 q14 -8 28 2" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      );
    default:
      return (
        `<circle cx="-23" cy="5" r="6.5" fill="${ink}"/><circle cx="23" cy="5" r="6.5" fill="${ink}"/>` +
        `<path d="M-38 -13 q12 -6 24 -1 M14 -14 q12 -5 24 1" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      );
  }
}

function mouth(kind, ink, mouthClass) {
  if (mouthClass) {
    return `<g class="${mouthClass}"><path d="M-17 33 Q0 50 17 33 Z" fill="#5c1f22"/><path d="M-12 35 h24" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`;
  }
  switch (kind) {
    case 'frown':
      return `<path d="M-14 40 q14 -9 28 0" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case 'flat':
      return `<path d="M-12 37 h24" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`;
    case 'grin':
      return `<path d="M-24 27 Q0 62 24 27 Z" fill="#5c1f22"/><path d="M-20 29 h40 l-3 7 h-34z" fill="#fff"/>`;
    case 'o':
      return `<ellipse cx="0" cy="38" rx="9" ry="11" fill="#5c1f22"/>`;
    case 'smile':
      return `<path d="M-18 30 q18 18 36 0" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    default:
      return `<path d="M-14 34 q14 8 28 0" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
}

function glassesSvg(tint) {
  return (
    `<g fill="${tint || 'rgba(190,215,255,.16)'}" stroke="#16181d" stroke-width="5"><rect x="-45" y="-11" width="37" height="31" rx="11"/><rect x="8" y="-11" width="37" height="31" rx="11"/></g>` +
    `<path d="M-8 1 h16 M-45 2 l-17 -4 M45 2 l17 -4" stroke="#16181d" stroke-width="5" stroke-linecap="round"/>`
  );
}

function torso(style, top, tie, badge) {
  const dark = shade(top, -0.22);
  let s = `<path fill="${top}" d="M-102 320 C-106 176 -74 106 0 98 C74 106 106 176 102 320 Z"/>`;
  if (style === 'suit') {
    s +=
      `<path fill="#f4f6f9" d="M-32 102 L0 178 L32 102 Z"/>` +
      `<path fill="${tie}" d="M-9 112 L9 112 L15 196 L0 214 L-15 196 Z"/><path fill="${shade(tie, -0.25)}" d="M-9 112 L9 112 L6 124 L-6 124Z"/>` +
      `<path fill="${dark}" d="M-32 102 L0 180 L-20 200 L-56 124 Z"/><path fill="${dark}" d="M32 102 L0 180 L20 200 L56 124 Z"/>`;
  } else if (style === 'hoodie') {
    s +=
      `<path fill="${dark}" d="M-56 104 C-44 140 44 140 56 104 C32 120 -32 120 -56 104Z"/>` +
      `<path d="M-15 124 v58 M15 124 v58" stroke="#eef2f7" stroke-width="5" stroke-linecap="round"/>` +
      `<path fill="${dark}" opacity=".5" d="M-62 250 h124 v40 h-124z"/>`;
  } else if (style === 'cardigan') {
    s += `<path fill="#f2efe8" d="M-26 102 L0 150 L26 102 Z"/><path d="M0 150 V320" stroke="${dark}" stroke-width="5"/><circle cx="-10" cy="190" r="4" fill="${dark}"/><circle cx="-10" cy="230" r="4" fill="${dark}"/>`;
  } else {
    s += `<path fill="${dark}" d="M-30 102 C-20 122 20 122 30 102 C16 110 -16 110 -30 102Z"/>`;
  }
  if (badge) {
    s += `<path d="M-30 104 L-2 186 M30 104 L2 186" stroke="${badge}" stroke-width="5" fill="none"/><rect x="-17" y="182" width="34" height="44" rx="5" fill="#fff"/><rect x="-17" y="182" width="34" height="11" rx="3" fill="${badge}"/><rect x="-10" y="200" width="20" height="4" rx="2" fill="#9aa5b4"/><rect x="-10" y="209" width="14" height="4" rx="2" fill="#9aa5b4"/>`;
  }
  return s;
}

function arm(kind, top, skin, side = 1) {
  const S = (d) => `<path d="${d}" stroke="${top}" stroke-width="36" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const H = (x, y, r = 20) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${skin}"/>`;
  const m = (x) => x * side;
  switch (kind) {
    case 'chin':
      return S(`M${m(-86)} 150 C${m(-124)} 236 ${m(-66)} 262 ${m(-38)} 206 L${m(-24)} 92`) + H(m(-22), 74, 22);
    case 'wave':
      return S(`M${m(86)} 146 C${m(124)} 116 ${m(134)} 66 ${m(128)} -6`) + H(m(128), -22, 22);
    case 'hold':
      return S(`M${m(86)} 150 C${m(112)} 222 ${m(76)} 254 ${m(42)} 244`) + H(m(38), 238, 21);
    case 'kite':
      return S(`M${m(86)} 146 C${m(122)} 126 ${m(150)} 86 ${m(168)} 44`) + H(m(172), 32, 20);
    case 'leash':
      return S(`M${m(88)} 150 C${m(112)} 200 ${m(126)} 236 ${m(138)} 262`) + H(m(140), 274, 19);
    case 'down':
      return S(`M${m(90)} 146 C${m(106)} 200 ${m(106)} 250 ${m(100)} 292`) + H(m(100), 304, 19);
    case 'desk':
      return S(`M${m(88)} 150 C${m(114)} 230 ${m(96)} 270 ${m(40)} 292`) + H(m(34), 292, 20);
    case 'fold':
      return S(`M${m(-88)} 150 C${m(-110)} 236 ${m(-60)} 262 ${m(30)} 262`) + H(m(34), 262, 20);
    default:
      return '';
  }
}

function legsSvg(pants, shoes, walkClass) {
  const leg = (x1, x2, c) => `<path class="${walkClass ? walkClass + '-leg ' + walkClass + '-leg--' + c : ''}" d="M${x1} 290 L${x2} 470" stroke="${pants}" stroke-width="46" stroke-linecap="round"/>`;
  return `<g>${leg(-34, -40, 'l')}${leg(34, 40, 'r')}<ellipse cx="-46" cy="486" rx="34" ry="14" fill="${shoes}"/><ellipse cx="46" cy="486" rx="34" ry="14" fill="${shoes}"/></g>`;
}

/**
 * person({ x, y, s, flip, skin, hair, hairStyle, top, topStyle, tie, badge, eyes, mouth, glasses, glassTint,
 *          arms: [left, right], legs, pants, shoes, walkClass, lidClass, mouthClass, cls, headCls })
 */
export function person(o = {}) {
  const {
    x = 0,
    y = 0,
    s = 1,
    flip = false,
    skin = '#c98f65',
    hair = '#231a15',
    hairStyle = 'messy',
    top = '#3f6f8f',
    topStyle = 'tee',
    tie = '#4263eb',
    badge = '',
    eyes: eyeKind = 'dot',
    mouth: mouthKind = 'smile',
    glasses = false,
    glassTint = '',
    arms = [],
    legs = false,
    pants = '#2d3446',
    shoes = '#1d2027',
    walkClass = '',
    lidClass = 'lid',
    mouthClass = '',
    cls = '',
    headCls = '',
    ink = INK,
  } = o;
  const sk = shade(skin, -0.14);
  const [armL, armR] = arms;
  const front = ['chin', 'fold'];
  return (
    `<g class="${cls}" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">` +
    (legs ? legsSvg(pants, shoes, walkClass) : '') +
    (armL && !front.includes(armL) ? arm(armL, top, skin, -1) : '') +
    (armR && !front.includes(armR) ? arm(armR, top, skin, 1) : '') +
    torso(topStyle, top, tie, badge) +
    `<rect x="-20" y="40" width="40" height="66" rx="16" fill="${sk}"/>` +
    `<g class="${headCls}">` +
    `<circle cx="-61" cy="8" r="13" fill="${sk}"/><circle cx="61" cy="8" r="13" fill="${sk}"/>` +
    `<circle r="62" fill="${skin}"/>` +
    (HAIR[hairStyle] ? HAIR[hairStyle](hair) : '') +
    eyes(eyeKind, ink, skin, lidClass) +
    mouth(mouthKind, ink, mouthClass) +
    (glasses ? glassesSvg(glassTint) : '') +
    `</g>` +
    (armL && front.includes(armL) ? arm(armL, top, skin, 1) : '') +
    (armR && front.includes(armR) ? arm(armR, top, skin, -1) : '') +
    `</g>`
  );
}
