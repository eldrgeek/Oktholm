// The Cure: the plain, honest sponsor page. Every claim is a brand.sponsor.facts entry.

import { el } from '../engine/dom.js';
import { sectionHead } from './common.js';

export function renderCure(root, s) {
  const cure = s.brand.content?.cure || {};
  const sp = s.brand.sponsor || {};
  const facts = sp.facts || {};
  root.append(
    el(
      'div.wrap',
      el(
        'header.page-head.cure-hero',
        el('div', el('div.kicker.kicker--cure', cure.kicker || ''), el('h1.page-title', cure.title || ''), el('p.section__body', cure.body || '')),
        el(
          'div.cure-hero__card',
          el('div.kicker', 'Dosage'),
          (cure.dosage || []).map((x) => el('div.dose', el('span.dose__label', x.label), el('span.dose__value', facts[x.fact] || ''))),
          s.cta.button('primary', sp.ctaLabel || 'Start', { content: 'cure-hero', size: 'lg' }),
          el('div.row', { style: { marginTop: '10px' } }, s.cta.button('demo', 'Book a demo', { content: 'cure-hero', variant: 'ghost', size: 'sm' }), s.cta.button('pricing', 'See pricing', { content: 'cure-hero', variant: 'ghost', size: 'sm' })),
        ),
      ),
      el(
        'section.section',
        sectionHead({ kicker: 'Treatment plan', title: 'Symptom → treatment' }),
        el(
          'div.treatments',
          (cure.treatments || []).filter((t) => facts[t.fact]).map((t) => el('div.treatment', el('div.treatment__symptom', el('span.tag.tag--critical', 'Symptom'), el('span', t.symptom)), el('div.treatment__arrow', '→'), el('div.treatment__fix', el('span.tag.tag--cure', 'Treatment'), el('span', facts[t.fact])))),
        ),
      ),
      el(
        'section.section',
        sectionHead({ kicker: 'Frequently asked, rarely answered elsewhere', title: 'FAQ' }),
        el('div.faq', (cure.faq || []).map((f) => el('details.faq__item', el('summary', f.q), el('p', f.a)))),
      ),
      el(
        'section.section',
        s.cta.card({ kicker: 'Discharge instructions', title: 'Start recovery today', body: `${facts.free || ''} ${facts.trial || ''} ${facts.setup || ''}`, label: sp.ctaLabel, content: 'cure-footer', secondary: { kind: 'ssotax', label: 'See the SSO tax, itemized' } }),
      ),
    ),
  );
}
