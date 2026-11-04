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
  /** Kurz oder lang: index of the target vowel in `prompt`. Default: the first vowel. */
  at?: number
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
  /** Wrong tries by kind of mistake (Mehrzahl for now), for the parent's v2 stats. */
  mistakes?: Partial<Record<Mistake, number>>
}

/** Mehrzahl: vowel change missing (Hute), wrong ending (Hüten), or both (Hauten). */
export type Mistake = 'umlaut' | 'ending' | 'both'

export interface Dragon {
  id: string
  /** Dragon kind from `content/dragons.ts` (look and home land). */
  kind: string
  /** Typed by the child when the egg hatched. */
  name: string
  hatchedAt: number
  /** `Profile.rounds` at hatch time; growth counts rounds since then. */
  roundsAtHatch: number
}

export interface Profile {
  /** Set on first start (v1) or by the parent (v2). Never hard-coded. */
  childName: string
  /** All crystals ever earned. Only ever goes up. */
  crystals: number
  /** Crystals in the current egg (0 … EGG_COST). */
  eggCrystals: number
  /** Finished rounds, all lands. */
  rounds: number
  /** Dragon kind of an egg that is ready but not named yet; survives an app restart. */
  pendingHatch?: string
  /** Land of the last round, for the start button. */
  lastLand?: ExerciseType
  dragons: Dragon[]
  unlockedWorlds: ExerciseType[]
}
