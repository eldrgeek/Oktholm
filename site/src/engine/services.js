// One place that wires every engine service for the active brand. Used by the site and dev harnesses.

import brand from '@brand';
import { createStore } from './store.js';
import { createAudio } from './audio.js';
import { createSpeech } from './speech.js';
import { createUi } from './ui.js';
import { createApi } from './api.js';
import { createReferral } from './referral.js';
import { createShare } from './share.js';
import { createRouter } from './router.js';
import { el } from './dom.js';

function createTracker() {
  return function track(event, props = {}) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event, ...props });
      window.plausible?.(event, { props });
      window.posthog?.capture?.(event, props);
    } catch {
      /* analytics must never break the page */
    }
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.debug('[track]', event, props);
  };
}

export function createCta({ brand, track }) {
  const sp = brand.sponsor || {};
  function url(kind = 'primary', content = '') {
    const href = sp.links?.[kind] || sp.links?.primary || sp.url || '#';
    try {
      const u = new URL(href);
      u.searchParams.set('utm_source', brand.utm?.source || brand.id);
      u.searchParams.set('utm_medium', 'parody-site');
      u.searchParams.set('utm_campaign', brand.utm?.campaign || brand.id);
      if (content) u.searchParams.set('utm_content', content);
      return u.toString();
    } catch {
      return href;
    }
  }
  function button(kind, label, { content = '', variant = 'cure', size = '' } = {}) {
    return el(`a.btn.btn--${variant}${size ? '.btn--' + size : ''}`, {
      href: url(kind, content),
      target: '_blank',
      rel: 'noopener',
      text: label,
      onclick: () => track('cta_click', { kind, content }),
    });
  }
  /** A "prescription" card: the standard, honest sponsor pitch that closes every game and show. */
  function card({ kicker = 'Prescription', title, body, kind = 'primary', label, content = '', secondary } = {}) {
    return el(
      'aside.rx',
      el('div.rx__mark', { 'aria-hidden': 'true' }, '℞'),
      el(
        'div.rx__body',
        el('div.kicker', kicker),
        title && el('h3.rx__title', title),
        body && el('p.rx__text', body),
        el(
          'div.rx__actions',
          button(kind, label || sp.ctaLabel || `Try ${sp.name || 'it'}`, { content }),
          secondary && button(secondary.kind, secondary.label, { content, variant: 'ghost' }),
        ),
      ),
    );
  }
  return { url, button, card, sponsor: sp };
}

let singleton = null;

export function createServices() {
  if (singleton) return singleton;
  const store = createStore(`pe:${brand.id}`);
  const audio = createAudio(store.scope('prefs'));
  const speech = createSpeech({ isMuted: audio.isMuted });
  const ui = createUi({ sfx: audio.sfx });
  const api = createApi(brand.api?.base || '/api');
  const track = createTracker();
  const referral = createReferral({ brand, store, api, track, onChip: (def) => ui.chipAward(def) });
  const share = createShare({ brand, referral, ui, track });
  const cta = createCta({ brand, track });
  const router = createRouter();
  singleton = { brand, store, audio, sfx: audio.sfx, speech, ui, api, track, referral, share, cta, router };
  return singleton;
}
