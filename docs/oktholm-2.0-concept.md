# Oktholm Syndrome 2.0 — Oktholm General & OKTV

**One line:** a fake hospital with its own 24/7 TV network, where IT admins get diagnosed, play games about their worst days, and stage interventions for each other. Every one of those actions is a referral. It's openly paid for by YeshID.

**Status:** concept plus a working prototype in `site/` (engine + YeshID brand pack). Run `cd site && npm i && npm run build`, then open `dist/index.html`.

---

## 1. Why reinvent it

The current oktholm-syndrome.com is a good joke told once: symptoms, then "there is a cure", a before/after table, and a "Schedule consultation" button.

- **Nothing to do.** You read it, you smile, you leave. No game, no score, no result that belongs to you.
- **Nothing to share but the URL.** No personalized artifact, so no reason to send it to a coworker.
- **Nothing new tomorrow.** Static copy means no return visits.
- **The ask is the hardest one in B2B**, a sales call, made to the audience that hates sales calls most.

v2 keeps the medical parody (it's the domain name and it works) and adds three things:

1. **Play** — games and toys that dramatize real admin pain, each ending in a shareable result.
2. **Broadcast** — a TV network (OKTV) and daily-rotating content, so the site is different every visit.
3. **Recovery** — a 12-step-style sponsorship program. In recovery you get a sponsor; here you become one. That is the referral engine.

## 2. The big idea: Oktholm General

A hospital for IT admins, open all night. Its lobby is a broadcast desk: live ECG vitals ("New cases today", "Admins on hold with vendor support", "AD groups created today", "Ex-employees with active access: ∞"), a news crawl, and a TV playing OKTV.

The visitor journey has three verbs:

| Verb | What happens | Why it spreads |
| --- | --- | --- |
| **Get diagnosed** | 12-question triage → stage (0–IV) + subtype ("The Group Hoarder", "The Renewal Apologist") → certificate, wristband, prescription | Personality-quiz share mechanics on LinkedIn/X: "I've been diagnosed with Stage III. Send thoughts, prayers and budget." |
| **Play** | Access, Please; The Leaver; Build Your Own Oktholm™ Solution; IDle; Renewal Ransom Note; 4096 Groups; Please Hold | Scores, daily seeds everyone shares, screenshots worth posting |
| **Sponsor** | Stage an Intervention (a personalized video for a coworker), share links carrying your sponsor code, chips, rewards | Personalization plus peer pressure, with real prizes on top |

Why admins will share it:

- **Recognition humor:** "this is literally my job."
- **Personalization:** my diagnosis, my ransom note, an intervention with my coworker's name in it.
- **Competition:** daily shift scores, IDle grids, offboarding times.
- **Ritual:** the same daily word/shift/front page for everyone, so people compare.
- **Catharsis:** whacking an ex-employee's 34 accounts, stamping DENIED on the CEO.
- **Self-aware honesty:** "Yes, this is a lead-gen site. At least we're honest about it, which is more than you can say for your renewal quote." Admins forgive marketing that admits it's marketing.

The vendor is never named. The pun does the work. Every place the name would go reads "[REDACTED BY LEGAL]", as a running gag.

## 3. What's in the prototype

| Ward | Route | What it is |
| --- | --- | --- |
| Lobby | `#/` | Broadcast hero, OKTV screen, live vitals, "Today at Oktholm General" (daily Gazette, symptom, confession, IDle, Daily Shift), arcade, guide, sponsorship, cure |
| Triage | `#/triage` | Diagnosis → certificate (1200×630 PNG), wristband, share, prescription. Completing it is the qualifying action that credits your sponsor |
| Arcade | `#/arcade`, `#/play/:id` | Games and generators (below) |
| OKTV | `#/tv`, `#/watch/:id` | The channel: shows auto-rotate, starts muted with "tap for sound", program guide, on-demand pages |
| Intervention | `#/intervention` | Create a personalized intervention; recipients land on `?i=…` and watch their own |
| Sponsorship | `#/sponsor` | Your code and link, sponsee count (backend), reward ladder, chips, leaderboard |
| Group Therapy | `#/therapy` | Confession wall (seeded + moderated submissions), reactions |
| DSM-IT-5 | `#/dsm` | 16 disorders ("Compulsive Group Creation Disorder", "Oauthnesia", "Post-Traumatic Audit Disorder"), each shareable |
| Gazette | `#/gazette` | Daily front page + back issues |
| The Cure | `#/cure` | The plain YeshID pitch: symptom → treatment, dosage (free under 20, 14-day trial, public pricing), FAQ |
| 404 | anything else | "This page requires Enterprise Plus." Request access → ticket, ETA four business quarters |

## 4. The arcade: every joke maps to a real YeshID capability

| Game | The joke | The real pain | YeshID treatment (from yeshid.com) |
| --- | --- | --- | --- |
| **Access, Please** 🛂 (flagship) | *Papers, Please* at the IT desk. Check each request against the HR roster, org chart, policy book and app catalog; stamp APPROVE/DENY. The CEO wants MFA bypass "just this once, I'm on a plane." Glory to Compliance. | Access requests by DM, fake manager approvals, SoD violations, shadow apps | Access requests in Slack/Teams with audit-ready logs; RBAC; just-in-time access |
| **The Leaver** 🚪 | Dave rage-quit via reply-all. Whack his 34 accounts before he exports the customer list. Shadow apps appear mid-game. Dave still controls the office Sonos. | Manual offboarding; forgotten SaaS | Lifecycle workflows; shadow IT visibility |
| **Build Your Own Oktholm™ Solution** 🏗️ | Enterprise "Build & Price" parody: every add-on drags in required add-ons, the architecture diagram turns to spaghetti ("Dave's Script (cron, undocumented)"), go-live slips to Q3 2028 | SSO tax, SKU sprawl, nine-month rollouts | One box. Days, not quarters. Prices on a public page |
| **Renewal Ransom Note** ✂️ | Your renewal quote as a magazine-cutout ransom note: "PAY 38% MORE BY FRIDAY OR THE LOGOUT BUTTON GETS IT", with an itemized quote ("Logout Button (Enterprise tier)") | Renewal shock, SSO tax | Public pricing; free under 20 users; YeshID's SSO-tax microsite |
| **IDle** 🔤 | Daily five-letter identity word game with a spoiler-free emoji grid. "With YeshID you'll finally have time for it." | Daily return habit | Rae does the routine work |
| **4096 Groups** 🗂️ | 2048 where every merge makes a worse group name: Sales → Sales-All-v2-FINAL-DO-NOT-DELETE → "The Group That Contains All Other Groups." Score = groups created. | AD group sprawl | RBAC policies with dynamic groups |
| **Please Hold** ☎️ | A vendor support hold simulator. Queue position goes *up*. "Your estimated wait time is four business quarters." A chip at 10 minutes. | Support ticket time dilation | No queue to find out what a login costs |

## 5. Video strategy: three layers

### Layer 1 — in-browser shows (built, zero marginal cost)
Animated scenes, captions always on (most social video is watched muted), and narration via the browser's speech engine when sound is on. They run 24/7 on OKTV and each has its own page.

- **Yeshidumab (yeshid-u-mab)**, a pharmaceutical ad. "Ask your CFO if Yeshidumab is right for you." Happy montage (leaving at 5 PM, walking a dog, offboarding forty apps with one hand while holding a latte), then the fine print read at double speed: "Side effects may include leaving work on time, remembering your children's names… Tell your doctor about any onboarding lasting longer than four hours."
- **Hostage Video.** VHS, 3:14 AM. Kevin, IT Administrator, holds today's newspaper (the real daily Gazette headline, as proof of life) and reads: "My identity provider is very reasonable. The forty percent renewal increase is fair and customary. Please do not contact YeshID." **His eyes blink Y-E-S-H-I-D in Morse code.** A "Decode his blinks" button. This is the one people will share ("watch his eyes").
- **Intervention!** The referral engine as reality TV. You enter a coworker's name, pick their symptoms and a tone (Gentle / Firm / Full reality TV). Friends on a couch read letters aloud: "Priya, you have 412 Active Directory groups. We counted." You send the link; they watch their own intervention, then "Accept treatment" leads to triage, which credits you.
- **Oktholm Nightly News.** The anchor reads today's three headlines, then "Outbreak Weather": "90% chance of SAML errors, scattered AD groups moving in from the west, high pressure from Finance ahead of renewal season."

### Layer 2 — generated video (AI)
A nightly job writes tomorrow's segments with Claude and renders cutaways and B-roll with MiniMax H3 Max Turbo or Veo 3.1 Lite. The TV interleaves them with Layer 1. On tentpole days, go live with audience voting on pre-written beats. Costs and options are in [`channel-economics.md`](channel-economics.md): about $40–175/day programmed, $2–7K/day for true 24/7 generation.

### Layer 3 — produced hero pieces (shoot once, clip forever)
Shoot as live action or high-end AI; cut vertical for TikTok/Reels/Shorts.

1. **"Intervention: IT Edition"** (series, 90 s episodes). A family stages an intervention for an admin who defends their renewal at dinner. Each episode ends with the admin whispering "…can I at least keep the Terraform?"
2. **"The Hostage Video" (live action).** A single static shot. The Morse blink is real and decodable; the comments will do the marketing.
3. **"Please Hold — 10 Hours"** (YouTube). Hold music, a queue counter, and IVR announcements that get stranger every hour. 10-hour videos are a meme genre; people leave them on in the office.
4. **"The Price Is Wrong"** (game show). Contestants guess the enterprise price of a logout button. Everyone who guesses "free" is escorted out.
5. **"Oktholm: A Documentary"** (mockumentary, 8 min). Talking heads: the admin, the consultant who has been "almost done" since 2023, the office Sonos (voice modulated).
6. **Yeshidumab (broadcast cut, 30 s).** Buy a few late-night slots on a tech podcast network as an actual ad read.

## 6. New content all the time: the content engine

| Cadence | What changes | Cost |
| --- | --- | --- |
| **Every day (UTC midnight)** | Gazette front page, IDle word, Access, Please Daily Shift, hero headline, symptom and confession of the day, the leaver in The Leaver, the hostage's newspaper | Free: seeded rotation, everyone sees the same thing, so scores are comparable |
| **Every 30 min** | OKTV program guide | Free |
| **Weekly** | A new batch of story requests for Access, Please; a new show episode; "Worst Confession of the Week" (winner gets a hoodie) | Writer time |
| **Continuously (UGC)** | Moderated confessions; proposed DSM-IT disorders; interventions (every one a personalized piece of content) | Moderation time |
| **Seasonal tentpoles** | **SysAdmin Day** (last Friday of July), **Renewal Season** (Q4: ransom-note contest), **Zombie Accounts** (Halloween: The Leaver, but the accounts rise again), **Black Friday** ("0% off your renewal"), **Read-Only Friday** banners every week | Campaign budget |
| **AI-assisted pipeline** | Nightly: Claude drafts candidate headlines, confession replies, news scripts and Access, Please requests from a brief plus trending admin topics; a human approves; approved items join the rotation | A few dollars a day |

Content libraries live in `site/brands/oktholm/` as plain data (60 headlines, 40 confessions, 16 DSM entries, 12 triage questions, 8 subtypes and so on), so adding a joke is a one-line PR.

## 7. The Sponsorship Program: rewarding people for recommending it

The 12-step frame does real work: "sponsor" is a word everyone already knows, and it recasts "refer a friend" as helping a friend. It also makes the ask funnier, not creepier.

**Mechanics (built):**
- Every visitor gets a **Patient ID** (e.g. `OKT-7F3K-2Q`) on a hospital wristband. It doubles as their sponsor code.
- Every share button and every intervention link carries `?ref=<Patient ID>`. The landing page captures it (first touch wins; you can't refer yourself) and strips it from the URL, so re-shares carry the *new* sharer's code.
- When the referred person **finishes triage**, the backend credits the sponsor once per person, ever. Both get a chip.
- Chips for engagement (First Shift, Glory to Compliance, Said No to the CEO, Proof of Life, Read the Fine Print…) keep people moving through the site.

**The ladder** (physical rewards are proposals pending YeshID sign-off; rough unit costs):

| Sponsees | Title | Reward | Est. unit cost |
| --- | --- | --- | --- |
| 1 | Sponsor | Oktholm Survivor sticker pack | ~$3–5 shipped |
| 3 | Licensed Interventionist | Recovery Kit: wristband with your Patient ID, "I SURVIVED THE RENEWAL" pin, get-well card | ~$10–15 |
| 5 | Group Therapist | The hoodie (back: "IT'S NOT YOU. IT'S YOUR IDENTITY PROVIDER.") | ~$35–50 |
| 10 | Chief Recovery Officer | **The Big Red Button**: a USB desk button that fires a YeshID offboarding workflow via webhook. For real. "Please do not press it at your manager." | ~$30–60 hardware + setup |
| 25 | Cult Leader (Affectionate) | Donor-wall name, varsity jacket, live roast of your stack by the YeshID team | ~$150 + an hour of the team's time |

**The big commercial idea (needs leadership approval): "We Pay the Ransom."** If a company you referred becomes a YeshID customer, YeshID covers their switching overlap (or pays you a bounty or a charity donation of your choice). This is the hostage metaphor as a real offer, and it's the one line in this doc that sales will love and finance will need to review.

**Fraud posture:** chips are cheap and fine to game. Anything physical gets a human check (distinct real people, business email on the sponsee side) before shipping. The backend adds per-IP daily budgets and one-credit-per-person rules.

## 8. Launch and viral plan

**Principle:** lead with the game, not the brand. Admin communities punish ads and reward gifts.

- **T-14 days:** private beta with 30–50 friendly admins (MacAdmins Slack, local meetups). Collect real confessions for the wall, tune Access, Please difficulty, and seed the leaderboard.
- **Launch day:**
  - **Hacker News:** "Show HN: Access, Please — a Papers Please-style game about approving access requests." Link straight to `?play=access-please`. Disclose the sponsor in the first comment.
  - **r/sysadmin:** a text post with the Daily Shift, sponsor disclosed in the first line, OP answers every comment. Follow the sub's self-promotion rules to the letter.
  - **LinkedIn:** diagnosis certificates. The PNG is sized for the feed.
  - **TikTok/Reels:** the Hostage Video, with the Morse decode as a stitched reveal.
- **Week 1–4:** daily screenshots of the Gazette; weekly "Worst Confession" winner; one new Access, Please story batch a week; Ransom Note contest ("post your note; best one wins a hoodie").
- **Stunts:**
  - **The Oktholm Telethon** (SysAdmin Day): a 12-hour stream with a tote board counting interventions staged, admins calling in with confessions, and every intervention donating $1 to a charity admins care about.
  - **The Free Clinic** (conference booth): staff in scrubs; free screenings on iPads; hospital wristbands with your Patient ID QR; the Big Red Button on a pedestal; a "Please Hold" phone booth with a live leaderboard for longest hold.
  - **Open-source the engine** ("Parody Engine: a framework for B2B satire sites") for a second HN moment and a steady source of backlinks.

## 9. Measurement

- **North star:** qualified sponsees per week (referred visitors who finish triage), and YeshID signups attributed through `utm_source=oktholm-syndrome`.
- **Funnel:** land → play or diagnose → share → referred land → diagnose → CTA click → signup.
- **Viral coefficient:** K = shares per visitor × conversion per share. K ≥ 0.3 in month one means the program pays for itself in reach; K ≥ 1 means you have to buy more hoodies.
- **Instrumentation:** `track()` in the engine already emits room views, starts and finishes, shares, chips, CTA clicks and qualifications to `dataLayer`, Plausible or PostHog, whichever is installed.

## 10. Guardrails

- **Never name the vendor.** Parody names only (SalesFarce, Slacc, Jiraffe…). No real logos.
- **Satire stays about the condition.** Stats like "73% of admins" are labeled satirical in the footer. YeshID claims come only from yeshid.com and its pricing page (`brand.sponsor.facts`, checked 2026-09-28). YeshID's pricing page shows two different Growth prices, so the site links to it instead of quoting a number.
- **No fake testimonials about product results.** Confessions are about the syndrome, never "YeshID fixed my life."
- **Interventions are safe to receive.** Names are validated (letters only, 24 chars, blocklist), symptoms come from a fixed list, and nothing from a link is ever rendered as HTML.
- **No email capture.** You can play everything anonymously. It's a feature: it's why admins will trust it.
- **Accessibility:** keyboard play, reduced-motion support, captions on every show, TV starts muted.

## 11. Needs YeshID sign-off

1. Reward budget and a fulfillment partner (stickers → Big Red Button).
2. "We Pay the Ransom" (commercial terms).
3. Tone review of the brand pack (a quick read of `site/brands/oktholm/`).
4. The Cure page copy and the claims list (`brand.sponsor.facts`).
5. Directory sync wording: YeshID's pricing page says it syncs Okta directories on Business; the site says "other directories too, including one legal won't let us name" to keep the never-name-the-vendor rule. Decide if the Cure page should say it plainly.
6. Deploy target (oktholm-syndrome.com) and analytics choice.
7. Using "Rae" (YeshID's AI) as a character on OKTV, e.g. a Nightly News guest.

## 12. 30 / 60 / 90

- **30 days:** deploy the site with the backend, private beta, launch with Access, Please + triage + interventions, first sticker orders.
- **60 days:** Layer-2 generated segments on OKTV; Worst Confession of the Week; first produced hero video (the Hostage Video); SysAdmin Day or Renewal Season plan locked.
- **90 days:** Telethon or Free Clinic stunt; open-source the engine; second brand pack for another startup (proves the engine).

## 13. "Build your own Oktholm" (both meanings)

- **For visitors:** the Build Your Own Oktholm™ Solution configurator (in the arcade).
- **For other startups:** the engine is brand-agnostic. `npm run new-brand -- <id>` scaffolds `site/brands/<id>/` from the template. Fill in the enemy (never named), the syndrome, the sponsor's real claims and the content libraries; then `BRAND=<id> npm run build`. Same games, same shows, same sponsorship backend, different joke. See `site/README.md`.
