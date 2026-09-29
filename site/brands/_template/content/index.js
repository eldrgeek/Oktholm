// Site-wide content. Copy the shapes from brands/oktholm/content/*.js and rewrite for your audience.
export default {
  chips: [
    { id: 'admitted', name: 'Admitted', icon: '🩺', desc: 'Completed your diagnosis.', kind: 'engagement' },
    { id: 'spreader', name: 'Patient Zero', icon: '🦠', desc: 'Shared the site.', kind: 'engagement' },
    { id: 'sponsor-1', name: 'Sponsor', icon: '🥉', desc: 'One person you referred got diagnosed.', kind: 'referral' },
  ],
  gazette: [{ headline: 'Local User Opens Pricing Page, Finds Only “Contact Sales”', dek: 'Sales has already contacted him. Twice.' }],
  symptoms: [{ code: 'SYMPT-001', severity: 'critical', name: 'Vendor Attachment', desc: 'Defends a tool they actively resent.', treat: 'pricing' }],
  triage: {
    intro: { kicker: 'Triage', title: 'Let’s find out how bad it is.', body: 'A few questions. No login.', start: 'Begin intake' },
    questions: [
      { q: 'How do you feel about your current tool?', a: [{ t: 'Fine', s: 0 }, { t: 'It’s complicated', s: 2, trait: 'renewal' }, { t: 'It hurts me but it’s always there for me', s: 3, trait: 'renewal' }, { t: 'I have a folder of passwords', s: 3, trait: 'accidental' }] },
    ],
    stages: [
      { min: 2, stage: 'Stage II', name: 'Moderate Example Syndrome', color: 'severe', prognosis: 'The rationalizations have started.' },
      { min: 0, stage: 'Stage 0', name: 'Suspiciously Healthy', color: 'vital', prognosis: 'Please confirm you are not the vendor.' },
    ],
    subtypes: {
      renewal: { name: 'The Renewal Apologist', emoji: '💸', blurb: 'You explain price increases as if they were weather.', treat: ['pricing'] },
      accidental: { name: 'The Accidental Admin', emoji: '🪑', blurb: 'You sat closest to the router.', treat: ['free'] },
    },
    defaultSubtype: 'accidental',
    shareTemplate: 'I was diagnosed with {stageName} ({stage}), subtype “{subtype}.” {emoji} Get screened:',
  },
  dsm: { title: 'DSM-X', subtitle: 'Diagnostic and Statistical Manual of Tool Disorders', intro: '', entries: [] },
  confessions: [{ text: 'I renewed without reading the quote. I was afraid of what I’d find.', who: 'Anonymous' }],
  sponsorship: {
    kicker: 'The Sponsorship Program', title: 'Nobody recovers alone.', body: 'Share your link; when a friend gets diagnosed, you earn a chip.',
    honesty: 'Yes, this is a referral program. At least we’re honest about it.', fulfillmentNote: '',
    howItWorks: [], tiers: [{ count: 1, chip: 'sponsor-1', name: 'Sponsor', icon: '🥉', reward: 'Sticker pack', detail: '' }], sponseeGift: '', sampleLeaderboard: [],
  },
  home: {
    nav: [{ path: '/triage', label: 'Triage' }, { path: '/arcade', label: 'Arcade' }, { path: '/tv', label: 'TV' }, { path: '/sponsor', label: 'Sponsor' }, { path: '/cure', label: 'The Cure', cure: true }],
    hero: { kicker: 'Public health advisory', headlines: ['That’s not loyalty. That’s Example Syndrome.'], body: 'A condition in which people bond with the tools holding them captive.', primary: { label: 'Get diagnosed', path: '/triage' } },
    vitals: [{ label: 'New cases today', base: 100, perDay: 5000, fmt: 'int' }],
    today: { kicker: 'Today', title: 'New every day.' },
    arcade: { kicker: 'Occupational therapy', title: 'The Arcade', body: '' },
    tv: { kicker: 'TV', title: 'Always on', body: '', rotation: ['news', 'commercial', 'intervention', 'hostage'], guide: [{ title: 'Nightly News', module: 'news', genre: 'News' }] },
    ticker: ['ADVISORY: It was DNS'],
    footer: { disclaimer: 'Satire. All statistics are simulated.', legal: 'Any resemblance to a vendor is [REDACTED BY LEGAL].', made: 'Paid for by SponsorCo. Yes, this is marketing.' },
  },
  cure: { kicker: 'There is a cure', title: 'Treatment is available.', body: '', treatments: [{ symptom: 'Vendor Attachment', fact: 'pricing' }], dosage: [{ label: 'Small teams', fact: 'free' }], faq: [] },

  // The cold open (every load of the bare home page). See brands/oktholm/content/admission.js for a full script.
  admission: {
    wake: { voice: 'paramedic', say: 'Hey. Can you hear me? Tap if you can hear me.', caption: 'Can you hear me? Tap if you can hear me.', tapLabel: 'Tap if you can hear me', timeoutMs: 5000 },
    scenes: [
      {
        id: 'er',
        lines: [
          { voice: 'paramedic', who: 'Paramedic', say: 'Found at their desk defending a price increase.' },
          { voice: 'doctor', who: 'Doctor', say: '[sighs] Example Syndrome. Get them to Intake.' },
          { voice: 'pa', who: 'Overhead', say: 'Code Example, Emergency Department.' },
        ],
      },
    ],
    wristband: { hospital: 'Example General', ward: 'Emergency', condition: 'Suspected Example Syndrome', broughtIn: 'Brought in by a concerned colleague. (Name withheld.)', selfAdmit: 'Walked in on their own.', allergies: 'Allergies: “Contact Sales”' },
    title: { name: 'Example Syndrome', definition: 'When you’ve been held by a tool so long, you start defending it.' },
    labels: { skip: 'Skip', sound: 'Sound on', replay: 'Replay admission', tapHint: 'Best with sound' },
    pages: ['Paging the owner of the spreadsheet. The spreadsheet is on fire.'],
  },

  // The front-desk chatbot. Keep the distress block: it breaks character when someone might be struggling.
  intake: {
    name: 'Intake',
    voice: 'intake',
    avatar: '🩺',
    greeting: ['Hi. I’m Intake, the front desk.', 'You were brought in with suspected Example Syndrome. Tour, or straight to the diagnosis?'],
    teaser: [{ id: 'triage', label: 'Get diagnosed', sub: '2 min', path: '/triage', art: 'stamp' }, { id: 'oktv', label: 'TV', sub: 'Always on', path: '/tv', art: 'tv' }],
    replies: { tour: 'Give me the tour', diagnose: 'Diagnose me', denial: 'I’m fine.' },
    denial: { lines: ['That’s what everyone says.'], count: { first: 'You’re the first today.', few: 'You’re #{N} today.', many: '{N} people said that today.', manyFrom: 25 }, prove: 'Prove it' },
    tour: { intro: 'Right this way.', stops: [{ id: 'triage', target: 'triage', say: 'Two minutes. One certificate.', cta: { label: 'Start triage', path: '/triage' } }], outro: 'That’s the tour.' },
    commands: [{ match: ['help'], reply: ['I understand: help.'] }],
    fallback: ['I’m a scripted chatbot. Type “help”.'],
    distress: {
      match: ['not ok', 'not okay', 'kill myself', 'suicid', 'want to die', 'self harm', 'self-harm', 'hurt myself', 'end it all'],
      reply: ['Stepping out of the bit for a second.', 'If you’re not okay, please talk to someone now. In the US, call or text 988. Anywhere else, findahelpline.com lists free, confidential lines near you.'],
    },
    labels: { placeholder: 'Type a message…', send: 'Send', open: 'Chat with Intake', close: 'Close chat', next: 'Next', go: 'Take me there', end: 'End tour', typing: 'Intake is typing…' },
  },

  // The captor's texts. The ex test: if it would be alarming from an ex, cut it. Greedy and absurd, never watchful.
  captor: {
    contact: { name: 'Your Vendor', avatar: '🔒', status: 'online · billing' },
    voice: 'captor',
    rules: { maxPerVisit: 3, minGapMs: 90000, firstDelayMs: 20000, quietRoutes: ['play', 'watch', 'intervention', 'intervention-view'] },
    texts: [{ id: 'hello', on: 'first-visit', text: 'hi 🙂 just checking in. also your renewal is due' }],
    daily: ['thinking of you. and of your seat count'],
    tabTitles: ['k.'],
    block: { button: 'Block this number', confirm: 'Blocked.', unblock: 'Unblock' },
    howKnow: { label: 'How does it know?', path: '/chart' },
    breakup: {
      open: 'I want to leave.', opener: 'wait. let’s talk about this',
      rounds: [{ offer: '10% off?', discount: 10 }, { offer: '25% off', discount: 25 }, { offer: '40% off. final offer', discount: 40 }],
      bustChance: [0, 0.15, 0.3], bust: ['too late 🙂 auto-renewed'], stay: 'Stay for {d}% off', walk: 'Walk away', walked: 'ok. your export ships in 90 business days.',
      result: { walked: 'Negotiated {d}% off. Left anyway.', stayed: 'Stayed for {d}% off.', busted: 'Got auto-renewed mid-breakup.' },
    },
    export: { title: 'Texts from my vendor', footer: 'It’s not love. It’s lock-in.', cta: 'Get diagnosed: {link}' },
  },

  records: {
    chart: { kicker: 'Records request', title: 'Your medical records', lede: 'Everything this site knows about you.', sends: ['Your Patient ID and who referred you.'], never: 'No names, no emails, no cookies.', discharge: 'Delete my data', dischargeBody: 'Deletes everything above from this browser.', dischargeConfirm: 'Delete', discharged: 'Done.' },
    breakGlass: { kicker: 'Staff only', title: 'Break glass', lede: 'The emergency admin account.', envelope: '“Password: ask Dave.”', dave: 'Dave left.', cta: 'Offboard Dave' },
  },
};
