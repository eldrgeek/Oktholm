// Brand content for the "solution-builder" module (Oktholm Syndrome / YeshID).
// Pure data only: no DOM access, no CSS imports. Read by the module as ctx.content.
//
// Components: pricing is one of { perSeat } ($ per seat per month, billed annually), { perApp } ($ per connected
// app per year) or { flat } ($ per year). oneTime = professional services ($, scaled a little by seat count),
// months = implementation effort, consultants, groups = AD groups spawned (scaled by seat count), terraform = lines,
// sanity = % of the admin's remaining sanity it costs, requires = ids auto-added with it, apps = wired to the apps.
// Chaos nodes join the diagram on their own once the configuration's complexity score (SKUs + a seat bonus)
// reaches `at`, and bring their `effects` with them. Satirical numbers about the parody vendor only:
// nothing in here describes the sponsor, whose claims come from brand.sponsor.facts at runtime.
//
// Tokens for card/share/yeshid text: {annual} {months} {consultants} {consultantsText} {groups} {terraform} {golive}
// {skus} {skusText} {chaos} {chaosText} {hiddenCount} {seats} {apps} {number}.

export default {
  title: 'Build Your Own Oktholm™ Solution',
  blurb: 'Configure the identity platform of your nightmares. Watch the diagram turn into spaghetti.',
  emoji: '🏗️',
  minutes: '3 min',
  therapy: 'Treats: Enterprise Architecture Envy',

  header: {
    kicker: 'Build & Price · Configurator v9.3 (Enterprise Edition)',
    title: 'Build Your Own Oktholm™ Solution',
    sub: 'Configure the identity platform of your nightmares.',
    seats: 'Seats',
    seatsUnit: 'seats',
    tier: 'Tier: {tier} · Pricing: {note}',
    presets: 'Start from a preset',
    reset: 'Start over',
    catalog: 'Components',
    catalogNote: 'Tap to add. Dependencies add themselves.',
    requires: 'Requires {list}',
    services: '+{amount} services',
    included: 'Included',
    perSeat: '{price}/seat/mo',
    perApp: '{price}/app/yr',
    flat: '{price}/yr',
    legend: { dep: 'depends on', chaos: 'nobody approved this', undoc: 'undocumented' },
  },

  seats: { min: 25, max: 25000, default: 500 },
  startWith: ['login'],

  tiers: [
    { max: 99, name: 'Starter', note: 'Contact Sales' },
    { max: 999, name: 'Business', note: 'Contact Sales' },
    { max: 4999, name: 'Enterprise', note: 'Contact Sales (again)' },
    { max: 1000000000, name: 'Global Elite', note: 'Contact Legal' },
  ],

  categories: [
    { id: 'core', name: 'Core', blurb: 'The platform. Technically.' },
    { id: 'auth', name: 'Authentication', blurb: 'Logging in, sold by the factor.' },
    { id: 'lifecycle', name: 'Lifecycle', blurb: 'Joiners, leavers, and invoices.' },
    { id: 'governance', name: 'Governance', blurb: 'For the auditor who reads everything.' },
    { id: 'integration', name: 'Integration', blurb: 'Connect everything to everything. Rate-limited.' },
    { id: 'services', name: 'Services', blurb: 'People you pay to explain the other SKUs.' },
    { id: 'innovation', name: 'Innovation', blurb: 'Roadmap items with a price but no date.' },
  ],

  components: [
    // Core
    { id: 'login', name: 'Login Page (Base)', short: 'Login Page', category: 'core', desc: 'A username box, a password box and our logo. Your logo is an add-on.', pricing: { perSeat: 4 }, oneTime: 0, months: 1, consultants: 0, groups: 6, terraform: 150, sanity: 2, requires: [] },
    { id: 'console', name: 'Admin Console Access', short: 'Admin Console', category: 'core', desc: 'Lets you see your users. Editing them is a separate SKU.', pricing: { perSeat: 2 }, oneTime: 0, months: 0.5, consultants: 0, groups: 4, terraform: 80, sanity: 2, requires: ['login'] },
    { id: 'editing', name: 'User Editing Rights', short: 'User Editing', category: 'core', desc: 'Change a user’s last name without opening a ticket with us.', pricing: { perSeat: 1.5 }, oneTime: 0, months: 0.5, consultants: 0, groups: 0, terraform: 60, sanity: 2, requires: ['console'] },
    { id: 'entplus', name: 'Enterprise+ Tier Upgrade', short: 'Enterprise+ Tier', category: 'core', desc: 'Unlocks the features from the sales demo. Most of them.', pricing: { flat: 60000 }, oneTime: 0, months: 1, consultants: 0, groups: 0, terraform: 0, sanity: 3, requires: ['login'] },
    { id: 'sandbox', name: 'Sandbox Tenant', short: 'Sandbox', category: 'core', desc: 'A copy of production that has never once matched production.', pricing: { flat: 24000 }, oneTime: 8000, months: 1, consultants: 0, groups: 20, terraform: 600, sanity: 4, requires: ['console'] },
    { id: 'branding', name: 'Custom Branding Pack', short: 'Custom Branding', category: 'core', desc: 'Your logo, top-left, 40% smaller than ours.', pricing: { flat: 9000 }, oneTime: 0, months: 0.5, consultants: 0, groups: 0, terraform: 40, sanity: 1, requires: ['login'] },

    // Authentication
    { id: 'sso', name: 'SSO Enablement Tier', short: 'SSO', category: 'auth', desc: 'The feature you bought the product for, now available as an upgrade.', pricing: { perSeat: 6 }, oneTime: 15000, months: 2, consultants: 1, groups: 25, terraform: 500, sanity: 6, requires: ['login', 'console'], apps: true },
    { id: 'mfa', name: 'Second Factor Pack', short: 'Second Factor', category: 'auth', desc: 'First factor sold separately.', pricing: { perSeat: 3 }, oneTime: 0, months: 1, consultants: 0, groups: 8, terraform: 200, sanity: 4, requires: ['login'] },
    { id: 'passwordless', name: 'Passwordless (Preview, Enterprise+)', short: 'Passwordless (Preview)', category: 'auth', desc: 'In preview for three renewals running. Requires Enterprise+, a pilot group and faith.', pricing: { perSeat: 5 }, oneTime: 0, months: 3, consultants: 1, groups: 10, terraform: 300, sanity: 7, requires: ['mfa', 'entplus'] },
    { id: 'adaptive', name: 'Adaptive Risk Engine', short: 'Adaptive Risk', category: 'auth', desc: 'Blocks the CEO in Lisbon. Waves through the attacker in Ohio.', pricing: { perSeat: 3.5 }, oneTime: 0, months: 2, consultants: 0, groups: 12, terraform: 350, sanity: 6, requires: ['mfa'] },
    { id: 'hwkeys', name: 'Hardware Key Support', short: 'Hardware Keys', category: 'auth', desc: 'You buy the keys. We provide a 14-step enrollment wiki.', pricing: { flat: 15000 }, oneTime: 0, months: 1, consultants: 0, groups: 6, terraform: 120, sanity: 3, requires: ['mfa'] },
    { id: 'ldap', name: 'LDAP Interface (Legacy)', short: 'LDAP (Legacy)', category: 'auth', desc: 'For the one app from 2006 that runs payroll.', pricing: { flat: 28000 }, oneTime: 12000, months: 2, consultants: 1, groups: 60, terraform: 250, sanity: 8, requires: ['login'], apps: true },
    { id: 'session', name: 'Session Policy Add-on', short: 'Session Policies', category: 'auth', desc: 'Decide exactly how long before everyone is logged out mid-sentence.', pricing: { perSeat: 1 }, oneTime: 0, months: 0.5, consultants: 0, groups: 5, terraform: 120, sanity: 3, requires: ['sso'] },

    // Lifecycle
    { id: 'scim', name: 'SCIM Connector Pack (per app)', short: 'SCIM', category: 'lifecycle', desc: 'Provisioning for your apps, priced per app, per year, per sigh.', pricing: { perApp: 1800 }, oneTime: 10000, months: 2, consultants: 1, groups: 60, terraform: 900, sanity: 7, requires: ['sso'], apps: true },
    { id: 'workflows', name: 'Workflows Add-on', short: 'Workflows', category: 'lifecycle', desc: 'Drag-and-drop automation. Dragging is included. Dropping is Premium.', pricing: { perSeat: 2.5 }, oneTime: 0, months: 2, consultants: 0, groups: 30, terraform: 700, sanity: 6, requires: ['scim'] },
    { id: 'hr', name: 'HR-Driven Provisioning (requires Professional Services)', short: 'HR-Driven Provisioning', category: 'lifecycle', desc: 'Your HRIS becomes the source of truth after nine months of mapping job codes.', pricing: { perSeat: 3 }, oneTime: 85000, months: 5, consultants: 2, groups: 120, terraform: 1200, sanity: 9, requires: ['scim', 'workflows', 'partner'] },
    { id: 'jml', name: 'Joiner-Mover-Leaver Rules', short: 'JML Rules', category: 'lifecycle', desc: 'Handles joiners and leavers beautifully. Movers are on the roadmap.', pricing: { perSeat: 1.5 }, oneTime: 0, months: 2, consultants: 0, groups: 80, terraform: 800, sanity: 6, requires: ['hr'] },
    { id: 'offboard', name: 'Offboarding Assurance', short: 'Offboarding Assurance', category: 'lifecycle', desc: 'Guarantees access is removed within one business quarter.', pricing: { flat: 18000 }, oneTime: 0, months: 1, consultants: 0, groups: 10, terraform: 300, sanity: 4, requires: ['scim'] },
    { id: 'guests', name: 'Contractor & Guest Lifecycle', short: 'Contractor Lifecycle', category: 'lifecycle', desc: 'Contractors get accounts. Nobody removes them. We call it retention.', pricing: { perSeat: 1 }, oneTime: 0, months: 1.5, consultants: 0, groups: 45, terraform: 400, sanity: 5, requires: ['scim'] },

    // Governance
    { id: 'govpremium', name: 'Governance Suite Premium', short: 'Governance Premium', category: 'governance', desc: 'Required for Access Reviews. Don’t ask why. We didn’t.', pricing: { perSeat: 4 }, oneTime: 40000, months: 3, consultants: 1, groups: 40, terraform: 600, sanity: 6, requires: ['console', 'entplus'] },
    { id: 'reviews', name: 'Access Reviews', short: 'Access Reviews', category: 'governance', desc: 'Quarterly campaigns where managers click “Approve all” at record speed.', pricing: { perSeat: 3 }, oneTime: 0, months: 2, consultants: 0, groups: 20, terraform: 300, sanity: 6, requires: ['govpremium'] },
    { id: 'audit', name: 'Audit Log Retention (7 days)', short: 'Audit Logs (7 days)', category: 'governance', desc: 'Seven days of logs. Your auditor wants a year. The eighth day is extra.', pricing: { flat: 9000 }, oneTime: 0, months: 0.5, consultants: 0, groups: 0, terraform: 100, sanity: 2, requires: ['login'] },
    { id: 'auditplus', name: 'Audit Log Retention Extension (1 year)', short: 'Audit Logs (+358 days)', category: 'governance', desc: '358 more days, priced like beachfront property.', pricing: { flat: 45000 }, oneTime: 0, months: 0.5, consultants: 0, groups: 0, terraform: 80, sanity: 2, requires: ['audit'] },
    { id: 'sod', name: 'Separation of Duties Module', short: 'SoD Module', category: 'governance', desc: 'Detects toxic combinations, like you and this invoice.', pricing: { perSeat: 2 }, oneTime: 0, months: 2, consultants: 0, groups: 30, terraform: 400, sanity: 5, requires: ['govpremium'] },
    { id: 'pam', name: 'Privileged Access Add-on', short: 'Privileged Access', category: 'governance', desc: 'Admin rights, checked out like a library book nobody returns.', pricing: { perSeat: 3 }, oneTime: 25000, months: 3, consultants: 1, groups: 35, terraform: 650, sanity: 7, requires: ['govpremium', 'mfa'] },
    { id: 'compliance', name: 'Compliance Report Pack', short: 'Compliance Reports', category: 'governance', desc: 'A PDF your auditor will ask you to re-export as a CSV.', pricing: { flat: 20000 }, oneTime: 0, months: 1, consultants: 0, groups: 0, terraform: 150, sanity: 3, requires: ['auditplus'] },

    // Integration
    { id: 'api', name: 'API Access (rate-limited)', short: 'API (rate-limited)', category: 'integration', desc: '100 requests a minute, shared fairly between you and every other customer.', pricing: { flat: 15000 }, oneTime: 0, months: 1, consultants: 0, groups: 0, terraform: 200, sanity: 4, requires: ['console'] },
    { id: 'terraform', name: 'Terraform Provider', short: 'Terraform Provider', category: 'integration', desc: 'Manage your identity provider as code. The state file is haunted.', pricing: { flat: 0 }, oneTime: 20000, months: 2, consultants: 0, groups: 0, terraform: 4200, sanity: 9, requires: ['api'] },
    { id: 'saml', name: 'Custom SAML Connectors', short: 'Custom SAML', category: 'integration', desc: 'For apps that support SAML “mostly”.', pricing: { flat: 36000 }, oneTime: 15000, months: 2, consultants: 1, groups: 40, terraform: 600, sanity: 7, requires: ['sso'], apps: true },
    { id: 'webhooks', name: 'Webhooks (beta since 2019)', short: 'Webhooks (beta)', category: 'integration', desc: 'Event delivery guaranteed at least zero times.', pricing: { flat: 8000 }, oneTime: 0, months: 1, consultants: 0, groups: 0, terraform: 250, sanity: 5, requires: ['api'] },
    { id: 'adagent', name: 'AD Agent (on-prem)', short: 'AD Agent', category: 'integration', desc: 'A Windows service on a server nobody is allowed to patch.', pricing: { flat: 12000 }, oneTime: 6000, months: 2, consultants: 1, groups: 180, terraform: 300, sanity: 8, requires: ['login'] },
    { id: 'siem', name: 'SIEM Log Streaming', short: 'SIEM Streaming', category: 'integration', desc: 'Streams your logs at a per-gigabyte rate that makes the SIEM look cheap.', pricing: { flat: 22000 }, oneTime: 0, months: 1, consultants: 0, groups: 0, terraform: 300, sanity: 4, requires: ['auditplus'] },
    { id: 'hub', name: 'Integration Hub Credits', short: 'Integration Hub', category: 'integration', desc: 'Credits expire at midnight on a date we will announce later.', pricing: { flat: 30000 }, oneTime: 0, months: 1.5, consultants: 0, groups: 0, terraform: 500, sanity: 5, requires: ['api', 'workflows'], apps: true },

    // Services
    { id: 'partner', name: 'Implementation Partner', short: 'Implementation Partner', category: 'services', desc: 'A certified partner who has done this twice. Once successfully.', pricing: { flat: 0 }, oneTime: 150000, months: 4, consultants: 3, groups: 50, terraform: 800, sanity: 6, requires: [] },
    { id: 'csm', name: 'Named CSM (unreachable)', short: 'Named CSM', category: 'services', desc: 'They have a name. We just can’t say when they’ll use it.', pricing: { flat: 30000 }, oneTime: 0, months: 0, consultants: 0, groups: 0, terraform: 0, sanity: 3, requires: [] },
    { id: 'support', name: 'Premium Support', short: 'Premium Support', category: 'services', desc: 'Response within one business day, where “business day” is defined by us.', pricing: { perSeat: 2 }, oneTime: 0, months: 0, consultants: 0, groups: 0, terraform: 0, sanity: 2, requires: [] },
    { id: 'cert', name: 'Admin Certification (3 levels)', short: 'Admin Certification', category: 'services', desc: 'Level 1: where the button is. Level 3: why it moved.', pricing: { flat: 0 }, oneTime: 9000, months: 1, consultants: 0, groups: 0, terraform: 0, sanity: 4, requires: ['console'] },
    { id: 'arb', name: 'Architecture Review Board', short: 'Architecture Review Board', category: 'services', desc: 'Six people meet every other week to approve this diagram.', pricing: { flat: 0 }, oneTime: 30000, months: 2, consultants: 1, groups: 0, terraform: 0, sanity: 5, requires: ['partner'] },
    { id: 'migration', name: 'Migration Factory', short: 'Migration Factory', category: 'services', desc: 'Moves your apps to the new way, then back, then forward again.', pricing: { flat: 0 }, oneTime: 120000, months: 5, consultants: 2, groups: 90, terraform: 1000, sanity: 8, requires: ['partner', 'scim'] },
    { id: 'healthcheck', name: 'Quarterly Health Check', short: 'Health Check', category: 'services', desc: 'A consultant confirms your tenant is unwell, then refers you to a partner.', pricing: { flat: 16000 }, oneTime: 0, months: 0, consultants: 0, groups: 0, terraform: 0, sanity: 2, requires: ['csm'] },

    // Innovation (left out of the "Enterprise" preset; procurement said yes anyway)
    { id: 'zt', name: 'Zero Trust Branding Kit', short: 'Zero Trust Kit', category: 'innovation', desc: 'The words “Zero Trust” on 14 slides, plus a sticker.', pricing: { flat: 20000 }, oneTime: 0, months: 0.5, consultants: 0, groups: 0, terraform: 0, sanity: 2, requires: ['entplus'] },
    { id: 'devicetrust', name: 'Device Trust (agent required)', short: 'Device Trust', category: 'innovation', desc: 'Another agent. Your laptops now run more agents than a spy novel.', pricing: { perSeat: 2.5 }, oneTime: 0, months: 2, consultants: 0, groups: 20, terraform: 400, sanity: 6, requires: ['adaptive'] },
    { id: 'ledger', name: 'Identity Ledger (blockchain, pilot)', short: 'Identity Ledger', category: 'innovation', desc: 'Your groups, immutable forever. Including the wrong ones.', pricing: { flat: 75000 }, oneTime: 50000, months: 4, consultants: 1, groups: 100, terraform: 900, sanity: 9, requires: ['entplus', 'api'] },
    { id: 'quantum', name: 'Quantum-Safe Roadmap Slide', short: 'Quantum-Safe Slide', category: 'innovation', desc: 'A slide promising post-quantum crypto by a year we won’t name.', pricing: { flat: 12000 }, oneTime: 0, months: 0.5, consultants: 0, groups: 0, terraform: 0, sanity: 2, requires: ['entplus'] },
  ],

  // Added at checkout, revealed on the quote screen.
  hidden: [
    { id: 'platform', name: 'Platform Fee', desc: 'For the privilege of the platform the other fees run on.', pricing: { pctOfSubscription: 12 } },
    { id: 'protection', name: 'Price Protection Fee', desc: 'Protects our price from ever going down.', pricing: { pctOfSubscription: 6 } },
    { id: 'uplift', name: 'Annual Uplift 9%', desc: 'Applied every year, forever. A subscription to your subscription.', pricing: { pctOfSubscription: 9 } },
    {
      id: 'trueup',
      name: 'Seat Minimum True-Up',
      desc: 'You have {seats} seats. The minimum is {min}. Please enjoy your {ghosts} ghost seats.',
      descOver: 'For next year’s headcount, estimated optimistically.',
      pricing: { seatMinimum: 500, perSeat: 4, overPct: 8 },
    },
    { id: 'innovation', name: 'Innovation Surcharge', desc: 'Funds the roadmap. You will not be on it.', pricing: { pctOfSubscription: 4 } },
    { id: 'invoice', name: 'Invoice Delivery Fee', desc: 'For emailing you this invoice. Paper invoices are a separate SKU.', pricing: { flat: 1500 } },
  ],

  chaos: [
    { id: 'spreadsheet', label: 'The Spreadsheet', note: 'source of truth', at: 6, style: 'sheet', effects: { groups: 12, sanity: 6 } },
    { id: 'daves-script', label: 'Dave’s Script', note: 'cron, undocumented', at: 9, style: 'terminal', effects: { sanity: 8, months: 1 } },
    { id: 'middleware', label: 'Middleware for the Middleware', note: 'owned by nobody', at: 12, style: 'box', effects: { consultants: 1, months: 2, sanity: 6 } },
    { id: 'legacy-v2', label: 'Legacy Connector v2', note: 'deprecated', at: 15, style: 'legacy', effects: { groups: 40, months: 1, sanity: 5 } },
    { id: 'laptop', label: 'The Consultant’s Laptop', note: 'holds the only copy', at: 18, style: 'laptop', effects: { consultants: 1, sanity: 7 } },
    { id: 'shadow-forest', label: 'Shadow AD Forest', note: 'one-way trust, bad vibes', at: 21, style: 'legacy', effects: { groups: 150, sanity: 6 } },
    { id: 'runbook', label: 'The Runbook', note: 'wiki, last edited 2019', at: 25, style: 'sheet', effects: { months: 1, sanity: 5 } },
    { id: 'break-glass', label: 'Break-Glass Account', note: 'password on a Post-it', at: 29, style: 'sticky', effects: { sanity: 6 } },
    { id: 'sync-twice', label: 'The Sync Job That Runs Twice', note: 'nobody knows why', at: 33, style: 'terminal', effects: { groups: 60, months: 1, sanity: 6 } },
    { id: 'poc', label: 'The POC', note: 'now in production', at: 37, style: 'box', effects: { consultants: 1, months: 2, sanity: 7 } },
  ],

  presets: [
    { id: 'startup', name: 'Startup (just SSO please)', seats: 40, components: ['sso'] },
    { id: 'midmarket', name: 'Mid-market (the usual)', seats: 800, components: ['sso', 'mfa', 'scim', 'workflows', 'hr', 'reviews', 'audit', 'terraform', 'support', 'adagent', 'offboard', 'csm'] },
    { id: 'enterprise', name: 'Enterprise (everything)', seats: 6000, components: 'all', exclude: ['innovation'] },
    { id: 'procurement', name: 'Procurement said yes to everything', seats: 25000, components: 'all' },
  ],

  stats: {
    title: 'Your configuration',
    skus: '{n} SKUs',
    skuOne: '{n} SKU',
    annual: 'Annual cost',
    oneTime: 'One-time services',
    months: 'Implementation',
    monthsUnit: 'months',
    consultants: 'Consultants',
    groups: 'AD groups spawned',
    terraform: 'Terraform lines',
    sanity: 'Admin sanity',
    golive: 'Probability of go-live',
    fees: '+ fees calculated at checkout',
    quote: 'Get quote',
    details: 'Details',
    hide: 'Hide',
    mini: { annual: '/yr', months: 'mo', golive: 'go-live' },
  },

  diagram: {
    title: 'Reference architecture',
    version: 'v{n}',
    complexity: 'Complexity: {label}',
    users: 'Your {seats} users',
    apps: 'Your {apps} apps',
    levels: [
      { max: 0.02, label: 'Tidy (suspiciously)' },
      { max: 0.2, label: 'Manageable' },
      { max: 0.4, label: 'Concerning' },
      { max: 0.62, label: 'Load-bearing spaghetti' },
      { max: 0.85, label: 'Gloriously messy' },
      { max: 2, label: 'Consult a priest' },
    ],
  },

  toasts: {
    requires: '{name} requires {deps}. Added. Please don’t ask why.',
    loadBearingTitle: '{short} is load-bearing',
    loadBearingBody: 'Removing {name} also removes {count} built on top of it: {list}.',
    loadBearingConfirm: 'Remove all {n}',
    loadBearingCancel: 'Keep it (wise)',
    chaos: '{name} has joined your architecture. Nobody approved it.',
    preset: '{preset}: you picked {asked}. Dependencies picked {extra} more.',
    presetNoExtra: '{preset}: {n} SKUs, all load-bearing.',
    empty: 'Add at least one SKU. Even we can’t invoice nothing. (We’ve tried.)',
    reset: 'Configuration cleared. The consultants have been notified anyway.',
  },

  quote: {
    kicker: 'Quote',
    title: 'Your Oktholm™ Quote',
    numberPrefix: 'OKT',
    fields: [
      ['Prepared for', 'Valued Customer ({tier} tier)'],
      ['Account executive', '[REDACTED BY LEGAL]'],
      ['Valid for', '72 hours or until our quarter ends, whichever hurts more'],
      ['Payment terms', 'Annual, upfront, non-refundable'],
    ],
    head: { item: 'Component', basis: 'Basis', annual: 'Annual', oneTime: 'One-time' },
    included: 'Included (the services are not)',
    servicesOnly: 'Services only',
    perSeat: '{price}/seat/mo × {seats}',
    perApp: '{price}/app/yr × {apps} apps',
    flat: 'Flat, per year',
    hiddenTitle: 'Fees calculated at checkout',
    hiddenNote: 'Now revealed. They were always there.',
    newBadge: 'New',
    totals: {
      subscription: 'Subscription (what you configured)',
      hidden: 'Fees revealed at checkout',
      annual: 'Total annual',
      oneTime: 'One-time professional services',
      year1: 'Year 1 total',
      tco: '3-year total (9% uplift, compounding)',
    },
    timeline: {
      title: 'Implementation timeline',
      kickoff: 'Kickoff: next quarter ({q})',
      golive: 'Go-live: {q} (pending)',
      procurement: 'Procurement & security questionnaire',
      phases: [
        { name: 'Discovery workshops', share: 0.12 },
        { name: 'Solution design (v1–v4)', share: 0.16 },
        { name: 'Build & integrate', share: 0.32 },
        { name: 'UAT, then UAT again', share: 0.14 },
        { name: 'Pilot (IT department only)', share: 0.12 },
        { name: 'Hypercare, go-live, rollback, go-live', share: 0.14 },
      ],
      today: 'Today',
      renewal: 'Renewal {n}',
      golivePin: 'Go-live?',
      renewals: 'You will renew {n} times before go-live. Every renewal includes the Annual Uplift.',
      renewalsOne: 'You will renew once before go-live. It includes the Annual Uplift.',
      renewalsTwo: 'You will renew twice before go-live. Both renewals include the Annual Uplift.',
      renewalsNone: 'Go-live lands before your first renewal. Legal is looking into how that happened.',
    },
    verdict: 'Verdict',
    back: 'Back to the configurator',
    cardTitle: 'Your shareable quote card',
    download: 'Download PNG',
    downloading: 'Rendering…',
  },

  verdicts: [
    { min: 50, text: 'Approved (pending legal)', tone: 'approved' },
    { min: 20, text: 'See you at renewal', tone: 'denied' },
    { min: 5, text: 'Go-live: TBD', tone: 'denied' },
    { min: 1, text: 'Phase 2 (never)', tone: 'diagnosed' },
    { min: 0, text: 'Abandon all scope', tone: 'diagnosed' },
  ],

  card: {
    kicker: 'Build & Price · Quote {number}',
    title: 'My Oktholm™ Solution',
    perYear: '/yr',
    lines: [
      { text: '{months}-month rollout' },
      { text: '{consultantsText}' },
      { text: '{groups} AD groups spawned' },
      { text: '{terraform} lines of Terraform' },
      { text: '{golive} chance of go-live', alarm: true },
    ],
    diagram: 'Reference architecture {version} · {complexity}',
    footer: 'Build yours:',
  },

  share: {
    title: 'Send it to your CFO',
    text: 'I built my own Oktholm™ solution: {annual}/yr, {months}-month rollout, {consultantsText}, {groups} AD groups, {golive} chance of go-live. Build yours:',
  },

  yeshid: {
    kicker: 'Second opinion',
    title: 'Or: the same requirements with YeshID',
    sub: 'One box. No spaghetti. No fees revealed at checkout.',
    themTitle: 'Your Oktholm™ solution',
    themStats: ['{skusText}', '{months}-month rollout', '{consultantsText}', '{groups} AD groups', '{golive} chance of go-live'],
    usTitle: 'YeshID',
    usBox: 'YeshID',
    users: 'Your {seats} users',
    apps: 'Your {apps} apps',
    rowsHead: ['Requirement', 'Your configuration', 'With YeshID'],
    rows: [
      { label: 'Rollout', fact: 'setup', variants: [{ text: '{months}-month implementation, {consultantsText}, {chaosText}' }] },
      {
        label: 'Joiners & leavers',
        fact: 'lifecycle',
        variants: [
          { needs: 'hr', text: 'HR-Driven Provisioning (requires Professional Services)' },
          { needs: 'scim', text: 'SCIM Connector Pack, billed per app, per year, per sigh' },
          { text: 'Tickets. So many tickets.' },
        ],
      },
      {
        label: 'Access requests',
        fact: 'requests',
        variants: [
          { needs: 'workflows', text: 'Workflows Add-on, a ticket, and {groups} AD groups to pick from' },
          { text: 'A ticket, a spreadsheet, and {groups} AD groups to pick from' },
        ],
      },
      {
        label: 'Access reviews',
        fact: 'reviews',
        variants: [
          { needs: 'reviews', text: 'Access Reviews, which requires Governance Suite Premium, which requires Enterprise+' },
          { text: 'Not in your bundle. Your auditor has been informed.' },
        ],
      },
      {
        label: 'Directories',
        fact: 'directories',
        variants: [
          { needs: 'adagent', text: 'An AD Agent on a server nobody is allowed to patch' },
          { needs: 'ldap', text: 'LDAP (Legacy), for the one app from 2006' },
          { text: 'Whatever the Implementation Partner left behind' },
        ],
      },
      { label: 'Pricing', fact: 'pricing', variants: [{ text: '{annual}/yr, after {hiddenCount} fees revealed at checkout' }] },
    ],
    pricingLabel: 'See the public pricing page',
    // Sponsor-fact clauses containing these words are dropped: the captor is never named on this site.
    neverSay: ['Okta'],
  },

  cta: {
    kicker: 'Prescription',
    title: 'Replace the diagram with a box.',
    label: '',
    secondaryLabel: 'Get a demo',
  },
};
