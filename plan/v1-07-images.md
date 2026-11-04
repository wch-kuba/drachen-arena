# Part 7 – Images

**Goal:** all art in one consistent style (AI-generated, plus free library assets where they fit), optimized, bundled for offline use, and built into the screens.

← [Back to plan](../PLAN.md)

## Tasks
- [x] **First, before generating anything:** browse free asset libraries for anything that fits the Drachenhort style (word objects, UI frames, gems, coins, particles, shells, backgrounds, dragons). Generate only the groups no free asset covers; write the verdict per group (use library / restyle / generate) below. Candidates: Kenney.nl (CC0), OpenGameArt (filter CC0/CC-BY), itch.io free assets (check each license), Game-icons.net (CC-BY 3.0). Only take assets that allow commercial use, and only if they match the style prompt (thick dark-teal outlines, flat gouache, world palette); restyle or skip the rest. Record source + license of every asset in `ASSETS.md`.
  - **Hunt result (2026-11-04):** no free library has the thick-outline gouache look.

    | Group | Verdict | Best free candidate | Why not |
    |---|---|---|---|
    | Word objects (~120) | generate | OpenMoji | CC BY-SA 4.0 (share-alike risk), ~60–70% coverage, so it would mix with generated art |
    | Gems, coins, shells, sparkles | generate (gems/coins stay drawn SVG) | Kenney Fish Pack (CC0) | only seaweed/coral, flat, no ink outline |
    | UI frames, plaques | keep our CSS/SVG UI | Kenney UI Pack Adventure (CC0) | generic flat style; DESIGN.md already defines plaques and coin buttons |
    | Land backgrounds, map | generate | none | only pixel-art underwater packs |
    | Dragons, eggs | generate | none | no consistent set with babies, eggs and poses |
- [x] Tool: OpenAI GPT Image via a batch script (`npm run images`, reused in Part 14). Decided 2026-11-04: native transparent PNGs, and reference-image edits keep each dragon the same character across poses and stages.
  - Word pictures: `gpt-image-1-mini`, 3 variants per word, pick one.
  - Dragons (12 × 3 stages × 3 poses = 108), eggs, worlds, icon: `gpt-image-1.5` (or the current best GPT Image model).
  - Budget: under $20 in total. Check the live prices before running; the script prints an estimate first.
- [x] Lock one style prompt from DESIGN.md (same lighting, outline, background, color palette). `scripts/gen-images.ts` reads it from DESIGN.md verbatim; dragons swap "rounded"/"cute, calm" for bold/heroic (DESIGN.md › Dragons).
- [x] Generate 2–3 test images and approve the style before the full run. Approved 2026-11-04: words (Hut/Mütze, Biene/Fliege) as they are; dragons redone twice to look like real, powerful dragons (the child is a boy who loves dragons), reference Perle v3.
- [x] **Word pictures:** one per picturable seed word (~120). 112 words (every Mehrzahl, Lücke and ie item except "vier"), 3 variants each, best one picked. Simple, one object, plain background, no text in the image.
- [ ] Check each word picture: the object must be unmistakable (Hut ≠ Mütze, Biene ≠ Fliege).
- [x] **Dragons:** 10–15 dragons + matching eggs. 12 dragons, each a different dragon type, main color and signature feature (`picture-prompts.ts` › DRAGON_LOOKS); eggs in each dragon's colors.
- [x] **Dragon poses:** per dragon idle, happy (right answer / reward) and sleeping (on the hoard). Same character across poses: generate from one reference image per dragon.
- [x] **Dragon growth:** per dragon 3 stages (hatchling, young, grown), matching the growth rule in Part 6.
- [x] **Hatch animation art:** egg crack frames or shell halves as separate layers, so the hatch can be animated in CSS/SVG. The build cuts each picked egg along an inked zigzag (`cutEgg`), so the halves always fit.
- [x] **Worlds:** 5 land backgrounds + world map.
- [x] **App icon:** 1024 master → 180 apple-touch-icon, 192/512 manifest icons, plus splash.
- [x] Convert to WebP (`cwebp`), sized ~512px for words. Keep the total bundle small (target < 15 MB). Words 400px, dragons 640px, eggs 320px, lands 1600px: `public/img` is 8.3 MB.
- [x] Map image files to item ids in the content. `image` keys come from the word in `seed.ts`; `src/content/image-manifest.json` maps keys to files.

### Put the art into the screens (via `/impeccable`)
- [x] Replace the SVG placeholders: hoard scene, hoard ledge, dragon niches (collection), egg + hatch screen, reward screen, land cards / world map, word pictures in all five exercises.
- [x] Adjust layout, sizes and cropping around the real art on iPhone, iPad portrait and iPad landscape. Checked in WebKit at 390×844, 820×1180 and 1180×820.
- [x] Animate the hero: idle breathing/blink on home, happy pose on right answers and rewards, hatch sequence (respect `prefers-reduced-motion`). Decided 2026-11-04: no dragon on the exercise screens (it took task space and was tiny on the phone); the happy pose shows on the round summary and the hatch greeting.
- [x] Update DESIGN.md "Drawn art and illustration": placeholders gone, poses/growth/animation rules recorded.

### Design review after the art is in
- [ ] `/impeccable critique` of every screen with the real art (separate from the device tests in Part 8).
- [ ] Fix the top findings with `/impeccable polish`.

## Done when
Every seed item that needs a picture has one, every dragon has its poses and growth stages, no SVG placeholder is left in the screens, all images load offline, the style is consistent, and the critique's top findings are fixed.
