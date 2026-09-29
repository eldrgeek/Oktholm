// Hash router. Hash routing works on any static host and inside single-file previews.
// Share links use real query params (?ref=...&i=...) so servers/edge functions can see them for OG tags.

export function createRouter() {
  const routes = [];
  let notFound = null;
  let current = null; // { cleanup }
  const listeners = new Set();

  function compile(pattern) {
    const keys = [];
    const re = new RegExp(
      '^' +
        pattern
          .replace(/\/+$/, '')
          .replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)'))
          .replace(/\*/g, '(.*)') +
        '/?$',
    );
    return { re, keys };
  }

  function parse(hash = location.hash) {
    const raw = hash.replace(/^#/, '') || '/';
    const [path, qs = ''] = raw.split('?');
    return { path: path || '/', query: Object.fromEntries(new URLSearchParams(qs)) };
  }

  function resolve() {
    const { path, query } = parse();
    for (const r of routes) {
      const m = r.re.exec(path === '/' ? '' : path.replace(/\/+$/, ''));
      if (m) {
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
        return run(r.handler, { path, params, query, name: r.name });
      }
    }
    if (notFound) run(notFound, { path, params: {}, query, name: '404' });
  }

  function run(handler, route) {
    try {
      current?.cleanup?.();
    } catch (e) {
      console.error(e);
    }
    current = null;
    const cleanup = handler(route);
    current = { cleanup: typeof cleanup === 'function' ? cleanup : null, route };
    listeners.forEach((fn) => fn(route));
  }

  return {
    on(pattern, handler, name = pattern) {
      routes.push({ ...compile(pattern), handler, name });
      return this;
    },
    otherwise(handler) {
      notFound = handler;
      return this;
    },
    start() {
      addEventListener('hashchange', resolve);
      resolve();
    },
    navigate(path, { replace = false } = {}) {
      const target = '#' + (path.startsWith('/') ? path : '/' + path);
      if (location.hash === target) return resolve();
      if (replace) {
        history.replaceState(null, '', target);
        resolve();
      } else location.hash = target;
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    get current() {
      return current?.route;
    },
    parse,
  };
}
