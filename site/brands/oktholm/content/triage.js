// Triage: the two-minute diagnosis. Each answer scores 0–3 and nudges a subtype (persona) trait.
// Total score -> stage. Highest trait -> subtype. Both drive the certificate and the share text.
export default {
  intro: {
    kicker: 'Triage · Intake form OKT-12',
    title: 'Let’s find out how bad it is.',
    body: 'Twelve questions. No login. No “contact sales.” Answer honestly — your identity provider can’t see this page. (We checked. Twice.)',
    start: 'Begin intake',
  },
  questions: [
    {
      q: 'A new hire starts Monday. When does IT find out?',
      a: [
        { t: 'Two weeks before, via an automated HR workflow', s: 0 },
        { t: 'The Friday before, via Slack DM: “quick heads up 🙏”', s: 1, trait: 'ticket' },
        { t: 'Monday, when they appear at my desk holding a backpack', s: 2, trait: 'accidental' },
        { t: 'Three weeks later, when they ask why they can’t log in', s: 3, trait: 'ticket' },
      ],
    },
    {
      q: 'Roughly how many groups does your directory have per employee?',
      a: [
        { t: 'Fewer than one. Groups follow roles.', s: 0 },
        { t: 'About three. It’s fine. It’s fine.', s: 1, trait: 'groups' },
        { t: 'I stopped counting at “Marketing-All-v2-FINAL”', s: 2, trait: 'groups' },
        { t: 'The groups have groups', s: 3, trait: 'groups' },
      ],
    },
    {
      q: 'Someone left the company last week. What do they still have access to?',
      a: [
        { t: 'Nothing. Verified, logged, done.', s: 0 },
        { t: 'Probably a couple of SaaS apps', s: 1, trait: 'spreadsheet' },
        { t: 'I’ll find out when their seat shows up on an invoice', s: 2, trait: 'shadow' },
        { t: 'They still post in #general', s: 3, trait: 'spreadsheet' },
      ],
    },
    {
      q: 'Your identity provider’s renewal quote arrives. Your first reaction:',
      a: [
        { t: 'Open three competitor tabs and negotiate', s: 0 },
        { t: 'Nervous laughter', s: 1, trait: 'renewal' },
        { t: 'Sign it. Switching would be worse.', s: 2, trait: 'renewal' },
        { t: '“It’s the industry standard.”', s: 3, trait: 'renewal' },
      ],
    },
    {
      q: 'Where is the source of truth for who has access to what?',
      a: [
        { t: 'A system that updates itself', s: 0 },
        { t: 'A spreadsheet', s: 2, trait: 'spreadsheet' },
        { t: 'Several spreadsheets that disagree', s: 3, trait: 'spreadsheet' },
        { t: 'Dave', s: 3, trait: 'accidental' },
      ],
    },
    {
      q: 'How do you change a dropdown value in your identity tool?',
      a: [
        { t: 'Click it', s: 0 },
        { t: 'Open a ticket with the vendor', s: 2, trait: 'ticket' },
        { t: 'Write a Terraform module', s: 3, trait: 'terraform' },
        { t: 'Call the consultant', s: 3, trait: 'consultant' },
      ],
    },
    {
      q: 'The last time you contacted vendor support:',
      a: [
        { t: 'Resolved the same day by a human', s: 0 },
        { t: 'They sent a link to a forum post from 2019', s: 2, trait: 'ticket' },
        { t: 'I’m still on hold. I’m on hold right now.', s: 3, trait: 'ticket' },
        { t: 'Support was a separate SKU', s: 2, trait: 'renewal' },
      ],
    },
    {
      q: 'Someone asks, “Can I get admin real quick?” You:',
      a: [
        { t: 'Grant time-boxed access with an approval trail', s: 0 },
        { t: 'Grant it and set a reminder to revoke it that you will snooze forever', s: 2, trait: 'spreadsheet' },
        { t: 'Grant it permanently. It’s easier. Everyone is admin.', s: 3, trait: 'groups' },
        { t: 'Ask them to file a ticket, which you will also ignore', s: 1, trait: 'ticket' },
      ],
    },
    {
      q: 'The auditor arrives next week. Your preparation:',
      a: [
        { t: 'Export the report', s: 0 },
        { t: 'A long weekend of screenshots', s: 2, trait: 'spreadsheet' },
        { t: 'An access review where every row says “Approved”', s: 3, trait: 'spreadsheet' },
        { t: 'Hire a consultant to take the screenshots', s: 3, trait: 'consultant' },
      ],
    },
    {
      q: 'How many unsanctioned apps are connected to your Google or Microsoft tenant?',
      a: [
        { t: 'I know exactly. Here’s the list.', s: 0 },
        { t: 'A few', s: 1, trait: 'shadow' },
        { t: 'I’m afraid to look', s: 2, trait: 'shadow' },
        { t: 'What’s an OAuth scope?', s: 3, trait: 'accidental' },
      ],
    },
    {
      q: 'Describe your relationship with your identity provider.',
      a: [
        { t: 'Professional', s: 0 },
        { t: 'It’s complicated', s: 1, trait: 'renewal' },
        { t: 'It hurts me, but it has always been there for me', s: 3, trait: 'renewal' },
        { t: 'I don’t have one. I have a folder of passwords.', s: 3, trait: 'accidental' },
      ],
    },
    {
      q: 'What does “SSO tax” mean to you?',
      a: [
        { t: 'Something I have never paid', s: 0 },
        { t: 'A line item I have learned not to look at', s: 2, trait: 'renewal' },
        { t: 'The reason we’re on the Enterprise plan', s: 3, trait: 'renewal' },
        { t: 'A trauma', s: 3, trait: 'terraform' },
      ],
    },
  ],

  // Inclusive score floors, highest first. Max score is 36.
  stages: [
    { min: 28, stage: 'Stage IV', name: 'Terminal Loyalty', color: 'critical', prognosis: 'You have begun defending your captor to strangers on the internet. Immediate intervention recommended. Do not operate heavy renewals.' },
    { min: 19, stage: 'Stage III', name: 'Severe Oktholm Syndrome', color: 'critical', prognosis: 'Significant emotional attachment to a tool you actively resent. Your coping mechanisms have coping mechanisms.' },
    { min: 11, stage: 'Stage II', name: 'Moderate Oktholm Syndrome', color: 'severe', prognosis: 'The rationalizations have started. You have said “it’s fine” about at least one thing that is not fine.' },
    { min: 5, stage: 'Stage I', name: 'Early Symptoms', color: 'moderate', prognosis: 'Caught early. With rest, fluids and a directory that updates itself, full recovery is expected.' },
    { min: 0, stage: 'Stage 0', name: 'Suspiciously Healthy', color: 'vital', prognosis: 'Either you have a great setup or you are the identity provider. Please confirm you are a human admin.' },
  ],

  // Subtypes. `treat` lists sponsor fact keys for the prescription.
  subtypes: {
    groups: { name: 'The Group Hoarder', emoji: '🗂️', blurb: 'You have never met a group you could delete. Your directory looks like a junk drawer that achieved SOC 2.', treat: ['rbac', 'reviews'] },
    spreadsheet: { name: 'The Spreadsheet Sorcerer', emoji: '📊', blurb: 'Your source of truth has tabs, macros and a color-coding system only you understand. It is wrong in ways that are load-bearing.', treat: ['reviews', 'lifecycle'] },
    ticket: { name: 'The Ticket Martyr', emoji: '🎫', blurb: 'You live in the queue. You have been on hold so long the hold music knows you by name.', treat: ['requests', 'rae'] },
    renewal: { name: 'The Renewal Apologist', emoji: '💸', blurb: 'You have explained the SSO tax to your own family as if it were weather. Your vendor sends you a holiday card. You keep it.', treat: ['pricing', 'directories'] },
    terraform: { name: 'The Terraform Monk', emoji: '🧘', blurb: 'You have achieved infrastructure-as-code enlightenment for a problem that is one dropdown. Your plan output is longer than your lease.', treat: ['lifecycle', 'setup'] },
    consultant: { name: 'The Consultant Whisperer', emoji: '🧳', blurb: 'You speak fluent statement-of-work. Your identity stack has more outside advisors than a startup board.', treat: ['setup', 'rae'] },
    shadow: { name: 'The Shadow Gardener', emoji: '🌘', blurb: 'Somewhere in your tenant, an AI note-taker is reading every calendar. You suspect this. You have chosen peace.', treat: ['shadow', 'requests'] },
    accidental: { name: 'The Accidental Admin', emoji: '🪑', blurb: 'You became IT because you sat closest to the router. You have been promoted to “the person who knows the Wi-Fi password.”', treat: ['free', 'lifecycle'] },
  },

  // Fallback subtype when there is no strong trait (low scores).
  defaultSubtype: 'accidental',
  shareTemplate: 'I was just diagnosed with {stageName} ({stage}), subtype “{subtype}.” {emoji} Turns out it’s not loyalty. It’s Oktholm Syndrome. Get screened:',
};
