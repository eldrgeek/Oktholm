// DSM-IT-5 encyclopedia. /dsm/:code opens and scrolls to an entry; each entry is shareable.

import { el } from '../engine/dom.js';

export function renderDsm(root, s, route) {
  const dsm = s.brand.content?.dsm || { entries: [] };
  const facts = s.brand.sponsor?.facts || {};
  const want = route?.params?.code ? decodeURIComponent(route.params.code) : null;
  const filter = el('input.input', { type: 'search', placeholder: 'Search disorders, symptoms, codes…', 'aria-label': 'Search the DSM-IT' });
  const list = el('div.dsm__list');

  const items = dsm.entries.map((e) => {
    const details = el(
      'details.dsm-entry',
      { open: want === e.code, id: `dsm-${e.code}` },
      el('summary', el('span.dsm-entry__code', e.code), el('span.dsm-entry__name', e.name), el('span.dsm-entry__aka', e.aka)),
      el(
        'div.dsm-entry__body',
        el('p', el('b', 'Prevalence. '), e.prevalence),
        el('div.dsm-entry__label', 'Diagnostic criteria'),
        el('ul', e.symptoms.map((x) => el('li', x))),
        el('p', el('b', 'Etiology. '), e.etiology),
        el('p', el('b', 'Differential. '), e.differential),
        e.comorbid?.length && el('p.dim', el('b', 'Commonly co-occurs with: '), e.comorbid.join(', ')),
        facts[e.treat] && el('div.dsm-entry__treat', el('span.kicker.kicker--cure', 'Treatment'), el('p', facts[e.treat])),
        el(
          'div.row',
          el('button.btn.btn--ghost.btn--sm', {
            type: 'button',
            text: 'I have this',
            onclick: async () => {
              const text = `Self-diagnosed with ${e.code} ${e.name} (DSM-IT-5). ${e.symptoms[0]}. Send help. Or budget.`;
              const url = s.share.url({}, { platform: 'dsm', hash: `/dsm/${e.code}` });
              const ok = await s.share.copy(`${text}\n${url}`);
              s.referral.recordShare('copy', 'dsm');
              s.ui.toast(ok ? 'Copied your self-diagnosis. Paste it into #it-team.' : 'Copy failed.');
            },
          }),
          el('a.btn.btn--sm.btn--vital', { href: '#/triage', text: 'Get a real (fake) diagnosis' }),
        ),
      ),
    );
    return { e, details, hay: [e.code, e.name, e.aka, e.prevalence, ...e.symptoms, e.etiology].join(' ').toLowerCase() };
  });
  items.forEach((i) => list.append(i.details));
  filter.addEventListener('input', () => {
    const qv = filter.value.trim().toLowerCase();
    for (const i of items) i.details.hidden = Boolean(qv) && !i.hay.includes(qv);
  });

  root.append(
    el(
      'div.wrap',
      el('header.page-head', el('div.kicker', dsm.subtitle), el('h1.page-title', dsm.title), el('p.section__body', dsm.intro)),
      el('div.dsm', el('div.dsm__search', filter, el('span.faint.mono', { style: { fontSize: '12px' } }, `${dsm.entries.length} disorders · peer-reviewed at 2 AM`)), list),
    ),
  );
  if (want) requestAnimationFrame(() => document.getElementById(`dsm-${want}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
}
