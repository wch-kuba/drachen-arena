import { useLayoutEffect, useRef, useState } from 'preact/hooks'
import { askParts } from '../content/speech.ts'
import { revealCount } from '../engine/attempt.ts'
import { answer, current, isOver, next, startRound, type Round } from '../engine/round.ts'
import type { Item } from '../engine/types.ts'
import { ASK, DEFAULT_HINT, T } from '../strings.ts'
import { Gem, HoardLedge, IconClose, IconLight } from '../ui/art.tsx'
import { Keyboard } from '../ui/Keyboard.tsx'
import { Speak } from '../ui/Speak.tsx'
import { WordPicture } from '../ui/WordPicture.tsx'

// Exercise 2 (Einzahl und Mehrzahl), driven by a real round from the engine.
// Feedback: right, almost (capitals), graded hints after wrong tries, copy step at the end.

interface Props {
  items: Item[]
  onItemDone: (r: NonNullable<ReturnType<typeof answer>['finished']>) => void
  onRoundDone: (r: Round) => void
  onExit: () => void
}

/** Room for a few extra letters past the answer, so a wrong (longer) try can be typed. */
const EXTRA = 3

export function Plural({ items, onItemDone, onRoundDone, onExit }: Props) {
  const [round, setRound] = useState(() => startRound(items))
  const [text, setText] = useState('')
  const [upper, setUpper] = useState(true)
  const [nudge, setNudge] = useState(0)
  const [flight, setFlight] = useState<string | null>(null)
  const [landed, setLanded] = useState(0)
  const cellsRef = useRef<HTMLDivElement>(null)
  const ledgeRef = useRef<HTMLDivElement>(null)

  const item = current(round)
  const a = round.attempt
  const verdict = a.last
  const right = a.done
  // Editing after feedback hides the verdict until the next try.
  const [fresh, setFresh] = useState(false)
  const showVerdict = verdict && !fresh

  const goNext = () => {
    const r = next(round)
    if (isOver(r)) return onRoundDone(r)
    setRound(r)
    setText('')
    setUpper(true)
    setFresh(false)
  }

  // Hardware Enter moves on after a right answer (the keyboard is hidden then).
  const goNextRef = useRef(goNext)
  goNextRef.current = goNext
  useLayoutEffect(() => {
    if (!right) return
    const on = (e: KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), goNextRef.current())
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [right])

  if (!item) {
    return (
      <div class="ex grotto">
        <p class="ex-empty">{T.empty}</p>
        <button type="button" class="btn-gold" onClick={onExit}>
          {T.home}
        </button>
      </div>
    )
  }

  const max = [...item.answer].length + EXTRA

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
      const next = [...t].slice(0, -1).join('')
      if (next.length === 0) setUpper(true)
      return next
    })
    setFresh(true)
  }

  const flyGem = () => {
    const from = cellsRef.current?.getBoundingClientRect()
    const slot = ledgeRef.current?.getBoundingClientRect()
    if (!from || !slot) return setLanded((g) => g + 1)
    const sx = from.left + from.width / 2 - 22
    const sy = from.top + from.height / 2 - 22
    const ex = slot.left + slot.width / 2 - 22
    const ey = slot.bottom - slot.height * 0.45 - 22
    // Arc up and over: a gem has weight.
    setFlight(`path("M${sx} ${sy} Q${(sx + ex) / 2} ${Math.min(sy, ey) - 140} ${ex} ${ey}")`)
    window.setTimeout(() => {
      setFlight(null)
      setLanded((g) => g + 1)
    }, 900)
  }

  const submit = () => {
    const res = answer(round, text)
    setRound(res.round)
    setFresh(false)
    if (res.finished) {
      onItemDone(res.finished)
      flyGem()
      return
    }
    setNudge((n) => n + 1)
    // Once letters are revealed the child starts fresh on top of the model; before that
    // (rule hint, "almost") the typed letters stay so the child can fix them.
    if (res.round.attempt.last?.kind === 'wrong' && res.round.attempt.hint >= 2) {
      setText('')
      setUpper(true)
    }
  }

  // Cells: one per letter of the answer (plus room while typing past it).
  const ans = [...item.answer]
  const typed = [...text]
  const reveal = a.hint >= 3 ? ans.length : a.hint >= 2 ? revealCount(item) : 0
  const flagged = new Set(showVerdict && verdict.kind === 'almost' ? verdict.flag : [])
  const width = Math.max(ans.length, typed.length)
  const cells = Array.from({ length: width }, (_, i) => {
    const ch = typed[i]
    const model = !ch && i < reveal ? ans[i] : undefined
    return { ch, model, flag: flagged.has(i), cursor: i === typed.length && !right }
  })

  const singular = item.prompt.replace(/^\S+\s+/, '')
  const rule = item.hint ?? DEFAULT_HINT[item.type]
  const done = round.results.length

  let feedback: { tone: 'right' | 'almost'; text: string } | null = null
  if (right) feedback = { tone: 'right', text: T.right }
  else if (showVerdict && verdict.kind === 'almost')
    feedback = { tone: 'almost', text: verdict.reason === 'noun-case' ? T.almostNoun : T.almostCase }
  else if (a.hint === 1) feedback = { tone: 'almost', text: T.hintRule(rule) }
  else if (a.hint === 2) feedback = { tone: 'almost', text: reveal > 0 ? T.hintStart : T.hintRule(rule) }
  else if (a.hint === 3) feedback = { tone: 'almost', text: T.hintShow }

  return (
    <div class="ex grotto">
      <div class="ex-bar">
        <button type="button" class="btn-round" aria-label={T.exit} onClick={onExit}>
          <IconClose />
        </button>
        <div class="gem-track" aria-label={T.progress(done, round.items.length)}>
          {round.items.map((_, i) => (
            <Gem filled={i < done} />
          ))}
        </div>
      </div>

      <div class="ex-left">
        <div class="plaque ex-card">
          <div class="ex-ask">
            <Speak text={askParts(item)} />
            {ASK.mehrzahl}
          </div>
          <WordPicture image={item.image} />
          <p class="ex-word">
            <small>ein</small> {singular}{'\u00a0'}<small>– viele …</small>
          </p>
        </div>

        {feedback && (
          <div class="plaque feedback" data-tone={feedback.tone} role="status" key={`${done}-${a.hint}-${nudge}`}>
            {feedback.tone === 'right' ? <Gem /> : <IconLight />}
            {feedback.text}
          </div>
        )}
        <div class="ledge" ref={ledgeRef}>
          <HoardLedge gems={landed} dragon={false} />
        </div>
      </div>

      <div class="ex-right">
        <div
          class="cells"
          ref={cellsRef}
          data-state={right ? 'right' : nudge ? 'nudge' : undefined}
          key={`${round.index}-${nudge}`}
          aria-live="polite"
        >
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
        </div>

        {right ? (
          <button type="button" class="btn-gold kb-done" onClick={goNext}>
            {T.next}
          </button>
        ) : (
          <Keyboard
            upper={upper}
            onKey={type}
            onBackspace={back}
            onShift={() => setUpper(!upper)}
            onDone={submit}
            canSubmit={text.length > 0}
          />
        )}
      </div>

      {flight && (
        <span class="flying-gem" style={{ '--gem-path': flight, left: 0, top: 0 }}>
          <Gem />
        </span>
      )}
    </div>
  )
}
