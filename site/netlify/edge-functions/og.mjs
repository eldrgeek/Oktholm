// Personalized link previews. Social crawlers don't run JavaScript, so a shared intervention link would
// otherwise preview as the generic homepage. This rewrites <title>/og/twitter text for ?i= (intervention),
// ?dx= (diagnosis) and ?ref= (referral: "you've been admitted") links. Everything taken from the URL is
// validated and escaped. Also answers two easter eggs: `curl` on the home page gets a plain-text discharge
// summary, and /brew is a teapot (RFC 2324).

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function b64urlJson(s) {
  try {
    const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
    const bytes = Uint8Array.from(atob(pad), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function safeName(n) {
  const v = typeof n === 'string' ? n.trim() : '';
  return /^[\p{L}][\p{L} .'’-]{0,23}$/u.test(v) ? v : null;
}

function describe(params) {
  const i = params.get('i');
  if (i) {
    const name = safeName(b64urlJson(i)?.n) || 'you';
    return {
      title: `An intervention has been staged for ${name}.`,
      description: 'Someone who cares about you made this. It’s about your identity provider. Please watch it. We love you.',
    };
  }
  const dx = params.get('dx');
  if (dx) {
    const [stage, subtype] = dx.split('|');
    if (/^Stage (0|I|II|III|IV)$/.test(stage || '')) {
      const who = /^[a-z]{3,20}$/.test(subtype || '') ? ` (subtype: ${subtype})` : '';
      return {
        title: `Diagnosed: ${stage} Oktholm Syndrome${who}`,
        description: 'Turns out it’s not loyalty. It’s Oktholm Syndrome. Get screened in two minutes — no login, no email.',
      };
    }
  }
  const ref = params.get('ref');
  if (ref && /^OKT-[0-9A-Z]{4}-[0-9A-Z]{2}$/.test(ref)) {
    return {
      title: 'You’ve been admitted to Oktholm General.',
      description: 'A concerned colleague brought you in with suspected Oktholm Syndrome. (Name withheld. We’re a hospital.) Get screened in two minutes. No login, no email.',
    };
  }
  return null;
}

function dischargeSummary(ua, origin) {
  const who = (ua.match(/^[\w./ -]{1,40}/) || ['curl'])[0].trim();
  const date = new Date().toUTCString();
  return [
    'OKTHOLM GENERAL · DISCHARGE SUMMARY',
    '',
    `Patient:    ${who}`,
    `Admitted:   ${date}`,
    'Diagnosis:  Stage III Oktholm Syndrome, subtype: reads hospital websites in a terminal.',
    'Findings:   No JavaScript. No cookies. No patience for marketing. Healthy instincts.',
    `Treatment:  The games need a browser. ${origin}/`,
    'Disclosure: This hospital is a parody. The bill is paid by YeshID.',
    '',
    'Discharged against vendor advice.',
    '',
  ].join('\n');
}

function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(re, `$1${esc(value)}$2`);
}

export default async (request, context) => {
  const url = new URL(request.url);
  if (url.pathname === '/brew') {
    return new Response('418 I’m a teapot.\nCoffee is an Enterprise add-on.\n', { status: 418, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  const ua = request.headers.get('user-agent') || '';
  if (/^curl\//i.test(ua) && url.pathname === '/' && !url.search) {
    return new Response(dischargeSummary(ua, url.origin), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
  }
  const meta = describe(url.searchParams);
  if (!meta) return; // untouched: continue to the static file
  const res = await context.next();
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res;
  let html = await res.text();
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
  html = setMeta(html, 'property', 'og:title', meta.title);
  html = setMeta(html, 'property', 'og:description', meta.description);
  html = setMeta(html, 'name', 'twitter:title', meta.title);
  html = setMeta(html, 'name', 'twitter:description', meta.description);
  html = setMeta(html, 'name', 'description', meta.description);
  const headers = new Headers(res.headers);
  headers.delete('content-length');
  return new Response(html, { status: res.status, headers });
};

export const config = { path: ['/', '/brew'] };
