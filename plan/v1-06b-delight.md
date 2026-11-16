# Part 6b – Living dragons

**Goal:** make the rewards the child already earns feel more alive, without changing a single rule. Same crystals (3 / 2 / 1, +10 per round), same one goal, same lands. No new currency, no shop, no streaks, no timers, no random loot. Pure animation, sound and things to look at.

← [Back to plan](../PLAN.md)

Chosen 2026-11-16 with the user from a list of reward ideas. Parked for later: hoard treasures at crystal milestones, glowing grottos (Leitner progress per land), badges, welcome-back greeting, Urkunde per land, finale when all 12 are grown. Rejected: streaks / daily bonus (loss pressure), shop (spends crystals), random loot, timed challenges, dragon on the exercise screens (decided against in Part 7).

All screen work goes through `/impeccable`. Dragons stay cool, not cute (DESIGN.md › Dragons). Built 2026-11-16 on `feat/living-dragons`; what each piece looks like is in DESIGN.md (Dragon cards, Almost there, Perfect round, Drachenflug).

## Open: needs the parent

- [x] **Top up the OpenAI account.** Generation stopped on 2026-11-16 after 6 flying poses ("no credits remaining"); the parent added credits the same day and the rest was made.
- [ ] **Read the German card texts** in `src/content/dragons.ts` (12 dragons × kind, power, home) and the new lines in `src/strings.ts` (Part 6b block). Written by us; a German reader should check them. Changed texts need `npm run audio` again.
- [ ] **Try it on the real iPad:** the flight at 60 fps, the finger never hiding the dragon, the card turn, the music level in the flight. (iPhone over Wi-Fi, 2026-11-16: parent played the grow → take-off → flight → egg flow, the replay and the cards: "all looks good". iPad and the installed, offline app still open.)

## Tasks

### Living dragon on Home
- [x] Tap the sleeping dragon on the hoard: it wakes, hops into its happy pose with bubbles, roars on every third tap, sleeps again; smaller dragons sound higher; a lone egg rocks with its knock; reduced motion keeps poses and sound. Already built on 2026-11-05 as plan/v1-07-images.md › "Tap the dragon on Home" (PR #22), before this part was written. One snort and one roar, pitched by stage, instead of three separate sounds.

### Egg and dragon show how close the goal is
- [x] Egg on Home, Collection and the round summary gets visible stages by goal fill: one crack at 50 %, more at 75 %, the dragon's light through the cracks and a twitch every few seconds at 90 %. Same 100 crystals. (`fillLevel` in rewards.ts, `EggCracks` in art.tsx.)
- [x] The fed dragon glows gold from below from 90 % (Home and the round summary).
- [x] Crack overlays: drawn SVG over the egg picture, inked like the hatch's cut line. Nothing generated.

### Perfect-round show
- [x] A round (5 items or more) with every item right on the first try gets a bigger summary: coins and gems rain past the screen, the goal on the pile does a loop (a dragon roars as it lands), and the line "Alles beim ersten Mal! Wie ein echter Drachenmeister!" **Same crystals as any other round.**
- [x] Voice clip for the new line (`npm run audio`, Knurps, 3 tones); it is read once the coin cascade has played.
- [x] Reduced motion: the line and the cheer, no rain and no loop (animations collapse).

### Drachenkarten (dragon trading cards)
- [x] Tap a dragon in the Collection: its card is held up over the niches. Front: picture at its stage, name (child's), stage. Back: kind, power, home, size by stage. A tap turns it. (Shaped while building: a card over the niches instead of a flip inside the niche, because a niche is too small for the text.)
- [x] Card text per dragon kind written by us in `src/content/dragons.ts` (`card`); labels and sizes in `strings.ts`.
- [x] Speaker button reads the card (kind, power, where it lives: name-free, clips made at build time).
- [x] **Lieblingswort:** the first word that reaches Leitner box 3 (right on the first try twice in a row) while this dragon is being fed, stored on the `Dragon` record (`word`, optional, no schema change). Mehrzahl, Lücke and ie words only. Display only; a test checks that crystals, goal and lands stay untouched. Box 3, not 5: box 5 takes weeks, most dragons would never get a word.
- [x] Eggs still to find stay dashed shapes (no card, no spoilers).

### Drachenflug: ride the grown dragon (added 2026-11-16, the big moment of this part)
When a dragon becomes grown, the next egg no longer just rolls in: the child flies the dragon through the sea grotto to find it. Same step, same cost, same egg; only the reveal changes.
- [x] **Flight screen** (`screens/Flight.tsx`, routed from the Grow screen's grown step: "Funkel ist gewachsen!" → gold "Losfliegen!" → flight → "Funkel hat ein Ei gefunden!" → back on the hoard with the egg and the grotto that opened). The dragon follows the finger (leans, rides its wing beat) past layers moving at their own depth into the end of the grotto, where the egg glows on a ledge; it lands beside it. 24 s plus the landing.
- [x] **No fail, no score:** soft limits keep the dragon out of roof and floor, no timer, no crystals in flight. Lifting the finger lets the dragon glide on by itself, so the flight always ends at the egg. Jellyfish light up as the dragon passes and bubbles trail behind it: looks only.
- [x] **Home teaser** while the fed dragon is young and an egg is left to find: "Noch 40 Kristalle, dann fliegt Funkel los!" (`T.fliesOff`).
- [x] **Replay from the card** (decided 2026-11-16): every grown dragon's card has a "Fliegen!" button that plays the flight again (empty nest at the end, a close button on the way, nothing earned). Watch in the first sessions whether it pulls the child away from the rounds; if so, move the button behind the parent settings in v2.
- [x] **Art** (`npm run images`, groups `fly` and `flight`, recorded in ASSETS.md): 12 flying poses (grown stage, side view, from each dragon's reference image; also the first frame for the wing-flap clips below) + 8 scenery pieces (stalactites, rocks, pillar, kelp, wreck, jellyfish, fish, the ledge with its nest; 2 variants each, one picked). About $1.35, 0.5 MB in the bundle (`public/img` 9.7 MB). Eight poses came out looking left and are mirrored by the build (`FLY_FACES_LEFT`). A test checks that all 20 pictures exist.
  - [x] Egg seated in the painted nest, the ledge (an alcove) given a rock foot, the fish moved out of the landing. The drawn stand-ins stay as the fallback for a missing picture.
  - [ ] Parent looks at the 12 flying dragons and the scenery (`npm run images -- sheet`, or play `#/flug-wieder`) and says which to redo.
- [x] **Generated video, for motion only** (decided 2026-11-16; the flight itself stays steerable, a full video flight was rejected: no steering, ~40–60 MB offline, style drift).
  - [x] Pick the video tool: **Gemini Omni Flash** (`gemini-omni-1.2-flash`) through the Gemini API key already in `.env.local` (2026-11-16). Veo was shut down on the Gemini API on 2026-10-22. Paid tier only, about $0.07 per second at 720p (a 3 s clip came to $0.21); it takes a first and a last frame, which makes the loop. Outputs carry an invisible SynthID watermark. **Commercial use: not confirmed.** The docs pages read on 2026-11-16 state no usage rights for generated video; read the Gemini API terms before any commercial release (recorded in ASSETS.md).
  - [x] **Test with one dragon (Perle) before the full run:** the flying pose on flat magenta as first and last frame of a 3 s clip. Result 2026-11-16: same character, outline kept, background stayed flat, two full wing beats, ends on its first pose, keys out cleanly. Built into the flight (`#/flug-wieder`).
  - [x] Parent looked at Perle flying and approved the other 11 clips (2026-11-16: "looks good", could be smoother; hence 24 frames instead of 12, below).
  - [x] **Wing-flap sprites:** `npm run flap` (`scripts/gen-flap.ts`): `gen` makes the clips, `build` cuts one wing beat out of each (the frame most like the first closes the loop), removes the key color and writes a sheet of up to 24 frames (every frame of a one-second beat, in two rows of 12, 340 px each, so it stays under the 4096 px texture limit) to `public/img/flap/` plus `src/content/flap-manifest.json`. The app plays the sheet in steps, row by row (`FlyPic`); a dragon without a sheet keeps its still flying pose riding a CSS wing beat. **All 12 made** ($2.52 for the clips): winged dragons flap, the wingless ones (turtle, long dragon, drake, sea serpent) swim; beats run 0.7 to 2.2 s. 2.5 MB together; a test checks all twelve exist. First built with 12 frames per beat, which looked steppy.
  - [x] **Shared take-off clip:** a 4 s first-person dive from the painted grotto wall into a crystal tunnel, no dragon in frame, made in both postures (`npm run flap -- dive`, $0.56; `public/video/dive-landscape.mp4` and `dive-portrait.mp4`, H.264, no sound track, 1.2 and 1.1 MB). Plays muted and inline after the tap on "Losfliegen!", then cuts to the steerable flight. **Only before the first flight to an egg; a replay from the card starts in the air** (decided while building: the replay is the toy, the take-off is the event). Anything that goes wrong (no file, play refused, 9 s without an end) skips to the flight.
  - [x] **Offline video on iOS:** `mp4` added to the precache; the clip is fetched whole and played from a blob, so Safari's byte-range requests never reach the service worker. Reduced motion: no clip. Two WebKit traps met on the way: a clip at opacity 0 is refused (a dark veil lifts off it instead), and a clip started right at page load is refused (never the case in the game: it follows a tap).
  - [ ] Check in the installed PWA on the iPad in airplane mode that the clip plays.
  - [x] Size: `public/img` 12.2 MB (target < 15 MB) + `public/video` 2.3 MB; the whole precache is 26.8 MB (it was 19.9 MB before this part; voice clips are 13 MB of it).
- [x] **Sound:** the dragon music at full level for the whole flight, **also when the Musik switch is off** (decided while building: it is the one film moment; Töne off still silences it; `musicHere` in sfx.ts). Take-off sound `wings` (`npm run sfx`, 26 credits); jellyfish reuse the gem clink, rising; landing reuses the land whoosh and the roar.
- [x] **Reduced motion:** no flight; the scene opens on its end (the dragon standing by the egg) with the gold button. (One still instead of the planned three: the end is the part that matters.)
- [x] Preview routes: `#/flug` (first flight with egg), `#/flug-wieder` (replay), plus `#/karte`, `#/belohnung-perfekt`, `#/belohnung-ei-90`, `#/grotte-ei-90`.

### Check
- [x] `npm run build`, vitest (66 tests, 4 new), WebKit walk on iPad portrait/landscape and iPhone: egg cracks on Home and summary, perfect and normal round summary, card front, turn and back, collection, Home teaser, the flight (start, steering, jellyfish, landing, replay, reduced motion), and the whole grow → fly → egg → grotto flow. Found and fixed on the way: the card showed its back first in WebKit, the loop flew over the headline, the dragon was drawn too small, the landing sat under the gold button, the egg on the grow screen had moved.
- [ ] Real iPad: see "Open: needs the parent".
- [x] DESIGN.md updated (cards, almost there, perfect round, Drachenflug, sound, the egg's twitch). PRODUCT.md › Rewards notes that these add no rules.
- [ ] `/impeccable critique` of the flight, now that the painted scenery is in.

## Done when
Tapping the dragon on Home gets a reaction that fits its size, the egg visibly gets closer to hatching, a perfect round feels special without paying more, every hatched dragon has a card the child can flip and hear, and a grown dragon carries the child to the next egg in a grotto made of painted art. No reward rule changed (the existing rewards tests are unchanged and green).
