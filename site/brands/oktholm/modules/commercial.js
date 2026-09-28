// Brand content for the "commercial" module (Oktholm Syndrome / YeshID).
// Pure data only: no DOM access, no CSS imports. Read by the module as ctx.content.
// A pharmaceutical-ad parody. Sponsor facts are read at runtime from brand.sponsor.facts, never restated here.
export default {
  title: 'Yeshidumab',
  blurb: 'A pharmaceutical commercial for your identity crisis. Side effects may include leaving work on time.',
  emoji: '💊',
  minutes: '1 min',
  therapy: 'Treats: Chronic Renewal Anxiety',

  drug: 'Yeshidumab',
  phonetic: 'yeshid-u-mab',

  poster: {
    kicker: 'A word from our sponsor',
    title: 'Yeshidumab',
    sub: 'Ask your CFO if it’s right for you.',
    cta: 'Play · 1 min · captions on',
  },

  about: {
    kicker: 'Paid programming · OKTV',
    title: 'Yeshidumab',
    text: 'A pharmaceutical commercial for the IT admin who defends the renewal quote at family dinners. Watch to the end: the side effects are the best part.',
  },

  // Opening scene props
  clock: '11:47 PM',
  unread: 400,
  queueTitle: 'Help Desk · My Queue',
  tickets: [
    'P1: “SSO is down” (it is not)',
    'Access request: “everything Dave has”',
    'New hire starts in 10 minutes',
    'SAML error on SalesFarce. Again.',
    'Why is MFA asking me again?',
    'Add me to All-Staff-v2-FINAL',
    'Offboard Dave (left in March)',
    'Quick question (not quick)',
  ],
  stickyNote: 'DO NOT REBOOT',

  // Speech-only respellings so the synthetic narrator says acronyms right. Captions keep the originals.
  pronounce: {
    IT: 'I T',
    AD: 'A D',
    CFO: 'C F O',
    SSO: 'S S O',
    MFA: 'M F A',
    SAML: 'sam-ul',
    Yeshidumab: 'Yesh-id-oo-mab',
    YeshID: 'Yesh I D',
  },

  script: {
    questions: [
      'Do you create three Active Directory groups for every new hire?',
      'Do you defend your renewal quote at family dinners?',
    ],
    diagnosis: 'You may be suffering from Oktholm Syndrome.',
    diagnosisTitle: 'Oktholm Syndrome',
    diagnosisNote: '*Not a real medical condition. Very real renewal quote.',
    symptoms: ['Defending your vendor', 'Ticket-induced insomnia', 'Flinching at the word “renewal”'],
    hope: 'But there is hope.',
    reveal: 'Introducing Yeshidumab.',
    ask: 'Ask your CFO if Yeshidumab is right for you.',
    // `disclaimer` is the tiny corner super every pharma ad has.
    montage: [
      { shot: 'five', line: 'Imagine leaving work at five. The same day you arrived.', super: '5:00 PM', disclaimer: 'Actor portrayal.' },
      { shot: 'beach', line: 'Walking the dog you forgot you had.', disclaimer: 'Dog not included.' },
      { shot: 'kite', line: 'Flying a kite. On a Tuesday.', disclaimer: 'Professional kite flyer. Closed course.' },
      { shot: 'latte', line: 'Offboarding forty apps with one click, latte in hand.', disclaimer: 'Dramatization.' },
      { shot: 'cfo', line: 'Even your CFO is smiling.', disclaimer: 'CFO portrayed by an actual CFO.' },
    ],
    fineDisclaimer: 'Individual results may vary.',
    finePrint: [
      'Side effects may include leaving work on time, remembering your children’s names, an irrational fondness for audits, sudden unexplained joy, uncontrollable urges to delete AD groups, and Slack messages that say thanks instead of urgent.',
      'Do not take Yeshidumab if you are allergic to saving money or are in the first year of a five-year contract.',
      'Tell your doctor about any onboarding lasting longer than four hours.',
      'Consult procurement before switching.',
    ],
    end: 'Yeshidumab.',
  },

  // Tiny scrolling legal crawl under the fine print. Nobody can read it. That is the point.
  legal: [
    'Yeshidumab is not a drug. It is a parody of a drug commercial about software.',
    'Individual results may vary with the size of your Active Directory.',
    'Dog sold separately. Kite not included. Beach subject to availability.',
    'Do not operate heavy machinery or a Terraform apply while celebrating.',
    'May cause mild confusion when a ticket queue reaches zero. This is normal.',
    'In rare cases patients have taken a lunch break. Consult your manager.',
    'Not evaluated by any regulatory agency, auditor, or your identity provider’s legal team, who asked us to stop.',
    'Stop use and call IT if you experience an urge to create a group named Temp-Final-2.',
    'Yeshidumab does not cure DNS. Nothing cures DNS.',
    'Keep out of reach of consultants.',
  ],

  bottle: {
    name: 'YESHIDUMAB',
    phonetic: '(yeshid-u-mab)',
    lines: ['Identity & access', 'Take as needed · 1 org'],
  },

  cfo: { name: 'Linda', title: 'CFO' },

  endcard: {
    kicker: 'Available without a prescription',
    ask: 'Ask your CFO.',
    ingredient: 'Active ingredient:',
    disclaimer: 'Yeshidumab is a parody. YeshID is real software.',
  },

  share: {
    title: 'Share the commercial',
    text: 'I watched the Yeshidumab commercial. Side effects may include leaving work on time.',
  },

  cta: {
    kicker: 'Actual prescription',
    title: 'Yeshidumab is a joke. YeshID is not.',
    facts: ['lifecycle', 'free'],
    kind: 'primary',
  },
};
