// Arcade index and the generic module page (games, toys and on-demand shows).

import { el } from '../engine/dom.js';
import { getModule, mountModule, moduleMeta, listModules } from '../engine/modules.js';
import { sectionHead, arcadeGrid, moduleCard } from './common.js';

export function renderArcade(root, s) {
  const home = s.brand.content?.home || {};
  root.append(
    el(
      'div.wrap',
      el('header.page-head', el('div.kicker', home.arcade?.kicker || 'Arcade'), el('h1.page-title', home.arcade?.title || 'Arcade'), el('p.section__body', home.arcade?.body || '')),
      el('section.section', { style: { paddingTop: '12px' } }, sectionHead({ kicker: 'Games & generators', title: 'Pick your treatment' }), arcadeGrid(s.brand, ['game', 'toy'])),
      el('section.section', sectionHead({ kicker: 'OKTV on demand', title: 'Shows' }), arcadeGrid(s.brand, 'show')),
    ),
  );
}

export function renderModulePage(root, s, route) {
  const mod = getModule(route.params.id);
  if (!mod || !(route.params.id in (s.brand.modules || {}))) {
    root.append(el('div.wrap.page-head', el('div.kicker.kicker--alarm', 'Error 404'), el('h1.page-title', 'Ward closed'), el('p.dim', 'This game has been moved to the Enterprise Plus tier.'), el('a.btn.btn--vital', { href: '#/arcade', text: 'Back to the arcade' })));
    return;
  }
  const meta = moduleMeta(mod, s.brand);
  const host = el('div');
  const others = listModules(s.brand, ['game', 'toy', 'show']).filter((m) => m.id !== mod.id).slice(0, 3);
  root.append(
    el(
      'div.wrap.module-page',
      el(
        'nav.module-page__crumbs',
        { 'aria-label': 'Breadcrumb' },
        el('a', { href: '#/', text: s.brand.site?.hospital || 'Home' }),
        '›',
        el('a', { href: mod.kind === 'show' ? '#/tv' : '#/arcade', text: mod.kind === 'show' ? s.brand.site?.network || 'TV' : 'Arcade' }),
        '›',
        el('span', `${meta.emoji || ''} ${meta.title}`),
      ),
      host,
      others.length && el('section.module-page__next', sectionHead({ kicker: 'Next appointment', title: 'Keep treating it' }), el('div.arcade-grid', others.map((m) => moduleCard(m, s.brand)))),
    ),
  );
  s.track('module_open', { module: mod.id });
  const opts = { mode: route.mode || (mod.kind === 'show' ? 'page' : undefined), payload: route.payload };
  return mountModule(mod, host, s, opts);
}
