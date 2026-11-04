// Spaced repetition with five Leitner boxes. Wrong words come back often; known words rest.

import type { Box, ExerciseType, Item, Progress } from './types.ts'

export const ROUND_SIZE = 10

const DAY = 24 * 60 * 60 * 1000
/** Rest time per box. Box 1 is practised every round. */
export const BOX_INTERVAL: Record<Box, number> = { 1: 0, 2: DAY, 3: 3 * DAY, 4: 7 * DAY, 5: 14 * DAY }

export const newProgress = (): Progress => ({ box: 1, lastSeen: 0, correct: 0, wrong: 0 })

/** Right on the first try → up one box. Any wrong try → back to box 1. */
export function record(p: Progress | undefined, firstTry: boolean, now: number, lastWrong?: string): Progress {
  const cur = p ?? newProgress()
  return {
    box: firstTry ? (Math.min(5, cur.box + 1) as Box) : 1,
    lastSeen: now,
    correct: cur.correct + (firstTry ? 1 : 0),
    wrong: cur.wrong + (firstTry ? 0 : 1),
    lastWrong: firstTry ? cur.lastWrong : (lastWrong ?? cur.lastWrong),
  }
}

export const isSeen = (p: Progress | undefined): p is Progress => !!p && p.lastSeen > 0

export const isDue = (p: Progress, now: number) => now - p.lastSeen >= BOX_INTERVAL[p.box]

/**
 * Pick a round: due items first (most overdue, lowest box), then box 1–2 items,
 * then new ones, then anything else so a small pool still fills the round. Order is shuffled.
 */
export function pickRound(
  items: Item[],
  progress: Record<string, Progress>,
  type: ExerciseType,
  now: number,
  size = ROUND_SIZE,
  rand: () => number = Math.random,
): Item[] {
  const pool = items.filter((i) => i.active && i.type === type)
  const seen = pool.filter((i) => isSeen(progress[i.id]))
  const p = (i: Item) => progress[i.id]!
  const overdue = (i: Item) => now - p(i).lastSeen - BOX_INTERVAL[p(i).box]

  const due = seen.filter((i) => isDue(p(i), now)).sort((a, b) => p(a).box - p(b).box || overdue(b) - overdue(a))
  const low = seen.filter((i) => !isDue(p(i), now) && p(i).box <= 2).sort((a, b) => p(a).lastSeen - p(b).lastSeen)
  const fresh = shuffle(
    pool.filter((i) => !isSeen(progress[i.id])),
    rand,
  )
  const rest = seen.filter((i) => !isDue(p(i), now) && p(i).box > 2).sort((a, b) => p(a).lastSeen - p(b).lastSeen)

  const picked: Item[] = []
  for (const list of [due, low, fresh, rest]) {
    for (const i of list) {
      if (picked.length >= size) break
      picked.push(i)
    }
  }
  return shuffle(picked, rand)
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
