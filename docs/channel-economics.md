# OKTV channel economics: what a 24/7 AI channel costs per day

*Prices checked 2026-09-28. Video-model prices move monthly, so re-check before committing a budget.*

## TL;DR

| How you run one channel | Unique video / day | Generation $/day | All-in $/day |
| --- | --- | --- | --- |
| **Infinite Slop / fal.live style**: every second unique, 24/7 (H3 Max Turbo, 768p) | 24 h | **$3,456** | ~$3.5K |
| Same, at the cheapest tier that still looks OK (H3 Max Turbo, 480p) | 24 h | $2,160 | ~$2.2K |
| Same, premium model (H3 Max, 768p) | 24 h | $6,912 | ~$7K |
| **Audience-gated**: generate only while people watch and vote (~6 h/day), otherwise replay the best clips | 6 h | $864 | ~$0.9K |
| **Programmed TV** (recommended): 60 min of new footage a day, the rest reruns, like real TV | 1 h | $144 | **~$150–175** |
| **Lean**: 15–20 min of new footage a day + the in-browser shows already built | 15–20 min | $36–48 | **~$40–60** |
| **Apply to fal.live's creator pilot** | fal's | **$0** during the pilot | $0 |

For a lead-gen parody channel, pick **Programmed TV** or **Lean**. Nobody watches a B2B joke channel for 24 hours straight. What makes it feel live is a schedule that changes, a ticker, votes, and new drops every day. The site already fakes all of that for free: OKTV plays the in-browser shows around the clock at zero marginal cost.

## What Infinite Slop and fal.live actually are

- **[Infinite Slop](https://levels.io/i-built-infinite-slop)** (Pieter Levels, with fal): viewers type prompts in chat, upvote a queue, and the winner becomes the next 15-second clip. It runs a fal fine-tune of MiniMax H3 that renders faster than playback, [4 × 15 s clips per minute](https://levels.io/37000-watched-infinite-slop). It drew 37,000 visitors on day one and 2,000+ concurrent viewers. **Levels paid nothing: fal sponsored the compute.** He called it "very expensive to run" and never published a number.
- **[fal.live](https://fal.live/)**: fal turned the idea into a multi-channel network (anime, sitcom, soap opera…) running "H3 Max Director," a continuous-generation variant of MiniMax H3 Max ([overview](https://www.digitalapplied.com/blog/fal-live-ai-tv-channel-viewers-steer)). No pricing is published. Its **[creator program](https://fal.live/creators)** costs "nothing during the pilot": "Bring the concept and the audience. We handle the model, the infrastructure, and the moderation." There's an 18+ age gate today, which is awkward for a B2B brand.

## Unit prices (per second of generated video)

| Model (via fal unless noted) | 480p | 720–768p | 1080p | Notes |
| --- | --- | --- | --- | --- |
| MiniMax H3 Max Turbo | $0.025 | $0.04 | $0.08 | Cheapest real-time-capable option. 5 s clip renders in ~1.5 s |
| MiniMax H3 Max | $0.05 | $0.08 | $0.16 | What Infinite Slop/fal.live build on. Max 15 s per generation, 5 free generations/day |
| Veo 3.1 Lite | | $0.03–0.05 | | 720p |
| Veo 3.1 Fast | | $0.10–0.15 | | |
| Veo 3.1 | | $0.20–0.40 | | Top of range includes audio |
| Kling v3 Pro | | $0.112 / $0.168 | | Without / with audio |

Sources: [fal H3 Max page](https://fal.ai/minimax-h3-max) and [model API](https://fal.ai/models/minimax/h3-max/text-to-video) (launch promos ended in September; list prices shown), [teamday.ai price table, 2026-09-23](https://www.teamday.ai/blog/ai-api-pricing-comparison-2026), [real-time video cost comparison](https://omidsaffari.com/blog/real-time-ai-video-api-cost-comparison-2026). Audio typically adds 50–100% on models that price it separately.

## The 24/7 math

One day is 86,400 seconds. Cost per day = 86,400 × price per second.

| Model | $/s | $/day | $/30 days |
| --- | --- | --- | --- |
| H3 Max Turbo 480p | 0.025 | 2,160 | 64,800 |
| H3 Max Turbo 768p | 0.04 | 3,456 | 103,680 |
| Veo 3.1 Lite 720p | 0.03–0.05 | 2,592–4,320 | 77,760–129,600 |
| H3 Max 768p | 0.08 | 6,912 | 207,360 |
| Kling v3 Pro 720p (no audio) | 0.112 | 9,677 | 290,304 |
| Veo 3.1 720p with audio | 0.40 | 34,560 | 1,036,800 |

This is why the viral versions of this idea are sponsored by the model vendor.

## The other line items (small, except one)

| Item | Estimate | Notes |
| --- | --- | --- |
| LLM writing scripts/prompts (50 segment scripts/day) | ~$1–5/day | Claude Opus 5 at $5 / $25 per M tokens; Sonnet 5 ($2 / $10) cuts it further |
| LLM moderating viewer prompts (5,000/day) | ~$2–4/day | Claude Haiku 4.5 ($1 / $5 per M) as a classifier; cache the system prompt |
| Narration (TTS) for an hour of new footage | ~$1–15/day | Depends on provider and voice tier |
| Restream to YouTube Live / Twitch | ~$1/day | A $10–40/mo VPS running ffmpeg. The platforms provide distribution and discovery |
| Clip hosting on Cloudflare R2 | ~$0 | No egress fees |
| **Delivery via Cloudflare Stream** | **$1 per 1,000 viewer-minutes** | [Pricing](https://developers.cloudflare.com/stream/pricing). 500 average concurrent viewers × 24 h = 720,000 min = **$720/day**. At scale, delivery can cost more than generation |

Rule: never serve video from the static host (Netlify bandwidth overages are priced for HTML, not television). Put clips on R2, or push the live channel to YouTube/Twitch and embed it.

## Recommended plan for OKTV

1. **Now ($0):** the prototype's in-browser shows (Yeshidumab commercial, Hostage Video, Intervention, Nightly News) already run as a 24/7 channel with a live guide and ticker. They cost nothing per viewer.
2. **Month 1 (~$50/day):** a nightly batch job writes the next day's segments with Claude. H3 Max Turbo renders 15–20 minutes of cutaways and B-roll ("the admin on hold", "the renewal quote arriving by raven"). The channel interleaves them with the in-browser shows. Human approval before air.
3. **Tentpoles (~$150–900 for the day):** go truly live for SysAdmin Day or a launch: 6–12 hours of audience-voted generation. Voting picks from a **menu of pre-written beats**, not free text ("A) The SAML cert expires B) Chad from Sales arrives C) The intern finds Global Admin"). That keeps the interactivity and removes the risk of a sponsor's channel rendering whatever the internet types.
4. **In parallel:** apply to the fal.live creator pilot with a "night-shift IT hospital" channel concept. If accepted, the always-on generative channel is fal's cost; the site links to it.

## Multi-startup unit economics (the "same thing for other startups" plan)

The engine in `site/` is brand-agnostic. A new startup is a new brand pack (copy, games content, colors, CTA links); the games, shows, referral program and backend are shared.

| Cost per brand | Lean | Programmed |
| --- | --- | --- |
| Generated video | ~$1.2–1.5K/mo | ~$4.5K/mo |
| LLM + TTS + hosting | ~$100–300/mo | ~$300–600/mo |
| Rewards (stickers, hoodies, buttons) | variable; budget per sponsee | same |
| **Total infra** | **~$1.5–2K/mo** | **~$5K/mo** |

Two structural options:

- **Agency model:** one site and channel per startup, priced as a campaign.
- **Network model ("The Parody Network"):** one hub, one channel per startup (OKTV for YeshID, another for a dev-tools startup, another for a fintech), shared infrastructure and cross-promotion. Viewers flip channels and audiences compound. Generation cost is per channel; everything else is shared.

The expensive part is jokes that land for a specific audience, not compute. Budget for writers who know the audience, or keep an admin on retainer as a script consultant.
