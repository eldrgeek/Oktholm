// Brand content for "The Leaver" (Oktholm Syndrome / YeshID).
// Pure data only: no DOM access, no CSS imports. Read by the module as ctx.content.
//
// Tokens available in strings: {name} {Name} {possessive} {Possessive} {who} {Who} {exit} {loot} {team}
// {seconds} {known} {total} {day}, plus per-string extras noted inline ({app} {doing} {file} {count} ...).
// Sponsor claims are never written here: the module reads them from brand.sponsor.facts at runtime.
export default {
  title: 'The Leaver',
  blurb: 'Dave from Sales just rage-quit via reply-all. He has accounts in 30+ apps. You have 30 seconds.',
  emoji: '🚪',
  minutes: '1 min',
  therapy: 'Treats: Phantom Access Syndrome',

  seconds: 30,
  knownApps: 24,
  // Accounts whose OAuth token survives the first revoke (they light up once more).
  tokens: 8,
  penaltySeconds: 3,
  // Shadow IT arrives mid-shift, in waves (seconds into the round).
  shadowWaves: [
    { at: 7, count: 3 },
    { at: 13.5, count: 3 },
    { at: 20.5, count: 2 },
  ],

  // Today's leaver is picked once per UTC day, so everyone offboards the same person.
  // `twin` powers the "wrong person with the same name" trap tile.
  leavers: [
    {
      name: 'Dave', who: 'Dave from Sales', team: 'Sales', exit: 'just rage-quit via reply-all', loot: 'the customer list',
      twin: { label: 'Dave (Finance)', hit: 'Wrong Dave. Finance Dave was closing the quarter.' },
    },
    {
      name: 'Karen', who: 'Karen from Procurement', team: 'Procurement', exit: 'just resigned in a 40-slide deck', loot: 'every vendor contract',
      twin: { label: 'Karen (Legal)', hit: 'Wrong Karen. Legal Karen has already drafted a letter about it.' },
    },
    {
      name: 'the intern', who: 'the intern', team: 'Interns · summer cohort', exit: 'just finished their contract. They still have prod', loot: 'the production database',
      twin: { label: 'The new intern', hit: 'You offboarded the new intern on day one. Onboarding and offboarding in a single afternoon.' },
    },
    {
      name: 'Greg', who: 'Greg from Finance', team: 'Finance', exit: 'just retired after 31 years and one sheet cake', loot: 'the bank portal',
      twin: { label: 'Greg (Facilities)', hit: 'Wrong Greg. Facilities Greg can no longer open the building.' },
    },
    {
      name: 'Priya', who: 'Priya from Engineering', team: 'Engineering', exit: 'just posted “Excited to share…” before telling HR', loot: 'the monorepo',
      twin: { label: 'Priya (Design)', hit: 'Wrong Priya. Design Priya was presenting to the board.' },
    },
    {
      name: 'Brenda', who: 'Brenda from HR', team: 'People Ops', exit: 'just offboarded 200 people and forgot herself', loot: 'the salary spreadsheet',
      twin: { label: 'Brenda (Payroll)', hit: 'Wrong Brenda. Payroll Brenda was about to pay everyone.' },
    },
    {
      name: 'Marcus', who: 'Marcus from Growth', team: 'Growth', exit: 'just left for a stealth startup in the exact same market', loot: 'the pipeline',
      twin: { label: 'Marcus (Support)', hit: 'Wrong Marcus. Support Marcus had 40 tickets open.' },
    },
    {
      name: 'the contractor', who: 'the contractor', team: 'Contractors · SOW #2291', exit: 'hit the end of the SOW in March. Still commits to main', loot: 'the deploy keys',
      twin: { label: 'The other contractor', hit: 'Wrong contractor. That one was renewed. You have un-renewed them.' },
    },
    {
      name: 'the former CTO', who: 'the former CTO', team: 'Office of the CTO (former)', exit: 'just stepped back to an “advisory role” and kept root', loot: 'the cloud root account',
      twin: { label: 'The new CTO', hit: 'You revoked the new CTO on day three. Bold opening move.' },
    },
    {
      name: 'Tom', who: 'Tom from Marketing', team: 'Marketing', exit: 'just quit live on a webinar with 400 attendees', loot: 'the email list',
      twin: { label: 'Tom (Sales)', hit: 'Wrong Tom. Sales Tom was on a call with the biggest customer.' },
    },
  ],

  // The apps you know about. `doing` shows while the session is live, `keeps` fills the end-screen list.
  apps: [
    { name: 'SalesFarce', emoji: '☁️', doing: 'exporting contacts…', file: 'contacts_ALL.csv', keeps: 'SalesFarce, and with it the entire pipeline' },
    { name: 'Slacc', emoji: '💬', doing: 'drafting a farewell in #general…', file: 'dm_history.zip', keeps: 'a Slacc account still in #exec-private' },
    { name: 'Zoomba', emoji: '🎥', doing: 'recording the all-hands…', file: 'allhands.mp4', keeps: 'a Zoomba Pro plan billed until 2031' },
    { name: 'GitHug', emoji: '🫂', doing: 'force-pushing to main…', file: 'monorepo.tar.gz', keeps: 'owner rights on the GitHug org (the only owner)' },
    { name: 'Figmint', emoji: '🌿', doing: 'duplicating the design system…', file: 'design_system_v9.fig', keeps: 'the only Figmint seat with edit rights' },
    { name: 'Notionally', emoji: '📓', doing: 'publishing the wiki to the web…', file: 'wiki_export.html', keeps: 'the company wiki, now public to the internet' },
    { name: 'Jiraffe', emoji: '🦒', doing: 'closing every ticket as Won’t Fix…', file: 'backlog.csv', keeps: 'Jiraffe admin, and the workflow nobody understands' },
    { name: 'Dropblocks', emoji: '📦', doing: 'syncing /Finance to a personal laptop…', file: 'Finance_2019-2026.zip', keeps: 'a Dropblocks folder named “taking this”' },
    { name: 'Asanana', emoji: '🍌', doing: 'reassigning every task to you…', file: 'tasks.json', keeps: '412 Asanana tasks, all now assigned to you' },
    { name: 'Hubspotty', emoji: '🧲', doing: 'exporting the lead list…', file: 'leads_FINAL.xlsx', keeps: 'the Hubspotty lead list (90,000 contacts)' },
    { name: 'DocuSigh', emoji: '🖊️', doing: 'signing things on the company’s behalf…', file: 'contracts.pdf', keeps: 'a DocuSigh account that can still sign contracts' },
    { name: '2Password', emoji: '🔑', doing: 'exporting the shared vault…', file: 'vault_export.csv', keeps: 'the shared 2Password vault. All of it.' },
    { name: 'Worknight', emoji: '🌙', doing: 'approving a final PTO payout…', file: 'org_chart.pdf', keeps: 'expense approval in Worknight' },
    { name: 'Loomy', emoji: '🎬', doing: 'recording a 40-minute goodbye…', file: 'goodbye_FINAL.mp4', keeps: 'a 40-minute Loomy titled “what really happened”' },
    { name: 'Calendlier', emoji: '📅', doing: 'booking the boardroom until 2031…', file: 'calendar.ics', keeps: 'the boardroom, booked every Friday until 2031' },
    { name: 'Zendesque', emoji: '🎧', doing: 'replying “not my problem anymore”…', file: 'tickets.csv', keeps: 'a Zendesque seat that still answers customers' },
    { name: 'Trellow', emoji: '📋', doing: 'archiving the roadmap…', file: 'roadmap.json', keeps: 'the only copy of the roadmap, in Trellow' },
    { name: 'Boxxy', emoji: '🗃️', doing: 'sharing /Legal via public link…', file: 'Legal.zip', keeps: 'a public Boxxy link to /Legal' },
    { name: 'Miroh', emoji: '🟨', doing: 'erasing the offsite whiteboards…', file: 'offsite_2024.pdf', keeps: 'every Miroh board from every offsite' },
    { name: 'Adobo', emoji: '🎨', doing: 'hoarding 14 licenses…', file: 'brand_assets.zip', keeps: '14 Adobo licenses, all assigned to {name}' },
    { name: 'Expensivify', emoji: '🧾', doing: 'filing one last “team dinner”…', file: 'receipts.zip', keeps: 'a pending $3,400 “team dinner” in Expensivify' },
    { name: 'Lattiss', emoji: '🌱', doing: 'writing a self-review: “exceeds”…', file: 'reviews_2026.pdf', keeps: 'Lattiss, where {name} is still your manager' },
    { name: 'DataDogg', emoji: '🐕', doing: 'rerouting every alert to a personal phone…', file: 'dashboards.json', keeps: 'DataDogg, where every alert still pages {name}' },
    { name: 'PagerDude', emoji: '📟', doing: 'making you primary on-call, forever…', file: 'oncall.csv', keeps: 'PagerDude, where {name} is still the escalation policy' },
    { name: 'QuickerBooks', emoji: '📒', doing: 'exporting the general ledger…', file: 'ledger_2026.qbo', keeps: 'admin on the general ledger in QuickerBooks' },
    { name: 'Canvah', emoji: '🖼️', doing: 'rebranding the company…', file: 'brand_kit.zip', keeps: 'the brand kit in Canvah, logo included' },
  ],

  // Shadow IT: not on the board until it slides in mid-shift. `always` items appear every day.
  shadow: [
    { name: 'Office speakers', emoji: '🔊', detail: 'paired to {possessive} phone', doing: 'queuing “Take This Job and Shove It”…', file: 'playlist.m3u', keeps: 'the office speakers', always: true },
    { name: 'Side Hustle LLC', emoji: '🗒️', detail: 'a Notionally workspace on your SSO', doing: 'onboarding side-hustle clients…', file: 'clients.csv', keeps: 'a Notionally workspace for {possessive} side hustle' },
    { name: 'Mailchump', emoji: '📨', detail: 'on the corporate card', doing: 'emailing all 40,000 customers…', file: 'subscribers.csv', keeps: 'a Mailchump account on the corporate card' },
    { name: 'Otterly AI', emoji: '🤖', detail: 'a notetaker in every meeting', doing: 'joining the board meeting…', file: 'board_transcript.txt', keeps: 'an AI notetaker that still joins the board meeting' },
    { name: 'Brand social', emoji: '📣', detail: 'password: Summer2019!', doing: 'drafting a thread…', file: 'drafts.txt', keeps: 'the corporate social account (password: Summer2019!)' },
    { name: 'Company domain', emoji: '🌐', detail: 'registered to {possessive} personal email', doing: 'turning off auto-renew…', file: 'dns_zone.txt', keeps: 'the company domain, registered to {possessive} personal email' },
    { name: 'Zappier', emoji: '⚡', detail: '212 zaps nobody documented', doing: 'forwarding invoices to a personal inbox…', file: 'invoices.pdf', keeps: '212 undocumented Zappier zaps' },
    { name: 'Airtabble', emoji: '📊', detail: 'secretly the real CRM', doing: 'deleting the real CRM…', file: 'real_crm.csv', keeps: 'an Airtabble base that is secretly the real CRM' },
    { name: 'Office printer', emoji: '🖨️', detail: 'login: admin / admin', doing: 'printing 400 copies of the resignation…', file: 'print_queue.ps', keeps: 'the office printer admin panel (admin/admin)' },
    { name: 'The 2FA phone', emoji: '📱', detail: 'in {possessive} desk drawer', doing: 'receiving the bank’s 2FA codes…', file: 'sms_backup.db', keeps: 'the only phone that gets the bank’s 2FA codes' },
    { name: 'ChatBotly', emoji: '🧠', detail: 'team plan, full of pasted data', doing: 'pasting the roadmap into a chatbot…', file: 'chat_history.json', keeps: 'a chatbot workspace full of pasted customer data' },
    { name: 'Discordant', emoji: '🎮', detail: 'the unofficial eng server', doing: 'posting in the unofficial eng server…', file: 'server_backup.zip', keeps: 'ownership of the unofficial Discordant server' },
  ],

  // Trap tiles: flash amber for a moment. Revoking one costs time.
  // { twin: true } pulls its label and message from today's leaver.
  traps: [
    { emoji: '👔', label: 'The CEO', note: 'Wrong human', hit: 'You logged the CEO out mid-board-meeting. A “quick chat” has appeared on your calendar.' },
    { emoji: '💸', label: 'Payroll run', note: 'In progress', hit: 'You killed the payroll run. 212 people now know your name.' },
    { emoji: '🧯', label: 'Break-glass admin', note: 'Emergency only', hit: 'You revoked break-glass. In an emergency, there is now no glass.' },
    { emoji: '🕵️', label: 'The auditor', note: 'Mid-audit', hit: 'You revoked the auditor’s access. That is a finding.' },
    { emoji: '🔁', label: 'SCIM service acct', note: 'Load-bearing', hit: 'You revoked the service account. Nine integrations died quietly. You will find out Tuesday.' },
    { emoji: '🧑‍💼', twin: true, note: 'Not that one' },
  ],

  copy: {
    kicker: 'Incident {day} · Offboarding · Severity: critical',
    briefing: '{Who} {exit}.',
    stakes: '{Name} has accounts in 30+ apps. You know about {known} of them. You have {seconds} seconds before {name} downloads {loot}.',
    rules: [
      ['🟥', 'Tap a tile while it’s red to revoke it. You can’t kill a session you can’t see.'],
      ['🔑', 'Some come back. Killing the session doesn’t kill the OAuth token.'],
      ['⚠️', 'Leave amber tiles alone. That’s the CEO, or payroll, or somebody else entirely.'],
      ['🔍', 'Shadow IT appears mid-shift. It always does. The exfiltration meter fills while anything is red.'],
    ],
    start: 'Start offboarding',
    badgeOrg: 'Employee · Access: everything',
    badgeStamp: 'Leaver',
    dailyNote: 'Today’s leaver changes at midnight UTC. Everyone gets the same one.',
    ticket: 'Ticket {day} · Terminate access: {who}',
    countdown: ['3', '2', '1', 'Revoke!'],
    idle: 'Idle',
    active: 'Active',
    revoked: 'Revoked',
    exported: 'Exported',
    hidden: 'Unscanned',
    token: 'Token live',
    tokenTag: 'Token',
    tokenDoing: 'refreshing an OAuth token…',
    tokenPop: 'Token!',
    shadowTag: 'Shadow IT',
    trapTag: 'Do not revoke',
    fast: 'Fast',
    combo: 'Combo ×{n}',
    trapPenalty: '−{s}s',
    timeLabel: 'Time',
    revokedLabel: 'Revoked',
    streakLabel: 'Streak',
    exfilLabel: 'Exfiltration: {loot}',
    feedStart: 'Ticket opened. {Who} is still logged in everywhere. Watch for red.',
    feedActive: '{app}: {doing}',
    feedRevoke: '{app}: account disabled, sessions killed.',
    feedToken: '{app}: session killed. The OAuth token is still valid. It will be back.',
    feedExport: '{app}: export complete ({file}).',
    feedShadow: 'Shadow IT detected: {count} apps nobody approved. {Name} has accounts in all of them.',
  },

  results: {
    kicker: 'Offboarding report · {day}',
    clear: { stamp: 'Offboarded', title: 'Clean break.', sub: 'Every account revoked in {time}s. {Name} now has exactly the access {name} deserves: none.' },
    time: { stamp: 'Time', title: 'Time’s up.', sub: '{revoked} of {total} accounts revoked. The rest are still very much logged in.' },
    exfil: { stamp: 'Exfiltrated', title: '{Name} has left the building.', sub: 'With the building. And {loot}.' },
    statRevoked: 'Revoked',
    statTime: 'Time',
    statStreak: 'Best streak',
    statExfil: 'Exfiltrated',
    controlsTitle: '{Name} still controls:',
    controlsNone: 'Nothing. Not one login. Print this and put it on the fridge.',
    unrevealed: '…and {count} apps nobody knew about, which {name} will keep forever',
    more: '…and {count} more',
    viaToken: '{keeps}, via an OAuth token nobody revoked',
    collateral: 'Collateral damage',
    best: 'Personal best: {revoked}/{total} in {time}s',
    newBest: 'New personal best.',
    replay: 'Offboard again',
    shareTitle: 'Challenge a coworker',
  },

  share: {
    clear: 'I offboarded all {total} of {possessive} accounts in {time}s on The Leaver. {Name} controls nothing. Not even {thing}. Beat me:',
    time: 'I offboarded {revoked}/{total} of {possessive} accounts in {time}s on The Leaver. {Name} still controls {thing}. Beat me:',
    exfil: '{Name} left the building (with the building) after {time}s on The Leaver. I revoked {revoked}/{total} accounts first. Beat me:',
  },

  // {lifecycle} and {shadow} are replaced with brand.sponsor.facts at runtime.
  cta: {
    kicker: 'Second opinion',
    title: 'YeshID offboarding: one workflow',
    body: 'You just revoked {revoked} accounts by hand while {name} was typing. {lifecycle} {shadow}',
  },
};
