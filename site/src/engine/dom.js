// Tiny DOM helpers. No framework, on purpose: every module can be read top to bottom.

/**
 * el('div.card.card--big#id', { onclick, style, dataset, html, text, attrs... }, ...children)
 * Children may be strings (text nodes), nodes, arrays, or falsy (skipped).
 */
export function el(spec, props, ...children) {
  if (props instanceof Node || typeof props === 'string' || Array.isArray(props)) {
    children.unshift(props);
    props = null;
  }
  const m = /^([a-z0-9-]+)?((?:[.#][\w-]+)*)$/i.exec(spec) || [];
  const node = document.createElement(m[1] || 'div');
  for (const part of (m[2] || '').match(/[.#][\w-]+/g) || []) {
    if (part[0] === '.') node.classList.add(part.slice(1));
    else node.id = part.slice(1);
  }
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v; // only ever pass trusted, static strings
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k === 'class') node.classList.add(...String(v).split(/\s+/).filter(Boolean));
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k in node && typeof v !== 'string') node[k] = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
  }
  append(node, children);
  return node;
}

function append(node, children) {
  for (const c of children) {
    if (c == null || c === false || c === true) continue;
    if (Array.isArray(c)) append(node, c);
    else node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Replace {name} tokens in a template string. Values are inserted as plain text by callers that use textContent. */
export function fill(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? String(vars[k]) : m));
}

export function formatNumber(n) {
  return Math.round(n).toLocaleString('en-US');
}

/** Collects cleanup callbacks so modules can tear down timers/listeners in one call. */
export function disposer() {
  const fns = [];
  const d = (fn) => (fns.push(fn), fn);
  d.timeout = (fn, ms) => {
    const id = setTimeout(fn, ms);
    fns.push(() => clearTimeout(id));
    return id;
  };
  d.interval = (fn, ms) => {
    const id = setInterval(fn, ms);
    fns.push(() => clearInterval(id));
    return id;
  };
  d.raf = (fn) => {
    let id = 0;
    let alive = true;
    const loop = (t) => {
      if (!alive) return;
      fn(t);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    fns.push(() => {
      alive = false;
      cancelAnimationFrame(id);
    });
  };
  d.on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    fns.push(() => target.removeEventListener(type, fn, opts));
  };
  d.run = () => {
    while (fns.length) {
      try {
        fns.pop()();
      } catch (e) {
        console.error(e);
      }
    }
  };
  return d;
}
