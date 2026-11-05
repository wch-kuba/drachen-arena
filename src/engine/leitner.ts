// Spaced repetition with five Leitner boxes. Wrong words come back often; known words rest.

import type { Box, ExerciseType, Item, Mistake, Progress } from './types.ts'

export const ROUND_SIZE = 10

const DAY = 24 * 60 * 60 * 1000
/** Rest time per box. Box 1 is practised every round. */
export const BOX_INTERVAL: Record<Box, number> = { 1: 0, 2: DAY, 3: 3 * DAY, 4: 7 * DAY, 5: 14 * DAY }

export const newProgress = (): Progress => ({ box: 1, lastSeen: 0, correct: 0, wrong: 0 })

/** Right on the first try → up one box. Any wrong try → back to box 1. */
export function record(
  p: Progress | undefined,
  firstTry: boolean,
  now: number,
  lastWrong?: string,
  mistakes: Mistake[] = [],
): Progress {
  const cur = p ?? newProgress()
  const counts = { ...cur.mistakes }
  for (const m of mistakes) counts[m] = (counts[m] ?? 0) + 1
  return {
    box: firstTry ? (Math.min(5, cur.box + 1) as Box) : 1,
    lastSeen: now,
    correct: cur.correct + (firstTry ? 1 : 0),
    wrong: cur.wrong + (firstTry ? 0 : 1),
    lastWrong: firstTry ? cur.lastWrong : (lastWrong ?? cur.lastWrong),
    ...(mistakes.length || cur.mistakes ? { mistakes: counts } : {}),
  }
}

/** Tags that put a new item ahead of other new items (the child's known mistakes first). */
export const PRIORITY: Record<string, number> = { 'missed-on-test': 2, 'umlaut-plural': 1 }
const priority = (i: Item) => Math.max(0, ...(i.tags ?? []).map((t) => PRIORITY[t] ?? 0))

export const isSeen = (p: Progress | undefined): p is Progress => !!p && p.lastSeen > 0

export const isDue = (p: Progress, now: number) => now - p.lastSeen >= BOX_INTERVAL[p.box]

/** Most box-1 items in one round, so a few misses don't bring back the same round again and again. */
export const MAX_BOX1 = ROUND_SIZE / 2

/**
 * Pick a round: due items first (lowest box, most overdue; box 1 capped at MAX_BOX1), then new ones
 * (tagged mistakes first, see PRIORITY), then resting items, longest rested first, so a small pool
 * still fills the round and rotates. Box 2–5 items that aren't due never push out new ones. Order is shuffled.
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
  const oldestFirst = (a: Item, b: Item) => p(a).lastSeen - p(b).lastSeen || p(a).box - p(b).box

  const due = seen.filter((i) => isDue(p(i), now)).sort((a, b) => p(a).box - p(b).box || overdue(b) - overdue(a))
  const box1 = due.filter((i) => p(i).box === 1)
  const reviews = due.filter((i) => p(i).box > 1)
  const fresh = shuffle(
    pool.filter((i) => !isSeen(progress[i.id])),
    rand,
  ).sort((a, b) => priority(b) - priority(a))
  const resting = seen.filter((i) => !isDue(p(i), now)).sort(oldestFirst)

  const picked = new Set<Item>()
  const take = (list: Item[], max = size) => {
    let n = 0
    for (const i of list) {
      if (picked.size >= size || n >= max) break
      if (picked.has(i)) continue
      picked.add(i)
      n++
    }
  }
  take(box1, Math.min(MAX_BOX1, size))
  take(reviews)
  take(fresh)
  take(resting)
  take(box1) // a small pool may still need the rest of box 1
  return shuffle([...picked], rand)
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
