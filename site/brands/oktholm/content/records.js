// #/chart (your medical records: everything this site stores, and every request it made) and the
// #/break-glass joke page that robots.txt points at.
export default {
  chart: {
    kicker: 'Records request · processed instantly',
    title: 'Your medical records',
    lede: 'Everything this site knows about you, in full. It fits on one screen. Your identity provider would need 30 business days and a notarized form.',
    howKnow: 'How does “Your IdP” know what you’re doing? This page tells it. The texts react to what you click on this site, in this browser. Nothing leaves it except the requests listed below.',
    threadLabel: 'Read your texts from Your IdP',
    sends: [
      'Your Patient ID and who referred you, so your sponsor gets credit when you get diagnosed.',
      'Anonymous counters (“someone tapped I’m fine”), counted once per Patient ID per day.',
      'Confessions, if you submit one. They’re moderated before anyone sees them.',
    ],
    never: 'No names. No emails. No cookies. No ad trackers. The server keeps a salted hash of your IP for rate limits, never the address itself.',
    storageTitle: 'Stored in this browser',
    requestsTitle: 'Requests this visit',
    noRequests: 'None yet. This page is a file on a server; it only calls home when you do something that counts.',
    discharge: 'Discharge against medical advice',
    dischargeBody: 'Deletes everything above from this browser and issues you a new Patient ID. Referral credit already earned by the person who sent you stays with them.',
    dischargeConfirm: 'Discharge now',
    discharged: 'Processed instantly. Your vendor would need 30 business days.',
  },
  breakGlass: {
    kicker: 'Staff only · in case of emergency',
    title: 'Break glass',
    lede: 'The emergency admin account. Every hospital has one. Ours is in a glass box on the wall, as recommended.',
    envelope: 'Envelope inside the box: “Password: ask Dave.”',
    dave: 'Dave left in 2022. His account did not.',
    cta: 'Offboard Dave properly',
  },
};
