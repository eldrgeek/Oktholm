// News crawl. Items loop forever; push() injects breaking items at the front of the next pass.

import { el, prefersReducedMotion } from './dom.js';

export function mountTicker(root, { label = 'LIVE', items = [], pxPerSecond = 70 } = {}) {
  let list = items.slice();
  const track = el('div.ticker__track');
  const wrap = el('div.ticker', { 'aria-label': 'News ticker' }, el('span.ticker__label', el('span.live-dot'), label), el('div.ticker__viewport', track));
  root.append(wrap);

  function render() {
    track.innerHTML = '';
    const run = () => list.map((t) => el('span.ticker__item', typeof t === 'string' ? t : t.text));
    // Two copies so translateX(-50%) loops seamlessly.
    track.append(el('div.ticker__run', run()), el('div.ticker__run', { 'aria-hidden': 'true' }, run()));
    requestAnimationFrame(() => {
      const w = track.firstChild?.scrollWidth || 1000;
      track.style.animationDuration = `${Math.max(20, w / pxPerSecond)}s`;
      track.classList.toggle('is-static', prefersReducedMotion());
    });
  }
  render();

  return {
    push(text) {
      list = [{ text: `BREAKING: ${text}` }, ...list.filter((x) => (typeof x === 'string' ? x : x.text) !== `BREAKING: ${text}`)].slice(0, 60);
      render();
    },
    set(next) {
      list = next.slice();
      render();
    },
    destroy() {
      wrap.remove();
    },
  };
}
