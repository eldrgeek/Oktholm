// Brand content for the "hold" module (Oktholm Syndrome / YeshID).
// Pure data only: no DOM access, no CSS imports. Read by the module as ctx.content.
//
// Tokens in {braces} are filled by the module: {pos} queue position, {tier} next support tier,
// {time} hold time, {site} brand site name, {vendor} the redacted vendor name, {key} a keypad key.
export default {
  title: 'Please Hold',
  blurb: 'A vendor-support hold simulator. Your call is important to us. Not important enough to answer.',
  emoji: '☎️',
  minutes: '∞ min',
  therapy: 'Treats: Support Ticket Time Dilation',

  vendor: '[REDACTED]',
  phoneLabel: 'Oktholm General · Ext. 4357 (HELP)',

  greeting:
    'Thank you for calling [REDACTED] Support. This call may be recorded for quality, training and future litigation purposes. Please hold.',
  idleCaption: 'Every hold is a journey. Most journeys end in a knowledge base article.',

  intro: [
    'Press “Call vendor support.” Sound on is recommended, if you can take it.',
    'Listen to the music. Become the music.',
    'The keypad works. That is not the same as helping.',
    'Hang up whenever you are ready to feel something.',
  ],

  // IVR announcements, played every 20–40 seconds in shuffled order.
  announcements: [
    'Your call is important to us. Not important enough to answer, but important.',
    'Did you know most questions are answered in our Community Forum? The forum was archived in 2019.',
    'Your estimated wait time is four business quarters.',
    'For SSO, please upgrade to Enterprise. For Enterprise, please hold.',
    'Press 1 to repeat this message. Press 2 to be disconnected. Press 3 to hear about our new AI assistant, which will also put you on hold.',
    'We are experiencing higher than usual call volumes. We have been experiencing them since 2016.',
    'Please have your customer ID, your contract number and the name of the account executive who left last year ready.',
    'For faster service, please visit our status page. It is green. It is always green.',
    'Calls are answered in the order they are received, and then re-sorted by contract value.',
    'Premium Support customers are answered within four hours. You are not a Premium Support customer. But you could be.',
    'Did you know you can open a ticket online? Online tickets are reviewed by the same team that is not answering this phone.',
    'If you are calling about the outage, we are aware of the outage. We are not aware of when it will end.',
    'Our knowledge base has an article about your issue. The article says to contact support.',
    'This call may be recorded for quality assurance. Quality has not yet been assured.',
    'Please stay on the line. Hanging up will not make us faster, but it will make you last.',
    'Our new AI assistant has already closed thousands of tickets. It did not resolve them. It closed them.',
    'Your renewal quote is ready. Your support ticket is not.',
    'To help us troubleshoot, please describe the problem in 500 characters or fewer, then again in a form, then again to a person who has not read the form.',
    'Your identity is important to us. So important that we have verified it four times this week and still do not believe you.',
    'Please note: SCIM provisioning is available on our Enterprise Plus plan, which is available on our Enterprise Plus Plus plan.',
    'If you are a new customer, press nothing. A sales representative is already on the way to your office.',
    'Our support hours are Monday through Friday, nine to five, in a time zone we have chosen not to disclose.',
    'Good news. Your ticket has been upgraded from New to Open. That is progress.',
    'This hold music is available on our Enterprise plan. You are hearing the trial version.',
    'Due to a recent reorganization, Support is now the Customer Success Experience Enablement team. Wait times are unchanged.',
    'Your place in line is being held securely. Encrypted at rest. Very much at rest.',
    'We value your patience. Our shareholders value it even more.',
    'Your contract includes a dedicated technical account manager. He left in March. His replacement is being scoped.',
    'Your issue has been marked as a known issue. Known to us. Known since 2021.',
    'Please do not hang up. Somewhere, a support engineer is reading your ticket title. Just the title.',
    'If this is an emergency, please file a Severity 1 ticket. It will be downgraded to Severity 3 within the hour.',
    'This call is being monitored by our AI for sentiment. Current sentiment: resigned.',
    'Thank you for your patience. It has been added to your account and will be billed annually.',
    'We are sorry. All of our agents are in a meeting about reducing wait times.',
    'For password resets, please visit the self-service portal. To log in to the self-service portal, please reset your password.',
    'Your feedback matters. It is stored in a feedback lake, where it will be retained, unread, for seven years.',
  ],

  // "EST. WAIT" on the phone display. Rotates with every announcement.
  waits: [
    'four business quarters',
    'one (1) fiscal year',
    'until renewal',
    'longer than your trial',
    'TBD (see roadmap)',
    '3–5 business eternities',
    'about one sprint',
    'shortly*',
    'less than the rollout did',
    'ask your account manager',
  ],

  // "NOW PLAYING" on the phone display.
  songs: [
    'Your Call Is Important (Extended Mix)',
    'Canon in D(enied)',
    'Adagio for Open Tickets',
    'Elevator to Tier 2',
    'Bossa Nova for Severity 3',
    'Smooth Hold Jazz, Vol. 5 (Enterprise Edit)',
    'Nocturne for a Known Issue',
    'Greensleeves (Renewal Season Mix)',
  ],

  // Logged when the queue position goes UP.
  queueUp: [
    'Due to unexpectedly expected call volumes, your position has been adjusted.',
    'A Premium Support customer has joined the queue ahead of you. They were premium.',
    'Your position has been re-prioritized by our AI. It did not like your tone.',
    'Someone with a bigger contract just called.',
    'Queue position updated. Upward, like the renewal quote.',
    'Your place in line has been reassigned to a more strategic account.',
  ],
  nextInLine: 'You are next in line. Please do not get your hopes up. Hope is an Enterprise feature.',

  // Representatives. Each pickup plays one conversation, then escalates you back into a longer queue.
  reps: [
    {
      name: 'Chad',
      tier: 'Tier 1',
      lines: [
        'Hi, this is Chad from Tier 1. Thank you for your patience. Have you tried clearing your cache?',
        'Okay. And have you tried a different browser? What about a different laptop? A different company?',
        'I see. I’m going to go ahead and escalate this to Tier 2. They’re great. I’ve never met them.',
      ],
    },
    {
      name: 'Dana',
      tier: 'Tier 2',
      lines: [
        'Dana, Tier 2. I’ve read Chad’s notes. They say “customer is on the phone.”',
        'To investigate, I’ll need a HAR file, a screen recording and a notarized description of the problem.',
        'Thanks. This looks like a Tier 3 issue. Or a feature request. I’ll escalate it to both.',
      ],
    },
    {
      name: 'Morgan',
      tier: 'Tier 3',
      lines: [
        'Morgan, Tier 3. I’m technically on vacation, but your ticket has “CEO” in the title.',
        'The good news is we can reproduce it. The bad news is it’s working as designed.',
        'I’ll file a feature request. It will be reviewed at the next planning cycle, which is also working as designed.',
      ],
    },
    {
      name: 'Kevin',
      tier: 'Tier 1',
      lines: [
        'Hi, this is Kevin from Tier 1. Chad was promoted to the Enterprise queue. He seems very happy there.',
        'I see your ticket went to Tier 3 and came back. Have you tried clearing your cache?',
        'No problem. I’ll escalate this to Tier 2 with a note that says “urgent.” Every ticket says “urgent.”',
      ],
    },
    {
      name: 'Pat',
      tier: 'Supervisor',
      lines: [
        'Hi, I’m the supervisor. I understand you asked for me. You didn’t, but I understand.',
        'I’ve reviewed your call, and everything was handled according to process. The process is the problem, but it was handled.',
        'I’m putting you back in the queue with a VIP flag. Everyone has a VIP flag.',
      ],
    },
    {
      name: 'Chad',
      tier: 'Tier 1',
      lines: [
        'Chad again! I’ve been in this queue eleven years. It’s not so bad once you stop fighting it.',
        'Honestly, it kind of feels like home now. I’ve named the hold music. Would you like to hear it again?',
        'Sorry, what was your issue? Never mind. Let me escalate you.',
      ],
    },
  ],
  transfer: 'Transferring you to {tier}. You are caller number {pos}.',

  // Keypad 8: Sales, which somehow has no queue.
  sales: {
    name: 'Tyler',
    tier: 'Sales',
    lines: [
      'Hi! Tyler from Sales! You got straight through because Sales doesn’t have a queue.',
      'I see you’re on hold with Support. Have you considered Premium Support? It’s the same queue, but with a logo.',
      'I’ve booked us a forty-five-minute discovery call for Thursday. Transferring you back to Support!',
    ],
    back: 'Transferred back from Sales. You are now caller number {pos}.',
  },

  // Keypad 3: the AI assistant, which also puts you on hold.
  aiName: 'AI Assistant',
  ai: [
    'Hi! I’m your AI support assistant. I’ve read your issue and I’m confident it’s a caching problem. Please hold.',
    'I’ve summarized your issue for a human agent: “Customer is on hold.” Please hold.',
    'I understand your frustration. I’ve created a ticket about your ticket. Please hold.',
    'As an AI, I can’t escalate. I can, however, empathize at scale. Please hold.',
    'Great news! I found a knowledge base article that matches your issue. It’s this phone call. Please hold.',
  ],

  // Keypad lines. 1 = repeat, 2 = disconnect, 3 = AI, 8 = Sales and 0 = operator are handled by the module.
  keys: {
    4: 'For billing, press 4. Billing is closed. Billing will reopen shortly before your renewal.',
    5: 'Option 5 was removed in our last reorganization. Its duties are now shared by options 6 and 9, who are not speaking.',
    6: 'For SCIM, press 6. SCIM is an add-on. This menu option is also an add-on. Please upgrade.',
    7: 'To report an outage, please visit our status page. It is green. It is always green.',
    9: 'Thank you for choosing our satisfaction survey. On a scale of one to ten, how likely are you to still be on hold tomorrow?',
    '*': 'You pressed star. Your call has been starred. Starred calls are ignored in a special folder.',
    '#': 'Pound key accepted. Your frustration has been logged in our CRM as “engagement.”',
  },
  repeatEmpty: 'There is no message to repeat yet. Please enjoy the silence. It is an Enterprise feature.',
  drop: 'Call dropped. Please call again to lose your place in line.',
  operator: 'You pressed 0 for an operator. Operators are a legacy feature. Moving you to the back of the line: you are now caller number {pos}.',
  noCall: 'Dial tone. Nobody is listening yet. Press “Call vendor support” first.',
  repBusy: '{name} can’t hear the keypad. {name} is reading from a script.',
  invalidKey: 'That is not a valid option. Neither was calling us. Please hold.',

  milestones: [
    { at: 60, text: 'One minute on hold. You have now waited longer than the vendor spent on your security questionnaire.' },
    { at: 180, text: 'Three minutes. Your coffee is cold. Your ticket is colder.' },
    { at: 300, text: 'Five minutes. Studies show this is when admins start humming along. You are humming along.' },
    { at: 600, text: 'Ten minutes. You have earned the “Your Call Is Important” chip. The call remains unimportant.' },
    { at: 900, text: 'Fifteen minutes. The hold music has started to sound like it’s about you.' },
    { at: 1200, text: 'Twenty minutes. At this point, you and the queue are in a committed relationship.' },
    { at: 1800, text: 'Thirty minutes. Blink twice if your identity provider is in the room.' },
    { at: 3600, text: 'One hour. The clinic has flagged you for observation. Please hang up and call someone who loves you.' },
  ],
  chipAt: 600,

  copy: {
    kicker: 'Oktholm General · Vendor Relations Ward',
    callLabel: 'Call vendor support',
    hangupLabel: 'Hang up',
    againLabel: 'Call again',
    lineLabel: 'LINE 1',
    statusReady: 'READY',
    statusDialing: 'DIALING…',
    statusHold: 'ON HOLD',
    statusHoldTier: 'ON HOLD · {tier}',
    statusLive: 'CONNECTED · {tier}',
    statusEnded: 'CALL ENDED',
    holdTime: 'HOLD TIME',
    callerLabel: 'YOU ARE CALLER #',
    waitLabel: 'EST. WAIT',
    nowPlaying: 'NOW PLAYING',
    dialing: 'Dialing 1-800-[REDACTED]…',
    ivrName: 'IVR',
    milestoneName: 'Milestone',
    systemName: 'Line 1',
    repJoined: '{name} ({tier}) has joined the call.',
    youPressed: 'You pressed {key}.',
    queueLog: '{line} You are now caller #{pos}.',
    endedCaption: 'Call ended. Your ticket will be closed due to customer inactivity.',
    newBest: 'New personal best. The clinic is concerned.',
    pbTag: 'NEW PERSONAL BEST',
    soundOn: 'SPKR ON',
    soundOff: 'CAPTIONS ONLY',
    transcriptTitle: 'Live transcript',
    bestLabel: 'Your personal best:',
    bestNone: 'none yet',
    lifetime: 'Lifetime on hold: {time} across {calls} {callsWord}.',
    callWord: 'call',
    callsWord: 'calls',

    summaryKicker: 'Case #{ticket}',
    summaryTitle: 'Call summary',
    statusClosed: 'Status: Closed (customer hung up)',
    statusDropped: 'Status: Closed (customer pressed 2)',
    sumTime: 'Time on hold',
    sumEscalations: 'Times escalated',
    sumTransfers: 'Transfers to Sales and operators',
    sumPosition: 'Final queue position',
    sumAnnouncements: 'Announcements endured',
    sumKeys: 'Buttons pressed',
    sumResolution: 'Resolution',
    resolutionNone: 'none',
    stamp: 'Unresolved',
    csat: 'A satisfaction survey has been sent to /dev/null.',
    bestNote: 'New personal best. Previous record: {prev}.',
    firstNote: 'First call on record. It gets easier. (It does not get easier.)',
    bestSoFar: 'Your personal best is {best}. The clinic recommends not beating it.',
    timesOnce: 'once',
    timesTwice: 'twice',
    timesMany: '{n} times',
    shareTitle: 'File a public complaint',
  },

  share: {
    text: 'I stayed on hold with [REDACTED] support for {time} at the {site} clinic. I’m not okay.',
    escalated: 'I stayed on hold with [REDACTED] support for {time} at the {site} clinic. Escalated {times}. Resolution: none. I’m not okay.',
    quick: 'I lasted {time} on hold with [REDACTED] support at the {site} clinic before hanging up. Honestly? Growth.',
  },

  cta: {
    kicker: 'Prescription',
    title: 'No queue to find out what a login costs',
    facts: ['pricing', 'free'],
    after: 'No hold music required.',
    kind: 'pricing',
    label: 'See the pricing page',
    secondary: { kind: 'trial', label: 'Start free' },
  },
};
