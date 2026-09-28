// The Sponsorship Program: referrals framed as 12-step sponsorship. A "sponsee" counts when someone
// who arrived through your link completes their diagnosis (the backend dedupes and credits once per person).
// Physical rewards are PROPOSALS pending sponsor sign-off; the page labels them that way until approved.
export default {
  kicker: 'The Sponsorship Program',
  title: 'Nobody recovers alone.',
  body: 'In recovery, you get a sponsor. At Oktholm General, you become one. Send someone your link or stage an intervention; when they get diagnosed, you earn a chip. Enough chips and we mail you things.',
  honesty: 'Yes, this is a referral program. We’re an identity startup and this is a lead-gen site. At least we’re honest about it, which is more than you can say for your renewal quote.',
  fulfillmentNote: 'Prototype: physical rewards are proposals pending YeshID sign-off. Chips are real (they live in your browser and, once the backend is on, on your sponsor record).',
  howItWorks: [
    { step: '1', title: 'Share your link', body: 'Every share button on this site carries your sponsor code. So does every intervention you stage.' },
    { step: '2', title: 'They get diagnosed', body: 'When someone arrives through your link and finishes triage, they become your sponsee. You both get a chip.' },
    { step: '3', title: 'You climb the ladder', body: 'Chips unlock rewards: stickers, a recovery kit, a hoodie, and at ten sponsees, the Big Red Button.' },
  ],
  tiers: [
    { count: 1, chip: 'sponsor-1', name: 'Sponsor', icon: '🥉', reward: 'Oktholm Survivor sticker pack', detail: 'Six die-cut stickers, including “IT’S ALWAYS DNS (EXCEPT WHEN IT’S IDENTITY)” and a very small ransom note.' },
    { count: 3, chip: 'sponsor-3', name: 'Licensed Interventionist', icon: '🥈', reward: 'The Recovery Kit', detail: 'A hospital wristband with your Patient ID, an enamel pin that says “I SURVIVED THE RENEWAL,” and a get-well card signed by nobody from your vendor.' },
    { count: 5, chip: 'sponsor-5', name: 'Group Therapist', icon: '🧑‍⚕️', reward: 'The hoodie', detail: 'Front: a small ECG line. Back, in large letters: “IT’S NOT YOU. IT’S YOUR IDENTITY PROVIDER.”' },
    { count: 10, chip: 'sponsor-10', name: 'Chief Recovery Officer', icon: '🥇', reward: 'The Big Red Button', detail: 'A USB desk button that triggers an offboarding workflow through a webhook. For real. Please do not press it at your desk. Please do not press it at your manager.' },
    { count: 25, chip: 'sponsor-25', name: 'Cult Leader (Affectionate)', icon: '🏆', reward: 'Your name on the Oktholm General donor wall', detail: 'Plus a varsity jacket and a live call where the YeshID team roasts your identity stack with you, gently, on camera if you want.' },
  ],
  sponseeGift: 'Arrived through someone’s link? You get the “Admitted” chip on diagnosis, and your sponsor gets credit. Everybody wins except your identity provider.',
  // Shown until the leaderboard backend is live. Clearly labeled as sample data on the page.
  sampleLeaderboard: [
    { name: 'OKT-7Q2M-4K', title: 'Chief Recovery Officer', count: 14, city: 'Denver' },
    { name: 'OKT-H3XD-9P', title: 'Group Therapist', count: 9, city: 'Leeds' },
    { name: 'OKT-B8RT-2C', title: 'Group Therapist', count: 6, city: 'Toronto' },
    { name: 'OKT-M5NW-7A', title: 'Licensed Interventionist', count: 4, city: 'Austin' },
    { name: 'OKT-Z9KC-1F', title: 'Licensed Interventionist', count: 3, city: 'Bengaluru' },
  ],
};
