# Part 7 – Images

**Goal:** all art made with AI in one consistent style, optimized and bundled for offline use.

← [Back to plan](../PLAN.md)

## Tasks
- [ ] Choose the tool: a cheap image API driven by a batch script (preferred, and reused in Part 14), the Figma image tool, or ChatGPT/Midjourney with the files handed over.
  - Word pictures: OpenAI GPT Image 1 Mini (~$0.005/image) or Flux Schnell on fal.ai/Replicate (~$0.003/image). Make 3 variants per word and pick one.
  - Dragons, eggs, worlds, icon (~40 images): a better model (GPT Image 1.5 / Imagen 4 / Flux 2 Pro, ~$0.04–0.06/image).
  - Budget: under $10 in total. Check the live prices before running.
- [ ] Lock one style prompt from DESIGN.md (same lighting, outline, background, color palette).
- [ ] Generate 2–3 test images and approve the style before the full run.
- [ ] **Word pictures:** one per picturable seed word (~120). Simple, one object, plain background, no text in the image.
- [ ] Check each word picture: the object must be unmistakable (Hut ≠ Mütze, Biene ≠ Fliege).
- [ ] **Dragons:** 10–15 dragons + matching eggs.
- [ ] **Worlds:** 5 land backgrounds + world map.
- [ ] **App icon:** 1024 master → 180 apple-touch-icon, 192/512 manifest icons, plus splash.
- [ ] Convert to WebP (`cwebp`), sized ~512px for words. Keep the total bundle small (target < 15 MB).
- [ ] Map image files to item ids in the content.

## Done when
Every seed item that needs a picture has one, all images load offline, and the style is consistent.
