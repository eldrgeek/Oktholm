// /api/* for the Recovery Network (Netlify Functions, modern syntax). One function, tiny router.
//
//   POST /api/referral/landed    { patientId, ref, via }
//   POST /api/referral/qualify   { patientId, ref, kind }       -> credits ref once per patient (kind 'diagnosis')
//   GET  /api/sponsor/:id                                       -> { sponsees, landed }
//   GET  /api/leaderboard                                       -> { top: [{ name, count }] }
//   POST /api/event              { type, patientId }             -> { ok, count }  (today's total for that type)
//   POST /api/confession         { text, who, patientId }       -> moderation queue
//   GET  /api/confessions                                       -> approved confessions
//   POST /api/confession/react   { key, reaction }
//   GET  /api/admin/confessions            (Authorization: Bearer $ADMIN_TOKEN)
//   POST /api/admin/confessions/moderate   { key, approve }     (Authorization: Bearer $ADMIN_TOKEN)

import { createHash } from 'node:crypto';
import { createRecovery, HttpError } from '../lib/recovery.mjs';
import { blobStore } from '../lib/blob-store.mjs';

let recovery = null;
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function ipHash(ip) {
  if (!ip) return null;
  return createHash('sha256').update(`${process.env.IP_SALT || 'oktholm'}:${ip}`).digest('hex').slice(0, 20);
}

function admin(req) {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.headers.get('authorization') !== `Bearer ${token}`) throw new HttpError(401, 'unauthorized');
}

export default async (req, context) => {
  recovery ||= createRecovery(blobStore());
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '').replace(/\/+$/, '') || '/';
  const meta = { ipHash: ipHash(context.ip) };
  try {
    let body = {};
    if (req.method === 'POST') {
      const raw = await req.text();
      if (raw.length > 4000) throw new HttpError(413, 'too large');
      body = raw ? JSON.parse(raw) : {};
    }
    const route = `${req.method} ${path}`;
    if (route === 'POST /referral/landed') return json(await recovery.landed(body, meta));
    if (route === 'POST /referral/qualify') return json(await recovery.qualify(body, meta));
    if (req.method === 'GET' && path.startsWith('/sponsor/')) return json(await recovery.sponsor(decodeURIComponent(path.slice(9))));
    if (route === 'GET /leaderboard') return json(await recovery.leaderboard(10));
    if (route === 'POST /event') return json(await recovery.event(body, meta));
    if (route === 'POST /confession') return json(await recovery.confess(body, meta));
    if (route === 'GET /confessions') return json(await recovery.approved(50));
    if (route === 'POST /confession/react') return json(await recovery.react(body, meta));
    if (route === 'GET /admin/confessions') {
      admin(req);
      return json(await recovery.pending());
    }
    if (route === 'POST /admin/confessions/moderate') {
      admin(req);
      return json(await recovery.moderate(body));
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    if (e instanceof SyntaxError) return json({ error: 'bad json' }, 400);
    console.error(e);
    return json({ error: 'server error' }, 500);
  }
};

export const config = { path: '/api/*' };
