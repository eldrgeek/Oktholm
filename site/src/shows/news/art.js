// Scene art for Oktholm Nightly News. Static, trusted SVG only; every word on screen is an HTML overlay.
import { person } from '../commercial/puppet.js';

const V = 'viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"';

// Deterministic pseudo-random so the skyline is the same on every render.
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function skyline(x0, x1, base, seed, maxH, color, lit) {
  const r = lcg(seed);
  let x = x0;
  let out = '';
  while (x < x1) {
    const w = 50 + Math.floor(r() * 70);
    const h = 90 + Math.floor(r() * maxH);
    out += `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${color}"/>`;
    if (r() > 0.55) out += `<rect x="${x + w / 2 - 2}" y="${base - h - 26}" width="4" height="26" fill="${color}"/>`;
    for (let wy = base - h + 14; wy < base - 12; wy += 22) {
      for (let wx = x + 8; wx < x + w - 10; wx += 16) if (r() < lit) out += `<rect x="${wx}" y="${wy}" width="7" height="10" fill="${r() < 0.8 ? '#ffd88a' : '#9fd4ff'}" opacity="${(0.45 + r() * 0.5).toFixed(2)}"/>`;
    }
    x += w + 6;
  }
  return out;
}

export const ANCHOR = { x: 1010, y: 372, s: 1.2 };

export function desk() {
  const a = ANCHOR;
  const graph = (x, y) =>
    `<g transform="translate(${x} ${y})"><rect width="220" height="150" rx="8" fill="#08142c" stroke="#244a86" stroke-width="4"/><path d="M16 118 L52 96 L86 104 L118 62 L150 78 L184 34 L204 40" stroke="#ff5a5a" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M16 128 H204" stroke="#244a86" stroke-width="3"/><circle cx="184" cy="34" r="7" fill="#ff5a5a"/><rect x="16" y="14" width="80" height="10" rx="5" fill="#3d6bc4"/></g>`;
  const bars = (x, y) =>
    `<g transform="translate(${x} ${y})"><rect width="220" height="150" rx="8" fill="#08142c" stroke="#244a86" stroke-width="4"/>${[30, 60, 44, 88, 70, 104]
      .map((h, i) => `<rect x="${20 + i * 32}" y="${130 - h}" width="20" height="${h}" rx="3" fill="${i === 5 ? '#ffb627' : '#4dabf7'}"/>`)
      .join('')}<rect x="16" y="14" width="64" height="10" rx="5" fill="#3d6bc4"/></g>`;
  return `<svg ${V}>
  <defs>
    <linearGradient id="nw-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1a3d"/><stop offset="1" stop-color="#040915"/></linearGradient>
    <linearGradient id="nw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101f4d"/><stop offset=".7" stop-color="#3a2a6e"/><stop offset="1" stop-color="#b0507a"/></linearGradient>
    <clipPath id="nw-wallclip"><path d="M110 96 Q800 40 1490 96 L1490 660 Q800 612 110 660 Z"/></clipPath>
    <linearGradient id="nw-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18264a"/><stop offset="1" stop-color="#070d1f"/></linearGradient>
    <linearGradient id="nw-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a5aa8"/><stop offset="1" stop-color="#1a2a55"/></linearGradient>
    <radialGradient id="nw-spot" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".22"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#nw-bg)"/>
  <g clip-path="url(#nw-wallclip)">
    <rect x="100" y="40" width="1400" height="640" fill="url(#nw-sky)"/>
    <circle cx="1230" cy="190" r="46" fill="#f4f0ff" opacity=".85"/>
    <g opacity=".55">${skyline(100, 1500, 640, 7, 230, '#1c2150', 0.25)}</g>
    ${skyline(100, 1500, 660, 42, 300, '#0d1030', 0.33)}
    <g stroke="#6fa3ff" stroke-width="1.5" opacity=".12">${Array.from({ length: 23 }, (_, i) => `<path d="M${110 + i * 64} 40 V680"/>`).join('')}${Array.from({ length: 11 }, (_, i) => `<path d="M100 ${60 + i * 60} H1500"/>`).join('')}</g>
    ${graph(160, 150)}${bars(1220, 150)}
  </g>
  <path d="M110 96 Q800 40 1490 96" stroke="#4dabf7" stroke-width="6" fill="none" opacity=".7"/>
  <path d="M110 660 Q800 612 1490 660" stroke="#4dabf7" stroke-width="6" fill="none" opacity=".5"/>
  <polygon points="620,0 780,0 1180,900 420,900" fill="url(#nw-spot)"/>
  ${person({ x: a.x, y: a.y, s: a.s, skin: '#c98a5e', hair: '#2e211a', hairStyle: 'swoop', top: '#1f2a44', topStyle: 'suit', tie: '#c92a2a', eyes: 'dot', mouthClass: 'nw-mouth', arms: ['desk', 'desk'], headCls: 'nw-head' })}
  <path d="M170 650 Q800 600 1430 650 L1450 712 Q800 662 150 712 Z" fill="url(#nw-top)"/>
  <path d="M150 712 Q800 662 1450 712 L1500 900 H100 Z" fill="url(#nw-desk)"/>
  <path d="M142 770 Q800 718 1458 770" stroke="#4dabf7" stroke-width="5" fill="none" opacity=".75"/>
  <path d="M150 712 Q800 662 1450 712" stroke="#9cc3ff" stroke-width="3" fill="none" opacity=".6"/>
  <g transform="translate(860 612) rotate(-3)"><rect width="150" height="46" rx="3" fill="#f4f6fb"/><rect x="10" y="10" width="110" height="5" rx="2.5" fill="#aab4c6"/><rect x="10" y="22" width="90" height="5" rx="2.5" fill="#aab4c6"/></g>
  <g transform="translate(1180 596)"><rect width="46" height="54" rx="8" fill="#e9edf5"/><path d="M46 12 q20 0 20 16 q0 16 -20 16" stroke="#e9edf5" stroke-width="7" fill="none"/><rect y="14" width="46" height="12" fill="#c92a2a"/></g>
</svg>`;
}

// Outbreak Weather map of the org. Region anchor points are in % of the frame (see REGION_AT).
export const REGION_AT = {
  helpdesk: [23.6, 34.5],
  finance: [46.2, 31.4],
  engineering: [19.7, 52.5],
  hq: [33.7, 47.8],
  marketing: [48.6, 50.1],
  sales: [35.3, 66.5],
  remote: [60.3, 64.9],
  closet: [12.7, 72.7],
  all: [34.5, 50.1],
};

export function weather() {
  return `<svg ${V}>
  <defs>
    <linearGradient id="nw-sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e3a6e"/><stop offset="1" stop-color="#0a2548"/></linearGradient>
    <linearGradient id="nw-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fbf73"/><stop offset="1" stop-color="#3f9b57"/></linearGradient>
    <pattern id="nw-grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0 H0 V80" stroke="#6fa3ff" stroke-width="1.5" fill="none" opacity=".18"/></pattern>
  </defs>
  <rect width="1600" height="900" fill="url(#nw-sea)"/>
  <rect width="1600" height="900" fill="url(#nw-grid)"/>
  <g transform="translate(53 100) scale(.78)">
  <path d="M190 300 C230 170 400 120 560 150 C680 104 850 110 980 176 C1100 214 1150 320 1120 430 C1156 552 1080 668 930 700 C800 772 610 752 506 700 C380 730 250 668 220 560 C160 480 150 380 190 300 Z" fill="url(#nw-land)" stroke="#bff0c8" stroke-width="6"/>
  <path d="M1150 580 c40 -20 90 0 90 30 c0 34 -60 44 -96 26 c-24 -12 -20 -44 6 -56Z M1250 668 c30 -10 60 6 56 26 c-4 22 -44 26 -64 12 c-14 -10 -10 -32 8 -38Z" fill="url(#nw-land)" stroke="#bff0c8" stroke-width="5"/>
  <path d="M150 700 c26 -12 56 2 54 22 c-2 22 -40 26 -58 12 c-12 -10 -10 -28 4 -34Z" fill="url(#nw-land)" stroke="#bff0c8" stroke-width="5"/>
  <g stroke="#e8fff0" stroke-width="4" stroke-dasharray="14 12" fill="none" opacity=".7">
    <path d="M520 150 C540 260 500 330 540 400"/><path d="M190 420 C300 400 420 420 540 400"/><path d="M540 400 C640 380 760 360 800 300 C840 250 900 220 980 176"/>
    <path d="M800 300 C830 400 820 480 860 560 C880 620 920 660 930 700"/><path d="M540 400 C560 500 500 560 506 700"/><path d="M506 600 C640 580 760 600 860 560"/>
  </g>
  <g class="nw-front nw-front--cold"><path d="M250 250 C360 300 400 380 380 470" stroke="#4dabf7" stroke-width="8" fill="none"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M${285 + i * 22} ${275 + i * 44} l26 -6 l-10 24z" fill="#4dabf7"/>`).join('')}</g>
  <g class="nw-front nw-front--warm"><path d="M780 180 C860 230 900 300 920 380" stroke="#ff6b6b" stroke-width="8" fill="none"/>${[0, 1, 2, 3].map((i) => `<circle cx="${812 + i * 30}" cy="${204 + i * 44}" r="13" fill="#ff6b6b"/>`).join('')}</g>
  <text x="1070" y="160" font-size="96" text-anchor="middle" fill="#ffffff" opacity=".22" font-family="Anton, Impact, sans-serif">H</text>
  <text x="300" y="640" font-size="96" text-anchor="middle" fill="#ffffff" opacity=".22" font-family="Anton, Impact, sans-serif">L</text>
  </g>
  ${person({ x: 1370, y: 380, s: 1.05, flip: true, skin: '#8d5a3b', hair: '#1c1410', hairStyle: 'long', top: '#0f7a78', topStyle: 'cardigan', eyes: 'happy', mouthClass: 'nw-mouth', arms: ['down', 'wave'], headCls: 'nw-head' })}
</svg>`;
}

export function chart() {
  return `<svg viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <g stroke="#2d4f8f" stroke-width="2" opacity=".6">${Array.from({ length: 9 }, (_, i) => `<path d="M60 ${40 + i * 60} H960"/>`).join('')}${Array.from({ length: 10 }, (_, i) => `<path d="M${60 + i * 100} 40 V520"/>`).join('')}</g>
  <path class="nw-line" d="M60 470 L160 452 L260 460 L360 420 L460 430 L560 360 L660 330 L760 240 L860 170 L960 60" stroke="#ff4d4d" stroke-width="10" fill="none" stroke-linejoin="round" stroke-linecap="round" pathLength="1"/>
  <path d="M60 470 L160 452 L260 460 L360 420 L460 430 L560 360 L660 330 L760 240 L860 170 L960 60 V520 H60Z" fill="#ff4d4d" opacity=".12"/>
  <circle class="nw-dot" cx="960" cy="60" r="16" fill="#ff4d4d"/>
</svg>`;
}

export function field() {
  const r = lcg(99);
  let wins = '';
  for (let y = 200; y < 700; y += 58) for (let x = 520; x < 1080; x += 70) if (r() < 0.6) wins += `<rect x="${x}" y="${y}" width="40" height="32" fill="${r() < 0.2 ? '#9fd4ff' : '#ffd88a'}" opacity="${(0.5 + r() * 0.4).toFixed(2)}"/>`;
  return `<svg ${V}>
  <defs><linearGradient id="nw-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1330"/><stop offset="1" stop-color="#27264f"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#nw-night)"/>
  <rect x="480" y="150" width="640" height="600" fill="#1b1f38"/><rect x="480" y="150" width="640" height="24" fill="#2a3056"/>
  ${wins}
  <rect x="740" y="620" width="120" height="130" fill="#ffe7a8" opacity=".85"/>
  <rect x="0" y="740" width="1600" height="160" fill="#15162a"/>
  <path d="M0 790 H1600" stroke="#ffd400" stroke-width="18" stroke-dasharray="60 40" opacity=".85"/>
  <circle cx="1300" cy="200" r="110" fill="#ff4d4d" opacity=".10"/><circle cx="300" cy="260" r="140" fill="#4dabf7" opacity=".10"/>
</svg>`;
}
