// The reward loop (plan/v1-06-rewards.md). Pure functions on the profile; the game hook saves.
// Nothing is ever taken away: crystals, dragons, growth and open lands only go up.
// One goal at a time, always filled with crystals:
//   egg      → STEP_COST crystals, then the child names the baby dragon
//   feeding  → the newest dragon grows hatchling → young → grown, STEP_COST crystals a step
//   grown    → it finds the next egg
//   item done → 3 / 2 / 1 crystals (attempt.ts); round done → +ROUND_BONUS
// Every step (hatch, young, grown) opens the next land.

import { DRAGONS } from '../content/dragons.ts'
import type { Dragon, ExerciseType, Profile } from './types.ts'

/** Crystals for each step: the egg, and each growth step after it. */
export const STEP_COST = 100
export const ROUND_BONUS = 10

/** Mehrzahl first: umlaut plurals are the child's biggest gap. One more land per step. */
export const UNLOCK_ORDER: ExerciseType[] = ['mehrzahl', 'luecke', 'ie', 'laute', 'kurzlang']

export const STAGES = ['hatchling', 'young', 'grown'] as const
export type Stage = (typeof STAGES)[number]

export function addCrystals(p: Profile, n: number): Profile {
  return { ...p, crystals: p.crystals + n, goalCrystals: p.goalCrystals + n }
}

/** The dragon being fed: the newest one, while it still grows. */
export const growing = (p: Profile): Dragon | undefined => {
  const d = p.dragons.at(-1)
  return d && d.stage !== 'grown' ? d : undefined
}

/** The dragon in the next egg: the next unfound one in roster order (land dragons first). */
export function pickDragon(p: Profile): string | undefined {
  const found = new Set(p.dragons.map((d) => d.kind))
  if (p.pendingHatch) found.add(p.pendingHatch)
  return DRAGONS.find((d) => !found.has(d.id))?.id
}

/** The dragon in the egg, so the egg can show its colors. With every dragon found, the last one. */
export const eggKind = (p: Profile): string => p.pendingHatch ?? pickDragon(p) ?? DRAGONS[DRAGONS.length - 1].id

/** What the crystals fill now. `done` when all dragons are found and grown (until v2 adds more). */
export type Goal = { egg: string } | { dragon: Dragon } | { done: true }

export function goalOf(p: Profile): Goal {
  const d = growing(p)
  if (d) return { dragon: d }
  if (p.pendingHatch) return { egg: p.pendingHatch }
  const kind = pickDragon(p)
  return kind ? { egg: kind } : { done: true }
}

/** The next land to open, if any. */
export const nextLand = (p: Profile): ExerciseType | undefined =>
  UNLOCK_ORDER.find((l) => !p.unlockedWorlds.includes(l))

const openNext = (p: Profile): Profile => {
  const open = nextLand(p)
  return open ? { ...p, unlockedWorlds: [...p.unlockedWorlds, open] } : p
}

/**
 * After a finished round: bonus and round count, then at most one step if the goal is full:
 * the fed dragon grows (a land opens, the growth waits to be shown), or the egg is ready.
 * While a step waits to be shown, no further step is taken.
 */
export function endRound(p: Profile, land: ExerciseType): Profile {
  const q: Profile = { ...addCrystals(p, ROUND_BONUS), rounds: p.rounds + 1, lastLand: land }
  if (q.pendingHatch || q.pendingGrowth || q.goalCrystals < STEP_COST) return q
  const goal = goalOf(q)
  if ('dragon' in goal) {
    const d = goal.dragon
    const stage = STAGES[STAGES.indexOf(d.stage) + 1]
    const opened = nextLand(q)
    return openNext({
      ...q,
      goalCrystals: q.goalCrystals - STEP_COST,
      dragons: q.dragons.map((x) => (x.id === d.id ? { ...x, stage } : x)),
      pendingGrowth: { id: d.id, land: opened },
    })
  }
  // All dragons found and grown: the crystals stay until v2 adds more.
  if ('done' in goal) return q
  return { ...q, goalCrystals: q.goalCrystals - STEP_COST, pendingHatch: goal.egg }
}

/** The child named the dragon in the ready egg. Opens the next land. */
export function hatch(p: Profile, name: string, now: number): Profile {
  if (!p.pendingHatch) return p
  const dragon: Dragon = { id: `d${now}`, kind: p.pendingHatch, name: name.trim(), hatchedAt: now, stage: 'hatchling' }
  return openNext({ ...p, pendingHatch: undefined, dragons: [...p.dragons, dragon] })
}

export const isUnlocked = (p: Profile, land: ExerciseType) => p.unlockedWorlds.includes(land)

/** Crystals still needed for the current goal (0 when it is full). */
export const goalLeft = (p: Profile) => Math.max(0, STEP_COST - p.goalCrystals)

/** The child has seen the growth moment. */
export const seeGrowth = (p: Profile): Profile => ({ ...p, pendingGrowth: undefined })

/** The stage a dragon had before its last growth step. */
export const stageBefore = (s: Stage): Stage => STAGES[Math.max(0, STAGES.indexOf(s) - 1)]
