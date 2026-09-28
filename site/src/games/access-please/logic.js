// Access, Please: pure game logic (content resolution, rules, request generation, evaluation, budget).
// No DOM in here, so it can be checked in Node and reused by any brand pack.

export const GONE = ['terminated', 'expired', 'leave'];
const CONTRACT = ['contractor', 'expired'];
const GEN_KINDS = ['status', 'contractor', 'manager', 'sod', 'dept', 'shadow', 'forever'];
const MERGE = ['company', 'board', 'departments', 'copy', 'lines', 'replies', 'consequences', 'bulletins', 'conditions', 'cta', 'budget', 'diagnosis', 'shift'];

export function fmt(tpl, vars = {}) {
  return String(tpl ?? '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const firstName = (name = '') => String(name).trim().split(/\s+/)[0] || '';
export const timeBoxed = (d) => Boolean(d) && d.hours != null && d.hours <= 24;

/** Brand content wins; anything missing falls back to the module defaults (objects merge one level deep). */
export function resolveContent(content, defaults) {
  const c = content && typeof content === 'object' ? content : {};
  const out = { ...defaults };
  for (const [k, v] of Object.entries(c)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      if (v.length) out[k] = v;
    } else if (typeof v === 'object' && MERGE.includes(k)) out[k] = { ...(defaults[k] || {}), ...v };
    else out[k] = v;
  }
  if (c.copy) {
    for (const k of ['why', 'tabs', 'tabsShort', 'status']) {
      if (c.copy[k] && defaults.copy?.[k]) out.copy[k] = { ...defaults.copy[k], ...c.copy[k] };
    }
  }
  return out;
}

export function indexData(C) {
  const P = new Map(C.people.map((p) => [p.id, p]));
  const A = new Map(C.apps.map((a) => [a.id, a]));
  const S = new Map((C.shadowApps || []).map((s) => [s.id, { ...s, shadow: true }]));
  const reports = new Map();
  for (const p of C.people) {
    const m = p.manager || 'board';
    if (!reports.has(m)) reports.set(m, []);
    reports.get(m).push(p);
  }
  return { C, P, A, S, reports };
}

export function personName(data, id) {
  if (!id) return '—';
  if (id === 'board' || id === data.C.board?.id) return data.C.board?.name || 'Board of Directors';
  return data.P.get(id)?.name || String(id);
}
export const deptLabel = (C, id) => C.departments?.[id] || id || '—';

// ---------- Rules ----------
export const rulesFor = (C, day) => C.rules.filter((r) => day == null || r.day <= day);
export const checksOf = (rules) => new Set(rules.flatMap((r) => r.checks || []));
export const ruleFor = (C, check) => C.rules.find((r) => (r.checks || []).includes(check));

export function roleInfo(app, name) {
  if (!app || app.shadow) return { name, priv: false, mfa: false };
  return app.roles.find((r) => r.name === name) || { name, priv: false, mfa: false };
}

/** Returns the list of policy violations for a request under the active checks. Empty list = approvable. */
export function evaluate(req, checks, data) {
  const out = [];
  const p = req.person;
  const app = req.app;
  const roles = req.roles.map((n) => roleInfo(app, n));
  const priv = roles.some((r) => r.priv && !r.mfa);
  const mfa = roles.some((r) => r.mfa);
  const has = (c) => checks.has(c);
  if (has('status')) {
    if (!p || p.guest) out.push({ check: 'status', key: 'unknown' });
    else if (GONE.includes(p.status)) out.push({ check: 'status', key: p.status });
  }
  if (has('contractor') && p && CONTRACT.includes(p.status) && (priv || mfa)) out.push({ check: 'contractor' });
  if (has('manager')) {
    const a = req.approver || {};
    if (a.kind !== 'person') out.push({ check: 'manager', key: 'text' });
    else if (p && a.id === p.id) out.push({ check: 'manager', key: 'self' });
    else if (!p || !p.manager || a.id !== p.manager) out.push({ check: 'manager', key: 'person' });
  }
  if (has('sod') && app.sod) {
    const all = new Set([...(req.existing || []), ...req.roles]);
    if (app.sod.every((r) => all.has(r))) out.push({ check: 'sod' });
  }
  if (has('dept') && app.depts && p && !p.guest && !app.depts.includes(p.dept)) out.push({ check: 'dept' });
  if (has('shadow') && app.shadow) out.push({ check: 'shadow' });
  if (has('forever') && priv && !timeBoxed(req.duration)) out.push({ check: 'forever' });
  if (has('mfa') && mfa) out.push({ check: 'mfa' });
  return out;
}

export function varsFor(req, data) {
  const { C } = data;
  const p = req.person || {};
  const a = req.approver || {};
  return {
    name: p.name || '',
    first: firstName(p.name),
    title: p.title || '',
    app: req.app?.name || '',
    role: (req.roles || []).join(' + '),
    approver: a.kind === 'person' ? personName(data, a.id) : a.text || '',
    manager: p.manager ? personName(data, p.manager) : '—',
    until: p.until || '',
    dept: deptLabel(C, p.dept),
    claimedDept: req.claimed?.dept || '',
    depts: (req.app?.depts || []).map((d) => deptLabel(C, d)).join(' & '),
    duration: req.duration?.label || '',
    sodA: req.app?.sod?.[0] || '',
    sodB: req.app?.sod?.[1] || '',
    company: C.company?.short || C.company?.name || '',
  };
}

/** Human explanation of one violation, e.g. "Kevin Marsh was terminated on Sep 25 (HR Roster)." */
export function explain(v, req, data) {
  const why = data.C.copy?.why || {};
  const tpl = (v.key && why[`${v.check}.${v.key}`]) || why[v.check] || v.check;
  return fmt(tpl, varsFor(req, data));
}

// ---------- Request generation ----------
function pool(env, pred) {
  const all = env.data.C.people.filter((p) => !p.storyOnly && pred(p));
  const fresh = all.filter((p) => !env.used.has(p.id));
  return fresh.length ? fresh : all;
}
function pickPerson(env, pred) {
  const list = pool(env, pred);
  return list.length ? env.rng.pick(list) : null;
}
const allowedApps = (env, p) => env.data.C.apps.filter((a) => !a.storyOnly && (!a.depts || a.depts.includes(p.dept)));
const existingOf = (p, app) => (p.access && p.access[app.id]) || [];
const sodConflict = (app, existing, role) => Boolean(app.sod) && app.sod.includes(role) && app.sod.some((x) => x !== role && existing.includes(x));

function toDuration(C, d) {
  if (d && typeof d === 'object') return { label: d.label, hours: d.hours ?? null };
  return C.durations.find((x) => x.label === d) || { label: String(d || 'Permanent'), hours: null };
}

function base(env, p, app, roles) {
  const { C } = env.data;
  const privRole = roles.some((n) => roleInfo(app, n).priv);
  const common = C.durations.filter((d) => !d.rare);
  const boxed = common.filter(timeBoxed);
  const duration = privRole && env.checks.has('forever') ? env.rng.pick(boxed.length ? boxed : common) : env.rng.pick(common);
  return {
    person: p,
    claimed: { title: p.title, dept: deptLabel(C, p.dept) },
    app,
    roles,
    existing: existingOf(p, app),
    duration,
    approver: { kind: 'person', id: p.manager || 'board' },
    via: env.rng.pick(C.channels),
    text: '',
  };
}

function say(env, req, key, fallback = 'legit') {
  const L = env.data.C.lines || {};
  const list = (L[key] && L[key].length ? L[key] : L[fallback]) || ['…'];
  return fmt(env.rng.pick(list), varsFor(req, env.data));
}

const GEN = {
  legit(env) {
    const { rng } = env;
    const p = rng.chance(0.8) ? pickPerson(env, (x) => x.status === 'active') : pickPerson(env, (x) => x.status === 'contractor');
    if (!p) return null;
    const app = rng.pick(allowedApps(env, p));
    if (!app) return null;
    const ex = existingOf(p, app);
    let roles = app.roles.filter((r) => !r.mfa && !ex.includes(r.name) && !sodConflict(app, ex, r.name));
    if (p.status === 'contractor') roles = roles.filter((r) => !r.priv);
    if (!roles.length) return null;
    const plain = roles.filter((r) => !r.priv);
    const role = plain.length && rng.chance(0.7) ? rng.pick(plain) : rng.pick(roles);
    const r = base(env, p, app, [role.name]);
    r.text = say(env, r, rng.chance(0.3) ? 'urgent' : 'legit');
    return r;
  },
  status(env) {
    const p = pickPerson(env, (x) => GONE.includes(x.status));
    if (!p) return null;
    const app = env.rng.pick(allowedApps(env, p));
    const roles = app ? app.roles.filter((r) => !r.priv && !r.mfa && !sodConflict(app, existingOf(p, app), r.name)) : [];
    if (!roles.length) return null;
    const r = base(env, p, app, [env.rng.pick(roles).name]);
    r.text = say(env, r, p.status === 'leave' ? 'leave' : 'status');
    return r;
  },
  contractor(env) {
    const p = pickPerson(env, (x) => x.status === 'contractor');
    if (!p) return null;
    const app = env.rng.pick(allowedApps(env, p).filter((a) => a.roles.some((r) => r.priv && !r.mfa)));
    if (!app) return null;
    const role = env.rng.pick(app.roles.filter((r) => r.priv && !r.mfa));
    const r = base(env, p, app, [role.name]);
    r.text = say(env, r, env.rng.chance(0.65) ? 'contractor' : 'overreach');
    return r;
  },
  manager(env) {
    const { rng, data } = env;
    const p = pickPerson(env, (x) => x.status === 'active' && data.P.has(x.manager));
    if (!p) return null;
    const app = rng.pick(allowedApps(env, p));
    const ex = existingOf(p, app);
    const roles = app.roles.filter((r) => !r.mfa && !ex.includes(r.name) && !sodConflict(app, ex, r.name));
    if (!roles.length) return null;
    const r = base(env, p, app, [rng.pick(roles).name]);
    const mgr = data.P.get(p.manager);
    const variants = [['self', p.id], ['text', null], ['text', null]];
    if (mgr && data.P.has(mgr.manager)) variants.push(['skip', mgr.manager]);
    const peers = data.C.people.filter((x) => x.manager === p.manager && x.id !== p.id && x.status === 'active' && !x.storyOnly);
    if (peers.length) variants.push(['peer', rng.pick(peers).id]);
    const bosses = data.C.people.filter((x) => x.approvesAnything && x.id !== p.manager && x.id !== p.id);
    if (bosses.length) variants.push(['vp', rng.pick(bosses).id], ['vp', rng.pick(bosses).id]);
    const [kind, id] = rng.pick(variants);
    r.approver = kind === 'text' ? { kind: 'text', text: rng.pick(data.C.approvalFakes) } : { kind: 'person', id };
    r.text = say(env, r, kind === 'text' ? 'noApproval' : kind === 'self' ? 'selfApproval' : 'wrongApprover');
    return r;
  },
  sod(env) {
    const app = env.data.C.apps.find((a) => a.sod);
    if (!app) return null;
    const p = pickPerson(env, (x) => x.status === 'active' && (!app.depts || app.depts.includes(x.dept)) && existingOf(x, app).some((n) => app.sod.includes(n)));
    const q = p || pickPerson(env, (x) => x.status === 'active' && (!app.depts || app.depts.includes(x.dept)));
    if (!q) return null;
    const ex = existingOf(q, app);
    const missing = app.sod.filter((n) => !ex.includes(n));
    if (!missing.length) return null;
    const r = base(env, q, app, missing);
    r.text = say(env, r, 'sod');
    return r;
  },
  dept(env) {
    const { rng, data } = env;
    const app = rng.pick(data.C.apps.filter((a) => a.depts));
    if (!app) return null;
    const p = pickPerson(env, (x) => x.status === 'active' && !app.depts.includes(x.dept) && x.dept !== 'exec');
    if (!p) return null;
    const roles = app.roles.filter((r) => !r.priv && !r.mfa && !(app.sod || []).includes(r.name));
    if (!roles.length) return null;
    const r = base(env, p, app, [rng.pick(roles).name]);
    if (rng.chance(0.5)) r.claimed.dept = deptLabel(data.C, app.depts[0]);
    r.text = say(env, r, 'dept');
    return r;
  },
  shadow(env) {
    const { rng, data } = env;
    const apps = [...data.S.values()];
    if (!apps.length) return null;
    const p = pickPerson(env, (x) => x.status === 'active' || x.status === 'contractor');
    if (!p) return null;
    const app = rng.pick(apps);
    const r = base(env, p, app, [app.scope]);
    r.text = app.pitch && rng.chance(0.45) ? app.pitch : say(env, r, 'shadow');
    return r;
  },
  forever(env) {
    const { rng, data } = env;
    const p = pickPerson(env, (x) => x.status === 'active');
    if (!p) return null;
    const app = rng.pick(allowedApps(env, p).filter((a) => a.roles.some((r) => r.priv && !r.mfa)));
    if (!app) return null;
    const role = rng.pick(app.roles.filter((r) => r.priv && !r.mfa && !existingOf(p, app).includes(r.name)));
    if (!role) return null;
    const r = base(env, p, app, [role.name]);
    r.duration = rng.pick(data.C.durations.filter((d) => !timeBoxed(d)));
    r.text = say(env, r, rng.chance(0.6) ? 'forever' : 'overreach');
    return r;
  },
};

function generate(kind, env, depth = 0) {
  for (let attempt = 0; attempt < 16; attempt++) {
    const r = GEN[kind]?.(env);
    if (!r) continue;
    const v = evaluate(r, env.checks, env.data);
    const ok = kind === 'legit' ? v.length === 0 : v.length === 1 && v[0].check === kind;
    if (ok) {
      env.used.add(r.person.id);
      r.kind = kind;
      return r;
    }
  }
  return kind === 'legit' || depth > 0 ? null : generate('legit', env, 1);
}

export function storyValid(s, data) {
  const who = s.person ? data.P.has(s.person) : Boolean(s.guest);
  const app = s.app ? data.A.has(s.app) : s.shadow ? data.S.has(s.shadow) : false;
  const ok = s.approverText ? true : s.approver === 'board' || data.P.has(s.approver);
  return who && app && ok;
}

export function storyReq(s, data, rng) {
  const { C } = data;
  const p = s.person ? data.P.get(s.person) : { ...s.guest, guest: true, id: `guest:${s.id}` };
  const app = s.app ? data.A.get(s.app) : data.S.get(s.shadow);
  return {
    story: s,
    kind: 'story',
    person: p,
    claimed: { title: s.claimedTitle || p.title, dept: s.claimedDept || deptLabel(C, p.dept) },
    app,
    roles: s.roles && s.roles.length ? s.roles : [app.scope],
    existing: s.existing || existingOf(p, app),
    duration: toDuration(C, s.duration),
    approver: s.approverText ? { kind: 'text', text: s.approverText } : { kind: 'person', id: s.approver },
    via: s.via || rng.pick(C.channels),
    text: s.text,
    boss: Boolean(s.boss),
  };
}

/**
 * Builds one shift. `day` = campaign day (1..5); `daily` = the shared Daily Shift (full policy book).
 * Everything random comes from `rng`, so the Daily Shift is identical for everyone on the same UTC day.
 */
export function buildShift({ C, data, rng, day, daily = false, count }) {
  const rules = rulesFor(C, daily ? null : day);
  const checks = checksOf(rules);
  const newChecks = daily ? new Set() : checksOf(C.rules.filter((r) => r.day === day));
  const used = new Set();
  const stories = C.stories.filter((s) => storyValid(s, data) && (daily || s.day === day));
  let picked = [];
  if (daily) {
    const bosses = stories.filter((s) => s.boss);
    if (bosses.length) picked.push(rng.pick(bosses));
    const others = rng.shuffle(stories.filter((s) => !s.boss));
    for (const d of rng.shuffle([1, 2, 3, 4, 5])) {
      const s = others.find((o) => o.day === d && !picked.includes(o));
      if (s && picked.length < 4) picked.push(s);
    }
  } else {
    picked = stories.slice(0, Math.max(0, count - 4));
  }
  const storyReqs = picked.map((s) => storyReq(s, data, rng));
  storyReqs.forEach((r) => used.add(r.person.id));
  const genCount = Math.max(0, count - storyReqs.length);
  const storyLegit = storyReqs.filter((r) => evaluate(r, checks, data).length === 0).length;
  const legitN = clamp(Math.round(count * 0.5) - storyLegit, Math.min(1, genCount), Math.max(0, genCount - 1));
  const kinds = GEN_KINDS.filter((k) => checks.has(k));
  const weighted = kinds.flatMap((k) => Array(newChecks.has(k) ? 3 : 1).fill(k));
  const plan = Array(legitN).fill('legit');
  for (const k of kinds.filter((x) => newChecks.has(x))) if (plan.length < genCount) plan.push(k);
  while (plan.length < genCount && weighted.length) plan.push(rng.pick(weighted));
  const env = { data, rng, checks, used };
  const genReqs = plan.map((k) => generate(k, env)).filter(Boolean);

  let all = rng.shuffle([...storyReqs, ...genReqs]);
  // Boss requests (the CEO, the nephew) land in the last third, where a climax belongs.
  const bossIdx = all.findIndex((r) => r.boss);
  if (bossIdx >= 0 && all.length > 3) {
    const [b] = all.splice(bossIdx, 1);
    all.splice(rng.int(Math.ceil(all.length * 0.66), all.length), 0, b);
  }
  // Warm-up: the first ticket of Day 1 is a plain, approvable one.
  if (!daily && day === 1) {
    const i = all.findIndex((r) => r.kind === 'legit');
    if (i > 0) all.unshift(all.splice(i, 1)[0]);
  }
  let no = 48000 + rng.int(100, 900) + (daily ? 0 : day * 1000);
  all = all.map((r) => ({ ...r, no: `INC-${String((no += rng.int(3, 19))).padStart(7, '0')}` }));
  return { rules, checks, newChecks, reqs: all };
}

// ---------- Sanity budget ----------
export function budgetOutcome({ sanity, max = 10, earned, eventCost = 0, findings = 0, clean = false, alloc = {}, B }) {
  const items = B.items || [];
  const available = Math.max(0, earned - eventCost);
  const spent = items.reduce((s, it) => s + (alloc[it.id] ? it.cost : 0), 0);
  const effects = items.map((it) => ({ it, funded: Boolean(alloc[it.id]), delta: alloc[it.id] ? it.fund || 0 : -(it.skip || 0) }));
  const stress = Math.floor(findings / (B.stressPer || 2));
  const bonus = clean ? B.cleanBonus || 0 : 0;
  const delta = effects.reduce((s, e) => s + e.delta, 0) - stress + bonus;
  return { available, spent, remaining: available - spent, effects, stress, bonus, delta, next: clamp(sanity + delta, 0, max) };
}

export function greedyAlloc(available, B) {
  const alloc = {};
  let left = available;
  for (const id of B.priority || (B.items || []).map((i) => i.id)) {
    const it = (B.items || []).find((i) => i.id === id);
    if (it && it.cost <= left) {
      alloc[id] = true;
      left -= it.cost;
    }
  }
  return alloc;
}
