// Brand content for the "intervention" module (Oktholm Syndrome / YeshID).
// Pure data only: no DOM access, no CSS imports. Read by the module as ctx.content.
// {name} is the friend's first name, {from} the sender, {role} / {rel} the chosen options.
// Order matters for roles, relationships and tones: share links store their index.
// Symptom ids are stored in share links too: never rename one, only add new ones.
export default {
  title: 'Stage an Intervention',
  blurb: 'Someone you love is bonded to their identity provider. Write the letters, we gather the couch, you send the link.',
  emoji: '💌',
  minutes: '2 min',
  therapy: 'Treats: Vendor Denial (in someone else)',

  roles: [
    'Sysadmin',
    'IT Manager',
    'Security Engineer',
    'The person who does IT because they sit closest to the router',
    'Founder who is also IT',
  ],
  roleShort: ['Sysadmin', 'IT Manager', 'Security Engineer', 'Sits closest to the router', 'Founder / also IT'],
  roleEmoji: ['🧑🏽‍💻', '🧑🏻‍💼', '🕵🏾', '🧑🏼‍🔧', '🧑🏾‍🚀'],
  roleIntros: [
    '{name} is a sysadmin. {name} has not taken a real vacation since the last major version.',
    '{name} manages IT. {name} approved the renewal. Twice. Without reading page four.',
    '{name} is a security engineer. {name} keeps a spreadsheet of the other spreadsheets.',
    '{name} does IT because {name} sits closest to the router. That was the whole interview.',
    '{name} founded the company. {name} is also the help desk, the IT department, and the on-call rotation.',
  ],

  relationships: ['Coworker', 'Manager', 'Direct report', 'Spouse / partner', 'Fellow on-call sufferer', 'Concerned vendor-neutral friend'],
  relLabel: ['coworker', 'manager', 'direct report', 'partner', 'fellow on-call sufferer', 'vendor-neutral friend'],
  // The person staging it reads the last letter.
  relationshipLines: [
    '{name}, I sit next to you. I hear the sighing. I hear all of the sighing.',
    '{name}, I am approving your PTO. You do not get a say. This is a direct order.',
    '{name}, I was scared to say this out loud, so I opened a ticket. It’s a P1. It’s about you.',
    '{name}, you said “per my last email” to the dog. The dog is worried about you.',
    '{name}, when your pager goes off, mine flinches. We’re bonded by trauma. Let’s be bonded by something else.',
    '{name}, I’m not selling anything. I’m just worried. Mostly worried.',
  ],
  // "Stage one back": manager <-> direct report swap, everything else is symmetric.
  relInverse: [0, 2, 1, 3, 4, 5],

  tones: [
    { id: 'gentle', label: 'Gentle', hint: 'Soft lighting. Tissues on the coffee table.' },
    { id: 'firm', label: 'Firm', hint: 'Nobody leaves until the groups are deleted.' },
    { id: 'reality', label: 'Full reality TV', hint: 'Dramatic zooms. A bleep. A chair spin.' },
  ],

  symptoms: [
    { id: 'rollout', label: 'Calls a nine-month rollout “pretty fast”', line: '{name}, last week you told the new hire that a nine-month rollout is “actually pretty fast.”', fact: 'setup' },
    { id: 'groups', label: 'Has 412 AD groups and knows them by name', line: 'You have 412 Active Directory groups. We counted. You named three of them after your kids.', fact: 'rbac' },
    { id: 'hold', label: 'On hold with vendor support since March', line: 'You’ve been on hold with vendor support since March. You hum the hold music in your sleep.', fact: 'pricing' },
    { id: 'terraform', label: 'Keeps Terraform in unusual places', line: 'We found Terraform in your sock drawer. {name}, it was inside a sock.', fact: 'lifecycle' },
    { id: 'renewal', label: 'Defends the renewal quote at dinner', line: 'At Thanksgiving you defended a forty percent renewal increase. Grandma took the vendor’s side.', fact: 'pricing' },
    { id: 'ssotax', label: 'Says the SSO tax is “for our protection”', line: 'You told the CFO the SSO tax is “for our own protection.” {name}, you sounded like a hostage.', fact: 'pricing' },
    { id: 'offboard', label: 'Offboards by hand, one app at a time', line: 'You offboarded Dave by hand. It took nine days. Dave left in March. Dave still has Figmint.', fact: 'lifecycle' },
    { id: 'spreadsheet', label: 'Trusts a spreadsheet called ACCESS_FINAL_v7', line: 'Your source of truth is a spreadsheet called ACCESS_FINAL_v7_REAL. It is not final. It is not real.', fact: 'reviews' },
    { id: 'audit', label: 'Screenshots everything for the auditor', line: 'You took four thousand screenshots for the auditor. You had one of them framed.', fact: 'audit' },
    { id: 'shadow', label: 'Pretends not to see shadow IT', line: 'Marketing expensed three AI note-takers on a corporate card. You saw it. You said nothing.', fact: 'shadow' },
    { id: 'admin', label: 'Grants “admin for the afternoon”', line: 'You gave the intern global admin “just for the afternoon.” That was two years ago. The intern is a director now.', fact: 'jit' },
    { id: 'slack', label: 'Approves access in DMs at 11 PM', line: 'You approve access requests in DMs at 11 PM with a thumbs-up emoji. {name}, that is not an audit trail.', fact: 'requests' },
    { id: 'pager', label: 'Sleeps with the pager', line: 'You sleep with the pager on your pillow. The pager has its own pillow now.', fact: 'rae' },
    { id: 'saml', label: 'Says “quick SAML question” without flinching', line: 'You said “quick SAML question” and didn’t even flinch. {name}, there is no such thing.', fact: 'directories' },
    { id: 'reviews', label: 'Rubber-stamps access reviews', line: 'You approved a nine-hundred-row access review in eleven seconds. We timed it.', fact: 'reviews' },
    { id: 'mfa', label: 'Resets the CEO’s MFA from vacation', line: 'You reset the CEO’s MFA from a beach in Portugal. You were on a jet ski.', fact: 'requests' },
    { id: 'wiki', label: 'Is the documentation', line: 'The wiki just says “ask {name}.” You are the documentation. That is not a job title.', fact: 'lifecycle' },
    { id: 'contract', label: 'Knows the contract end date by heart', line: 'You know the contract end date by heart. You do not know our anniversary.', fact: 'pricing' },
  ],

  // Friends on the couch. The person staging it gets the seat with the heart pillow.
  cast: [
    // `voice` is a cast role (brands/oktholm/cast.js); pitch only tunes the browser fallback.
    { emoji: '👩🏽‍💼', label: 'Linda, from Finance', voice: 'linda', pitch: 1.1 },
    { emoji: '🧔🏻', label: 'Greg, the other admin', voice: 'greg', pitch: 0.92 },
    { emoji: '👵🏿', label: 'Your mom', voice: 'mom', pitch: 1.2 },
    { emoji: '🧑🏼‍💻', label: 'The intern (now a director)', voice: 'intern', pitch: 1.05 },
  ],
  castFallbackLabel: 'A concerned coworker',
  host: { emoji: '🧑🏾‍⚕️', label: 'Dr. Holm, interventionist', voice: 'interventionist', pitch: 0.95 },
  senderEmoji: '🧑🏽',

  coldOpens: [
    '{name} thinks this is a meeting about the new ticketing system.',
    '{name} was told this was a quick sync. It is not a quick sync.',
    '{name} thinks we’re here to celebrate a successful audit.',
  ],
  hostLines: {
    gentle: '{name}, everyone in this room loves you. They wrote letters.',
    firm: '{name}, sit down. Nobody leaves until everyone has read their letter.',
    reality: '{name}. Sit down. This is an intervention.',
  },
  openers: {
    gentle: ['{name}, I love you, and I need to say this.', 'I wrote this down so I wouldn’t cry.', 'This is really hard for me.', 'We’re only here because we care.'],
    firm: ['{name}, I’m going to be direct.', 'No more excuses.', 'Look at me, {name}.', 'This stops today.'],
    reality: ['I didn’t want to do this on camera, but—', 'Can we get a close-up for this?', 'Okay. Okay. I can do this.', 'I’m just going to say it.'],
  },
  // Reality TV only: one letter gets bleeped. {bleep} marks the spot.
  bleepLines: [
    'And honestly, {name}? Your group naming convention is {bleep}.',
    'The vendor called it “fair and customary.” {name}, that is {bleep}.',
    'I read the renewal quote, {name}. It was {bleep} insulting.',
  ],
  reactions: ['[dramatic sting]', '[gasps]', '[someone drops a mug]', '[ominous synth]'],
  finale: '{name}, we’ve arranged treatment.',
  cliffhanger: 'Will {name} accept treatment?',
  treatment: {
    title: 'Treatment plan',
    patient: 'Patient',
    prescribedBy: 'Prescribed by',
    everyone: 'everyone in this room',
    stamp: 'Approved',
  },

  // Names for the sample intervention that airs on OKTV.
  names: ['Kevin', 'Priya', 'Marcus', 'Dana', 'Tomás', 'Aisha', 'Jordan', 'Mei', 'Sam', 'Olu', 'Inés', 'Raj', 'Noor', 'Bea'],

  ui: {
    kicker: 'Oktholm General · Family Services',
    title: 'Stage an intervention',
    lede: 'Someone you love is bonded to their identity provider. Pick the symptoms. We write the letters, gather the couch, and stage it. You send the link.',
    step1: 'Who needs help?',
    nameLabel: 'Their first name',
    namePlaceholder: 'e.g. Kevin',
    roleLabel: 'Their role',
    relLabel: 'You are their…',
    step2: 'Symptoms',
    step2Hint: 'Pick up to five. More than five is a roast.',
    pickForMe: 'Pick for me',
    step3: 'Tone',
    step4: 'Sign it',
    fromLabel: 'Your first name (optional)',
    fromPlaceholder: 'Leave blank to stay anonymous',
    fromHint: 'You read the last letter. Leave it blank to stay anonymous.',
    preview: 'Preview the intervention',
    stage: 'Stage the intervention & get the link',
    previewNote: 'Live preview. This is what {name} will see.',
    errName: 'Letters, spaces, hyphens, apostrophes and periods only (24 max).',
    errNameMissing: 'Who is this intervention for?',
    errSymptoms: 'Pick at least one symptom (or hit “Pick for me”).',
    maxed: 'Five symptoms selected. That is the clinical maximum.',
    kindNote: 'Let’s keep it kind. We’ll call them “Friend.”',
    stagedKicker: 'Intervention staged',
    stagedTitle: 'Now send it to {name}.',
    stagedText: 'The link carries the whole intervention. Nothing is stored on our side, and {name} sees exactly what you previewed.',
    shareTitle: 'Send it to them',
    shareText: 'An intervention has been staged for {name}. Please watch it. We love you.',
    watchAs: 'Watch it as {name} will',
    edit: 'Edit the letters',
    viewKicker: 'Oktholm General · Family Services',
    viewTitle: 'Someone who cares about you staged an intervention.',
    viewText: 'It takes about a minute. Sound on if you can. Captions if you can’t.',
    viewPoster: '{name}, please sit down.',
    accept: 'Accept treatment',
    stageBack: 'Stage one back',
    afterTitle: 'The first step is admitting you have a vendor.',
    afterText: 'Accepting treatment takes you to triage: a two-minute diagnosis. Or return the favor and stage one for the person who sent this.',
    damagedTitle: 'This intervention link is damaged. Probably SAML.',
    damagedText: 'The letters got lost somewhere between the IdP and the SP. You can still stage your own.',
    damagedCta: 'Stage an intervention',
    triage: 'Get diagnosed instead',
  },

  cta: {
    kicker: 'Actual treatment',
    title: 'Interventions work better with a plan.',
    facts: ['free', 'lifecycle', 'trial'],
    kind: 'primary',
  },
};
