// Brand content for "4096 Groups" (Oktholm Syndrome / YeshID).
// Pure data only: no DOM access, no CSS imports. Read by the module as ctx.content.
//
// Tokens: {dept} / {DEPT} (a tile's department, as-is / upper-case), {old} {new} (reorgs), {groups} {best}
// {rank} {n} {name}. Sponsor claims are never written here: {rbac} and {reviews} come from brand.sponsor.facts.
export default {
  title: '4096 Groups',
  blurb: '2048, except every tile is an Active Directory group and your score is a confession.',
  emoji: '🗂️',
  minutes: '5 min',
  therapy: 'Treats: Compulsive Group Creation Disorder',

  // One department per game (picked by a seeded RNG). Each reorg renames it to the next name in its chain.
  // Tiles keep the department they were created under, and a merge keeps the older (legacy) name.
  // After the last name the chain starts over ("reorgAgainToasts"): every department name comes back eventually.
  departments: [
    { name: 'Sales', reorgs: ['Revenue', 'Go-To-Market', 'RevOps', 'Commercial', 'Sales-2.0'] },
    { name: 'Marketing', reorgs: ['Growth', 'Demand-Gen', 'Brand', 'Growth-Marketing', 'Customer-Acquisition'] },
    { name: 'Eng', reorgs: ['Platform', 'Product-Eng', 'R&D', 'Core-Eng', 'Tech-Org'] },
    { name: 'Finance', reorgs: ['FP&A', 'Strategic-Finance', 'FinOps', 'Accounting', 'Office-of-the-CFO'] },
  ],

  // Group name per tile value, starting at 2.
  ladder: [
    '{dept}', // 2
    '{dept}-All', // 4
    '{dept}-All-v2', // 8
    '{dept}-All-v2-FINAL', // 16
    '{dept}-All-v2-FINAL-DO-NOT-DELETE', // 32
    '{DEPT}-LEGACY-2019-CONTRACTORS-EMEA', // 64
    'zz_old_{dept}_(ask_Dave)', // 128
    'Everyone-Except-Legal', // 256
    'Domain Users (Custom)', // 512
    'Global-Admins-Temp', // 1024
    'Allow-All-Deny-None', // 2048
    'The Group That Contains All Other Groups', // 4096
    'Nested-Loop (Do Not Expand)', // 8192
    'Heat Death of the Directory', // 16384
  ],
  // Group descriptions, same order. Shown the first time a tier appears (from `milestoneFrom`) and on long-press.
  notes: [
    'Created for one project in 2017. The project ended in 2017.',
    'Contains {dept}. Also three people from Legal. Nobody knows why.',
    'v1 was “wrong”. Nobody remembers how.',
    'Final, like the last three.',
    'Nobody knows what happens if you delete it. Nobody will find out.',
    'The contractors left in 2019. The group has tenure now.',
    'Dave left. The group stayed.',
    'Legal asked to be excluded once. Once was enough.',
    'Like Domain Users, but with feelings.',
    '“Temp.” Created three years ago.',
    'Grants everything. The auditor has started typing.',
    'You won. There is nothing left to group.',
    'It contains itself. Expanding it crashes the admin console.',
    'All groups are one group now. Please update the wiki.',
  ],
  milestoneFrom: 32,

  reorgEvery: 15,
  reorgToasts: [
    'Reorg! {old} is now {new}. {old}-All-v2 remains, forever.',
    'Reorg! {old} is now {new}. Nobody told the groups.',
    'Reorg! {old} is now {new}. The old groups were not consulted.',
    'Reorg! {old} is now {new}. HR sent a slide. The directory did not read it.',
    'Reorg! {old} is now {new}. The Slacc channel got renamed. The groups did not.',
    'Reorg! {old} is now {new}. Same people, new slide, more groups.',
    'Reorg! {old} is now {new}. The ticket to rename the old groups is in the backlog. Forever.',
  ],
  // Names that come back around, and the department's original name coming home.
  reorgAgainToasts: [
    'Reorg! {old} is {new} again. Nobody remembers why it changed the first time.',
    'Reorg! {old} is now {new}. Again. The {new}-All group from last time never left.',
  ],
  reorgHomeToasts: [
    'Reorg! Back to {new}. The consultants call it “a return to our roots”.',
    'Reorg! {old} is {new} again. The original {new}-All group never noticed it was gone.',
  ],

  // Satirical diagnosis by groups created.
  ranks: [
    { min: 0, title: 'Group-Curious' },
    { min: 100, title: 'Junior Group Creator' },
    { min: 300, title: 'Senior Sprawl Engineer' },
    { min: 700, title: 'Principal Directory Hoarder' },
    { min: 1500, title: 'Chief Group Officer' },
    { min: 3000, title: 'Distinguished Fellow of Nesting' },
  ],

  copy: {
    kicker: 'Directory services · Department: {dept}',
    scoreLabel: 'Groups created',
    bestLabel: 'Best',
    deptLabel: 'Department',
    formerly: 'formerly {old}',
    reorgLabel: 'Next reorg',
    reorgIn: 'in {n} moves',
    reorgOne: 'next move',
    biggestLabel: 'Biggest group',
    hint: 'Arrow keys, WASD or swipe. Two identical groups merge into one bigger, worse group. Every merge and every new tile counts as a group created.',
    ladderTitle: 'Naming convention (so far)',
    locked: '???',
    undo: 'Undo',
    undoLock: 'Enterprise tier only',
    undoToast: 'Undo is an Enterprise add-on. Please contact sales to find out what one undo costs.',
    restart: 'New directory',
    restartConfirm: 'Wipe it?',
    resign: 'Resign',
    resignConfirm: 'Really?',
    feedStart: 'Directory initialized. Two groups already exist. Nobody knows who made them.',
    feedCreated: '+ Created {name}',
    milestone: 'Created {name}. {note}',
    tier: 'Tier {v} · members: unclear',
    over: 'Directory full',
    overSub: 'No moves left. The directory is full, which has never stopped anyone.',
    resigned: 'Resigned',
    resignedSub: 'You resigned. The groups did not.',
    won: 'You won (technically)',
    wonSub: 'You created The Group That Contains All Other Groups.',
    keepGoing: 'Keep grouping',
    seeReport: 'See the damage',
  },

  results: {
    kicker: 'Group sprawl report',
    title: 'You created {groups} groups.',
    sub: 'Groups anyone can explain: 0.',
    rank: 'Diagnosis: {rank}',
    biggest: 'Biggest group',
    moves: 'Moves',
    reorgs: 'Reorgs survived',
    best: 'Personal best: {groups} groups',
    newBest: 'New personal best.',
    replay: 'New directory',
    shareTitle: 'Share your sprawl',
  },

  share: 'I created {groups} AD groups playing 4096 Groups. Biggest one: “{best}”. Diagnosis: {rank}. Send help:',

  cta: {
    kicker: 'Prescription',
    title: 'With YeshID’s RBAC policies and dynamic groups, you’d have created approximately zero.',
    body: '{rbac} {reviews}',
  },
};
