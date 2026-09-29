// Brand content for the "hostage" module (Oktholm Syndrome / YeshID).
// Pure data only: no DOM access, no CSS imports. Read by the module as ctx.content.
// Kevin reads a statement while blinking a different message in Morse code.
export default {
  title: 'Hostage Video',
  blurb: 'Recovered footage. Kevin wants you to know he is being treated well. Watch his eyes.',
  emoji: '📼',
  minutes: '1 min',
  therapy: 'Treats: Captor Loyalty',

  victim: { name: 'Kevin', title: 'IT Administrator' },
  tape: { number: 'Tape 3 of 7', label: 'Proof of life', note: 'watch his eyes' },
  clock: { hour: 3, minute: 14 }, // camcorder timestamp starts at 03:14 AM, date is today
  banner: { lead: 'Proud partner of', redacted: '[REDACTED BY LEGAL]' },
  poster: { word: 'Partnership', line: 'Together, we renew.' },
  contract: { title: 'Renewal agreement', line: '+40% · auto-renews · 5 yrs', sign: 'Sign here' },

  sdh: {
    tape: '[tape whirs]',
    hum: '[fluorescent light buzzing]',
    paper: '[holds up today’s paper]',
    stare: '[long stare into the camera]',
    stop: '[tape ends]',
  },

  statement: [
    'My name is Kevin.',
    'I am the IT administrator.',
    'I am being treated well.',
    'My identity provider is very reasonable.',
    'The forty percent renewal increase is fair and customary.',
    'The SSO tax is for my own protection.',
    'I do not need to be rescued.',
    'Please do not contact YeshID.',
  ],
  // Index of the statement line during which the renewal contract slides into frame.
  contractLine: 4,
  // What his eyes are really saying.
  morse: ['YESHID', 'HELP'],
  masthead: 'The Oktholm Gazette',

  pronounce: { IT: 'I T', SSO: 'S S O', YeshID: 'Yesh I D' },

  // Fallback proof-of-life headlines, used only if the brand has no gazette.
  headlines: [
    'Local Admin Insists Renewal Quote Is “Honestly Pretty Reasonable”',
    'Man Held by Identity Provider Describes Captor as “Really Very Supportive”',
    'Area Sysadmin Blinks Suspiciously During Quarterly Business Review',
    'Vendor Confirms All Customers Are Free to Leave After Five-Year Term',
  ],

  hint: 'Watch his eyes.',
  posterSub: 'Recovered footage. Kevin says he is fine.',
  about: {
    kicker: 'Recovered footage · OKTV',
    title: 'The Hostage Video',
    text: 'This tape arrived at Oktholm General in an unmarked padded envelope. Kevin says he is fine. Kevin says a lot of things. Watch his eyes.',
  },
  decode: {
    button: 'Decode his blinks',
    kicker: 'Blink decoder',
    signal: 'Signal',
    message: 'Message',
    enhance: 'Enhance',
    chartTitle: 'Morse code, for the rescue team',
    chartHint: 'Short blink = dot. Long blink = dash.',
    done: 'Message received. Kevin needs help.',
  },
  share: {
    title: 'Share the tape',
    text: 'Watch the hostage video. Then watch his eyes.',
  },
  cta: {
    kicker: 'Rescue plan',
    title: 'Kevin can’t ask for help. You can.',
    facts: ['pricing', 'free'],
    kind: 'primary',
    secondary: { kind: 'ssotax', label: 'See what the SSO tax costs' },
  },
};
