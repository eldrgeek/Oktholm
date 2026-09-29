// Dev harness: renders a single module with real engine services.
//   node build.mjs --game=<id>   then open dist/dev/<id>.html  (?mode=tv|page|create|view, &payload=...)

import '../styles/index.css';
import { createServices } from '../engine/services.js';
import { mountModule, registerModule, moduleMeta } from '../engine/modules.js';
import { el } from '../engine/dom.js';
import { applyTheme } from '../engine/theme.js';

export function mountHarness(mod) {
  registerModule(mod);
  const services = createServices();
  applyTheme(services.brand);
  const app = document.getElementById('app');
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode') || (mod.kind === 'show' ? 'page' : undefined);
  const meta = moduleMeta(mod, services.brand);

  const soundBtn = el('button.btn.btn--ghost.btn--sm', {
    type: 'button',
    text: services.audio.isMuted() ? 'Sound: off' : 'Sound: on',
    onclick: () => {
      services.audio.toggle();
      soundBtn.textContent = services.audio.isMuted() ? 'Sound: off' : 'Sound: on';
    },
  });

  app.append(
    el(
      'header.harness__bar',
      el('div', el('span.kicker', `harness · ${mod.kind} · ${mod.id}`), el('div.display', { style: { fontSize: '22px' } }, `${meta.emoji || ''} ${meta.title}`)),
      el('div.row', soundBtn, el('span.mono.faint', `patient ${services.referral.patientId()}`)),
    ),
  );

  let target;
  if (mode === 'tv') {
    target = el('div.tv-screen.crt.crt--flicker');
    app.append(el('div.harness__tv', target));
  } else {
    target = el('main.harness__stage');
    app.append(target);
  }
  window.__harness = {
    services,
    cleanup: mountModule(mod, target, services, {
      mode,
      payload: params.get('payload') || undefined,
      onEnd: () => {
        services.ui.toast('onEnd() fired', { kind: 'good' });
        window.__harness.ended = (window.__harness.ended || 0) + 1;
      },
    }),
  };
}
