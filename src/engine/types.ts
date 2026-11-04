// Core data model shared by every exercise (plan/v1-03-core-engine.md).

export type ExerciseType = 'laute' | 'mehrzahl' | 'luecke' | 'kurzlang' | 'ie'

/** One question. Seed items ship with the app; parent items are added in v2. */
export interface Item {
  id: string
  type: ExerciseType
  /** What the child sees, e.g. "der Hut", "M_tze", "ei". */
  prompt: string
  /** The expected answer, e.g. "Hüte", "ü", "Zwielaut". */
  answer: string
  /** Asset path or emoji. */
  image?: string
  /** Rule hint, e.g. "Aus u wird oft ü." Falls back to the type default. */
  hint?: string
  /** E.g. ["umlaut-plural"]. */
  tags?: string[]
  source: 'seed' | 'parent'
  active: boolean
}

/** Leitner box: 1 = practice every round … 5 = mastered. */
export type Box = 1 | 2 | 3 | 4 | 5

export interface Progress {
  box: Box
  /** Epoch ms of the last answer, 0 = never seen. */
  lastSeen: number
  correct: number
  wrong: number
  /** Last wrong answer the child typed (for the parent's problem-word view). */
  lastWrong?: string
}

export interface Dragon {
  id: string
  name: string
  hatchedAt: number
}

export interface Profile {
  /** Set by the parent in the app. Never hard-coded. */
  childName: string
  crystals: number
  points: number
  /** Eggs owned but not hatched yet. */
  eggs: number
  /** Rounds put into the current egg (Part 6 decides how many hatch it). */
  eggProgress: number
  dragons: Dragon[]
  unlockedWorlds: ExerciseType[]
}
