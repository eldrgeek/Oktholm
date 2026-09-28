// IDle: the daily identity word game. Five letters, six tries, one word per UTC day for everyone
// (ctx.rng.dailyPick). A format homage to the daily word game genre; the art, copy and words are our own.
// All copy and the answer list come from the brand pack (ctx.content); the defaults below are fallbacks.

import './style.css';

const COLS = 5;
const ROWS = 6;
const FLIP_MS = 500; // must match the idl-flip animation in style.css
const STAGGER_MS = 280;
const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];
const RANK = { absent: 1, present: 2, correct: 3 };
const SQUARES = {
  normal: { correct: '🟩', present: '🟨', absent: '⬛' },
  hc: { correct: '🟧', present: '🟦', absent: '⬛' },
};

// Static, trusted SVG icons (safe for the `html` prop).
const ICONS = {
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.9.8c0 1.7-2.5 2.1-2.5 3.8"/><path d="M12 17.3h.01"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 20v-8M12 20V5M19 20v-5"/></svg>',
  contrast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H9l-6 7 6 7h12z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>',
};

const FALLBACK_WORDS = [
  { word: 'ADMIN', def: 'A role everyone requests and nobody gives back.' },
  { word: 'TOKEN', def: 'A string that expires at the worst possible moment.' },
  { word: 'AUDIT', def: 'The annual ritual of proving you did what you said you did.' },
  { word: 'CACHE', def: 'The first thing support asks you to clear.' },
  { word: 'LOGIN', def: 'Two fields and three redirects.' },
  { word: 'PROXY', def: 'A server that stands between you and the internet, absorbing blame.' },
  { word: 'QUEUE', def: 'Where tickets go to multiply.' },
];

const DEFAULT_COPY = {
  kicker: 'Daily word game',
  tagline: 'Guess the five-letter word in six tries. Same word for everyone, new word at midnight UTC.',
  monitorLabel: 'WORD WARD',
  attempt: 'ATTEMPT {n}/{max}',
  solvedLabel: 'SOLVED {n}/{max}',
  lockedLabel: 'LOCKED OUT',
  enterLabel: 'Enter',
  tooShort: 'Not enough letters.',
  noVowel: 'That needs a vowel.',
  repeat: 'You already tried that one.',
  win: ['Genius.', 'Magnificent.', 'Impressive.', 'Splendid.', 'Great.', 'Phew.'],
  loss: 'Out of tries. The word was {word}.',
  shareLines: {},
  shareTitle: 'Share your result (spoiler-free)',
  shareHint: undefined,
  rulesKicker: 'How it works',
  rulesTitle: 'How to play',
  rules: ['Guess the five-letter word in six tries.', 'Type or tap letters, then press Enter.', 'After each guess, the tiles show how close you were.'],
  legend: { correct: 'Right letter, right slot.', present: 'Right letter, wrong slot.', absent: 'Not in the word.' },
  rulesNote: 'Everyone gets the same word each UTC day.',
  contrastLabel: 'Contrast',
  contrastHint: 'High-contrast colors for colorblind players.',
  helpLabel: 'Rules',
  statsLabel: 'Stats',
  statsTitle: 'Statistics',
  played: 'Played',
  winPct: 'Win %',
  streak: 'Current streak',
  maxStreak: 'Max streak',
  distTitle: 'Guess distribution',
  noStats: 'Finish today’s word to start your stats.',
  dxKicker: 'Today’s word · #{n}',
  solvedTag: 'Solved {n}/{max}',
  lockedTag: 'Not solved',
  symptomLabel: 'Symptom:',
  stampWon: 'Solved',
  stampLost: 'Locked out',
  doneWon: 'Solved',
  doneLost: 'Locked out',
  doneLine: 'Today’s game is finished. Come back after midnight UTC.',
  nextLabel: 'Next word in',
  seeResults: 'See results',
};

/** Per-letter feedback. Exact matches claim their letters first, so repeated letters score correctly. */
export function scoreGuess(guess, answer) {
  const out = Array(COLS).fill('absent');
  const left = {};
  for (let i = 0; i < COLS; i++) {
    if (guess[i] === answer[i]) out[i] = 'correct';
    else left[answer[i]] = (left[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < COLS; i++) {
    if (out[i] !== 'correct' && left[guess[i]] > 0) {
      out[i] = 'present';
      left[guess[i]] -= 1;
    }
  }
  return out;
}

/** Lenient on purpose: any five letters with a vowel (or Y), plus every answer-list word (HTTPS, say). */
export function isAcceptable(guess, answers) {
  if (!/^[A-Z]{5}$/.test(guess)) return false;
  return /[AEIOUY]/.test(guess) || answers.has(guess);
}

/** Accepts strings or { word, def, symptom }; keeps valid, unique five-letter words in list order. */
export function normalizeWords(list) {
  const out = [];
  const seen = new Set();
  for (const item of Array.isArray(list) ? list : []) {
    const entry = typeof item === 'string' ? { word: item } : item || {};
    const word = String(entry.word || '').trim().toUpperCase();
    if (!/^[A-Z]{5}$/.test(word) || seen.has(word)) continue;
    seen.add(word);
    out.push({ word, def: entry.def || '', symptom: entry.symptom || '' });
  }
  return out;
}

export function msToUtcMidnight(now = Date.now()) {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - now;
}

export function formatCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export default {
  id: 'idle',
  kind: 'game',
  title: 'IDle',
  blurb: 'The daily identity word game.',
  emoji: '🔤',
  minutes: '3 min',
  therapy: 'Treats: Acronym Fatigue',

  mount(root, ctx) {
    const { el, fill, disposer, prefersReducedMotion } = ctx.dom;
    const content = ctx.content || {};
    const copy = { ...DEFAULT_COPY, ...(content.copy || {}) };
    const legend = { ...DEFAULT_COPY.legend, ...(copy.legend || {}) };
    const winLines = Array.isArray(copy.win) && copy.win.length ? copy.win : DEFAULT_COPY.win;
    let words = normalizeWords(content.words);
    if (!words.length) words = normalizeWords(FALLBACK_WORDS);
    const answers = new Set(words.map((w) => w.word));
    const facts = ctx.brand?.sponsor?.facts || {};
    const title = ctx.meta?.title || 'IDle';

    const d = disposer();
    let session = null;

    // One "session" per UTC day. At midnight a finished board is swapped for the new day's game.
    function start() {
      session?.run();
      session = disposer();
      root.replaceChildren();
      play(session);
    }

    function play(sd) {
      const day = ctx.rng.dayNumber();
      const entry = ctx.rng.dailyPick(words, 'word');
      const answer = entry.word;
      const reduce = prefersReducedMotion();
      const saved = ctx.store.get('state', null);
      const guesses =
        saved && saved.day === day && Array.isArray(saved.guesses)
          ? saved.guesses.filter((g) => typeof g === 'string' && /^[A-Z]{5}$/.test(g)).slice(0, ROWS)
          : [];
      const hit = guesses.indexOf(answer);
      if (hit >= 0) guesses.length = hit + 1;
      const statusOf = (list) => (list[list.length - 1] === answer ? 'won' : list.length >= ROWS ? 'lost' : 'playing');
      let status = statusOf(guesses); // derived from the guesses, never trusted from storage
      let current = '';
      let busy = false;
      let hc = Boolean(ctx.store.get('hc', false));
      let msgTimer = 0;
      const countdowns = new Set();
      const save = () => ctx.store.set('state', { day, guesses: guesses.slice(), status });

      // ---------- DOM ----------
      const section = el('section.idl', { 'aria-label': `${title} #${day}` });
      section.classList.toggle('idl--hc', hc);

      const tool = (icon, label, onclick, attrs = {}) =>
        el('button.btn.btn--ghost.btn--sm.idl-tool', { type: 'button', onclick, 'aria-label': label, ...attrs }, el('span.idl-tool__icon', { 'aria-hidden': 'true', html: ICONS[icon] }), el('span.idl-tool__label', label));
      const helpBtn = tool('help', copy.helpLabel, openHelp);
      const statsBtn = tool('stats', copy.statsLabel, openStats);
      const hcBtn = tool('contrast', copy.contrastLabel, toggleHc, { 'aria-pressed': String(hc), title: copy.contrastHint });

      const head = el(
        'header.idl-head',
        el('div.kicker.idl-kicker', copy.kicker),
        el('h2.idl-title', el('span.idl-title__name', title), el('span.idl-title__num', `#${day}`)),
        copy.tagline && el('p.idl-tagline', copy.tagline),
        el('div.idl-tools', helpBtn, statsBtn, hcBtn),
      );

      const attemptEl = el('span.idl-monitor__attempt');
      const msgEl = el('div.idl-msg', { role: 'status', 'aria-live': 'polite' });
      const rowEls = [];
      const tiles = [];
      const board = el('div.idl-board');
      for (let r = 0; r < ROWS; r++) {
        const row = el('div.idl-row', { role: 'group', 'aria-label': `Guess ${r + 1}` });
        const rowTiles = [];
        for (let c = 0; c < COLS; c++) {
          const t = el('div.idl-tile', { dataset: { state: 'empty' }, 'aria-hidden': 'true' });
          t.style.setProperty('--i', String(c));
          rowTiles.push(t);
          row.append(t);
        }
        rowEls.push(row);
        tiles.push(rowTiles);
        board.append(row);
      }
      const monitor = el(
        'div.idl-monitor',
        el('div.idl-monitor__bar', el('span.idl-monitor__live', el('span.live-dot', { 'aria-hidden': 'true' }), copy.monitorLabel), attemptEl),
        board,
        msgEl,
      );

      const keyEls = new Map();
      const keyboard = el(
        'div.idl-keys',
        { role: 'group', 'aria-label': 'Keyboard' },
        KEY_ROWS.map((keys, i) =>
          el(
            'div.idl-keys__row',
            i === 1 && el('span.idl-keys__spacer', { 'aria-hidden': 'true' }),
            keys.map((k) => {
              const wide = k === 'ENTER' || k === 'BACK';
              const b = el(
                `button.idl-key${wide ? '.idl-key--wide' : ''}`,
                {
                  type: 'button',
                  dataset: { key: k },
                  'aria-label': k === 'BACK' ? 'Backspace' : k === 'ENTER' ? 'Enter' : k,
                  onclick: (e) => {
                    press(k);
                    // Pointer taps shouldn't leave focus on the key, or a physical Enter would re-press it.
                    if (e.detail > 0) b.blur();
                  },
                },
                k === 'BACK' ? el('span.idl-key__icon', { 'aria-hidden': 'true', html: ICONS.back }) : k === 'ENTER' ? copy.enterLabel : k,
              );
              keyEls.set(k, b);
              return b;
            }),
            i === 1 && el('span.idl-keys__spacer', { 'aria-hidden': 'true' }),
          ),
        ),
      );

      const doneBar = el('div.idl-done', { hidden: true });
      const side = el('aside.idl-side');
      const srLive = el('div.sr-only', { 'aria-live': 'polite' });

      section.append(head, el('div.idl-layout', el('div.idl-play', monitor, keyboard, doneBar), side), srLive);
      root.append(section);

      // ---------- Board ----------
      const stateLabel = (s) => (s === 'correct' ? 'correct' : s === 'present' ? 'in the word, wrong spot' : 'not in the word');
      const describe = (guess, res) => `${guess}: ${res.map((s, i) => `${guess[i]} ${stateLabel(s)}`).join(', ')}`;

      function setTile(t, ch, state) {
        t.textContent = ch;
        t.dataset.state = state;
      }

      function blip(state) {
        if (state === 'correct') ctx.sfx.tone(988, 0.08, { type: 'sine', gain: 0.05 });
        else if (state === 'present') ctx.sfx.tone(740, 0.07, { type: 'sine', gain: 0.04 });
        else ctx.sfx.tone(330, 0.06, { type: 'sine', gain: 0.025 });
      }

      function revealRow(r, guess, res, animate) {
        rowEls[r].setAttribute('aria-label', `Guess ${r + 1}. ${describe(guess, res)}`);
        const row = tiles[r];
        if (!animate || reduce) {
          row.forEach((t, i) => setTile(t, guess[i], res[i]));
          if (animate) blip(res.includes('correct') ? 'correct' : res.includes('present') ? 'present' : 'absent');
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          row.forEach((t, i) => {
            const at = i * STAGGER_MS;
            sd.timeout(() => t.classList.add('is-flip'), at);
            sd.timeout(() => {
              setTile(t, guess[i], res[i]);
              blip(res[i]);
            }, at + FLIP_MS / 2);
            sd.timeout(() => t.classList.remove('is-flip'), at + FLIP_MS);
          });
          sd.timeout(resolve, (COLS - 1) * STAGGER_MS + FLIP_MS + 40);
        });
      }

      function paintCurrent(pop = false) {
        const r = guesses.length;
        if (status !== 'playing' || r >= ROWS) return;
        tiles[r].forEach((t, i) => setTile(t, current[i] || '', current[i] ? 'tbd' : 'empty'));
        rowEls[r].setAttribute('aria-label', `Guess ${r + 1}${current ? `: ${current.split('').join(' ')}` : ''}`);
        if (pop && current.length && !reduce) {
          const t = tiles[r][current.length - 1];
          t.classList.remove('is-pop');
          void t.offsetWidth; // restart the animation
          t.classList.add('is-pop');
        }
      }

      function paintKeys() {
        const best = {};
        for (const g of guesses) {
          scoreGuess(g, answer).forEach((s, i) => {
            if (!best[g[i]] || RANK[s] > RANK[best[g[i]]]) best[g[i]] = s;
          });
        }
        for (const [k, b] of keyEls) {
          if (k.length !== 1) continue;
          if (best[k]) {
            b.dataset.state = best[k];
            b.setAttribute('aria-label', `${k}, ${stateLabel(best[k])}`);
          } else delete b.dataset.state;
        }
      }

      function updateAttempt() {
        attemptEl.dataset.status = status;
        attemptEl.textContent =
          status === 'won' ? fill(copy.solvedLabel, { n: guesses.length, max: ROWS }) : status === 'lost' ? copy.lockedLabel : fill(copy.attempt, { n: guesses.length + 1, max: ROWS });
      }

      function toast(msg, ms = 2400) {
        msgEl.textContent = msg;
        msgEl.classList.add('is-in');
        clearTimeout(msgTimer);
        if (ms) msgTimer = setTimeout(() => msgEl.classList.remove('is-in'), ms);
      }
      sd(() => clearTimeout(msgTimer));

      // ---------- Input ----------
      function press(k) {
        if (status !== 'playing' || busy) return;
        if (k === 'ENTER') return submit();
        if (k === 'BACK') {
          if (!current) return;
          current = current.slice(0, -1);
          ctx.sfx.click();
          paintCurrent();
          return;
        }
        if (current.length >= COLS) return;
        current += k;
        ctx.sfx.click();
        paintCurrent(true);
      }

      function reject(msg) {
        toast(msg);
        ctx.sfx.tone(196, 0.14, { type: 'square', gain: 0.03 });
        const row = rowEls[guesses.length];
        if (!row || reduce) return;
        row.classList.remove('is-shake');
        void row.offsetWidth;
        row.classList.add('is-shake');
      }

      function submit() {
        if (current.length < COLS) return reject(copy.tooShort);
        if (!isAcceptable(current, answers)) return reject(copy.noVowel);
        if (guesses.includes(current)) return reject(copy.repeat);
        const guess = current;
        const r = guesses.length;
        const res = scoreGuess(guess, answer);
        guesses.push(guess);
        current = '';
        status = statusOf(guesses);
        save(); // persist before the animation so a reload mid-flip keeps the guess
        busy = true;
        msgEl.classList.remove('is-in');
        revealRow(r, guess, res, true).then(() => {
          busy = false;
          paintKeys();
          updateAttempt();
          srLive.textContent = describe(guess, res);
          if (status === 'playing') paintCurrent();
          else finish(true);
        });
      }

      sd.on(document, 'keydown', (e) => {
        if (status !== 'playing' || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
        if (!section.isConnected || document.querySelector('.modal-overlay')) return;
        const t = e.target instanceof Element ? e.target : null;
        if (t?.closest('input, textarea, select, [contenteditable]')) return;
        if (e.key === 'Enter') {
          // Let buttons and links outside the board area (share, sponsor, site nav) work normally.
          const control = t?.closest('button, a');
          if (control && !control.closest('.idl-play, .idl-head')) return;
          e.preventDefault();
          press('ENTER');
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          press('BACK');
        } else if (/^[a-z]$/i.test(e.key)) {
          press(e.key.toUpperCase());
        }
      });

      // ---------- Stats ----------
      function loadStats() {
        const s = ctx.store.get('stats', null) || {};
        const num = (v) => Math.max(0, Number(v) || 0);
        return {
          played: num(s.played),
          wins: num(s.wins),
          streak: num(s.streak),
          maxStreak: num(s.maxStreak),
          lastPlayed: num(s.lastPlayed),
          lastWin: num(s.lastWin),
          dist: Array.from({ length: ROWS }, (_, i) => num(s.dist?.[i])),
        };
      }

      /** Idempotent per day, so a second tab or a reload mid-animation never double counts. */
      function recordResult(won, n) {
        const s = loadStats();
        if (s.lastPlayed === day) return s;
        s.played += 1;
        s.lastPlayed = day;
        if (won) {
          s.wins += 1;
          s.dist[n - 1] += 1;
          s.streak = s.lastWin === day - 1 ? s.streak + 1 : 1;
          s.lastWin = day;
          s.maxStreak = Math.max(s.maxStreak, s.streak);
        } else {
          s.streak = 0;
        }
        ctx.store.set('stats', s);
        return s;
      }

      // A streak survives until a day is missed.
      const currentStreak = (s) => (s.lastWin >= day - 1 ? s.streak : 0);

      function statsBlock(s, highlight) {
        const pct = s.played ? Math.round((s.wins / s.played) * 100) : 0;
        const max = Math.max(1, ...s.dist);
        const nums = [
          [s.played, copy.played],
          [pct, copy.winPct],
          [currentStreak(s), copy.streak],
          [s.maxStreak, copy.maxStreak],
        ];
        return el(
          'div.idl-stats',
          el('div.idl-stats__nums', nums.map(([v, label]) => el('div.idl-stat', el('b.idl-stat__num', String(v)), el('span.idl-stat__label', label)))),
          el('div.idl-stats__title', copy.distTitle),
          el(
            'div.idl-dist',
            s.dist.map((count, i) =>
              el(
                'div.idl-dist__row',
                el('span.idl-dist__n', String(i + 1)),
                el('div.idl-dist__track', el(`div.idl-dist__bar${highlight === i + 1 ? '.is-today' : ''}`, { style: { width: `${Math.max(8, (count / max) * 100)}%` } }, el('span', String(count)))),
              ),
            ),
          ),
          !s.played && el('p.idl-stats__empty', copy.noStats),
        );
      }

      // ---------- Side panel ----------
      function rulesBody() {
        const examples = [
          ['correct', 'A'],
          ['present', 'D'],
          ['absent', 'M'],
        ];
        return [
          el('ol.idl-rules__list', (copy.rules || []).map((r) => el('li', r))),
          el(
            'ul.idl-legend',
            examples.map(([s, ch]) => el('li.idl-legend__item', el('span.idl-mini', { dataset: { state: s }, 'aria-hidden': 'true' }, ch), el('span', legend[s]))),
          ),
          el('p.idl-rules__note', copy.rulesNote),
        ];
      }

      function renderRules() {
        side.replaceChildren(el('div.idl-rules.card.card--raised', el('div.kicker', copy.rulesKicker), el('h3.idl-rules__title', copy.rulesTitle), rulesBody()));
      }

      function nextBlock(extra = '') {
        const time = el('span.idl-next__time', formatCountdown(msToUtcMidnight()));
        countdowns.add(time);
        return el(`div.idl-next${extra}`, el('span.idl-next__label', copy.nextLabel), time);
      }

      function renderDone() {
        const won = status === 'won';
        doneBar.replaceChildren(
          el(
            'div.idl-done__main',
            el('div.idl-done__verdict', { dataset: { status } }, won ? copy.doneWon : copy.doneLost, el('span.idl-done__score', won ? `${guesses.length}/${ROWS}` : `X/${ROWS}`)),
            el('p.idl-done__line', copy.doneLine),
          ),
          nextBlock(),
          el('button.btn.btn--ghost.btn--sm.btn--block.idl-done__jump', { type: 'button', onclick: () => side.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }) }, `${copy.seeResults} ↓`),
        );
        doneBar.hidden = false;
      }

      function shareText() {
        const sq = hc ? SQUARES.hc : SQUARES.normal;
        const score = status === 'won' ? String(guesses.length) : 'X';
        const grid = guesses.map((g) => scoreGuess(g, answer).map((s) => sq[s]).join('')).join('\n');
        const line = copy.shareLines?.[score];
        const emoji = content.shareEmoji ? ` ${content.shareEmoji}` : '';
        return `${title} #${day} ${score}/${ROWS}${emoji}\n${grid}${line ? `\n${line}` : ''}`;
      }

      function ctaCard() {
        const cta = content.cta || {};
        const factText = (cta.facts || ['lifecycle', 'rae'])
          .map((k) => facts[k])
          .filter(Boolean)
          .join(' ');
        const body = [factText, cta.after].filter(Boolean).join(' ');
        return ctx.cta.card({
          kicker: cta.kicker || 'Prescription',
          title: cta.title || 'Get your time back',
          body: body || undefined,
          kind: cta.kind || 'primary',
          label: cta.label,
          content: 'idle',
          secondary: cta.secondary,
        });
      }

      function diagnosis(fresh) {
        const won = status === 'won';
        return el(
          'article.idl-dx.paper',
          el('div.idl-dx__head', el('span.kicker', fill(copy.dxKicker, { n: day })), el('span.sr-only', won ? fill(copy.solvedTag, { n: guesses.length, max: ROWS }) : copy.lockedTag)),
          el(
            'div.idl-dx__word',
            { role: 'img', 'aria-label': answer },
            answer.split('').map((ch) => el('span.idl-mini.idl-mini--lg', { dataset: { state: won ? 'correct' : 'reveal' } }, ch)),
          ),
          entry.def && el('p.idl-dx__def', entry.def),
          entry.symptom && el('p.idl-dx__symptom', el('b', copy.symptomLabel), ' ', entry.symptom),
          el(`span.stamp.idl-dx__stamp.${won ? 'stamp--approved' : 'stamp--denied'}${fresh && !reduce ? '.is-slam' : ''}`, { 'aria-hidden': 'true' }, won ? copy.stampWon : copy.stampLost),
        );
      }

      function renderResults(fresh) {
        side.replaceChildren(
          el(
            'div.idl-results',
            diagnosis(fresh),
            el('section.idl-card.card.card--raised', el('div.kicker', copy.statsTitle), statsBlock(loadStats(), status === 'won' ? guesses.length : 0)),
            ctx.share.panel({ text: shareText(), params: { play: 'idle' }, kind: 'idle', title: copy.shareTitle, hint: copy.shareHint }),
            ctaCard(),
          ),
        );
      }

      function finish(fresh) {
        const won = status === 'won';
        const n = guesses.length;
        const stats = recordResult(won, n);
        ctx.referral.qualify('idle');
        let chipNew = false;
        if (won) chipNew = ctx.referral.grantChip('idle-solved') || chipNew;
        if (won && currentStreak(stats) >= 3) chipNew = ctx.referral.grantChip('idle-streak-3') || chipNew;
        if (fresh) {
          ctx.track('idle_finish', { day, won, guesses: won ? n : 0 });
          if (won) {
            toast(winLines[n - 1] || winLines[winLines.length - 1], 3600);
            ctx.sfx.good();
            if (!reduce) tiles[n - 1].forEach((t) => t.classList.add('is-win'));
            if (!chipNew) ctx.ui.confetti({ count: 90 });
          } else {
            toast(fill(copy.loss, { word: answer }), 5200);
            ctx.sfx.flatline();
          }
        }
        keyboard.hidden = true;
        renderDone();
        renderResults(fresh);
        if (fresh && typeof matchMedia === 'function' && matchMedia('(max-width: 979px)').matches) {
          sd.timeout(() => side.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), reduce ? 400 : 1900);
        }
      }

      // ---------- Tools ----------
      function openHelp() {
        ctx.ui.modal({ title: copy.rulesTitle, body: el(`div.idl-modal${hc ? '.idl--hc' : ''}`, rulesBody()) });
      }

      function openStats() {
        const body = el(`div.idl-modal${hc ? '.idl--hc' : ''}`, statsBlock(loadStats(), status === 'won' ? guesses.length : 0), status !== 'playing' && nextBlock('.idl-next--block'));
        ctx.ui.modal({ title: copy.statsTitle, body });
      }

      function toggleHc() {
        hc = !hc;
        ctx.store.set('hc', hc);
        section.classList.toggle('idl--hc', hc);
        hcBtn.setAttribute('aria-pressed', String(hc));
        if (status !== 'playing') renderResults(false); // the share grid uses the contrast palette too
        ctx.track('idle_contrast', { on: hc });
      }

      function tick() {
        const text = formatCountdown(msToUtcMidnight());
        for (const node of countdowns) {
          if (node.isConnected) node.textContent = text;
          else countdowns.delete(node);
        }
        // New UTC day: swap a finished board for the new word. An unfinished game keeps its word until reload.
        if (status !== 'playing' && ctx.rng.dayNumber() !== day) start();
      }
      sd.interval(tick, 1000);

      // ---------- Initial paint ----------
      guesses.forEach((g, r) => revealRow(r, g, scoreGuess(g, answer), false));
      paintKeys();
      updateAttempt();
      if (status === 'playing') {
        paintCurrent();
        renderRules();
      } else {
        finish(false);
      }
    }

    d(() => session?.run());
    start();
    return () => d.run();
  },
};
