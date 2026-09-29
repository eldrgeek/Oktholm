// Admission: the landing cold open. Plays on every load of the bare home page, reloads included (never on
// share links, never with reduced motion or Save-Data). Lines are voiced by scripts/voices.mjs; tags in
// [brackets] direct the performance and never appear on screen.
export default {
  // The first beat asks for a tap, which is exactly what browsers need before they allow sound.
  // No tap within timeoutMs: the scene carries on muted, with captions.
  wake: {
    voice: 'paramedic',
    say: '[urgent, close to the ear] Hey. Hey! Can you hear me? Tap if you can hear me.',
    caption: 'Can you hear me? Tap if you can hear me.',
    tapLabel: 'Tap if you can hear me',
    timeoutMs: 5000,
    // Spoken once the tap lands: sound is now unlocked.
    afterTap: { voice: 'paramedic', say: '[relieved, to the doctor] Responsive. Unlike their vendor.', caption: 'Responsive. Unlike their vendor.' },
  },

  // First visit always gets the first scene; each later load (or "Replay admission") rotates through the rest.
  // Optional stage directions per line: `beat` (what the picture does when the line starts: 'ride', 'doctor',
  // 'monitor', 'doors', 'sign'; by default lines 1-5 get them in that order), `monitor` (text on the heart
  // monitor instead of the rate), `ecg` ({ bpm, spike: 'phrase', heart: 'phrase', flat }) and `sign` (the LED
  // sign that replaces the caption).
  scenes: [
    {
      id: 'er',
      lines: [
        { voice: 'paramedic', who: 'Paramedic', say: '[walking fast, slightly breathless] IT admin, found at their desk defending a renewal quote in Slack.' },
        { voice: 'doctor', who: 'Doctor', say: 'How long with the provider?' },
        { voice: 'paramedic', who: 'Paramedic', say: 'Seven years. Three price hikes. Still calls it “our partner.”', ecg: { spike: 'price hikes', heart: 'our partner' } },
        { voice: 'doctor', who: 'Doctor', say: '[sighs] Oktholm. Get them to Intake.' },
        { voice: 'pa', who: 'Overhead', say: '[reverberant hospital PA] Code Oktholm, Emergency Department. Code Oktholm.', sign: 'Code Oktholm · ED' },
      ],
    },
    {
      id: 'bp',
      lines: [
        { voice: 'doctor', who: 'Doctor', say: 'What’ve we got?', beat: 'doctor' },
        { voice: 'paramedic', who: 'Paramedic', say: 'IT admin. BP one-forty over renewal. Won’t let us read the contract.', beat: 'monitor', monitor: 'BP 140/renewal' },
        { voice: 'patient', who: 'Patient', say: '[weakly] We’re… aligned on outcomes.', beat: 'ride' },
        { voice: 'doctor', who: 'Doctor', say: '[sighs] They’re quoting the QBR deck. Get them to Intake.' },
        { voice: 'pa', who: 'Overhead', say: '[reverberant hospital PA] Code Oktholm, Emergency Department.', sign: 'Code Oktholm · ED' },
      ],
    },
    {
      id: 'defib',
      lines: [
        { voice: 'nurse', who: 'Nurse', say: 'Crashed during the renewal call. Monitor just says “Contact Sales.”', monitor: 'Contact Sales', ecg: { flat: true } },
        { voice: 'doctor', who: 'Doctor', say: '[shouting] Charging. Three hundred seats. Clear!', sfx: 'defib', monitor: 'Contact Sales', ecg: { flat: true } },
        { voice: 'patient', who: 'Patient', say: '[gasps] …did it auto-renew?' },
        { voice: 'doctor', who: 'Doctor', say: '[sighs] Oktholm. Get them to Intake.' },
        { voice: 'pa', who: 'Overhead', say: '[reverberant hospital PA] Code Oktholm, Emergency Department.', sign: 'Code Oktholm · ED' },
      ],
    },
  ],

  // Printed on the wristband. The referrer is never named on the page: interventions are anonymous.
  wristband: {
    patient: 'Patient',
    admitted: 'Admitted {time}',
    hospital: 'Oktholm General',
    ward: 'Emergency · Identity Medicine',
    condition: 'Suspected Oktholm Syndrome',
    broughtIn: 'Brought in by a concerned colleague. (Name withheld. We’re a hospital.)',
    selfAdmit: 'Walked in on their own. (Rare. Brave.)',
    allergies: 'Allergies: “Contact Sales”',
  },

  // The title card: a dictionary entry, then brand.site.tagline.
  title: {
    name: 'Oktholm Syndrome',
    headword: 'Ok·tholm Syn·drome',
    pos: 'n.',
    definition: 'When you’ve been held by your identity provider so long, you start defending it.',
    seeAlso: 'See also: loyalty (obsolete).',
  },

  labels: { skip: 'Skip intake', sound: 'Sound on', replay: 'Replay admission', tapHint: 'Best with sound' },

  // Muted runs caption the sound design, in brackets: "[wheels rattling]". Keyed by cue id.
  sounds: {
    gurney: 'wheels rattling',
    steps: 'footsteps',
    monitor: 'monitor beeping faster',
    flatline: 'flatline',
    defib: 'defibrillator whines, then thumps',
    doors: 'doors bang open',
    'pa-chime': 'PA chime',
    wristband: 'label printer chattering',
  },

  // Overhead pages: one per day on the lobby PA strip (voiced by the PA role).
  pages: [
    'Paging the owner of “Temp-DO-NOT-DELETE.” Your group is blocking the ambulance bay.',
    'Would the admin who approved “just give me admin” please report to the front desk. Bring the auditor.',
    'Attention visitors: the SAML certificate in the east wing expires at midnight. Nobody knows who has the key.',
    'Paging Dave from IT. Dave, your accounts are still active. Dave left in 2022.',
    'Code yellow in Procurement: a renewal quote has been opened without supervision.',
    'Reminder: shared passwords are not a form of intimacy. Please return the sticky note to the front desk.',
    'Will the owner of a grey service account, last seen 2019, answering to “svc_temp_final,” please collect it from security.',
    'The cafeteria now accepts single sign-on. Single sign-on costs extra. The cafeteria regrets this.',
    'Attention: visiting hours are over for contractors whose access ended last quarter. Most of them are still here.',
    'Paging Doctor Least Privilege. Doctor Least Privilege to every department, immediately.',
    'The elevator to the Enterprise Plus floor requires a badge, a quote and a three-year commitment.',
    'Group Therapy begins in five minutes in Conference Room B. Conference Room B was double-booked by a calendar integration.',
  ],
};
