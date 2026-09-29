// Brand content for the "ransom" module (Oktholm Syndrome / YeshID).
// Pure data only: no DOM access, no CSS imports. Read by the module as ctx.content.
//
// How the note is built: salutation + template + postscript are cut into magazine letters (keep them short
// and SHOUTY; every character becomes a tile), then a handwritten signoff and a typed footnote.
// Tokens: {company} {pct} {seats} {deadline}. Templates/postscripts/salutations/signoffs may be tied to a mood.
//
// Quote line items: `basis` is one of seat | app | admin | day | month | flat | press | push | leaver | joiner |
// group | redline, `rate` is a rough list price per unit per year. The module scales every rate so the total
// lands exactly on the note's percentage. `always: true` items appear on every quote.

export default {
  title: 'Renewal Ransom Note',
  blurb: 'Your identity provider sent the renewal quote. It came with a ransom note. Make yours.',
  emoji: '✂️',
  minutes: '1 min',
  therapy: 'Treats: Renewal Quote Shock',

  intro: {
    kicker: 'Evidence locker · Renewal season',
    title: 'Renewal Ransom Note',
    lede:
      'Every year the renewal arrives the same way: letters cut from old magazines, taped shut, hand-delivered by a Named Customer Success Manager nobody has ever met. Tell us what they have. We’ll print what they want.',
  },

  form: {
    company: 'Company name',
    companyPlaceholder: 'Acme Corp',
    companyFallback: 'Your company',
    seats: 'Seats held hostage',
    seatsDefault: 250,
    spend: 'Current annual spend',
    spendOptional: 'optional',
    spendPlaceholder: 'e.g. 48,000',
    spendHelp: 'Leave it blank. They already know.',
    mood: 'Vendor mood',
    submit: 'Open the envelope',
    regenerate: 'Regenerate',
    download: 'Download PNG',
    downloading: 'Developing…',
  },

  envelope: {
    stamp: 'Renewal enclosed',
    urgent: 'Time sensitive',
    to: 'To: {company} IT',
    from: 'From: [REDACTED BY LEGAL]',
    line: 'You have (1) new renewal notice. It is taped shut. It is ticking.',
    cta: 'Open the envelope',
  },

  moods: [
    { id: 'aggressive', label: 'Aggressive', hint: 'All caps, no greeting', pct: [38, 64], stamp: 'Final offer' },
    { id: 'passive', label: 'Passive-aggressive', hint: 'Per my last email', pct: [17, 33], stamp: 'Per my last email' },
    { id: 'contractual', label: 'Contractually obligated', hint: 'See Section 14.2(b)', pct: [9, 19], stamp: 'Non-negotiable' },
    { id: 'partner', label: '“Strategic partner”', hint: 'Let’s align on synergies', pct: [26, 47], stamp: 'Mutual success' },
  ],

  salutations: [
    { text: 'ATTN: {company} IT' },
    { text: 'DEAR {company},' },
    { text: 'TO {company}:' },
    { mood: 'aggressive', text: '{company}. WE NEED TO TALK.' },
    { mood: 'passive', text: 'HI {company}! HOPE YOU’RE WELL.' },
    { mood: 'contractual', text: 'RE: {company} (THE “CUSTOMER”)' },
    { mood: 'partner', text: 'HEY {company} FAMILY,' },
  ],

  templates: [
    // Aggressive
    { mood: 'aggressive', text: 'WE HAVE YOUR SSO. PAY {pct}% MORE BY {deadline} OR THE LOGOUT BUTTON GETS IT.' },
    { mood: 'aggressive', text: 'PAY {pct}% MORE OR ALL {seats} OF YOUR USERS MEET THE PASSWORD RESET PAGE. PERSONALLY.' },
    { mood: 'aggressive', text: 'WE KNOW WHERE YOUR SAML CERTS LIVE. {pct}% MORE BY {deadline}. THEY EXPIRE SOON.' },
    { mood: 'aggressive', text: 'WE HAVE YOUR ADMIN CONSOLE. {pct}% MORE BY {deadline} OR IT GETS A REDESIGN.' },
    { mood: 'aggressive', text: '{pct}% MORE BY {deadline}. OR MFA PROMPTS ARRIVE IN BATCHES OF TEN. FOREVER.' },
    // Passive-aggressive
    { mood: 'passive', text: 'PER OUR LAST 14 EMAILS, YOUR PRICE GOES UP {pct}% BY {deadline}. HOPE THIS HELPS!' },
    { mood: 'passive', text: 'NO PRESSURE, BUT IT WOULD BE A SHAME IF SOMETHING HAPPENED TO YOUR SCIM. JUST {pct}% MORE.' },
    { mood: 'passive', text: 'WE SAW YOU LOOKING AT OTHER VENDORS. THAT’S FINE. {pct}% MORE IS ALSO FINE.' },
    { mood: 'passive', text: 'JUST CIRCLING BACK: {pct}% MORE BY {deadline}, OR YOUR AUDIT LOGS TAKE A LONG VACATION.' },
    // Contractually obligated
    { mood: 'contractual', text: 'PURSUANT TO SECTION 14.2(B), YOUR SSO REMAINS IN OUR CUSTODY. REMIT {pct}% MORE BY {deadline}.' },
    { mood: 'contractual', text: 'PER THE AUTO-RENEWAL CLAUSE YOU SIGNED IN 2021, YOU NOW OWE {pct}% MORE. THE CLAUSE HAS SPOKEN.' },
    { mood: 'contractual', text: 'THIS NOTICE CONSTITUTES NOTICE. {pct}% UPLIFT EFFECTIVE {deadline}. THE NOTICE PERIOD ENDED LAST WEEK.' },
    { mood: 'contractual', text: 'THE MSA IS CLEAR: {pct}% MORE BY {deadline}. NON-NEGOTIABLE. NON-REFUNDABLE. NON-SCIM.' },
    // "Strategic partner"
    { mood: 'partner', text: 'AS YOUR STRATEGIC PARTNER, WE HAVE STRATEGICALLY DECIDED YOU PAY {pct}% MORE. LET’S SYNERGIZE.' },
    { mood: 'partner', text: 'WE VALUE THIS RELATIONSHIP {pct}% MORE THAN LAST YEAR. PLEASE REMIT BY {deadline}.' },
    { mood: 'partner', text: 'LET’S ALIGN ON A MUTUAL SUCCESS PLAN: YOU PAY {pct}% MORE. WE SUCCEED. CIRCLE BACK BY {deadline}.' },
    { mood: 'partner', text: 'YOUR NAMED CSM WOULD LOVE A QBR ABOUT THE {pct}% UPLIFT. THEY ARE NOT REACHABLE.' },
  ],

  postscripts: [
    { text: 'NO COPS. NO COMPETITORS. NO SCIM.' },
    { text: 'DON’T TELL PROCUREMENT.' },
    { text: 'COME ALONE. BRING YOUR CFO.' },
    { text: 'DO NOT CONTACT SALES. SALES WILL CONTACT YOU.' },
    { text: 'THE AUDIT LOGS ARE SAFE. FOR 7 DAYS.' },
    { text: 'WE ALSO HAVE YOUR SCIM. GETTING IT BACK IS AN ADD-ON.' },
    { text: 'LEAVE THE PO UNDER THE FICUS IN THE LOBBY.' },
    { text: 'CALL SUPPORT AND WE’LL KNOW. IN 5–7 BUSINESS DAYS.' },
    { text: 'NO SCREENSHOTS TO REDDIT.' },
    { mood: 'passive', text: 'NO RUSH. (RUSH.)' },
    { mood: 'contractual', text: 'SEE ATTACHED. THE ATTACHMENT IS BILLABLE.' },
    { mood: 'partner', text: 'THIS NOTE MAY BE RECORDED FOR SYNERGY PURPOSES.' },
  ],

  // Handwritten, so lower case is allowed. Keyed by mood id; `default` is the fallback.
  signoffs: {
    aggressive: ['— your identity provider', '— [REDACTED BY LEGAL]', '— the Renewals Desk'],
    passive: ['— warmly, your Account Team :)', '— hope this helps!', '— sent from my renewal pipeline'],
    contractual: ['— Legal, on behalf of Legal', '— the Auto-Renewal Clause', '— Section 14.2(b)'],
    partner: ['— your Strategic Partner', '— your Named CSM (unreachable)', '— Team Mutual Success'],
    default: ['— your identity provider'],
  },

  deadlines: ['FRIDAY', 'END OF QUARTER', 'MIDNIGHT', 'OUR FISCAL YEAR END', 'MONDAY 9AM', 'YOUR BUDGET FREEZE'],

  footnotes: [
    'This message is confidential and may not be forwarded to procurement, finance, or anyone with a spreadsheet.',
    'Letters cut from back issues of Enterprise Architecture Monthly. Scissors billed separately.',
    'Replying to this note opens a support case. Estimated first response: next renewal.',
    'Printed on 100% recycled renewal quotes from previous years.',
  ],

  quote: {
    title: 'Renewal Quote',
    vendor: '[REDACTED BY LEGAL] Identity Cloud, Inc. · Renewals Division',
    labels: {
      number: 'Quote no.',
      date: 'Issued',
      company: 'Prepared for',
      seats: 'Seats',
      valid: 'Valid until',
      terms: 'Terms',
    },
    validUntil: 'Yesterday',
    terms: 'Net 0. Due on receipt of this quote.',
    head: { item: 'Description', qty: 'Qty × rate', amount: 'Amount' },
    flat: 'flat fee',
    subtotal: 'Subtotal',
    uplift: 'Loyalty uplift',
    upliftNote: 'thank you for your loyalty',
    total: 'Total due',
    lastYear: 'Last year',
    lastYearEstimated: 'Last year (we checked)',
    increase: 'Increase vs last year',
    more: '+ {n} more line items on page 2 of 14',
    finePrint: [
      'Prices exclude tax, fees, surcharges, and the surcharge on fees.',
      'This quote was valid until yesterday. A new quote will be 7% higher.',
      'Discounts available for customers who commit to seven years and stop asking questions.',
      'Seat counts true up automatically. They never true down.',
      'Signature (wet ink, e-signature, or firstborn app): ______________',
    ],
  },

  lineItems: [
    { name: 'SSO Enablement Fee', basis: 'seat', rate: 6, always: true },
    { name: 'SCIM Surcharge (per app, per heartbeat)', basis: 'app', rate: 900 },
    { name: 'Second Factor (first factor sold separately)', basis: 'seat', rate: 4.5 },
    { name: 'Audit Log Retention: 7 days (8th day extra)', basis: 'day', rate: 1400 },
    { name: 'Admin Console Access Add-on', basis: 'admin', rate: 1800 },
    { name: 'Logout Button (Enterprise tier)', basis: 'seat', rate: 2 },
    { name: 'Premium Support (response within one fiscal year)', basis: 'flat', rate: 24000 },
    { name: 'Named Customer Success Manager (named, not reachable)', basis: 'flat', rate: 18000 },
    { name: 'Price Increase Protection Fee', basis: 'flat', rate: 9500 },
    { name: 'Mandatory Professional Services (9 months)', basis: 'month', qty: 9, rate: 14000 },
    { name: 'Uptime Assurance: 99.9% of the time we’re up 99.9% of the time', basis: 'flat', rate: 11000 },
    { name: 'Loyalty Surcharge', basis: 'seat', rate: 3 },
    { name: 'Password Reset Button (per press)', basis: 'press', rate: 1.25 },
    { name: 'API Access (100 requests/min, shared with other customers)', basis: 'flat', rate: 15000 },
    { name: 'Webhooks (beta since 2019)', basis: 'flat', rate: 6000 },
    { name: 'Custom Login Background (JPEG only)', basis: 'flat', rate: 4500 },
    { name: 'Sandbox Tenant (has never matched production)', basis: 'flat', rate: 16000 },
    { name: 'Terraform Provider Maintenance Fee', basis: 'flat', rate: 7500 },
    { name: 'Group Rules (per AD group; you have a lot)', basis: 'group', rate: 3 },
    { name: 'Session Timeout Configuration Privileges', basis: 'flat', rate: 3500 },
    { name: 'MFA Push Delivery (per push)', basis: 'push', rate: 0.004 },
    { name: 'Offboarding Surcharge (removing access costs extra)', basis: 'leaver', rate: 45 },
    { name: 'Onboarding Convenience Fee', basis: 'joiner', rate: 38 },
    { name: 'Directory Sync (one direction, our choice)', basis: 'flat', rate: 9000 },
    { name: 'Security Questionnaire Completion Fee', basis: 'flat', rate: 5000 },
    { name: 'SAML Certificate Expiry Reminder (sent the day after)', basis: 'flat', rate: 2500 },
    { name: 'Roadmap Access (read-only, mostly redacted)', basis: 'flat', rate: 8000 },
    { name: 'QBR Attendance Fee (our attendance)', basis: 'flat', rate: 3200 },
    { name: 'Invoice Generation Fee (for this invoice)', basis: 'flat', rate: 750 },
    { name: 'Contract Redline Processing (per redline)', basis: 'redline', rate: 450 },
    { name: 'Multi-Year Discount Removal Fee', basis: 'flat', rate: 6000 },
    { name: 'Data Export Fee (should you ever leave)', basis: 'flat', rate: 25000 },
    { name: 'Admin Certification Renewal (the button moved again)', basis: 'admin', rate: 650 },
    { name: 'Legacy LDAP Interface (for the one app from 2006)', basis: 'flat', rate: 12000 },
    { name: 'Health Check (we diagnose, a partner treats)', basis: 'flat', rate: 9000 },
    { name: 'Seat True-Up (for interns you might hire)', basis: 'seat', rate: 1.5 },
    { name: 'Dark Mode (Enterprise+)', basis: 'seat', rate: 0.75 },
    { name: 'Access Reviews (requires Governance Suite, requires patience)', basis: 'seat', rate: 3.5 },
    { name: 'Break-Glass Account (glass sold separately)', basis: 'flat', rate: 2000 },
    { name: '“Contact Sales” Consultation (to learn the price of this line)', basis: 'flat', rate: 1500 },
  ],

  polaroid: {
    sign: ['STILL ALIVE', '{date}'],
    caption: 'Proof of life',
    note: 'Admin, day 1 of renewal season',
  },

  tag: {
    exhibit: 'Exhibit A',
    case: 'Case {number}',
    seats: '{seats} seats held',
    demand: 'Demand: +{pct}%',
  },

  poster: {
    footer: 'Make your own ransom note:',
  },

  share: {
    title: 'Forward to procurement',
    text: 'Our identity provider sent the renewal. It came with a ransom note. {pct}% or the logout button gets it. Make yours:',
  },

  cta: {
    kicker: 'Prescription',
    title: 'Pay for software, not ransoms.',
    label: 'See the price list (it’s public)',
    secondaryLabel: 'See the SSO tax, itemized',
  },
};
