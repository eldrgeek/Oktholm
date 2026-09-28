// localStorage that never throws (private windows, blocked storage, previews) and falls back to memory.

const memory = new Map();
let backend = null;
try {
  const k = '__pe_probe__';
  window.localStorage.setItem(k, '1');
  window.localStorage.removeItem(k);
  backend = window.localStorage;
} catch {
  backend = null;
}

function rawGet(key) {
  try {
    return backend ? backend.getItem(key) : memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function rawSet(key, value) {
  memory.set(key, value);
  try {
    backend?.setItem(key, value);
  } catch {
    /* quota or blocked: memory copy still works for this session */
  }
}

function rawDel(key) {
  memory.delete(key);
  try {
    backend?.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Namespaced JSON store: createStore('oktholm').scope('access-please').get('best', 0) */
export function createStore(prefix) {
  const p = (k) => `${prefix}:${k}`;
  const api = {
    get(key, fallback = null) {
      const v = rawGet(p(key));
      if (v == null) return fallback;
      try {
        return JSON.parse(v);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      rawSet(p(key), JSON.stringify(value));
      return value;
    },
    update(key, fn, fallback = null) {
      return api.set(key, fn(api.get(key, fallback)));
    },
    remove(key) {
      rawDel(p(key));
    },
    scope(name) {
      return createStore(`${prefix}:${name}`);
    },
    persistent: Boolean(backend),
  };
  return api;
}
