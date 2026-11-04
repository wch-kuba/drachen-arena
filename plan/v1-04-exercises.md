# Part 4 – Five exercises

**Goal:** all five exercise screens on top of the core engine. Each one mirrors the school test format.

← [Back to plan](../PLAN.md)

## Shared
- [x] One round frame (`src/screens/Exercise.tsx`): gem track, hoard ledge and the flying gem stay for the round; each item mounts its own view, so modes can mix in one round.
- [x] Word helpers (`src/engine/words.ts`): Laut classes and sentence coloring, target vowel, gap words, umlaut change, plural mistake kinds. Tested in `words.test.ts`.
- [x] All five lands open from Home (`#/laute`, `#/mehrzahl`, `#/luecke`, `#/kurzlang`, `#/ie`). Every land stays open until Part 6 adds unlocking by progress.
- [x] Every hint pane has a speaker button.
- [x] Test items: 12 Mehrzahl, 8 Laute (one sound) + 3 sentences, 8 Lücke, 8 Kurz/lang, 6 ie (`src/content/test-items.ts`).
- [x] Voice clips for the last 9 texts. Gemini Tier 1 allows 100 requests per model per day (hit on 2026-11-04), so they were made with `gemini-3.8-flash-lite-tts` (same voice, Sulafat; parent OK with a slightly different sound): `MODEL=gemini-3.8-flash-lite-tts npm run audio -- --fill`. A later plain `npm run audio` remakes them with the main model.

## 1. Selbstlaute, Zwielaute, Umlaute (choice)
- [x] **Mode A:** show one letter or group (a, ei, ü, au, äu…) + audio → 3 big buttons: Selbstlaut (gelb) / Zwielaut (grün) / Umlaut (blau). The letters of each class show on the buttons only after a wrong try (rule hint); a right answer paints the tile in its legend color.
- [x] **Mode B (school-test style):** a short sentence; child taps a letter or group and gives it a color. Tapping "ei" selects both letters as one group. Tapping a painted letter picks it up again.
- [x] Mode B check (decided 2026-11-04): right colors stay, wrong ones are wiped. Try 1 → soft coral rings on the letters still to do. Try 2 → the rings show the color to use. Try 3 → the right colors are filled in and the child taps Fertig.
- [x] Mix modes A and B in a round. An item is mode B when its answer is a coloring (`lauteCode(sentence)`), not a class name.

## 2. Einzahl und Mehrzahl (typing)
- [x] Show the picture, "ein Hut" → "viele ___". (Picture ×2 waits for the real art in Part 7.)
- [x] Child types the plural on the custom keyboard.
- [x] Umlaut-plural hint: "Aus **u** wird **ü**." with the vowel highlighted in the hint and in the word. Made from the singular and plural, so items need no own hint.
- [x] Track the type of mistake for v2 stats: `Progress.mistakes` counts `umlaut` (Hute), `ending` (Hüten) and `both` (Hauten).

## 3. Fehlende Buchstaben (typing)
- [x] Word with a gap: "M _ tze" + picture + audio. The given letters stand on the rock, the gap is built in cells.
- [x] Gap = one vowel/umlaut or a group (ie, ei, au, eu, äu). Gap size shown (one cell per missing letter); a group gap asks "Welche Buchstaben fehlen?".
- [x] Child types only the missing letters; the full word is shown when correct. Hint 2: a group gap reveals its first letter, a one-letter gap reads the word again.

## 4. Kurze und lange Selbstlaute (choice)
- [x] Word shown + audio played automatically (the speaker replays it).
- [x] Target vowel highlighted (first vowel, ie or doubled vowel; `Item.at` overrides it).
- [x] Two buttons: **•** kurz / **–** lang (dot = short, line = long).
- [x] After answering, the mark appears under the vowel in the word.

## 5. Wörter mit ie (typing)
- [x] Picture only (+ optional audio after try 1 as a hint). Until Part 7 brings the pictures (decided 2026-11-04): a word without a picture is read aloud on open and a big speaker button replaces the picture.
- [x] Child types the whole word.
- [x] Hint flow: rule "Langes i schreibt man ie. Kurzes i schreibt man i." (changed in Part 5 for the short-i words; + speaker for the word) → first letter → answer.

Checked in WebKit at iPhone (390×844), iPad portrait (820×1180) and iPad landscape (1180×820): every exercise with a wrong try, hints and a right answer.
- [x] Checked on the real devices (parent, 2026-11-04, Safari, local preview): iPad portrait and landscape and iPhone, all five lands, keyboard, hints and voice. Found and fixed: a letter with a ring could not be seen as selected.

## Done when
Each exercise works with 5+ test items on the iPad (both orientations) and the iPhone, with the keyboard, hints and audio.
