# Part 15 – Two plural grottos

**Goal:** two more lands aimed at the child's biggest test gap (plurals 0/4: he adds -en and misses the vowel change). Shaped with `/impeccable shape` and confirmed by the user 2026-11-16.

← [Back to plan](../PLAN.md)

## Why these two

Picked from typical Klasse 2 worksheet formats (research 2026-11-16) for the most benefit to the child:
- **Austernbank** trains the one decision he misses: does the vowel get two dots (a→ä, o→ö, u→ü, au→äu) or stay? Then he types the plural, as on the test.
- **Strudel** goes the other way, plural → singular ("Wände kommt von Wand"), the school strategy for spelling ä/äu. Same link from the other side.

Not picked: ie rhyme pairs (the i/ie land covers it), short/long sorting columns (overlaps the blocked Echo-Grotte).

## Tasks

### Engine and content
- [x] `ExerciseType` + `LANDS`: `umlaut` (Austernbank, "a, o, u oder ä, ö, ü?") and `einzahl` (Strudel, "Von vielen zu einem"), listed after Perlenriff.
- [x] Unlock order: Mehrzahl → Austernbank → Strudel → Fehlende Buchstaben → i oder ie? → Laute → Kurz oder lang. On the child's iPad the next two growth steps open the new lands.
- [x] Two new dragons, `auster` and `strudel`, the land dragons of the new lands, placed after `perle` in the roster (14 dragons). Cool, not cute.
- [x] Attempt: `miss()` counts a wrong decision (pearl step) as a wrong try without raising the typing hint; crystals stay per word (3 only if both steps were right first time).
- [x] Seed: ~24 Austernbank words (≈ 2/3 umlaut plurals, ≈ 1/3 no change, only a/o/u/au vowels, no ä/ö/ü traps), ~22 Strudel words (mostly umlaut plurals, a few plain). Our own picks, reusing Mehrzahl nouns.

### Screens (via `/impeccable`)
- [x] **Austernbank step 1, pearls:** the singular's vowel stands as a tile in the word; two options: the vowel with its two dots drawn as pearls ("Zwei Punkte") and the plain vowel ("Bleibt so"). The pearls arc onto the vowel with weight and it turns into ä/ö/ü/äu in gold; "Bleibt so" rings the vowel gold. Wrong: nudge + hint, and the other (right) option gets the gold ring at once (two options).
- [x] **Austernbank step 2:** the existing typed plural (cells + keyboard); the plaque keeps the decision in sight as "u → ü".
- [x] **Strudel:** plural + picture on the plaque, a current pulls the word in when the task opens (reduced motion: none); the article stands before the cells, the child types only the singular. After a right umlaut answer: "Wände mit ä, weil es von Wand kommt." with the changed letter gold in both words.
- [x] Home lands path drawn for any number of lands.
- [x] Routes `#/umlaut` and `#/einzahl` (the real lands; the preview list has them).

### Art and sound
- [x] Prompts: two cave mouths, two land backgrounds, two dragon looks, plural pictures for Strudel ("viele …").
- [x] Generate, review, pick and build the art (`npm run images`). Ask the user before spending.
- [x] Voice clips for every new spoken line and word (`npm run audio`). Ask the user before spending.

### Docs and check
- [x] PRODUCT.md (seven exercise types, unlock order, roster), DESIGN.md (pearl step, Strudel line).
- [x] Check: `npm run build`, vitest (67), WebKit walk at iPad portrait (820×1180) and iPhone (390×844) through both lands (wrong pearl choice → hint, pearl flight, typing step; Strudel open, wrong try → hint), Home path on the mouths; growth steps opening Austernbank and Strudel covered by rewards.test.ts.
- [ ] On the iPad: the child plays both lands (after merge and the update prompt).

Notes (2026-11-16): seed has 28 Austernbank and 23 Strudel items (243 total). Art: dragons auster v3, strudel v3; caves umlaut v2, einzahl v2; lands umlaut v1, einzahl v2; "viele" pictures for Wände, Hände, Züge re-made with own prompts (one thing came out as one). ~$2.70 of images, 1354 ElevenLabs credits.

## Done when

Both lands are playable offline on the iPad with art and voice, the child's next growth step opens Austernbank, and a wrong pearl choice gets a hint, never a penalty.
