# Module contract

Games, toys and shows are self-contained modules. The engine (src/engine) never names a brand; brand
packs (brands/<id>/) supply all copy and content. A new startup = a new brand pack, same modules.

## Files

```
src/games/<id>/index.js     (kind: 'game' | 'toy')      or
src/shows/<id>/index.js     (kind: 'show')
src/games/<id>/style.css    imported by index.js; every selector prefixed with a module prefix (e.g. .ap-)
brands/oktholm/modules/<id>.js   brand content for the module (pure data: no DOM, no CSS imports)
```

## Module shape

```js
import './style.css';

export default {
  id: 'access-please',
  kind: 'game',                 // 'game' | 'toy' | 'show'
  title: 'Access, Please',      // default copy; brand content may override title/blurb/emoji/minutes/therapy
  blurb: 'One line that makes an admin laugh and click.',
  emoji: '🛂',
  minutes: '4 min',
  therapy: 'Treats: Approval Chain Psychosis',   // "therapeutic value" label shown on arcade cards

  mount(root, ctx, opts) {
    // Render into `root` (an empty element you own). Return a cleanup function that removes
    // timers/listeners/audio. Use ctx.dom.disposer() to collect them.
    const d = ctx.dom.disposer();
    ...
    return () => d.run();
  },
};
```

`opts` (shows mostly): `{ mode: 'page' | 'tv' | 'create' | 'view', payload?: string, onEnd?: () => void }`

- **page**: standalone page with its own play button, captions, controls, share block and sponsor CTA.
- **tv**: `root` is a 16:9 `.tv-screen.crt` element on the OKTV channel. Autoplay silently (captions on,
  speech only if the viewer has sound on), no buttons except optional tiny overlays, call `opts.onEnd()`
  exactly once when finished so the channel moves to the next program. Must look right from 320px to
  1280px wide: size text with `cqw` units or percentages (the screen sets `container-type: inline-size`).
- **create / view**: used by the intervention module (creator form vs. recipient playback of `payload`).

## ctx (what the engine gives you)

| key | what |
| --- | --- |
| `ctx.content` | this module's brand content (`brands/<brand>/modules/<id>.js` default export) |
| `ctx.brand` | whole brand pack: `brand.site.{name,hospital,network,condition,captor}`, `brand.sponsor.{name,facts,links}` |
| `ctx.meta` | resolved `{ title, blurb, emoji, minutes, therapy }` |
| `ctx.dom` | `el, $, $$, disposer, fill, clamp, sleep, formatNumber, prefersReducedMotion` (see src/engine/dom.js) |
| `ctx.store` | namespaced localStorage JSON store: `get(k, fallback)`, `set(k, v)`, `update(k, fn, fallback)` |
| `ctx.rng` | `seeded(seed)`, `random`, `daily(salt)` (same for everyone today), `dayNumber()`, `dailyPick(list, salt)`; RNGs have `.int(lo,hi) .pick(a) .shuffle(a) .sample(a,n) .chance(p)` |
| `ctx.sfx` | synth sounds: `click beep ecg good bad stamp whack coin alarm type flatline` and `tone(freq, dur, opts)`, `noise(dur, opts)` |
| `ctx.audio` | `holdMusic() -> {stop}`, `isMuted()`, `toggle()`, `setMuted(bool)`, `unlock()` (call from a click before playing audio), `onChange(fn)` |
| `ctx.today` | site-wide picks for today, shared with the rooms: `today.gazette` (`{ headline, dek }`) |
| `ctx.speech` | `say(text, { rate, pitch, voice: 'narrator'|'anchor'|'fast'|'victim' }) -> Promise` (resolves at the estimated end even when muted, so captions stay in sync), `stop()`, `estimate(text, rate)` seconds |
| `ctx.ui` | `toast(msg, {kind:'good'|'bad'|'chip'})`, `modal({title, body, actions})`, `confetti()` |
| `ctx.share` | `panel({ text, params, kind, title })` -> share block element (adds the sharer's referral code), `url(params)`, `copy(text)` |
| `ctx.referral` | `grantChip(id)`, `qualify(kind)` (call when the visitor completes something meaningful: it credits whoever referred them), `patientId()` |
| `ctx.cta` | sponsor CTA: `card({ kicker, title, body, kind, label, content })` -> "prescription" card element; `button(kind, label, {content, variant})`; `url(kind, content)`. kinds: `primary trial demo pricing ssotax roi` |
| `ctx.canvas` | `wrapLines drawWrapped roundRect ensureFonts downloadCanvas canvasToBlob drawBarcode` |
| `ctx.track(event, props)` | analytics |
| `ctx.navigate(path)` | hash navigation, e.g. `ctx.navigate('/triage')` |

## Design system (use these; don't invent a new look)

Tokens in src/styles/tokens.css. Night-shift hospital + broadcast TV. Key vars: `--bg --surface --surface-2
--line --text --text-dim --vital (green) --alarm (red) --amber --cure (sponsor blue) --paper --ink`, fonts
`--font-display (Anton, uppercase headlines) --font-body --font-mono --font-pixel (DotGothic16) --font-type
(typewriter) --font-marker`.

Classes: `.btn .btn--cure .btn--vital .btn--alarm .btn--amber .btn--ghost .btn--paper .btn--sm .btn--lg
.btn--block`, `.card .card--raised`, `.paper` (document look), `.tag .tag--critical|severe|moderate|vital|cure`,
`.stamp .stamp--approved|denied|diagnosed` (+ `.is-slam` to animate), `.hazard`, `.crt .crt--flicker`,
`.kicker` (+ `--alarm --amber --cure`), `.display`, `.mono`, `.pixel`, `.type`, `.marker`, `.dim .faint`,
`.grid .grid--2|3|4`, `.row`, `.stack`, `.pad`, `.field .input .select .textarea .check`, `.chip-coin`, `.kbd`.

## Rules

- Mobile first: everything playable by touch at 360px wide; keyboard shortcuts are a bonus.
- Respect `prefers-reduced-motion` (ctx.dom.prefersReducedMotion()).
- Never inject untrusted strings with innerHTML. Use `el()` / textContent.
- Every game/toy ends with: a result, `ctx.share.panel(...)` with a punchy share text, and `ctx.cta.card(...)`
  mapping the joke to a real sponsor capability from `brand.sponsor.facts`. Never invent sponsor claims,
  prices or statistics; satirical stats about the *condition* are fine.
- The captor vendor is never named. Parody app names only (SalesFarce, Slacc...), no real logos.
- Grant chips from brands/<id>/content/chips.js where they fit (`ctx.referral.grantChip('first-shift')`).
- Call `ctx.referral.qualify('<module-id>')` when a player finishes their first full run.
- Clean up everything in the returned function; the router mounts/unmounts modules often.

## Dev loop

```
node build.mjs --game=<id>          # -> dist/dev/<id>.html (single file, opens anywhere)
node build.mjs                      # -> dist/index.html, the full site
```
