# Part 6 – Rewards & worlds

**Goal:** the dragon game around the exercises. Progress is clear and fair: no random loot, nothing taken away.

← [Back to plan](../PLAN.md)

## Tasks

Rules decided 2026-11-04 (with the user): 100 crystals per egg plus +10 per finished round (3–5 rounds per egg), Mehrzahl open first and one more land per hatch, growth by rounds since hatching (10 → young, 25 → grown). **Superseded 2026-11-05** by "Feed one dragon" below (growth and lands by crystal steps). Details in PRODUCT.md › Rewards. Engine: `src/engine/rewards.ts`, roster: `src/content/dragons.ts`.

### Economy
- [x] Crystals: 3 = first try, 2 = after a hint, 1 = after the answer was shown.
- [x] Points: running total shown on home. (The crystal total is the score; no second counter.)
- [x] Egg progress bar: 100 crystals → egg is ready; +10 crystals for every finished round so effort always counts. Ten-gem meter on the round summary.
- [x] No losing crystals, no streak punishment.

### Eggs & dragons
- [x] Egg hatching moment (animation + sound): tap the wobbling, knocking egg, it cracks open with a hiccup, the baby sits in its shell halves.
- [x] Child types a name for the new dragon (custom keyboard, shift on for the first letter).
- [x] Dragon collection screen: hatched dragons with names and growth, the egg in progress, eggs still to find as silhouettes.
- [x] ~10–15 dragons in v1: 12 kinds, tinted placeholders until Part 7.
- [x] Dragon growth: a hatched dragon grows hatchling → young → grown as the child keeps playing (rule to decide, e.g. crystals earned after hatching). Never shrinks. Art from Part 7.
  Rule: young after 10 finished rounds since hatching, grown after 25 ("Wächst in 7 Runden" in the collection). Replaced 2026-11-05: fed with crystals, see below.
- [x] Home shows the next step under the caption, in crystals: "Noch 40 Kristalle, dann wird Funkel ein junger Drache.", "Noch 37 Kristalle, dann schlüpft dein Ei.", or "… ist schon ein großer Drache!" when all are grown.

### Sound effects (decided 2026-11-04, via `/impeccable` when built)
- [x] Make the effects with ElevenLabs sound effects (`eleven_text_to_sound_v3`, ~10 credits per second) and bundle them as MP3 for offline. Demos in `audio-samples/sfx-*`. → `npm run sfx` (`scripts/gen-sfx.ts`), 10 files in `public/sfx/`, ~310 credits, 380 KB.
- [x] Style is a mix: **soft** for frequent sounds (right-answer chime, gem landing on the hoard, key click), **cartoon** for rare moments (hint bubble "blub", round-end coin cascade with slide whistle, egg wobble and hatch with baby-dragon hiccup, entering a land). Never a harsh sound for a mistake.
- [x] Mute toggle; ambient loops (grotto, dragon snore) only on Home, quiet, off by default. Both switches on Home, saved in the profile.
- [x] Update DESIGN.md › Sound.
- [x] Key click (2026-11-05): the ElevenLabs tick (0.5 s of soft noise, no attack) was dropped 2026-11-04 as irritating. Brought back as a synthesized 45 ms click (`npm run click` → `public/sfx/key.wav`) with a small random pitch per press.

### Background music (decided 2026-11-05, via `/impeccable` when built)
- [x] Dragon music on **Home and the round reward only**; exercises stay quiet so the voice clips (Kurz/lang, Laute) are clear.
- [x] Mood: lively dragon adventure, like an animated dragon-rider film theme. Not ambient (too sleepy for a kid), not cute. Heroic D-dorian theme lifting into a major chorus, ~105 BPM, galloping strings like wingbeats, big drums, horns and trombones on the tune, fiddle and whistle answering.
- [x] Samples with ElevenLabs Music (`music_v1`, paid plan, commercial use): 4 rounds of 3 (calm grotto → epic → lively → dragon + lively), parent picked **music-j-ride** (2026-11-05). Prompt and loop points in `scripts/gen-music.ts` (`npm run music`; `--generate` makes a new take). Loop: cut at 72.0 s before the closing decay, last bar (2.3 s) crossfaded into the opening → 69.7 s seamless loop.
- [x] Bundle the loop as MP3 for offline, loudness normalized to sit under the voice. → `public/sfx/music.mp3`, 837 KB, -27 LUFS (voice ≈ -21), precached.
- [x] One atmosphere switch **Musik** replaces Meeresrauschen: music is the main layer, the water plays at half level underneath, the snore is dropped.
- [x] Ducks under every voice clip, fades in/out, off by default, saved in the profile (`profile.ambient`). Checked in WebKit (iPad + iPhone viewports): starts on the switch, stops in a land, comes back on Home. Real-device listen still open.
- [x] Update DESIGN.md › Sound.

### Worlds
- [x] 5 lands, one per exercise, on a world map / home screen.
- [x] Land 1 open at the start; the next one unlocks after N finished rounds or a set number of crystals. → Mehrzahl open at start; each hatch opens the next (Lücke → i/ie → Laute → Kurz/lang). Lands already played before this update stay open (storage schema 2).
- [x] Each land has its own dragon to find: a land's egg first hatches that land's dragon, then the rest of the roster in order.

### Feedback & greeting
- [x] Greeting with the child's name ("Hallo, [Name]!"). The name is set on first start in v1; it moves to parent mode in v2.
- [x] A list of short German praise lines ("Super!", "Stark gemacht!", "Du bist ein Drachenprofi!"), rotating.
- [x] Gentle wrong-answer lines, leading the first hint ("Noch nicht ganz.", "Gleich hast du es!").
- [x] Round summary: crystals, egg progress, dragon of the day. (2026-11-05: the goal only, no dragon of the day.)
- [x] Voice clips for the new texts (praise, gentle lines, name questions, the feed/grow lines of 2026-11-05): next `npm run audio` run (ElevenLabs, see PRODUCT.md › Audio). Until then the device voice reads them.
  Done 2026-11-05: 18 lines × 3 Knurps tones = 54 clips; the 3 clips of the retired line "Super! Ein Kristall für deinen Schatz." were removed. Lines with the child-chosen dragon name can't be pre-recorded, so the grow screen's speaker reads name-free lines ("Dein Drache ist satt!", "Tipp auf deinen Drachen!", "Dein Drache ist gewachsen!") while the screen text keeps the name.

### Feed one dragon (decided 2026-11-05)
Rounds-based growth felt unrelated to effort. New loop, one goal at a time, crystals the only currency:
egg (100) → baby; feed 100 → young; feed 100 → grown; the grown dragon finds the next egg.
A land opens at every step (hatch, young, grown). Eggs hatch in roster order (the 5 land dragons first).
- [x] Engine: one goal (`goalOf`), growth by crystals, land per step, eggs in roster order (`rewards.ts` + tests).
- [x] Storage schema 3: dragons keep the stage they had, egg crystals become goal crystals; nothing taken away.
- [x] Screens via `/impeccable` (shaped 2026-11-05, build after the open screen PR is merged; brief below).

#### Screen brief (shaped with the user 2026-11-05)
Decisions: the growth moment gets its own screen like the hatch; Home shows the dragon being fed; the round summary shows only the goal (no dragon of the day).
States the screens must cover: **egg phase** (no dragon yet, or the newest is grown), **egg ready** (`pendingHatch`), **dragon phase** (`growing(p)`), **grow ready** (`pendingGrowth`), **done** (all 12 found and grown).

- [x] **Engine add-on** (`rewards.ts`, `types.ts`, tests): `Profile.pendingGrowth?: { id, land? }`, set in `endRound` on a growth step (`land` = the land it opened), cleared by `seeGrowth(p)`. While set, the summary and Home lead to the grow screen, like a ready egg. Drop `dragonOfTheDay` (no longer shown anywhere).
- [x] **Shared land reveal** (`Hatch.tsx` → small component): the hello beat's rising cave mouth + "Eine neue Grotte ist offen: …" + gold "Zur Grotte", used by Hatch and Grow. No land left to open → just the gold button.
- [x] **Grow screen** (new `screens/Grow.tsx`, route through `HomeScreen` like Hatch): beat 1 "Funkel ist satt!" with the dragon at its old stage (happy pose), tap or auto after a short wait; beat 2 the old picture scales up to the new stage's size from the same ground line (`STAGE_SCALE`, ease-settle with a small overshoot), then swaps to the new picture, headline "Funkel ist gewachsen!" + the stage name. Grown step: "Funkel ist groß! Er hat ein Ei gefunden." and the next egg (`eggKind`) rolls in beside him. Then the land reveal. Sound: reuse the hatch sfx family (no new ElevenLabs sfx unless it feels flat). Reduced motion: the swap without the scale.
- [x] **Reward** (`Reward.tsx`, `Session.tsx`): `egg` prop becomes `goal`: `{ kind: 'egg', eggKind } | { kind: 'dragon', dragon }`, `filled`, `ready`. Egg phase as today. Dragon phase: the fed dragon in happy pose stands where the egg was (its stage size), meter caption "Noch 40 Kristalle, dann wächst Funkel."; full: "Funkel ist satt!" and gold "Zu Funkel!". Remove the dragon-of-the-day line and the second dragon on the pile. Done state: meter hidden, the newest dragon on the pile.
- [x] **Home** (`app.tsx` HomeScreen, `Home.tsx`, `art.tsx` `OnHoard`): dragon phase → the fed dragon sleeps on the hoard (as today, by stage). Egg phase with dragons → the newest dragon sleeps and the egg lies against it (new `OnHoard` case `{ dragon, egg }`, egg ~0.5 of the egg-only size, in front). Before the first hatch → egg alone (as today). Locked land label: egg phase "Öffnet sich mit dem nächsten Ei", dragon phase "Öffnet sich, wenn Funkel wächst".
- [x] **Collection** (`Collection.tsx`): the fed dragon's meta "Junger Drache · Noch 40 Kristalle"; other dragons only their stage. Egg niche only in egg phase ("Noch 36 Kristalle, dann schlüpft dein Ei."); in dragon phase that niche is a carved slot with "Kommt, wenn Funkel groß ist." Remove `roundsToGrow` / `growsIn`.
- [x] **Strings** (`strings.ts`): add `feedLeft(n, name)`, `fed(name)` "… ist satt!", `toDragon(name)` "Zu …!", `grew(name)`, `grownEgg(name)` "… ist groß! Er hat ein Ei gefunden.", `nextGrow(name)` "Öffnet sich, wenn … wächst", `eggAfter(name)` "Kommt, wenn … groß ist."; remove `growsIn`, `dragonOfDay`. New lines join the open voice-clip task above.
- [x] **Preview routes** (`app.tsx` `SCREENS`, `DEMO`): `DEMO` dragons get `stage` and `goalCrystals`; add `belohnung-drache` (dragon phase, 60/100), `belohnung-satt` (grow ready), `wachsen` (grow screen, young), `wachsen-gross` (grown step + egg); keep the egg ones.
- [x] **DESIGN.md**: Reward and egg (goal meter for egg or dragon), new "Growing" section next to Hatching, Home (fed dragon; dragon + egg), Collection niches (crystals, not rounds), "Which egg" (roster order). Remove the dragon of the day.
- [x] **Check**: `npm run build`, vitest, WebKit walk on the iPad viewport through egg → hatch → feed → grow → grown + egg, and a reload at each ready state.
  Checked 2026-11-05: build + 56 tests; all new preview states shot on iPad portrait/landscape and iPhone; real-app run with a schema-2 profile (migrates to young + 95 goal crystals), a saved growth survives a reload, grow → land reveal → Home with dragon + egg, hints switch.
- [x] PRODUCT.md › Rewards and DESIGN.md updated.
- [x] **Fix: goal filled outside a finished round** (found on the iPad 2026-11-05: 105 crystals, egg not ready). Item crystals save at once, but the step was only taken in `endRound`, so leaving a round early left a full goal with nothing pending. Now `takeStep` (shared with `endRound`) runs when Home opens with a full goal (`stepDue`), so Home goes straight to the hatch or grow screen. Checked: tests + build, real app with the iPad state (105, no dragon) opens the hatch.

## Done when
Playing 5 rounds hatches an egg, unlocks a land, and everything survives an app restart.
Checked 2026-11-04 in WebKit (iPad viewport): 5 rounds where every answer had to be shown hatch the egg; the ready egg and, after naming, the dragon, crystals, name and the opened land survive a reload. Real-device check in Part 8.
