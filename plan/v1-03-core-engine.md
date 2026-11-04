# Part 3 – Core engine

**Goal:** the shared machinery every exercise uses: data, storage, answer checking, hints, repetition, audio, keyboard.

← [Back to plan](../PLAN.md)

## Tasks

### Data model
- [x] `Item` type, one per question:
  ```ts
  type ExerciseType = 'laute' | 'mehrzahl' | 'luecke' | 'kurzlang' | 'ie';
  interface Item {
    id: string;
    type: ExerciseType;
    prompt: string;        // e.g. "der Hut", "M_tze", "ei"
    answer: string;        // e.g. "Hüte", "ü", "Zwielaut"
    image?: string;        // asset path or emoji
    hint?: string;         // rule hint, e.g. "Denk an den Umlaut!"
    tags?: string[];       // e.g. ["umlaut-plural"]
    source: 'seed' | 'parent';
    active: boolean;
  }
  ```
- [x] `Progress` per item: Leitner box (1–5), last seen, correct/wrong counts, last wrong answer typed.
- [x] `Profile`: child name, crystals, points, eggs, dragons (with names), unlocked worlds.

### Storage
- [x] IndexedDB via `idb-keyval` (Apache-2.0). Keys: `meta`, `items`, `progress`, `profile` in `src/engine/storage.ts`.
- [x] Call `navigator.storage.persist()` on first start.
- [x] Seed items loaded from the bundle on every start; seed updates merge by `id` (keeping the parent's `active` switch) without wiping progress. Part 3 uses dummy items in `src/content/test-items.ts`; Part 5 swaps in the real seed.
- [x] Schema version number plus a migration hook.

### Answer checking
- [x] Trim spaces, normalize Unicode (NFC) so "ü" always matches.
- [x] Exact match → correct.
- [x] Letters right but noun lowercase → **almost right**: "Fast! Nomen schreibt man groß." Child fixes it; reward kept.
- [x] Article typed ("die Hüte") → accept, strip the article.
- [x] Wrong → hint flow.

### Hints (never punish)
- [x] Try 1 wrong → rule hint (item `hint` or type default).
- [x] Try 2 wrong → partial reveal (first letters / the changed vowel highlighted).
- [x] Try 3 wrong → show answer, child types it once, item goes back to box 1.
- [x] Crystals still given for finishing; fewer if hints were used (3 first try, 2 after one wrong try, 1 after more).

### Repetition (Leitner)
- [x] Right on first try → box +1. Wrong → box 1.
- [x] Round of 10 picks: due items first, then box 1–2 items, then new ones.
- [x] Box intervals: 1 = every round, 2 = 1 day, 3 = 3 days, 4 = 7 days, 5 = 14 days.

### Audio
- [x] `speechSynthesis` with a de-DE voice (pick "Anna" if available), slower rate (~0.8).
- [x] Speaker button component (`src/ui/Speak.tsx`), used on every word and instruction. Without a German voice it goes quiet instead of disappearing.
- [ ] Check that a voice exists offline on the iPad and iPhone (device check pending). Quiet fallback is built.

### Custom keyboard
- [x] On-screen QWERTZ, big keys, **Ä Ö Ü ß** row always visible.
- [x] Shift key for capitals (stays visually clear which mode is on).
- [x] Backspace, OK/check key.
- [x] Key press feedback (scale). Tick sound moves to Part 6 with the other sound effects (DESIGN.md › Sound). Hardware keyboard also types (iPad keyboard case).
- [x] No system keyboard ever opens (no real `<input>` focus; render the typed text yourself).

### Session shell
- [x] Round = 10 items → summary screen (crystals won).
- [x] Progress dots at the top; pause/exit without losing earned crystals.

Tests: `npm test` (vitest) covers checking, hints, Leitner, round and storage. The round was also run end to end in WebKit at phone and iPad sizes, including reload.

## Done when
A test round of 10 dummy items runs end to end with typing, hints, audio and saved progress after closing the app.
