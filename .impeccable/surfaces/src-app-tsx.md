---
version: 1
slug: "src-app-tsx"
primary_target: "src/app.tsx"
related_targets: ["src/index.css"]
---

# Surface brief – Drachen-Arena app shell (home + game screens)

Mode: Experience (the child is inside the game). Platform: installed PWA, mainly iPad (portrait and landscape), also iPhone portrait; touch only. iPad landscape = two panes.
Audience: one Klasse 2 child, early reader, ocean and dragon lover; favorite colors turquoise and gold; wants it magical, glowing, cozy. Nothing to avoid beyond default friendliness.
Job: pick up the game, see your dragon and its treasure, start a round of 10 spelling tasks, get rewarded.
Constraints: German child-facing copy, short; huge type and touch targets; school test colors gelb/grün/blau reserved; offline, all assets bundled; no child name in code.

## Direction contract

THESIS: The child's dragon sleeps in a turquoise sea grotto on a treasure hoard that visibly grows with every crystal earned. Learning is feeding the hoard. Refuses the category default: mascot over a zigzag of round level bubbles and a chunky green button.

OWN-WORLD: Deep sea-teal grotto rock in layered bands (darkest at the top, lightening toward the hoard), gold coins and turquoise cut gems as the only bright materials, the hoard lit gold from within. Text sits on pale sea-glass plaques with dark teal ink. Thick dark-teal outlines on every drawn thing. Gem facets, never glossy blobs. Test colors gelb/grün/blau appear only as the vowel legend.

STORY: The child sees their own dragon on its gold, understands that answers become treasure, taps one huge golden button, and comes back to see the pile higher.

FIRST VIEWPORT: Greeting top-left, crystal counter top-right on a plaque. Dragon centered, lying on the hoard that fills the lower middle third; gems scattered on the pile. Full-width golden "Los geht’s!" button bottom, thumb reach. Grotto chambers (the 5 lands) descend below the fold along one winding path; on iPad landscape they sit in a right-hand pane beside the hoard.

FORM: Drachenhort, the dragon's treasure hoard in a sea grotto; position 1 on the re-rolled grounded list (IMPECCABLE’S PICK, chosen by the user after one re-roll steered "dragons are main theme"). seed:db5d122bd4574d2c

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: a correct answer flings a gem/coin that arcs with weight onto the hoard; the pile grows. Motion has mass and settles with small overshoot; only a new egg ever blinks; sparkle only on correct answers.

## Unresolved
- Resolved 2026-11-04 (Part 7): real dragon, egg, shell, land and word art is built in; see DESIGN.md › Drawn art and illustration.
