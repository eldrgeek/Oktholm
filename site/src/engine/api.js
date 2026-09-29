// Optional backend client. Every call resolves to `null` when there is no backend
// (file:// preview, static host without functions, network failure) so features degrade instead of breaking.

export function createApi(base = '/api') {
  let offline = typeof location !== 'undefined' && location.protocol === 'file:';
  // What this page sent this visit (method, path, status; never bodies). Shown on the records page.
  const log = [];

  async function request(method, path, body) {
    if (offline) return null;
    const entry = { at: Date.now(), method, path: base + path, fields: body ? Object.keys(body) : [], status: 'pending' };
    log.push(entry);
    if (log.length > 60) log.shift();
    let timer = null;
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    if (ctrl) timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch(base + path, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl?.signal,
        credentials: 'same-origin',
      });
      entry.status = res.status;
      if (res.status === 404 || res.status === 405) {
        offline = true;
        return null;
      }
      if (!res.ok) return null;
      const type = res.headers.get('content-type') || '';
      if (!type.includes('application/json')) {
        // SPA fallback served index.html: there is no API here.
        offline = true;
        return null;
      }
      return await res.json();
    } catch {
      entry.status = 'failed';
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body || {}),
    get offline() {
      return offline;
    },
    log,
  };
}
