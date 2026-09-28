// Chips: 12-step-style recovery coins. Engagement chips are earned on this device;
// referral chips are awarded by the backend when people you sponsor get diagnosed.
// Modules grant chips with ctx.referral.grantChip(id). Unknown ids still work (shown with a generic icon).
export default [
  { id: 'admitted', name: 'Admitted', icon: '🩺', desc: 'Completed your diagnosis. The first step is admitting you have a vendor.', kind: 'engagement' },
  { id: 'first-shift', name: 'First Shift', icon: '🛂', desc: 'Survived a shift at the Access, Please desk.', kind: 'engagement' },
  { id: 'glory-to-compliance', name: 'Glory to Compliance', icon: '📋', desc: 'Finished a shift with zero audit findings.', kind: 'engagement' },
  { id: 'ceo-denied', name: 'Said No to the CEO', icon: '🙅', desc: 'Denied the CEO’s request. Your spine has been provisioned.', kind: 'engagement' },
  { id: 'clean-offboard', name: 'Clean Break', icon: '🧹', desc: 'Offboarded every one of the leaver’s accounts before they noticed. The office speakers are safe.', kind: 'engagement' },
  { id: 'idle-solved', name: 'IDle Hands', icon: '🔤', desc: 'Solved today’s IDle.', kind: 'engagement' },
  { id: 'idle-streak-3', name: 'Three-Day Streak', icon: '🔥', desc: 'Solved IDle three days running.', kind: 'engagement' },
  { id: 'group-hoarder', name: 'Group Hoarder', icon: '🗂️', desc: 'Created an AD group with a name longer than your tenure.', kind: 'engagement' },
  { id: 'ransom-paid', name: 'Ransom Received', icon: '✂️', desc: 'Generated your renewal ransom note.', kind: 'engagement' },
  { id: 'architect', name: 'Enterprise Architect', icon: '🏗️', desc: 'Built your own Oktholm solution. It has a go-live date of “TBD”.', kind: 'engagement' },
  { id: 'on-hold-10', name: 'Your Call Is Important', icon: '☎️', desc: 'Stayed on hold for ten minutes. Voluntarily.', kind: 'engagement' },
  { id: 'interventionist', name: 'Interventionist', icon: '💌', desc: 'Staged an intervention for someone you love (or sit next to).', kind: 'engagement' },
  { id: 'morse', name: 'Proof of Life', icon: '👁️', desc: 'Decoded the hostage’s blinks.', kind: 'engagement' },
  { id: 'side-effects', name: 'Read the Fine Print', icon: '💊', desc: 'Watched the whole commercial, disclaimers included.', kind: 'engagement' },
  { id: 'spreader', name: 'Patient Zero', icon: '🦠', desc: 'Shared the site. The outbreak thanks you.', kind: 'engagement' },
  { id: 'confessed', name: 'Confessed', icon: '🕯️', desc: 'Shared your story with Group Therapy.', kind: 'engagement' },
  // Referral chips (backend-awarded)
  { id: 'sponsor-1', name: 'Sponsor', icon: '🥉', desc: 'One person you referred got diagnosed.', kind: 'referral' },
  { id: 'sponsor-3', name: 'Interventionist, Licensed', icon: '🥈', desc: 'Three people you referred got diagnosed.', kind: 'referral' },
  { id: 'sponsor-5', name: 'Group Therapist', icon: '🧑‍⚕️', desc: 'Five people you referred got diagnosed.', kind: 'referral' },
  { id: 'sponsor-10', name: 'Chief Recovery Officer', icon: '🥇', desc: 'Ten people you referred got diagnosed.', kind: 'referral' },
  { id: 'sponsor-25', name: 'Cult Leader (Affectionate)', icon: '🏆', desc: 'Twenty-five people you referred got diagnosed.', kind: 'referral' },
];
