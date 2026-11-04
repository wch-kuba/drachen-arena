import { describe, expect, it } from 'vitest'
import { revealCount, startAttempt, submit } from './attempt.ts'
import { record } from './leitner.ts'
import type { Item } from './types.ts'
import { gapParts, indefinite, isSentence, lauteCode, lautOf, pluralMistake, targetVowel, umlautChange, units, wordOf } from './words.ts'

const item = (type: Item['type'], prompt: string, answer: string): Item => ({
  id: prompt,
  type,
  prompt,
  answer,
  source: 'seed',
  active: true,
})

describe('laute', () => {
  it('classifies single sounds', () => {
    expect(lautOf('a')).toBe('Selbstlaut')
    expect(lautOf('ei')).toBe('Zwielaut')
    expect(lautOf('äu')).toBe('Zwielaut')
    expect(lautOf('ü')).toBe('Umlaut')
    expect(lautOf('ie')).toBeUndefined()
  })
  it('groups Zwielaute as one unit and keeps ie as two Selbstlaute', () => {
    expect(units('Die Maus').map((u) => [u.at, u.len, u.laut ?? '-'])).toEqual([
      [0, 1, '-'], [1, 1, 'Selbstlaut'], [2, 1, 'Selbstlaut'], [3, 1, '-'],
      [4, 1, '-'], [5, 2, 'Zwielaut'], [7, 1, '-'],
    ])
  })
  it('encodes the coloring of a sentence', () => {
    expect(lauteCode('Die Mäuse')).toBe('.ss..zz.s')
    expect(lauteCode('Ein Bär')).toBe('zz...u.')
  })
  it('tells the sentence mode by its answer', () => {
    expect(isSentence(item('laute', 'ei', 'Zwielaut'))).toBe(false)
    expect(isSentence(item('laute', 'Die Maus', lauteCode('Die Maus')))).toBe(true)
  })
})

describe('words', () => {
  it('picks ein or eine from the article', () => {
    expect(indefinite('der Hut')).toBe('ein')
    expect(indefinite('das Haus')).toBe('ein')
    expect(indefinite('die Hand')).toBe('eine')
    expect(indefinite('Hand')).toBe('ein')
  })

  it('finds the vowel to judge', () => {
    expect(targetVowel('Schaf')).toEqual({ at: 3, len: 1 })
    expect(targetVowel('Biene')).toEqual({ at: 1, len: 2 })
    expect(targetVowel('Boot')).toEqual({ at: 1, len: 2 })
    expect(targetVowel('Banane', 3)).toEqual({ at: 3, len: 1 })
  })
  it('splits a gap word and rebuilds it', () => {
    expect(gapParts('M_tze')).toEqual(['M', 'tze'])
    expect(wordOf(item('luecke', 'Z_ge', 'ie'))).toBe('Ziege')
  })
  it('finds the umlaut change of a plural', () => {
    expect(umlautChange('der Hut', 'Hüte')).toEqual({ from: 'u', to: 'ü', at: 1 })
    expect(umlautChange('die Laus', 'Läuse')).toEqual({ from: 'au', to: 'äu', at: 1 })
    expect(umlautChange('der Hund', 'Hunde')).toBeUndefined()
  })
  it('sorts plural mistakes', () => {
    expect(pluralMistake('Hute', 'Hüte')).toBe('umlaut')
    expect(pluralMistake('Hüten', 'Hüte')).toBe('ending')
    expect(pluralMistake('Hauten', 'Hüte')).toBe('both')
    expect(pluralMistake('Lausen', 'Läuse')).toBe('both')
    expect(pluralMistake('Hunden', 'Hunde')).toBe('ending')
  })
  it('records plural mistakes per item', () => {
    const hut = item('mehrzahl', 'der Hut', 'Hüte')
    let a = submit(startAttempt(), hut, 'Hauten')
    a = submit(a, hut, 'Hute')
    expect(a.mistakes).toEqual(['both', 'umlaut'])
    const p = record(record(undefined, false, 1, 'Hauten', a.mistakes), false, 2, 'Hute', ['umlaut'])
    expect(p.mistakes).toEqual({ both: 1, umlaut: 2 })
  })
  it('reveals the first letter for ie words and letter-group gaps', () => {
    expect(revealCount(item('ie', 'Biene', 'Biene'))).toBe(1)
    expect(revealCount(item('luecke', 'Z_ge', 'ie'))).toBe(1)
    expect(revealCount(item('luecke', 'M_tze', 'ü'))).toBe(0)
    expect(revealCount(item('kurzlang', 'Schaf', 'lang'))).toBe(0)
  })
})
