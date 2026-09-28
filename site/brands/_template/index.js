// Brand pack template. Copy with:  npm run new-brand -- <brand-id>
// Rules of the genre:
//   - Never name the competitor you're parodying. The syndrome's name does the work.
//   - Satire about the *condition* is fine; claims about the sponsor must be true and public.
//   - Every module works with empty content (it falls back to its own defaults), so start small.
import content from './content/index.js';

export default {
  id: '__BRAND_ID__',
  epoch: '__EPOCH__', // day 1 of the daily rotation (YYYY-MM-DD)

  site: {
    name: 'Example Syndrome',
    title: 'Example Syndrome — It’s not you. It’s your tooling.',
    description: 'A public health emergency for people held captive by their tools. Get diagnosed, play, stage an intervention.',
    url: 'https://example.com/',
    ogImage: 'https://example.com/og.png',
    fontsHref: 'https://fonts.googleapis.com/css2?family=Anton&family=DotGothic16&family=IBM+Plex+Mono:wght@400;600;700&family=Permanent+Marker&family=Plus+Jakarta+Sans:wght@400;600;800&family=Special+Elite&display=swap',
    hospital: 'Example General',
    network: 'EXTV',
    condition: 'Example Syndrome',
    captor: 'your current tool',
  },

  // Only public, verifiable claims. Every CTA, Rx card and "Cure" row reads from here.
  sponsor: {
    name: 'SponsorCo',
    url: 'https://sponsor.example/',
    links: {
      primary: 'https://sponsor.example/signup',
      trial: 'https://sponsor.example/signup',
      demo: 'https://sponsor.example/demo',
      pricing: 'https://sponsor.example/pricing',
    },
    ctaLabel: 'Start treatment',
    facts: {
      free: 'Free for small teams.',
      trial: 'Free trial on paid plans.',
      pricing: 'Prices are on a public web page.',
    },
  },

  referral: { prefix: 'EXM' }, // 2–5 capital letters; Patient IDs look like EXM-7F3K-2Q
  utm: { campaign: '__BRAND_ID__', source: '__BRAND_ID__' },
  api: { base: '/api' },
  theme: { '--cure': '#4263eb', '--cure-2': '#6b86ff' },

  content,

  // Enabled modules in display order. Values are module content (see brands/oktholm/modules/*.js for the shape).
  modules: {
    'access-please': {},
    leaver: {},
    'solution-builder': {},
    idle: {},
    ransom: {},
    groups: {},
    hold: {},
    intervention: {},
    commercial: {},
    hostage: {},
    news: {},
  },
};
