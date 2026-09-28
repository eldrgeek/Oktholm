// Personalized link previews. Social crawlers don't run JavaScript, so a shared intervention link would
// otherwise preview as the generic homepage. This rewrites <title>/og/twitter text for ?i= (intervention)
// and ?dx= (diagnosis) links. Everything taken from the URL is validated and escaped.

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
        description: 'It’s not me. It’s my identity provider. Get screened in two minutes — no login, no email.',
      };
    }
  }
  return null;
}

function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(re, `$1${esc(value)}$2`);
}

export default async (request, context) => {
  const url = new URL(request.url);
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

export const config = { path: '/' };
