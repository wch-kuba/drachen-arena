import type { ComponentChildren, JSX } from 'preact'
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { play } from '../engine/sfx.ts'
import type { Attempt } from '../engine/attempt.ts'
import { answer, current, isOver, next, startRound, type Result, type Round } from '../engine/round.ts'
import type { Item } from '../engine/types.ts'
import { isSentence } from '../engine/words.ts'
import { GENTLE, PRAISE, pick, T } from '../strings.ts'
import { Gem, HoardLedge, IconClose, IconLight } from '../ui/art.tsx'
import { Speak } from '../ui/Speak.tsx'
import { LautChoice, ShortLong } from './ex/Choice.tsx'
import { Sentence } from './ex/Sentence.tsx'
import { Typed } from './ex/Typed.tsx'

// One round of an exercise. The frame (gem track, hoard ledge, the gem that flies onto it)
// stays for the whole round; each item mounts its own view, so modes can mix in one round.

/** What an item view gets from the round. */
export interface Play {
  item: Item
  attempt: Attempt
  /** Check an answer (typed word, chosen option or encoded coloring). Returns the new attempt. */
  submit: (given: string) => Attempt
  next: () => void
  /** Put this on the answer element: the gem starts its flight there. */
  anchor: (el: HTMLElement | null) => void
  /** The hoard ledge, placed by the view in its layout. */
  ledge: JSX.Element
}

function viewFor(item: Item): (p: Play) => JSX.Element {
  switch (item.type) {
    case 'laute':
      return isSentence(item) ? Sentence : LautChoice
    case 'kurzlang':
      return ShortLong
    default:
      return Typed
  }
}

interface Props {
  items: Item[]
  onItemDone: (r: Result) => void
  onRoundDone: (r: Round) => void
  onExit: () => void
}

export function RoundPlayer({ items, onItemDone, onRoundDone, onExit }: Props) {
  const [round, setRound] = useState(() => startRound(items))
  const [flight, setFlight] = useState<string | null>(null)
  const [landed, setLanded] = useState(0)
  const anchorEl = useRef<HTMLElement | null>(null)
  const anchor = useRef((el: HTMLElement | null) => void (anchorEl.current = el)).current
  const ledgeRef = useRef<HTMLDivElement>(null)

  const goNext = () => {
    const r = next(round)
    if (isOver(r)) return onRoundDone(r)
    setRound(r)
  }

  // Hardware Enter moves on after a right answer.
  const goNextRef = useRef(goNext)
  goNextRef.current = goNext
  const right = round.attempt.done
  useLayoutEffect(() => {
    if (!right) return
    const on = (e: KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), goNextRef.current())
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [right])

  const flyGem = () => {
    const from = anchorEl.current?.getBoundingClientRect()
    const slot = ledgeRef.current?.getBoundingClientRect()
    if (!from || !slot) {
      play('gem')
      return setLanded((g) => g + 1)
    }
    const sx = from.left + from.width / 2 - 22
    const sy = from.top + from.height / 2 - 22
    const ex = slot.left + slot.width / 2 - 22
    const ey = slot.bottom - slot.height * 0.45 - 22
    // Arc up and over: a gem has weight.
    setFlight(`path("M${sx} ${sy} Q${(sx + ex) / 2} ${Math.min(sy, ey) - 140} ${ex} ${ey}")`)
    window.setTimeout(() => {
      play('gem')
      setFlight(null)
      setLanded((g) => g + 1)
    }, 900)
  }

  const item = current(round)
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

  const submit = (given: string) => {
    const res = answer(round, given)
    setRound(res.round)
    if (res.finished) {
      onItemDone(res.finished)
      flyGem()
    }
    return res.round.attempt
  }

  const done = round.results.length
  const View = viewFor(item)

  return (
    <div class="ex grotto" data-ex={item.type}>
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

      <View
        key={round.index}
        item={item}
        attempt={round.attempt}
        submit={submit}
        next={goNext}
        anchor={anchor}
        ledge={
          <div class="ledge" ref={ledgeRef}>
            <HoardLedge gems={landed} />
          </div>
        }
      />

      {flight && (
        <span class="flying-gem" style={{ '--gem-path': flight, left: 0, top: 0 }}>
          <Gem />
        </span>
      )}
    </div>
  )
}

/** Feedback pane: gold for right, coral for almost and hints. */
export function Feedback({ tone, say, children }: { tone: 'right' | 'almost'; say?: string[]; children: ComponentChildren }) {
  return (
    <div class="plaque feedback" data-tone={tone} role="status">
      {tone === 'right' ? <Gem /> : <IconLight />}
      <span class="feedback-text">{children}</span>
      {say && <Speak text={say} />}
    </div>
  )
}

/** Right answer: a praise line, in turn, picked once when the pane appears. */
export function RightFeedback() {
  const [line] = useState(() => pick(PRAISE))
  useEffect(() => play('right'), [])
  return <Feedback tone="right">{line}</Feedback>
}

/** First hint after a wrong try: a warm line first, then the help. Both are read aloud. */
export function HintFeedback({ say, children }: { say?: string[]; children: ComponentChildren }) {
  const [lead] = useState(() => pick(GENTLE))
  useEffect(() => play('hint'), [])
  return (
    <Feedback tone="almost" say={say && [lead, ...say]}>
      <span class="feedback-lead">{lead}</span> {children}
    </Feedback>
  )
}

/** The gold Weiter button after a right answer. */
export const NextButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" class="btn-gold kb-done" onClick={onClick}>
    {T.next}
  </button>
)
