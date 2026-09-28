// Module registry + the context object every game/show receives. See CONTRACT.md.

import { el, $, $$, disposer, fill, clamp, sleep, formatNumber, prefersReducedMotion } from './dom.js';
import { seeded, daily, dayNumber, dailyPick, random } from './rng.js';
import * as canvas from './canvas.js';

const registry = new Map();

export function registerModule(mod) {
  if (!mod?.id || typeof mod.mount !== 'function') throw new Error('Invalid module: needs id and mount()');
  registry.set(mod.id, mod);
  return mod;
}

export const getModule = (id) => registry.get(id);

/** Modules enabled by the brand (brand.modules keys), in brand order. */
export function listModules(brand, kind) {
  const ids = Object.keys(brand.modules || {});
  return ids
    .map((id) => registry.get(id))
    .filter(Boolean)
    .filter((m) => !kind || m.kind === kind || (Array.isArray(kind) && kind.includes(m.kind)));
}

/** Brand copy overrides module defaults (title, blurb, emoji...). */
export function moduleMeta(mod, brand) {
  const c = brand.modules?.[mod.id] || {};
  return {
    id: mod.id,
    kind: mod.kind,
    title: c.title || mod.title,
    blurb: c.blurb || mod.blurb,
    emoji: c.emoji || mod.emoji,
    minutes: c.minutes || mod.minutes,
    therapy: c.therapy || mod.therapy || '',
  };
}

export function makeContext(services, mod) {
  const { brand } = services;
  const content = brand.modules?.[mod.id] || {};
  return {
    id: mod.id,
    brand,
    content,
    meta: moduleMeta(mod, brand),
    store: services.store.scope(`m:${mod.id}`),
    sfx: services.sfx,
    audio: services.audio,
    speech: services.speech,
    ui: services.ui,
    share: services.share,
    referral: services.referral,
    cta: services.cta,
    api: services.api,
    rng: {
      seeded,
      random,
      daily: (salt = '') => daily(`${mod.id}:${salt}`),
      dayNumber: () => dayNumber(brand.epoch),
      dailyPick: (list, salt = '') => dailyPick(list, `${mod.id}:${salt}`, brand.epoch),
    },
    // Site-wide "today" picks (same salts as the rooms), so every show agrees on today's headline.
    today: { gazette: dailyPick(brand.content?.gazette || [], 'gazette', brand.epoch) },
    navigate: (p) => services.router.navigate(p),
    track: (event, props = {}) => services.track(event, { module: mod.id, ...props }),
    dom: { el, $, $$, disposer, fill, clamp, sleep, formatNumber, prefersReducedMotion },
    canvas,
  };
}

/** Mounts a module into `root`. Returns a cleanup function that also silences speech. */
export function mountModule(mod, root, services, opts = {}, overrides = null) {
  const ctx = makeContext(services, mod);
  // e.g. the OKTV channel passes speech/audio overrides so autoplaying shows stay silent until asked.
  if (overrides) Object.assign(ctx, overrides);
  root.classList.add('module', `module--${mod.id}`);
  let cleanup = null;
  try {
    cleanup = mod.mount(root, ctx, opts);
  } catch (e) {
    console.error(`[${mod.id}] mount failed`, e);
    root.append(el('div.card.pad', el('h3', 'This ward is temporarily closed.'), el('p.dim', 'Something broke. Probably SAML.')));
  }
  return () => {
    try {
      cleanup?.();
    } catch (e) {
      console.error(`[${mod.id}] cleanup failed`, e);
    }
    services.speech.stop();
  };
}
