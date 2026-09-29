// Toasts, modals, confetti, chip awards. Shared by every room and module.

import { el, prefersReducedMotion } from './dom.js';

export function createUi({ sfx }) {
  let toastHost = null;

  function host() {
    if (!toastHost || !toastHost.isConnected) {
      toastHost = el('div.toasts', { 'aria-live': 'polite', role: 'status' });
      document.body.append(toastHost);
    }
    return toastHost;
  }

  function toast(message, { kind = 'info', ms = 3800, icon } = {}) {
    const t = el(`div.toast.toast--${kind}`, icon && el('span.toast__icon', icon), el('span.toast__msg', message));
    host().append(t);
    requestAnimationFrame(() => t.classList.add('is-in'));
    setTimeout(() => {
      t.classList.remove('is-in');
      setTimeout(() => t.remove(), 400);
    }, ms);
    return t;
  }

  /** modal({ title, body: Node|string, actions: [{ label, kind:'cure'|'ghost'|..., onClick, keepOpen }], wide }) */
  function modal({ title, body, actions = [{ label: 'Close' }], wide = false, onClose } = {}) {
    const previouslyFocused = document.activeElement;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      overlay.classList.remove('is-in');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => overlay.remove(), 250);
      onClose?.();
      previouslyFocused?.focus?.();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    const dialog = el(
      `div.modal${wide ? '.modal--wide' : ''}`,
      { role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Dialog' },
      title && el('h2.modal__title', title),
      el('div.modal__body', typeof body === 'string' ? el('p', body) : body),
      actions.length &&
        el(
          'div.modal__actions',
          actions.map((a) =>
            el(`button.btn.btn--${a.kind || 'ghost'}`, {
              type: 'button',
              text: a.label,
              onclick: () => {
                a.onClick?.();
                if (!a.keepOpen) close();
              },
            }),
          ),
        ),
    );
    const overlay = el('div.modal-overlay', { onclick: (e) => e.target === overlay && close() }, dialog);
    document.body.append(overlay);
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => {
      overlay.classList.add('is-in');
      (dialog.querySelector('button, a, input, textarea, select') || dialog).focus?.();
    });
    return { close, dialog };
  }

  function confetti({ colors = ['#36f59a', '#4263eb', '#ffb627', '#ff4757', '#e9f0f7'], count = 140 } = {}) {
    if (prefersReducedMotion()) return;
    const c = el('canvas.confetti');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    document.body.append(c);
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    const parts = Array.from({ length: count }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 12 - 4,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      s: 5 + Math.random() * 7,
      col: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    (function frame(t) {
      const dt = Math.min(2, (t - (frame.last || t)) / 16.7);
      frame.last = t;
      g.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.vy += 0.35 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.r += p.vr * dt;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.col;
        g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        g.restore();
      }
      if (t - t0 < 2200) requestAnimationFrame(frame);
      else c.remove();
    })(t0);
  }

  function chipAward(def) {
    sfx?.coin();
    toast(`Chip earned: ${def.name}${def.desc ? ' — ' + def.desc : ''}`, { kind: 'chip', icon: def.icon || '●', ms: 5200 });
    confetti({ count: 70 });
  }

  return { toast, modal, confetti, chipAward };
}
