// Recognized symptoms. The first six continue the numbering from the original oktholm-syndrome.com.
// `treat` names the sponsor fact (brand.sponsor.facts[key]) that treats it on the Cure page.
export default [
  { code: 'SYMPT-001', severity: 'critical', name: 'Consultant Dependency', desc: 'Needs a consultant, a statement of work and a three-week ramp to change a dropdown.', treat: 'setup' },
  { code: 'SYMPT-004', severity: 'critical', name: 'Compulsive Group Creation', desc: 'Creates a minimum of three new groups per hire. Cannot explain what any of them do. Will not delete any of them.', treat: 'rbac' },
  { code: 'SYMPT-007', severity: 'severe', name: 'Documentation Mirage', desc: 'Searches for help and finds only a 2019 forum thread, a broken video link and a comment section that has been closed “to improve the community experience.”', treat: 'rae' },
  { code: 'SYMPT-008', severity: 'severe', name: 'Renewal Quote Shock', desc: 'Opens a six-figure renewal, then defends it at dinner as “the industry standard.”', treat: 'pricing' },
  { code: 'SYMPT-009', severity: 'moderate', name: 'Terraform Compulsion', desc: 'Writes an entire module to manage a single dropdown, then a second module to manage the first.', treat: 'lifecycle' },
  { code: 'SYMPT-010', severity: 'moderate', name: 'Support Ticket Time Dilation', desc: 'Perceives time slowing to a crawl after filing a vendor ticket. Has aged visibly since “Tier 2 will reach out.”', treat: 'rae' },
  { code: 'SYMPT-011', severity: 'critical', name: 'Phantom Access Syndrome', desc: 'A persistent feeling that ex-employees still have access to something. The feeling is correct.', treat: 'lifecycle' },
  { code: 'SYMPT-012', severity: 'severe', name: 'Spreadsheet Delusion', desc: 'Believes the access spreadsheet is accurate. Names it “ACCESS_FINAL_v7_REAL.xlsx” as a protective ritual.', treat: 'reviews' },
  { code: 'SYMPT-013', severity: 'severe', name: 'Oauthnesia', desc: 'Cannot see the 212 unsanctioned apps connected to the tenant, including the AI note-taker that has read every calendar since March.', treat: 'shadow' },
  { code: 'SYMPT-014', severity: 'moderate', name: 'Admin-For-The-Afternoon Syndrome', desc: 'Grants “temporary” admin rights that outlive the requester’s tenure, the requester’s manager, and the office lease.', treat: 'jit' },
  { code: 'SYMPT-015', severity: 'severe', name: 'Post-Traumatic Audit Disorder', desc: 'Flinches at the word “evidence.” Has 4,000 screenshots in a folder called “SOC2 (do not open).”', treat: 'audit' },
  { code: 'SYMPT-016', severity: 'moderate', name: 'DM-Driven Provisioning', desc: 'Receives access requests via Slack DM, hallway ambush and the phrase “quick question.” Grants them all to make it stop.', treat: 'requests' },
  { code: 'SYMPT-017', severity: 'critical', name: 'SSO Tax Normalization', desc: 'Believes single sign-on is a luxury good and that paying Enterprise prices for a login is “just how it works.”', treat: 'pricing' },
  { code: 'SYMPT-018', severity: 'moderate', name: 'Monday Onboarding Ambush', desc: 'Learns about new hires when they arrive at the desk asking for a laptop, a login and “the Drive.”', treat: 'lifecycle' },
  { code: 'SYMPT-019', severity: 'severe', name: 'Lift-and-Shift Dread', desc: 'Believes getting better requires ripping out every directory the company has. Stays sick to avoid the surgery.', treat: 'directories' },
  { code: 'SYMPT-020', severity: 'moderate', name: 'Rubber-Stamp Reflex', desc: 'Completes quarterly access reviews by selecting all and clicking Approve. Calls this “trust.”', treat: 'reviews' },
];
