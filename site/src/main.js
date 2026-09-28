// Site entry: wires services, registers every discovered module, mounts the shell and routes.

import './styles/index.css';
import './styles/rooms.css';
import modules from 'virtual:modules';
import { createServices } from './engine/services.js';
import { registerModule, getModule } from './engine/modules.js';
import { applyTheme } from './engine/theme.js';
import { mountShell } from './rooms/shell.js';
import { renderLobby } from './rooms/lobby.js';
import { renderTriage } from './rooms/triage.js';
import { renderArcade, renderModulePage } from './rooms/arcade.js';
import { renderTv } from './rooms/tv.js';
import { renderSponsor } from './rooms/sponsor.js';
import { renderTherapy } from './rooms/therapy.js';
import { renderDsm } from './rooms/dsm.js';
import { renderGazette } from './rooms/gazette.js';
import { renderCure } from './rooms/cure.js';
import { renderNotFound } from './rooms/notfound.js';

const s = createServices();
for (const m of modules) {
  try {
    registerModule(m);
  } catch (e) {
    console.error(e);
  }
}
applyTheme(s.brand);

// ---- Share-link landing: read query params once, then clean the URL so re-shares carry the new sharer's code.
const q = new URLSearchParams(location.search);
s.referral.captureFromUrl(location.search);
s.boot = { payload: q.get('i') || null, dx: q.get('dx') || null };
let landing = null;
if (q.get('i')) landing = '/intervention/view';
else if (q.get('play') && getModule(q.get('play'))) landing = `/play/${q.get('play')}`;
else if (q.get('watch') && getModule(q.get('watch'))) landing = `/watch/${q.get('watch')}`;
else if (q.get('dx')) landing = '/triage';
if (q.toString()) history.replaceState(null, '', location.pathname + (landing ? '#' + landing : location.hash));

const shell = mountShell(document.getElementById('app'), s);
const room = (render) => (route) => shell.show((root) => render(root, s, route), route);

s.router
  .on('/', room(renderLobby), 'lobby')
  .on('/triage', room(renderTriage), 'triage')
  .on('/arcade', room(renderArcade), 'arcade')
  .on('/play/:id', room(renderModulePage), 'play')
  .on('/watch/:id', room(renderModulePage), 'watch')
  .on('/tv', room(renderTv), 'tv')
  .on('/intervention', room((root, s2, r) => renderModulePage(root, s2, { ...r, params: { id: 'intervention' }, mode: 'create' })), 'intervention')
  .on('/intervention/view', room((root, s2, r) => renderModulePage(root, s2, { ...r, params: { id: 'intervention' }, mode: 'view', payload: r.query.i || s2.boot.payload })), 'intervention-view')
  .on('/sponsor', room(renderSponsor), 'sponsor')
  .on('/therapy', room(renderTherapy), 'therapy')
  .on('/dsm', room(renderDsm), 'dsm')
  .on('/dsm/:code', room(renderDsm), 'dsm-entry')
  .on('/gazette', room(renderGazette), 'gazette')
  .on('/cure', room(renderCure), 'cure')
  .otherwise(room(renderNotFound));

s.router.start();

// Test/debug hook (used by tests/smoke.mjs). Exposes nothing a visitor couldn't see in devtools anyway.
window.__pe = { brand: s.brand.id, modules: Object.keys(s.brand.modules || {}).filter((id) => getModule(id)).map((id) => ({ id, kind: getModule(id).kind })) };
