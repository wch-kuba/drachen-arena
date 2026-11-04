// Every text the app can read aloud. scripts/gen-audio.ts turns each into a voice clip;
// the player looks clips up by the same key. Keep this the single source for spoken text.

import { normalize } from '../engine/check.ts'
import type { Item } from '../engine/types.ts'
import { ASK, DEFAULT_HINT, T } from '../strings.ts'

/** Clip lookup key: same text → same clip, regardless of stray spaces or Unicode form. */
export const speechKey = (text: string) => normalize(text)

/** What the speaker button on an item's task plaque reads: the instruction, then the word. */
export const askParts = (item: Item): string[] => [ASK[item.type], item.prompt]

export function spokenTexts(items: Item[]): string[] {
  const texts = [
    ...Object.values(ASK),
    T.right,
    T.almostNoun,
    T.almostCase,
    T.hintStart,
    T.hintShow,
    ...Object.values(DEFAULT_HINT).map(T.hintRule),
    ...items.flatMap((i) => [i.prompt, i.answer, ...(i.hint ? [T.hintRule(i.hint)] : [])]),
  ]
  return [...new Set(texts.map(speechKey))].filter(Boolean)
}
