// Brand pack: Oktholm Syndrome, sponsored by YeshID.
// Everything brand-specific lives under brands/<id>/. The engine in src/ never names a brand.
// Pure data only (no DOM, no CSS imports) so build.mjs can import it in Node for <head> metadata.

import accessPlease from './modules/access-please.js';
import leaver from './modules/leaver.js';
import idle from './modules/idle.js';
import groups from './modules/groups.js';
import ransom from './modules/ransom.js';
import solutionBuilder from './modules/solution-builder.js';
import commercial from './modules/commercial.js';
import hostage from './modules/hostage.js';
import intervention from './modules/intervention.js';
import news from './modules/news.js';
import hold from './modules/hold.js';
import content from './content/index.js';
import cast from './cast.js';

export default {
  id: 'oktholm',
  cast,
  // Day 1 of the daily rotation (IDle #1, Gazette #1, Daily Shift #1).
  epoch: '2026-09-01',

  site: {
    name: 'Oktholm Syndrome',
    title: 'Oktholm Syndrome — It’s not love. It’s lock-in.',
    // The main line (hero, certificate, social card) and the sign-off (end cards, merch).
    tagline: ['That’s not loyalty.', 'That’s Oktholm Syndrome.'],
    signoff: 'It’s not love. It’s lock-in.',
    // An HTML comment for people who open view-source.
    sourceNote: 'You opened view-source on a hospital. That’s Stage II. Try the console next. (No, there’s nothing hidden here. Not everything is a vendor.)',
    description:
      'A public health emergency for IT admins held captive by their identity tools. Get diagnosed, play the games, stage an intervention for a coworker. Sponsored by YeshID.',
    url: 'https://www.oktholm-syndrome.com/',
    ogImage: 'https://www.oktholm-syndrome.com/og.png',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wdth,wght@75,800&family=DotGothic16&family=IBM+Plex+Mono:wght@400;600;700&family=Permanent+Marker&family=Plus+Jakarta+Sans:wght@400;600;800&family=Special+Elite&display=swap',
    hospital: 'Oktholm General',
    network: 'OKTV',
    condition: 'Oktholm Syndrome',
    // The vendor is never named. Legal has asked us to stop asking.
    captor: 'your identity provider',
  },

  // The real company paying for all this. Claims below are limited to what yeshid.com and
  // yeshid.com/pricing state publicly (checked 2026-09-28). Do not add numbers they don't publish.
  sponsor: {
    name: 'YeshID',
    url: 'https://www.yeshid.com/',
    links: {
      primary: 'https://app.yeshid.com/signup',
      trial: 'https://app.yeshid.com/signup',
      demo: 'https://www.yeshid.com/request-demo',
      pricing: 'https://www.yeshid.com/pricing',
      ssotax: 'https://ssotax.yeshid.com/',
      roi: 'https://roi.yeshid.com/',
    },
    ctaLabel: 'Start treatment — free under 20 users',
    tagline: 'Know it. Control it. Prove it.',
    facts: {
      free: 'Free for teams under 20 users.',
      trial: '14-day free trial on paid plans.',
      pricing: 'Prices are on a public web page. No “contact sales” to find out what a login costs.',
      lifecycle: 'Onboarding and offboarding automated with lifecycle workflows.',
      requests: 'Access requests in Slack or Teams, with audit-ready logs.',
      shadow: 'Visibility into shadow IT and the OAuth apps nobody approved.',
      reviews: 'Access reviews and identity governance you can hand to an auditor.',
      rbac: 'RBAC policies with static and dynamic groups instead of group sprawl.',
      // YeshID's pricing page names a directory vendor on the Business plan. This site never names it.
      directories: 'Works with Google Workspace and Microsoft 365, and on the Business plan syncs other directories too, including one legal won’t let us name.',
      rae: 'Rae, YeshID’s AI for IAM, watches for policy drift and does the routine work.',
      audit: 'Audit-ready logs for SOC 2, ISO and SOX.',
      jit: 'Just-in-time access, so “admin for the afternoon” actually ends in the afternoon.',
      // From YeshID's own campaign copy on the current oktholm-syndrome.com ("Days-to-value implementation timeline").
      setup: 'Up and running in days, not a nine-month rollout.',
    },
  },

  referral: { prefix: 'OKT' },
  utm: { campaign: 'oktholm-2', source: 'oktholm-syndrome' },
  api: { base: '/api' },

  // CSS variable overrides for this brand.
  theme: {
    '--cure': '#4263eb',
    '--cure-2': '#6b86ff',
  },

  content,

  // Enabled modules, in display order. Values are each module's brand content (ctx.content).
  modules: {
    'access-please': accessPlease,
    leaver,
    'solution-builder': solutionBuilder,
    idle,
    ransom,
    groups,
    hold,
    intervention,
    commercial,
    hostage,
    news,
  },
};
