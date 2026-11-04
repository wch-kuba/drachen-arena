// The dragons a child can hatch in v1. Each land has its own dragon; the rest hatch in a
// fixed order after that. Kinds have no names: the child names every dragon.
// Colors only drive the placeholder SVG until Part 7 brings the real art.

import type { ExerciseType } from '../engine/types.ts'

export interface DragonKind {
  id: string
  /** The land whose egg hatches this dragon first. */
  land?: ExerciseType
  body: string
  wing: string
  belly: string
}

const TQ = { body: 'var(--tq-500)', wing: 'var(--tq-300)', belly: 'var(--gold-300)' }

export const DRAGONS: DragonKind[] = [
  { id: 'perle', land: 'mehrzahl', ...TQ },
  { id: 'wrack', land: 'luecke', body: 'var(--tq-700)', wing: 'var(--tq-300)', belly: 'var(--gold-300)' },
  { id: 'tang', land: 'ie', body: 'var(--tq-300)', wing: 'var(--tq-100)', belly: 'var(--gold-500)' },
  { id: 'kristall', land: 'laute', body: 'var(--tq-100)', wing: 'var(--tq-300)', belly: 'var(--gold-300)' },
  { id: 'echo', land: 'kurzlang', body: 'var(--gold-500)', wing: 'var(--gold-300)', belly: 'var(--tq-100)' },
  { id: 'muschel', body: 'var(--gold-300)', wing: 'var(--gold-100)', belly: 'var(--tq-300)' },
  { id: 'welle', body: 'var(--tq-500)', wing: 'var(--gold-300)', belly: 'var(--tq-100)' },
  { id: 'koralle', body: 'var(--gold-600)', wing: 'var(--gold-300)', belly: 'var(--tq-300)' },
  { id: 'tiefsee', body: 'var(--tq-700)', wing: 'var(--gold-500)', belly: 'var(--gold-100)' },
  { id: 'schaum', body: 'var(--tq-100)', wing: 'var(--gold-300)', belly: 'var(--gold-500)' },
  { id: 'schatz', body: 'var(--gold-500)', wing: 'var(--tq-300)', belly: 'var(--gold-100)' },
  { id: 'lagune', body: 'var(--tq-300)', wing: 'var(--tq-500)', belly: 'var(--gold-300)' },
]

export const dragonKind = (id: string): DragonKind => DRAGONS.find((d) => d.id === id) ?? { id, ...TQ }
