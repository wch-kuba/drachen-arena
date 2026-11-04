# Part 6 – Rewards & worlds

**Goal:** the dragon game around the exercises. Progress is clear and fair: no random loot, nothing taken away.

← [Back to plan](../PLAN.md)

## Tasks

Rules decided 2026-11-04 (with the user): 100 crystals per egg plus +10 per finished round (3–5 rounds per egg), Mehrzahl open first and one more land per hatch, growth by rounds since hatching (10 → young, 25 → grown). Details in PRODUCT.md › Rewards. Engine: `src/engine/rewards.ts`, roster: `src/content/dragons.ts`.

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
  Rule: young after 10 finished rounds since hatching, grown after 25 ("Wächst in 7 Runden" in the collection).

### Sound effects (decided 2026-11-04, via `/impeccable` when built)
- [x] Make the effects with ElevenLabs sound effects (`eleven_text_to_sound_v3`, ~10 credits per second) and bundle them as MP3 for offline. Demos in `audio-samples/sfx-*`. → `npm run sfx` (`scripts/gen-sfx.ts`), 10 files in `public/sfx/`, ~310 credits, 380 KB.
- [x] Style is a mix: **soft** for frequent sounds (right-answer chime, gem landing on the hoard, key tick), **cartoon** for rare moments (hint bubble "blub", round-end coin cascade with slide whistle, egg wobble and hatch with baby-dragon hiccup, entering a land). Never a harsh sound for a mistake.
- [x] Mute toggle; ambient loops (grotto, dragon snore) only on Home, quiet, off by default. Both switches on Home, saved in the profile.
- [x] Update DESIGN.md › Sound.

### Worlds
- [x] 5 lands, one per exercise, on a world map / home screen.
- [x] Land 1 open at the start; the next one unlocks after N finished rounds or a set number of crystals. → Mehrzahl open at start; each hatch opens the next (Lücke → i/ie → Laute → Kurz/lang). Lands already played before this update stay open (storage schema 2).
- [x] Each land has its own dragon to find: a land's egg first hatches that land's dragon, then the rest of the roster in order.

### Feedback & greeting
- [x] Greeting with the child's name ("Hallo, [Name]!"). The name is set on first start in v1; it moves to parent mode in v2.
- [x] A list of short German praise lines ("Super!", "Stark gemacht!", "Du bist ein Drachenprofi!"), rotating.
- [x] Gentle wrong-answer lines, leading the first hint ("Noch nicht ganz.", "Gleich hast du es!").
- [x] Round summary: crystals, egg progress, dragon of the day.
- [ ] Voice clips for the new texts (praise, gentle lines, name questions): next `npm run audio` run (Part 5 quota). Until then the device voice reads them.

## Done when
Playing 5 rounds hatches an egg, unlocks a land, and everything survives an app restart.
Checked 2026-11-04 in WebKit (iPad viewport): 5 rounds where every answer had to be shown hatch the egg; the ready egg and, after naming, the dragon, crystals, name and the opened land survive a reload. Real-device check in Part 8.
