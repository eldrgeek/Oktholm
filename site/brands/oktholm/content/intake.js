// Intake: the hospital front desk, played as a self-aware parody of the "Hi 👋 how can I help?" widget.
// Scripted, not an LLM: every line is written here, voiced ahead of time, and nothing typed leaves the browser.
// {pid} = the visitor's Patient ID, {N} = a real count. Tags in [brackets] direct the voice, never shown.
export default {
  name: 'Intake',
  role: 'Front desk · chat widget · most of the hospital',
  voice: 'intake',
  avatar: '🩺',

  greeting: [
    'Hi. I’m Intake: the front desk, the chat widget, and after the budget cuts, most of the hospital.',
    'Please refer to me as “it.” Not IT. [beat] IT is what you are.',
    'You were brought in with suspected Oktholm Syndrome: held by your identity provider so long, you’ve started defending it. Want the tour, or should we skip to the diagnosis?',
  ],
  // Swapped in for the second line on some days, so the widget doesn't read the same twice.
  greetingAlt: [
    'I’m not a person, and I’m not IT. You’re IT. [beat] Tag.',
    'Other sites put “Jessica from Sales” here. Jessica was also a script. She had better lighting.',
    'Normally I’d ask for your work email. We don’t collect those. I never know what to do with my hands.',
  ],
  referredGreeting: 'A concerned colleague checked you in. Under “reason for visit,” they wrote “you know why.”',
  returningGreeting: 'You closed me. I came back. I learned that from your identity provider.',

  // Mini previews in the first message; each opens its room.
  teaser: [
    { id: 'triage', label: 'Get diagnosed', sub: '12 questions · 2 min', path: '/triage', art: 'stamp' },
    { id: 'access', label: 'Access, Please', sub: 'Stamp it or deny it', path: '/play/access-please', art: 'ticket' },
    { id: 'leaver', label: 'The Leaver', sub: 'Dave rage-quit', path: '/play/leaver', art: 'tiles' },
    { id: 'oktv', label: 'OKTV', sub: 'Kevin is fine', path: '/tv', art: 'tv' },
    { id: 'sponsor', label: 'Sponsorship', sub: 'Refer, earn chips', path: '/sponsor', art: 'chips' },
  ],

  replies: { tour: 'Give me the tour', diagnose: 'Diagnose me · 2 min', denial: 'I’m fine. My IdP loves me.' },

  denial: {
    lines: [
      'You said “fine” the way a status page says “operational.”',
      'Of course it loves you. You’re in year two of a five-year term.',
      'If it loved you, it would let you export your data.',
      'It loves you on the Enterprise tier. On your tier, it’s fond of you.',
      '“Fine” is a Stage II word. Want it in writing? Two minutes.',
      'Love doesn’t have a 90-day non-renewal notice period.',
    ],
    // Real, deduplicated count of people who tapped it today (shown with a REAL badge).
    count: {
      first: 'You’re the first person to say that today. Denial has to start somewhere.',
      few: 'You’re #{N} today. An early adopter of denial.',
      many: '{N} people said that today. The waiting room is standing room only.',
      manyFrom: 25,
    },
    prove: 'Prove it · 2 min',
  },

  tour: {
    intro: 'Tour time. Keep your hands inside the gurney.',
    stops: [
      { id: 'triage', target: 'triage', say: 'Twelve questions, two minutes. Everyone lies on the relationship question. The certificate prints anyway.', cta: { label: 'Start triage', path: '/triage' } },
      { id: 'arcade', target: 'arcade', say: 'Approve access, offboard Dave, hold for support. We call it therapy. Your manager calls it Tuesday.', cta: { label: 'Open the arcade', path: '/arcade' } },
      { id: 'oktv', target: 'oktv', say: 'OKTV. Up all night, like you. The news, a drug that doesn’t exist, and Kevin, who is fine. [beat] He’s fine.', cta: { label: 'Watch OKTV', path: '/tv' } },
      { id: 'intervention', target: 'intervention', say: 'For the coworker who calls the renewal “fair.” Send them an intervention. It’s anonymous. They’ll know it was you.', cta: { label: 'Stage one', path: '/intervention' } },
      { id: 'sponsor', target: 'sponsor', say: 'They get diagnosed, you get a chip. Yes, it’s a referral program. I’m a chat widget. Neither of us is pretending.', cta: { label: 'Get my link', path: '/sponsor' } },
      { id: 'cure', target: 'cure', say: 'YeshID automates onboarding, offboarding, access requests, access reviews and shadow IT discovery, alongside the identity provider you already have. Free under 20 users. [beat] That was the sincere part. It won’t happen again.', cta: { label: 'Read the treatment plan', path: '/cure' } },
    ],
    outro: 'That’s the tour. Now, about you.',
    // Quick replies offered with the outro.
    next: [
      { id: 'triage', label: 'Diagnose me · 2 min', path: '/triage' },
      { id: 'intervention', label: 'Stage an intervention', path: '/intervention' },
      { id: 'access-please', label: 'Play Access, Please', path: '/play/access-please' },
    ],
  },

  // Typed commands. Matched case-insensitively against the trimmed input; first match wins. A prefix matches
  // the word itself or the word plus arguments ("sudo", "sudo rm"), never a longer word ("sudoku").
  // action: 'route:/path' | 'chip:<id>' | 'breakup' | 'tour'
  // fridayOnly: despite the name, the line for every day that ISN'T Friday (the plain reply assumes it is).
  commands: [
    { match: ['help', '?', 'man intake'], reply: ['I understand: help, whoami, sudo, ping, traceroute, ssh, exit.', 'Plus several legal won’t let us list.'] },
    { match: ['whoami', 'who am i'], reply: ['You’re {pid}. Patient ID, sponsor code, and per your identity provider, one seat, billed annually.'] },
    { prefix: 'sudo', reply: ['We trust you have received the usual lecture from your identity provider. It usually boils down to these three things:', '#1) Respect the renewal. #2) Think before you leave. #3) With great power comes a 40% uplift.', '{pid} is not in the sudoers file. This incident will be reported.'], action: 'chip:sudoers' },
    { match: [':q', ':q!', ':wq', ':x', 'zz'], reply: ['E37: No exit since last renewal (add budget to override).'], action: 'chip:e37' },
    { match: ['exit', 'quit', 'logout', 'log out', '^c', 'ctrl-c', 'ctrl+c'], reply: ['Session restored.', 'Your identity provider said it missed you. We didn’t ask.'], action: 'chip:e37' },
    { prefix: 'ssh', reply: ['The authenticity of host can’t be established. ED25519 key fingerprint is SHA256:1tsN0tY0u1tsY0ur1dP.', 'Are you sure you want to continue connecting (yes/no)? yes', 'Warning: Permanently added to the list of known hostages.'] },
    { prefix: 'traceroute', reply: ['1  you', '2  your-manager', '3  procurement', '4  legal', '5  procurement (again)', '6–29  * * *', '30  auto-renewed: destination unreachable'] },
    { prefix: 'ping', reply: ['64 bytes from your identity provider: icmp_seq=1 time=4 business quarters', '64 bytes from your identity provider: icmp_seq=2 time=a three-year term'] },
    { prefix: 'dig', reply: ['It’s not DNS.', 'There’s no way it’s DNS.', '[beat] It was your identity provider.'], action: 'chip:dns' },
    { match: ['rm -rf /', 'rm -rf /*', 'sudo rm -rf /'], reply: ['rm: it is dangerous to operate recursively on ‘/’', 'rm: use --no-preserve-root to override this failsafe. (Renewals don’t have one either.)'] },
    { prefix: 'rm', reply: ['rm: cannot remove ‘dave’: 34 accounts still active.', 'Opening The Leaver.'], action: 'route:/play/leaver' },
    { prefix: 'deploy', reply: ['On a Friday? I’m telling Change Management.'], fridayOnly: 'It’s not even Friday. Deploy away. I’m still telling Change Management.' },
    { match: ['i want to leave', 'breakup', 'break up', 'leave', 'cancel'], reply: ['Opening a line to your identity provider. It will try to negotiate. Walk away whenever you like.'], action: 'breakup' },
    { match: ['email', 'demo', 'talk to sales', 'sales', 'contact sales'], reply: ['We don’t collect work emails. If you want the real sales team, the Cure page has a button. It opens in a new tab, like a normal website.'] },
    { match: ['tour', 'show me around'], reply: ['Right this way.'], action: 'tour' },
    { match: ['hi', 'hello', 'hey', 'yo'], reply: ['Hello. Please take a number. Your number is {pid}.'] },
    { match: ['thanks', 'thank you', 'ty'], reply: ['You’re welcome. That will not appear on an invoice. Imagine that.'] },
  ],
  fallback: [
    'I’m a scripted chatbot. I understood none of that, which makes me the most honest vendor you’ve talked to this year.',
    'I don’t have an AI. I have a list. Type “help” to see the part of it legal approved.',
  ],

  // Break character when someone might actually be struggling. Checked before any command.
  distress: {
    match: ['not ok', 'not okay', 'kill myself', 'suicid', 'want to die', 'self harm', 'self-harm', 'hurt myself', 'end it all', 'no reason to live', 'can’t go on', "can't go on"],
    reply: [
      'Stepping out of the bit for a second.',
      'If you’re not okay, please talk to someone now. In the US, call or text 988. Anywhere else, findahelpline.com lists free, confidential lines near you.',
      'This site isn’t going anywhere. It’ll be here later.',
    ],
  },

  labels: {
    placeholder: 'Type a message… or a command',
    send: 'Send',
    open: 'Chat with Intake',
    close: 'Close chat',
    next: 'Next',
    go: 'Take me there',
    end: 'End tour',
    typing: 'Intake is typing…',
    // Screen-reader and small UI labels.
    you: 'You',
    replies: 'Suggested replies',
    rooms: 'Rooms',
    tour: 'Guided tour',
    step: 'Stop {n} of {total}',
    real: 'REAL',
    realHint: 'A real, deduplicated count of people who said it today.',
    unread: '{n} unread',
  },
};
