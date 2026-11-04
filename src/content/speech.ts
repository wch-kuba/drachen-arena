// Every text the app can read aloud. scripts/gen-audio.ts turns each into a voice clip;
// the player looks clips up by the same key. Keep this the single source for spoken text.

import { normalize } from '../engine/check.ts'
import type { Item } from '../engine/types.ts'
import { isSentence, umlautChange, wordOf } from '../engine/words.ts'
import { ASK, ASK_GROUP, ASK_SATZ, DEFAULT_HINT, T } from '../strings.ts'

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
  const change = item.type === 'mehrzahl' ? umlautChange(item.prompt, item.answer) : undefined
  return change ? T.umlautRule(change.from, change.to) : DEFAULT_HINT[item.type]
}

export function spokenTexts(items: Item[]): string[] {
  const texts = [
    ...Object.values(ASK),
    ASK_SATZ,
    ASK_GROUP,
    T.right,
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
    ...items.flatMap((i) => [
      ...askParts(i),
      wordOf(i),
      ...(i.type === 'mehrzahl' ? [i.answer] : []),
      T.hintRule(ruleOf(i)),
    ]),
  ]
  return [...new Set(texts.map(speechKey))].filter(Boolean)
}
