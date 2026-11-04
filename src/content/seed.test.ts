// Checks the seed content against the rules the exercises rely on.

import { describe, expect, it } from 'vitest'
import { SEED } from './seed.ts'
import { gapParts, isSentence, lautOf, targetVowel, umlautChange, units } from '../engine/words.ts'
import type { ExerciseType } from '../engine/types.ts'

const of = (t: ExerciseType) => SEED.filter((i) => i.type === t)

describe('seed', () => {
  it('has unique ids and 150–200 items', () => {
    expect(new Set(SEED.map((i) => i.id)).size).toBe(SEED.length)
    expect(SEED.length).toBeGreaterThanOrEqual(150)
    expect(SEED.length).toBeLessThanOrEqual(200)
  })

  it('has enough items per exercise', () => {
    const laute = of('laute')
    expect(laute.filter((i) => !isSentence(i))).toHaveLength(13)
    expect(laute.filter(isSentence).length).toBeGreaterThanOrEqual(20)
    expect(of('mehrzahl').length).toBeGreaterThanOrEqual(40)
    expect(of('luecke').length).toBeGreaterThanOrEqual(40)
    expect(of('kurzlang').length).toBeGreaterThanOrEqual(30)
    expect(of('ie').length).toBeGreaterThanOrEqual(30)
  })

  it('Laute: every sound has a class, every sentence has all three', () => {
    for (const i of of('laute').filter((i) => !isSentence(i))) expect(lautOf(i.prompt)).toBe(i.answer)
    const kinds = new Set(of('laute').filter(isSentence).flatMap((i) => units(i.prompt).map((u) => u.laut)))
    expect([...kinds].sort()).toEqual(['Selbstlaut', 'Umlaut', 'Zwielaut', undefined].sort())
  })

  it('Mehrzahl: at least half are umlaut plurals, tagged by their vowel change', () => {
    const items = of('mehrzahl')
    for (const i of items) {
      expect(i.prompt).toMatch(/^(der|die|das) [A-ZÄÖÜ]/)
      expect(!!umlautChange(i.prompt, i.answer)).toBe(!!i.tags?.includes('umlaut-plural'))
    }
    expect(items.filter((i) => i.tags?.includes('umlaut-plural')).length * 2).toBeGreaterThanOrEqual(items.length)
  })

  it('Lücke: one gap, filled by a vowel, umlaut or group', () => {
    for (const i of of('luecke')) {
      expect(i.prompt.split('_')).toHaveLength(2)
      expect(['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü', 'ie', 'ei', 'ai', 'au', 'eu', 'äu']).toContain(i.answer)
      expect(i.prompt.startsWith('_')).toBe(false) // a capital gap would need a capital answer
      expect(gapParts(i.prompt).join(i.answer)).toMatch(/^[A-ZÄÖÜ][a-zäöüß]+$/)
    }
  })

  it('Kurz/lang: answer is kurz or lang, ie and doubled vowels are long', () => {
    for (const i of of('kurzlang')) {
      expect(['kurz', 'lang']).toContain(i.answer)
      const v = targetVowel(i.prompt, i.at)
      if (v.len === 2) expect(i.answer).toBe('lang')
    }
  })

  it('ie: ie words plus short-i words to tell apart, each its own answer', () => {
    const items = of('ie')
    for (const i of items) {
      expect(i.answer).toBe(i.prompt)
      if (i.tags?.includes('short-i')) {
        expect(i.prompt).not.toContain('ie')
        expect(i.prompt.toLowerCase()).toContain('i')
      } else expect(i.prompt).toContain('ie')
    }
    expect(items.filter((i) => i.tags?.includes('short-i')).length).toBeGreaterThanOrEqual(10)
  })

  it('lists the school-test misses', () => {
    const missed = SEED.filter((i) => i.tags?.includes('missed-on-test')).map((i) => i.id)
    expect(missed.sort()).toEqual(
      ['mz-hut', 'mz-laus', 'mz-korb', 'mz-wand', 'lu-muetze', 'lu-birne', 'lu-kirsche', 'lu-koenig'].sort(),
    )
  })
})
