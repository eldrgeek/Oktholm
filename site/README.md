# Parody Engine (first brand: Oktholm Syndrome × YeshID)

A static, framework-free engine for satirical B2B lead-gen sites: games, a fake TV network, a diagnosis
quiz with shareable certificates, a 12-step "sponsorship" referral program, and a tiny serverless backend.
Brand packs supply every word; the engine never names a brand. The concept and launch plan are in
[`../docs/oktholm-2.0-concept.md`](../docs/oktholm-2.0-concept.md); channel costs are in
[`../docs/channel-economics.md`](../docs/channel-economics.md).

```
npm install
npm run build              # dist/index.html + dist/fonts (deployable)
npm run preview            # same, fonts inlined: one self-contained HTML file you can email
npm run dev                # rebuild on change + http://localhost:8000
node build.mjs --game=leaver   # dist/dev/leaver.html — one module in a harness (?mode=tv|page|create|view)
npm test                   # backend unit tests
node tests/smoke.mjs       # Playwright smoke test of every route and module (needs a prior build)
BRAND=acme npm run build   # build a different brand pack
npm run new-brand -- acme  # scaffold brands/acme from brands/_template
```

## Layout

```
src/engine/     services: router, store, rng (daily seeds), share, referral, speech, audio, ui, canvas, ticker
src/rooms/      pages: lobby, triage (+certificate PNG), arcade, tv (channel player), sponsor, therapy, dsm, gazette, cure
src/games/<id>/ games & toys  ─┐  every folder with an index.js is discovered at build time
src/shows/<id>/ OKTV shows    ─┘  (see CONTRACT.md for the module API)
brands/<id>/    brand pack: index.js (site, sponsor facts, theme, enabled modules) + content/ + modules/
netlify/        functions/recovery.mjs (/api/*), lib/ (storage-agnostic logic + Netlify Blobs adapter),
                edge-functions/og.mjs (personalized link previews for shared interventions/diagnoses)
public/fonts/   self-hosted fonts (scripts/fetch-fonts.mjs)
```

## How the "always new" works without a CMS

`rng.dailyPick(list, salt, epoch)` walks a per-list shuffled order, one item per UTC day, so everyone sees
the same front page, IDle word and Daily Shift today (which is what makes scores comparable and shareable),
and nothing repeats until the list is exhausted. Add content by appending to the brand pack's arrays.

## Referral flow

1. Every visitor gets a Patient ID (`OKT-7F3K-2Q`) in localStorage; it is also their sponsor code.
2. `ctx.share.panel()` / `share.url()` add `?ref=<id>&utm_*` to every shared link.
3. On landing, `referral.captureFromUrl()` stores the first referrer, then the URL is cleaned so re-shares carry the new sharer's code.
4. Finishing triage calls `referral.qualify('diagnosis')` → `POST /api/referral/qualify` → the backend credits the sponsor once per patient.
5. `/sponsor` reads `GET /api/sponsor/:id` and unlocks the brand's tier ladder. With no backend (file://, static host) everything degrades to local-only.

## Backend (Netlify)

The repo-root `netlify.toml` sets `base = "site"`. The functions use Netlify Blobs (no database to provision).

| Env var | Purpose |
| --- | --- |
| `ADMIN_TOKEN` | Bearer token for `GET /api/admin/confessions` and `POST /api/admin/confessions/moderate` |
| `IP_SALT` | Salt for hashing visitor IPs used in rate limits (raw IPs are never stored) |
| `BRAND` | Brand pack to build (default `oktholm`) |

Moderate confessions:
```
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://<site>/api/admin/confessions
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -d '{"key":"confession:pending:…","approve":true}' https://<site>/api/admin/confessions/moderate
```

Counters use ETag compare-and-swap, so they are safe under concurrency. For very high traffic, swap
`netlify/lib/blob-store.mjs` for a Postgres adapter with the same five methods.

## Adding a brand for another startup

1. `npm run new-brand -- <id>`.
2. `brands/<id>/index.js`: site names, the sponsor's **public, verifiable** claims (`sponsor.facts`), CTA links, colors.
3. `brands/<id>/content/index.js`: triage questions, headlines, confessions, tiers, lobby copy. Copy the shapes from `brands/oktholm/`.
4. `brands/<id>/modules/*`: optional per-game content (request decks, app names, word lists, show scripts). Every module falls back to its own defaults.
5. `BRAND=<id> npm run build`.

Genre rules: never name the competitor, keep satire about the *condition*, and make every sponsor claim a
link-able fact.
