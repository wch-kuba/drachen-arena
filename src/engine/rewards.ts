// The reward loop (plan/v1-06-rewards.md). Pure functions on the profile; the game hook saves.
// Nothing is ever taken away: crystals, dragons, growth and open lands only go up.
//   item done   → 3 / 2 / 1 crystals (attempt.ts), into the total and the egg
//   round done  → +ROUND_BONUS, so effort always counts; a full egg is ready to hatch
//   hatch       → the child names the dragon, the next land opens
//   growth      → hatchling, young after GROWTH.young rounds, grown after GROWTH.grown

import { DRAGONS } from '../content/dragons.ts'
import type { Dragon, ExerciseType, Profile } from './types.ts'

export const EGG_COST = 100
export const ROUND_BONUS = 10
export const GROWTH = { young: 10, grown: 25 } as const

/** Mehrzahl first: umlaut plurals are the child's biggest gap. One more land per hatch. */
export const UNLOCK_ORDER: ExerciseType[] = ['mehrzahl', 'luecke', 'ie', 'laute', 'kurzlang']

export type Stage = 'hatchling' | 'young' | 'grown'

export function addCrystals(p: Profile, n: number): Profile {
  return { ...p, crystals: p.crystals + n, eggCrystals: p.eggCrystals + n }
}

/** The dragon in the next egg: the land's own dragon if still unfound, else the next in order. */
export function pickDragon(p: Profile, land: ExerciseType): string | undefined {
  const found = new Set(p.dragons.map((d) => d.kind))
  if (p.pendingHatch) found.add(p.pendingHatch)
  const own = DRAGONS.find((d) => d.land === land && !found.has(d.id))
  return (own ?? DRAGONS.find((d) => !found.has(d.id)))?.id
}

/**
 * The dragon in the egg being filled now, so the egg can show its colors before it hatches.
 * Lands open in DRAGONS order, so pickDragon gives the same dragon whatever land is played.
 * With every dragon found, the full egg shows the last one.
 */
export const eggKind = (p: Profile): string =>
  p.pendingHatch ?? pickDragon(p, p.lastLand ?? UNLOCK_ORDER[0]) ?? DRAGONS[DRAGONS.length - 1].id

/** After a finished round: bonus, round count, and a ready egg if it is full. */
export function endRound(p: Profile, land: ExerciseType): Profile {
  let q: Profile = { ...addCrystals(p, ROUND_BONUS), rounds: p.rounds + 1, lastLand: land }
  if (!q.pendingHatch && q.eggCrystals >= EGG_COST) {
    const kind = pickDragon(q, land)
    // All dragons found: the egg stays full (and keeps its crystals) until v2 adds more.
    if (kind) q = { ...q, eggCrystals: q.eggCrystals - EGG_COST, pendingHatch: kind }
  }
  return q
}

/** The next land to open, if any. */
export const nextLand = (p: Profile): ExerciseType | undefined =>
  UNLOCK_ORDER.find((l) => !p.unlockedWorlds.includes(l))

/** The child named the dragon in the ready egg. Opens the next land. */
export function hatch(p: Profile, name: string, now: number): Profile {
  if (!p.pendingHatch) return p
  const dragon: Dragon = {
    id: `d${now}`,
    kind: p.pendingHatch,
    name: name.trim(),
    hatchedAt: now,
    roundsAtHatch: p.rounds,
  }
  const open = nextLand(p)
  return {
    ...p,
    pendingHatch: undefined,
    dragons: [...p.dragons, dragon],
    unlockedWorlds: open ? [...p.unlockedWorlds, open] : p.unlockedWorlds,
  }
}

export const isUnlocked = (p: Profile, land: ExerciseType) => p.unlockedWorlds.includes(land)

export function stageOf(d: Dragon, rounds: number): Stage {
  const since = rounds - d.roundsAtHatch
  return since >= GROWTH.grown ? 'grown' : since >= GROWTH.young ? 'young' : 'hatchling'
}

/** Rounds until the dragon grows again; undefined when it is fully grown. */
export function roundsToGrow(d: Dragon, rounds: number): number | undefined {
  const since = rounds - d.roundsAtHatch
  if (since < GROWTH.young) return GROWTH.young - since
  if (since < GROWTH.grown) return GROWTH.grown - since
  return undefined
}

/** Shown on the round summary: one dragon per day, in turn. */
export function dragonOfTheDay(p: Profile, now: number): Dragon | undefined {
  if (!p.dragons.length) return undefined
  const day = Math.floor(now / 86_400_000)
  return p.dragons[day % p.dragons.length]
}
