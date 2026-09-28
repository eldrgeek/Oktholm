// DOM builders for the desk: the request ticket and the tabbed reference binder.
// Everything user-visible comes from content (C.copy) and is inserted as text, never as HTML.

import { fmt, personName, deptLabel } from './logic.js';

export const TABS = ['hr', 'org', 'policy', 'apps'];

/** Bottom edge of whatever fixed/sticky bar covers the top of the viewport (site top bar, dev harness bar). */
export function topInset() {
  if (typeof document === 'undefined' || !document.elementsFromPoint) return 0;
  let bottom = 0;
  for (const n of document.elementsFromPoint(Math.round(window.innerWidth / 2), 2)) {
    for (let e = n; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
      const pos = getComputedStyle(e).position;
      if (pos === 'fixed' || pos === 'sticky') {
        const r = e.getBoundingClientRect();
        if (r.top <= 2 && r.bottom < window.innerHeight / 2) bottom = Math.max(bottom, r.bottom);
        break;
      }
    }
  }
  return bottom;
}

/** If `node` is hidden above the viewport (or under a sticky header), scroll it back into view. */
export function revealTop(node, { smooth = false, pad = 12 } = {}) {
  if (!node?.getBoundingClientRect) return;
  const inset = topInset() + pad;
  const top = node.getBoundingClientRect().top;
  if (top < inset) window.scrollBy({ top: top - inset, behavior: smooth ? 'smooth' : 'auto' });
}

/** Sanity meter: ten little bars. */
export function pips(el, n, max = 10) {
  return el('span.ap-pips', { role: 'img', 'aria-label': `${n}/${max}` }, Array.from({ length: max }, (_, i) => el(i < n ? 'i.is-on' : 'i')));
}

export function statusText(C, p) {
  return fmt(C.copy.status?.[p.status] || p.status, { until: p.until || '' });
}

export function renderTicket({ el, req, C, data, onLookup }) {
  const t = C.copy;
  const p = req.person;
  const link = (content, kind, id, cls = '') =>
    el(`button.ap-link${cls}`, { type: 'button', onclick: () => onLookup(kind, id) }, content);
  const approver =
    req.approver.kind === 'person'
      ? link(el('span.ap-sig', personName(data, req.approver.id)), 'approver', req.approver.id, '.ap-link--sig')
      : el('span.ap-fake', req.approver.text);
  const showCurrent = Boolean((req.existing && req.existing.length) || req.app.sod);
  const field = (k, v) => el('div.ap-field', el('dt', k), el('dd', v));
  return el(
    'article.ap-ticket.paper',
    { 'aria-label': `${t.formTitle} ${req.no}` },
    el(
      'header.ap-ticket__band',
      el('div', el('div.ap-ticket__title', t.formTitle), el('div.ap-ticket__code', t.formCode)),
      el('div.ap-ticket__no', el('span.ap-barcode', { 'aria-hidden': 'true' }), el('span', req.no)),
    ),
    el(
      'div.ap-ticket__who',
      el('div.ap-avatar', { 'aria-hidden': 'true' }, p.avatar || '🙂'),
      el(
        'div.ap-ticket__id',
        link(p.name, 'person', p.id, '.ap-link--name'),
        el('div.ap-ticket__meta', `${req.claimed.title} · ${req.claimed.dept} `, el('span.ap-self', `(${t.selfReported})`)),
      ),
    ),
    el(
      'dl.ap-fields',
      field(t.app, link(`${req.app.icon ? req.app.icon + ' ' : ''}${req.app.name}`, 'app', req.app.id)),
      field(t.role, el('span.ap-role', req.roles.join(' + '))),
      field(t.duration, req.duration.label),
      field(t.approvedBy, approver),
      showCurrent && field(t.current, req.existing && req.existing.length ? `${req.app.name}: ${req.existing.join(', ')}` : t.none),
    ),
    el('div.ap-just', el('div.ap-label', t.justification), el('p.ap-just__text', `“${req.text}”`)),
    el('footer.ap-via', `${t.via}: ${req.via}`),
  );
}

/**
 * The Reference Binder: HR Roster, Org Chart, Policy Book, App Catalog.
 * opts: { el, C, data, checks, rules, newChecks, day, daily, reduced }
 */
export function createBinder({ el, C, data, checks, newChecks, day, daily, reduced }) {
  const t = C.copy;
  let current = 'hr';
  let req = null;
  const tabBtns = {};
  const pages = {};
  const scrollTo = (node) => node?.scrollIntoView?.({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });

  // ---- HR Roster ----
  const rosterSearch = el('input.input.ap-search', { type: 'search', placeholder: t.searchRoster, 'aria-label': t.searchRoster, autocomplete: 'off' });
  const rosterEmpty = el('p.ap-empty', { hidden: true });
  const people = [...C.people].sort((a, b) => a.name.localeCompare(b.name));
  const rosterRows = people.map((p) =>
    el(
      'li.ap-person',
      { dataset: { id: p.id, q: `${p.name} ${p.title} ${deptLabel(C, p.dept)}`.toLowerCase() } },
      el('span.ap-person__av', { 'aria-hidden': 'true' }, p.avatar || '🙂'),
      el(
        'div.ap-person__main',
        el('div.ap-person__name', p.name),
        el('div.ap-person__meta', `${p.title} · ${deptLabel(C, p.dept)}`),
        p.quirk && el('div.ap-person__quirk', p.quirk),
      ),
      el(`span.ap-status.ap-status--${p.status}`, statusText(C, p)),
    ),
  );
  const filterRoster = () => {
    const q = rosterSearch.value.trim().toLowerCase();
    let shown = 0;
    for (const r of rosterRows) {
      const hit = !q || r.dataset.q.includes(q);
      r.hidden = !hit;
      if (hit) shown++;
    }
    rosterEmpty.hidden = shown > 0;
    rosterEmpty.textContent = fmt(t.noMatch, { q: rosterSearch.value.trim() });
  };
  rosterSearch.addEventListener('input', filterRoster);
  pages.hr = el('div.ap-page.ap-page--hr', rosterSearch, rosterEmpty, el('ul.ap-roster', rosterRows));

  // ---- Org Chart ----
  const orgNodes = new Map();
  const node = (id, depth = 0) => {
    const p = id === 'board' ? { ...C.board, id: 'board' } : data.P.get(id);
    if (!p || depth > 8) return null;
    const kids = (data.reports.get(id) || []).filter((k) => k.id !== id).sort((a, b) => a.name.localeCompare(b.name));
    const gone = p.status === 'terminated' || p.status === 'expired';
    const card = el(
      'div.ap-node__card',
      el('span.ap-node__av', { 'aria-hidden': 'true' }, p.avatar || '🙂'),
      el('span.ap-node__name', p.name),
      el('span.ap-node__title', p.title),
      p.status && p.status !== 'active' && el(`span.ap-status.ap-status--${p.status}.ap-status--mini`, statusText(C, p)),
    );
    orgNodes.set(id, card);
    return el(`li.ap-node${gone ? '.is-gone' : ''}`, card, kids.length > 0 && el('ul', kids.map((k) => node(k.id, depth + 1))));
  };
  pages.org = el('div.ap-page.ap-page--org', el('ul.ap-tree', node('board')));

  // ---- Policy Book ----
  const ruleItem = (r, redacted) =>
    el(
      `li.ap-rule${redacted ? '.is-redacted' : ''}`,
      el('div.ap-rule__n', String(r.n)),
      el(
        'div',
        el(
          'div.ap-rule__title',
          el('span.ap-rule__icon', { 'aria-hidden': 'true' }, r.icon || '§'),
          ` ${r.title}`,
          !redacted && (r.checks || []).some((c) => newChecks.has(c)) && el('span.ap-new', t.newRule),
        ),
        redacted
          ? el('p.ap-rule__text', el('span.ap-redact', { 'aria-hidden': 'true' }, r.text), el('span.ap-rule__later', fmt(t.ruleLater, { day: r.day })))
          : el('p.ap-rule__text', r.text),
      ),
    );
  pages.policy = el(
    'div.ap-page.ap-page--policy',
    el('ol.ap-policy', C.rules.map((r) => ruleItem(r, !daily && r.day > day))),
    el('p.ap-policy__foot', C.company?.motto || ''),
  );

  // ---- App Catalog ----
  const appSearch = el('input.input.ap-search', { type: 'search', placeholder: t.searchApps, 'aria-label': t.searchApps, autocomplete: 'off' });
  const appEmpty = el('p.ap-empty', { hidden: true });
  const showDepts = checks.has('dept');
  const showSod = checks.has('sod');
  const appCards = C.apps.map((a) =>
    el(
      'li.ap-appcard',
      { dataset: { id: a.id, q: a.name.toLowerCase() } },
      el(
        'div.ap-appcard__head',
        el('span.ap-appcard__icon', { 'aria-hidden': 'true' }, a.icon || '▣'),
        el('span.ap-appcard__name', a.name),
        a.sensitivity && el(`span.ap-sens.ap-sens--${String(a.sensitivity).toLowerCase()}`, a.sensitivity),
      ),
      a.blurb && el('div.ap-appcard__blurb', a.blurb),
      el('div.ap-roles', a.roles.map((r) => el(`span.ap-rolechip${r.priv ? '.is-priv' : ''}`, r.priv ? `★ ${r.name}` : r.name))),
      showDepts && el(`div.ap-appcard__depts${a.depts ? '.is-restricted' : ''}`, a.depts ? fmt(t.onlyDepts, { depts: a.depts.map((x) => deptLabel(C, x)).join(' & ') }) : t.allDepts),
      showSod && a.sod && el('div.ap-appcard__sod', `⚠ ${fmt(t.sodNote, { a: a.sod[0], b: a.sod[1] })}`),
    ),
  );
  const filterApps = () => {
    const q = appSearch.value.trim().toLowerCase();
    let shown = 0;
    for (const c of appCards) {
      const hit = !q || c.dataset.q.includes(q);
      c.hidden = !hit;
      if (hit) shown++;
    }
    appEmpty.hidden = shown > 0;
    appEmpty.textContent = fmt(t.noApp, { q: appSearch.value.trim() });
  };
  appSearch.addEventListener('input', filterApps);
  pages.apps = el(
    'div.ap-page.ap-page--apps',
    appSearch,
    appEmpty,
    el('p.ap-catalog__note', t.privNote),
    el('ul.ap-apps', appCards),
    checks.has('shadow') && el('p.ap-catalog__note.ap-catalog__note--shadow', t.notListed),
  );

  // ---- Tabs ----
  const tablist = el(
    'div.ap-tabs',
    { role: 'tablist', 'aria-label': t.binderTitle },
    TABS.map((id, i) => {
      const b = el(
        `button.ap-tab.ap-tab--${id}`,
        { type: 'button', role: 'tab', id: `ap-tab-${id}`, 'aria-controls': `ap-page-${id}`, 'aria-selected': 'false', onclick: () => show(id) },
        el('span.ap-tab__n', { 'aria-hidden': 'true' }, String(i + 1)),
        el('span.ap-tab__long', t.tabs[id]),
        el('span.ap-tab__short', t.tabsShort[id]),
      );
      tabBtns[id] = b;
      return b;
    }),
  );
  const body = el(
    'div.ap-binder__body',
    TABS.map((id) => {
      const pg = pages[id];
      pg.id = `ap-page-${id}`;
      pg.setAttribute('role', 'tabpanel');
      pg.setAttribute('aria-labelledby', `ap-tab-${id}`);
      return pg;
    }),
  );
  const root = el('section.ap-binder', { 'aria-label': t.binderTitle }, tablist, body);

  function show(id) {
    if (!pages[id]) return;
    current = id;
    for (const k of TABS) {
      const on = k === id;
      tabBtns[k].setAttribute('aria-selected', on ? 'true' : 'false');
      tabBtns[k].classList.toggle('is-on', on);
      pages[k].hidden = !on;
    }
  }

  function clearHl() {
    root.querySelectorAll('.is-hl, .is-hl2').forEach((n) => n.classList.remove('is-hl', 'is-hl2'));
  }

  function flash(n, cls = 'is-hl') {
    if (!n) return;
    n.classList.remove(cls);
    void n.offsetWidth; // restart the highlight animation
    n.classList.add(cls);
  }

  /** Jump to whatever the player tapped on the ticket. */
  function lookup(kind, id) {
    clearHl();
    if (kind === 'person') {
      show('hr');
      const row = rosterRows.find((r) => r.dataset.id === id);
      if (row) {
        rosterSearch.value = '';
        filterRoster();
        flash(row);
        scrollTo(row);
      } else {
        rosterSearch.value = req?.person?.name || '';
        filterRoster();
      }
    } else if (kind === 'approver') {
      show('org');
      const me = orgNodes.get(req?.person?.id);
      const them = orgNodes.get(id);
      flash(them, 'is-hl2');
      flash(me);
      scrollTo(me || them);
    } else if (kind === 'app') {
      show('apps');
      const card = appCards.find((c) => c.dataset.id === id);
      if (card) {
        appSearch.value = '';
        filterApps();
        flash(card);
        scrollTo(card);
      } else {
        appSearch.value = req?.app?.name || '';
        filterApps();
        scrollTo(appEmpty);
      }
    }
  }

  show(current);
  return {
    el: root,
    show,
    lookup,
    setRequest(r) {
      req = r;
      clearHl();
    },
    get current() {
      return current;
    },
  };
}
