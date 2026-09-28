// 404, clinic-style.
import { el } from '../engine/dom.js';

export function renderNotFound(root, s) {
  const req = el('button.btn.btn--vital', { type: 'button', text: 'Request access' });
  req.addEventListener('click', () =>
    s.ui.modal({
      title: 'Request submitted',
      body: 'Ticket #' + Math.floor(100000 + Math.random() * 899999) + ' has been created. Estimated response time: four business quarters. You will receive an automated survey about your satisfaction before anyone reads it.',
      actions: [{ label: 'Go back to the lobby', kind: 'vital', onClick: () => s.router.navigate('/') }],
    }),
  );
  root.append(
    el(
      'div.wrap.page-head',
      el('div.kicker.kicker--alarm', 'Error 404 · Access denied'),
      el('h1.page-title', 'This page requires Enterprise Plus.'),
      el('p.section__body', 'The page you requested exists, probably, but your current plan does not include the ability to see it. Please contact your account executive, who is on vacation.'),
      el('div.row', { style: { marginTop: '18px' } }, req, el('a.btn.btn--ghost', { href: '#/', text: 'Lobby' })),
    ),
  );
}
