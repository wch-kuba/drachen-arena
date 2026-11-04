import { describe, expect, it } from 'vitest'
import { DRAGONS } from '../content/dragons.ts'
import { emptyProfile } from './storage.ts'
import {
  EGG_COST,
  ROUND_BONUS,
  UNLOCK_ORDER,
  addCrystals,
  dragonOfTheDay,
  eggKind,
  endRound,
  hatch,
  roundsToGrow,
  stageOf,
} from './rewards.ts'
import type { Profile } from './types.ts'

/** Play one round of 10 items, each worth `per` crystals. */
const play = (p: Profile, per: number, land = UNLOCK_ORDER[0]) => {
  for (let i = 0; i < 10; i++) p = addCrystals(p, per)
  return endRound(p, land)
}

const roundsToEgg = (per: number) => {
  let p = emptyProfile()
  let n = 0
  while (!p.pendingHatch) {
    p = play(p, per)
    n++
  }
  return n
}

describe('egg', () => {
  it('needs 3 perfect rounds and at most 5 rounds when every answer was shown', () => {
    expect(roundsToEgg(3)).toBe(3)
    expect(roundsToEgg(1)).toBe(5)
  })

  it('carries extra crystals into the next egg', () => {
    const p = play(play(play(emptyProfile(), 3), 3), 3)
    expect(p.eggCrystals).toBe(3 * (30 + ROUND_BONUS) - EGG_COST)
    expect(p.crystals).toBe(3 * (30 + ROUND_BONUS))
  })

  it('holds one ready egg at a time and never loses crystals', () => {
    let p = { ...emptyProfile(), eggCrystals: 250 }
    p = endRound(p, 'mehrzahl')
    expect(p.pendingHatch).toBeDefined()
    const after = endRound(p, 'mehrzahl')
    expect(after.pendingHatch).toBe(p.pendingHatch)
    expect(after.eggCrystals).toBe(p.eggCrystals + ROUND_BONUS)
  })
})

describe('hatch', () => {
  it("gives the land's own dragon first, then the roster in order", () => {
    let p: Profile = { ...emptyProfile(), eggCrystals: EGG_COST }
    p = endRound(p, 'luecke')
    expect(p.pendingHatch).toBe(DRAGONS.find((d) => d.land === 'luecke')!.id)
    p = hatch(p, 'Funkel', 1)
    p = endRound({ ...p, eggCrystals: EGG_COST }, 'luecke')
    expect(p.pendingHatch).toBe(DRAGONS.find((d) => d.id !== 'wrack')!.id)
  })

  it('names the dragon and opens the next land in order', () => {
    let p = emptyProfile()
    expect(p.unlockedWorlds).toEqual(['mehrzahl'])
    for (const [k, land] of UNLOCK_ORDER.slice(1).entries()) {
      p = hatch(endRound({ ...p, eggCrystals: EGG_COST }, 'mehrzahl'), ` Drache${k} `, k)
      expect(p.unlockedWorlds.at(-1)).toBe(land)
    }
    expect(p.dragons.map((d) => d.name)).toEqual(['Drache0', 'Drache1', 'Drache2', 'Drache3'])
    expect(p.pendingHatch).toBeUndefined()
  })

  it('does nothing without a ready egg', () => {
    const p = emptyProfile()
    expect(hatch(p, 'X', 1)).toBe(p)
  })

  it('keeps a full egg when every dragon is found', () => {
    const dragons = DRAGONS.map((d, i) => ({ id: `${i}`, kind: d.id, name: 'X', hatchedAt: 0, roundsAtHatch: 0 }))
    const p = endRound({ ...emptyProfile(), dragons, eggCrystals: EGG_COST }, 'mehrzahl')
    expect(p.pendingHatch).toBeUndefined()
    expect(p.eggCrystals).toBe(EGG_COST + ROUND_BONUS)
  })
})

describe('growth', () => {
  const d = { id: 'd', kind: 'perle', name: 'Funkel', hatchedAt: 0, roundsAtHatch: 4 }
  it('grows with rounds since hatching and never shrinks', () => {
    expect(stageOf(d, 4)).toBe('hatchling')
    expect(roundsToGrow(d, 4)).toBe(10)
    expect(stageOf(d, 14)).toBe('young')
    expect(roundsToGrow(d, 20)).toBe(9)
    expect(stageOf(d, 29)).toBe('grown')
    expect(stageOf(d, 999)).toBe('grown')
    expect(roundsToGrow(d, 29)).toBeUndefined()
  })
})

describe('dragonOfTheDay', () => {
  it('takes turns by day', () => {
    const p = hatch(endRound({ ...emptyProfile(), eggCrystals: EGG_COST }, 'mehrzahl'), 'A', 0)
    expect(dragonOfTheDay(emptyProfile(), 0)).toBeUndefined()
    expect(dragonOfTheDay(p, 5 * 86_400_000)?.name).toBe('A')
  })

  it('shows the egg as the dragon that will hatch, whatever open land is played', () => {
    let p = emptyProfile()
    for (let n = 0; n < DRAGONS.length; n++) {
      const shown = eggKind(p)
      for (const land of p.unlockedWorlds) {
        let q = p
        while (!q.pendingHatch) q = play(q, 3, land)
        expect(q.pendingHatch).toBe(shown)
      }
      while (!p.pendingHatch) p = play(p, 3, p.unlockedWorlds.at(-1))
      p = hatch(p, `D${n}`, n)
    }
  })
})
