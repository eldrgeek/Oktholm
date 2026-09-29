// "Learn more ↓": a floating pill that appears whenever the room continues below the fold, named after
// the next section. Sections are <section> elements (or anything with data-cue="Label") inside the room;
// the label is data-cue, else the section's first heading.
//
//   const cue = createScrollCue({ container: roomEl });
//   cue.refresh({ persistent })   // after every route change; non-persistent pages hide it after the first scroll/tap
//   cue.suppress('tour', true)    // hide while something else owns the screen (cold open, tour, modals)

import { el, prefersReducedMotion } from './dom.js';

const SECTIONS = 'section, [data-cue]';

export function createScrollCue({ container, label = 'Learn more' }) {
  const nextEl = el('span.scroll-cue__next');
  const btn = el('button.scroll-cue', { type: 'button', hidden: true }, el('span.scroll-cue__label', label), nextEl, el('span.scroll-cue__arrow', { 'aria-hidden': 'true' }, '↓'));
  document.body.append(btn);

  const blocks = new Set();
  let target = null;
  let armed = false;
  let persistent = true;
  let dismissed = false;
  let armTimer = 0;
  let raf = 0;
  let debounce = 0;

  function sections() {
    const list = [...container.querySelectorAll(SECTIONS)].filter((n) => n.dataset.cue !== 'off' && n.getClientRects().length);
    return list.filter((n) => !list.some((o) => o !== n && o.contains(n)));
  }

  function nameOf(n) {
    if (n.dataset.cue) return n.dataset.cue;
    const t = (n.querySelector('[data-cue-title], .section__title, h2, h3')?.textContent || '').replace(/\s+/g, ' ').trim();
    return t.length > 34 ? t.slice(0, 32).trimEnd() + '…' : t;
  }

  function update() {
    raf = 0;
    const vh = window.innerHeight;
    // Measure against the end of the room, not the page: the footer isn't worth an arrow.
    const remaining = container.getBoundingClientRect().bottom - vh;
    const list = sections();
    const tops = list.map((n) => n.getBoundingClientRect().top);
    // A heading already peeking over the bottom edge says "more below" by itself; don't cover it.
    const peeking = tops.some((t) => t > vh * 0.72 && t < vh - 8);
    target = list[tops.findIndex((t) => t >= vh - 8)] || null;
    const show = armed && !dismissed && !blocks.size && remaining > 120 && !peeking;
    btn.hidden = !show;
    if (!show) return;
    const name = target ? nameOf(target) : '';
    nextEl.textContent = name ? ` · ${name}` : '';
    btn.setAttribute('aria-label', name ? `${label}: ${name}` : label);
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  btn.addEventListener('click', () => {
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (target) target.scrollIntoView({ behavior, block: 'start' });
    else window.scrollBy({ top: Math.round(window.innerHeight * 0.8), behavior });
  });

  const dismissOnUse = () => {
    if (persistent || !armed || dismissed) return;
    dismissed = true;
    schedule();
  };
  addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 80) dismissOnUse();
      schedule();
    },
    { passive: true },
  );
  addEventListener('resize', schedule);
  container.addEventListener('pointerdown', dismissOnUse);
  container.addEventListener('keydown', dismissOnUse);
  // Rooms fill in asynchronously (API data, shows); re-measure a beat after the DOM settles.
  new MutationObserver(() => {
    clearTimeout(debounce);
    debounce = setTimeout(schedule, 250);
  }).observe(container, { childList: true, subtree: true });

  return {
    el: btn,
    refresh(opts = {}) {
      persistent = opts.persistent !== false;
      dismissed = false;
      armed = false;
      btn.hidden = true;
      clearTimeout(armTimer);
      armTimer = setTimeout(() => {
        armed = true;
        schedule();
      }, opts.delay ?? 900);
    },
    suppress(reason, on = true) {
      if (on) blocks.add(reason);
      else blocks.delete(reason);
      schedule();
    },
    update: schedule,
  };
}
