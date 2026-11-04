import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { TEST_ITEMS } from '../content/test-items.ts'
import { _resetStore, load, mergeSeed, saveProfile, saveProgress } from './storage.ts'
import type { Item } from './types.ts'

let n = 0
beforeEach(() => _resetStore(`test-${n++}`))

describe('mergeSeed', () => {
  const parent: Item = { ...TEST_ITEMS[0], id: 'p1', source: 'parent' }
  it('updates seed items, keeps the active switch and parent items', () => {
    const stored = [{ ...TEST_ITEMS[0], active: false, hint: 'old' }, parent]
    const merged = mergeSeed(stored, TEST_ITEMS)
    expect(merged.find((i) => i.id === TEST_ITEMS[0].id)).toMatchObject({ active: false, hint: TEST_ITEMS[0].hint })
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
