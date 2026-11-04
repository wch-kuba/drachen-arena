import { useState } from 'preact/hooks'
import { askOf, askParts } from '../../content/speech.ts'
import { normalize } from '../../engine/check.ts'
import { encode, units, type Laut, type Unit } from '../../engine/words.ts'
import { T } from '../../strings.ts'
import { Speak } from '../../ui/Speak.tsx'
import { COLOR, EXAMPLES } from './Choice.tsx'
import { Feedback, NextButton, type Play, RightFeedback } from '../Exercise.tsx'

// Laute, sentence mode (1B), like the school test: tap a letter, then its color.
// gelb = Selbstlaut, grün = Zwielaut, blau = Umlaut. These three colors appear nowhere else.
// A Zwielaut is one tap target of two letters. Checking keeps every right color:
//   try 1 → soft coral rings on the letters still to do
//   try 2 → the rings show the color to use
//   try 3 → the right colors are filled in; the child taps Fertig

const isLetter = (s: string) => /\p{L}/u.test(s)

export function Sentence({ item, attempt: a, submit, next, anchor, ledge }: Play) {
  const chars = [...normalize(item.prompt)]
  const all = units(item.prompt)
  const [marks, setMarks] = useState<Record<number, Laut>>({})
  /** Start index of the selected units. */
  const [sel, setSel] = useState<number[]>([])
  /** Units still to do after a check (start index → the class they need). */
  const [todo, setTodo] = useState<Record<number, Laut>>({})
  const [nudge, setNudge] = useState(0)

  const unitOf = (at: number) => all.find((u) => u.at === at)!
  const span = (u: Unit) => Array.from({ length: u.len }, (_, k) => u.at + k)

  const tap = (u: Unit) => {
    if (a.done) return
    if (marks[u.at]) {
      // A painted letter is picked up again to be repainted.
      const next = { ...marks }
      span(u).forEach((i) => delete next[i])
      setMarks(next)
      setSel((s) => [...s, u.at])
      return
    }
    setSel((s) => (s.includes(u.at) ? s.filter((x) => x !== u.at) : [...s, u.at]))
  }

  const paint = (l: Laut) => {
    if (a.done || !sel.length) return
    const next = { ...marks }
    const rest = { ...todo }
    for (const at of sel) {
      span(unitOf(at)).forEach((i) => (next[i] = l))
      delete rest[at]
    }
    setMarks(next)
    setTodo(rest)
    setSel([])
  }

  const check = () => {
    const at = submit(encode(chars.length, (i) => marks[i]))
    setSel([])
    if (at.done) return setTodo({})
    setNudge((n) => n + 1)
    const keep: Record<number, Laut> = {}
    const left: Record<number, Laut> = {}
    for (const u of all) {
      const right = u.laut && marks[u.at] === u.laut
      if (right || (at.hint >= 3 && u.laut)) span(u).forEach((i) => (keep[i] = u.laut!))
      else if (u.laut) left[u.at] = u.laut
    }
    // Wrong colors (and colored consonants) are wiped; the rings show what is still to do.
    setMarks(keep)
    setTodo(left)
  }

  // Group the units into words for wrapping.
  const words: Unit[][] = [[]]
  for (const u of all) {
    if (chars[u.at] === ' ') words.push([])
    else words[words.length - 1].push(u)
  }

  const feedback = a.done ? (
    <RightFeedback />
  ) : a.hint === 1 ? (
    <Feedback tone="almost" say={[T.satzMissed]}>
      {T.satzMissed}
    </Feedback>
  ) : a.hint === 2 ? (
    <Feedback tone="almost" say={[T.satzColor]}>
      {T.satzColor}
    </Feedback>
  ) : a.hint === 3 ? (
    <Feedback tone="almost" say={[T.satzShow]}>
      {T.satzShow}
    </Feedback>
  ) : null

  return (
    <>
      <div class="ex-left">
        <div class="plaque ex-card">
          <div class="ex-ask">
            <Speak text={askParts(item)} />
            {askOf(item)}
          </div>
          <p class="sentence" ref={anchor} key={nudge} data-nudge={nudge ? '' : undefined} data-done={a.done ? '' : undefined}>
            {words.map((w) => (
              <span class="w">
                {w.map((u) => {
                  const text = chars.slice(u.at, u.at + u.len).join('')
                  if (!isLetter(text)) return <span class="p">{text}</span>
                  const selected = sel.includes(u.at)
                  const need = todo[u.at]
                  return (
                    <button
                      type="button"
                      class="l"
                      data-c={marks[u.at] ? COLOR[marks[u.at]] : undefined}
                      data-sel={selected ? '' : undefined}
                      // While picked, the selection look wins over the ring, so the tap shows.
                      data-miss={need && !selected && a.hint === 1 ? '' : undefined}
                      data-want={need && !selected && a.hint >= 2 ? COLOR[need] : undefined}
                      aria-pressed={selected}
                      onClick={() => tap(u)}
                    >
                      {text}
                    </button>
                  )
                })}
              </span>
            ))}
          </p>
        </div>
        {feedback && <div key={`${a.hint}-${nudge}-${a.done}`}>{feedback}</div>}
      </div>

      <div class="ex-right">
        {ledge}
        <div class="legend">
          {(['Selbstlaut', 'Zwielaut', 'Umlaut'] as Laut[]).map((l) => (
            <button type="button" class={COLOR[l]} disabled={a.done} onClick={() => paint(l)}>
              <b>{EXAMPLES[l]}</b>
              {l}
            </button>
          ))}
        </div>
        {a.done ? (
          <NextButton onClick={next} />
        ) : (
          <button type="button" class="btn-gold" disabled={!Object.keys(marks).length} onClick={check}>
            {T.done}
          </button>
        )}
      </div>
    </>
  )
}
