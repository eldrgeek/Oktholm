// Easter eggs for the people who look: the Konami code and a note in the browser console. Copy lives in
// brand.content.home.eggs.

import { el } from '../engine/dom.js';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function mountEggs(s) {
  const eggs = s.brand.content?.home?.eggs || {};
  let i = 0;
  const onKey = (e) => {
    const k = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0;
    if (i < KONAMI.length) return;
    i = 0;
    const note = el('div.egg-stamp', { role: 'status' }, el('span.stamp', eggs.konami || 'Approved'));
    document.body.append(note);
    s.sfx.stamp();
    s.referral.grantChip('konami');
    s.track('egg', { id: 'konami' });
    setTimeout(() => note.remove(), 2600);
  };
  addEventListener('keydown', onKey);
  try {
    const [big, ...rest] = eggs.console || [];
    if (big) console.log(`%c${big}`, 'font: 800 44px system-ui, sans-serif; color: #ff4757');
    for (const line of rest) console.log(`%c${line}`, 'font: 15px system-ui, sans-serif; color: #36f59a');
  } catch {
    /* consoles can be absent */
  }
  return () => removeEventListener('keydown', onKey);
}
