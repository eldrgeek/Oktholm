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
    hero: { kicker: 'Public health advisory', headlines: ['It’s not you. It’s your tooling.'], body: 'A condition in which people bond with the tools holding them captive.', primary: { label: 'Get diagnosed', path: '/triage' } },
    vitals: [{ label: 'New cases today', base: 100, perDay: 5000, fmt: 'int' }],
    today: { kicker: 'Today', title: 'New every day.' },
    arcade: { kicker: 'Occupational therapy', title: 'The Arcade', body: '' },
    tv: { kicker: 'TV', title: 'Always on', body: '', rotation: ['news', 'commercial', 'intervention', 'hostage'], guide: [{ title: 'Nightly News', module: 'news', genre: 'News' }] },
    ticker: ['ADVISORY: It was DNS'],
    footer: { disclaimer: 'Satire. All statistics are simulated.', legal: 'Any resemblance to a vendor is [REDACTED BY LEGAL].', made: 'Paid for by SponsorCo. Yes, this is marketing.' },
  },
  cure: { kicker: 'There is a cure', title: 'Treatment is available.', body: '', treatments: [{ symptom: 'Vendor Attachment', fact: 'pricing' }], dosage: [{ label: 'Small teams', fact: 'free' }], faq: [] },
};
