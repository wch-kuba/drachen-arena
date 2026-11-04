import { useRef, useState } from 'preact/hooks'
import { Gem, HoardLedge, IconClose, IconLight, IconSpeaker, PictureHat } from '../ui/art.tsx'
import { Keyboard } from '../ui/Keyboard.tsx'

// Demo of exercise 2 (Einzahl und Mehrzahl) with the real feedback states:
// right, almost (lowercase noun), and graded hints after a wrong answer.
// The engine in Part 3 replaces the hard-coded item.

const ITEM = { singular: 'der Hut', plural: 'Hüte', rule: 'Aus u wird oft ü.' }
const MAX = 7

type State = 'typing' | 'right' | 'almost' | 'wrong'

export function Plural({ done = 3, onExit }: { done?: number; onExit?: () => void }) {
  const [text, setText] = useState('')
  const [upper, setUpper] = useState(true)
  const [state, setState] = useState<State>('typing')
  const [hint, setHint] = useState(0) // 0 none, 1 rule, 2 partial, 3 full answer
  const [gems, setGems] = useState(done)
  const [nudge, setNudge] = useState(0)
  const [flight, setFlight] = useState<string | null>(null)
  const cellsRef = useRef<HTMLDivElement>(null)
  const ledgeRef = useRef<HTMLDivElement>(null)

  const type = (ch: string) => {
    if (state === 'right' || text.length >= MAX) return
    setText(text + ch)
    setUpper(false)
    if (state !== 'typing') setState('typing')
  }

  const back = () => {
    if (state === 'right') return
    const next = text.slice(0, -1)
    setText(next)
    if (next.length === 0) setUpper(true)
    if (state !== 'typing') setState('typing')
  }

  const flyGem = () => {
    const from = cellsRef.current?.getBoundingClientRect()
    const slot = ledgeRef.current?.getBoundingClientRect()
    if (!from || !slot) return
    const sx = from.left + from.width / 2 - 22
    const sy = from.top + from.height / 2 - 22
    const ex = slot.left + slot.width / 2 - 22
    const ey = slot.bottom - slot.height * 0.45 - 22
    // Arc up and over: a gem has weight.
    setFlight(`path("M${sx} ${sy} Q${(sx + ex) / 2} ${Math.min(sy, ey) - 140} ${ex} ${ey}")`)
    window.setTimeout(() => {
      setFlight(null)
      setGems((g) => g + 1)
    }, 900)
  }

  const submit = () => {
    if (text === ITEM.plural) {
      setState('right')
      flyGem()
    } else if (text.toLowerCase() === ITEM.plural.toLowerCase()) {
      setState('almost')
      setNudge((n) => n + 1)
    } else {
      setState('wrong')
      setHint((h) => Math.min(3, h + 1))
      setNudge((n) => n + 1)
    }
  }

  const reset = () => {
    setText('')
    setUpper(true)
    setState('typing')
    setHint(0)
  }

  // Cells: one per letter of the answer (plus room while typing past it).
  const width = Math.max(ITEM.plural.length, text.length)
  const cells = Array.from({ length: width }, (_, i) => {
    const ch = text[i]
    const flag = state === 'almost' && i === 0
    const reveal = !ch && (hint >= 3 || (hint >= 2 && i < 2)) ? ITEM.plural[i] : undefined
    return { ch, flag, reveal, cursor: i === text.length && state !== 'right' }
  })

  return (
    <div class="ex grotto">
      <div class="ex-bar">
        <button type="button" class="btn-round" aria-label="Zurück zur Grotte" onClick={onExit}>
          <IconClose />
        </button>
        <div class="gem-track" aria-label={`${gems} von 10`}>
          {Array.from({ length: 10 }, (_, i) => (
            <Gem filled={i < gems} />
          ))}
        </div>
      </div>

      <div class="ex-left">
        <div class="plaque ex-card">
          <div class="ex-ask">
            <button type="button" class="btn-round" aria-label="Vorlesen">
              <IconSpeaker />
            </button>
            Schreib die Mehrzahl.
          </div>
          <PictureHat />
          <p class="ex-word">
            <small>ein</small> Hut <small>– viele …</small>
          </p>
        </div>

        {state === 'right' && (
          <div class="plaque feedback" data-tone="right" role="status">
            <Gem />
            Super! Ein Kristall für deinen Schatz.
          </div>
        )}
        {state === 'almost' && (
          <div class="plaque feedback" data-tone="almost" role="status">
            <IconLight />
            Fast! Nomen schreibt man groß.
          </div>
        )}
        {state === 'wrong' && hint === 1 && (
          <div class="plaque feedback" data-tone="almost" role="status">
            <IconLight />
            Tipp: {ITEM.rule}
          </div>
        )}
        {state === 'wrong' && hint === 2 && (
          <div class="plaque feedback" data-tone="almost" role="status">
            <IconLight />
            So fängt es an. Schreib weiter!
          </div>
        )}
        {state === 'wrong' && hint === 3 && (
          <div class="plaque feedback" data-tone="almost" role="status">
            <IconLight />
            So heißt es. Schreib es ab.
          </div>
        )}
        <div class="ledge" ref={ledgeRef}>
          <HoardLedge gems={gems} dragon={false} />
        </div>
      </div>

      <div class="ex-right">
        <div class="cells" ref={cellsRef} data-state={state === 'right' ? 'right' : nudge ? 'nudge' : undefined} key={nudge} aria-live="polite">
          {cells.map((c) => (
            <span
              class="cell"
              data-filled={c.ch ? '' : undefined}
              data-flag={c.flag ? '' : undefined}
              data-reveal={c.reveal ? '' : undefined}
              data-cursor={c.cursor && !c.reveal ? '' : undefined}
            >
              {c.ch ?? c.reveal ?? ''}
            </span>
          ))}
        </div>

        {state === 'right' ? (
          <button type="button" class="btn-gold kb-done" onClick={reset}>
            Weiter
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
