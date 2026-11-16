// Every text the app can read aloud. scripts/gen-audio.ts turns each into a voice clip;
// the player looks clips up by the same key. Keep this the single source for spoken text.

import { normalize } from '../engine/check.ts'
import type { Item } from '../engine/types.ts'
import { becauseOf, isSentence, pearlVowel, singularChange, umlautChange, wordOf } from '../engine/words.ts'
import { ASK, ASK_GROUP, ASK_SATZ, DEFAULT_HINT, T, GENTLE, PRAISE } from '../strings.ts'

/** Clip lookup key: same text → same clip, regardless of stray spaces or Unicode form. */
export const speechKey = (text: string) => normalize(text)

/** The instruction for an item (sentence mode and letter-group gaps have their own). */
export function askOf(item: Item): string {
  if (isSentence(item)) return ASK_SATZ
  if (item.type === 'luecke' && [...item.answer].length > 1) return ASK_GROUP
  return ASK[item.type]
}

/**
 * What the speaker button on an item's task plaque reads: the instruction, then the word.
 * Wörter mit ie keeps the word back while a picture carries the task (it is a hint then).
 */
export function askParts(item: Item): string[] {
  if (item.type === 'ie' && item.image) return [askOf(item)]
  return [askOf(item), wordOf(item)]
}

/** The rule hint: the item's own, the umlaut change of a plural, or the exercise default. */
export function ruleOf(item: Item): string {
  if (item.hint) return item.hint
  const change =
    item.type === 'mehrzahl' || item.type === 'umlaut'
      ? umlautChange(item.prompt, item.answer)
      : item.type === 'einzahl'
        ? singularChange(item)
        : undefined
  return change ? T.umlautRule(change.from, change.to) : DEFAULT_HINT[item.type]
}

/** Austernbank, step 1: the pearl question for this word's vowel. */
export const pearlAskOf = (item: Item) => T.pearlAsk(pearlVowel(item).from)

/** Strudel, after a right umlaut answer, or undefined. */
export function becauseLine(item: Item): string | undefined {
  const b = becauseOf(item)
  return b && T.because(b.plural, b.umlaut, b.singular)
}

/** Strudel: the singular with its article, as it is spoken. */
export const singularOf = (item: Item) => (item.article ? `${item.article} ${item.answer}` : item.answer)

/**
 * Every spoken text, by who says it. The narrator (one voice) reads instructions, tips and
 * feedback; words, plurals, sounds and sentences come in several voices, picked at random
 * each time (decided 2026-11-04, see PRODUCT.md › Audio).
 */
export function spokenRoles(items: Item[]): { narrator: string[]; words: string[] } {
  const narrator = [
    ...Object.values(ASK),
    ASK_SATZ,
    ASK_GROUP,
    ...PRAISE,
    ...GENTLE,
    T.askName,
    T.askDragonName,
    T.tapEgg,
    T.fedSay,
    T.tapDragonSay,
    T.grewSay,
    T.almostNoun,
    T.almostCase,
    T.hintStart,
    T.hintShow,
    T.hintListen,
    T.hintChoice,
    T.satzMissed,
    T.satzColor,
    T.satzShow,
    ...Object.values(DEFAULT_HINT).map(T.hintRule),
    T.pearlHint,
    ...items.flatMap((i) => [askOf(i), T.hintRule(ruleOf(i))]),
    ...items.flatMap((i) => (i.type === 'umlaut' ? [pearlAskOf(i)] : [])),
    ...items.flatMap((i) => (i.type === 'einzahl' ? [becauseLine(i) ?? ''] : [])),
  ]
  const words = items.flatMap((i) => [
    wordOf(i),
    ...(i.type === 'mehrzahl' || i.type === 'umlaut' ? [i.answer] : []),
    ...(i.type === 'einzahl' ? [singularOf(i)] : []),
  ])
  const n = unique(narrator)
  const said = new Set(n)
  return { narrator: n, words: unique(words).filter((w) => !said.has(w)) }
}

/** All spoken texts, each once. */
export function spokenTexts(items: Item[]): string[] {
  const { narrator, words } = spokenRoles(items)
  return [...narrator, ...words]
}

const unique = (texts: string[]) => [...new Set(texts.map(speechKey))].filter(Boolean)
