// 4096 Groups: 2048 where every tile is an Active Directory group.
//
// Two equal groups merge into a bigger group with a worse name (the brand's name ladder). The score is
// "groups created": every spawn and every merge counts, so the number only goes up, like real group sprawl.
// Every ~15 moves a reorg renames the department and spawns extra groups; tiles keep the name they were
// created under and merges keep the older (legacy) name. Undo is an "Enterprise tier" joke.
// All copy lives in ctx.content (brands/<brand>/modules/groups.js). DEFAULTS keep the module brand-agnostic.
import './style.css';

const DEFAULTS = {
  departments: [{ name: 'Team', reorgs: ['Team-2', 'New-Team'] }],
  ladder: ['{dept}', '{dept}-All', '{dept}-All-v2', '{dept}-All-v2-FINAL', '{dept}-FINAL-2', '{DEPT}-LEGACY', 'zz_old_{dept}', 'Everyone', 'Everyone (Custom)', 'Admins-Temp', 'Allow-All', 'All Groups'],
  notes: [],
  milestoneFrom: 32,
  reorgEvery: 15,
  reorgToasts: ['Reorg! {old} is now {new}.'],
  reorgAgainToasts: ['Reorg! {old} is {new} again.'],
  reorgHomeToasts: [],
  ranks: [{ min: 0, title: 'Group Creator' }],
  copy: {
    kicker: 'Directory · {dept}',
    scoreLabel: 'Groups created',
    bestLabel: 'Best',
    deptLabel: 'Department',
    formerly: 'formerly {old}',
    reorgLabel: 'Next reorg',
    reorgIn: 'in {n} moves',
    reorgOne: 'next move',
    biggestLabel: 'Biggest group',
    hint: 'Arrow keys, WASD or swipe. Equal groups merge.',
    ladderTitle: 'Naming convention',
    locked: '???',
    undo: 'Undo',
    undoLock: 'Enterprise tier only',
    undoToast: 'Undo is not included in your plan.',
    restart: 'New game',
    restartConfirm: 'Sure?',
    resign: 'Resign',
    resignConfirm: 'Sure?',
    feedStart: 'Two groups already exist.',
    feedCreated: '+ Created {name}',
    milestone: 'Created {name}. {note}',
    tier: 'tier {v}',
    over: 'Directory full',
    overSub: 'No moves left.',
    resigned: 'Resigned',
    resignedSub: 'The groups remain.',
    won: 'You won',
    wonSub: 'The biggest group exists.',
    keepGoing: 'Keep going',
    seeReport: 'See results',
  },
  results: {
    kicker: 'Report',
    title: 'You created {groups} groups.',
    sub: '',
    rank: 'Diagnosis: {rank}',
    biggest: 'Biggest group',
    moves: 'Moves',
    reorgs: 'Reorgs survived',
    best: 'Personal best: {groups} groups',
    newBest: 'New personal best.',
    replay: 'New game',
    shareTitle: 'Share',
  },
  share: 'I created {groups} groups playing 4096 Groups. Biggest: “{best}”. Send help:',
  cta: { kicker: 'Prescription', title: 'Fewer groups, fewer problems', body: '{rbac} {reviews}' },
};

const N = 4;
const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const KEYMAP = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right', w: 'up', a: 'left', s: 'down', d: 'right' };
const SLIDE_MS = 120;
const WIN_VALUE = 4096;
const CHIP_VALUE = 64;

function isObj(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

/** Deep-merge plain objects; arrays and scalars from `over` replace the defaults (empty arrays don't). */
function merge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over || {})) {
    if (v == null) continue;
    if (isObj(v) && isObj(base[k])) out[k] = merge(base[k], v);
    else if (Array.isArray(v) && !v.length && Array.isArray(base[k])) continue;
    else out[k] = v;
  }
  return out;
}

const tierOf = (v) => Math.round(Math.log2(v));
// Zero-width spaces after separators let long group names wrap at "-" and "_" instead of mid-word.
const breakable = (s) => String(s).replace(/([-_/])/g, '$1​').replace(/\(/g, '​(');

export default {
  id: 'groups',
  kind: 'game',
  title: '4096 Groups',
  blurb: '2048, except every tile is a directory group and the score is a confession.',
  emoji: '🗂️',
  minutes: '5 min',
  therapy: 'Treats: Compulsive Group Creation Disorder',

  mount(root, ctx) {
    const { el, disposer, fill, formatNumber, prefersReducedMotion } = ctx.dom;
    const d = disposer();
    const C = merge(DEFAULTS, ctx.content || {});
    const facts = ctx.brand?.sponsor?.facts || {};
    const reduced = prefersReducedMotion();
    const slide = reduced ? 0 : SLIDE_MS;
    const depts = C.departments.filter((x) => x && x.name);
    const reorgEvery = Math.max(4, Math.round(Number(C.reorgEvery) || 15));
    const milestoneTier = tierOf(Math.max(4, Number(C.milestoneFrom) || 32));

    // Reorgs walk the department's chain of names and then start over: every name comes back eventually.
    const chainOf = (i) => {
      const base = depts[i] || depts[0];
      return [base.name, ...(base.reorgs || [])];
    };
    const deptName = (i, n) => {
      const chain = chainOf(i);
      return chain[((n % chain.length) + chain.length) % chain.length];
    };
    const vars = (dept) => ({ dept, DEPT: String(dept).toUpperCase() });
    const groupName = (v, dept) => {
      const k = tierOf(v);
      const last = C.ladder.length;
      const tpl = C.ladder[k - 1] ?? `${C.ladder[last - 1] || 'Group'} #${k - last + 1}`;
      return fill(tpl, vars(dept));
    };
    const noteFor = (v, dept) => fill(C.notes[tierOf(v) - 1] || '', vars(dept));
    const rankFor = (n) => [...C.ranks].sort((a, b) => a.min - b.min).filter((r) => n >= r.min).pop()?.title || '';

    // ---------- Layout ----------
    const wrap = el('div.gr');
    root.append(wrap);
    const ui = {
      kicker: el('div.kicker.gr-kicker'),
      score: el('div.gr-score.pixel', '0'),
      best: el('div.gr-stat__val.pixel', '0'),
      dept: el('div.gr-dept'),
      formerly: el('div.gr-formerly'),
      reorg: el('div.gr-stat__val.gr-reorg'),
      reorgFill: el('div.gr-reorg__fill'),
      biggest: el('div.gr-biggest'),
      cells: el('div.gr-cells', Array.from({ length: N * N }, () => el('div.gr-cell'))),
      tiles: el('div.gr-tiles'),
      tip: el('div.gr-tip', { hidden: true, role: 'tooltip' }),
      overlay: el('div.gr-overlay', { hidden: true }),
      feed: el('p.gr-feed.mono', { 'aria-live': 'polite' }),
      ladderList: el('ol.gr-ladder__list'),
    };
    ui.board = el(
      'div.gr-board',
      { role: 'group', tabindex: '0', 'aria-label': `${ctx.meta?.title || '4096 Groups'}. ${C.copy.hint}`, 'aria-describedby': 'gr-feed' },
      ui.cells,
      ui.tiles,
    );
    ui.feed.id = 'gr-feed';
    ui.undo = el(
      'button.btn.btn--ghost.btn--sm.gr-undo',
      { type: 'button', 'aria-disabled': 'true', onclick: () => undoJoke() },
      el('span.gr-undo__label', `↶ ${C.copy.undo}`),
      el('span.gr-undo__lock', `🔒 ${C.copy.undoLock}`),
    );
    ui.restart = el(
      'button.btn.btn--ghost.btn--sm.gr-restart',
      {
        type: 'button',
        onclick: () =>
          confirmThen(ui.restart, C.copy.restart, C.copy.restartConfirm, () => {
            newGame();
            focusBoard();
          }, () => G && G.moves > 0 && !G.over),
      },
      C.copy.restart,
    );
    ui.resign = el('button.btn.btn--ghost.btn--sm.gr-resign', { type: 'button', onclick: () => confirmThen(ui.resign, C.copy.resign, C.copy.resignConfirm, () => end('resigned'), () => true) }, C.copy.resign);
    ui.ladder = el('details.gr-ladder', el('summary.gr-ladder__sum', C.copy.ladderTitle), ui.ladderList);
    const results = el('section.gr-results', { hidden: true });

    wrap.append(
      el('header.gr-head', ui.kicker, el('h2.gr-title.display', ctx.meta?.title || '4096 Groups')),
      el(
        'div.gr-main',
        el(
          'div.gr-stats',
          el('div.gr-stat.gr-stat--score', el('div.gr-stat__label', C.copy.scoreLabel), ui.score),
          el('div.gr-stat.gr-stat--best', el('div.gr-stat__label', C.copy.bestLabel), ui.best),
          el('div.gr-stat.gr-stat--dept', el('div.gr-stat__label', C.copy.deptLabel), ui.dept, ui.formerly),
          el('div.gr-stat.gr-stat--reorg', el('div.gr-stat__label', C.copy.reorgLabel), ui.reorg, el('div.gr-reorg__bar', ui.reorgFill)),
          el('div.gr-stat.gr-stat--biggest', el('div.gr-stat__label', C.copy.biggestLabel), ui.biggest),
        ),
        el('div.gr-play', el('div.gr-board-wrap', ui.board, ui.tip, ui.overlay), ui.feed, el('div.gr-controls', ui.undo, ui.restart, ui.resign)),
        el('div.gr-extra', ui.ladder, el('p.gr-hint', C.copy.hint)),
      ),
      results,
    );
    ui.ladder.open = root.getBoundingClientRect().width >= 760;

    // ---------- State ----------
    let G = null;
    const at = (r, c) => G.cells[r * N + c];
    const put = (r, c, t) => {
      G.cells[r * N + c] = t;
      if (t) {
        t.r = r;
        t.c = c;
      }
    };
    const curDept = () => deptName(G.deptIdx, G.reorgs);
    const bestStore = () => ctx.store.get('best', null) || { groups: 0, value: 0, name: '' };

    function newTile(v, dept, born, r, c) {
      return { id: G.nextId++, v, dept, born, r, c, el: null, nameEl: null, name: groupName(v, dept) };
    }

    function blankState(seed, deptIdx) {
      return {
        seed,
        rng: ctx.rng.seeded(`${seed}:0`),
        cells: Array(N * N).fill(null),
        score: 0,
        moves: 0,
        reorgs: 0,
        deptIdx,
        born: 0,
        nextId: 1,
        bestV: 0,
        bestName: '',
        seen: new Set(),
        lastReorg: 0,
        nextReorg: reorgEvery,
        over: false,
        won: false,
        paused: false,
      };
    }

    function newGame() {
      const seed = Math.floor(Math.random() * 2147483647);
      const rng = ctx.rng.seeded(seed);
      G = blankState(seed, rng.int(0, depts.length - 1));
      G.rng = rng;
      G.nextReorg = reorgEvery + rng.int(-2, 2);
      resetDom();
      const first = spawn(2);
      renderMove({ spawned: first });
      setFeed(C.copy.feedStart);
      hud(false);
      renderLadder();
      save();
    }

    // Keep arrow keys pointed at the board after a button click (and hide the button's focus ring).
    function focusBoard() {
      if (G && !G.over) ui.board.focus({ preventScroll: true });
    }

    function restore(s) {
      try {
        if (!s || s.v !== 1 || !Array.isArray(s.cells) || s.cells.length !== N * N) return false;
        const deptIdx = Number.isInteger(s.deptIdx) && depts[s.deptIdx] ? s.deptIdx : 0;
        G = blankState(Number(s.seed) || 1, deptIdx);
        G.rng = ctx.rng.seeded(`${G.seed}:${Number(s.moves) || 0}`);
        Object.assign(G, {
          score: Number(s.score) || 0,
          moves: Number(s.moves) || 0,
          reorgs: Number(s.reorgs) || 0,
          born: Number(s.born) || 0,
          bestV: Number(s.bestV) || 0,
          bestName: String(s.bestName || ''),
          lastReorg: Number(s.lastReorg) || 0,
          nextReorg: Number(s.nextReorg) || reorgEvery,
          won: Boolean(s.won),
          seen: new Set((s.seen || []).filter(Number.isFinite)),
        });
        let count = 0;
        s.cells.forEach((cell, i) => {
          if (!Array.isArray(cell)) return;
          const [v, dept, born] = cell;
          if (!Number.isFinite(v) || v < 2 || (v & (v - 1)) !== 0) throw new Error('bad tile');
          const t = newTile(v, String(dept || curDept()), Number(born) || 0, 0, 0);
          put(Math.floor(i / N), i % N, t);
          note(t);
          count += 1;
        });
        if (!count) return false;
        resetDom();
        renderMove({ spawned: G.cells.filter(Boolean), instant: true });
        setFeed(fill(C.copy.feedCreated, { name: G.bestName || groupName(2, curDept()) }));
        hud(false);
        renderLadder();
        if (!movesLeft()) end('over');
        return true;
      } catch {
        return false;
      }
    }

    function save() {
      if (!G || G.over) {
        ctx.store.set('current', null);
        return;
      }
      ctx.store.set('current', {
        v: 1,
        seed: G.seed,
        cells: G.cells.map((t) => (t ? [t.v, t.dept, t.born] : 0)),
        score: G.score,
        moves: G.moves,
        reorgs: G.reorgs,
        deptIdx: G.deptIdx,
        born: G.born,
        bestV: G.bestV,
        bestName: G.bestName,
        seen: [...G.seen],
        lastReorg: G.lastReorg,
        nextReorg: G.nextReorg,
        won: G.won,
      });
    }

    /** Records a tile's tier. Returns true the first time this game sees that tier. */
    function note(t) {
      const k = tierOf(t.v);
      if (t.v > G.bestV) {
        G.bestV = t.v;
        G.bestName = t.name;
      }
      if (G.seen.has(k)) return false;
      G.seen.add(k);
      return true;
    }

    function spawn(count) {
      const empty = [];
      G.cells.forEach((t, i) => !t && empty.push(i));
      const out = [];
      for (let k = 0; k < count && empty.length; k++) {
        const i = empty.splice(G.rng.int(0, empty.length - 1), 1)[0];
        const t = newTile(G.rng() < 0.9 ? 2 : 4, curDept(), G.born++, Math.floor(i / N), i % N);
        put(t.r, t.c, t);
        G.score += 1;
        note(t);
        out.push(t);
      }
      return out;
    }

    function movesLeft() {
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const t = at(r, c);
          if (!t) return true;
          if (c < N - 1 && at(r, c + 1)?.v === t.v) return true;
          if (r < N - 1 && at(r + 1, c)?.v === t.v) return true;
        }
      }
      return false;
    }

    function move(dir) {
      if (!G || G.over || G.paused) return false;
      hideTip();
      const [dr, dc] = DIRS[dir];
      const rows = dr > 0 ? [3, 2, 1, 0] : [0, 1, 2, 3];
      const cols = dc > 0 ? [3, 2, 1, 0] : [0, 1, 2, 3];
      const fresh = new Set();
      const gone = [];
      const created = [];
      let moved = false;
      for (const r of rows) {
        for (const c of cols) {
          const t = at(r, c);
          if (!t) continue;
          let nr = r;
          let nc = c;
          let merged = false;
          for (;;) {
            const rr = nr + dr;
            const cc = nc + dc;
            if (rr < 0 || rr >= N || cc < 0 || cc >= N) break;
            const o = at(rr, cc);
            if (!o) {
              nr = rr;
              nc = cc;
              continue;
            }
            if (o.v === t.v && !fresh.has(o)) {
              // The merged group keeps the older tile's department: legacy names are forever.
              const older = o.born <= t.born ? o : t;
              const m = newTile(t.v * 2, older.dept, Math.min(o.born, t.born), rr, cc);
              put(r, c, null);
              put(rr, cc, m);
              fresh.add(m);
              gone.push({ t, r: rr, c: cc }, { t: o, r: rr, c: cc });
              created.push(m);
              merged = true;
            }
            break;
          }
          if (merged) moved = true;
          else if (nr !== r || nc !== c) {
            put(r, c, null);
            put(nr, nc, t);
            moved = true;
          }
        }
      }
      if (!moved) {
        blocked();
        return false;
      }

      G.moves += 1;
      G.score += created.length;
      const firsts = created.filter((m) => note(m));
      const spawned = spawn(1);
      let reorg = null;
      if (G.moves >= G.nextReorg) reorg = doReorg();
      renderMove({ gone, created, spawned: [...spawned, ...(reorg ? reorg.spawned : [])] });

      const top = created.reduce((a, b) => (!a || b.v > a.v ? b : a), null);
      if (top) {
        ctx.sfx.tone(240 * Math.pow(1.13, tierOf(top.v)), 0.08, { type: 'square', gain: 0.03 });
        if (top.v >= CHIP_VALUE) ctx.sfx.tone(880, 0.12, { type: 'triangle', gain: 0.04, delay: 0.07 });
      } else ctx.sfx.tone(330, 0.025, { type: 'triangle', gain: 0.018 });
      if (!reorg) setFeed(fill(C.copy.feedCreated, { name: (top || spawned[0])?.name || '' }));
      if (G.moves === 1) ctx.track('game_start', { dept: depts[G.deptIdx]?.name });

      const milestone = firsts.filter((m) => tierOf(m.v) >= milestoneTier).sort((a, b) => b.v - a.v)[0];
      if (milestone) {
        const text = fill(C.copy.milestone, { name: milestone.name, note: noteFor(milestone.v, milestone.dept) }).trim();
        ctx.ui.toast(text, { kind: 'good', icon: '🗂️', ms: 4000 });
        renderLadder();
      } else if (firsts.length) renderLadder();
      if (created.some((m) => m.v >= CHIP_VALUE)) ctx.referral.grantChip('group-hoarder');

      hud(true);
      save();
      if (!G.won && created.some((m) => m.v >= WIN_VALUE)) win();
      else if (!movesLeft()) end('over');
      return true;
    }

    function doReorg() {
      const old = curDept();
      G.reorgs += 1;
      G.lastReorg = G.moves;
      G.nextReorg = G.moves + reorgEvery + G.rng.int(-2, 2);
      const nw = curDept();
      // Extra groups appear with every reorg, but a nearly full board only gets renamed (losing to a slide deck is no fun).
      const free = G.cells.filter((t) => !t).length;
      const spawned = spawn(free >= 6 ? 2 : free >= 3 ? 1 : 0);
      const chain = chainOf(G.deptIdx);
      const home = G.reorgs % chain.length === 0 && C.reorgHomeToasts.length > 0;
      const again = G.reorgs >= chain.length && C.reorgAgainToasts.length > 0;
      const pool = home ? C.reorgHomeToasts : again ? C.reorgAgainToasts : C.reorgToasts;
      const text = fill(pool[G.rng.int(0, pool.length - 1)] || '', { old, new: nw });
      ctx.ui.toast(text, { kind: 'bad', icon: '🔄', ms: 4600 });
      setFeed(text, 'reorg');
      ctx.sfx.tone(523, 0.09, { type: 'sawtooth', gain: 0.035 });
      ctx.sfx.tone(392, 0.16, { type: 'sawtooth', gain: 0.035, delay: 0.1 });
      if (!reduced) flash(ui.board, 'is-reorg', 600);
      return { old, nw, spawned };
    }

    // ---------- Rendering ----------
    let tilePx = 0;
    const fitCache = new Map();
    const overflows = (n) => n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1;

    function measure() {
      const w = ui.cells.firstElementChild?.getBoundingClientRect().width || 0;
      const changed = Math.round(w) !== Math.round(tilePx);
      tilePx = w;
      return changed;
    }

    /** Shrinks a tile's name until it fits (cached per name and tile size); clamps with an ellipsis at the floor. */
    function fit(t) {
      const lab = t.nameEl;
      if (!lab || !tilePx) return;
      const key = `${t.name}|${Math.round(tilePx)}`;
      let size = fitCache.get(key);
      if (size == null) {
        const max = Math.min(26, tilePx * 0.2);
        const min = Math.max(8, Math.min(10, tilePx * 0.105));
        size = max;
        lab.classList.remove('is-clamped');
        lab.style.fontSize = `${size}px`;
        while (size > min && overflows(lab)) {
          size = Math.max(min, size - 0.5);
          lab.style.fontSize = `${size}px`;
        }
        fitCache.set(key, size);
      }
      lab.style.fontSize = `${size}px`;
      lab.classList.toggle('is-clamped', overflows(lab));
    }

    function setPos(node, r, c) {
      node.style.setProperty('--r', r);
      node.style.setProperty('--c', c);
    }

    function addTileEl(t, cls) {
      const label = el('span.gr-tile__name', el('span.gr-tile__txt', breakable(t.name)));
      const node = el(
        `div.gr-tile.gr-t${Math.min(tierOf(t.v), 13)}`,
        { title: `${t.name} (${t.v})`, dataset: { id: String(t.id) } },
        el('div.gr-tile__inner', el('span.gr-tile__val', String(t.v)), label),
      );
      t.el = node;
      t.nameEl = label;
      setPos(node, t.r, t.c);
      if (cls && !reduced) {
        node.classList.add(cls);
        d.timeout(() => node.classList.remove(cls), slide + 280);
      }
      ui.tiles.append(node);
      fit(t);
    }

    function renderMove({ gone = [], created = [], spawned = [], instant = false }) {
      if (!tilePx) measure();
      for (const t of G.cells) if (t && t.el) setPos(t.el, t.r, t.c);
      for (const g of gone) {
        const node = g.t.el;
        if (!node) continue;
        g.t.el = null;
        node.classList.add('is-leaving');
        setPos(node, g.r, g.c);
        d.timeout(() => node.remove(), slide + 30);
      }
      for (const m of created) addTileEl(m, instant ? '' : 'is-merged');
      for (const s of spawned) addTileEl(s, instant ? '' : 'is-new');
    }

    function resetDom() {
      ui.tiles.replaceChildren();
      ui.overlay.hidden = true;
      ui.overlay.replaceChildren();
      results.hidden = true;
      results.replaceChildren();
      wrap.classList.remove('is-over');
      hideTip();
    }

    function hud(bumped) {
      const best = bestStore();
      ui.kicker.textContent = fill(C.copy.kicker, { dept: deptName(G.deptIdx, 0) });
      ui.score.textContent = formatNumber(G.score);
      if (bumped && !reduced) flash(ui.score, 'is-bump', 200);
      ui.best.textContent = formatNumber(Math.max(best.groups || 0, G.score));
      ui.best.classList.toggle('is-new', G.score > (best.groups || 0) && (best.groups || 0) > 0);
      ui.dept.textContent = curDept();
      ui.formerly.textContent = G.reorgs ? fill(C.copy.formerly, { old: deptName(G.deptIdx, G.reorgs - 1) }) : '';
      const left = Math.max(0, G.nextReorg - G.moves);
      ui.reorg.textContent = left <= 1 ? C.copy.reorgOne : fill(C.copy.reorgIn, { n: left });
      ui.reorg.classList.toggle('is-soon', left <= 2);
      const span = Math.max(1, G.nextReorg - G.lastReorg);
      ui.reorgFill.style.transform = `scaleX(${Math.min(1, (G.moves - G.lastReorg) / span).toFixed(3)})`;
      ui.biggest.textContent = G.bestName || '—';
      ui.biggest.title = G.bestName || '';
    }

    function renderLadder() {
      const maxSeen = Math.max(1, ...G.seen);
      const base = deptName(G.deptIdx, 0);
      const upto = Math.min(Math.max(C.ladder.length, maxSeen), maxSeen + 1);
      const items = [];
      for (let k = 1; k <= upto; k++) {
        const seen = G.seen.has(k) || k < maxSeen;
        const v = 2 ** k;
        items.push(
          el(
            `li.gr-ladder__item${seen ? '' : '.is-locked'}`,
            el(`span.gr-ladder__chip.gr-t${Math.min(k, 13)}`, String(v)),
            el('span.gr-ladder__name', seen ? groupName(v, base) : C.copy.locked),
          ),
        );
      }
      ui.ladderList.replaceChildren(...items);
    }

    function setFeed(text, kind = '') {
      ui.feed.className = `gr-feed mono${kind ? ` is-${kind}` : ''}`;
      ui.feed.textContent = text;
      ui.feed.title = text;
    }

    function flash(node, cls, ms) {
      node.classList.remove(cls);
      void node.offsetWidth;
      node.classList.add(cls);
      d.timeout(() => node.classList.remove(cls), ms);
    }

    function blocked() {
      ctx.sfx.tone(110, 0.06, { type: 'sine', gain: 0.05 });
      if (!reduced) flash(ui.board, 'is-blocked', 260);
    }

    function undoJoke() {
      ctx.sfx.tone(196, 0.14, { type: 'square', gain: 0.03 });
      ctx.ui.toast(C.copy.undoToast, { kind: 'bad', icon: '🔒', ms: 4200 });
      if (!reduced) flash(ui.undo, 'is-denied', 400);
      focusBoard();
    }

    /** Two-step buttons for destructive actions: first click arms, second click (within 3s) confirms. */
    function confirmThen(btn, label, confirmLabel, action, needsConfirm) {
      if (!needsConfirm() || btn.classList.contains('is-armed')) {
        btn.classList.remove('is-armed');
        btn.textContent = label;
        action();
        return;
      }
      btn.classList.add('is-armed');
      btn.textContent = confirmLabel;
      d.timeout(() => {
        btn.classList.remove('is-armed');
        btn.textContent = label;
      }, 3000);
    }

    // ---------- Long-press tooltip (touch) and hover titles (mouse) ----------
    function showTip(t) {
      if (!t?.el) return;
      const noteText = noteFor(t.v, t.dept);
      ui.tip.replaceChildren(el('div.gr-tip__name', t.name), noteText && el('div.gr-tip__note', noteText), el('div.gr-tip__val.mono', fill(C.copy.tier, { v: t.v })));
      ui.tip.hidden = false;
      // Above the tile (below it on the top row), kept inside the board at the edges.
      const edge = t.c === 0 ? 'left' : t.c === N - 1 ? 'right' : 'mid';
      const below = t.r === 0;
      ui.tip.style.left = edge === 'left' ? '2%' : edge === 'right' ? '98%' : `${(t.c + 0.5) * 25}%`;
      ui.tip.style.top = `${(below ? t.r + 1 : t.r) * 25}%`;
      ui.tip.style.translate = `${edge === 'left' ? '0' : edge === 'right' ? '-100%' : '-50%'} ${below ? '6px' : 'calc(-100% - 6px)'}`;
    }
    function hideTip() {
      ui.tip.hidden = true;
    }

    // ---------- Input ----------
    const boardVisible = () => {
      const r = ui.board.getBoundingClientRect();
      return r.bottom > 40 && r.top < innerHeight - 40;
    };

    d.on(document, 'keydown', (e) => {
      if (!G || e.defaultPrevented || !wrap.isConnected) return;
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) return;
      if (document.querySelector('.modal-overlay')) return;
      const key = String(e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey && !G.over && boardVisible()) {
        e.preventDefault();
        undoJoke();
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const dir = KEYMAP[key];
      if (!dir || G.over || G.paused || !boardVisible()) return;
      e.preventDefault();
      if (!e.repeat) move(dir);
    });

    let sw = null;
    let pressTimer = 0;
    const cancelPress = () => {
      clearTimeout(pressTimer);
      pressTimer = 0;
    };
    d(cancelPress);
    const swipeMin = () => Math.max(18, Math.min(40, ui.board.clientWidth * 0.07));
    const swipeDir = (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');

    d.on(ui.board, 'pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      sw = { id: e.pointerId, x: e.clientX, y: e.clientY, done: false, long: false };
      try {
        ui.board.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic pointers can't be captured */
      }
      hideTip();
      const tileNode = e.target?.closest?.('.gr-tile');
      if (tileNode && e.pointerType !== 'mouse') {
        const t = G?.cells.find((x) => x && String(x.id) === tileNode.dataset.id);
        cancelPress();
        pressTimer = setTimeout(() => {
          if (sw && !sw.done) {
            sw.long = true;
            showTip(t);
          }
        }, 450);
      }
    });
    d.on(ui.board, 'pointermove', (e) => {
      if (!sw || e.pointerId !== sw.id || sw.done || sw.long) return;
      const dx = e.clientX - sw.x;
      const dy = e.clientY - sw.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) cancelPress();
      if (dist >= swipeMin()) {
        sw.done = true;
        move(swipeDir(dx, dy));
      }
    });
    const endSwipe = (e) => {
      if (!sw || e.pointerId !== sw.id) return;
      cancelPress();
      if (!sw.done && !sw.long && e.type === 'pointerup') {
        const dx = e.clientX - sw.x;
        const dy = e.clientY - sw.y;
        if (Math.hypot(dx, dy) >= swipeMin()) move(swipeDir(dx, dy));
      }
      if (sw.long) d.timeout(hideTip, 1600);
      sw = null;
    };
    d.on(ui.board, 'pointerup', endSwipe);
    d.on(ui.board, 'pointercancel', endSwipe);
    // Belt and braces for iOS: never let a swipe on the board scroll the page.
    d.on(ui.board, 'touchmove', (e) => e.preventDefault(), { passive: false });
    d.on(ui.board, 'contextmenu', (e) => e.preventDefault());

    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(() => {
        if (measure() && G) {
          for (const t of G.cells) if (t) fit(t);
        }
      });
      ro.observe(ui.board);
      d(() => ro.disconnect());
    }

    // ---------- Endings ----------
    function showOverlay(title, sub, actions = []) {
      ui.overlay.replaceChildren(
        el(
          'div.gr-overlay__box',
          el('div.gr-overlay__title.display', title),
          sub && el('p.gr-overlay__sub', sub),
          actions.length > 0 && el('div.gr-overlay__actions', actions),
        ),
      );
      ui.overlay.hidden = false;
    }

    function win() {
      G.won = true;
      G.paused = true;
      save();
      ctx.referral.qualify('groups');
      ctx.sfx.coin();
      ctx.ui.confetti();
      showOverlay(C.copy.won, C.copy.wonSub, [
        el('button.btn.btn--vital.btn--sm', {
          type: 'button',
          onclick: () => {
            G.paused = false;
            ui.overlay.hidden = true;
            if (!movesLeft()) end('over');
          },
        }, C.copy.keepGoing),
        el('button.btn.btn--ghost.btn--sm', { type: 'button', onclick: () => end('won') }, C.copy.seeReport),
      ]);
    }

    function end(reason) {
      if (!G || G.over) return;
      G.over = true;
      G.paused = false;
      hideTip();
      wrap.classList.add('is-over');
      const prev = bestStore();
      const newBest = G.score > (prev.groups || 0);
      ctx.store.set('best', {
        groups: Math.max(prev.groups || 0, G.score),
        value: Math.max(prev.value || 0, G.bestV),
        name: G.bestV >= (prev.value || 0) ? G.bestName : prev.name,
      });
      ctx.store.update('games', (n) => (Number(n) || 0) + 1, 0);
      save();
      ctx.referral.qualify('groups');
      ctx.track('game_end', { reason, groups: G.score, best: G.bestV, moves: G.moves });
      if (reason === 'over') {
        showOverlay(C.copy.over, C.copy.overSub);
        ctx.sfx.flatline();
      } else if (reason === 'resigned') {
        showOverlay(C.copy.resigned, C.copy.resignedSub);
        ctx.sfx.bad();
      } else ui.overlay.hidden = true;
      hud(false);
      const snapshot = { groups: G.score, bestName: G.bestName || groupName(2, curDept()), moves: G.moves, reorgs: G.reorgs, newBest: newBest && (prev.groups || 0) > 0 };
      const run = G;
      d.timeout(() => G === run && showResults(snapshot), reduced || reason === 'won' ? 200 : 1100);
    }

    function showResults(o) {
      const rank = rankFor(o.groups);
      const best = bestStore();
      const nice = formatNumber(o.groups);
      const title = el('h2.gr-report__title.display', { tabindex: '-1' }, fill(C.results.title, { groups: nice }));
      const stat = (label, value, cls = '') => el(`div.gr-rstat${cls}`, el('div.gr-rstat__label', label), el('div.gr-rstat__val', value));
      const report = el(
        'div.gr-report.card.card--raised',
        el('div.kicker.kicker--amber', C.results.kicker),
        title,
        C.results.sub && el('p.gr-report__sub', C.results.sub),
        rank && el('div.gr-report__rank', el('span.tag.tag--severe', fill(C.results.rank, { rank }))),
        el(
          'div.gr-report__stats',
          stat(C.results.biggest, o.bestName, '.gr-rstat--wide'),
          stat(C.results.moves, formatNumber(o.moves)),
          stat(C.results.reorgs, formatNumber(o.reorgs)),
        ),
        el(
          'div.gr-report__actions',
          el('button.btn.btn--vital', {
            type: 'button',
            onclick: () => {
              newGame();
              ui.board.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
              focusBoard();
            },
          }, C.results.replay),
          el('span.gr-best.mono', o.newBest && el('b', `${C.results.newBest} `), fill(C.results.best, { groups: formatNumber(best.groups || o.groups) })),
        ),
      );
      const cta = ctx.cta.card({
        kicker: C.cta.kicker,
        title: C.cta.title,
        body: fill(C.cta.body, { rbac: facts.rbac || '', reviews: facts.reviews || '' })
          .replace(/\s+/g, ' ')
          .trim(),
        kind: 'trial',
        content: 'groups',
      });
      const share = ctx.share.panel({
        text: fill(C.share, { groups: nice, best: o.bestName, rank }),
        params: { play: 'groups' },
        kind: 'groups',
        title: C.results.shareTitle,
      });
      results.replaceChildren(report, cta, share);
      results.hidden = false;
      results.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
      title.focus({ preventScroll: true });
    }

    // ---------- Boot ----------
    measure();
    if (!restore(ctx.store.get('current', null))) newGame();

    return () => {
      G = null;
      d.run();
    };
  },
};
