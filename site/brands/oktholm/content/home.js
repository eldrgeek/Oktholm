// Lobby (home) copy, live "vitals" counters, program guide, ticker and footer.
export default {
  nav: [
    { path: '/triage', label: 'Triage' },
    { path: '/arcade', label: 'Arcade' },
    { path: '/tv', label: 'OKTV' },
    { path: '/intervention', label: 'Intervention' },
    { path: '/sponsor', label: 'Sponsor' },
    { path: '/therapy', label: 'Group Therapy' },
    { path: '/dsm', label: 'DSM-IT' },
    { path: '/cure', label: 'The Cure', cure: true },
  ],

  hero: {
    kicker: 'Public health advisory · Live from Oktholm General',
    // Rotates daily; the first is the default.
    headlines: [
      'That’s not loyalty. That’s Oktholm Syndrome.',
      'Your identity provider loves you. That’s the problem.',
    ],
    body: 'Oktholm Syndrome: when you’ve been held by your identity provider so long, you start defending it. Symptoms include renewal denial, group hoarding and describing the SSO tax as “customary.” You are not alone. You are, however, on hold.',
    primary: { label: 'Get diagnosed · 2 min', path: '/triage' },
    secondary: { label: 'Stage an intervention', path: '/intervention' },
  },

  symptoms: {
    cue: 'Symptoms',
    kicker: 'Know the signs',
    title: 'Symptoms include…',
    body: 'Four of the recognized signs, rotated daily. If two or more sound like your Tuesday, get screened. It takes two minutes and nobody asks for your work email.',
    cta: 'Get screened · 2 min',
  },

  intervention: {
    cue: 'Interventions',
    kicker: 'For the coworker who calls the renewal “fair”',
    title: 'Stage an intervention',
    body: 'Pick their symptoms. We write the letters, gather the couch and film it. You send one link. It’s anonymous. They’ll know it was you.',
    cta: 'Stage an intervention',
    couch: ['🛋️', '👩🏽‍💼', '🧔🏻', '👵🏿', '🧑🏼‍💻', '🧑🏾‍⚕️'],
  },

  // Deterministic "live" counters: value = base + perDay * (fraction of today elapsed, UTC) with jitter.
  // Satire about the condition. Footer says all stats are satirical.
  vitals: [
    { label: 'New cases today', base: 1200, perDay: 21000, fmt: 'int', trend: 'up' },
    { label: 'Admins on hold with vendor support', base: 38000, perDay: 6000, fmt: 'int', wobble: 900 },
    { label: 'AD groups created today', base: 0, perDay: 1400000, fmt: 'int', trend: 'up' },
    { label: 'Renewal quotes opened (screaming)', base: 140, perDay: 4100, fmt: 'int', trend: 'up' },
    { label: 'Ex-employees with active access', fixed: '∞', trend: 'flat' },
  ],

  today: {
    kicker: 'Today at Oktholm General',
    title: 'New every day. Like tickets.',
  },

  arcade: {
    kicker: 'Occupational therapy',
    title: 'The Arcade',
    body: 'Clinically unproven games that treat real symptoms. Each one ends with a score to share and a prescription you can ignore.',
  },

  tv: {
    kicker: 'OKTV · The Recovery Network',
    title: 'Broadcasting 24/7 from the night shift',
    body: 'Pharmaceutical ads for software, hostage videos, interventions and the nightly news. Always on. Always captioned. Sound optional.',
    // Order the lobby screen and /tv channel play shows in.
    rotation: ['news', 'commercial', 'intervention', 'hostage', 'commercial'],
    // Program guide: repeats every 6 hours, 30-minute slots. `module` links a slot to a playable page.
    guide: [
      { title: 'Oktholm Nightly News', module: 'news', genre: 'News' },
      { title: 'Yeshidumab: A Paid Program', module: 'commercial', genre: 'Paid programming' },
      { title: 'Intervention!', module: 'intervention', genre: 'Reality' },
      { title: 'Hostage Hour', module: 'hostage', genre: 'Documentary' },
      { title: 'Please Hold: The 24-Hour Marathon', module: 'hold', genre: 'Endurance' },
      { title: 'Access, Please: Championship Replay', module: 'access-please', genre: 'Sports' },
      { title: 'The Leaver (Live)', module: 'leaver', genre: 'Action' },
      { title: 'Build Your Own Oktholm Solution', module: 'solution-builder', genre: 'Home improvement' },
      { title: 'Renewal Season: The Ransom Notes', module: 'ransom', genre: 'True crime' },
      { title: 'IDle: The Daily Puzzle', module: 'idle', genre: 'Game show' },
      { title: '4096 Groups', module: 'groups', genre: 'Horror' },
      { title: 'Group Therapy (Call-In)', path: '/therapy', genre: 'Talk' },
    ],
  },

  ticker: [
    'ADVISORY: Read-Only Friday now in effect in all time zones',
    'OUTBREAK: New Oktholm cluster reported at company whose CEO wants admin “just to see”',
    'TRAVEL WARNING: Do not visit “Contact Sales” pages without a buddy',
    'RECALL: All “temporary” firewall exceptions from 2019 are hereby recalled',
    'WEATHER: 90% chance of SAML errors, clearing by Q3',
    'MARKETS: Price of single sign-on up 40%; analysts call it “customary”',
    'HEALTH: Doctors confirm spreadsheet is not a source of truth',
    'SPORTS: Admin completes offboarding in under a day; stadium erupts',
    'SCIENCE: It was DNS',
    'COMMUNITY: Group Therapy meets nightly. Bring snacks. Leave your vendor at home.',
    'LOST & FOUND: One (1) contractor account, last seen 2022, answers to “svc_temp_final”',
    'PUBLIC NOTICE: The intern’s Global Admin rights have entered their seventh year',
    'REMINDER: Every link you share carries your sponsor code',
    'CORRECTION: Yesterday’s report said “most” groups are unnecessary. We meant “all.”',
  ],

  eggs: {
    konami: 'B·A: Budget approved',
    console: [
      'STOP.',
      'Anyone who tells you to paste code here to unlock Enterprise Plus is your identity provider.',
      'You opened devtools on a hospital. That’s Stage II. The source is readable on purpose. Say hi to the front desk: type “help” in the chat.',
    ],
  },

  footer: {
    disclaimer: 'Oktholm Syndrome is not a real medical condition. It is a real professional condition. All statistics on this site are satirical and simulated, except the ones marked REAL and YeshID’s pricing, which is published on a public web page, which in this industry counts as satire.',
    legal: 'Any resemblance to an identity provider, living or billing, is [REDACTED BY LEGAL]. No vendors were named in the making of this website, on the advice of counsel, who would also like a word about the ransom notes.',
    made: 'A public service of Oktholm General. Paid for by YeshID. Yes, this is marketing. We told you it was.',
  },
};
