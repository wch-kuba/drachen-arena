# Part 6 – Rewards & worlds

**Goal:** the dragon game around the exercises. Progress is clear and fair: no random loot, nothing taken away.

← [Back to plan](../PLAN.md)

## Tasks

### Economy
- [ ] Crystals: 3 = first try, 2 = after a hint, 1 = after the answer was shown.
- [ ] Points: running total shown on home.
- [ ] Egg progress bar: a fixed number of crystals (e.g. 50) → egg is ready.
- [ ] No losing crystals, no streak punishment.

### Eggs & dragons
- [ ] Egg hatching moment (animation + sound).

### Sound effects (decided 2026-11-04, via `/impeccable` when built)
- [ ] Make the effects with ElevenLabs sound effects (`eleven_text_to_sound_v3`, ~10 credits per second) and bundle them as MP3 for offline. Demos in `audio-samples/sfx-*`.
- [ ] Style is a mix: **soft** for frequent sounds (right-answer chime, gem landing on the hoard, key tick), **cartoon** for rare moments (hint bubble "blub", round-end coin cascade with slide whistle, egg wobble and hatch with baby-dragon hiccup, entering a land). Never a harsh sound for a mistake.
- [ ] Mute toggle; ambient loops (grotto, dragon snore) only on Home, quiet, off by default.
- [ ] Update DESIGN.md › Sound.
- [ ] Child types a name for the new dragon (custom keyboard, capital first letter hint).
- [ ] Dragon collection screen: hatched dragons with names, next eggs as silhouettes.
- [ ] ~10–15 dragons in v1 (from the kid's favorites).
- [ ] Dragon growth: a hatched dragon grows hatchling → young → grown as the child keeps playing (rule to decide, e.g. crystals earned after hatching). Never shrinks. Art from Part 7.

### Worlds
- [ ] 5 lands, one per exercise, on a world map / home screen.
- [ ] Land 1 open at the start; the next one unlocks after N finished rounds or a set number of crystals.
- [ ] Each land has its own dragon to find.

### Feedback & greeting
- [ ] Greeting with the child's name ("Hallo, [Name]!"). The name is set on first start in v1; it moves to parent mode in v2.
- [ ] A list of short German praise lines ("Super!", "Stark gemacht!", "Du bist ein Drachenprofi!"), rotating.
- [ ] Gentle wrong-answer lines ("Fast! Versuch es noch einmal.").
- [ ] Round summary: crystals, egg progress, dragon of the day.

## Done when
Playing 5 rounds hatches an egg, unlocks a land, and everything survives an app restart.
