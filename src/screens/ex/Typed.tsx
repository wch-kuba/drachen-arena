import { useEffect, useState } from 'preact/hooks'
import { askOf, askParts, ruleOf } from '../../content/speech.ts'
import { revealCount } from '../../engine/attempt.ts'
import { speak } from '../../engine/audio.ts'
import { gapParts, indefinite, umlautChange, withoutArticle, wordOf } from '../../engine/words.ts'
import { T } from '../../strings.ts'
import { Keyboard } from '../../ui/Keyboard.tsx'
import { Speak } from '../../ui/Speak.tsx'
import { hasPicture, WordPicture } from '../../ui/WordPicture.tsx'
import { Feedback, HintFeedback, NextButton, RightFeedback, type Play } from '../Exercise.tsx'

// The typed exercises: Einzahl und Mehrzahl (2), Fehlende Buchstaben (3), Wörter mit ie (5).
// The child builds the answer in letter cells on the custom keyboard. Feedback: right,
// almost (capitals), graded hints after wrong tries, copy step at the end.

const isUpper = (ch: string | undefined) => !!ch && ch !== ch.toLowerCase()

export function Typed({ item, attempt: a, submit, next, anchor }: Play) {
  const gap = item.type === 'luecke'
  const [before, after] = gap ? gapParts(item.prompt) : ['', '']
  // Nouns start with a capital; a gap inside a word starts small.
  const startUpper = gap ? before === '' && isUpper(item.answer[0]) : isUpper(item.answer[0])
  const word = wordOf(item)
  // Wörter mit ie without a picture yet (Part 7): the spoken word carries the task.
  const listenFirst = item.type === 'ie' && !hasPicture(item.image)

  const [text, setText] = useState('')
  const [upper, setUpper] = useState(startUpper)
  const [nudge, setNudge] = useState(0)
  // Editing after feedback hides the verdict until the next try.
  const [fresh, setFresh] = useState(false)

  useEffect(() => {
    if (listenFirst) speak([askOf(item), word])
  }, [])

  const verdict = a.last
  const right = a.done
  const showVerdict = verdict && !fresh
  const ans = [...item.answer]
  /** Room for a few extra letters past the answer, so a wrong (longer) try can be typed. */
  const max = ans.length + (gap ? 1 : 3)

  // Functional updates: a fast hardware keyboard can send several keys before one render.
  const type = (ch: string) => {
    if (right) return
    setText((t) => ([...t].length >= max ? t : t + ch))
    setUpper(false)
    setFresh(true)
  }

  const back = () => {
    if (right) return
    setText((t) => {
      const rest = [...t].slice(0, -1).join('')
      if (rest.length === 0) setUpper(startUpper)
      return rest
    })
    setFresh(true)
  }

  const check = () => {
    const at = submit(text)
    setFresh(false)
    if (at.done) return
    setNudge((n) => n + 1)
    // Once letters are revealed (or the answer is shown) the child starts fresh on top of the
    // model; before that (rule hint, "almost") the typed letters stay so they can be fixed.
    if (at.last?.kind === 'wrong' && at.hint >= 2) {
      setText('')
      setUpper(startUpper)
    }
    // A single-letter gap has no letters to reveal: the word is read again instead.
    if (gap && at.hint === 2 && revealCount(item) === 0) speak(word)
  }

  // Cells: one per letter of the answer (plus room while typing past it).
  const typed = [...text]
  const reveal = a.hint >= 3 ? ans.length : a.hint >= 2 ? revealCount(item) : 0
  const flagged = new Set(showVerdict && verdict.kind === 'almost' ? verdict.flag : [])
  const width = Math.max(ans.length, typed.length)
  const cells = Array.from({ length: width }, (_, i) => {
    const ch = typed[i]
    const model = !ch && i < reveal ? ans[i] : undefined
    return { ch, model, flag: flagged.has(i), cursor: i === typed.length && !right }
  })

  // Mehrzahl: the vowel that changes, highlighted in the rule hint and in the singular.
  const change = item.type === 'mehrzahl' && !item.hint ? umlautChange(item.prompt, item.answer) : undefined
  const rule = change ? (
    <>
      Tipp: Aus <b class="hl">{change.from}</b> wird <b class="hl">{change.to}</b>.
    </>
  ) : (
    T.hintRule(ruleOf(item))
  )
  const ruleSay = [T.hintRule(ruleOf(item))]

  let feedback = null
  if (right) feedback = <RightFeedback />
  else if (showVerdict && verdict.kind === 'almost')
    feedback = <Feedback tone="almost">{verdict.reason === 'noun-case' ? T.almostNoun : T.almostCase}</Feedback>
  else if (a.hint === 1)
    feedback = (
      <HintFeedback say={item.type === 'ie' ? [word] : ruleSay}>{rule}</HintFeedback>
    )
  else if (a.hint === 2)
    feedback =
      reveal > 0 ? (
        <Feedback tone="almost">{T.hintStart}</Feedback>
      ) : (
        <Feedback tone="almost" say={[word]}>
          {T.hintListen}
        </Feedback>
      )
  else if (a.hint === 3) feedback = <Feedback tone="almost">{T.hintShow}</Feedback>

  const singular = withoutArticle(item.prompt)
  const hl = change && a.hint >= 1 ? change : undefined

  return (
    <>
      <div class="ex-left">
        <div class="plaque ex-card">
          <div class="ex-ask">
            <Speak text={askParts(item)} />
            {askOf(item)}
          </div>
          {listenFirst ? <Speak big text={[word]} label={T.listen} /> : <WordPicture image={item.image} label={item.type === 'mehrzahl' ? word : T.picture} />}
          {item.type === 'mehrzahl' && (
            <p class="ex-word">
              {/* "eine Hand" stays on one line; "– viele …" may wrap below it. */}
              <span class="nw">
                <small>{indefinite(item.prompt)}</small>{' '}
                {hl ? (
                  <>
                    {[...singular].slice(0, hl.at).join('')}
                    <mark class="hl">{[...singular].slice(hl.at, hl.at + hl.from.length).join('')}</mark>
                    {[...singular].slice(hl.at + hl.from.length).join('')}
                  </>
                ) : (
                  singular
                )}
              </span>{' '}
              <small>– viele …</small>
            </p>
          )}
        </div>

        {feedback && <div key={`${a.hint}-${nudge}-${right}`}>{feedback}</div>}
      </div>

      <div class="ex-right">
        <div
          class="cells"
          ref={anchor}
          data-gap={gap ? '' : undefined}
          data-state={right ? 'right' : nudge ? 'nudge' : undefined}
          // Cell units across the row: the cells, plus the given letters (each ~0.6 of a cell).
          style={{ '--n': width + 0.6 * [...before, ...after].length }}
          key={nudge}
          aria-live="polite"
        >
          {before && <span class="cell-fixed">{before}</span>}
          {cells.map((c) => (
            <span
              class="cell"
              data-filled={c.ch ? '' : undefined}
              data-flag={c.flag ? '' : undefined}
              data-reveal={c.model ? '' : undefined}
              data-cursor={c.cursor && !c.model ? '' : undefined}
            >
              {c.ch ?? c.model ?? ''}
            </span>
          ))}
          {after && <span class="cell-fixed">{after}</span>}
        </div>

        {right ? (
          <NextButton onClick={next} />
        ) : (
          <Keyboard
            upper={upper}
            onKey={type}
            onBackspace={back}
            onShift={() => setUpper(!upper)}
            onDone={check}
            canSubmit={text.length > 0}
          />
        )}
      </div>
    </>
  )
}
