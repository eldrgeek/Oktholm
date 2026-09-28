// Group Therapy: the confession wall. Seeds + (optional) moderated backend submissions.
// Reactions are local-first; the backend aggregates when present.

import { el, disposer } from '../engine/dom.js';
import { seeded, dailyPick } from '../engine/rng.js';
import { sectionHead } from './common.js';

const REACTIONS = [
  { id: 'same', label: 'Same', icon: '🫂' },
  { id: 'oof', label: 'Oof', icon: '🔥' },
  { id: 'dead', label: 'Dead', icon: '💀' },
];

export function renderTherapy(root, s) {
  const d = disposer();
  const store = s.store.scope('therapy');
  const seeds = s.brand.content?.confessions || [];
  const mine = store.get('mine', []);
  const reacted = store.get('reacted', {});
  const featured = dailyPick(seeds, 'confession', s.brand.epoch);

  function card(c, key, { pending = false } = {}) {
    const rng = seeded(key);
    const counts = Object.fromEntries(REACTIONS.map((r) => [r.id, pending ? 0 : rng.int(12, 900)]));
    const btns = REACTIONS.map((r) => {
      const on = reacted[key] === r.id;
      const b = el(`button.react${on ? '.is-on' : ''}`, { type: 'button', 'aria-pressed': String(on) }, el('span', r.icon), el('span.react__n', String(counts[r.id] + (on ? 1 : 0))), el('span.sr-only', r.label));
      b.addEventListener('click', () => {
        if (pending) return;
        const prev = reacted[key];
        reacted[key] = prev === r.id ? undefined : r.id;
        store.set('reacted', reacted);
        s.sfx.click();
        for (const [i, rr] of REACTIONS.entries()) {
          const bb = btns[i];
          const isOn = reacted[key] === rr.id;
          bb.classList.toggle('is-on', isOn);
          bb.setAttribute('aria-pressed', String(isOn));
          bb.querySelector('.react__n').textContent = String(counts[rr.id] + (isOn ? 1 : 0));
        }
        if (reacted[key]) s.api.post('/confession/react', { key, reaction: reacted[key] });
      });
      return b;
    });
    return el(`article.confession${pending ? '.is-pending' : ''}`, el('p.confession__text', `“${c.text}”`), el('div.confession__who', `— ${c.who || 'Anonymous'}`), pending ? el('span.tag.tag--moderate', 'In moderation queue · only you can see this') : el('div.confession__reacts', btns));
  }

  const text = el('textarea.textarea', { maxLength: 280, placeholder: 'I once gave the intern Global Admin “just for the afternoon.”…', 'aria-label': 'Your confession' });
  const who = el('input.input', { maxLength: 60, placeholder: 'Sysadmin · Healthcare · 400 people (optional)', 'aria-label': 'Who you are (optional)' });
  const counter = el('span.faint.mono', { style: { fontSize: '12px' } }, '0/280');
  text.addEventListener('input', () => (counter.textContent = `${text.value.length}/280`));
  const wall = el('div.wall');
  const submit = el('button.btn.btn--amber', { type: 'button', text: 'Confess' });
  submit.addEventListener('click', async () => {
    const t = text.value.trim();
    if (t.length < 12) return s.ui.toast('A little more detail, please. The group is listening.');
    const entry = { text: t, who: who.value.trim() || 'Anonymous', at: Date.now() };
    mine.unshift(entry);
    store.set('mine', mine.slice(0, 20));
    text.value = '';
    counter.textContent = '0/280';
    wall.prepend(card(entry, `mine:${entry.at}`, { pending: true }));
    s.ui.toast('Received. A licensed night-shift admin will review it before it goes on the wall.', { kind: 'good' });
    s.referral.grantChip('confessed');
    s.api.post('/confession', { text: entry.text, who: entry.who, patientId: s.referral.patientId() });
  });

  for (const m of mine) wall.append(card(m, `mine:${m.at}`, { pending: true }));
  seeds.forEach((c, i) => wall.append(card(c, `seed:${i}`)));
  // Approved visitor confessions (backend moderation queue), newest first, above the seeds.
  s.api.get('/confessions').then((res) => {
    if (!root.isConnected || !Array.isArray(res?.items)) return;
    const anchor = wall.querySelector('.confession:not(.is-pending)');
    for (const c of res.items) wall.insertBefore(card(c, `ugc:${c.at}`), anchor);
  });

  root.append(
    el(
      'div.wrap',
      el('header.page-head', el('div.kicker.kicker--amber', 'Group Therapy · Meets nightly at 2 AM'), el('h1.page-title', 'Hi, I’m an admin.'), el('p.section__body', '(“Hi, admin.”) Share your worst identity story. Anonymous by default. Moderated by people who have also given the intern Global Admin.')),
      featured && el('div.featured-confession', el('div.kicker', 'Confession of the day'), el('p', `“${featured.text}”`), el('div.confession__who', `— ${featured.who}`)),
      el(
        'section.section',
        { style: { paddingTop: '28px' } },
        el('div.confess-form.card.card--raised.pad', el('div.kicker', 'Your turn'), el('h2.display', { style: { fontSize: 'clamp(28px,4vw,40px)' } }, 'Confess'), el('div.field', text, el('div.row', { style: { justifyContent: 'space-between' } }, counter)), el('div.field', { style: { marginTop: '10px' } }, who), el('div.row', { style: { marginTop: '12px' } }, submit, el('span.faint', { style: { fontSize: '13px' } }, 'No names, no companies, no screenshots of real tickets.'))),
      ),
      el('section.section', sectionHead({ kicker: 'The wall', title: 'You are not alone' }), wall),
    ),
  );
  return () => d.run();
}
