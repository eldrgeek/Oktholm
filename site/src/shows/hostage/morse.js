// Morse blinking for the hostage tape. Pure timing logic, no DOM: the caller passes setClosed().
// Eyes closed = a symbol (dot ~220 ms, dash ~650 ms); eyes open = the gaps between symbols, letters and words.

export const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
  N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
};

export const TIMING = { dot: 220, dash: 650, symbolGap: 260, letterGap: 820, wordGap: 1800 };

/**
 * Absolute-time schedule (ms from start) for a list of words.
 * events:  one per symbol  { at, dur, sym: '.'|'-', ch, word, letter, symbol, code }
 * letters: one per letter  { ch, word, letter, code, start, end }
 */
export function blinkSchedule(words, timing = TIMING) {
  const events = [];
  const letters = [];
  let t = 0;
  let first = true;
  words.forEach((w, wi) => {
    let li = 0;
    for (const ch of String(w).toUpperCase()) {
      const code = MORSE[ch];
      if (!code) continue;
      if (!first) t += li === 0 ? timing.wordGap : timing.letterGap;
      first = false;
      const start = t;
      [...code].forEach((sym, si) => {
        if (si > 0) t += timing.symbolGap;
        const dur = sym === '.' ? timing.dot : timing.dash;
        events.push({ at: t, dur, sym, ch, word: wi, letter: letters.length, symbol: si, code });
        t += dur;
      });
      letters.push({ ch, word: wi, letter: letters.length, code, start, end: t });
      li++;
    }
  });
  return { events, letters, total: t };
}

/** Turn observed closed-durations back into letters (used by tests and nothing else). */
export function decodeDurations(closed, threshold = (TIMING.dot + TIMING.dash) / 2) {
  return closed.map((ms) => (ms < threshold ? '.' : '-')).join('');
}

/**
 * Drives eyelids from a schedule. Every transition is timed from the same t0 (no drift accumulates).
 * createBlinker({ setClosed(bool), speed, onSymbol(e), onLetter(l), onDone() }) -> { start(schedule), stop() }
 */
export function createBlinker({ setClosed, speed = 1, onSymbol, onLetter, onDone } = {}) {
  let timers = [];
  let running = false;

  function stop() {
    running = false;
    timers.forEach(clearTimeout);
    timers = [];
    setClosed?.(false);
  }

  function start(schedule) {
    stop();
    running = true;
    const t0 = performance.now();
    const at = (ms, fn) => {
      const due = t0 + ms / speed;
      timers.push(
        setTimeout(() => {
          if (running) fn();
        }, Math.max(0, due - performance.now())),
      );
    };
    for (const e of schedule.events) {
      at(e.at, () => {
        setClosed?.(true);
        onSymbol?.(e);
      });
      at(e.at + e.dur, () => setClosed?.(false));
    }
    for (const l of schedule.letters) at(l.end, () => onLetter?.(l));
    at(schedule.total + 40, () => {
      running = false;
      onDone?.();
    });
  }

  return {
    start,
    stop,
    get running() {
      return running;
    },
  };
}
