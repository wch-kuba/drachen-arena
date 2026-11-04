// One item, from first try to done. Hints grow with each wrong try; nothing is ever taken away.
//   try 1 wrong → rule hint
//   try 2 wrong → partial reveal
//   try 3 wrong → full answer shown, child copies it once, item goes back to box 1

import { check, normalize, type Verdict } from './check.ts'
import type { Item, Mistake } from './types.ts'
import { pluralMistake } from './words.ts'

export type HintLevel = 0 | 1 | 2 | 3

export interface Attempt {
  wrongs: number
  hint: HintLevel
  /** Last verdict, for the feedback pane. */
  last?: Verdict
  /** Last wrong answer typed (stored in Progress for the parent). */
  lastWrong?: string
  /** Kind of each wrong try (Mehrzahl only), for the parent's stats. */
  mistakes: Mistake[]
  done: boolean
}

export const startAttempt = (): Attempt => ({ wrongs: 0, hint: 0, mistakes: [], done: false })

export function submit(a: Attempt, item: Item, typed: string): Attempt {
  if (a.done) return a
  const v = check(typed, item.answer)
  if (v.kind === 'right') return { ...a, last: v, done: true }
  // Almost right is not a wrong try: the child fixes the capitals and keeps the reward.
  if (v.kind === 'almost') return { ...a, last: v }
  const wrongs = a.wrongs + 1
  return {
    ...a,
    last: v,
    wrongs,
    hint: Math.min(3, wrongs) as HintLevel,
    lastWrong: normalize(typed),
    mistakes: item.type === 'mehrzahl' ? [...a.mistakes, pluralMistake(typed, item.answer)] : a.mistakes,
  }
}

/** Right on the first try, no hint seen. Only this moves an item up a box. */
export const firstTry = (a: Attempt) => a.done && a.wrongs === 0

/** Crystals for finishing an item: fewer when hints were needed, never zero. */
export function crystalsFor(a: Attempt): number {
  if (!a.done) return 0
  return a.wrongs === 0 ? 3 : a.wrongs === 1 ? 2 : 1
}

/**
 * How many leading letters the partial-reveal hint shows (hint level 2). 0 = no letter reveal.
 * Wörter mit ie: the first letter. Fehlende Buchstaben: the first letter of a two-letter gap.
 * Mehrzahl: the start of the word up to and including the first letter that differs from the
 * prompt word (Hut → "Hü"te, Korb → "Kö"rbe), capped at half the answer.
 */
export function revealCount(item: Item): number {
  const len = [...normalize(item.answer)].length
  if (item.type === 'ie') return len > 1 ? 1 : 0
  if (item.type === 'luecke') return len > 1 ? 1 : 0
  if (item.type !== 'mehrzahl') return 0
  const answer = [...normalize(item.answer)]
  const cap = Math.floor(answer.length / 2)
  if (cap === 0) return 0
  const base = [...normalize(item.prompt).replace(/^\S+\s+/, '')]
  let diff = answer.findIndex((ch, i) => ch.toLowerCase() !== base[i]?.toLowerCase())
  if (diff === -1) diff = answer.length
  return Math.max(1, Math.min(cap, diff + 1))
}
