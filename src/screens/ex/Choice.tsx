import { useEffect, useState } from 'preact/hooks'
import { askOf, askParts, ruleOf } from '../../content/speech.ts'
import { speak } from '../../engine/audio.ts'
import { LAUTE, targetVowel, type Laut } from '../../engine/words.ts'
import { T } from '../../strings.ts'
import { MarkLong, MarkShort } from '../../ui/art.tsx'
import { Speak } from '../../ui/Speak.tsx'
import { Feedback, NextButton, type Play } from '../Exercise.tsx'

// The choice exercises: Laute with one sound (1, mode A) and Kurz oder lang (4).
// A wrong option nudges and goes quiet; the rule hint follows. When one option is left,
// it is pointed out. Nothing is ever taken away.

function useChoice({ item, attempt: a, submit }: Play, options: string[]) {
  const [wrong, setWrong] = useState<string[]>([])
  const [nudge, setNudge] = useState(0)
  const pick = (opt: string) => {
    if (a.done || wrong.includes(opt)) return
    if (!submit(opt).done) {
      setWrong((w) => [...w, opt])
      setNudge((n) => n + 1)
    }
  }
  const left = options.filter((o) => !wrong.includes(o))
  const lastOne = !a.done && wrong.length > 0 && left.length === 1 ? left[0] : undefined
  const feedback = a.done ? (
    <Feedback tone="right">{T.right}</Feedback>
  ) : lastOne ? (
    <Feedback tone="almost">{T.hintChoice}</Feedback>
  ) : wrong.length ? (
    <Feedback tone="almost" say={[T.hintRule(ruleOf(item))]}>
      {T.hintRule(ruleOf(item))}
    </Feedback>
  ) : null
  return { wrong, nudge, pick, lastOne, feedback }
}

/** The school's legend colors, used only for the three Laut classes. */
export const COLOR: Record<Laut, 'gelb' | 'gruen' | 'blau'> = { Selbstlaut: 'gelb', Zwielaut: 'gruen', Umlaut: 'blau' }
export const EXAMPLES: Record<Laut, string> = { Selbstlaut: 'a e i o u', Zwielaut: 'au\u00a0ei eu\u00a0äu', Umlaut: 'ä ö ü' }

export function LautChoice(p: Play) {
  const { item, attempt: a, next, anchor, ledge } = p
  const c = useChoice(p, LAUTE)
  return (
    <>
      <div class="ex-left">
        <div class="plaque ex-card">
          <div class="ex-ask">
            <Speak text={askParts(item)} />
            {askOf(item)}
          </div>
          <div class="sound" ref={anchor} data-nudge={c.nudge ? '' : undefined} data-c={a.done ? COLOR[item.answer as Laut] : undefined} key={c.nudge}>
            {item.prompt}
          </div>
        </div>
        {c.feedback && <div key={`${c.nudge}-${a.done}`}>{c.feedback}</div>}
      </div>

      <div class="ex-right">
        {ledge}
        <div class="legend" data-quiz="">
          {LAUTE.map((l) => (
            <button
              type="button"
              class={COLOR[l]}
              data-wrong={c.wrong.includes(l) ? '' : undefined}
              data-last={c.lastOne === l ? '' : undefined}
              data-chosen={a.done && item.answer === l ? '' : undefined}
              disabled={c.wrong.includes(l) || (a.done && item.answer !== l)}
              onClick={() => c.pick(l)}
            >
              {/* The letters of each class show once the rule hint is out. */}
              <b>{c.wrong.length ? EXAMPLES[l] : ''}</b>
              {l}
            </button>
          ))}
        </div>
        {a.done && <NextButton onClick={next} />}
      </div>
    </>
  )
}

export function ShortLong(p: Play) {
  const { item, attempt: a, next, anchor, ledge } = p
  const c = useChoice(p, [T.kurz, T.lang])
  const word = [...item.prompt]
  const v = targetVowel(item.prompt, item.at)

  // The word is heard right away; the speaker on the plaque replays it.
  useEffect(() => {
    speak(item.prompt)
  }, [])

  return (
    <>
      <div class="ex-left">
        <div class="plaque ex-card">
          <div class="ex-ask">
            <Speak text={askParts(item)} />
            {askOf(item)}
          </div>
          <p class="marks-word" ref={anchor} key={c.nudge} data-nudge={c.nudge ? '' : undefined}>
            {word.slice(0, v.at).join('')}
            <u data-mark={a.done ? item.answer : undefined}>{word.slice(v.at, v.at + v.len).join('')}</u>
            {word.slice(v.at + v.len).join('')}
          </p>
        </div>
        {c.feedback && <div key={`${c.nudge}-${a.done}`}>{c.feedback}</div>}
      </div>

      <div class="ex-right">
        {ledge}
        <div class="marks">
          {[T.kurz, T.lang].map((m) => (
            <button
              type="button"
              class="mark-btn"
              data-wrong={c.wrong.includes(m) ? '' : undefined}
              data-last={c.lastOne === m ? '' : undefined}
              data-chosen={a.done && item.answer === m ? '' : undefined}
              disabled={c.wrong.includes(m) || (a.done && item.answer !== m)}
              onClick={() => c.pick(m)}
            >
              {m === T.kurz ? <MarkShort /> : <MarkLong />}
              {m}
            </button>
          ))}
        </div>
        {a.done && <NextButton onClick={next} />}
      </div>
    </>
  )
}
