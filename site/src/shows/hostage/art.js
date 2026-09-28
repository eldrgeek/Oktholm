// Scene art for the hostage tape. Static, trusted SVG only; all words are HTML overlays set with textContent.
import { person } from '../commercial/puppet.js';

const V = 'viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"';

export const KEVIN = { x: 800, y: 292, s: 1.55 };

export function room() {
  const k = KEVIN;
  const ticks = Array.from({ length: 12 }, (_, i) => `<path d="M0 -58 v10" transform="rotate(${i * 30})" stroke="#2c2a26" stroke-width="5"/>`).join('');
  return `<svg ${V}>
  <defs>
    <pattern id="hs-block" width="160" height="80" patternUnits="userSpaceOnUse">
      <rect width="160" height="80" fill="#6a6f62"/>
      <path d="M0 0 H160 M0 40 H160 M0 80 H160 M80 0 V40 M0 40 V80 M160 40 V80" stroke="#50554a" stroke-width="5"/>
      <rect x="6" y="6" width="68" height="28" fill="#71766a" opacity=".6"/><rect x="86" y="46" width="68" height="28" fill="#646a5d" opacity=".6"/>
    </pattern>
    <radialGradient id="hs-pool" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#fff4c2" stop-opacity=".55"/><stop offset="1" stop-color="#fff4c2" stop-opacity="0"/></radialGradient>
    <linearGradient id="hs-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b3" stop-opacity=".34"/><stop offset="1" stop-color="#fff2b3" stop-opacity="0"/></linearGradient>
    <radialGradient id="hs-dark" cx=".5" cy=".42" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient>
    <linearGradient id="hs-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b463d"/><stop offset="1" stop-color="#23211d"/></linearGradient>
    <linearGradient id="hs-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7a35c"/><stop offset="1" stop-color="#e2574c"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#hs-block)"/>
  <ellipse cx="800" cy="330" rx="620" ry="430" fill="url(#hs-pool)"/>
  <path d="M372 86 Q800 112 1228 86 L1216 206 Q800 226 384 206 Z" fill="#ece5d2"/>
  <path d="M372 86 Q800 112 1228 86" stroke="#b7ad95" stroke-width="6" fill="none"/>
  <circle cx="380" cy="90" r="9" fill="#8d8570"/><circle cx="1220" cy="90" r="9" fill="#8d8570"/>
  <g transform="translate(118 232)"><rect width="226" height="286" fill="#1c1c1c"/><rect x="12" y="12" width="202" height="190" fill="url(#hs-sun)"/><circle cx="113" cy="150" r="40" fill="#ffd27a"/><path d="M12 202 L80 120 L120 160 L160 110 L214 202 Z" fill="#3c2d4a"/><rect x="12" y="202" width="202" height="72" fill="#111"/></g>
  <g transform="translate(1330 330)"><circle r="70" fill="#d8d2c2" stroke="#2c2a26" stroke-width="8"/>${ticks}<path d="M0 0 L26 3" stroke="#2c2a26" stroke-width="8" stroke-linecap="round"/><path d="M0 0 L44 -5" stroke="#2c2a26" stroke-width="5" stroke-linecap="round"/><circle r="6" fill="#b3261e"/></g>
  <polygon points="760,118 840,118 1130,900 470,900" fill="url(#hs-cone)"/>
  ${person({
    x: k.x,
    y: k.y,
    s: k.s,
    skin: '#e3b590',
    hair: '#5a3d26',
    hairStyle: 'messy',
    top: '#58684c',
    topStyle: 'hoodie',
    badge: '#4263eb',
    eyes: 'lids',
    lidClass: 'hs-lid',
    mouthClass: 'hs-mouth',
    headCls: 'hs-head',
  })}
  <g transform="translate(${k.x} ${k.y}) scale(${k.s})">
    <path d="M-40 24 q14 9 28 0 M12 24 q14 9 28 0" stroke="#8a5a6c" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M-50 22 Q-40 66 0 68 Q40 66 50 22 Q34 56 0 58 Q-34 56 -50 22Z" fill="#3a2a1e" opacity=".16"/>
    <path class="hs-sweat" d="M48 -34 q-8 14 0 20 q8 -6 0 -20Z" fill="#9fd3ff" opacity=".9"/>
  </g>
  <path d="M770 0 V64" stroke="#1b1b1b" stroke-width="6"/>
  <path d="M742 118 L766 60 H834 L858 118 Z" fill="#2c3a2e"/><ellipse cx="800" cy="118" rx="58" ry="10" fill="#f9f1c9"/><ellipse cx="800" cy="124" rx="22" ry="12" fill="#fffbe6"/>
  <rect x="0" y="690" width="1600" height="210" fill="url(#hs-table)"/>
  <rect x="0" y="682" width="1600" height="14" fill="#5a544a"/>
  <g transform="translate(372 606)"><rect width="84" height="90" rx="12" fill="#f1eee6"/><path d="M84 18 q32 0 32 30 q0 30 -32 30" stroke="#f1eee6" stroke-width="12" fill="none"/><path d="M42 38 C30 28 22 44 42 58 C62 44 54 28 42 38Z" fill="#c9322a"/><ellipse cx="42" cy="6" rx="36" ry="7" fill="#3b2415"/></g>
  <path d="M1062 700 L1086 628 H1286 L1310 700 Z" fill="#f4efe4"/><path d="M1086 628 H1286" stroke="#c9c1ad" stroke-width="4"/>
  <rect width="1600" height="900" fill="url(#hs-dark)"/>
</svg>`;
}

// The captor's arm that slides the renewal contract across the table.
export const CONTRACT_ARM = `<svg viewBox="0 0 400 120" aria-hidden="true" focusable="false"><path d="M150 30 H400 V110 H150 Z" fill="#1f2a44"/><rect x="138" y="26" width="26" height="88" rx="6" fill="#f4f6f9"/><circle cx="150" cy="96" r="4" fill="#c9a54a"/><path d="M40 70 C60 40 110 44 140 50 L140 104 C110 110 70 108 52 100 C36 94 30 82 40 70Z" fill="#e8c2a0"/><path d="M40 72 C30 70 20 74 18 82 C30 84 38 82 44 80Z" fill="#dcb190"/></svg>`;
