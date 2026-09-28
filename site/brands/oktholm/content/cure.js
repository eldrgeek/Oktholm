// The Cure: the honest sponsor page. Joke framing, real claims only (brand.sponsor.facts).
export default {
  kicker: 'There is a cure',
  title: 'Treatment is available. It’s called YeshID.',
  body: 'We made a whole hospital to say this, so here it is plainly: YeshID runs onboarding, offboarding, access requests and access reviews for companies on Google Workspace and Microsoft 365. It works alongside the directory you already have. You don’t have to escape to start recovering. (You’ll want to anyway.)',
  // Symptom -> treatment rows. `fact` is a key in brand.sponsor.facts.
  treatments: [
    { symptom: 'Compulsive Group Creation', fact: 'rbac' },
    { symptom: 'Phantom Access Syndrome', fact: 'lifecycle' },
    { symptom: 'DM-Driven Provisioning', fact: 'requests' },
    { symptom: 'Oauthnesia (shadow IT blindness)', fact: 'shadow' },
    { symptom: 'Post-Traumatic Audit Disorder', fact: 'audit' },
    { symptom: 'Rubber-Stamp Reflex', fact: 'reviews' },
    { symptom: 'Admin-For-The-Afternoon Syndrome', fact: 'jit' },
    { symptom: 'Lift-and-Shift Dread', fact: 'directories' },
    { symptom: 'Support Ticket Time Dilation', fact: 'rae' },
    { symptom: 'Consultant Dependency', fact: 'setup' },
    { symptom: 'SSO Tax Normalization', fact: 'pricing' },
  ],
  dosage: [
    { label: 'Teams under 20', fact: 'free' },
    { label: 'Everyone else', fact: 'trial' },
    { label: 'Pricing', fact: 'pricing' },
  ],
  faq: [
    { q: 'Is Oktholm Syndrome real?', a: 'The syndrome is satire. The symptoms are, unfortunately, documentary.' },
    { q: 'Do I have to rip out my identity provider?', a: 'No. YeshID works with Google Workspace and Microsoft 365, and on the Business plan it syncs other directories too, including one whose name legal won’t let us type. Recovery can start with what you have.' },
    { q: 'Who is behind this site?', a: 'YeshID paid for it. The jokes were written by people who have been on hold. This is a lead-generation site, and we would like you to know that, because honesty is the rarest feature in enterprise software.' },
    { q: 'Will you spam me?', a: 'This site has no email capture. You can play everything without giving us anything. We are aware this is bad marketing. It is also the point.' },
  ],
};
