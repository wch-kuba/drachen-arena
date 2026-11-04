// The dragons a child can hatch in v1. Each land has its own dragon; the rest hatch in a
// fixed order after that. Kinds have no names: the child names every dragon.
// Each kind's look (dragon type, colors, signature) is in picture-prompts.ts › DRAGON_LOOKS;
// its pictures (3 stages × 3 moods, egg, shell halves) are in public/img (Part 7).

import type { ExerciseType } from '../engine/types.ts'

export interface DragonKind {
  id: string
  /** The land whose egg hatches this dragon first. */
  land?: ExerciseType
}

export const DRAGONS: DragonKind[] = [
  { id: 'perle', land: 'mehrzahl' },
  { id: 'wrack', land: 'luecke' },
  { id: 'tang', land: 'ie' },
  { id: 'kristall', land: 'laute' },
  { id: 'echo', land: 'kurzlang' },
  { id: 'muschel' },
  { id: 'welle' },
  { id: 'koralle' },
  { id: 'tiefsee' },
  { id: 'schaum' },
  { id: 'schatz' },
  { id: 'lagune' },
]
