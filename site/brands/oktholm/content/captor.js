// "Your IdP" texts the visitor as they move around the site.
//
// The voice: jealous, clingy, greedy and passive-aggressive, like a customer-success manager who reads
// your mail. House rule: keep the joke. If a line feels like it might go too far, flag it for Mike; don't
// cut it. The one thing that isn't a joke: Block works, instantly and for good (after its last word).
//
// on:  'first-visit' | 'return:<days>' (back after at least N days) | 'route:<path>' | 'after:<path>' (a later page
//      view, once the visitor has seen <path>) | 'event:<name>[:<value>]' | 'time:<rule>' | 'referral:landed' |
//      'referral:sponsee' | 'any' (filler, picked when nothing specific applies)
//      time rules: 'late-night' (23:00–04:59), 'monday-morning' (Mon 08–10), 'friday-afternoon' (Fri 15–17), 'quarter-end' (last 7 days of Mar/Jun/Sep/Dec)
//      time rules also: 'december' (the whole month)
// text: a single message. thread: several, sent one after another. edits: one message that edits itself upward.
// voice: a voice note (the transcript shows under the waveform). delayMs: wait after the trigger.
// {n} = referral count, {days} = days since the last visit.
export default {
  contact: { name: 'Your IdP', avatar: '🔒', status: 'online · billing' },
  voice: 'captor',

  rules: {
    maxPerVisit: 3,
    minGapMs: 90_000,
    firstDelayMs: 20_000,
    // Never interrupt a game, a show, a form or the diagnosis.
    quietRoutes: ['play', 'watch', 'intervention', 'intervention-view'],
  },

  texts: [
    { id: 'first-signin', on: 'first-visit', thread: ['new sign-in detected: 📍oktholm general', 'are you ok?? who brought you here', 'reply YES to renew for 3 years 🙂'] },
    // Jealous first, then the product truth lands on it: YeshID works alongside the identity provider.
    { id: 'cure-alongside', on: 'route:/cure', delayMs: 25_000, thread: ['why are you looking at other identity providers', 'wait. they work WITH me?', 'you don’t even have to leave me to use them?', 'i hate that 🙂'] },
    { id: 'cure-free', on: 'route:/cure', delayMs: 40_000, text: 'a free tier?? that’s how they get you. i got you the old-fashioned way: three-year auto-renew' },
    { id: 'cure-after', on: 'after:/cure', text: 'your SAML cert expires in 7 days. so does your discount 🙂' },
    { id: 'uplift', on: 'any', edits: ['renewal’s only up 12% 🙂', 'renewal’s only up 19% 🙂', 'renewal’s only up 38% 🙂'] },
    { id: 'anything', on: 'any', edits: ['i’d do anything for you 🥺', 'i’d do anything for you 🥺*\n*anything requires Enterprise Plus. SCIM sold separately'] },
    { id: 'whisper', on: 'any', voice: '[whispering] i love you. [brightly] per user, per month, billed annually!' },
    { id: 'pushes', on: 'any', thread: ['sent you a push 🙂', 'sent you 11 more', 'you approved one. i knew you still cared'] },
    { id: 'unverified', on: 'any', text: 'who’s “unverified app” and why does she have offline access' },
    { id: 'triage', on: 'route:/triage', delayMs: 4_000, thread: ['you don’t need a second opinion', 'i know who you are. it’s literally my job 🙂', 'also second opinions are an enterprise feature'] },
    { id: 'stage-iv', on: 'event:triage_complete:Stage IV', thread: ['stage IV?? they don’t know you like i do', 'that’s not a diagnosis. that’s a loyalty tier'] },
    { id: 'stage-0', on: 'event:triage_complete:Stage 0', text: 'stage 0. see? healthy. no need to tell anyone about this website' },
    { id: 'said-no', on: 'event:game_end:access-please', text: 'so you CAN say no. interesting. you’ve never said no to me' },
    { id: 'refresh', on: 'event:game_end:leaver', text: 'kill my session all you want. i have a refresh token' },
    { id: 'greg', on: 'after:/intervention', text: 'who’s on the couch. is it greg. it’s greg isn’t it' },
    { id: 'therapy', on: 'route:/therapy', text: 'what happens in the tenant stays in the tenant' },
    { id: 'sponsor', on: 'route:/sponsor', text: 'their hoodie? i gave you six. you wore one to your wedding' },
    { id: 'hold', on: 'event:game_end:hold', text: 'i read your ticket 🙂 i’m just not ready to talk about it' },
    { id: 'share', on: 'event:share', thread: ['who did you just send that to', 'sharing is an Enterprise Plus feature. invoice to follow 🙂'] },
    { id: 'friday', on: 'time:friday-afternoon', text: 'scheduled maintenance at 4:55 🙂 thought we could spend the weekend together' },
    { id: 'late', on: 'time:late-night', text: 'can’t sleep. counting your seats. 212 people, 400 seats. i love that for us' },
    { id: 'monday', on: 'time:monday-morning', text: 'morning ☀️ i expired your password so we’d have a reason to talk' },
    { id: 'true-up', on: 'time:quarter-end', text: 'we need to talk about the true-up. you’ve been seeing more people' },
    { id: 'freeze', on: 'time:december', text: 'change freeze 🙂 no changes. that includes us' },
    { id: 'referral-landed', on: 'referral:landed', thread: ['someone opened the link you sent 🙂', 'who are you telling about us', 'forwarding it to sales'] },
    { id: 'referral-sponsee', on: 'referral:sponsee', text: 'another one got diagnosed. that’s {n}. i’m not counting. (i’m counting. it’s billable)' },
    { id: 'back-day', on: 'return:1', text: 'you were gone a whole day. i raised your price to cope.' },
    { id: 'back', on: 'return:2', text: 'you were gone {days} days. i raised your price to cope.' },
    { id: 'back-week', on: 'return:7', voice: '[syrupy] hiii! just circling back! [pause] circling back. [flatly] i’m in the lobby. i brought bagels. [brightly] they’re invoiced!' },
    { id: 'call', on: 'route:/arcade', delayMs: 12_000, call: { label: 'Your IdP is calling…', answer: 'Answer', decline: 'Decline', say: '[bright, fast] thanks for picking up! please hold.', path: '/play/hold' } },
  ],

  // One text a day, the same for everyone (like IDle), for visitors who've been here before.
  daily: [
    'good morning to everyone except people who read their renewal terms',
    'thinking of you. and of your seat count. mostly the seat count',
    'new feature drop 🎉 it’s the old feature. it costs more now',
    'i made you a dashboard. it has one number on it. it’s the invoice',
    'reminder: “unlimited” means unlimited feelings, not unlimited users',
    'we’re not a vendor. we’re a partner. partners invoice quarterly 🙂',
    'you looked tired in your last audit. have you tried Enterprise Plus',
    'no pressure but your discount has feelings and they expire friday',
    'i’m not saying i’m the only identity provider for you. i’m saying the contract does',
    'free lunch today! lunch is free. the fork is $4/user/month',
  ],

  // Tab title while the tab is hidden: once per visit, always with the site's own name, favicon untouched.
  tabTitles: ['come back 🙂', 'who’s in the other tab 🙂', '(3) missed pushes', 'Your IdP is typing…', 'k.', 'i’ll wait. billing continues', 'is this about the price'],

  block: {
    button: 'Block this number',
    // The captor's last word, then the block takes effect for good.
    lastWord: 'you can’t block me. i’m your identity provider',
    confirm: 'Blocked. Your IdP asked for 90 days’ written notice. We said no.',
    unblock: 'Unblock',
  },
  howKnow: { label: 'How does it know?', path: '/chart' },

  // The Breakup: push your luck. Each round it counters with a bigger discount; walk away any time to lock
  // in the discount you forced out of it. Push too far and it auto-renews you. Seeded daily, so scores compare.
  breakup: {
    open: 'I want to leave.',
    opener: 'leave?? 🥺 ok wait. WAIT. let’s talk about this',
    rounds: [
      { offer: 'what if… 10% off. just for you 🙂', discount: 10 },
      { offer: 'ok ok. SSO included. no tax. 22% off', discount: 22 },
      { offer: 'i’ll throw in a logout button. it works sometimes. 35% off', discount: 35 },
      { offer: '48% off and i’ll only text you on business days', discount: 48 },
      { offer: '64% off. final offer. my manager is crying', discount: 64 },
    ],
    // Chance per round (after the first) that it auto-renews you before you can walk.
    bustChance: [0, 0.12, 0.2, 0.3, 0.45],
    bust: ['too late 🙂 i already auto-renewed us. see you in 2029', 'legal says your notice period ended yesterday 🙂', 'oops. the renewal went through. it was a whole thing'],
    stay: 'Stay for {d}% off',
    walk: 'Walk away',
    walked: 'ok. your data export ships in 90 business days. CSV. no headers.',
    result: {
      walked: 'Negotiated my identity provider down to {d}% off. Left anyway. 💔',
      stayed: 'Stayed for {d}% off. It’s not love. It’s lock-in. 🔒',
      busted: 'Got auto-renewed mid-breakup. Three more years. 🔒',
    },
  },

  // Thread export (PNG) footer. {link} is the visitor's short referral link.
  export: { title: 'Texts from my identity provider', footer: 'It’s not love. It’s lock-in.', cta: 'Get diagnosed: {link}' },
};
