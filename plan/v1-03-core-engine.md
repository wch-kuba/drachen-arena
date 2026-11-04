# Part 3 – Core engine

**Goal:** the shared machinery every exercise uses: data, storage, answer checking, hints, repetition, audio, keyboard.

← [Back to plan](../PLAN.md)

## Tasks

### Data model
- [ ] `Item` type, one per question:
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
- [ ] `Progress` per item: Leitner box (1–5), last seen, correct/wrong counts, last wrong answer typed.
- [ ] `Profile`: child name, crystals, points, eggs, dragons (with names), unlocked worlds.

### Storage
- [ ] IndexedDB via `idb-keyval` or `idb` (small).
- [ ] Call `navigator.storage.persist()` on first start.
- [ ] Seed items loaded from bundled JSON on first run; seed updates merge by `id` without wiping progress.
- [ ] Schema version number plus a migration hook.

### Answer checking
- [ ] Trim spaces, normalize Unicode (NFC) so "ü" always matches.
- [ ] Exact match → correct.
- [ ] Letters right but noun lowercase → **almost right**: "Fast! Nomen schreibt man groß." Child fixes it; reward kept.
- [ ] Article typed ("die Hüte") → accept, strip the article.
- [ ] Wrong → hint flow.

### Hints (never punish)
- [ ] Try 1 wrong → rule hint (item `hint` or type default).
- [ ] Try 2 wrong → partial reveal (first letters / the changed vowel highlighted).
- [ ] Try 3 wrong → show answer, child types it once, item goes back to box 1.
- [ ] Crystals still given for finishing; fewer if hints were used.

### Repetition (Leitner)
- [ ] Right on first try → box +1. Wrong → box 1.
- [ ] Round of 10 picks: due items first, then box 1–2 items, then new ones.
- [ ] Box intervals: 1 = every round, 2 = 1 day, 3 = 3 days, 4 = 7 days, 5 = 14 days.

### Audio
- [ ] `speechSynthesis` with a de-DE voice (pick "Anna" if available), slower rate (~0.8).
- [ ] Speaker button component, used on every word and instruction.
- [ ] Check that a voice exists offline on the iPad and iPhone; show a quiet fallback if not.

### Custom keyboard
- [ ] On-screen QWERTZ, big keys, **Ä Ö Ü ß** row always visible.
- [ ] Shift key for capitals (stays visually clear which mode is on).
- [ ] Backspace, OK/check key.
- [ ] Key press feedback (scale + optional tick sound).
- [ ] No system keyboard ever opens (no real `<input>` focus; render the typed text yourself).

### Session shell
- [ ] Round = 10 items → summary screen (crystals won).
- [ ] Progress dots at the top; pause/exit without losing earned crystals.

## Done when
A test round of 10 dummy items runs end to end with typing, hints, audio and saved progress after closing the app.
