// Voice cast. Used by scripts/voices.mjs (ElevenLabs) and by the browser fallback in src/engine/speech.js.
//
//   voiceId  an ElevenLabs voice. Empty until casting: `npm run voices -- cast` designs three previews per
//            role from `design`, a human picks by ear, `npm run voices -- pick role=B` saves it to voices.json.
//   design   a Voice Design prompt. Original voices only: never describe, name or imitate a real person.
//   sample   what the previews read (100+ characters with the other samples).
//   web      the Web Speech family used when a line has no rendered clip ('narrator'|'anchor'|'fast'|'victim').
//   settings ElevenLabs voice_settings (v4 honors stability and similarity_boost).
export default {
  model: 'eleven_v4',
  format: 'mp3_44100_64',

  // Older show code speaks with generic kinds; these map them onto cast roles.
  aliases: { narrator: 'pitchman', fast: 'speedreader', victim: 'hostage' },

  roles: {
    paramedic: {
      label: 'Paramedic',
      web: 'narrator',
      design: 'A paramedic in her late thirties, sandpaper alto, flat Chicago accent, quick and clipped, calm under pressure, a little breathless from running a gurney down a hallway.',
      sample: 'Hey. Hey! Can you hear me? Tap if you can hear me. IT admin, found at their desk defending a renewal quote.',
      settings: { stability: 0.4, similarity_boost: 0.75 },
    },
    doctor: {
      label: 'ER doctor',
      web: 'anchor',
      design: 'A male emergency-room attending in his fifties, gravelly baritone, soft Nigerian-British accent, exhausted deadpan, sighs before he speaks, has seen this a thousand times.',
      sample: 'How long with the provider? Seven years. Oktholm. Get them to Intake. Charging. Three hundred seats. Clear!',
      settings: { stability: 0.45, similarity_boost: 0.75 },
    },
    nurse: {
      label: 'Nurse',
      web: 'narrator',
      design: 'A charge nurse in her forties, brisk and unflappable, faint Southern US warmth, reports facts fast.',
      sample: 'Crashed during the renewal call. Monitor just says contact sales. Pressure is dropping, and so is the discount.',
    },
    patient: {
      label: 'Patient',
      web: 'victim',
      design: 'A tired IT administrator in their thirties, soft androgynous voice, weak and dazed on a stretcher, still loyal to their vendor out of habit.',
      sample: 'We are aligned on outcomes. Did it auto-renew? It is a partnership. They said it was a partnership.',
    },
    pa: {
      label: 'Hospital PA',
      web: 'anchor',
      design: 'An ageless, neutral hospital public-address announcer, General American, serenely bored, very clear diction, sounds like a ceiling speaker in a tiled hallway.',
      sample: 'Code Oktholm, Emergency Department. Paging the owner of Temp do not delete. Your group is blocking the ambulance bay.',
      settings: { stability: 0.7, similarity_boost: 0.8 },
    },
    intake: {
      label: 'Intake (front desk chatbot)',
      web: 'narrator',
      design: 'A deadpan, self-aware front-desk assistant, late twenties, androgynous mid-range voice, soft Pacific Northwest accent, dry comic timing, polite and quietly amused.',
      sample: 'Hi. I’m Intake: the front desk, the chat widget, and after the budget cuts, most of the hospital. I’m not a person, and I’m not IT. You’re IT. Tag.',
      settings: { stability: 0.5, similarity_boost: 0.75 },
    },
    captor: {
      label: 'Your IdP (voice notes)',
      web: 'narrator',
      design: 'A relentlessly upbeat customer-success manager in their thirties, glossy bright voice, California uptalk, sing-song, every sentence ends like a question, a smile you can hear.',
      sample: 'Hiii! Just circling back! Circling back. I love you. Per user, per month, billed annually! Thanks for picking up! Please hold.',
      settings: { stability: 0.35, similarity_boost: 0.75 },
    },
    anchor: {
      label: 'OKTV news anchor',
      web: 'anchor',
      design: 'A polished late-night local news anchor, man in his forties, rich baritone, Mid-Atlantic broadcast accent, grave about absurd things.',
      sample: 'Good evening. Tonight: a renewal quote was opened without supervision in Procurement. Doctors say it was DNS.',
    },
    pitchman: {
      label: 'Pharma-ad narrator',
      web: 'narrator',
      design: 'A pharmaceutical-commercial narrator, woman in her forties, honeyed alto, General American, warm, slow and soft-focus, like a sunlit meadow.',
      sample: 'Do you defend your identity provider at dinner parties? Ask your admin if Yeshidumab is right for you.',
    },
    speedreader: {
      label: 'Side-effects speed reader',
      web: 'fast',
      design: 'A fine-print legal reader, man in his thirties, crisp tenor, neutral American, completely affectless, extremely fast, barely breathing between clauses.',
      sample: 'Side effects may include leaving work at five, audit readiness, and the sudden urge to read your contract. Do not operate heavy renewals.',
      settings: { stability: 0.6, similarity_boost: 0.7 },
    },
    hostage: {
      label: 'Kevin (hostage)',
      web: 'victim',
      design: 'A nervous male IT administrator in his thirties, thin tired tenor, suburban Midwest accent, reading a prepared statement with forced cheer, voice cracking, swallowing between sentences.',
      sample: 'My name is Kevin. I am being treated well. The renewal was fair. I am not blinking in Morse code.',
    },
    // The intervention couch (brands/oktholm/modules/intervention.js).
    linda: {
      label: 'Linda from Finance',
      web: 'narrator',
      design: 'A woman in her fifties from Finance, warm but exacting, faint Boston accent, reads a heartfelt letter like an audit finding.',
      sample: 'We love you. But you approved a three-year renewal without asking Finance, and we need to talk about that.',
    },
    greg: {
      label: 'Greg, the other admin',
      web: 'anchor',
      design: 'A male sysadmin in his forties, low and gruff, laconic, uncomfortable with feelings, clears his throat a lot.',
      sample: 'Buddy. You have fourteen browser tabs open to the vendor status page. That’s not monitoring. That’s a cry for help.',
    },
    mom: {
      label: 'Your mom',
      web: 'victim',
      design: 'A loving, slightly exasperated mother in her sixties, soft Caribbean lilt, gentle and a little theatrical.',
      sample: 'Baby, I raised you to leave a bad relationship. I did not raise you to renew it early for a discount.',
    },
    intern: {
      label: 'The intern (now a director)',
      web: 'fast',
      design: 'A fast-talking young director in their mid-twenties, bright and overconfident, speaks in startup jargon.',
      sample: 'Circling back on your journey here. Love the energy. But the vendor is not your family. Let’s take this offline, forever.',
    },
    interventionist: {
      label: 'Dr. Holm, interventionist',
      web: 'narrator',
      design: 'A calm, professional interventionist in her forties, low and steady, gentle authority, a hint of Swedish accent.',
      sample: 'Everyone here loves you. Each of them has written a letter. When they are finished, you will be asked to make a choice.',
    },
    ivr: {
      label: 'Phone menu',
      web: 'narrator',
      design: 'An automated phone-menu voice, female, pleasant, robotic and over-enunciated, the sound of being on hold forever.',
      sample: 'Your call is important to us. For billing, press one. For more billing, press two. To speak to a human, please renew.',
    },
    trailer: {
      label: 'Trailer narrator',
      web: 'anchor',
      design: 'An epic movie-trailer narrator, man in his sixties, cavernous gravelly bass, American, portentous pauses. An original voice, not an impression of anyone.',
      sample: 'In a world where one identity provider holds six thousand admins hostage. One hospital dares to treat the untreatable.',
    },
  },

  // Produced sound cues (npm run voices -- sfx). kind 'music' uses the music API. Anything frame-synced or
  // state-driven (the ECG, UI blips, game feedback, Morse, hold muzak) stays synthesized in the browser.
  sounds: [
    { id: 'gurney', prompt: 'Gurney racing down a hospital corridor, casters rattling, footsteps, no beeping', seconds: 6 },
    { id: 'doors', prompt: 'Gurney slams through swinging hospital double doors', seconds: 1.5 },
    { id: 'pa-chime', prompt: 'Hospital public address three-tone chime, ceiling speaker, tiled hallway reverb', seconds: 2 },
    { id: 'defib', prompt: 'Defibrillator charging whine then a heavy thump', seconds: 2.5 },
    { id: 'wristband', prompt: 'Thermal label printer chattering, then a crisp paper tear', seconds: 2 },
    { id: 'room-tone', prompt: 'Night-shift emergency room ambience, distant monitors, soft footsteps, no voices', seconds: 20 },
    { id: 'desk-bell', prompt: 'Single brass reception desk bell ding', seconds: 1 },
    { id: 'buzz', prompt: 'Phone buzzes twice on a desk, then once more, needily', seconds: 1.5 },
    { id: 'motif', kind: 'music', prompt: 'Medical-drama sting: three felt-piano notes, warm strings, faintly ominous', seconds: 6 },
    { id: 'oktv-ident', kind: 'music', prompt: '1980s local-news ident, brass stab and timpani', seconds: 4 },
  ],
};
