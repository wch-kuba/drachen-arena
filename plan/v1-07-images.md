# Part 7 – Images

**Goal:** all art in one consistent style (AI-generated, plus free library assets where they fit), optimized, bundled for offline use, and built into the screens.

← [Back to plan](../PLAN.md)

## Tasks
- [ ] Choose the tool: a cheap image API driven by a batch script (preferred, and reused in Part 14), the Figma image tool, or ChatGPT/Midjourney with the files handed over.
  - Word pictures: OpenAI GPT Image 1 Mini (~$0.005/image) or Flux Schnell on fal.ai/Replicate (~$0.003/image). Make 3 variants per word and pick one.
  - Dragons, eggs, worlds, icon (~40 images): a better model (GPT Image 1.5 / Imagen 4 / Flux 2 Pro, ~$0.04–0.06/image).
  - Budget: under $10 in total, under $20 with dragon poses and growth stages. Check the live prices before running.
- [ ] Browse free game-asset libraries for anything that fits the Drachenhort style (UI frames, gems, coins, particles, shells, background props). Candidates: Kenney.nl (CC0), OpenGameArt (filter CC0/CC-BY), itch.io free assets (check each license), Game-icons.net (CC-BY 3.0). Only take assets that allow commercial use, and only if they match the style prompt (thick dark-teal outlines, flat gouache, world palette); restyle or skip the rest. Record source + license of every asset in `ASSETS.md`.
- [ ] Lock one style prompt from DESIGN.md (same lighting, outline, background, color palette).
- [ ] Generate 2–3 test images and approve the style before the full run.
- [ ] **Word pictures:** one per picturable seed word (~120). Simple, one object, plain background, no text in the image.
- [ ] Check each word picture: the object must be unmistakable (Hut ≠ Mütze, Biene ≠ Fliege).
- [ ] **Dragons:** 10–15 dragons + matching eggs.
- [ ] **Dragon poses:** per dragon idle, happy (right answer / reward) and sleeping (on the hoard). Same character across poses: generate from one reference image per dragon.
- [ ] **Dragon growth:** per dragon 3 stages (hatchling, young, grown), matching the growth rule in Part 6.
- [ ] **Hatch animation art:** egg crack frames or shell halves as separate layers, so the hatch can be animated in CSS/SVG.
- [ ] **Worlds:** 5 land backgrounds + world map.
- [ ] **App icon:** 1024 master → 180 apple-touch-icon, 192/512 manifest icons, plus splash.
- [ ] Convert to WebP (`cwebp`), sized ~512px for words. Keep the total bundle small (target < 15 MB).
- [ ] Map image files to item ids in the content.

### Put the art into the screens (via `/impeccable`)
- [ ] Replace the SVG placeholders: hoard scene, hoard ledge, dragon niches (collection), egg + hatch screen, reward screen, land cards / world map, word pictures in all five exercises.
- [ ] Adjust layout, sizes and cropping around the real art on iPhone, iPad portrait and iPad landscape.
- [ ] Animate the hero: idle breathing/blink on home, happy pose on right answers and rewards, hatch sequence (respect `prefers-reduced-motion`).
- [ ] Update DESIGN.md "Drawn art and illustration": placeholders gone, poses/growth/animation rules recorded.

### Design review after the art is in
- [ ] `/impeccable critique` of every screen with the real art (separate from the device tests in Part 8).
- [ ] Fix the top findings with `/impeccable polish`.

## Done when
Every seed item that needs a picture has one, every dragon has its poses and growth stages, no SVG placeholder is left in the screens, all images load offline, the style is consistent, and the critique's top findings are fixed.
