import { describe, expect, it } from 'vitest'
import { DRAGONS } from '../content/dragons.ts'
import { emptyProfile } from './storage.ts'
import {
  ROUND_BONUS,
  STEP_COST,
  UNLOCK_ORDER,
  addCrystals,
  eggKind,
  endRound,
  goalLeft,
  goalOf,
  growing,
  hatch,
  seeGrowth,
  stageBefore,
} from './rewards.ts'
import type { Profile } from './types.ts'

/** Play one round of 10 items, each worth `per` crystals. */
const play = (p: Profile, per: number, land = UNLOCK_ORDER[0]) => {
  for (let i = 0; i < 10; i++) p = addCrystals(p, per)
  return endRound(p, land)
}

/** Rounds until the goal takes a step (egg ready or dragon grown). */
const roundsToStep = (p: Profile, per: number) => {
  const before = JSON.stringify([p.pendingHatch, p.dragons])
  let n = 0
  while (JSON.stringify([p.pendingHatch, p.dragons]) === before) {
    p = play(p, per)
    n++
  }
  return { p, n }
}

const withDragon = (stage: 'hatchling' | 'young' | 'grown'): Profile => ({
  ...emptyProfile(),
  dragons: [{ id: 'd', kind: 'perle', name: 'Funkel', hatchedAt: 0, stage }],
  unlockedWorlds: ['mehrzahl', 'luecke'],
})

describe('egg', () => {
  it('needs 3 perfect rounds and at most 5 rounds when every answer was shown', () => {
    expect(roundsToStep(emptyProfile(), 3).n).toBe(3)
    expect(roundsToStep(emptyProfile(), 1).n).toBe(5)
  })

  it('carries extra crystals into the next goal', () => {
    const p = play(play(play(emptyProfile(), 3), 3), 3)
    expect(p.goalCrystals).toBe(3 * (30 + ROUND_BONUS) - STEP_COST)
    expect(p.crystals).toBe(3 * (30 + ROUND_BONUS))
  })

  it('holds one ready egg at a time and never loses crystals', () => {
    let p = { ...emptyProfile(), goalCrystals: 250 }
    p = endRound(p, 'mehrzahl')
    expect(p.pendingHatch).toBeDefined()
    const after = endRound(p, 'mehrzahl')
    expect(after.pendingHatch).toBe(p.pendingHatch)
    expect(after.goalCrystals).toBe(p.goalCrystals + ROUND_BONUS)
  })

  it('hatches the roster in order, land dragons first, whatever land is played', () => {
    let p = emptyProfile()
    for (const [n, d] of DRAGONS.entries()) {
      expect(eggKind(p)).toBe(d.id)
      p = { ...p, goalCrystals: STEP_COST }
      p = endRound(p, UNLOCK_ORDER[n % UNLOCK_ORDER.length])
      expect(p.pendingHatch).toBe(d.id)
      p = hatch(p, `D${n}`, n)
      p = { ...p, dragons: p.dragons.map((x) => ({ ...x, stage: 'grown' as const })) }
    }
    expect(DRAGONS.slice(0, 5).map((d) => d.land)).toEqual(UNLOCK_ORDER)
  })
})

describe('feeding', () => {
  it('fills an egg first, then the newest dragon until it is grown', () => {
    expect(goalOf(emptyProfile())).toEqual({ egg: DRAGONS[0].id })
    expect(goalOf(withDragon('hatchling'))).toMatchObject({ dragon: { name: 'Funkel' } })
    expect(goalOf(withDragon('young'))).toMatchObject({ dragon: { stage: 'young' } })
    expect(goalOf(withDragon('grown'))).toEqual({ egg: DRAGONS[1].id })
  })

  it('grows one step per STEP_COST crystals and opens a land each step', () => {
    let p = endRound({ ...withDragon('hatchling'), goalCrystals: STEP_COST - ROUND_BONUS }, 'mehrzahl')
    expect(p.dragons[0].stage).toBe('young')
    expect(p.goalCrystals).toBe(0)
    expect(p.unlockedWorlds).toEqual(['mehrzahl', 'luecke', 'ie'])
    p = endRound({ ...seeGrowth(p), goalCrystals: 2 * STEP_COST }, 'mehrzahl')
    expect(p.dragons[0].stage).toBe('grown')
    expect(p.unlockedWorlds.at(-1)).toBe('laute')
    // One step per round; the rest carries into the next egg.
    expect(p.pendingHatch).toBeUndefined()
    expect(p.goalCrystals).toBe(STEP_COST + ROUND_BONUS)
    expect(growing(p)).toBeUndefined()
  })

  it('takes 3–5 rounds for every step', () => {
    for (const stage of ['hatchling', 'young'] as const) {
      expect(roundsToStep(withDragon(stage), 3).n).toBe(3)
      expect(roundsToStep(withDragon(stage), 1).n).toBe(5)
    }
  })

  it('opens all five lands early in the second dragon', () => {
    let p = emptyProfile()
    let rounds = 0
    while (p.unlockedWorlds.length < UNLOCK_ORDER.length) {
      p = play(p, 3)
      rounds++
      if (p.pendingHatch) p = hatch(p, 'X', rounds)
      p = seeGrowth(p)
    }
    expect(p.dragons).toHaveLength(2)
    expect(rounds).toBeLessThanOrEqual(12)
  })

  it('keeps the crystals when every dragon is found and grown', () => {
    const dragons = DRAGONS.map((d, i) => ({ id: `${i}`, kind: d.id, name: 'X', hatchedAt: 0, stage: 'grown' as const }))
    const p = endRound({ ...emptyProfile(), dragons, goalCrystals: STEP_COST }, 'mehrzahl')
    expect(goalOf(p)).toEqual({ done: true })
    expect(p.pendingHatch).toBeUndefined()
    expect(p.goalCrystals).toBe(STEP_COST + ROUND_BONUS)
    expect(goalLeft(p)).toBe(0)
  })
})

describe('hatch', () => {
  it('names a baby dragon and opens the next land', () => {
    let p = endRound({ ...emptyProfile(), goalCrystals: STEP_COST }, 'mehrzahl')
    p = hatch(p, ' Funkel ', 1)
    expect(p.dragons).toEqual([{ id: 'd1', kind: DRAGONS[0].id, name: 'Funkel', hatchedAt: 1, stage: 'hatchling' }])
    expect(p.unlockedWorlds).toEqual(['mehrzahl', 'luecke'])
    expect(p.pendingHatch).toBeUndefined()
  })
})

describe('growth moment', () => {
  it('waits to be shown and takes no further step meanwhile', () => {
    let p = endRound({ ...withDragon('hatchling'), goalCrystals: STEP_COST }, 'mehrzahl')
    expect(p.pendingGrowth).toEqual({ id: 'd', land: 'ie' })
    expect(stageBefore(p.dragons[0].stage)).toBe('hatchling')
    p = endRound({ ...p, goalCrystals: 5 * STEP_COST }, 'mehrzahl')
    expect(p.dragons[0].stage).toBe('young')
    p = endRound(seeGrowth(p), 'mehrzahl')
    expect(p.dragons[0].stage).toBe('grown')
    expect(p.pendingGrowth).toEqual({ id: 'd', land: 'laute' })
  })
})
