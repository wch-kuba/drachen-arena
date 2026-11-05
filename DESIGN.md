---
name: Drachen-Arena
description: Offline German spelling game for one Klasse 2 child, set in a dragon's treasure grotto under the sea.
colors:
  rock-0: "#041c22"
  rock-1: "#072830"
  rock-2: "#0b3540"
  rock-3: "#10444f"
  rock-4: "#165562"
  hoard-band: "#5c4a24"
  tq-700: "#0c7a76"
  tq-500: "#17a39c"
  tq-300: "#3fd3c6"
  tq-100: "#b4f0e7"
  gold-800: "#8a5414"
  gold-600: "#c98426"
  gold-500: "#e2a23c"
  gold-300: "#f7c86e"
  gold-100: "#ffe7b5"
  glass: "#e6f6f2"
  glass-dim: "#c7e6df"
  ink: "#05262c"
  ink-soft: "#2a5058"
  foam: "#eafbf7"
  foam-soft: "#a6d3cc"
  coral: "#ff8a6b"
  coral-100: "#ffe1d6"
  legend-gelb: "#ffe03a"
  legend-gruen: "#3dbb5a"
  legend-blau: "#2f7de1"
  legend-blau-text: "#ffffff"
typography:
  root:
    fontFamily: "Andika, system-ui, sans-serif"
    fontSize: "clamp(20px, 15px + 1vw, 28px)"
    fontWeight: 400
    lineHeight: 1.35
  display:
    fontFamily: "Andika, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 700
    lineHeight: 1.1
  answer:
    fontFamily: "Andika, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: "Andika, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
  button:
    fontFamily: "Andika, system-ui, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 700
  title:
    fontFamily: "Andika, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
  prompt:
    fontFamily: "Andika, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
  body:
    fontFamily: "Andika, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.35
rounded:
  letter: "8px"
  key: "10px"
  cell: "14px"
  tile: "18px"
  plaque: "22px"
  pill: "999px"
spacing:
  xs: "0.35rem"
  sm: "0.6rem"
  md: "0.9rem"
  lg: "1.25rem"
  xl: "1.5rem"
  tap: "2.9rem"
components:
  button-gold:
    backgroundColor: "{colors.gold-500}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "3.4rem"
    width: "100%"
  button-gold-disabled:
    backgroundColor: "{colors.glass-dim}"
    textColor: "{colors.ink-soft}"
  button-round:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "{spacing.tap}"
  plaque:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plaque}"
  feedback-right:
    backgroundColor: "{colors.gold-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plaque}"
    padding: "0.75rem 0.9rem"
  feedback-almost:
    backgroundColor: "{colors.coral-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plaque}"
    padding: "0.75rem 0.9rem"
  cell-empty:
    backgroundColor: "{colors.rock-3}"
    textColor: "{colors.foam}"
    typography: "{typography.answer}"
    rounded: "{rounded.cell}"
    width: "2.6rem"
    height: "3.35rem"
  cell-filled:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
  cell-right:
    backgroundColor: "{colors.gold-300}"
    textColor: "{colors.ink}"
  cell-flag:
    backgroundColor: "{colors.coral-100}"
    textColor: "{colors.ink}"
  cell-reveal:
    backgroundColor: "{colors.rock-3}"
    textColor: "{colors.gold-300}"
  key:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.key}"
    height: "2.5rem"
  key-umlaut:
    backgroundColor: "{colors.tq-100}"
    textColor: "{colors.ink}"
  legend-gelb:
    backgroundColor: "{colors.legend-gelb}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
  legend-gruen:
    backgroundColor: "{colors.legend-gruen}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
  legend-blau:
    backgroundColor: "{colors.legend-blau}"
    textColor: "{colors.legend-blau-text}"
    rounded: "{rounded.tile}"
  mark-button:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plaque}"
    padding: "0.75rem"
    height: "5.4rem"
  niche:
    backgroundColor: "{colors.rock-3}"
    rounded: "999px 999px 18px 18px"
---

# Design System: Drachen-Arena

## Overview

**Creative North Star: "Drachenhort"**

The child's own dragon sleeps on a treasure hoard in a turquoise sea grotto. Every crystal the child earns lands on that hoard, so the pile visibly grows: learning is feeding the hoard. The whole app is that one place. Home is the hoard chamber, each exercise is a side chamber of the grotto, and the reward screen drops the round's crystals onto the pile. The world rejects the usual learning-app default of a mascot above a zigzag of round level bubbles and a chunky green button.

The look is a picture book, not an interface. Every screen stands in a painted grotto: dark sea-teal rock under a stalactite roof, darkest at the top, with the hoard's warm gold light rising from below. The only bright materials are amber gold coins and faceted turquoise gems. Anything the child reads or answers on sits on pale sea-glass plaques with dark-teal ink. Every drawn thing has a thick dark-teal outline. Density is low and everything is large: one task per screen, huge letters, thumb-sized targets. The type scales with the device.

The five lands, one per exercise, are grotto chambers strung along one dotted gold path below the hoard:

| Land | Exercise | Mouth color |
|---|---|---|
| Kristallhöhle | Selbstlaute, Zwielaute, Umlaute | tq-300 |
| Perlenriff | Einzahl und Mehrzahl | gold-300 |
| Schiffswrack | Fehlende Buchstaben | tq-500 |
| Echo-Grotte | Kurz oder lang? | gold-500 |
| Tiefsee-Garten | i oder ie? | tq-100 |

**Key Characteristics:**
- One world: a dragon's hoard in a sea grotto. The hoard grows with every correct answer.
- A painted grotto wall behind every screen: dark at the top, warm hoard light from below.
- Gold and turquoise gems are the only bright materials. Gems have facets and never look like glossy blobs.
- A 4px dark-teal outline on every plaque, button, cell and drawing.
- Andika everywhere, scaled per device, at a size an early reader can manage.
- Mistakes are coral and warm, never red.
- The school's gelb, grün and blau exist only as the vowel legend.

## Colors

The palette is cold, dark sea-teal rock lit by warm gold from below, with pale sea-glass for reading and one warm coral for mistakes.

### Primary
- **Hoard Gold** (gold-500): the coin body, the hoard mound, and the main fill of the gold button. Amber-leaning on purpose, so it never reads as the school's gelb.
- **Coin Highlight** (gold-300): the cells after a right answer, the cursor cell's dashed border, the focus ring, the dotted path between lands, reward headlines, and emphasized numbers in captions ("128 Kristallen").
- **Coin Shine / Coin Rim** (gold-100 / gold-600 / gold-800): the inner light and raised rim of the gold button, the background of the "right" feedback pane, and the coin's engraved ring.

### Secondary
- **Scale Turquoise** (tq-500), **Bright Gem** (tq-300), **Deep Facet** (tq-700), **Gem Mist** (tq-100): dragon scales, cut gems, land mouths, the marked vowel in Kurz oder lang (tq-700), umlaut keys and the letter-selection highlight (tq-100 with a tq-500 ring).

### Tertiary
- **Warm Coral** (coral) and **Coral Mist** (coral-100): the only feedback color for "almost" and "wrong". Used for the flagged cell's ring and fill, the hint pane, and the dragon's cheek. It is warm and safe.

### Neutral
- **Grotto Rock** (rock-0 to rock-4): a stepped tonal ramp. rock-0 is the preview nav. rock-1 is the page base under the painted grotto wall (and shows while it loads). rock-2 is the lands pane and the empty niches. rock-3 is empty cells and filled niches. rock-4 is dashed slot borders. The painted wall was generated with this ramp as its only palette.
- **Hoard Glow Band** (hoard-band): rock warmed by the gold. Part of the painted wall's palette, where its lowest rocks catch the hoard light.
- **Sea-Glass** (glass) and **Clouded Glass** (glass-dim): plaque, key and round-button surfaces. glass-dim is the disabled gold button.
- **Deep-Teal Ink** (ink) and **Soft Ink** (ink-soft): all outlines and all text on glass. ink-soft is for secondary words on a plaque ("ein", "– viele …").
- **Foam** (foam) and **Soft Foam** (foam-soft): text directly on rock (greetings, land names, captions) and the borders of empty cells. foam-soft is for secondary text and locked lands.

### Reserved: the school legend
- **Gelb** (legend-gelb) = Selbstlaut, **Grün** (legend-gruen) = Zwielaut, **Blau** (legend-blau, white text) = Umlaut. These match the child's school test.

**The Reserved Legend Rule.** Gelb, grün and blau are used only to mark Selbstlaut, Zwielaut and Umlaut: in the legend buttons and on painted letters. Never use them for decoration, status, a land, or a button. Test: if a yellow, green or blue UI color shows up anywhere other than the vowel exercise, it is a bug. The rule covers interface color. Illustrations are exempt: an object keeps its true color (a green pear, a red apple), and each dragon has its own colors (DESIGN.md › Drawn art), because the child asked for twelve clearly different dragons.

**The Two Treasures Rule.** Gold and turquoise gems are the only bright materials in the world. Everything else is rock, sea-glass or ink.

**The Never Red Rule.** Mistakes use coral. No red exists in the interface. Illustrations (a red apple, the red Koralle dragon) are not interface color.

## Typography

**Display Font:** Andika (with system-ui, sans-serif)
**Body Font:** Andika (with system-ui, sans-serif)

**Character:** Andika is a SIL font (OFL license) built for early readers. Its single-storey a and clear letter shapes match the school worksheet print. It is self-hosted as woff2 in `public/fonts` (weights 400 and 700, `font-display: block`), so the app never flashes a fallback face and never loads anything from the network.

The root size is fluid (see `typography.root`): about 20px on iPhone, about 23px on iPad portrait and about 27px on iPad landscape. Every rem in the system scales from that size.

### Hierarchy
- **Display** (700, 2.6rem, 1.1): reward headlines ("9 von 10!", "Dein Ei ist geschlüpft!"), in gold-300 on rock.
- **Answer** (700, 2.6rem, 1.1): the word being worked on and the letters inside answer cells. It is 3.2rem from 700px up and 2.1–2.2rem on phones. The Kurz oder lang word is 3.4rem with 0.04em tracking. The vowel-legend sentence is 2.1rem with 1.5 line height.
- **Headline** (700, 1.75rem): the home greeting and screen titles on rock. The lands heading is 1.5rem.
- **Button** (700, 1.4rem): the gold button label. In the keyboard's Fertig button it is 1.25rem.
- **Title** (700, 1.25rem): land names and niche names.
- **Prompt** (700, 1.15rem): the task line on an exercise plaque and the feedback text (1.1rem).
- **Body** (400, 1rem, 1.35): land descriptions, captions and sub-lines.

**The One Face Rule.** Andika is the only typeface. No second display face, and no system fallback is accepted as the shipped look.

**The Two Weights Rule.** Use 400 and 700 only. Anything the child must act on or read as the answer is 700.

## Layout

There are three device postures. iPad is the main device; iPhone portrait is secondary.

- **Phone (up to 699px):** one column. On exercise screens, padding and gaps tighten (gaps 0.6rem, card padding 0.6–0.75rem), and cells and the picture shrink. The keyboard grows instead: it takes the full screen width (see Keyboard). That keeps the whole keyboard and its Fertig button on screen without scrolling. Short phones (height up to 860px) tighten further; the shortest (up to 700px, iPhone SE) also use 2.05rem keycaps, and while a hint pane is open the task line steps aside (it has been read, and the hint has its own speaker).
- **iPad portrait (700px and up):** a shared center column with a maximum width of 46rem for exercises, the collection and the lands. Nothing stretches edge to edge. Cells grow to 3.2 × 4.1rem and keys to 3rem tall.
- **iPad landscape (900px and up, landscape):** two panes. Home puts the hoard stage on the left (1.15fr) and the lands as a scrollable right pane (1fr). Exercises split into a left column (task plaque, feedback) and a right column (cells plus keyboard or answer buttons). The reward screen puts the art on the left (1.2fr) and the headline and actions on the right.

**Fit (decided 2026-11-05).** The app is a fixed frame exactly the dynamic viewport tall: the page never scrolls, zooms or rubber-bands. Each screen paints its grotto under the notch and home indicator and keeps its content clear of them (`--safe-top` / `--safe-bottom`). Only two panes scroll, inside themselves: the lands (below the stage in portrait, the right pane in landscape) and the dragon niches. Every screen keeps its answer side at full size (keyboard, cells, options, the gold button); when height runs short the rest gives way in order: free room first, then the picture (down to a floor of about 3rem, since it carries the task), then the spacing. Art on Home, reward, welcome and hatch sizes itself to the room it gets (container queries), never the other way round. Letter cells narrow together when a long word would run off the side. The main action sits at the bottom within thumb reach. On exercise screens the task floats in the middle of the room above the answer side. Spacing uses the rem steps in `spacing`, and touch targets are never smaller than `spacing.tap` (2.4rem only for the small round buttons in the exercise bar).

**The Thumb Rule.** The one primary action on a screen is a full-width gold button at the bottom.

## Elevation & Depth

Depth comes from two sources: the painted grotto wall behind everything, and soft blurred drop shadows under the glass and gold pieces sitting on that rock. Shadows are always blurred. Recessed things (niches) use an inset shadow.

### Shadow Vocabulary
- **Plaque lift** (`box-shadow: 0 6px 14px rgb(0 0 0 / 0.35)`): plaques and the kurz/lang buttons.
- **Coin lift** (`box-shadow: inset 0 0 0 3px gold-300, inset 0 0 0 6px gold-600, 0 8px 18px rgb(0 0 0 / 0.45)`): the gold button. The inner rings give it a minted rim.
- **Small lift** (`box-shadow: 0 4px 10px rgb(0 0 0 / 0.35)`): round buttons.
- **Keycap** (`box-shadow: inset 0 -3px 5px rgb(5 38 44 / 0.18), 0 3px 6px rgb(0 0 0 / 0.35)`): keys. When pressed, the shadow drops away and the key moves down 2px.
- **Niche hollow** (`box-shadow: inset 0 10px 18px rgb(0 0 0 / 0.45)`): collection niches.

**The Light From Below Rule.** The light source is the hoard. The grotto wall is darkest under the roof and warms toward the bottom, where the gold glows. Never light the scene from the top.

**The Soft Shadow Rule.** Every shadow is blurred. Pressed states move the piece down (translateY 2–3px) and drop the shadow. They never use a hard offset slab.

## Shapes

The form language is rounded and outlined, like a picture book: every plaque, button, cell, key and drawing has a 4px ink outline (3px on keys). Corners step up with size, from 8px on painted letters to 10px on keys, 14px on cells, 18px on legend tiles and the base of niches, and 22px on plaques. Round buttons and the gold button are full pills or circles. Arches belong to the grotto: the painted land entrances are stone arches, and collection niches are rounded arches (999px top corners, 18px base). The stalactite roof is part of the painted wall. Gems are always cut and faceted with a small glint, painted or drawn.

**The Outline Rule.** If it is drawn, it has a dark-teal outline. The only exceptions are thin facet lines, glints and the dotted path.

## Components

### Buttons
- **Gold coin button (primary):** a full-width pill, at least 3.4rem tall, with a 4px ink outline. The fill is a radial gradient from gold-100 through gold-300 and gold-500 to gold-600, lit from the upper middle. It has the double inset rim and a Coin lift shadow. Label: Button type in ink. Pressed: moves down 3px and scales to 0.98 over 120ms on ease-out. Disabled: glass-dim fill, ink-soft text, small lift. There is only one per screen.
- **Round button:** a sea-glass circle (2.9rem, or 2.4rem in the exercise bar) with an ink outline and an icon in ink. Used for close and read-aloud. Pressed: moves down 2px.
- **Read-aloud without a voice:** when the device has no German voice, the speaker round button stays in place but goes quiet: glass-dim fill, ink-soft icon, no shadow, no press. The layout never jumps and nothing tells the child off.
- **Quiet text action:** a second way out on a screen that already has its gold button (for example "Zur Grotte" under "Noch eine Runde") is foam text on the rock with a 3px gold-300 underline, at least `spacing.tap` tall. Never a second gold button.
- **Answer button (kurz / lang):** a sea-glass plaque-shaped button, at least 5.4rem tall, showing the Klett-style mark (a dot under the vowel for short, a bar for long) above the word.
- **Focus:** every focusable element gets a 4px gold-300 outline with a 3px offset.

### Plaques
- **Corner Style:** 22px with a 4px ink outline.
- **Background:** glass with ink text. The "right" feedback pane is gold-100; the "almost" and hint panes are coral-100.
- **Shadow Strategy:** Plaque lift.
- **Use:** the task card (prompt row with a read-aloud button, word picture, word), feedback panes (icon at 2rem plus text), the crystal counter (tabular numbers), the name field and the update banner. Greetings, land names, captions and reward headlines sit directly on the rock in foam or gold-300, not on plaques.
- **Update banner:** "Neue Version verfügbar" with a gold "Aktualisieren" button. After the tap the button gives way to "Wird aktualisiert …" and a gold bar (glass-dim track, 3px ink outline, gold-100 → gold-500 fill) in the same plaque. The bar follows the service worker's phases and creeps toward 90% in between, so it never stands still; after 10 s the app reloads anyway.

### Answer cells
The answer is built on a fixed grid of letter cells, one per letter of the answer.
- **Empty:** a rock-3 fill with a 4px foam-soft border, 14px corners.
- **Cursor:** a dashed gold-300 border.
- **Filled:** glass fill, foam border, ink letter.
- **Right:** every cell turns gold-300 with an ink border and pops with a stagger.
- **Flag (almost):** coral-100 fill, coral border and a 4px coral ring on the offending cell only.
- **Reveal (hint):** dashed gold-300 border with the letter in gold-300 on rock, as a model to copy.
- **Gap word (Fehlende Buchstaben):** the given letters stand directly on the rock in foam (Answer type), with the gap cells inline between them. On a right answer the given letters turn gold-300 with the cells.
- **Changed vowel:** in a plural hint, the vowel that changes is a gold-300 chip with a gold-600 ring, both in the singular on the task plaque and in the hint text ("Aus **u** wird **ü**.").

### Keyboard
A built-in German QWERTZ keyboard; the system keyboard and autocorrect are never used. Ä, Ö, Ü and ß sit in their own top row with wider keys tinted tq-100. Keys are glass with a 3px ink outline, 10px corners and the Keycap shadow. Each key's tap area has no gaps: the visible keycap sits inside it, so a tap between two caps still hits a key. Shift and backspace are wider keys with icons and fill the bottom row. On phones the keys run to 4px from the screen edges (Fertig keeps the screen padding), the outline is 2px and letters are 1.1rem, so even a capital W fits a 375px-wide screen. Shift shows as tq-100 while it is on. Fertig is a gold coin button under the keys and stays disabled until the answer has a letter. Pressing a key (touch or a hardware keyboard) moves it down 2px and scales it to 0.94 for a moment, then it settles back with ease-settle. A hardware keyboard types into the same answer; Enter means Fertig, or Weiter after a right answer.

### Vowel legend (signature, reserved)
In the Kristallhöhle sentence, every letter is a tappable span (8px corners); a Zwielaut is one span of two letters. Selected letters get tq-100 with a 3px tq-500 ring. Below the sentence are three outlined tiles (18px corners) in legend gelb, grün and blau, each with its letters and its term. Painting a letter gives it the legend color; tapping a painted letter picks it up again. This is the only place those colors exist.
- **After a check:** right colors stay. Letters still to do get a soft coral ring on coral-100 (try 1), then a dashed ink outline with a thick bar in the legend color they need (try 2), then the right colors are filled in (try 3).
- **One sound (mode A):** the letter group sits big (4.2–5.2rem) on a foam tile with an ink outline. The three legend tiles show only their terms; their letters rise in with the rule hint. A right answer paints the tile in its legend color with the cell pop.

### Answer options
Legend tiles and the kurz/lang buttons share one state set. Pressed: down 2px, scale 0.97. **Wrong:** a sideways nudge, then quiet (desaturated, half opacity, no shadow, disabled). **Last one left:** a 4px gold-300 ring, offset 3px, with the "So ist es richtig. Tipp darauf." pane. **Chosen right:** the same gold ring with the cell pop; the others go quiet. Then the gold Weiter button appears below.
- **Kurz oder lang mark:** before the answer, a soft "?" sits under the target vowel (tq-700). After the right answer the Klett mark rises in under it: an ink dot for kurz, an ink bar as wide as the vowel for lang.
- **Listen instead of a picture:** while a Wörter-mit-ie item has no picture, a big round speaker (5.4rem, 4.4rem on phones) takes the picture's place and the word is read on open.
- **Hint panes** carry a small round speaker at their end, so every hint can be heard.

### Navigation
- **Lands path:** the five painted cave entrances (6rem, the chamber visible inside) alternate left and right along one dotted gold-300 path. Each mouth has its name (Title type) and its description (Body type, foam-soft) on a rock-2 backing, so the path runs behind the labels. Locked lands have a rock-3 arch with a lock and say "Noch verschlossen"; the one that opens next names the next step: "Öffnet sich mit dem nächsten Ei" while an egg fills, "Öffnet sich, wenn Funkel wächst" while a dragon is fed. Under the hoard caption, a quiet text action "Deine Drachen" leads to the collection. Pressed: the mouth scales to 0.96.
- **Exercise bar:** a close button plus a track of 10 gem slots. Earned gems are faceted turquoise; empty slots are rock-colored outlines.

### Collection niches
Rounded arches carved into rock (rock-3 with the Niche hollow shadow), in a grid, under a round back button and the "Deine Drachen" title. The newest dragon spans the full width. Each dragon shows its name (Title) and its stage; the one being fed also says what it still needs ("Junger Drache · Noch 36 Kristalle"). After the dragons comes the next egg: in progress with its fill caption while it fills, or, while a dragon is fed, a carved slot with "Kommt, wenn Funkel groß ist." Then one empty niche per dragon still to find: rock-2 with a dashed rock-4 border and a dashed egg silhouette carved into it. The child sees how many are left, never what they are.

**Growth:** every dragon has its own picture per stage (baby proportions, slim young dragon, grown hero). Every picture fills the same canvas, so the stage is also shown by size: 0.5 (Drachenbaby), 0.75 (Junger Drache) or full size (Großer Drache), scaled from one ground line (`STAGE_SCALE` in art.tsx, `data-stage` on `.dragon-pic`). The newest dragon spans the full width; the picture sits on the niche floor (`object-position: bottom`).

### Name entry
Used twice: the child's own name on first start ("Wie heißt du?") and a new dragon's name after hatching. A plaque holds the question with its read-aloud button and a foam name line (2.2rem, 700) with a still gold-600 caret (the caret never blinks: only a new egg may). Below it, the built-in keyboard; shift is on for the first letter, because names start with a capital. Up to 12 letters. The Fertig button stays disabled until there is a letter. On iPad landscape the name entry is the right pane.

### Reward and egg
- **Round summary:** score headline, the round's crystals including the bonus, then the bonus line in gold-300 ("+10 extra für die ganze Runde!"). Only the goal stands on the hoard: the egg in its dragon's colors, or the dragon being fed (happy pose, sized 0.53 / 0.69 / 0.85 of the pile by stage, so a baby still reads at a glance). A dragon that just grew still shows its old size here; the grow screen reveals the new one.
- **Goal meter:** ten gem slots, one per 10 crystals of the 100 every step needs, with "Noch 36 Kristalle, dann schlüpft dein Ei." or "Noch 40 Kristalle, dann wächst Funkel." under it. With every dragon found and grown, the meter is gone and the newest dragon stands on the pile.
- **Goal ready:** the meter is full and the one gold button is "Zum Ei!" (the egg wobbles) or "Zu Funkel!" ("Funkel ist satt und will wachsen!"). No second way out: the ready egg and the grown dragon also wait on Home.

### Growing
The same three-beat stage as the hatch, with the dragon on its own hoard (the summary's pile). **Full:** "Funkel ist satt!" over the dragon at its old size (idle), "Tipp auf Funkel!" in gold-300 with a read-aloud button beside it (it reads the name-free "Dein Drache ist satt! Tipp auf deinen Drachen!": clips are made at build time, the name is the child's; the hello beat's button by the stage name reads "Dein Drache ist gewachsen!"). **Grow:** the tap swells the old picture to the new stage's size from the same ground line (900ms, ease-settle with its small overshoot), lit gold from below by a soft gold-300 drop shadow, with the sparkling whoosh. **Hello:** the new stage's picture takes over at the same size (happy) as the gold light settles away; "Funkel ist gewachsen!" with the stage name under it, or, fully grown, "Funkel ist groß und hat ein Ei gefunden!" while the next egg rolls in beside its feet. Then the opened land rises in, the same reveal as the hatch's last beat, and the gold "Zur Grotte". The growth is saved before this screen (`pendingGrowth`), so closing the app brings it back. iPad landscape: art left, words and button right, like the round summary.

### Hatching
Three beats on one screen. **Egg:** "Dein Ei wackelt! Gleich schlüpft es." over the wobbling egg (in its dragon's colors); "Tipp auf das Ei!" in gold-300. Tapping it swaps the egg for its two cut shell halves, stacked so they still look whole: the egg rocks hard on its base, then the top half pops up and tumbles away (1.1s). **Name:** "Dein Ei ist geschlüpft!", the baby dragon rises out of the bottom shell (760ms, ease-settle) with the popped top lying tilted beside it, and the name entry below. **Hello:** "Hallo, Funkel!" over the baby in its happy pose, then the newly opened land's cave mouth (with its peek) rising in with "Eine neue Grotte ist offen: Schiffswrack", and the gold "Zur Grotte". A ready egg is saved, so closing the app at any beat comes back to it.

### Feedback lines
A right answer shows one praise line from a short list, in turn, never the same twice in a row. The first hint after a wrong try leads with a warm line from a second list ("Noch nicht ganz.", "Gleich hast du es!") on its own line, then the rule. Both lines are read aloud with the hint.

### Drawn art and illustration
Two kinds of art share one look (dark-teal ink outline, light from below):
- **Drawn (inline SVG, `src/ui/art.tsx`):** only small UI pieces that must stay crisp: the slot gems of the progress track and the egg meter, the carved egg slots of dragons still to find, the lock, and the icons (one stroke family on a 24-unit grid, 2.6 stroke width, round caps and joins, `currentColor`).
- **Generated (WebP in `public/img`, made by `npm run images`, looked up through `src/ui/images.ts`):** 112 word pictures, 12 dragons × 3 stages × 3 moods, 12 eggs, their cut shell halves, 5 land chambers, a world map, and the painted world pieces (2026-11-04, replacing the drawn ones): the hoard in 4 sizes, the gem, 5 cave entrances and the grotto wall (portrait and landscape). A test (`images.test.ts`) fails if any picture the app can ask for is missing. Provenance per file in `src/content/image-sources.json`; licenses in ASSETS.md.

**Painted world pieces:**
- **Grotto wall:** the background of every screen (`--backdrop`, portrait or landscape by orientation, `cover`, anchored at the bottom), over rock-1 while it loads. Generated with the rock tokens as its only palette and calmed a little in the build (`-modulate 82,90`), so light text stays readable. Words straight on the rock get a soft dark halo (blurred text-shadow, never an outline).
- **Hoard:** one painted heap in 4 sizes, all the same width, so a bigger pile is taller. Home picks the size from the crystal total (`size` = crystals / 1000), the round summary shows a big one. Exercise screens have no pile (removed 2026-11-05 to give the task the room). The sleeping dragon sinks into the heap with its own bit of gold, so they read as one pile. Earned gems land on the mound's curve (`surface()` in art.tsx), half sunk into the coins.
- **Gem:** the painted gem is the crystal the child earns: the counter, the flying gem, the gems dropping onto the reward pile, the "right" feedback pane and the inline gem in the reward line. The progress track and egg meter keep the drawn slot gems.
- **Cave entrances:** each land is a painted stone arch with its chamber inside (6rem on the path, 7rem when a land opens). A locked land shows the same arch at 35% brightness behind a drawn lock.

**Where each picture appears:**
- **Word picture:** on the task plaque, square (6.5rem; 4.9rem on phones; 9.5rem on iPad portrait; 7.5rem on iPad landscape), with a soft drop shadow so it sits on the glass. Its alt text never gives the answer away ("Bild", except in Mehrzahl, where the word is shown anyway).
- **Home:** the goal lies on the hoard. While a dragon is fed, that dragon sleeps there (sleeping mood, sized by stage, breathing, "z z" near its head). While the next egg fills, the newest dragon sleeps a little to the left and the egg (smaller) leans against it in front. Before the first hatch the egg lies there alone, and the caption says "Dein Ei liegt auf …". Welcome shows the child's first egg on a small hoard.
- **Exercises:** no dragon and no pile. The screen belongs to the task; the gem flying into the progress track is the reward for a right answer (decided 2026-11-04, pile removed 2026-11-05).
- **Round summary:** the goal only: the egg in its dragon's colors, or the dragon being fed in its happy mood.
- **Grow:** the old stage (idle, then happy while it swells), then the new stage in its happy mood.
- **Collection:** each dragon in idle mood at its stage; the egg in progress in its colors; the rest stay carved slots.
- **Hatch:** egg, then the two shell halves, then the baby (idle while naming, happy when greeted).
- **Lands:** each land's painted cave entrance, darkened behind a lock while closed.

**Which egg:** the egg always shows the dragon that will hatch from it (`eggKind` in rewards.ts). Eggs hatch in roster order (the five land dragons first, in land order), so this is the same whatever land is played; a test guards it.

**Image style prompt (Part 7, reuse verbatim for every AI image):**

> Children's picture-book illustration for a German spelling game. Friendly, rounded shapes, thick dark-teal outlines (#05262c), flat color with soft gouache texture. Palette: turquoise scales (#17a39c, #3fd3c6), warm amber gold (#e2a23c, #f7c86e), pale sea-glass (#e6f6f2), small coral accents (#ff8a6b). Gentle warm light from below as if lit by treasure. Single subject, centered, full figure, no text, no letters, transparent background. Cute, calm, never scary.

Per-asset notes to add after the style block:
- **Word pictures:** one object each.
- **Dragons:** a powerful, majestic dragon, the hero of an adventure for a boy who loves dragons: horns, claws, wings, sea-fin ears, fierce determined eyes, a confident grin with small fangs. Never cute, chubby or toy-like; never gory. Every dragon has its own main color, build and one signature feature (`src/content/picture-prompts.ts` › DRAGON_LOOKS), so the twelve are told apart at a glance. For dragons the style block's palette line is replaced by the dragon's own colors, "Friendly, rounded shapes" becomes "Bold, dynamic shapes" and "Cute, calm, never scary" becomes "Heroic and exciting, never gory"; the dark-teal outline, gouache texture and warm light from below stay, so they read as one family. Only the hatchling stage may be baby-like.
- **Eggs:** made from the dragon's reference picture, in that dragon's colors and pattern with a few gold spots. The shell halves are not generated: the build cuts the picked egg along an inked zigzag, so they always fit.

### Motion vocabulary
Motion has weight and settles. Two easings: `ease-out` (cubic-bezier(0.16, 1, 0.3, 1)) for arrivals and presses, and `ease-settle` (cubic-bezier(0.34, 1.4, 0.64, 1)), which overshoots a little before settling.
- **Right answer:** a gem arcs with weight from the answer up into its slot in the progress track (900ms along a curved path, swelling then shrinking). The slot fills when it lands, with a settle drop (520ms). The cells turn gold and pop one after another (520ms, 60ms stagger, ease-settle). The "right" pane rises in. Sparkle appears only on a right answer.
- **Almost right** (for example a lowercase noun): the cells get a gentle sideways nudge (420ms, 8px), a coral "Fast!" pane rises in, and the offending cell is flagged.
- **Wrong:** the same nudge, then graded hint panes, one more per attempt: the rule, then the start of the word revealed, then the full answer to copy.
- **Reward:** the round's crystals drop one by one onto the pile (700ms each, 140ms apart).
- **Egg:** before hatching, the egg wobbles (2.4s loop, rocking on its base). On the tap it rocks hard and its top half pops off; the baby rises out of the bottom half. (The blink for a new egg is defined, `.egg-new`, but not used: the wobble already says "ready".)
- **Idle:** the sleeping dragon on Home breathes (4.2s, 2.5% vertical scale, from its base) and its "z z" drifts.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, every animation and transition collapses to 1ms and runs once.

**The One Blink Rule.** Only a new egg may blink. Nothing else flashes, pulses for attention or loops for emphasis.

### Sound
Short effects made with ElevenLabs sound effects (`npm run sfx`, prompts in `scripts/gen-sfx.ts`), bundled as mono MP3 in `public/sfx/` and played with Web Audio, so they start at once and work offline. Loudness is normalized per effect: frequent sounds sit low, ambience lowest.
- **Soft, for frequent moments:** a glassy chime on a right answer, a light clink when the gem lands on the hoard, a short wooden click on every key.
- **Key click:** synthesized, not generated (`npm run click`, `scripts/gen-click.ts`): a 4 ms noise tick plus a falling 820→560 Hz wooden tock, 45 ms, peak about -10 dBFS. Bundled as WAV because MP3 padding delays the attack. Each press shifts the pitch by up to ±6% so fast typing stays alive. (The first ElevenLabs tick, 0.5 s of soft noise without an attack, was dropped on 2026-11-04 as irritating.)
- **Cartoon, for rare moments:** a round "blub" with the first hint, a coin cascade with a slide whistle at the round summary, a knock on every second rock of the ready egg, an eggshell crack with a baby-dragon hiccup on the hatch tap, a sparkling whoosh when entering a land.
- **Atmosphere (music):** a lively dragon-adventure loop (ElevenLabs Music, `npm run music`, `scripts/gen-music.ts`; 69.7 s seamless, stereo 96 kbps, -27 LUFS, about 7 dB under the voice) with the grotto's water at half level underneath. Heroic D-dorian theme lifting into a major chorus, ~105 BPM: galloping strings like wingbeats, big drums, horns on the tune. Cool, never cute, never ambient-sleepy. Plays only on Home and the round reward, never in an exercise; off by default. Fades in over 1.5 s once loaded, out over 0.6 s; dips to 30% while the voice talks and comes back over 0.6 s. Reward → Home keeps it going. (The dragon's snore was dropped with the music: a sleeping beast does not fit a ride.)
- **Switches:** two round buttons next to the crystal counter on Home: Töne (speaker; crossed speaker when off) and Musik (two beamed notes, shown only while Töne is on). Off is clouded glass with soft ink. The voice is never muted by them.
- A wrong answer never gets a harsh sound; only the hint's "blub".

## Do's and Don'ts

### Do:
- **Do** put the reading surface on sea-glass plaques (glass with ink text, a 4px ink outline and 22px corners).
- **Do** keep gold amber-leaning (gold-500, gold-300) so it can never be confused with the school's gelb.
- **Do** keep the light coming from below: the grotto wall is dark at the top and lit by the hoard.
- **Do** draw gems as cut, faceted shapes with an ink outline and a small glint.
- **Do** give the screen one full-width gold coin button for its main action, at thumb height.
- **Do** use coral and coral-100 for every "almost" and "wrong" state, with graded help.
- **Do** honor reduced motion and keep the overshoot settle easing for arrivals.
- **Do** reuse the image style prompt verbatim for every generated image.

### Don't:
- **Don't** use legend gelb, grün or blau anywhere except to mark Selbstlaut, Zwielaut and Umlaut.
- **Don't** use red, or any harsh sound or motion, for a mistake.
- **Don't** make anything blink except a new egg.
- **Don't** use hard offset shadows. Every shadow is blurred.
- **Don't** draw glossy blob gems or unoutlined art.
- **Don't** use any typeface other than Andika, or any weight other than 400 or 700.
- **Don't** add small eyebrow labels or kickers above headings. Text for the child stays short and plain.
- **Don't** fall back to the learning-app default of round level bubbles in a zigzag with a green button.
