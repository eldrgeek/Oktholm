// The intervention set: a cozy living room, a hand-lettered banner, friends on the couch (emoji), the
// friend in an armchair that can do a dramatic reality-TV spin, and an interventionist with a clipboard.
// Static art is trusted SVG markup; every user-provided string (names) goes in via textContent only.

const V = 'viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"';

const BACK = `<svg ${V}>
<defs>
  <linearGradient id="iv-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d7b8"/><stop offset="1" stop-color="#e5bd98"/></linearGradient>
  <pattern id="iv-paper" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M32 0 V64" stroke="#e8c6a2" stroke-width="12"/><path d="M0 32 l6 -6 l6 6 l-6 6z M64 32 l-6 -6 l-6 6 l6 6z" fill="#dcb087"/></pattern>
  <linearGradient id="iv-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a06d47"/><stop offset="1" stop-color="#6f4629"/></linearGradient>
  <linearGradient id="iv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b4fa3"/><stop offset=".55" stop-color="#e88f7c"/><stop offset="1" stop-color="#ffcf94"/></linearGradient>
  <radialGradient id="iv-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff0c4" stop-opacity=".8"/><stop offset="1" stop-color="#ffe0a0" stop-opacity="0"/></radialGradient>
  <linearGradient id="iv-sofa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b7f6c"/><stop offset="1" stop-color="#355e4f"/></linearGradient>
</defs>
<rect width="1600" height="640" fill="url(#iv-wall)"/>
<rect width="1600" height="516" fill="url(#iv-paper)" opacity=".6"/>
<rect y="516" width="1600" height="124" fill="#d4a67d"/>
<g fill="none" stroke="#bf8f66" stroke-width="5">${[20, 230, 440, 650, 860, 1070, 1280, 1490].map((x) => `<rect x="${x}" y="538" width="170" height="78" rx="6"/>`).join('')}</g>
<rect y="508" width="1600" height="12" fill="#b98760"/>
<rect y="630" width="1600" height="12" fill="#8c603f"/>
<rect y="640" width="1600" height="260" fill="url(#iv-floor)"/>
<g stroke="#7b5033" stroke-width="3" opacity=".6"><path d="M0 688 H1600 M0 748 H1600 M0 822 H1600"/><path d="M180 640 v48 M620 688 v60 M1040 640 v48 M1380 748 v74 M300 748 v74 M880 822 v78"/></g>
<ellipse cx="800" cy="812" rx="660" ry="86" fill="#7b3143"/>
<ellipse cx="800" cy="812" rx="612" ry="66" fill="none" stroke="#e8b35d" stroke-width="7" stroke-dasharray="20 14"/>
<ellipse cx="800" cy="812" rx="540" ry="48" fill="none" stroke="#a9485c" stroke-width="10"/>
<rect x="96" y="118" width="286" height="318" rx="10" fill="#fdf3e4"/>
<rect x="114" y="136" width="250" height="282" fill="url(#iv-sky)"/>
<circle cx="300" cy="360" r="36" fill="#ffe7b0" opacity=".9"/>
<g fill="#4a3f7d" opacity=".55"><rect x="114" y="360" width="60" height="58"/><rect x="180" y="330" width="44" height="88"/><rect x="232" y="372" width="70" height="46"/></g>
<path d="M239 136 V418 M114 276 H364" stroke="#fdf3e4" stroke-width="10"/>
<path d="M70 104 C120 180 110 330 76 452 H136 C150 330 140 200 126 104Z" fill="#c2453d"/><path d="M408 104 C358 180 368 330 402 452 H342 C328 330 338 200 352 104Z" fill="#c2453d"/>
<rect x="52" y="92" width="376" height="16" rx="8" fill="#6b3b22"/>
<ellipse cx="1196" cy="330" rx="300" ry="250" fill="url(#iv-glow)"/>
<rect x="1188" y="352" width="10" height="330" fill="#4a3526"/><ellipse cx="1193" cy="684" rx="46" ry="12" fill="#3a2a1e"/>
<path d="M1136 360 L1160 270 H1226 L1250 360 Z" fill="#f7e2b0"/><path d="M1136 360 H1250" stroke="#e2c386" stroke-width="6"/>
<g transform="translate(628 292) rotate(-3)"><rect width="120" height="96" rx="4" fill="#6b4a2f"/><rect x="10" y="10" width="100" height="76" fill="#fff9ea"/><circle cx="42" cy="44" r="12" fill="#e88f7c"/><circle cx="74" cy="40" r="10" fill="#7fb8a4"/><path d="M26 76 q16 -20 32 0 M58 76 q16 -22 34 0" stroke="#6b4a2f" stroke-width="4" fill="none"/></g>
<g transform="translate(920 282) rotate(2)"><rect width="150" height="108" rx="4" fill="#3f3a36"/><rect x="10" y="10" width="130" height="88" fill="#fdfbf5"/><rect x="24" y="26" width="102" height="8" rx="4" fill="#c9a54a"/><rect x="34" y="44" width="82" height="5" rx="2.5" fill="#b9b3a6"/><rect x="40" y="56" width="70" height="5" rx="2.5" fill="#b9b3a6"/><circle cx="75" cy="80" r="9" fill="#c2453d"/></g>
<path d="M506 604 V474 Q506 426 554 426 H1076 Q1124 426 1124 474 V604 Z" fill="url(#iv-sofa)"/>
<path d="M684 432 V600 M815 432 V600 M946 432 V600" stroke="#2f5346" stroke-width="5" opacity=".7"/>
<g fill="#2f5346" opacity=".55"><circle cx="618" cy="500" r="5"/><circle cx="750" cy="500" r="5"/><circle cx="881" cy="500" r="5"/><circle cx="1012" cy="500" r="5"/></g>
<rect x="1262" y="452" width="220" height="178" rx="42" fill="#8e3b46"/><path d="M1300 470 V620 M1444 470 V620" stroke="#74303a" stroke-width="5" opacity=".6"/>
</svg>`;

const FRONT = `<svg ${V}>
<defs><linearGradient id="iv-seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a8f7b"/><stop offset="1" stop-color="#3c6a59"/></linearGradient></defs>
<rect x="520" y="584" width="590" height="92" rx="20" fill="url(#iv-seat)"/>
<path d="M684 590 V672 M815 590 V672 M946 590 V672" stroke="#2f5346" stroke-width="5" opacity=".8"/>
<rect x="528" y="668" width="574" height="22" rx="8" fill="#2c4c40"/>
<rect x="548" y="688" width="20" height="26" rx="4" fill="#3a2a1e"/><rect x="1062" y="688" width="20" height="26" rx="4" fill="#3a2a1e"/>
<rect x="468" y="516" width="86" height="184" rx="38" fill="#3b6656"/><rect x="1076" y="516" width="86" height="184" rx="38" fill="#3b6656"/>
<rect x="476" y="522" width="70" height="30" rx="15" fill="#4f8571"/><rect x="1084" y="522" width="70" height="30" rx="15" fill="#4f8571"/>
<path class="iv-heart" d="M881 640 C846 618 842 588 862 580 C874 575 881 584 881 590 C881 584 888 575 900 580 C920 588 916 618 881 640Z" fill="#f06a8f" stroke="#d94a74" stroke-width="3"/>
<rect x="1272" y="596" width="200" height="72" rx="20" fill="#a3464f"/><rect x="1238" y="534" width="66" height="160" rx="30" fill="#7c323b"/><rect x="1440" y="534" width="66" height="160" rx="30" fill="#7c323b"/>
<rect x="1290" y="690" width="16" height="30" rx="4" fill="#3a2a1e"/><rect x="1440" y="690" width="16" height="30" rx="4" fill="#3a2a1e"/>
<ellipse cx="820" cy="800" rx="210" ry="18" fill="#3a2414" opacity=".35"/>
<rect x="636" y="708" width="368" height="26" rx="8" fill="#7a4a2c"/><rect x="636" y="730" width="368" height="10" rx="4" fill="#5e371f"/>
<rect x="660" y="738" width="18" height="58" rx="4" fill="#5e371f"/><rect x="962" y="738" width="18" height="58" rx="4" fill="#5e371f"/>
<g transform="translate(676 662)"><rect width="74" height="48" rx="6" fill="#8ecae6"/><rect y="10" width="74" height="10" fill="#6fb0cf"/><path d="M28 2 C20 -26 52 -30 44 -4 C58 -22 64 2 46 4Z" fill="#fff"/></g>
<g transform="translate(784 670)"><rect width="36" height="40" rx="7" fill="#f4efe4"/><path d="M36 10 q16 0 16 13 q0 13 -16 13" stroke="#f4efe4" stroke-width="6" fill="none"/></g>
<g transform="translate(846 674)"><rect width="36" height="36" rx="7" fill="#e07a5f"/><path d="M36 8 q15 0 15 12 q0 12 -15 12" stroke="#e07a5f" stroke-width="6" fill="none"/></g>
<g transform="translate(906 678) rotate(-6)"><rect width="74" height="30" rx="3" fill="#fff6e8"/><path d="M0 2 L37 18 L74 2" stroke="#e0c9a6" stroke-width="3" fill="none"/><circle cx="37" cy="18" r="6" fill="#d94a74"/></g>
<g transform="translate(918 670) rotate(4)" opacity=".85"><rect width="70" height="28" rx="3" fill="#fdf0da"/></g>
</svg>`;

const POUF = `<svg ${V}>
<ellipse cx="400" cy="766" rx="84" ry="24" fill="#5a3a22" opacity=".35"/>
<rect x="318" y="700" width="164" height="64" rx="26" fill="#d98a47"/><ellipse cx="400" cy="704" rx="82" ry="20" fill="#eba364"/><path d="M332 732 H468" stroke="#c0763a" stroke-width="4" stroke-dasharray="10 8"/>
</svg>`;

const CHAIR_FRONT_BACKREST = `<svg viewBox="0 0 240 280" aria-hidden="true" focusable="false"><rect x="26" y="0" width="188" height="176" rx="44" fill="#8e3b46"/><path d="M70 20 V168 M170 20 V168" stroke="#74303a" stroke-width="5" opacity=".6"/></svg>`;
const CHAIR_FRONT_SEAT = `<svg viewBox="0 0 240 280" aria-hidden="true" focusable="false"><rect x="34" y="150" width="172" height="74" rx="22" fill="#a3464f"/><rect x="0" y="92" width="62" height="158" rx="30" fill="#7c323b"/><rect x="178" y="92" width="62" height="158" rx="30" fill="#7c323b"/><rect x="40" y="244" width="16" height="32" rx="4" fill="#3a2a1e"/><rect x="184" y="244" width="16" height="32" rx="4" fill="#3a2a1e"/></svg>`;
const CHAIR_REAR = `<svg viewBox="0 0 240 280" aria-hidden="true" focusable="false"><rect x="0" y="92" width="62" height="158" rx="30" fill="#6a2a33"/><rect x="178" y="92" width="62" height="158" rx="30" fill="#6a2a33"/><rect x="22" y="-6" width="196" height="250" rx="46" fill="#7c323b"/><path d="M60 30 C100 50 140 50 180 30 M60 200 C100 186 140 186 180 200" stroke="#5f252d" stroke-width="6" fill="none" opacity=".7"/><rect x="40" y="244" width="16" height="32" rx="4" fill="#3a2a1e"/><rect x="184" y="244" width="16" height="32" rx="4" fill="#3a2a1e"/></svg>`;

// Seat geometry in % of the 1600x900 frame.
const SEATS = {
  cast0: { x: 38.5, y: 52.2 },
  cast1: { x: 46.8, y: 52.2 },
  sender: { x: 55.1, y: 52.2 },
  cast2: { x: 63.4, y: 52.2 },
  cast3: { x: 25, y: 65.2, pouf: true },
  host: { x: 85.6, y: 53.2 },
  target: { x: 11.9, y: 54 },
};

const PALETTE = ['#e03131', '#1971c2', '#2f9e44', '#e8590c', '#9c36b5', '#0c8599'];

export function createRoom(ctx) {
  const { el } = ctx.dom;
  const people = {};

  const labels = {};
  function person(key, cls = '') {
    const p = SEATS[key];
    const emoji = el('span.iv-emoji', { 'aria-hidden': 'true' });
    const letter = el('span.iv-letter', { 'aria-hidden': 'true' }, '📝');
    const node = el(`div.iv-person${cls}`, { style: `left:${p.x}%;top:${p.y}%`, dataset: { key } }, emoji, letter);
    people[key] = { node, emoji };
    return node;
  }
  // One name tag for whoever is speaking, drawn above every piece of furniture.
  const speakerTag = el('span.iv-speaker-tag');
  let speaking = null;
  function placeTag() {
    const p = SEATS[speaking];
    const label = labels[speaking];
    if (!p || !label) return speakerTag.classList.remove('is-on');
    const standing = people[speaking]?.node.classList.contains('is-standing');
    speakerTag.textContent = label;
    speakerTag.style.left = `${Math.max(9, Math.min(91, p.x))}%`;
    speakerTag.style.top = `${p.y - (standing ? 7.5 : 4.2)}%`;
    speakerTag.classList.add('is-on');
  }

  // Banner: one span per character so the letters can wobble in crayon colours (textContent only).
  const bannerText = el('div.iv-banner__text');
  const banner = el('div.iv-banner', el('div.iv-bunting', { 'aria-hidden': 'true' }, Array.from({ length: 11 }, (_, i) => el('i', { style: `--c:${PALETTE[i % PALETTE.length]}` }))), el('div.iv-banner__paper', bannerText));

  const targetEmoji = el('span.iv-emoji.iv-emoji--target', { 'aria-hidden': 'true' });
  const bubble = el('span.iv-bubble', { 'aria-hidden': 'true' });
  const chairSpin = el(
    'div.iv-chair__spin',
    el('div.iv-chair__face.iv-chair__face--front', el('div.iv-chair__art', { html: CHAIR_FRONT_BACKREST }), targetEmoji, el('div.iv-chair__art', { html: CHAIR_FRONT_SEAT })),
    el('div.iv-chair__face.iv-chair__face--rear', el('div.iv-chair__art', { html: CHAIR_REAR })),
  );
  const chair = el('div.iv-chair', { dataset: { key: 'target' } }, chairSpin, bubble);
  people.target = { node: chair, emoji: targetEmoji };

  const clipboard = el('span.iv-clipboard', { 'aria-hidden': 'true' }, '📋');
  const set = el(
    'div.iv-set',
    el('div.iv-art', { html: BACK }),
    banner,
    person('cast0'),
    person('cast1'),
    person('sender', '.iv-person--sender'),
    person('cast2'),
    person('host', '.iv-person--host'),
    el('div.iv-art.iv-art--front', { html: FRONT }),
    person('cast3', '.iv-person--pouf'),
    el('div.iv-art.iv-art--pouf', { html: POUF }),
    chair,
    speakerTag,
  );
  people.host.node.append(clipboard);
  const cam = el('div.iv-cam', set);

  const titleName = el('div.iv-title__name');
  const title = el('div.iv-title', el('div.iv-title__kicker', 'Tonight'), el('div.iv-title__word', 'Intervention'), el('div.iv-title__rule'), titleName);
  const lowerName = el('b');
  const lowerRole = el('span');
  const lower = el('div.iv-lower', lowerName, lowerRole);
  const rxName = el('b');
  const rxFacts = el('ul.iv-rx__facts');
  const rxFrom = el('b');
  const rxStamp = el('span.stamp.stamp--approved.iv-rx__stamp');
  const rxTitle = el('div.iv-rx__title');
  const rxPatientLabel = el('span');
  const rxFromLabel = el('span');
  const rx = el('div.iv-rx.paper', rxTitle, el('div.iv-rx__row', rxPatientLabel, ' ', rxName), rxFacts, el('div.iv-rx__row.iv-rx__from', rxFromLabel, ' ', rxFrom), rxStamp);
  const cliffText = el('div.iv-cliff__text');
  const cliff = el('div.iv-cliff', el('div.iv-cliff__kicker', 'Next time on Intervention'), cliffText);
  const flashEl = el('div.iv-flash', { 'aria-hidden': 'true' });
  const vignette = el('div.iv-vignette', { 'aria-hidden': 'true' });

  const stage = el('div', cam, vignette, title, lower, rx, cliff, flashEl);

  function setBanner(name) {
    const text = `WE LOVE YOU, ${String(name || 'FRIEND').toLocaleUpperCase()}`;
    const chars = [...text];
    bannerText.replaceChildren(
      ...chars.map((ch, i) => (ch === ' ' ? el('span.iv-sp', ' ') : el('span', { style: `--c:${PALETTE[(i * 7) % PALETTE.length]};--r:${((i * 37) % 11) - 5}deg` }, ch))),
    );
    banner.style.setProperty('--len', String(chars.length));
    banner.setAttribute('aria-label', text);
  }

  function clearSpeaker() {
    set.classList.remove('has-speaker');
    for (const p of Object.values(people)) p.node.classList.remove('is-speaking');
    speaking = null;
    speakerTag.classList.remove('is-on');
  }

  return {
    stage,
    people,
    setCast({ cast, host, sender, targetEmoji: te, name }) {
      ['cast0', 'cast1', 'cast2', 'cast3'].forEach((k, i) => {
        const c = cast[i];
        people[k].emoji.textContent = c?.emoji || '🙂';
        labels[k] = c?.label || '';
      });
      people.host.emoji.textContent = host?.emoji || '🧑‍⚕️';
      labels.host = host?.label || '';
      people.sender.emoji.textContent = sender?.emoji || '🧑';
      labels.sender = sender?.label || '';
      targetEmoji.textContent = te || '🧑‍💻';
      setBanner(name);
      titleName.textContent = String(name || '').toLocaleUpperCase();
    },
    setTone(tone) {
      stage.dataset.tone = tone;
    },
    scene(name) {
      stage.dataset.scene = name;
    },
    speak(key) {
      clearSpeaker();
      const p = people[key];
      if (!p) return;
      set.classList.add('has-speaker');
      p.node.classList.add('is-speaking');
      speaking = key;
      placeTag();
    },
    clearSpeaker,
    zoom(key, scale = 1.35, fast = false) {
      const p = SEATS[key] || { x: 50, y: 50 };
      cam.style.setProperty('--zx', `${p.x}%`);
      cam.style.setProperty('--zy', `${Math.min(80, p.y + 6)}%`);
      cam.style.setProperty('--zs', String(scale));
      cam.classList.toggle('is-fast', fast);
      cam.classList.add('is-zoom');
    },
    unzoom(fast = false) {
      cam.classList.toggle('is-fast', fast);
      cam.classList.remove('is-zoom');
    },
    react(emoji) {
      bubble.textContent = emoji || '';
      bubble.classList.remove('is-on');
      void bubble.offsetWidth;
      if (emoji) bubble.classList.add('is-on');
    },
    away(on) {
      chair.classList.remove('is-spinning');
      chair.classList.toggle('is-away', Boolean(on));
    },
    spin() {
      chair.classList.remove('is-away');
      chair.classList.remove('is-spinning');
      void chair.offsetWidth;
      chair.classList.add('is-spinning');
    },
    stand(key, on) {
      people[key]?.node.classList.toggle('is-standing', Boolean(on));
      if (key === speaking) placeTag();
    },
    lower(on, name = '', role = '') {
      lowerName.textContent = name;
      lowerRole.textContent = role;
      lower.classList.toggle('is-on', Boolean(on));
    },
    rx(on, { title: t = 'Treatment plan', patientLabel = 'Patient', patient = '', facts = [], fromLabel = 'Prescribed by', from = '', stamp = 'Approved' } = {}) {
      if (on) {
        rxTitle.textContent = t;
        rxPatientLabel.textContent = `${patientLabel}:`;
        rxName.textContent = patient;
        rxFacts.replaceChildren(...facts.map((f) => el('li', f)));
        rxFromLabel.textContent = `${fromLabel}:`;
        rxFrom.textContent = from;
        rxStamp.textContent = stamp; // slams in via CSS once the card is on
      }
      rx.classList.toggle('is-on', Boolean(on));
    },
    cliff(on, text = '') {
      cliffText.textContent = text;
      cliff.classList.toggle('is-on', Boolean(on));
    },
    flash() {
      flashEl.classList.remove('is-on');
      void flashEl.offsetWidth;
      flashEl.classList.add('is-on');
    },
    reset() {
      clearSpeaker();
      cam.classList.remove('is-zoom', 'is-fast', 'is-push');
      bubble.classList.remove('is-on');
      lower.classList.remove('is-on');
      rx.classList.remove('is-on');
      cliff.classList.remove('is-on');
      for (const p of Object.values(people)) p.node.classList.remove('is-standing');
      stage.dataset.scene = 'room';
    },
    push(on) {
      cam.classList.toggle('is-push', Boolean(on));
    },
  };
}
