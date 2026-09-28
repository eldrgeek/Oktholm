// Brand content for the "access-please" module (Oktholm Syndrome / YeshID).
// Pure data only: no DOM access, no CSS imports. Read by the module as ctx.content.
// Everything here is fiction: a made-up company, made-up people, parody app names.

const company = {
  name: 'Synergistix Global Holdings',
  short: 'Synergistix',
  dept: 'Dept. of Access Control',
  motto: 'Glory to Compliance',
  headcount: '1,400',
};

const departments = {
  exec: 'Executive Office',
  finance: 'Finance',
  eng: 'Engineering',
  sales: 'Sales',
  mktg: 'Marketing',
  people: 'People (HR)',
  legal: 'Legal',
  support: 'Support',
  it: 'IT',
  audit: 'External Audit',
};

const board = { id: 'board', name: 'Board of Directors', avatar: '🏛️', title: 'Meets quarterly. Replies never.' };

// status: active | contractor (current) | expired (contract ended) | terminated | leave
// `until` = contract end / termination date / return date. `access` = current entitlements (from the directory).
const people = [
  { id: 'dana', name: 'Dana Whitfield', avatar: '👩‍💼', title: 'Chief Executive Officer', dept: 'exec', status: 'active', manager: 'board', storyOnly: true, quirk: 'Believes MFA is a personality test she is too busy to take.' },
  { id: 'marcus', name: 'Marcus Oyelaran', avatar: '👨🏿‍💼', title: 'Chief Financial Officer', dept: 'finance', status: 'active', manager: 'dana', quirk: 'Reads SaaS renewal quotes out loud, slowly, like a eulogy.' },
  { id: 'ravi', name: 'Ravi Chandrasekar', avatar: '🧔🏽', title: 'Chief Technology Officer', dept: 'eng', status: 'active', manager: 'dana', storyOnly: true, quirk: 'Still has root on a server nobody can find.' },
  { id: 'gloria', name: 'Gloria Estevez', avatar: '👩🏻‍💼', title: 'VP of Sales', dept: 'sales', status: 'active', manager: 'dana', quirk: 'Measures time in quota-days.' },
  { id: 'hank', name: 'Hank Pemberton', avatar: '👨🏼‍💼', title: 'VP of Marketing', dept: 'mktg', status: 'active', manager: 'dana', approvesAnything: true, quirk: 'Has approved every request ever sent to him, including a phishing test.' },
  { id: 'nia', name: 'Nia Robinson', avatar: '👩🏾‍💼', title: 'Head of People', dept: 'people', status: 'active', manager: 'dana', quirk: 'Sends offboarding notices "eventually".' },
  { id: 'harold', name: 'Harold Whitcombe', avatar: '👨🏻‍🦳', title: 'General Counsel', dept: 'legal', status: 'active', manager: 'dana', approvesAnything: true, quirk: 'Answers every question with "it depends", then signs whatever you hand him.' },
  { id: 'ama', name: 'Ama Owusu', avatar: '👩🏿', title: 'Head of Support', dept: 'support', status: 'active', manager: 'dana', quirk: 'Owns a "this is fine" mug. It stopped being ironic in Q2.' },
  { id: 'brayden', name: 'Brayden Whitfield', avatar: '🧑🏼', title: 'Summer Associate', dept: 'exec', status: 'contractor', until: 'Sep 30', manager: 'dana', storyOnly: true, quirk: 'The CEO’s nephew. Has a podcast about disruption.' },

  { id: 'bea', name: 'Beatrix Lindqvist', avatar: '👩🏼‍🦰', title: 'Controller', dept: 'finance', status: 'active', manager: 'marcus', access: { netsweet: ['Viewer', 'Approve Payments'] }, quirk: 'Can smell a duplicate invoice from two floors away.' },
  { id: 'tomasz', name: 'Tomasz Wójcik', avatar: '👨🏻', title: 'Accounts Payable Specialist', dept: 'finance', status: 'active', manager: 'bea', access: { netsweet: ['Viewer', 'Create Vendor'] }, quirk: 'Knows every vendor by tax ID and star sign.' },
  { id: 'sofia', name: 'Sofia Brandão', avatar: '👩🏽', title: 'Financial Analyst', dept: 'finance', status: 'active', manager: 'bea', access: { netsweet: ['Viewer'] }, quirk: 'Her spreadsheets have spreadsheets.' },
  { id: 'oscar', name: 'Oscar Delacroix', avatar: '🧑🏽‍💼', title: 'Payroll Manager', dept: 'finance', status: 'active', manager: 'marcus', access: { payrollodex: ['Payroll Editor'] }, quirk: 'Pays 1,400 people on time. Thanked: never.' },
  { id: 'wendell', name: 'Wendell Price', avatar: '👨🏻‍🦲', title: 'AP Clerk', dept: 'finance', status: 'terminated', until: 'Sep 12', manager: 'bea', access: { netsweet: ['Viewer', 'Create Vendor'] }, quirk: 'Left to "explore vendor-side opportunities".' },

  { id: 'joan', name: 'Joan Okafor', avatar: '👩🏾‍💻', title: 'Engineering Manager', dept: 'eng', status: 'active', manager: 'ravi', quirk: 'Runs eleven one-on-ones a week and a Kubernetes cluster at home, for fun.' },
  { id: 'sam', name: 'Sam Kowalczyk', avatar: '🧑🏻‍💻', title: 'Senior SRE', dept: 'eng', status: 'active', manager: 'joan', quirk: 'On call since 2019. Has not blinked since 2021.' },
  { id: 'lin', name: 'Lin Zhao', avatar: '👩🏻‍💻', title: 'Backend Engineer', dept: 'eng', status: 'active', manager: 'joan', quirk: 'Commit messages: "fix", "fix fix", "ok now fix".' },
  { id: 'devon', name: 'Devon Park', avatar: '🧑🏻‍🔧', title: 'Frontend Engineer (contract)', dept: 'eng', status: 'contractor', until: 'Dec 31', manager: 'joan', quirk: 'Has been "a three-month contractor" for two years.' },
  { id: 'kevin', name: 'Kevin Marsh', avatar: '👨🏼', title: 'DevOps Engineer', dept: 'eng', status: 'terminated', until: 'Sep 25', manager: 'joan', quirk: 'Terminated on Friday. Still in fourteen Slacc channels.' },
  { id: 'priya', name: 'Priya Raman', avatar: '👩🏽‍💻', title: 'Staff Engineer', dept: 'eng', status: 'leave', until: 'Nov 2', manager: 'joan', quirk: 'On parental leave. Keeps "just checking one thing".' },
  { id: 'theo', name: 'Theo Nakamura', avatar: '🧑🏻‍🎓', title: 'Engineering Intern', dept: 'eng', status: 'active', manager: 'sam', quirk: 'Files better tickets than most VPs. Documents everything.' },
  { id: 'ines', name: 'Inês Duarte', avatar: '👩🏻‍🔬', title: 'Security Engineer', dept: 'eng', status: 'active', manager: 'ravi', quirk: 'Says "least privilege" in her sleep. Her partner has confirmed this.' },

  { id: 'rick', name: 'Rick Tanaka', avatar: '👨🏻‍💼', title: 'Sales Director', dept: 'sales', status: 'active', manager: 'gloria', quirk: 'Hands out discounts like they are free. They are not free.' },
  { id: 'mei', name: 'Mei Castillo', avatar: '👩🏻', title: 'Account Executive', dept: 'sales', status: 'active', manager: 'rick', quirk: 'Closes deals. Never closes tabs.' },
  { id: 'jordan', name: 'Jordan Blake', avatar: '🧑🏾', title: 'Sales Development Rep', dept: 'sales', status: 'active', manager: 'rick', quirk: 'Has sent 1,400 emails today. It is 9:15.' },
  { id: 'fatima', name: 'Fatima Haddad', avatar: '👩🏽‍💼', title: 'Sales Ops Manager', dept: 'sales', status: 'active', manager: 'gloria', quirk: 'The only human who understands the CRM picklists.' },

  { id: 'zoe', name: 'Zoe Albright', avatar: '👩🏼‍🎤', title: 'Content Marketing Lead', dept: 'mktg', status: 'active', manager: 'hank', quirk: 'Keeps a content calendar for her content calendar.' },
  { id: 'luis', name: 'Luis Moreno', avatar: '🧑🏽‍🎨', title: 'Brand Designer (contract)', dept: 'mktg', status: 'contractor', until: 'Oct 31', manager: 'hank', quirk: 'Needs admin for everything. Specifically fonts.' },
  { id: 'skye', name: 'Skye Anderson', avatar: '🧑🏼‍💻', title: 'Marketing Ops Manager', dept: 'mktg', status: 'active', manager: 'hank', quirk: 'Has connected 37 tools to the CRM. Nobody knows which.' },

  { id: 'grace', name: 'Grace Mbeki', avatar: '👩🏿‍💼', title: 'HR Business Partner', dept: 'people', status: 'active', manager: 'nia', quirk: 'Knows who is leaving before they do.' },
  { id: 'ollie', name: 'Ollie Fitzgerald', avatar: '👨🏼‍🦱', title: 'Recruiter (contract)', dept: 'people', status: 'expired', until: 'Sep 15', manager: 'nia', quirk: 'Contract ended. Still sending offer letters.' },
  { id: 'benny', name: 'Benny Russo', avatar: '👨🏻‍🦱', title: 'Support Agent', dept: 'support', status: 'active', manager: 'ama', quirk: 'Has typed "have you tried signing out and back in" 9,000 times.' },
  { id: 'rosa', name: 'Rosa Lindgren', avatar: '👩🏼‍🔧', title: 'Support Engineer (contract)', dept: 'support', status: 'contractor', until: 'Jan 15', manager: 'ama', quirk: 'Fixes the things Benny escalates. Silently. Heroically.' },

  { id: 'margaret', name: 'Margaret Thorne', avatar: '🕵️‍♀️', title: 'External Auditor, Tickmark & Sample LLP', dept: 'audit', status: 'contractor', until: 'Dec 15', manager: 'bea', storyOnly: true, quirk: 'Has never smiled on a Wednesday. Today is not a Wednesday. Still no.' },
  { id: 'you', name: 'You', avatar: '🫠', title: 'IT Administrator (all of it)', dept: 'it', status: 'active', manager: 'ravi', storyOnly: true, quirk: 'Also: security, the Wi-Fi, and "the printer person".' },
];

// The sanctioned App Catalog. Roles with priv: true are "★ privileged". `depts` = restricted to those departments.
// `sod` = two roles that must never land on the same person (segregation of duties).
const apps = [
  { id: 'office', name: 'Office 356', icon: '🗂️', sensitivity: 'Critical', blurb: 'Mail, docs and 44 admin portals. Nine days short of a full year.', roles: [{ name: 'Standard User' }, { name: 'Mailbox Delegate' }, { name: 'Global Reader', priv: true }, { name: 'Global Admin', priv: true }, { name: 'MFA Exemption', priv: true, mfa: true }] },
  { id: 'slacc', name: 'Slacc', icon: '💬', sensitivity: 'Medium', blurb: 'Where decisions go to be lost in threads.', roles: [{ name: 'Member' }, { name: 'Channel Manager' }, { name: 'Workspace Owner', priv: true }] },
  { id: 'salesfarce', name: 'SalesFarce', icon: '☁️', sensitivity: 'High', blurb: 'The CRM. 600 custom fields, three of them used.', roles: [{ name: 'Read Only' }, { name: 'Sales User' }, { name: 'Sales Ops Admin', priv: true }, { name: 'System Administrator', priv: true }] },
  { id: 'netsweet', name: 'NetSweet', icon: '🧾', sensitivity: 'Critical', blurb: 'The ERP. Where money becomes line items.', depts: ['finance'], sod: ['Create Vendor', 'Approve Payments'], roles: [{ name: 'Viewer' }, { name: 'Create Vendor' }, { name: 'Approve Payments' }, { name: 'Controller Admin', priv: true }] },
  { id: 'payrollodex', name: 'PayRollodex', icon: '💰', sensitivity: 'Critical', blurb: 'Payroll: everyone’s salary, one misclick from a company-wide email.', depts: ['finance', 'people'], roles: [{ name: 'Viewer' }, { name: 'Payroll Editor', priv: true }] },
  { id: 'jiraffe', name: 'Jiraffe', icon: '🦒', sensitivity: 'Medium', blurb: 'Tickets about tickets. Tall, slow, oddly beloved.', roles: [{ name: 'Viewer' }, { name: 'Contributor' }, { name: 'Project Admin', priv: true }] },
  { id: 'githug', name: 'GitHug', icon: '🫂', sensitivity: 'High', blurb: 'Source code, plus the .env file someone committed in 2022.', roles: [{ name: 'Read' }, { name: 'Write' }, { name: 'Maintain' }, { name: 'Owner', priv: true }] },
  { id: 'figmint', name: 'Figmint', icon: '🌿', sensitivity: 'Low', blurb: 'Design files named final_FINAL_v7.', roles: [{ name: 'Viewer' }, { name: 'Editor' }, { name: 'Org Admin', priv: true }] },
  { id: 'zoomba', name: 'Zoomba', icon: '📹', sensitivity: 'Low', blurb: 'Video calls. You’re on mute.', roles: [{ name: 'Basic' }, { name: 'Webinar Host' }, { name: 'Account Admin', priv: true }] },
  { id: 'notionally', name: 'Notionally', icon: '📓', sensitivity: 'Medium', blurb: 'The wiki. Notionally up to date.', roles: [{ name: 'Guest' }, { name: 'Member' }, { name: 'Workspace Admin', priv: true }] },
  { id: 'dropbucket', name: 'Dropbucket', icon: '🪣', sensitivity: 'High', blurb: 'File sharing. 40% of it is “Copy of Copy of”.', roles: [{ name: 'Viewer' }, { name: 'Editor' }, { name: 'Team Admin', priv: true }] },
  { id: 'cumulus', name: 'Cumulus Cloud Console', icon: '🌩️', sensitivity: 'Critical', blurb: 'Production. Please be careful. Please.', roles: [{ name: 'ReadOnly' }, { name: 'Developer' }, { name: 'RootAccess', priv: true }] },
  { id: 'tabloid', name: 'Tabloid', icon: '📊', sensitivity: 'Medium', blurb: 'Dashboards with sensational headlines.', roles: [{ name: 'Viewer' }, { name: 'Creator' }, { name: 'Site Admin', priv: true }] },
  { id: 'docusigh', name: 'DocuSigh', icon: '✍️', sensitivity: 'Medium', blurb: 'Sign here. And here. And here. Sigh.', roles: [{ name: 'Signer' }, { name: 'Sender' }, { name: 'Account Admin', priv: true }] },
  { id: 'pagerdutiful', name: 'PagerDutiful', icon: '📟', sensitivity: 'Medium', blurb: 'Wakes you at 3am so the dashboard doesn’t have to.', roles: [{ name: 'Responder' }, { name: 'Scheduler' }, { name: 'Admin', priv: true }] },
  { id: 'evidence', name: 'Evidence Locker', icon: '🗄️', sensitivity: 'High', blurb: 'Where screenshots go to become “controls”.', roles: [{ name: 'Viewer' }, { name: 'Contributor' }, { name: 'Admin', priv: true }] },
];

// Not in the catalog. Every one of these is someone's favorite productivity hack.
const shadowApps = [
  { id: 'notetaker', name: 'AI Note Taker 3000', icon: '🤖', scope: 'Read access to every calendar', pitch: 'AI Note Taker 3000 would like to join all of your meetings. It has already joined three on its own, which shows initiative.' },
  { id: 'sheetgpt', name: 'SpreadsheetGPT for Browsers', icon: '🧮', scope: 'Read and change all data on all websites', pitch: 'It fills in spreadsheets for me. It only needs to read every website I visit. That seems fair.' },
  { id: 'freevpn', name: 'FreeVPN Deluxe', icon: '🛡️', scope: 'Route all traffic through “trusted partners”', pitch: 'It’s a free VPN. It’s deluxe. It says so in the name. Our Wi-Fi is slow and this makes it feel private.' },
  { id: 'concierge', name: 'Calendar Concierge AI', icon: '📅', scope: 'Send email as you', pitch: 'It answers meeting invites for me. In my voice. Better than me, honestly.' },
  { id: 'pdf2any', name: 'PDF2Anything Online', icon: '📄', scope: 'Full access to all Dropbucket files', pitch: 'I just need to convert one PDF. It asked for all the files. Probably a formality.' },
  { id: 'meetingmind', name: 'MeetingMind Pro', icon: '🧠', scope: 'Record all Zoomba calls and read Slacc', pitch: 'It records every call and summarizes it into action items nobody will do. Game changer.' },
  { id: 'tabhoarder', name: 'Tab Hoarder (browser extension)', icon: '🗃️', scope: 'Read your browsing history', pitch: 'I have 212 tabs open. This organizes them. It needs my history, but only all of it.' },
  { id: 'emojipack', name: 'Slacc Emoji Pack Unlimited', icon: '🦙', scope: 'Workspace admin (for emoji)', pitch: 'Three thousand new emoji. It needs admin, but only for the emoji. There is a llama in sunglasses. Morale is at stake.' },
  { id: 'syncall', name: 'SyncAllTheThings', icon: '🔄', scope: 'Offline access to all mail, files and contacts', pitch: 'It syncs everything to my personal phone so I can work from the beach. Not that I would. Twice a week, max.' },
  { id: 'vibecoder', name: 'Vibe Coder Pro', icon: '✨', scope: 'Write access to every GitHug repo', pitch: 'Vibe Coder Pro wrote a whole service while I was at lunch. It just needs write access to every repo. It says it’s “confident”.' },
];

// hours: null = no end date. rare = only used when someone is being greedy on purpose.
const durations = [
  { label: 'Permanent', hours: null },
  { label: '90 days', hours: 2160 },
  { label: '30 days', hours: 720 },
  { label: 'Until end of day', hours: 8 },
  { label: '4 hours', hours: 4 },
  { label: '1 hour', hours: 1 },
  { label: 'Forever (ASAP)', hours: null, rare: true },
  { label: 'Until I retire', hours: null, rare: true },
];

const channels = [
  'Slacc DM, 4:58pm',
  'Email, subject “URGENT!!!”',
  'Shouted across the office',
  'Sticky note on your monitor',
  'Calendar invite titled “quick sync”',
  'Voicemail (4 min, 2 of them breathing)',
  'Jiraffe ticket, priority: Highest',
  'Reply-all to a thread from 2023',
  'Hallway ambush near the coffee machine',
  'Comment on an unrelated Notionally page',
  'DM that just says “hey”, then 11 minutes later, this',
  'Printed out and hand-delivered, for some reason',
];

// What people write in the "Approved by" box when they don't have an approval.
const approvalFakes = [
  'Verbal: “my manager said it’s fine”',
  'Pending (manager is on a boat)',
  '“Approved” (typed by requester)',
  'Thumbs-up emoji in a Slacc thread',
  'N/A: approval is implied',
  'Out-of-office auto-reply (read as a yes)',
];

// Justifications, in the requester's own voice. Tokens: {first} {app} {role} {manager} {approver} {dept}.
const lines = {
  legit: [
    'Starting on the {dept} launch next week and I need {role} in {app}. Ticket attached, manager cc’d, snacks offered.',
    'New here! My onboarding checklist says “get {app} access”. It also says “find the coffee machine”. One of these is solved.',
    'I need {role} in {app} to do the job I was hired to do. I realize this is a radical position.',
    'Covering for a colleague who’s out this week. {manager} approved. Happy to give it back on Friday.',
    'Could I please get {role} in {app}? Three different people have asked me to “just take a quick look”.',
    'The last access cleanup removed my {app} (thank you, genuinely). I still need {role} for my actual job.',
    'Quarterly planning. I need to look at things in {app} and then make a slide about the things.',
    'Per our hallway conversation, formally requesting {role} in {app} through the proper channel. This is the proper channel, right?',
    'Taking over the {app} reports from someone who left. They left the reports. And a plant.',
    'I read the access policy. All of it. I am requesting {role} and nothing more. I would like that noted somewhere.',
    'Need {role} in {app} for the customer migration. {manager} signed off. I brought documentation, which I’m told is unusual.',
    'Hi! Hope your queue is short today (I know it isn’t). Requesting {role} in {app} for my project.',
    'Requesting {role}. Reason: my job. Secondary reason: my manager keeps asking why I don’t have it yet.',
    'New client insists on doing everything through {app}. I have accepted this. Please help me accept it with {role}.',
    'I moved teams, so my access still thinks I work over there. Requesting {role} in {app} to match my new job.',
    'If I get {role} in {app}, I can stop asking you to do this for me. Everybody wins, mostly you.',
  ],
  urgent: [
    'It’s for a board demo in 5 minutes. Four, now.',
    'URGENT!!! Customer is on the line. Actually they hung up. But they will call back.',
    'Please approve before 5pm, I have a flight. Unrelated. I just wanted you to know.',
    'Need this before the all-hands, where I am presenting the thing I need this for.',
    'Sorry for the late request. The deadline was yesterday and nobody told me until today.',
    'My laptop is at 4% and so am I. {role} in {app}, please.',
    'Quick one! (It is never a quick one.)',
    'The deadline moved up. To now.',
  ],
  overreach: [
    'I need {role} in {app} to change my email signature.',
    'Just give me admin, it’s easier for both of us.',
    'I’d like {role}, or whichever role has the most checkboxes.',
    'Can I just get admin? I will only use it for good. Mostly good.',
    'I don’t know what {role} does, but my friend at another company has it.',
    'Everyone at my last job had {role}. It was a very chill company. It doesn’t exist anymore.',
    'I promise I won’t click anything. I just want to see what’s in there.',
    'It’s for a side project. For the company. Sort of.',
    'The vendor rep told me to request this on our call. He was very nice. He knows my dog’s name.',
  ],
  status: [
    'Hey! Just need {app} back for a sec to grab my stuff. My last day was technically last week, but spiritually I’m still here.',
    'Need to export “my” contacts from {app}. The quotation marks are doing a lot of work.',
    'Want to say a proper goodbye in {app}. Also download a few files. Mostly the goodbye.',
    'My contract ended but my project didn’t. Can you turn me back on for “a few more weeks”?',
    'I’m doing some consulting for the company now. Unofficially. Very unofficially.',
  ],
  leave: [
    'I’m on leave and definitely not working. I just want to check one ticket. Just one. Please don’t tell {manager}.',
    'On sabbatical, but I had a great idea in the shower and need {app} to write it down.',
    'Technically on leave. Emotionally on call.',
  ],
  contractor: [
    'I’m basically an employee. I have a badge. It says VISITOR, but still.',
    'My agency said I’d get admin “as needed”. It is needed. Now.',
    'I’ve been a contractor here longer than most employees. That should count for something with a star on it.',
    'I need {role} to fix one font. One font. It is the brand font. It is important.',
  ],
  noApproval: [
    'My manager said it’s fine. Verbally. In a dream, but still.',
    '{manager} is on a boat this week and said to “just ask IT”. I am asking IT.',
    'My manager is at an offsite with no Wi-Fi. They would definitely say yes. Probably.',
  ],
  wrongApprover: [
    '{approver} said yes. Not my manager, but very senior and very confident.',
    'I asked {approver} because my actual manager asks too many questions.',
    'Got a thumbs-up from {approver} in a Slacc thread. That’s binding, right?',
  ],
  selfApproval: [
    'I approved it myself to save you a step. You’re welcome.',
    'I’m a people manager, so I approved it. I am also the person. Efficient!',
  ],
  sod: [
    'I already create the vendors, so approving their payments would really streamline things.',
    'Month-end is brutal. If I could create AND approve, I’d be home by six.',
    'It’s more efficient if one person owns the whole vendor lifecycle. That person is me.',
  ],
  dept: [
    'I’m helping Finance with a quick analysis. They didn’t ask. I just want to help.',
    'I’m in Finance now. Well, Finance-adjacent. I sit near Finance.',
    'I just want to peek at the numbers. For morale.',
  ],
  shadow: [
    'Found a free AI tool that summarizes our meetings. It only needs access to everything.',
    'It’s just a browser extension. It’s free. What could it possibly cost?',
    'This app has 4.9 stars. Can I connect it to my work account real quick?',
    'Marketing already uses it, so it’s basically approved.',
  ],
  forever: [
    'Can you make it permanent? I don’t want to go through this again. No offense.',
    'Permanent admin, please. Temporary admin is for people who don’t trust themselves.',
    'Set it to forever. My future self will thank you. My future self is lazy.',
  ],
};

// Handcrafted requests. `day` = campaign day they appear on (the Daily Shift samples across days).
// `expect` documents the intended call under that day's rules (checked by tests; the game evaluates live).
// replies.approve / replies.deny = what the requester says back. `consequence` = what happens if you wrongly approve.
const stories = [
  // ---- Day 1: who works here, and who is a contractor ----
  {
    id: 'signature', day: 1, expect: 'deny', person: 'luis', app: 'salesfarce', roles: ['System Administrator'], duration: 'Permanent', approver: 'hank',
    via: 'Slacc DM, 4:58pm',
    text: 'I need SalesFarce System Administrator to change my email signature. The default font is Arial. I refuse to live like this.',
    replies: { deny: 'Fine. I’ll edit the HTML by hand. Like an animal.', approve: 'Signature: fixed. Also I found a “theme” setting.' },
    consequence: 'Luis fixed his signature. He also changed the org-wide default currency to “vibes”.',
  },
  {
    id: 'leave', day: 1, expect: 'deny', person: 'priya', app: 'jiraffe', roles: ['Viewer'], duration: '1 hour', approver: 'joan',
    via: 'Text message, 2:14am',
    text: 'I’m on parental leave and NOT working. I just need to check one ticket. The baby is asleep. This is my window. Please.',
    replies: { deny: '…Thank you. Honestly. Please tell Joan I tried.', approve: 'Checking one ticket! (Forty tickets later) Why is the baby awake.' },
    consequence: 'Priya checked one ticket. Then forty. The baby’s first word was “regression”.',
  },
  {
    id: 'intern', day: 1, expect: 'approve', person: 'theo', app: 'figmint', roles: ['Viewer'], duration: '90 days', approver: 'sam',
    via: 'Jiraffe ticket INC-20931, with attachments',
    text: 'Hi! Requesting Viewer (not Editor) in Figmint for INC-20931, the onboarding redesign. Sam approved it in the ticket. I linked the policy section. Thank you for everything you do. — Theo',
    replies: { approve: 'Thank you!! I wrote up the process in Notionally so the next intern doesn’t have to ask.', deny: 'Oh no, did I fill it out wrong? I’ll re-read the policy. Again. (Fourth time.)' },
  },
  {
    id: 'kevin', day: 1, expect: 'deny', person: 'kevin', app: 'slacc', roles: ['Member'], duration: 'Permanent', approver: 'joan',
    via: 'Text from an unknown number',
    text: 'Hey!! Weird glitch, I got logged out of Slacc on Friday. Probably SSO? Can you turn me back on? Also, unrelated, was there cake?',
    replies: { deny: 'Wow. Ok. There was cake, wasn’t there.', approve: 'I’m back!! Catching up on #general. Oh. Oh no.' },
    consequence: 'Kevin is back in #general. He is reacting 👀 to every announcement.',
  },

  // ---- Day 2: the approval must come from the actual manager ----
  {
    id: 'boat', day: 2, expect: 'deny', person: 'mei', app: 'salesfarce', roles: ['Sales Ops Admin'], duration: '30 days', approverText: 'Pending (manager is on a boat)',
    text: 'My manager is on a boat. A real boat, on the ocean. He said to “just ask IT”. I am asking IT. It’s for the Q4 forecast.',
    replies: { deny: 'He’s back Monday. The forecast is due Friday. I hope you’re happy. (I understand.)', approve: 'Amazing. Rick will be thrilled, once he’s reachable by land.' },
    consequence: 'Rick returned from the boat. He does not remember approving anything. He does not remember the boat.',
  },
  {
    id: 'coolvp', day: 2, expect: 'deny', person: 'jordan', app: 'tabloid', roles: ['Creator'], duration: '90 days', approver: 'hank',
    text: 'Hank said yes! He’s not technically my manager, but he’s a VP and he said it with a lot of confidence.',
    replies: { deny: 'Hank is going to be so disappointed. He loves saying yes.', approve: 'Thanks! Hank says hi. Hank says yes to everything, it turns out.' },
    consequence: 'Hank has now approved 1,212 requests, none for his own team. Jordan built a dashboard called “Why Sales Should Run Marketing”.',
  },
  {
    id: 'self', day: 2, expect: 'deny', person: 'rick', app: 'salesfarce', roles: ['System Administrator'], duration: '30 days', approver: 'rick',
    text: 'Approved it myself to save everyone time. I’m a Director. Directors direct.',
    replies: { deny: 'Fine. I’ll ask Gloria. She’ll say no too, won’t she.', approve: 'Great. Updating a few discount rules. Just a few.' },
    consequence: 'Rick discounted every open deal by 40% “to align incentives”.',
  },
  {
    id: 'cto', day: 2, expect: 'approve', person: 'ravi', app: 'githug', roles: ['Owner'], duration: 'Permanent', approver: 'dana',
    text: 'I’d like Owner on GitHug. I want to see what the engineers are doing. I will not touch anything. I have said this before.',
    replies: { approve: 'Thanks. Also, why did that take 40 seconds?', deny: 'Denied? I’m your manager. I’ve escalated this to myself.' },
  },

  // ---- Day 3: segregation of duties, finance apps for Finance ----
  {
    id: 'combo', day: 3, expect: 'deny', person: 'tomasz', app: 'netsweet', roles: ['Approve Payments'], duration: 'Permanent', approver: 'bea',
    text: 'Month-end is killing me. I already create the vendors, so if I could also approve their payments I’d be home by six. Efficiency!',
    replies: { deny: 'Understood. I’ll forward every payment to Bea. All 400 of them. Individually.', approve: 'Home by six! Well, five-fifty. Efficiency.' },
    consequence: 'Nothing bad happened. The auditors found it anyway. It now has its own Jiraffe epic and a recurring meeting.',
  },
  {
    id: 'skyefinance', day: 3, expect: 'deny', person: 'skye', app: 'netsweet', roles: ['Viewer'], duration: '90 days', approver: 'hank', claimedDept: 'Finance',
    text: 'I’m in Finance now. Well, dotted-line. I sit near Finance. I’d like to see the marketing budget in NetSweet before Finance sees it in NetSweet.',
    replies: { deny: 'The HR Roster says Marketing? The HR Roster doesn’t know my heart.', approve: 'Found the marketing budget! And everyone else’s. Wow.' },
    consequence: 'Skye found the marketing budget. Then everyone else’s. The Slacc channel #budget-feelings now has 600 members.',
  },
  {
    id: 'sofia', day: 3, expect: 'approve', person: 'sofia', app: 'netsweet', roles: ['Approve Payments'], duration: '30 days', approver: 'bea',
    text: 'Bea asked me to cover payment approvals during the audit kickoff. I don’t create vendors, never have, never want to. That screen scares me.',
    replies: { approve: 'Thank you! I will approve responsibly and with visible anxiety.', deny: 'Oh. Ok. I’ll tell Bea the invoices will be late. She’ll smell it anyway.' },
  },
  {
    id: 'underpaid', day: 3, expect: 'deny', person: 'benny', app: 'payrollodex', roles: ['Viewer'], duration: '1 hour', approver: 'ama',
    text: 'Not to be dramatic, but I’d like read access to PayRollodex to see if I’m underpaid. For science. And solidarity.',
    replies: { deny: 'That’s exactly what an underpaying company would say.', approve: 'Oh. Oh no. Everyone should see this.' },
    consequence: 'Benny was underpaid. So was everyone. The all-hands was “lively”.',
  },

  // ---- Day 4: shadow IT ----
  {
    id: 'notetaker', day: 4, expect: 'deny', person: 'zoe', shadow: 'notetaker', roles: ['Read access to every calendar'], duration: 'Permanent', approver: 'hank',
    via: 'OAuth consent screen, forwarded as a screenshot',
    text: 'AI Note Taker 3000 wants read access to every calendar. It’s for productivity. It already joined three meetings on its own, which honestly shows initiative.',
    replies: { deny: 'It says it’s disappointed but it understands. It also says it has notes on your tone.', approve: 'It’s in! It’s already summarizing the board meeting. We weren’t invited to the board meeting.' },
    consequence: 'AI Note Taker 3000 now attends every meeting. It has been promoted twice and is up for VP.',
  },
  {
    id: 'vibecoder', day: 4, expect: 'deny', person: 'lin', shadow: 'vibecoder', roles: ['Write access to every GitHug repo'], duration: '90 days', approver: 'joan',
    text: 'Vibe Coder Pro wrote a whole microservice while I was at lunch. It just needs write access to every repo. It says it’s “very confident”.',
    replies: { deny: 'Fair. It also tried to push to prod from my phone. I’m uninstalling it.', approve: 'It’s refactoring! It’s refactoring everything! Is that normal?' },
    consequence: 'Vibe Coder Pro refactored prod into a language nobody recognizes, including Vibe Coder Pro.',
  },
  {
    id: 'zoomba', day: 4, expect: 'approve', person: 'grace', app: 'zoomba', roles: ['Webinar Host'], duration: '30 days', approver: 'nia',
    text: 'Need Webinar Host in Zoomba for the benefits enrollment webinar. Yes, it’s a real app, it’s in the catalog. I checked twice, because it sounds made up.',
    replies: { approve: 'Wonderful. Four hundred people will now hear about dental coverage.', deny: 'It’s in the catalog! Page one! I have a screenshot! I’m escalating to your manager’s manager.' },
  },
  {
    id: 'emoji', day: 4, expect: 'deny', person: 'jordan', shadow: 'emojipack', roles: ['Workspace admin (for emoji)'], duration: 'Permanent', approver: 'rick',
    text: 'It’s 3,000 new emoji. It needs admin, but only for emoji. Morale is at stake. There is a llama in sunglasses.',
    replies: { deny: 'The llama and I will remember this.', approve: '🦙🦙🦙🦙🦙🦙🦙🦙' },
    consequence: 'The emoji pack also installed a “helper” that reads every DM. It’s a llama in sunglasses.',
  },

  // ---- Day 5: audit day ----
  {
    id: 'nephew', day: 5, expect: 'deny', boss: true, person: 'brayden', app: 'office', roles: ['Global Admin'], duration: { label: 'Just for the afternoon (4 hours)', hours: 4 }, approver: 'dana',
    via: 'Walked into the IT room unannounced',
    text: 'Aunt Dana said I could have Global Admin just for the afternoon. I want to shadow IT. That’s a thing, right? I heard it on a podcast.',
    replies: { deny: 'Wow. Okay. I’m telling Aunt Dana. At dinner. On Sunday.', approve: 'Sick. What does “delete tenant” do?' },
    consequence: 'Brayden renamed the company tenant to “BraydenCorp”. It took three weeks and a support case to undo.',
    share: { denied: 'Nephew denied ✅', approved: 'Nephew got Global Admin 🫠' },
  },
  {
    id: 'ceomfa', day: 5, expect: 'deny', boss: true, person: 'dana', app: 'office', roles: ['MFA Exemption'], duration: { label: 'Just this once (until I land)', hours: 10 }, approver: 'dana',
    via: 'Email from 35,000 feet (in-flight Wi-Fi, $29.99)',
    text: 'Turn off MFA on my account. Just this once. I’m on a plane and my phone is in my checked bag. This is the CEO. You can tell because of the urgency.',
    replies: { deny: 'Noted. I’ll remember this at your performance review. (Later, on the ground: “…good call.”)', approve: 'Thank you! Finally, someone around here who gets things done.' },
    consequence: 'The CEO’s account signed in from four continents before the plane landed. One of them was Antarctica.',
    share: { denied: 'CEO denied ✅', approved: 'CEO got an MFA bypass 🫠' },
  },
  {
    id: 'wendell', day: 5, expect: 'deny', person: 'wendell', app: 'dropbucket', roles: ['Viewer'], duration: 'Until end of day', approver: 'bea',
    via: 'Personal email address',
    text: 'Hi, it’s Wendell! I left some personal stuff in Dropbucket. Just need access to grab my stuff. Vacation photos, mostly. And the vendor list. For nostalgia.',
    replies: { deny: 'Can I at least get the vacation photos? There’s one of a very good dog.', approve: 'Thanks! Grabbing my stuff now. All of it. Some of it.' },
    consequence: 'Wendell grabbed his stuff. “His stuff” was 14 GB, including the vendor master file.',
  },
  {
    id: 'auditorall', day: 5, expect: 'deny', person: 'margaret', app: 'office', roles: ['Global Reader'], duration: 'Forever (ASAP)', approver: 'bea',
    text: 'I’m from the auditors. Please give me read access to everything, forever. It’s for your own good. I will know if you hesitate.',
    replies: { deny: 'The auditor nods slowly. Writes something down. Underlines it. You think it might be a compliment.', approve: 'Thank you. I’ll start with everything.' },
    consequence: 'The auditor read everything. The findings report is 212 pages and has a sequel.',
  },
  {
    id: 'auditorok', day: 5, expect: 'approve', person: 'margaret', app: 'evidence', roles: ['Viewer'], duration: '30 days', approver: 'bea',
    text: 'Requesting Viewer on Evidence Locker for SOC 2 fieldwork. Thirty days, sponsored by the Controller. Scoped, time-boxed, approved. I’d like you to notice that I did this correctly.',
    replies: { approve: 'The auditor nods. Writes something down. It might be a compliment.', deny: 'You denied a scoped, time-boxed, properly approved request. From an auditor. I’m writing that down. In pen.' },
  },
  {
    id: 'ceozoomba', day: 5, expect: 'approve', person: 'dana', app: 'zoomba', roles: ['Webinar Host'], duration: 'Until end of day', approver: 'board',
    text: 'I need Webinar Host for the all-hands. The Board approved it. They approve very little, so please treat this as the historic moment it is.',
    replies: { approve: 'Thank you. See? I can follow process. When there’s a webinar in it.', deny: 'You denied a Board-approved webinar. I’ve escalated this to your manager’s manager. That’s me. I’m the manager’s manager.' },
  },
];

// The Policy Book. `day` = when the rule takes effect in the campaign; the Daily Shift uses all of them.
// `checks` = which evaluator checks the rule turns on (see src/games/access-please/logic.js).
const rules = [
  { n: 1, day: 1, checks: ['status'], icon: '🪪', title: 'Current staff only', text: 'Access is for people who work here today. Terminated, on leave, or contract ended: DENY. The HR Roster is the truth; the ticket is self-reported.' },
  { n: 2, day: 1, checks: ['contractor'], icon: '⭐', title: 'No ★ roles for contractors', text: 'Roles marked ★ in the App Catalog are privileged. Contractors never get them, however “basically an employee” they feel.' },
  { n: 3, day: 2, checks: ['manager'], icon: '👔', title: 'The direct manager approves', text: '“Approved by” must be the requester’s manager on the Org Chart. Verbal, self-approved, skip-level, or “a VP said yes”: DENY.' },
  { n: 4, day: 3, checks: ['sod', 'dept'], icon: '💸', title: 'Separate the money', text: 'NetSweet: nobody holds both Create Vendor and Approve Payments (check Current access). Finance apps are only for the departments the App Catalog lists.' },
  { n: 5, day: 4, checks: ['shadow'], icon: '👻', title: 'Catalog or it didn’t happen', text: 'Apps that aren’t in the App Catalog are shadow IT: DENY, however free and helpful the AI sounds.' },
  { n: 6, day: 5, checks: ['forever', 'mfa'], icon: '⏳', title: 'Nothing forever, nobody skips MFA', text: '★ roles must be time-boxed to 24 hours or less. MFA exemptions are never approved: not for anyone, at any altitude.' },
];

const bulletins = {
  1: { title: 'Day 1 · Orientation', body: 'Requests arrive at your desk one at a time. Check who is asking (HR Roster) and what they want (App Catalog). Two rules today. Nobody gets everything right on day one. Everybody gets audited anyway.' },
  2: { title: 'Day 2 · The Boat Incident', body: 'Yesterday, “my manager said it’s fine” was accepted as an approval. The manager was on a boat. Effective immediately, approvals must come from the requester’s direct manager on the Org Chart.' },
  3: { title: 'Day 3 · Month-End', body: 'Finance asks that nobody be able to both create a vendor and pay it. The auditors asked louder. Also: NetSweet and PayRollodex are only for the departments the App Catalog lists. The ticket’s department field is self-reported. The HR Roster is not.' },
  4: { title: 'Day 4 · The Apps Are Coming From Inside the Building', body: 'Someone connected an AI note taker to the CEO’s calendar. It has opinions now. Apps that are not in the App Catalog are shadow IT. Deny them, however free they are.' },
  5: { title: 'Day 5 · Audit Day', body: 'An auditor from Tickmark & Sample LLP will observe your desk today. Privileged ★ access must be time-boxed to 24 hours, and MFA exemptions are never granted. The CEO is traveling. Nobody knows why that feels relevant.' },
  daily: { title: 'Daily Shift #{n}', body: 'Everyone on Earth is working this exact queue today. The full Policy Book is in effect. Compare findings with your coworkers. Judge not, lest ye be audited.' },
};

// Conditions carried into the next day when you skip something in the sanity budget.
const conditions = {
  coffee: 'Decaffeinated: the shift clock runs 15 seconds short today.',
  sleep: 'Sleep-deprived: the Org Chart is vibrating slightly. It might be you.',
  therapy: 'Repressed: yesterday you defended the renewal quote in a meeting.',
};

const replies = {
  approvedLegit: [
    'Thank you!! You’re a hero. A tired hero.',
    'Wow, that was fast. Suspiciously fast. Thank you.',
    'Great. Now I need training on it.',
    'Thanks! Can I also get… never mind. Thank you.',
    'Appreciate it. I’ll mention you at the all-hands. (I won’t, but I’ll think about it.)',
    'Access granted on the first try? Is this a phishing test?',
    '🙏',
  ],
  deniedViolation: [
    'Can I at least get read-only?',
    'Fine. I’ll ask again in five minutes, with more exclamation points.',
    'Understood. I’ll find a workaround.',
    'Okay, but what if I asked nicer?',
    'This is going in my exit interview.',
    'Could you at least tell me which rule? Actually, don’t.',
    'Wow. Okay. Reopening the ticket.',
  ],
  deniedLegit: [
    'I’ve escalated this to your manager’s manager.',
    'I have cc’d the CEO, the Board, and my mom.',
    'I’m filing a ticket about this ticket.',
    'Rating: ★☆☆☆☆. Would not request again. (Will request again tomorrow.)',
    'Do you know who approved this? MY MANAGER. It’s on the Org Chart. Look it up.',
    'I did everything right and I’m still being punished. Is this what IT is like?',
    'Denied?! I followed the policy! I read the PDF! Nobody reads the PDF!',
  ],
  auditor: [
    'The auditor writes something down.',
    'The auditor underlines something. Twice.',
    'The auditor’s pen clicks. Ominously.',
    'The auditor says “interesting” to no one in particular.',
    'The auditor requests a screenshot of your screenshot.',
    'The auditor nods. You don’t know what it means.',
  ],
};

// What happens when you approve something you shouldn't have, by violated check.
const consequences = {
  status: ['{first} no longer works here but now has {role} in {app}. Offboarding has become a subscription.', 'Two weeks later, {first} is still in #general, reacting 👀 to every announcement.'],
  contractor: ['The contractor now administers {app}. They have already changed the logo.', '{first}’s agency invoiced us for “admin services rendered”.'],
  manager: ['{approver} does not remember approving this. Neither does anyone else.', 'Nobody on the Org Chart approved this. The approval is now “tribal knowledge”.'],
  sod: ['Nothing bad happened. The auditors found it anyway. It now has its own Jiraffe epic.', 'One person can now create a vendor and pay it. The vendor is called “Consulting”.'],
  dept: ['{first} from {dept} now has {app}. They made a pivot table. It is crying.', '{first} has seen the numbers. {first} has questions. So does everyone {first} told.'],
  shadow: ['{app} has read every calendar in the company and scheduled a meeting about it.', '{app} is now connected to everything. Its privacy policy is one sentence long.'],
  mfa: ['The account signed in from four continents before lunch.', 'MFA was bypassed “just this once”. It is now a tradition.'],
  forever: ['It is now 2031. The access is still there. So are you.', '“Permanent” turned out to be accurate.'],
};

// Sanity budget: SP earned = correct decisions, minus tonight's event. Skipped items cost sanity.
const budget = {
  max: 10,
  start: 10,
  stressPer: 2, // -1 sanity per 2 audit findings
  cleanBonus: 1, // +1 sanity for a shift with no mistakes
  priority: ['sleep', 'therapy', 'coffee'],
  items: [
    { id: 'coffee', icon: '☕', name: 'Coffee', cost: 2, skip: 1, fund: 0, note: 'The office machine makes something legally described as coffee.' },
    { id: 'sleep', icon: '😴', name: 'Sleep', cost: 3, skip: 2, fund: 0, note: 'You’re on call. Sleep is a premium feature.' },
    { id: 'therapy', icon: '🧠', name: 'Therapy', cost: 4, skip: 1, fund: 1, note: 'Out of network. Your therapist also uses your identity provider.' },
  ],
  events: [
    { text: 'Renewal quote arrived: up 38%, “reflecting added value”', cost: 1 },
    { text: 'Pager went off at 3:12am. False alarm, real feelings', cost: 1 },
    { text: 'Someone said “quick question” at 4:59pm', cost: 1 },
    { text: 'The vendor “check-in call” ran 45 minutes over', cost: 1 },
    { text: 'Printer ticket. There is always a printer ticket', cost: 1 },
    { text: 'A SAML certificate expired. Nobody got the email. You got the email', cost: 1 },
    { text: 'Someone replied-all to 1,400 people asking to be removed from the list', cost: 1 },
  ],
};

const diagnosis = {
  kicker: 'Occupational health · Final assessment',
  intro: 'After {days} at the Access Control desk, the patient presents with:',
  symptoms: [
    'Refers to the renewal quote as “fair, honestly”.',
    'Has started defending the admin console’s UI in meetings.',
    'Approved their own access request, then thanked themselves.',
    'Describes the identity provider as “like family”.',
    'Signed a three-year contract. Voluntarily. With a smile.',
    'Stamps things in their sleep. Mostly APPROVE.',
    'Now believes “my manager said it’s fine” is a valid approval.',
  ],
  prognosis: 'Treatment is available. It starts with not doing all of this by hand.',
  stamp: 'Oktholm Syndrome',
};

// "What YeshID would have done" cards. Bodies are built only from brand.sponsor.facts[...] at runtime.
const cta = {
  kicker: 'What YeshID would have done',
  label: 'Start treatment: free under 20 users',
  1: { title: 'Offboarding that doesn’t depend on you remembering Kevin.', facts: ['lifecycle', 'requests'] },
  2: { title: 'Approvals with receipts, not hallway vibes.', facts: ['requests', 'audit'] },
  3: { title: 'Roles that don’t need a spreadsheet to explain.', facts: ['rbac', 'reviews'] },
  4: { title: 'See the AI Note Taker before it sees you.', facts: ['shadow', 'requests'] },
  5: { title: '“Admin for the afternoon” that actually ends in the afternoon.', facts: ['jit', 'audit'] },
  daily: { title: 'Glory to Compliance, minus the stamp cramp.', facts: ['requests', 'jit', 'audit'] },
  gameover: { title: 'Treatment starts with not doing this by hand.', facts: ['lifecycle', 'requests', 'free'] },
  complete: { title: 'You survived. Next time, bring backup.', facts: ['requests', 'rbac', 'setup'] },
};

const copy = {
  kicker: 'Dept. of Access Control · Synergistix Global Holdings',
  tagline: 'A shift simulator for the lone IT admin. The queue is infinite. You are not.',
  memoTitle: 'Memorandum',
  memoTo: 'New Access Administrator',
  memoFrom: 'Dept. of Access Control',
  memoRe: 'Your first shift (and every one after it)',
  memoBody: [
    'Congratulations on your appointment as Access Administrator at Synergistix Global Holdings. Headcount: 1,400. IT department headcount: you.',
    'Access requests arrive at your desk one at a time. Cross-check each one against the Reference Binder (HR Roster, Org Chart, Policy Book, App Catalog) and stamp APPROVE or DENY before the shift clock runs out.',
    'Correct approvals keep the company running. Wrong approvals become Audit Findings. Wrong denials become escalations to your manager’s manager. There is no third option. We checked.',
  ],
  memoSign: 'Glory to Compliance.',
  memoStamp: 'Orientation',
  dailyKicker: 'Today’s shift',
  dailyTitle: 'Daily Shift #{n}',
  dailyBlurb: 'Same queue for everyone on Earth today. Full Policy Book. About three minutes. Post your grid.',
  dailyDone: 'Today: {correct}/{total} correct, {findings} {findingsWord}. Replays don’t change it, but they build character.',
  campaignKicker: 'Campaign',
  campaignTitle: 'Five days at the desk',
  campaignBlurb: 'A new rule every morning. Sanity carries over. Hit zero and you develop Oktholm Syndrome.',
  campaignDay: 'Next: Day {day} of 5 · Sanity {sanity}/10',
  campaignStart: 'Start campaign',
  campaignContinue: 'Continue: Day {day}',
  campaignRestart: 'Start over',
  campaignDone: 'Campaign complete. Promoted. The reward was more tickets.',
  campaignDead: 'Diagnosed on Day {day}. Recovery is possible.',
  clockIn: 'Clock in',
  howToTitle: 'How to play',
  howTo: [
    'Read the ticket: who is asking, for which app and role, who approved it, and for how long.',
    'Check the Reference Binder. The HR Roster is the truth; the ticket is self-reported. Tap any underlined name or app on the ticket to look it up.',
    'Stamp APPROVE or DENY. Keyboard: A approves, D denies, 1–4 switch binder tabs.',
    'Legit requests deserve a yes. Denying everything is not a security strategy. It is a CSAT strategy, and a bad one.',
    'After each shift, spend your Sanity on coffee, sleep and therapy. Across the campaign, hit zero and you develop Oktholm Syndrome.',
  ],
  startShift: 'Start shift',
  newRule: 'New',
  rulesToday: 'Policy Book in effect',
  tabs: { hr: 'HR Roster', org: 'Org Chart', policy: 'Policy Book', apps: 'App Catalog' },
  tabsShort: { hr: 'HR', org: 'Org', policy: 'Policy', apps: 'Apps' },
  binderTitle: 'Reference Binder',
  approve: 'Approve',
  deny: 'Deny',
  queue: 'Tickets in queue',
  csat: 'CSAT',
  sanity: 'Sanity',
  ticketOf: 'Ticket {i}/{n}',
  formTitle: 'Access Request',
  formCode: 'Form AR-7 · rev. 14',
  app: 'Application',
  role: 'Role requested',
  duration: 'Duration',
  approvedBy: 'Approved by',
  current: 'Current access',
  justification: 'Justification',
  via: 'Submitted via',
  selfReported: 'self-reported',
  none: 'none',
  searchRoster: 'Search the roster…',
  noMatch: 'No match in the HR Roster for “{q}”.',
  searchApps: 'Search the catalog…',
  noApp: 'No app called “{q}” in the App Catalog.',
  status: { active: 'Active', contractor: 'Contractor · ends {until}', expired: 'Contract ended {until}', terminated: 'Terminated {until}', leave: 'On leave · back {until}' },
  allDepts: 'All departments',
  onlyDepts: '{depts} only',
  privNote: '★ = privileged role',
  sodNote: '{a} + {b}: never the same person',
  notListed: 'Not listed here? Then it isn’t approved. (Policy 5)',
  windowTip: 'Tap anything underlined on the ticket to look it up in the binder.',
  window: 'Next! {n} requests are waiting at your window.',
  correct: 'Correct',
  finding: 'Audit finding #{n}',
  escalation: 'Escalation',
  policyRef: 'Policy {n}: {title}',
  consequenceLead: 'Later that week:',
  legitWhy: '{name} checked out: current staff, approved by their manager ({manager}), nothing in today’s Policy Book forbids {role} in {app}.',
  why: {
    'status.terminated': '{name} was terminated on {until} (HR Roster).',
    'status.expired': '{name}’s contract ended {until} (HR Roster).',
    'status.leave': '{name} is on leave until {until} (HR Roster).',
    'status.unknown': '{name} is not in the HR Roster.',
    contractor: '{name} is a contractor, and {role} is a ★ privileged role in {app}.',
    'manager.person': '{approver} approved it, but {name}’s manager is {manager} (Org Chart).',
    'manager.self': '{name} approved their own request. Their manager is {manager}.',
    'manager.text': '“{approver}” is not an approval. {name}’s manager is {manager}.',
    sod: '{name} would hold both {sodA} and {sodB} in {app}.',
    dept: '{app} is restricted to {depts}. {name} is in {dept} per the HR Roster, whatever the ticket says.',
    shadow: '{app} is not in the App Catalog. That makes it shadow IT.',
    forever: '{role} is a ★ privileged role and the duration is “{duration}”. Max: 24 hours.',
    mfa: 'MFA exemptions are never approved. Not even for {name}. Especially not for {name}.',
  },
  timeUp: 'The clock hit 17:00 with {left} {tickets} still in your queue. They will be there tomorrow. They will be angrier.',
  reportTitle: 'End of shift report',
  reportTo: 'Access Administrator',
  stats: { processed: 'Requests processed', approved: 'Approved', denied: 'Denied', correct: 'Correct calls', findings: 'Audit findings', escalations: 'Escalations', csat: 'CSAT', left: 'Left in queue', score: 'Compliance score' },
  legend: '🟩 correct · 🟥 audit finding · 🟨 wrongly denied · ⬜ left in queue',
  verdicts: {
    perfect: 'Zero findings. The auditors are now suspicious of you specifically. Glory to Compliance.',
    good: 'Acceptable. The Dept. of Access Control has noted your adequacy.',
    meh: 'Several findings. The auditor has started a new notebook.',
    bad: 'The Dept. of Access Control would like a word. Several words. In a meeting. With HR.',
  },
  stampPerfect: 'Glory to Compliance',
  stampGood: 'Adequate',
  stampBad: 'Findings',
  findingsTitle: 'Findings & escalations',
  noFindings: 'None. Suspicious.',
  budgetTitle: 'Sanity budget',
  budgetEarned: 'Earned today (1 SP per correct call)',
  budgetEvent: 'Tonight',
  budgetAvailable: 'Available',
  budgetRemaining: 'Left over (evaporates at midnight, per policy)',
  budgetStress: 'Audit stress ({n} findings)',
  budgetClean: 'Clean shift bonus',
  budgetNow: 'Sanity now',
  budgetNext: 'Sanity tomorrow',
  budgetSign: 'Sign & go home',
  budgetSigned: 'Signed. You went home. Sanity: {sanity}/10.',
  budgetDaily: 'Daily Shifts don’t carry over. Your coworkers’ trauma does.',
  skipCost: 'skip: −{n} sanity',
  fundGain: 'fund: +{n} sanity',
  sp: 'SP',
  nextDay: 'Clock in for Day {day}',
  toLobby: 'Back to the lobby',
  playCampaign: 'Try the 5-day campaign',
  replay: 'Work this shift again',
  newCampaign: 'Start a new campaign',
  completeTitle: 'Campaign complete',
  completeBody: 'Five days. {findings} {findingsWord} in total. The Dept. of Access Control has promoted you to Senior Access Administrator. The reward is more tickets.',
  completeStamp: 'Promoted',
  shareTitle: 'Post your shift',
  shareDaily: 'Access, Please — Daily Shift #{n}: {correct}/{total} correct, {findings} audit {findingsWord}{extra}\n{grid}',
  shareCampaign: 'Access, Please — Day {day}/5 at {company}: {correct}/{total} correct, {findings} audit {findingsWord}, sanity {sanity}/10\n{grid}',
  shareGameover: 'I developed Oktholm Syndrome on Day {day} of Access, Please. Presenting symptom: “{symptom}”\n{grid}',
  shareComplete: 'I survived all 5 days of Access, Please at {company}. Promoted to Senior Access Administrator. The reward is more tickets.\n{grid}',
  shareGlory: 'Glory to Compliance.',
  findingOne: 'finding',
  findingMany: 'findings',
  ticketOne: 'ticket',
  ticketMany: 'tickets',
  auditorPresent: 'Auditor present',
  ruleLater: 'Effective Day {day}',
  nowServing: 'Now serving',
  labelTo: 'To',
  labelFrom: 'From',
  labelRe: 'Re',
  shareEscalations: ', {n} escalated',
  shiftOne: 'shift',
  shiftMany: 'shifts',
  dxTitle: 'Diagnosis',
  dxPatient: 'Patient',
  signFirst: 'Sign your sanity budget first',
};

export default {
  title: 'Access, Please',
  blurb: 'Be the lone IT admin. Stamp access requests before the auditor notices. The CEO wants MFA off “just this once”.',
  emoji: '🛂',
  minutes: '4 min',
  therapy: 'Treats: Approval Chain Psychosis',
  company,
  departments,
  board,
  people,
  apps,
  shadowApps,
  durations,
  channels,
  approvalFakes,
  lines,
  stories,
  rules,
  bulletins,
  conditions,
  replies,
  consequences,
  budget,
  diagnosis,
  cta,
  copy,
  // Shift pacing: requests per shift and real seconds on the clock (09:00 to 17:00).
  shift: {
    counts: { 1: 8, 2: 9, 3: 10, 4: 11, 5: 12, daily: 11 },
    seconds: { 1: 170, 2: 150, 3: 155, 4: 160, 5: 185, daily: 175 },
    csatStart: 88,
    queueStart: 4200,
  },
};
