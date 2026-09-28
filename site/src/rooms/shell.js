// App chrome: top bar with nav, sound toggle and Patient ID wristband; referral banner; room outlet;
// footer; fixed news ticker.

import { el, $$ } from '../engine/dom.js';
import { mountTicker } from '../engine/ticker.js';
import { dailyPick } from '../engine/rng.js';
import { brandIcon } from './common.js';

export function mountShell(app, s) {
  const { brand, referral, audio, router } = s;
  const home = brand.content?.home || {};
  const nav = el(
    'nav.nav',
    { 'aria-label': 'Main' },
    (home.nav || []).map((n) => el(`a${n.cure ? '.nav__cure' : ''}`, { href: '#' + n.path, dataset: { path: n.path }, text: n.label })),
    el('a.nav__patient', { href: '#/sponsor', text: `Patient ${referral.patientId()} · your sponsor code` }),
  );
  const menuBtn = el('button.icon-btn.menu-toggle', { type: 'button', 'aria-label': 'Menu', 'aria-expanded': 'false', text: '☰' });
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '✕' : '☰';
  });

  const soundBtn = el('button.icon-btn', { type: 'button' });
  const renderSound = () => {
    soundBtn.textContent = audio.isMuted() ? '🔇' : '🔊';
    soundBtn.setAttribute('aria-label', audio.isMuted() ? 'Sound is off. Turn on.' : 'Sound is on. Turn off.');
    soundBtn.title = soundBtn.getAttribute('aria-label');
  };
  soundBtn.addEventListener('click', () => {
    audio.toggle();
    if (!audio.isMuted()) {
      audio.unlock();
      s.sfx.beep();
    } else s.speech.stop();
  });
  audio.onChange(renderSound);
  renderSound();

  const wristband = el(
    'a.wristband',
    { href: '#/sponsor', title: 'Your Patient ID doubles as your sponsor code' },
    el('span.wristband__dot'),
    el('span.wristband__text', 'PATIENT '),
    el('span', referral.patientId()),
  );

  const topbar = el(
    'header.topbar',
    el('a.brandmark', { href: '#/' }, brandIcon(), el('span', el('span.brandmark__name', brand.site?.hospital || brand.site?.name), el('span.brandmark__sub', `${brand.site?.network || ''} · Recovery Network`))),
    nav,
    el('div.topbar__tools', soundBtn, wristband, menuBtn),
  );

  const ref = referral.referredBy();
  const refBanner = ref
    ? el(
        'div.ref-banner',
        el('span', 'You were referred by patient ', el('b', ref.id), '. Get diagnosed and you both earn a recovery chip.'),
        el('a.btn.btn--amber.btn--sm', { href: '#/triage', text: 'Begin triage' }),
      )
    : null;

  const outlet = el('main.room', { id: 'room', tabindex: '-1' });
  const footer = buildFooter(s);
  const dock = el('div.ticker-dock');
  app.append(el('div.app', topbar, refBanner, outlet, footer, dock));

  const gazette = (brand.content?.gazette || []).map((g) => (typeof g === 'string' ? g : g.headline));
  const lead = dailyPick(gazette, 'gazette', brand.epoch);
  const ticker = mountTicker(dock, {
    label: 'LIVE',
    items: [lead && `TODAY’S GAZETTE: ${lead}`, ...(home.ticker || []), ...gazette.filter((g) => g !== lead).slice(0, 12)].filter(Boolean),
  });
  s.ticker = ticker;

  let cleanup = null;
  function show(render, route) {
    try {
      cleanup?.();
    } catch (e) {
      console.error(e);
    }
    cleanup = null;
    s.speech.stop();
    nav.classList.remove('is-open');
    menuBtn.textContent = '☰';
    outlet.innerHTML = '';
    outlet.classList.remove('room-enter');
    void outlet.offsetWidth;
    outlet.classList.add('room-enter');
    for (const a of $$('a', nav)) a.classList.toggle('is-active', route && (route.path === a.dataset.path || route.path.startsWith(a.dataset.path + '/')));
    window.scrollTo(0, 0);
    const r = render(outlet);
    cleanup = typeof r === 'function' ? r : null;
    s.track('room_view', { room: route?.name || 'unknown', path: route?.path });
    return cleanup;
  }

  return { show, ticker, outlet };
}

function buildFooter(s) {
  const f = s.brand.content?.home?.footer || {};
  const legal = el('p');
  // "[REDACTED BY LEGAL]" renders as a redaction bar the user can hover.
  String(f.legal || '')
    .split('[REDACTED BY LEGAL]')
    .forEach((part, i, arr) => {
      legal.append(part);
      if (i < arr.length - 1) legal.append(el('span.redacted', { title: 'Redacted by legal' }, 'REDACTED BY LEGAL'));
    });
  const sp = s.brand.sponsor || {};
  return el(
    'footer.footer',
    el(
      'div.wrap.footer__grid',
      el('div', el('h4', s.brand.site?.hospital || ''), el('p', f.disclaimer || ''), legal, el('p.faint', f.made || '')),
      el(
        'div',
        el('h4', 'Wards'),
        (s.brand.content?.home?.nav || []).map((n) => el('a', { href: '#' + n.path, text: n.label })),
        el('a', { href: '#/gazette', text: 'The Gazette' }),
      ),
      el(
        'div',
        el('h4', `Treatment by ${sp.name || ''}`),
        el('a', { href: s.cta.url('primary', 'footer'), target: '_blank', rel: 'noopener', text: 'Start free (under 20 users)' }),
        el('a', { href: s.cta.url('trial', 'footer'), target: '_blank', rel: 'noopener', text: '14-day free trial' }),
        el('a', { href: s.cta.url('pricing', 'footer'), target: '_blank', rel: 'noopener', text: 'Public pricing page (imagine that)' }),
        el('a', { href: s.cta.url('demo', 'footer'), target: '_blank', rel: 'noopener', text: 'Book a treatment session (demo)' }),
        el('a', { href: s.cta.url('ssotax', 'footer'), target: '_blank', rel: 'noopener', text: 'The SSO tax, itemized' }),
      ),
    ),
  );
}
