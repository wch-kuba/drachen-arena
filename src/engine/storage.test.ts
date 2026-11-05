import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { TEST_ITEMS } from '../content/test-items.ts'
import { createStore, set } from 'idb-keyval'
import { _resetStore, load, mergeSeed, saveProfile, saveProgress } from './storage.ts'
import type { Item } from './types.ts'

let n = 0
let name = ''
beforeEach(() => {
  name = `test-${n++}`
  _resetStore(name)
})

describe('mergeSeed', () => {
  const parent: Item = { ...TEST_ITEMS[0], id: 'p1', source: 'parent' }
  it('updates seed items, keeps the active switch and parent items', () => {
    const stored = [{ ...TEST_ITEMS[0], active: false, hint: 'old' }, parent]
    const merged = mergeSeed(stored, TEST_ITEMS)
    expect(merged.find((i) => i.id === TEST_ITEMS[0].id)).toMatchObject({ active: false, prompt: TEST_ITEMS[0].prompt })
    expect(merged.find((i) => i.id === TEST_ITEMS[0].id)?.hint).toBe(TEST_ITEMS[0].hint)
    expect(merged.find((i) => i.id === 'p1')).toBeTruthy()
    expect(merged).toHaveLength(TEST_ITEMS.length + 1)
  })
})

describe('load', () => {
  it('seeds on first run and keeps progress across restarts and seed updates', async () => {
    const first = await load(TEST_ITEMS)
    expect(first.items).toHaveLength(TEST_ITEMS.length)
    expect(first.profile.crystals).toBe(0)

    await saveProgress(TEST_ITEMS[0].id, { box: 3, lastSeen: 5, correct: 2, wrong: 0 })
    await saveProfile({ ...first.profile, crystals: 7 })

    const updatedSeed = TEST_ITEMS.map((i, k) => (k === 0 ? { ...i, hint: 'neu' } : i))
    const second = await load(updatedSeed)
    expect(second.progress[TEST_ITEMS[0].id].box).toBe(3)
    expect(second.profile.crystals).toBe(7)
    expect(second.items[0].hint).toBe('neu')
  })
})

describe('migrations', () => {
  it('keeps crystals and every land already played open', async () => {
    const s = createStore(name, 'kv')
    const played = TEST_ITEMS.find((i) => i.type === 'kurzlang')!
    await set('meta', { schema: 1 }, s)
    await set('items', TEST_ITEMS, s)
    await set('progress', { [played.id]: { box: 2, lastSeen: 9, correct: 1, wrong: 0 } }, s)
    await set(
      'profile',
      { childName: 'Kim', crystals: 230, points: 0, eggs: 0, eggProgress: 0, dragons: [], unlockedWorlds: ['laute', 'mehrzahl', 'luecke'] },
      s,
    )
    const { profile } = await load(TEST_ITEMS)
    expect(profile).toMatchObject({ childName: 'Kim', crystals: 230, goalCrystals: 30, rounds: 0 })
    expect(profile).not.toHaveProperty('eggCrystals')
    expect(profile.unlockedWorlds).toEqual(['mehrzahl', 'kurzlang'])
    expect(profile).not.toHaveProperty('points')
  })

  it('2 → 3 keeps each dragon at the stage it had and the egg crystals as goal crystals', async () => {
    const s = createStore(name, 'kv')
    await set('meta', { schema: 2 }, s)
    const d = (id: string, roundsAtHatch: number) => ({ id, kind: id, name: id, hatchedAt: 0, roundsAtHatch })
    await set(
      'profile',
      { childName: 'Kim', crystals: 400, eggCrystals: 64, rounds: 30, dragons: [d('perle', 0), d('wrack', 12), d('tang', 26)] },
      s,
    )
    const { profile } = await load(TEST_ITEMS)
    expect(profile.goalCrystals).toBe(64)
    expect(profile).not.toHaveProperty('eggCrystals')
    expect(profile.dragons.map((x) => x.stage)).toEqual(['grown', 'young', 'hatchling'])
    expect(profile.dragons[0]).not.toHaveProperty('roundsAtHatch')
  })

  it('starts a new child with only the first land open', async () => {
    const { profile } = await load(TEST_ITEMS)
    expect(profile.unlockedWorlds).toEqual(['mehrzahl'])
  })
})
