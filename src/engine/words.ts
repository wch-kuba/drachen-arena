// Word knowledge the exercises share: vowel classes, the target vowel, gaps and umlaut plurals.
// Pure functions over German text, so exercise content stays plain strings.

import { normalize } from './check.ts'
import type { Item, Mistake } from './types.ts'

export type Laut = 'Selbstlaut' | 'Zwielaut' | 'Umlaut'
export const LAUTE: Laut[] = ['Selbstlaut', 'Zwielaut', 'Umlaut']

const ZWIELAUTE = ['au', 'äu', 'ei', 'eu', 'ai']
const SELBSTLAUTE = 'aeiou'
const UMLAUTE = 'äöü'

/** One letter or letter group in a text: its position (in code points), length and class. */
export interface Unit {
  at: number
  len: number
  laut?: Laut
}

/**
 * Split a sentence into units the child can tap. A Zwielaut is one unit of two letters;
 * every other letter is its own unit. "ie" counts as two Selbstlaute, as in the school test.
 */
export function units(text: string): Unit[] {
  const ch = [...normalize(text).toLowerCase()]
  const out: Unit[] = []
  for (let i = 0; i < ch.length; i++) {
    const pair = ch[i] + (ch[i + 1] ?? '')
    if (ZWIELAUTE.includes(pair)) {
      out.push({ at: i, len: 2, laut: 'Zwielaut' })
      i++
    } else if (SELBSTLAUTE.includes(ch[i])) out.push({ at: i, len: 1, laut: 'Selbstlaut' })
    else if (UMLAUTE.includes(ch[i])) out.push({ at: i, len: 1, laut: 'Umlaut' })
    else out.push({ at: i, len: 1 })
  }
  return out
}

/** The class of a single letter or group ("ei" → Zwielaut), for the one-sound mode. */
export function lautOf(group: string): Laut | undefined {
  const u = units(group)
  return u.length === 1 ? u[0].laut : undefined
}

/** One code letter per letter of the text: s/z/u for the three classes, "." for anything else. */
const CODE: Record<Laut, string> = { Selbstlaut: 's', Zwielaut: 'z', Umlaut: 'u' }
export const CODE_LAUT: Record<string, Laut> = { s: 'Selbstlaut', z: 'Zwielaut', u: 'Umlaut' }

/** Encode a coloring (letter index → class) as a string the engine can compare like an answer. */
export function encode(length: number, paint: (i: number) => Laut | undefined): string {
  return Array.from({ length }, (_, i) => {
    const l = paint(i)
    return l ? CODE[l] : '.'
  }).join('')
}

/** The right coloring of a whole sentence (the answer of a sentence item). */
export function lauteCode(sentence: string): string {
  const by = new Map<number, Laut>()
  for (const u of units(sentence)) if (u.laut) for (let k = 0; k < u.len; k++) by.set(u.at + k, u.laut)
  return encode([...normalize(sentence)].length, (i) => by.get(i))
}

/** A Laute item is the sentence mode when its answer is a coloring, not a class name. */
export const isSentence = (item: Item) => item.type === 'laute' && !LAUTE.includes(item.answer as Laut)

/** Kurz oder lang: the vowel (or ie / doubled vowel) to judge. */
export function targetVowel(word: string, at?: number): { at: number; len: number } {
  const w = [...word.toLowerCase()].join('')
  if (at !== undefined) {
    const two = w.slice(at, at + 2)
    return { at, len: two === 'ie' || /^(aa|ee|oo)$/.test(two) ? 2 : 1 }
  }
  const m = /aa|ee|oo|ie|[aeiouäöü]/.exec(w)
  return m ? { at: m.index, len: m[0].length } : { at: 0, len: 0 }
}

/** Fehlende Buchstaben: "M_tze" → ["M", "tze"]. */
export function gapParts(prompt: string): [string, string] {
  const i = prompt.indexOf('_')
  return i < 0 ? [prompt, ''] : [prompt.slice(0, i), prompt.slice(i + 1)]
}

/** The whole word of an item, as it is spoken. */
export function wordOf(item: Item): string {
  if (item.type === 'luecke') return gapParts(item.prompt).join(item.answer)
  return item.prompt
}

/** "der Hut" → "Hut". */
export const withoutArticle = (s: string) => normalize(s).replace(/^(der|die|das)\s+/i, '')

/** The indefinite article for "der/die/das Nomen": eine for die, ein for der and das. */
export const indefinite = (s: string) => (/^die\s/i.test(normalize(s)) ? 'eine' : 'ein')

const PLAIN: Record<string, string> = { ä: 'a', ö: 'o', ü: 'u' }
const plain = (s: string) => s.replace(/[äöü]/g, (c) => PLAIN[c]).replace(/[ÄÖÜ]/g, (c) => PLAIN[c.toLowerCase()].toUpperCase())

/**
 * The vowel change from singular to plural: Hut → Hüte gives { from: "u", to: "ü", at: 1 }
 * (`at` = index in the plural). Laus → Läuse gives au → äu.
 */
export function umlautChange(singular: string, plural: string): { from: string; to: string; at: number } | undefined {
  const s = [...withoutArticle(singular)]
  const p = [...normalize(plural)]
  const at = p.findIndex((c, i) => /[äöüÄÖÜ]/.test(c) && s[i] && plain(c).toLowerCase() === s[i].toLowerCase())
  if (at < 0) return undefined
  const toAu = p[at].toLowerCase() === 'ä' && p[at + 1]?.toLowerCase() === 'u' && s[at + 1]?.toLowerCase() === 'u'
  const len = toAu ? 2 : 1
  return { from: s.slice(at, at + len).join('').toLowerCase(), to: p.slice(at, at + len).join('').toLowerCase(), at }
}

/** What kind of wrong plural the child typed (for the parent's stats). */
export function pluralMistake(typed: string, plural: string): Mistake {
  const t = normalize(typed).toLowerCase()
  const a = normalize(plural).toLowerCase()
  if (!/[äöü]/.test(a)) return 'ending'
  if (t === plain(a)) return 'umlaut'
  const umlauts = (s: string) => s.replace(/[^äöü]/g, '')
  return umlauts(t) === umlauts(a) ? 'ending' : 'both'
}
