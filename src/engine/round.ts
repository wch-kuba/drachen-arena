// A round of up to 10 items. Pure state; the game hook saves after every finished item,
// so leaving mid-round never loses crystals already earned.

import { crystalsFor, firstTry, startAttempt, submit, type Attempt } from './attempt.ts'
import type { Item } from './types.ts'

export interface Result {
  id: string
  firstTry: boolean
  crystals: number
  lastWrong?: string
}

export interface Round {
  items: Item[]
  index: number
  attempt: Attempt
  results: Result[]
}

export const startRound = (items: Item[]): Round => ({ items, index: 0, attempt: startAttempt(), results: [] })

export const current = (r: Round): Item | undefined => r.items[r.index]

export const isOver = (r: Round) => r.index >= r.items.length

/** Submit an answer. Returns the new round and, when the item just finished, its result. */
export function answer(r: Round, typed: string): { round: Round; finished?: Result } {
  const item = current(r)
  if (!item || r.attempt.done) return { round: r }
  const attempt = submit(r.attempt, item, typed)
  if (!attempt.done) return { round: { ...r, attempt } }
  const finished: Result = {
    id: item.id,
    firstTry: firstTry(attempt),
    crystals: crystalsFor(attempt),
    lastWrong: attempt.lastWrong,
  }
  return { round: { ...r, attempt, results: [...r.results, finished] }, finished }
}

/** Move on after a finished item. */
export function next(r: Round): Round {
  if (!r.attempt.done) return r
  return { ...r, index: r.index + 1, attempt: startAttempt() }
}

export const roundCrystals = (r: Round) => r.results.reduce((n, x) => n + x.crystals, 0)
export const roundFirstTries = (r: Round) => r.results.filter((x) => x.firstTry).length
