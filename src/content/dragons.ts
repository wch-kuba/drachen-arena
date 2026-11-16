// The dragons a child can hatch in v1. Each land has its own dragon; the rest hatch in a
// fixed order after that. Kinds have no names: the child names every dragon.
// Each kind's look (dragon type, colors, signature) is in picture-prompts.ts › DRAGON_LOOKS;
// its pictures (3 stages × 3 moods, egg, shell halves) are in public/img (Part 7).

import type { ExerciseType } from '../engine/types.ts'

export interface DragonKind {
  id: string
  /** The land whose egg hatches this dragon first. */
  land?: ExerciseType
  /** Its card in the collection (Part 6b): what kind it is, what it can do, where it lives.
   *  `lives` is `home` as a sentence for the read-aloud button. Our own texts, cool not cute. */
  card: { art: string; power: string; home: string; lives: string }
}

export const DRAGONS: DragonKind[] = [
  { id: 'perle', land: 'mehrzahl', card: { art: 'Perlendrache', power: 'Findet jede Perle im Meer.', home: 'Perlenriff', lives: 'Er wohnt im Perlenriff.' } },
  { id: 'auster', land: 'umlaut', card: { art: 'Krabbendrache', power: 'Seine Scheren knacken jede Muschel.', home: 'Austernbank', lives: 'Er wohnt auf der Austernbank.' } },
  { id: 'strudel', land: 'einzahl', card: { art: 'Hammerdrache', power: 'Dreht das Wasser zu einem wilden Strudel.', home: 'Strudel', lives: 'Er wohnt im Strudel.' } },
  { id: 'wrack', land: 'luecke', card: { art: 'Schildkrötendrache', power: 'Sein Panzer hält jeden Sturm aus.', home: 'Schiffswrack', lives: 'Er wohnt im Schiffswrack.' } },
  { id: 'tang', land: 'ie', card: { art: 'Langdrache', power: 'Versteckt sich im Seetang, bis ihn keiner sieht.', home: 'Tiefsee-Garten', lives: 'Er wohnt im Tiefsee-Garten.' } },
  { id: 'kristall', land: 'laute', card: { art: 'Kristalldrache', power: 'Seine Stacheln leuchten im Dunkeln.', home: 'Kristallhöhle', lives: 'Er wohnt in der Kristallhöhle.' } },
  { id: 'echo', land: 'kurzlang', card: { art: 'Flügelschlange', power: 'Hört einen Fisch aus hundert Metern.', home: 'Echo-Grotte', lives: 'Er wohnt in der Echo-Grotte.' } },
  { id: 'muschel', card: { art: 'Panzerdrache', power: 'Sein Muschelpanzer ist hart wie Stein.', home: 'Sandbank', lives: 'Er wohnt auf der Sandbank.' } },
  { id: 'welle', card: { art: 'Seeschlange', power: 'Schwimmt schneller als jedes Schiff.', home: 'Offenes Meer', lives: 'Er wohnt im offenen Meer.' } },
  { id: 'koralle', card: { art: 'Zweikopfdrache', power: 'Zwei Köpfe sehen doppelt so viel.', home: 'Korallenwald', lives: 'Er wohnt im Korallenwald.' } },
  { id: 'tiefsee', card: { art: 'Tiefseedrache', power: 'Seine Laterne leuchtet am dunklen Meeresgrund.', home: 'Tiefsee', lives: 'Er wohnt in der Tiefsee.' } },
  { id: 'schaum', card: { art: 'Federdrache', power: 'Fliegt leise wie Schaum über das Wasser.', home: 'Über den Wellen', lives: 'Er wohnt über den Wellen.' } },
  { id: 'schatz', card: { art: 'Schatzdrache', power: 'Vier Flügel tragen ihn und all sein Gold.', home: 'Goldhöhle', lives: 'Er wohnt in der Goldhöhle.' } },
  { id: 'lagune', card: { art: 'Mantadrache', power: 'Gleitet durch das Wasser wie ein Rochen.', home: 'Lagune', lives: 'Er wohnt in der Lagune.' } },
]

export const kindOf = (id: string) => DRAGONS.find((d) => d.id === id)
