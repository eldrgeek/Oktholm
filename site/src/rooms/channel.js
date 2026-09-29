// OKTV channel player: mounts show modules in 'tv' mode one after another inside a 16:9 CRT.
// Starts silent (autoplay etiquette); "Tap for sound" enables narration for this channel only.

import { el } from '../engine/dom.js';
import { getModule, mountModule, moduleMeta } from '../engine/modules.js';

const MAX_PROGRAM_MS = 150000; // safety net if a show never calls onEnd

export function mountChannel(container, s, { rotation = [], startAt = 0, onProgram } = {}) {
  const shows = rotation.map((id) => getModule(id)).filter((m) => m && m.kind === 'show');
  // Channel chrome lives in a bar under the screen, so it never covers a show's own lower thirds.
  const screen = el('div.tv-screen.crt.crt--flicker.channel__screen', { title: 'Tap for sound' });
  const stageHost = el('div.channel__stage');
  const chyronTitle = el('span.channel__title', s.brand.site?.network || 'TV');
  let tvSound = false;
  const soundBtn = el('button.channel__sound', { type: 'button' });
  const skipBtn = el('button.channel__skip', { type: 'button', text: 'NEXT ▸', 'aria-label': 'Next program' });
  screen.append(stageHost);
  const bar = el(
    'div.channel__bar',
    el('span.channel__live', el('span.live-dot'), 'LIVE'),
    el('span.channel__net', s.brand.site?.network || 'TV'),
    chyronTitle,
    el('span.channel__spacer'),
    skipBtn,
    soundBtn,
  );
  container.append(el('div.channel', el('div.channel__frame', screen, bar)));

  const renderSound = () => (soundBtn.textContent = tvSound && !s.audio.isMuted() ? '🔊 SOUND ON' : '🔇 TAP FOR SOUND');
  renderSound();
  const offAudio = s.audio.onChange(renderSound);

  // Shows read these instead of the global services, so the channel stays quiet until asked.
  const overrides = {
    speech: {
      ...s.speech,
      say: (text, opts = {}) => s.speech.say(text, { ...opts, silent: opts.silent || !tvSound }),
    },
    audio: { ...s.audio, isMuted: () => !tvSound || s.audio.isMuted() },
  };

  let idx = startAt;
  let current = null;
  let guard = null;
  let destroyed = false;

  function standby() {
    stageHost.innerHTML = '';
    stageHost.append(el('div.standby', el('div.standby__bars', Array.from({ length: 7 }, () => el('i'))), el('div.standby__card', 'PLEASE STAND BY', el('small', 'We are experiencing technical difficulties. It was DNS.'))));
    chyronTitle.textContent = 'Technical difficulties';
  }

  function play() {
    if (destroyed) return;
    current?.();
    current = null;
    clearTimeout(guard);
    if (!shows.length) return standby();
    const mod = shows[((idx % shows.length) + shows.length) % shows.length];
    const stage = el('div.channel__stage');
    stageHost.innerHTML = '';
    stageHost.append(stage);
    chyronTitle.textContent = moduleMeta(mod, s.brand).title;
    onProgram?.(mod, shows[(idx + 1) % shows.length]);
    let ended = false;
    const next = () => {
      if (ended || destroyed) return;
      ended = true;
      idx++;
      setTimeout(play, 400);
    };
    current = mountModule(mod, stage, s, { mode: 'tv', onEnd: next }, overrides);
    guard = setTimeout(next, MAX_PROGRAM_MS);
  }

  // Tapping the picture turns sound on (the universal autoplay-video gesture).
  screen.addEventListener('click', () => {
    if (!tvSound) soundBtn.click();
  });
  soundBtn.addEventListener('click', () => {
    tvSound = !tvSound;
    if (tvSound && s.audio.isMuted()) s.audio.setMuted(false);
    s.audio.unlock();
    if (!tvSound) s.speech.stop();
    renderSound();
    // Restart the current program so narration starts from the top of a beat.
    if (tvSound) play();
  });
  skipBtn.addEventListener('click', () => {
    idx++;
    play();
  });

  // Don't burn CPU (or talk) when the screen is off-screen or the tab is hidden.
  let visible = true;
  const io = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(([e]) => {
        const was = visible;
        visible = e.isIntersecting;
        if (!visible && tvSound) s.speech.stop();
        if (visible && !was && !current) play();
      })
    : null;
  io?.observe(screen);

  play();
  return {
    destroy() {
      destroyed = true;
      clearTimeout(guard);
      current?.();
      io?.disconnect();
      offAudio();
    },
    next: () => skipBtn.click(),
    /** Turn the channel's sound on or off (the lobby silences it while Intake gives the tour). */
    setSound(on) {
      if (Boolean(on) !== tvSound) soundBtn.click();
    },
    screen,
  };
}
