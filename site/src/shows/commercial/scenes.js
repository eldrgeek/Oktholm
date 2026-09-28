// Scene art for the commercial: static, trusted SVG markup only (no brand or user strings in here).
// Every scene is drawn on a 1600x900 canvas so HTML overlays can be positioned in percentages.
import { person } from './puppet.js';

const V = 'viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"';

export const ADMIN = {
  skin: '#c98f65',
  hair: '#231a15',
  hairStyle: 'messy',
  top: '#3f6f8f',
  topStyle: 'hoodie',
  glasses: true,
  pants: '#2f3a52',
};

const admin = (o) => person({ ...ADMIN, ...o });

// Outer <g> carries the SVG transform; the inner one is free for CSS animation (a CSS transform would replace the attribute).
const capsule = (x, y, r, s = 1, cls = 'cm-capsule') =>
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><g class="${cls}"><rect x="-44" y="-17" width="88" height="34" rx="17" fill="#fff"/><path d="M0 -17 h27 a17 17 0 0 1 0 34 h-27 z" fill="#4263eb"/><rect x="-36" y="-11" width="30" height="6" rx="3" fill="#fff" opacity=".7"/></g></g>`;

export function bottle(x, y, s = 1) {
  const ridges = Array.from({ length: 15 }, (_, i) => `<path d="M${-116 + i * 16.5} -262 v74" stroke="#e1e4ec" stroke-width="5"/>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="318" rx="190" ry="26" fill="#6b4a8a" opacity=".16"/>
    <rect x="-150" y="-196" width="300" height="506" rx="44" fill="url(#cm-amber)"/>
    <g opacity=".5">${capsule(-80, 262, 12, 0.8, '')}${capsule(40, 276, -18, 0.8, '')}${capsule(95, 240, 40, 0.7, '')}</g>
    <rect x="-150" y="-196" width="300" height="506" rx="44" fill="url(#cm-amber-shine)"/>
    <rect x="-112" y="-212" width="224" height="30" rx="8" fill="#ececf2"/>
    <rect x="-130" y="-276" width="260" height="84" rx="16" fill="#fbfbfd"/>
    ${ridges}
    <rect x="-130" y="-276" width="260" height="16" rx="8" fill="#fff"/>
    <rect x="-132" y="-104" width="264" height="300" rx="16" fill="#fffdf9"/>
    <rect x="-132" y="-104" width="264" height="44" rx="16" fill="#4263eb"/><rect x="-132" y="-78" width="264" height="18" fill="#4263eb"/>
    <rect x="-128" y="-176" width="26" height="470" rx="13" fill="#fff" opacity=".32"/>
  </g>`;
}

const DEFS = `<defs>
  <linearGradient id="cm-amber" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e88a2c"/><stop offset=".55" stop-color="#f4a94e"/><stop offset="1" stop-color="#c96a17"/></linearGradient>
  <linearGradient id="cm-amber-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#6b2d00" stop-opacity=".18"/></linearGradient>
</defs>`;

export function gloom() {
  const winLights = [
    [148, 350], [170, 350], [148, 390], [226, 300], [248, 300], [226, 340], [248, 420], [300, 372], [330, 372], [360, 410], [300, 450], [398, 320], [420, 360], [398, 440], [470, 398], [500, 398], [540, 440], [470, 470],
  ]
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="12" height="16" rx="2"/>`)
    .join('');
  const keys = Array.from({ length: 3 }, (_, r) => Array.from({ length: 14 }, (_, k) => `<rect x="${846 + k * 27}" y="${700 + r * 15}" width="21" height="10" rx="3"/>`).join('')).join('');
  return `<svg ${V}>
  <defs>
    <linearGradient id="cm-g-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2737"/><stop offset="1" stop-color="#0b1018"/></linearGradient>
    <linearGradient id="cm-g-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c3f5a"/><stop offset="1" stop-color="#101827"/></linearGradient>
    <radialGradient id="cm-g-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#6aa2ff" stop-opacity=".40"/><stop offset="1" stop-color="#6aa2ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="cm-g-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2c24"/><stop offset="1" stop-color="#120d0a"/></linearGradient>
    <radialGradient id="cm-g-face" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8fbaff" stop-opacity=".28"/><stop offset="1" stop-color="#8fbaff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cm-g-wall)"/>
  <rect x="112" y="100" width="476" height="444" rx="10" fill="#070b11"/>
  <rect x="130" y="118" width="440" height="408" fill="url(#cm-g-glass)"/>
  <g fill="#0a111c"><rect x="130" y="330" width="70" height="196"/><rect x="206" y="270" width="64" height="256"/><rect x="278" y="350" width="96" height="176"/><rect x="382" y="296" width="60" height="230"/><rect x="450" y="376" width="120" height="150"/></g>
  <g fill="#ffd27a" opacity=".26">${winLights}</g>
  <path d="M350 118 V526 M130 322 H570" stroke="#070b11" stroke-width="12"/>
  <rect x="98" y="536" width="504" height="20" rx="4" fill="#070b11"/>
  <rect x="660" y="120" width="170" height="210" rx="6" fill="#0a0e14"/><rect x="672" y="132" width="146" height="186" fill="#1a2433"/>
  <path d="M672 170 Q745 150 818 176" stroke="#5a4636" stroke-width="7" fill="none"/>
  <ellipse cx="1120" cy="430" rx="470" ry="330" fill="url(#cm-g-glow)"/>
  <rect x="1168" y="90" width="274" height="112" rx="16" fill="#040507" stroke="#1d2530" stroke-width="6"/>
  ${admin({ x: 700, y: 440, s: 1.22, eyes: 'tired', mouth: 'frown', badge: '#4263eb', glassTint: 'rgba(120,170,255,.38)', arms: ['chin', 'desk'] })}
  <ellipse cx="760" cy="440" rx="90" ry="100" fill="url(#cm-g-face)"/>
  <rect x="0" y="652" width="1600" height="248" fill="url(#cm-g-desk)"/>
  <rect x="0" y="644" width="1600" height="14" fill="#4a392e"/>
  <g fill="#e8e1d4"><rect x="118" y="614" width="190" height="14" rx="2"/><rect x="126" y="600" width="182" height="14" rx="2" transform="rotate(-2 210 606)"/><rect x="114" y="628" width="196" height="16" rx="2"/></g>
  <g transform="translate(360 574)"><rect width="74" height="78" rx="12" fill="#d9d2c4"/><path d="M74 16 q30 0 30 26 q0 26 -30 26" stroke="#d9d2c4" stroke-width="11" fill="none"/><ellipse cx="37" cy="6" rx="31" ry="7" fill="#3b2415"/></g>
  <g transform="translate(470 590)"><rect width="62" height="62" rx="10" fill="#9fb3c9"/><path d="M62 12 q24 0 24 20 q0 20 -24 20" stroke="#9fb3c9" stroke-width="9" fill="none"/></g>
  <g transform="translate(1460 548)"><rect width="50" height="100" rx="9" fill="#2fbf6b"/><rect y="12" width="50" height="10" fill="#1d7f46"/><rect y="80" width="50" height="8" fill="#1d7f46"/></g>
  <rect x="820" y="686" width="420" height="62" rx="12" fill="#15181d"/>
  <g fill="#262b33">${keys}</g>
  <rect x="880" y="246" width="540" height="364" rx="18" fill="#05070a"/>
  <rect x="900" y="266" width="500" height="310" rx="6" fill="#0d1a2c"/>
  <rect x="1112" y="610" width="76" height="40" fill="#0a0c10"/>
  <rect x="1040" y="646" width="220" height="16" rx="8" fill="#101318"/>
  <rect x="1270" y="700" width="120" height="70" rx="14" fill="#1b1f25"/><rect x="1282" y="710" width="96" height="50" rx="8" fill="#243a55"/>
</svg>`;
}

export function diagnosis() {
  const drops = Array.from({ length: 9 }, (_, i) => `<path class="cm-drop" style="--d:${(i * 0.13) % 0.7}s" d="M${-120 + i * 30} 60 l-8 26" />`).join('');
  return `<svg ${V}>
  <defs>
    <linearGradient id="cm-d-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe3ea"/><stop offset="1" stop-color="#b8c0cd"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cm-d-bg)"/>
  <ellipse cx="520" cy="700" rx="330" ry="36" fill="#8a94a6" opacity=".25"/>
  <g transform="translate(520 515) scale(.92)">
    <ellipse cx="0" cy="170" rx="160" ry="24" fill="#000" opacity=".12"/>
    <ellipse cx="-52" cy="160" rx="34" ry="14" fill="#8793a5"/><ellipse cx="52" cy="160" rx="34" ry="14" fill="#8793a5"/>
    <path d="M0 -150 C88 -150 138 -52 138 34 C138 118 80 158 0 158 C-80 158 -138 118 -138 34 C-138 -52 -88 -150 0 -150Z" fill="#a9b3c2"/>
    <path d="M-70 -110 C-40 -140 10 -142 36 -128 C-6 -126 -44 -104 -66 -76Z" fill="#fff" opacity=".35"/>
    <ellipse cx="-38" cy="-4" rx="12" ry="16" fill="#2a2f38"/><ellipse cx="38" cy="-4" rx="12" ry="16" fill="#2a2f38"/>
    <circle cx="-34" cy="-9" r="4" fill="#fff"/><circle cx="42" cy="-9" r="4" fill="#fff"/>
    <path d="M-66 -30 L-24 -44 M66 -30 L24 -44" stroke="#2a2f38" stroke-width="8" stroke-linecap="round"/>
    <path d="M-28 62 Q0 38 28 62" stroke="#2a2f38" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path class="cm-tear" d="M-44 18 q-6 12 0 18 q6 -6 0 -18Z" fill="#7fb2ff"/>
  </g>
  <g transform="translate(520 205)"><g class="cm-cloud">
    <g class="cm-drops" stroke="#7a8fb3" stroke-width="7" stroke-linecap="round">${drops}</g>
    <path d="M-160 46 C-206 46 -214 -22 -160 -32 C-160 -88 -84 -110 -52 -70 C-30 -122 66 -122 76 -56 C130 -78 184 -22 150 46 Z" fill="#7c8696"/>
    <path d="M-120 20 C-90 30 90 30 130 20" stroke="#6b7484" stroke-width="10" fill="none" stroke-linecap="round" opacity=".5"/>
  </g></g>
</svg>`;
}

export function reveal() {
  return `<svg ${V}>
  ${DEFS}
  <defs>
    <linearGradient id="cm-r-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efe6ff"/><stop offset=".5" stop-color="#ffe6dc"/><stop offset="1" stop-color="#dff2ff"/></linearGradient>
    <radialGradient id="cm-r-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cm-r-bg)"/>
  <ellipse cx="520" cy="470" rx="420" ry="380" fill="url(#cm-r-halo)"/>
  <g class="cm-bottle-wrap">${bottle(520, 450, 0.86)}</g>
  <g class="cm-capsules">${capsule(250, 250, -28, 1.1)}${capsule(810, 200, 32, 0.9)}${capsule(860, 640, -12, 1.2)}${capsule(190, 700, 20, 0.9)}${capsule(790, 380, 64, 0.7)}</g>
</svg>`;
}

export function five() {
  const ticks = Array.from({ length: 12 }, (_, i) => `<path d="M0 -104 v${i % 3 === 0 ? 22 : 12}" transform="rotate(${i * 30})" stroke="#3a3040" stroke-width="${i % 3 === 0 ? 8 : 5}" stroke-linecap="round"/>`).join('');
  return `<svg ${V}>
  <defs>
    <linearGradient id="cm-f-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4e4"/><stop offset="1" stop-color="#ffe0c2"/></linearGradient>
    <linearGradient id="cm-f-door" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#fff0b8"/></linearGradient>
    <linearGradient id="cm-f-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8ff"/><stop offset="1" stop-color="#e3f5ff"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cm-f-wall)"/>
  <rect x="120" y="140" width="380" height="420" rx="12" fill="#f3d3b0"/><rect x="140" y="160" width="340" height="380" fill="url(#cm-f-sky)"/>
  <ellipse cx="260" cy="260" rx="70" ry="26" fill="#fff"/><ellipse cx="330" cy="246" rx="54" ry="30" fill="#fff"/><ellipse cx="400" cy="380" rx="60" ry="20" fill="#fff" opacity=".85"/>
  <path d="M310 160 V540 M140 350 H480" stroke="#f3d3b0" stroke-width="12"/>
  <polygon points="140,160 480,160 980,900 420,900" fill="#fff" opacity=".28"/>
  <rect x="1250" y="210" width="290" height="600" rx="8" fill="#b98a5e"/>
  <rect x="1270" y="230" width="250" height="580" fill="url(#cm-f-door)"/>
  <polygon points="1270,230 1520,230 1600,900 1180,900" fill="#fff6c8" opacity=".55"/>
  <rect x="1310" y="150" width="170" height="46" rx="8" fill="#1f9d55"/>
  <g transform="translate(960 250)"><circle r="130" fill="#6b4f3a"/><circle r="116" fill="#fffdf7"/>${ticks}<path d="M0 0 L0 -86" stroke="#2b2230" stroke-width="9" stroke-linecap="round"/><path d="M0 0 L32 55" stroke="#2b2230" stroke-width="13" stroke-linecap="round"/><circle r="10" fill="#e04b4b"/></g>
  <rect x="0" y="800" width="1600" height="100" fill="#e6c49c"/><rect x="0" y="796" width="1600" height="10" fill="#d4ad82"/>
  <g transform="translate(180 700)"><path d="M-40 100 h80 l-12 -90 h-56z" fill="#e58a5b"/><path d="M0 10 C-60 -40 -70 -110 -20 -150 C-10 -90 0 -60 0 10 Z M0 10 C60 -40 80 -100 40 -150 C20 -90 6 -60 0 10Z M0 10 C-10 -70 10 -130 0 -190 C20 -130 20 -70 0 10Z" fill="#5fb36b"/></g>
  <g class="cm-walker">${admin({ x: 760, y: 380, s: 0.86, legs: true, walkClass: 'cm-walk', eyes: 'happy', mouth: 'grin', badge: '#4263eb', arms: ['down', 'wave'] })}</g>
</svg>`;
}

function skyBirds() {
  return `<g stroke="#8a6f8f" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"><path d="M300 180 q14 -12 28 0 q14 -12 28 0"/><path d="M380 230 q10 -9 20 0 q10 -9 20 0"/><path d="M1260 160 q12 -10 24 0 q12 -10 24 0"/></g>`;
}

export function beach() {
  return `<svg ${V}>
  <defs>
    <linearGradient id="cm-b-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc9a9"/><stop offset=".55" stop-color="#ffb4c6"/><stop offset="1" stop-color="#ffd8e4"/></linearGradient>
    <linearGradient id="cm-b-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec0ea"/><stop offset="1" stop-color="#bfe0f5"/></linearGradient>
    <linearGradient id="cm-b-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e0bb"/><stop offset="1" stop-color="#efc893"/></linearGradient>
    <radialGradient id="cm-b-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d4"/><stop offset=".55" stop-color="#ffe7a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffd18a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cm-b-sky)"/>
  <circle cx="1140" cy="500" r="260" fill="url(#cm-b-sun)"/><circle cx="1140" cy="500" r="96" fill="#fff5d6"/>
  ${skyBirds()}
  <rect x="0" y="520" width="1600" height="170" fill="url(#cm-b-sea)"/>
  <g stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"><path d="M980 560 h110 M1180 580 h70 M1040 610 h160 M1110 640 h60"/></g>
  <rect x="0" y="668" width="1600" height="232" fill="url(#cm-b-sand)"/>
  <path d="M0 672 C120 690 220 660 340 676 S560 694 680 674 S920 656 1040 676 S1300 694 1420 672 S1560 664 1600 674 V700 H0Z" fill="#fff" opacity=".8"/>
  <g fill="#e2b77f" opacity=".7"><ellipse cx="260" cy="820" rx="14" ry="7"/><ellipse cx="330" cy="800" rx="14" ry="7"/><ellipse cx="400" cy="824" rx="14" ry="7"/><ellipse cx="470" cy="804" rx="14" ry="7"/></g>
  <g class="cm-stroll">
    ${admin({ x: 640, y: 470, s: 0.62, legs: true, walkClass: 'cm-walk', eyes: 'happy', mouth: 'grin', arms: ['down', 'leash'] })}
    <path d="M727 640 Q800 690 846 676" stroke="#d94f6a" stroke-width="5" fill="none"/>
    <text class="cm-dog" x="0" y="0" font-size="150" text-anchor="middle" transform="translate(860 750) scale(-1 1)">🐕</text>
  </g>
</svg>`;
}

function hills() {
  return `<path d="M0 640 C220 560 420 590 640 630 S1060 560 1320 600 S1540 640 1600 630 V900 H0Z" fill="#9fd98f"/>
  <path d="M0 720 C260 660 520 700 760 720 S1220 680 1600 710 V900 H0Z" fill="#7fc977"/>
  <g fill="#fff" opacity=".9"><circle cx="210" cy="780" r="7"/><circle cx="236" cy="800" r="6"/><circle cx="1320" cy="760" r="7"/><circle cx="1350" cy="790" r="6"/><circle cx="980" cy="820" r="7"/></g>
  <g fill="#ffd166"><circle cx="220" cy="782" r="3"/><circle cx="1330" cy="762" r="3"/><circle cx="990" cy="822" r="3"/></g>`;
}

function clouds() {
  return `<g class="cm-clouds" fill="#fff"><g opacity=".95"><ellipse cx="260" cy="170" rx="110" ry="40"/><ellipse cx="330" cy="150" rx="80" ry="50"/><ellipse cx="200" cy="160" rx="60" ry="34"/></g>
  <g opacity=".85"><ellipse cx="1260" cy="220" rx="130" ry="42"/><ellipse cx="1340" cy="196" rx="84" ry="52"/></g><g opacity=".7"><ellipse cx="760" cy="110" rx="90" ry="28"/></g></g>`;
}

export function kite() {
  return `<svg ${V}>
  <defs><linearGradient id="cm-k-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc6ff"/><stop offset="1" stop-color="#d5f0ff"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#cm-k-sky)"/>
  ${clouds()}
  ${hills()}
  ${admin({ x: 520, y: 480, s: 0.56, legs: true, eyes: 'happy', mouth: 'grin', arms: ['down', 'kite'] })}
  <g class="cm-kite-swing" style="transform-origin: 617px 498px">
    <path d="M617 498 Q840 480 1070 270" stroke="#fff" stroke-width="3.5" fill="none" opacity=".95"/>
    <text x="1090" y="260" font-size="190" text-anchor="middle" dominant-baseline="central">🪁</text>
  </g>
</svg>`;
}

export function latte() {
  return `<svg ${V}>
  <defs>
    <linearGradient id="cm-l-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1e2"/><stop offset="1" stop-color="#ffd9c0"/></linearGradient>
    <linearGradient id="cm-l-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c8a0"/><stop offset="1" stop-color="#d3a877"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cm-l-wall)"/>
  <polygon points="0,0 520,0 1300,900 300,900" fill="#fff" opacity=".35"/>
  <rect x="0" y="660" width="1600" height="240" fill="url(#cm-l-desk)"/>
  <rect x="380" y="130" width="760" height="500" rx="26" fill="#2b2f36"/>
  <rect x="404" y="154" width="712" height="452" rx="10" fill="#f7f9fc"/>
  <path d="M300 690 L380 630 H1140 L1220 690 Z" fill="#c9ced6"/><rect x="300" y="688" width="920" height="22" rx="10" fill="#aeb4bf"/>
  <g transform="translate(1330 600)">
    <ellipse cx="0" cy="96" rx="140" ry="18" fill="#000" opacity=".12"/>
    <path d="M-92 -40 h184 l-18 130 a24 24 0 0 1 -24 20 h-100 a24 24 0 0 1 -24 -20z" fill="#fff"/>
    <path d="M92 -10 q56 4 50 48 q-6 40 -60 40" stroke="#fff" stroke-width="18" fill="none"/>
    <ellipse cx="0" cy="-40" rx="92" ry="20" fill="#c78b56"/><path d="M-26 -44 q26 -22 26 4 q0 -26 26 -4 q-8 14 -26 20 q-18 -6 -26 -20z" fill="#f3dcc0"/>
    <g class="cm-steam" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"><path d="M-30 -80 q-16 -24 0 -48 q16 -24 0 -48"/><path d="M20 -86 q-16 -24 0 -48 q16 -24 0 -48"/></g>
    <path d="M150 40 C190 20 240 10 300 20 V120 C240 120 190 110 150 96Z" fill="#3f6f8f"/><circle cx="142" cy="66" r="34" fill="#c98f65"/>
  </g>
</svg>`;
}

export function cfo() {
  return `<svg ${V}>
  <defs>
    <linearGradient id="cm-c-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf2ff"/><stop offset="1" stop-color="#d4e0f5"/></linearGradient>
    <linearGradient id="cm-c-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b6a50"/><stop offset="1" stop-color="#5c4332"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cm-c-wall)"/>
  <rect x="100" y="120" width="420" height="440" rx="10" fill="#c9d6ea"/><rect x="118" y="138" width="384" height="404" fill="#bfe3ff"/>
  <g fill="#9fb8d6"><rect x="130" y="360" width="60" height="182"/><rect x="200" y="300" width="80" height="242"/><rect x="290" y="390" width="70" height="152"/><rect x="370" y="330" width="120" height="212"/></g>
  <path d="M310 138 V542 M118 340 H502" stroke="#c9d6ea" stroke-width="10"/>
  <rect x="1150" y="150" width="300" height="220" rx="8" fill="#fff" stroke="#c7d2e4" stroke-width="8"/>
  <path d="M1190 330 L1250 290 L1300 310 L1350 240 L1410 200" stroke="#36c27a" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(1320 700)"><path d="M-40 100 h80 l-12 -80 h-56z" fill="#6c8fbf"/><path d="M0 20 C-60 -30 -70 -100 -20 -140 C-10 -80 0 -50 0 20 Z M0 20 C60 -30 80 -90 40 -140 C20 -80 6 -50 0 20Z" fill="#4fa865"/></g>
  ${person({ x: 800, y: 400, s: 1.32, skin: '#f0c7a6', hair: '#aeb6c0', hairStyle: 'side', top: '#26344f', topStyle: 'suit', tie: '#4263eb', eyes: 'happy', mouth: 'grin', glasses: true, arms: ['down', 'hold'] })}
  <rect x="420" y="690" width="760" height="210" fill="url(#cm-c-desk)"/><rect x="400" y="676" width="800" height="24" rx="6" fill="#a07e61"/>
  <path d="M620 650 h180 l18 40 h-216z" fill="#2c2f36"/><path d="M630 654 h160 l12 30 h-184z" fill="#c9a86a"/>
</svg>`;
}

export function fine() {
  return `<svg ${V}>
  <defs>
    <linearGradient id="cm-n-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd3b4"/><stop offset="1" stop-color="#ffeedd"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cm-n-sky)"/>
  ${clouds()}
  ${hills()}
  <path d="M520 760 L1060 740 L1140 850 L440 870Z" fill="#ff8fa3"/><path d="M560 770 L1040 752 M600 810 L1090 796 M680 752 L640 866 M820 746 L820 862 M960 742 L1000 856" stroke="#fff" stroke-width="10" opacity=".7"/>
  <g class="cm-bounce">${admin({ x: 720, y: 430, s: 0.62, legs: true, eyes: 'happy', mouth: 'grin', arms: ['wave', 'wave'] })}</g>
  <text class="cm-hop" x="1000" y="730" font-size="130" text-anchor="middle">🐕</text>
  <g class="cm-balloons"><path d="M1260 520 q-20 140 10 260" stroke="#fff" stroke-width="3" fill="none"/><path d="M1330 480 q10 160 -40 300" stroke="#fff" stroke-width="3" fill="none"/>
  <text x="1260" y="470" font-size="130" text-anchor="middle" dominant-baseline="central">🎈</text><text x="1340" y="420" font-size="120" text-anchor="middle" dominant-baseline="central">🎈</text></g>
</svg>`;
}

export function endcard() {
  return `<svg ${V}>
  ${DEFS}
  <defs>
    <linearGradient id="cm-e-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4eeff"/><stop offset=".55" stop-color="#fff0ea"/><stop offset="1" stop-color="#e2f3ff"/></linearGradient>
    <radialGradient id="cm-e-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cm-e-bg)"/>
  <ellipse cx="330" cy="470" rx="320" ry="320" fill="url(#cm-e-halo)"/>
  ${bottle(330, 480, 0.74)}
  ${capsule(150, 230, -24, 0.8)}${capsule(560, 720, 18, 0.9)}${capsule(560, 200, 40, 0.6)}
</svg>`;
}
