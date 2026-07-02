# Hauntline — Build Spec v2

**One-liner:** Run the haunt. Fail and become a ghost. Escape and leave a curse.

**Platform sentence:** Every subreddit grows its own haunted room, shaped by its players' failures, victories, and comments.

**Design law (repeat this daily):** The thing the player does with their hands becomes the thing the community sees tomorrow.

---

## 0. Build Philosophy

1. **Primitives ARE the art.** Blobs with faces, flat-color tiles, one warm accent. Graybox directly in the final palette so there is never a "repaint" phase — only additive polish.
2. **Feel before features.** If threading two ghost trails isn't fun with circles by end of Phase 1, stop and fix feel. Art and AI cannot rescue a dead dash.
3. **Fake the AI where nobody can tell.** Fairness checking is pathfinding, not an LLM. Mood reading starts as keywords. The *fiction* of Murmur is the product; the backend sophistication is invisible.
4. **The demo post is the game.** Judges evaluate by opening a Reddit post. Every decision optimizes for: scroll → understand → dash within 5 seconds.

---

## 1. Core Loop

```
See room in feed → aim & dash (20–40s run)
  ├─ FAIL → path recorded → "Kept." → ghost candidate for tomorrow → instant retry
  └─ WIN  → bell rings → place one fair curse → Murmur approves → tomorrow is yours to ruin
Daily: Murmur assembles tomorrow's haunt from ghosts + curses + comments
Return question: "Did my ghost or curse make it in?"
```

Three loops, all mandatory:
- **Daily loop:** new haunt every day per subreddit
- **Community loop:** comments/votes steer tomorrow's mood; escape rate is shared score
- **Contribution loop:** failures become ghosts, wins become curses

---

## 2. PHASE 1 — The Playable Primitive Core (build this first, weeks 1–2)

Everything in this section must work and feel great before anything in later sections is touched. This phase alone is a submittable game.

### 2.1 The Room

- Single screen, fits Reddit interactive post viewport, mobile-first (~350px wide target).
- Fixed tile grid (suggest 9×12 logical tiles).
- Contents: player start (bottom), bell exit (top area), 2–4 wall rects, 2–3 ghost trails, 0–1 trap.
- **Readability test:** at feed width, squinting, you can identify start / bell / ghosts / trap / safe gaps in one glance. This is a hard gate.

### 2.2 Palette (graybox in these colors from day one)

- Background/floor: deep desaturated purple-gray (#2A2438 range)
- Walls: darker purple, slight outline
- Player: warm white blob, two dot eyes
- Ghosts: cool translucent white-blue, **soft purple glow** (they must be the 2nd most visible element — the current mock's subtle gray trails fail on mobile)
- Bell: **warm gold** — the ONLY warm color in the room. The eye must land on it instantly.
- Trap/curse tiles: purple accent (#8B7AB8 range)
- UI buttons: purple, white text

One warm accent against purple-grays reads as "finished minimal aesthetic," not graybox.

### 2.3 Movement — Drag-to-Dash

- **Input:** press anywhere → drag to aim → dotted preview line → release to dash. Identical on touch and mouse. No keyboard in Phase 1.
- **Charge feel:** blob squashes while aiming; preview line **trembles slightly at full charge**.
- **Risk-reading aim line:** where the preview line crosses a ghost trail's current/near-future position, that segment tints red. The line is a decision tool, not just a pointer.
- **Dash:** stretch in dash direction, fixed distance burst, glowing trail behind.
- **Stop:** 2-frame anticipation hang, then settle with a tiny bounce. Every dash is a landing.
- **Trail decay:** the player's own trail fades over ~2s. (Foreshadows "your path becomes a ghost" every single run.)
- **Cooldown:** 0.2–0.3s, visualized as one quick "catching breath" pant animation — never an invisible timer.
- **Input buffering (non-negotiable):** aiming may begin during cooldown; release fires the moment cooldown ends. ~10 lines, the difference between responsive and sticky.
- **First-dash grace:** for the first 2 seconds of a session, ghost hitboxes are 10% smaller. Protect the judge's first impression.

Feel target: *haunted mini golf*. Player thinks "can I thread between those ghosts at the right moment," never "what's the maze route."

### 2.4 Ghosts (Phase 1 version)

- A ghost = a replayed recorded path (position samples + timestamps) rendered as a translucent blob following its trail loop.
- Trail rendered as glowing dashed path; blob has two dot eyes.
- **Recording:** every run logs the path. On fail, path + death point stored.
- **Phase 1 casting:** no AI. Hard-code selection: pick the 3 most *spatially distinct* recent failed paths (simple distance metric between path signatures). Label them with canned roles by heuristic:
  - erratic direction changes ≥ N → **Panic Ghost**
  - path toward coin/side area → **Greedy Ghost**
  - died within 1 tile of bell → **Almost Hero**
- **Seed content:** ship 8–10 hand-recorded ghosts so the demo room is never empty and judges see variety on first open.
- Username label on ghost, truncated (u/CoffeeAnd…), full name on tap.

Collision with a ghost = death.

### 2.5 Death (failure must feel like contribution)

Sequence, total ~1.5s, skippable by tapping:
1. Brief freeze (0.2s)
2. Player pops into glowing outline
3. Path lights up start→death
4. Tiny ghost rises; **camera/room leans ~5% toward it**
5. Ghost does one death-matched pose: shrug (bat), facepalm (false coin), slow clap (died ≤1 tile from bell)
6. Murmur stamp slams — **screen jolts 1px** — text card:

> Murmur kept your mistake.
> You became: **Panic Ghost**
> *Doubled back twice. Died anyway.*
> [ Try again ]

- Died ≤1 tile from bell → special stamp: **"Almost Hero. Kept with honors."**
- Restart is instant. No game-over screen.

### 2.6 Victory

1. Bell ring is the loudest moment in the game: bell shakes, visible ring ripple crosses the room, **ghosts physically recoil** from the sound wave and fade.
2. Murmur appears, mildly annoyed: *"Fine. Leave one curse."*
3. → Curse placement (2.7)

### 2.7 Curse Placement (Phase 1: exactly 3 curses)

Not a level editor. Pick one card, place on a glowing valid tile.

| Curse | Behavior | Icon rule |
|---|---|---|
| **Spring Tile** | Launches the player sideways, wrecking timing | Coiled spring + launch arrows. **NOT spikes, NOT a bear trap** — the mock's spiky version contradicts "traps create stories, not damage." It must look bouncy, mischievous, non-lethal. |
| **Sleepy Bat** | Sleeps (visible Zzz); wakes if a dash passes too close, then drifts across the room | Round sleeping bat |
| **False Coin** | Shiny bait; approaching it triggers the tease (opens to nothing / shifts attention) | Coin with tiny skull face |

**Placement UX (show the interaction, don't skip it):**
- Valid tiles glow purple; invalid tiles wiggle on attempted drop
- Card snaps to grid
- **Fairness check = pathfinding, not AI:** run A*/flood-fill from start to bell with the trap active. Playful checklist animates: ✓ visible ✓ avoidable ✓ still beatable
- Murmur reacts: *"Mean, but fair."* / *"Too cruel. Move it one tile."* / stamps **APPROVED** (1px screen jolt)

Winner should feel: *"Now I get to be the problem."*

### 2.8 Murmur (Phase 1 version)

Small petty demon clerk: horns, big eyes, tiny tail, ledger + stamp. **Static pose-swaps, not full animation** — idle / stamping / annoyed / asleep. Animal-Crossing-style pose swapping reads as charm, not cheapness. Budget one full day on Murmur; he is the screenshot generator.

Phase 1 line pool (canned, context-triggered):
- On keep: *"Kept."* / *"I'm keeping that."*
- On fair trap: *"Fair. Mean, but fair."*
- On unfair trap: *"Too cruel. Move it one tile."* / *"Even I have standards."*
- On near-win death: *"You nearly mattered."*
- After 3 fails on same route: *"You really like that left wall."*
- Rare (1%): *"I've kept 4,062 mistakes. Yours is my favorite today."*
- Idle >20s: Murmur falls asleep; snorts awake when player aims.

Tone: short, dry, petty bureaucrat. Never more than one sentence.

### 2.9 The Feed Post (structural priority #1)

**The feed post should BE the game, not an ad for it.** If Devvit allows, the player drag-aims directly on the first screen — zero taps between scroll and dash. If a splash is technically unavoidable, it is one tap maximum:

> **Hauntline** — *Yesterday's players are today's obstacles.*
> Today's Haunt: **The Corner of Regret**
> 👻 3 ghost paths | 🪤 1 winner curse | Escape rate: 34%
> [ **Run the haunt** ]

Every additional tap between feed and dash costs players and judge goodwill.

### 2.10 Sound (4 sounds, muted-by-default, tiny toggle)

charge hum · dash whoosh · bell ring · stamp thunk. Reddit autoplays muted; audio is bonus, never required for play.

### 2.11 Micro-delight pack (each is <1 day, batch-build)

- Ghost faces react on **narrow** passes only (rarity = value): widened eyes; smug look if you die to them
- Near-miss: spark + *"threaded it"* micro-text + 0.15s slowmo when passing a tight gap
- Close-call counter per run; Murmur: *"Three near misses. Show-off."*
- Your own previous-attempt ghost (this session) waves at you
- Ghosts occasionally bump each other → "oops" wobble
- Floating *"u/zigzagged was here"* at popular death spots
- Idle room life: bell sways, bat snores Zzz, fog drifts slowly (NO light flicker — flicker reads as a rendering bug)
- Escape-rate flavor: *"34% escaped. The room is winning."*
- Most-common death spot marked with a tiny pile of hats

### 2.12 Explicit Phase 1 cuts

No keyboard controls · no mobile vibration API · no level editor · no AI calls · no multi-room maps · no progression tree · no story text · no comment parsing yet.

**Phase 1 exit gate:** a stranger on a phone opens the post, understands in 5 seconds, plays 3 runs, fails, laughs at the stamp, retries. If yes → Phase 2.

---

## 3. PHASE 2 — The Daily Engine (week 3)

### 3.1 Daily rollover (per subreddit)

Scheduled job at local midnight (or fixed UTC):
1. Collect the day's runs, deaths, wins, placed curses, comments
2. Select tomorrow's 3 ghosts (heuristics from 2.4; AI upgrade in 3.3)
3. Select 1–2 approved curses (prefer the one that killed the most players — "most effective trap")
4. Apply one daily mutation (3.4)
5. Generate the new post + yesterday's recap card

Phase 2 prototype starts without a backend: use a small data table of recognizable real subreddits, then swap haunt name, ghost seed pool, escape rate, mutation/mood copy, fog/tint, speed tuning, room layout, palette, and dressing from that table. This proves the data shape before persistence exists.

### 3.1a Subreddit Haunt Primitives

Each subreddit config must drive real playable primitives, not only text:
- **Palette:** floor, wall, seam, accent, fog/tint family
- **Layout:** approved obstacle rectangles that preserve a path from start to bell
- **Dressing:** sparse prop vocabulary that implies the subreddit without literal meme theming
- **Ghost casting:** seed pool, speed multiplier, and role mix
- **Mutation:** one fixed-menu rule that changes feel within one dash
- **Feel parameters:** dash length, dash speed, cooldown, fog density, trail prominence, and hazard tempo
- **Copy:** haunt name, Murmur tone, recap language
- **Comment signals:** a compact summary of what the thread pushed for, stored as fixed knobs such as `moreFog`, `fasterGhosts`, `splitRoutes`, `harsherJudgment`, or `mercyRoute`.

Generated variation must be assembled from approved primitive sets and then checked with pathfinding. Never let a visual theme create impossible rooms, fake ghost paths, unreadable lanes, or copy-only differences.

### 3.2 Recap card (in-post, top of new day)

> **Yesterday's Haunt: The Hallway of Bad Choices**
> 127 runs · 43 escapes (34%)
> Funniest ghost: u/zigzagged (Panic Ghost)
> Featured curse: False Coin by u/BraveBorrower
> Mutation today: **False Exit**

**Important (from mock review):** the recap's room image is a **top-down snapshot of the actual room** with its real ghost paths and death cluster — never a decorative perspective illustration that doesn't match gameplay. "Look where everyone died" is more interesting than concept art, and judges notice when marketing doesn't match the game.

### 3.3 Murmur's brain, staged honestly

| Stage | Ghost casting | Trap fairness | Comment mood |
|---|---|---|---|
| **2a (ship this)** | Heuristics: erraticness, proximity-to-bell, path distinctness | Pathfinding (already done) | Keyword triggers: "fog"→fog+, "fast"→keep fastest ghost, "gentle/cozy"→Mercy Ghost, "bait"→False Exit mutation, top comment→room name |
| **2b (if time)** | One LLM call/day/sub: classify paths into roles + write one-line ghost epitaphs | unchanged | One LLM call/day/sub: summarize top comments → pick mutation + mood from a fixed menu |

Rules that keep this safe and non-sloppy:
- AI output always selects from **fixed menus** (ghost roles, mutations, moods) — it curates, never free-generates mechanics
- AI/comment output may tune bounded numeric parameters, but only inside approved ranges (`dashDistMul`, `dashSpeedMul`, `speedMul`, `fogCount`, cooldown, palette family). No arbitrary generated code, no arbitrary geometry.
- One call per subreddit per day, at rollover, never in the play loop → zero latency risk, near-zero cost
- If the call fails, heuristics run. The player can never tell.
- Frame everywhere as: **AI curates community memory into playable challenges** — never "AI generates levels." No prompt boxes, no "AI" in UI copy. Murmur is a character, not a feature.

### 3.4 Daily mutations (fixed menu of ~8, one per day)

Heavy Air (shorter dashes) · Slippery Floor (drift after landing) · Echo Bell (two bells, one lies) · Crowded Haunt (harmless vision-blocking ghosts) · Generous Ghost (one ghost shows safe timing) · Greedy Room (coins, each wakes something) · Fog Day · No mutation ("a quiet day — suspicious").

Rule: every mutation must be **felt within one dash**. No abstract stat modifiers.

### 3.5 Comment integration

Pinned comment prompts, rotated daily:
- "Name today's haunt" (top reply becomes tomorrow's room name)
- "Keep the fastest ghost or the funniest ghost?"
- "More fog or more traps tomorrow?"

The thread arguing about what the room becomes IS the community loop. Surface the winning comment in the next day's recap with credit.

### 3.6 Mercy valve

After 4 consecutive fails: *"Follow a helper ghost?"* → one ghost replays a safe route with visible timing. Keeps casual subs alive without difficulty settings.

---

## 4. PHASE 3 — Emergence Showcase (week 4, pre-submission)

### 4.1 Haunt Atlas

One screen, three subreddit cards, same engine, visibly different haunts. This is the judge-facing proof of the platform pitch and the top Reddit-y differentiator — **protect this feature above everything else in Phase 3.**

| Sub profile | Tuning | Vibe |
|---|---|---|
| **r/AskReddit** | spatially varied ghosts, average speed, mixed-route chaos | everyone tried something different |
| **r/AmItheAsshole** | slightly faster ghosts, harsher Murmur judgment, fairness-check emphasis | judgment day |
| **r/nosleep** | heavier fog, slower dread pacing, darker room tint | believable horror |

Same curse assets, per-sub tuning drift — demonstrates "every subreddit grows a different haunt" without new content.

Phase 3 acceptance test: switching subreddit cards must change at least four of these at once: layout, palette, fog/depth, ghost seed mix, ghost tempo, dash feel, mutation chip, Murmur/recap copy, and dressing. If a judge says "same room, different label," Phase 3 has failed.

### 4.2 Meta-callout (stolen from Jury of Ducks)

Daily recap includes yesterday's dominant strategy: *"Everyone hugged the left wall. The wall noticed."* The community versus its own habits, one line of analytics + one Murmur quip.

### 4.3 Named ghost persistence (if time)

A ghost that survives community vote returns as a recurring character. Community memory becomes content; extends the emergence ceiling for month three (and is the honest answer if a judge asks about long-term content: "the curse pool grows on the roadmap; the ghost layer is already infinite").

---

## 5. Demo & Submission Package

**Demo post must be pre-seeded:** 8–10 varied hand-recorded ghosts, 1 placed curse, realistic recap stats, a few planted comment prompts, and 3 recognizable subreddit configs (`r/AskReddit`, `r/AmItheAsshole`, `r/nosleep`). The room must never look empty — and note the self-improving property: every judge who plays adds ghosts during judging week.

**Judge's 60-second path:** open post → understand from one screen → first dash lands (grace window) → near-miss spark → die to a ghost → path lights up → "Panic Ghost. Kept." → retry → win or almost-win → see curse placement → scroll recap + Haunt Atlas.

**The 15-second clip:** aim → thread two ghosts → almost wake the Sleepy Bat → lunge at False Coin → panic → die → stamp: *Panic Ghost. Kept.* Cut to: win → *"Fine. Leave one curse."*

**Submission checklist:**
- App listing on developer.reddit.com
- Public demo post on own subreddit (self-explanatory, seeded)
- Devvit Rules compliance pass
- Mobile viewport test on a real phone, bright light, one thumb
- Developer feedback survey (free shot at Feedback Award)
- **Phaser paragraph** for the Phaser sub-award, written before build finalizes: tweens (squash/stretch/dash), particle emitters (ghost trails, near-miss sparks, fog), arcade physics (spring launches, bat drift), path followers (ghost replay), camera effects (death lean, ring ripple). Phaser must read as *elevating* the game, not a checkbox.

---

## 6. Priority Stack (when time runs out, cut from the bottom)

1. Dash feel: buffering, risk-read aim line, stop-bounce, trail decay
2. Ghost record/replay + 3 seeded roles
3. Death→Kept sequence + Murmur stamps
4. Bell victory + 3 curses + pathfinding fairness
5. Playable-from-feed post + readability palette
6. Daily rollover + recap card (heuristic brain)
7. Micro-delight pack + 4 sounds
8. Comment keyword integration
9. Haunt Atlas (3 profiles)
10. LLM curation upgrade (2b)
11. Meta-callout line
12. Named ghost persistence

Items 1–5 are the game. Items 6–9 win the hackathon. Items 10–12 are gravy.

---

## 7. Anti-goals (unchanged, now with reasons)

- No literal fishing/hook anything (explicit judge warning)
- No Reddit-topic theming — Reddit-y = community-shaped, not karma jokes
- No visible "AI" — Murmur is a clerk, not a chatbot; no prompt boxes ever
- No spikes as signature trap iconography — bouncy, sneaky, sleepy, never lethal-looking
- No perspective marketing art that doesn't match top-down gameplay
- No feature that can't be understood by playing the demo post unassisted

---

# APPENDIX A — Polish & Juice Checklist

Flat, exhaustive, agent-workable. Each item is a discrete task with concrete values. Values are starting points — tune by feel, but never remove the effect. Ordering within each section is build priority.

## A1. Player Character ("the Runner")

Warm-white blob, ~1 tile diameter, two black dot eyes, tiny shadow ellipse beneath.

- [ ] **Idle breathing:** scale Y 100%↔103%, 1.2s sine loop
- [ ] **Idle blink:** every 3–5s (randomized), eyes to lines for 100ms; occasional double-blink
- [ ] **Aim squash:** while dragging, squash toward drag direction (scaleY 0.85, scaleX 1.1 at full charge); eyes narrow slightly — determined face
- [ ] **Eyes look where you aim:** pupils offset 2px toward aim direction while charging
- [ ] **Launch:** stretch along dash vector (scaleX 1.3, scaleY 0.8), dust puff particle at launch point (4–6 gray puffs, 300ms fade)
- [ ] **Dash trail:** glowing warm-white ribbon behind runner, fades over 2s (this is the "your path is the artifact" foreshadow — never cut it)
- [ ] **Stop:** 2-frame hang at end of dash, then settle bounce (scale 1.08 → 1.0, 150ms elastic ease)
- [ ] **Wall hit:** hard squash against wall normal (scale 0.7 on impact axis), 3–4 dust puffs, 2px screen shake, eyes go wide (○ ○) for 200ms
- [ ] **Cooldown pant:** one quick open-mouth pant animation (200–300ms) — the cooldown must be visible on the character, never an invisible timer
- [ ] **Graze tint:** passing within 0.5 tile of a ghost tints the runner's trail ghost-blue for 1s
- [ ] **Fear proximity:** within 1 tile of an active (woken/moving) hazard, eyes widen and blob trembles ±1px

## A2. Ghosts

Cool white-blue translucent blobs (~60% opacity), wavy bottom edge, two dot eyes, soft purple outer glow. Trail = glowing dashed path at ~40% opacity, must remain clearly visible at 350px feed width in bright light.

- [ ] **Float bob:** ±2px vertical sine, 2s loop, phase-offset per ghost so they never sync
- [ ] **Trail pulse:** dashed trail slowly "flows" in path direction (dash offset animation, 1px/frame)
- [ ] **Narrow-pass reaction (narrow passes ONLY, ≤0.75 tile):** eyes widen, small "!" poof above head, 400ms. Rarity is what makes it a moment — never trigger on ordinary passes
- [ ] **Kill smugness:** the ghost that kills you gets closed smug eyes (⌣ ⌣) + tiny bow, 600ms
- [ ] **Ghost bump:** when two ghost paths cross within 0.3 tile, both wobble + "oops" sweat-drop, max once per 10s
- [ ] **Session self-ghost:** your own previous failed attempt this session replays at 30% opacity and **waves at you** (tiny nub arm) when you spawn
- [ ] **Username labels:** u/TruncatedNa… at 60% opacity above ghost; full name in a small card on tap
- [ ] **Victory recoil:** on bell ring, all ghosts blown back 1 tile by the ring ripple, then bow and fade out over 800ms
- [ ] **Death-spot memorial:** the room's most common death tile shows a small pile of 2–3 tiny hats; floating "u/name was here" text (40% opacity) drifts up from it every ~15s

## A3. Murmur

Small petty demon clerk, bottom-right corner dock (out of play area): stubby horns, oversized eyes, tiny tail, clipboard + rubber stamp. **Pose-swap system, not skeletal animation** — 6 static poses with 100ms crossfade: idle / stamping / annoyed / pleased / asleep / surprised.

- [ ] **Idle:** checks clipboard every 8–12s (pose flick); tail tip twitches on a 3s loop
- [ ] **Stamp:** raises stamp (anticipation, 150ms) → slams → **entire screen jolts 1px down for 1 frame** → red-purple "KEPT." / "APPROVED" imprint appears with 5° random rotation
- [ ] **Asleep:** after 20s idle, eyes close, Zzz particles; player starts aiming → snort-awake (surprised pose, 300ms)
- [ ] **Watching:** if player holds aim >5s without releasing, Murmur leans in; nearby ghosts turn to watch too
- [ ] **Line delivery:** speech bubble, one sentence max, typewriter fill at 30ms/char, auto-dismiss 2.5s. Full line pool in §2.8; every line context-triggered, never random filler

## A4. Environment & Room

Top-down room on deep purple-gray floor (#2A2438 family), darker purple walls with 1px lighter top edge (fake height), rounded outer corners.

- [ ] **Floor texture:** near-invisible tile seams (4% lighter lines) — structure without noise
- [ ] **Vignette:** soft radial darkening at edges, ~15% — makes the room a stage
- [ ] **Fog layer:** 1–2 large soft fog sprites drifting horizontally at 2–4px/s, 8% opacity, looping. **NO light flicker anywhere** — flicker reads as a rendering bug in a feed
- [ ] **Bell (the goal):** the ONLY warm-gold object. Faint constant glow halo; sways 2° every 6–8s; hum + glow intensify with player proximity (glow radius +30% within 3 tiles); tiny sparkle particle every ~4s
- [ ] **Bell victory:** violent shake, gold flash, **visible ring ripple** (expanding circle stroke, 400ms, full room width) that pushes ghosts back; 3px screen shake; light confetti of tiny bell/note particles
- [ ] **Wall dressing (sparse, max 3–4 per room):** corner cobweb, torch sconce with slow-pulse purple flame (pulse, not flicker), tally marks scratched on a wall, tiny skull pile in one corner. Props never on playable tiles
- [ ] **Curse tile idle:** each placed curse wobbles ±1° every 4s — the room feels rigged, alive
- [ ] **Sleepy Bat idle:** hangs with Zzz particles; wake = eyes snap open, Zzz pops, 200ms hover-shake before it starts drifting (telegraphed, fair)
- [ ] **False Coin idle:** glints (diagonal shine sweep) every 3s — bait must advertise
- [ ] **Spring Tile idle:** compressed coil trembles slightly; on trigger, full cartoon extension + "BOING" squash on the launched runner
- [ ] **Ambient dust motes:** 3–5 tiny particles drifting in the vignette light, 5% opacity

## A5. Screens & Transitions

Rule: every transition ≤400ms, every one skippable by tap, restart is instant.

- [ ] **Feed → play:** if splash is unavoidable, single card ("Today's Haunt" + Run button); button press → card slides up 250ms, room already rendered beneath. Room is visible AT feed level — the post never looks like a loading screen
- [ ] **Room entry:** ghosts fade in sequentially (100ms stagger), then trails draw along their paths (300ms), then runner drops in with a squash landing, then Murmur pops up in his corner. Total ≤1s, skippable
- [ ] **Death → retry:** death theater (§2.5, ~1.5s, tap-skippable) → stamp card → "Try again" → card slides away, runner respawns with drop-squash, ghosts DON'T re-run their entrance. Retry-to-control ≤300ms
- [ ] **Victory → placement:** bell sequence → room's saturation dims 20%, valid tiles begin glowing → curse cards slide up from bottom (staggered 80ms). The game board stays visible — placement happens ON the real room, never a separate abstract screen
- [ ] **Placement → done:** APPROVED stamp → card of "See you tomorrow" state: room with your curse installed and softly pulsing, "Tomorrow's haunt is forming." + share prompt
- [ ] **Daily recap card:** slides down from top when opened; yesterday's top-down room snapshot draws its ghost paths one by one (150ms each) — a tiny replay of the day
- [ ] **Haunt Atlas:** three sub cards; horizontal swipe/tap; each card's mini-room has its ghosts idly bobbing — the atlas itself is alive, not thumbnails

## A6. Feel Systems (invisible, non-negotiable)

- [ ] **Input buffering:** aim may begin during cooldown; release fires the instant cooldown ends
- [ ] **First-dash grace:** ghost hitboxes −10% for the first 2s of each session
- [ ] **Coyote hitboxes:** ghost collision circle is 85% of visual size, always — deaths must feel earned, near-misses generous
- [ ] **Near-miss slowmo:** threading a gap ≤0.75 tile between two hazards → 0.15s at 60% timescale + spark particle + "threaded it" micro-text (12px, fades up)
- [ ] **Close-call counter:** per run; at 3+, Murmur on next death/win: *"Three near misses. Show-off."*
- [ ] **Screen shake budget:** wall hit 2px, stamp 1px jolt, bell 3px. Nothing else shakes. Shake is a currency — spend it in exactly three places
- [ ] **Hit-stop:** 80ms freeze on death contact before the theater starts — makes death feel physical
- [ ] **Text pops:** all micro-text (threaded it / close / KEPT) scales in 1.2→1.0 with 100ms back-ease, never just appears

## A7. Sound (muted by default, toggle icon top-right, game fully playable silent)

- [ ] charge: rising soft hum (pitch follows charge)
- [ ] dash: short whoosh
- [ ] wall hit: soft thud
- [ ] near-miss: airy shimmer
- [ ] death: gentle "poof" + one low Murmur chuckle (rare, 20%)
- [ ] bell: warm bright ring with 1s decay — the best sound in the game, spend time here
- [ ] stamp: satisfying rubber-stamp thunk
- [ ] UI: tiny tick on card snap / tile select

8 sounds total. If cutting, keep bell + stamp + dash.

## A8. Polish Acceptance Test (run before submission)

1. Open post on a real phone, outdoors/bright light: are ghost trails and bell instantly visible?
2. Hand it to someone cold: do they dash within 5 seconds without instruction?
3. Do they smile or narrate at the death stamp? (If not, death theater timing is off)
4. Play 10 runs: does any animation feel repetitive or slow yet? (If yes, shorten it — repeat-viewing tolerance beats first-viewing wow)
5. Is anything moving that shouldn't be (jank), or static that should breathe (dead room)?
6. Screenshot test: does a random mid-run frame look like a finished game?
