import { describe, expect, it } from 'vitest'
import { TEST_ITEMS } from '../content/test-items.ts'
import { crystalsFor, revealCount, startAttempt, submit } from './attempt.ts'
import { check } from './check.ts'
import { BOX_INTERVAL, pickRound, record } from './leitner.ts'
import { answer, next, roundCrystals, startRound } from './round.ts'
import type { Item, Progress } from './types.ts'

const item = (answer: string, prompt = 'der Hut'): Item => ({
  id: answer,
  type: 'mehrzahl',
  prompt,
  answer,
  source: 'seed',
  active: true,
})

describe('check', () => {
  it('accepts an exact answer', () => expect(check('Hüte', 'Hüte').kind).toBe('right'))
  it('trims and normalizes Unicode', () => {
    expect(check('  Hüte ', 'Hüte').kind).toBe('right')
  })
  it('flags a lowercase noun as almost right', () => {
    expect(check('hüte', 'Hüte')).toEqual({ kind: 'almost', reason: 'noun-case', flag: [0] })
  })
  it('flags other capital mistakes', () => {
    expect(check('HÜTE', 'Hüte')).toMatchObject({ kind: 'almost', reason: 'case', flag: [1, 2, 3] })
  })
  it('accepts and strips an article', () => {
    expect(check('die Hüte', 'Hüte').kind).toBe('right')
    expect(check('Die hüte', 'Hüte').kind).toBe('almost')
  })
  it('rejects wrong spelling', () => expect(check('Hauten', 'Hüte').kind).toBe('wrong'))
})

describe('attempt and hints', () => {
  const hut = item('Hüte')
  it('grows the hint with each wrong try, up to the full answer', () => {
    let a = startAttempt()
    a = submit(a, hut, 'Hute')
    expect(a.hint).toBe(1)
    a = submit(a, hut, 'Hüten')
    expect(a.hint).toBe(2)
    a = submit(a, hut, 'Hauten')
    expect(a.hint).toBe(3)
    expect(a.lastWrong).toBe('Hauten')
    a = submit(a, hut, 'Hüte')
    expect(a.done).toBe(true)
    expect(crystalsFor(a)).toBe(1)
  })
  it('almost right is not a wrong try', () => {
    let a = submit(startAttempt(), hut, 'hüte')
    expect(a.wrongs).toBe(0)
    a = submit(a, hut, 'Hüte')
    expect(crystalsFor(a)).toBe(3)
  })
  it('reveals up to the changed vowel, at most half the word', () => {
    expect(revealCount(item('Hüte'))).toBe(2)
    expect(revealCount(item('Körbe', 'der Korb'))).toBe(2)
    expect(revealCount(item('Hunde', 'der Hund'))).toBe(2)
    expect(revealCount(item('ü', 'M_tze'))).toBe(0)
  })
})

describe('leitner', () => {
  const now = 100 * 24 * 60 * 60 * 1000
  it('moves up on first try, back to box 1 on a wrong try', () => {
    const p = record(undefined, true, now)
    expect(p.box).toBe(2)
    expect(record({ ...p, box: 4 }, false, now, 'Hute')).toMatchObject({ box: 1, wrong: 1, lastWrong: 'Hute' })
    expect(record({ ...p, box: 5 }, true, now).box).toBe(5)
  })

  it('picks due items first, then low boxes, then new ones', () => {
    const items = TEST_ITEMS.filter((i) => i.type === 'mehrzahl')
    const progress: Record<string, Progress> = {}
    // 3 due (box 3, rested longer than 3 days), 2 low not due, 5 resting high.
    items.slice(0, 3).forEach((i) => (progress[i.id] = { box: 3, lastSeen: now - BOX_INTERVAL[3] - 1, correct: 1, wrong: 0 }))
    items.slice(3, 5).forEach((i) => (progress[i.id] = { box: 2, lastSeen: now - 1000, correct: 1, wrong: 0 }))
    items.slice(5, 10).forEach((i) => (progress[i.id] = { box: 5, lastSeen: now - 1000, correct: 4, wrong: 0 }))
    const round = pickRound(items, progress, 'mehrzahl', now)
    const ids = new Set(round.map((i) => i.id))
    expect(round).toHaveLength(10)
    for (const i of items.slice(0, 5)) expect(ids.has(i.id)).toBe(true)
    for (const i of items.slice(10)) expect(ids.has(i.id)).toBe(true) // the 2 new ones
  })

  it('puts tagged mistakes first among new items', () => {
    const plain = TEST_ITEMS.filter((i) => i.type === 'mehrzahl').map((i) => ({ ...i, tags: [] }))
    const missed = { ...plain[0], id: 'missed', tags: ['missed-on-test'] }
    const umlaut = { ...plain[1], id: 'umlaut', tags: ['umlaut-plural'] }
    const items = [...plain.slice(2), umlaut, missed]
    for (let k = 0; k < 20; k++) {
      const ids = pickRound(items, {}, 'mehrzahl', now, 2).map((i) => i.id)
      expect(ids.sort()).toEqual(['missed', 'umlaut'])
    }
  })

  it('skips inactive items and other types', () => {
    const items = [{ ...TEST_ITEMS[0], active: false }, { ...TEST_ITEMS[1], type: 'ie' as const }, TEST_ITEMS[2]]
    expect(pickRound(items, {}, 'mehrzahl', now).map((i) => i.id)).toEqual([TEST_ITEMS[2].id])
  })
})

describe('round', () => {
  it('runs 10 items end to end and counts crystals', () => {
    let r = startRound(TEST_ITEMS.slice(0, 10))
    const finished = []
    for (let k = 0; k < 10; k++) {
      const it = r.items[r.index]
      if (k === 0) r = answer(r, 'Falsch').round // one hint on the first item
      const res = answer(r, it.answer)
      r = res.round
      finished.push(res.finished)
      r = next(r)
    }
    expect(finished.every(Boolean)).toBe(true)
    expect(roundCrystals(r)).toBe(2 + 9 * 3)
    expect(r.index).toBe(10)
  })
})

describe('spoken texts', async () => {
  const { spokenTexts, askParts } = await import('../content/speech.ts')
  it('lists every instruction, prompt and answer once', () => {
    const texts = spokenTexts(TEST_ITEMS)
    expect(texts).toContain('Schreib die Mehrzahl.')
    expect(texts).toContain('der Hut')
    expect(texts).toContain('Hüte')
    expect(texts).toContain('Tipp: Aus u wird ü.')
    expect(texts).toContain('Mütze')
    expect(texts).not.toContain('Hut')
    expect(new Set(texts).size).toBe(texts.length)
    for (const p of askParts(TEST_ITEMS[0])) expect(texts).toContain(p)
  })

  it('splits narrator lines from words', async () => {
    const { spokenRoles } = await import('../content/speech.ts')
    const { narrator, words } = spokenRoles(TEST_ITEMS)
    expect(narrator).toContain('Schreib die Mehrzahl.')
    expect(narrator).toContain('Tipp: Aus u wird ü.')
    expect(narrator).toContain('Stark gemacht!')
    expect(words).toContain('der Hut')
    expect(words).toContain('Hüte')
    expect(words).toContain('Mütze')
    expect(words).toContain('ei')
    expect(words.some((w) => narrator.includes(w))).toBe(false)
  })
})
