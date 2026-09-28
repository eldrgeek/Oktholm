// Optional backend client. Every call resolves to `null` when there is no backend
// (file:// preview, static host without functions, network failure) so features degrade instead of breaking.

export function createApi(base = '/api') {
  let offline = typeof location !== 'undefined' && location.protocol === 'file:';

  async function request(method, path, body) {
    if (offline) return null;
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
  };
}
