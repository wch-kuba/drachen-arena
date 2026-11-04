// Answer checking. Strict about spelling, gentle about capitals, never needs an article.

export type Verdict =
  | { kind: 'right' }
  /** Letters right, capitals wrong. `flag` = indices of the letters to fix. */
  | { kind: 'almost'; reason: 'noun-case' | 'case'; flag: number[] }
  | { kind: 'wrong' }

const ARTICLE = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer)\s+/i

/** NFC so a composed and a decomposed "ü" are the same; trim and collapse spaces. */
export function normalize(s: string): string {
  return s.normalize('NFC').trim().replace(/\s+/g, ' ')
}

/** "die Hüte" → "Hüte", unless the answer itself starts with an article. */
function stripArticle(typed: string, answer: string): string {
  if (ARTICLE.test(answer)) return typed
  return typed.replace(ARTICLE, '')
}

export function check(typedRaw: string, answerRaw: string): Verdict {
  const answer = normalize(answerRaw)
  const typed = stripArticle(normalize(typedRaw), answer)

  if (typed === answer) return { kind: 'right' }

  if (typed.toLowerCase() === answer.toLowerCase()) {
    const t = [...typed]
    const a = [...answer]
    const flag = a.flatMap((ch, i) => (ch === t[i] ? [] : [i]))
    // A noun typed in small letters gets the noun rule; anything else a general capitals nudge.
    const nounCase = isUpper(a[0]) && !isUpper(t[0]) && flag.length === 1
    return { kind: 'almost', reason: nounCase ? 'noun-case' : 'case', flag }
  }

  return { kind: 'wrong' }
}

const isUpper = (ch: string | undefined) => !!ch && ch !== ch.toLowerCase()
