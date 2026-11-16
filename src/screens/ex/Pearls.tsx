import { useRef, useState } from 'preact/hooks'
import { pearlAskOf } from '../../content/speech.ts'
import { play } from '../../engine/sfx.ts'
import { indefinite, pearlVowel, withDots, withoutArticle } from '../../engine/words.ts'
import { T } from '../../strings.ts'
import { Speak } from '../../ui/Speak.tsx'
import { WordPicture } from '../../ui/WordPicture.tsx'
import { Feedback, HintFeedback, type Play } from '../Exercise.tsx'
import { Typed } from './Typed.tsx'

// Austernbank (Part 15): first the one decision the child misses on the test, does the vowel
// get two dots for the plural? The "Zwei Punkte" option carries its dots as two pearls; a right
// choice sends them arcing onto the vowel, which turns into ä, ö, ü or äu. Then the plural is
// typed as in the Mehrzahl land. A wrong choice counts as a wrong try (crystals) and gets a
// hint, never a penalty; with two options the other one is then pointed out.

type Choice = 'yes' | 'no'
const FLY_MS = 760
const SETTLE_MS = 620

export function Pearls(p: Play) {
  const { item, miss } = p
  const v = pearlVowel(item)
  const changes = !!v.to
  const right: Choice = changes ? 'yes' : 'no'

  const [phase, setPhase] = useState<'ask' | 'done' | 'type'>('ask')
  const [wrong, setWrong] = useState<Choice>()
  const [dotted, setDotted] = useState(false)
  const [flight, setFlight] = useState<string[]>()
  const vowelEl = useRef<HTMLElement>(null)
  const pearlEls = useRef<(HTMLElement | null)[]>([])

  if (phase === 'type') return <Typed {...p} />

  const go = (after: number) => window.setTimeout(() => setPhase('type'), after)

  const choose = (c: Choice) => {
    if (phase !== 'ask' || c === wrong) return
    if (c !== right) {
      setWrong(c)
      miss()
      return
    }
    setPhase('done')
    if (c === 'no') {
      play('right')
      return go(SETTLE_MS + 400)
    }
    // Each pearl arcs from its place over the letter on the button to the vowel on the plaque.
    const to = vowelEl.current?.getBoundingClientRect()
    const paths = pearlEls.current.map((el, i) => {
      const from = el?.getBoundingClientRect()
      if (!from || !to) return ''
      const sx = from.left
      const sy = from.top
      const ex = to.left + to.width * (i ? 0.62 : 0.3) - from.width / 2
      const ey = to.top + to.height * 0.04
      return `path("M${sx} ${sy} Q${(sx + ex) / 2} ${Math.min(sy, ey) - 90} ${ex} ${ey}")`
    })
    setFlight(paths.every(Boolean) ? paths : undefined)
    window.setTimeout(() => {
      setFlight(undefined)
      setDotted(true)
      play('gem')
    }, FLY_MS)
    go(FLY_MS + SETTLE_MS + 300)
  }

  const word = [...withoutArticle(item.prompt)]
  const vowel = word.slice(v.at, v.at + v.from.length).join('')
  // Keep the capital of a word that starts with its vowel (Apfel → Äpfel, Auto).
  const dottedVowel = vowel[0] === vowel[0].toUpperCase() ? withDots(vowel.toLowerCase()).replace(/^./, (c) => c.toUpperCase()) : withDots(vowel)
  const decided = phase === 'done'
  const ask = pearlAskOf(item)

  let feedback = null
  if (wrong && !decided)
    feedback = (
      <HintFeedback say={[T.pearlHint, item.answer]}>
        {T.pearlHint} <span class="nw">{T.hintChoice}</span>
      </HintFeedback>
    )
  else if (decided && right === 'no') feedback = <Feedback tone="right">{T.pearlStays(vowel.toLowerCase())}</Feedback>

  return (
    <>
      <div class="ex-left">
        <div class="plaque ex-card">
          <div class="ex-ask">
            <Speak text={[ask, item.prompt]} />
            {ask}
          </div>
          <WordPicture image={item.image} label={withoutArticle(item.prompt)} />
          <p class="ex-word">
            <span class="nw">
              <small>{indefinite(item.prompt)}</small> {word.slice(0, v.at).join('')}
              <span
                class="pearl-vowel"
                ref={vowelEl}
                data-state={dotted ? 'dotted' : decided ? 'stays' : undefined}
                key={dotted ? 'd' : 'v'}
              >
                {dotted ? dottedVowel : vowel}
              </span>
              {word.slice(v.at + v.from.length).join('')}
            </span>{' '}
            <small>– viele …</small>
          </p>
        </div>
        {feedback && <div key={`${wrong}-${decided}`}>{feedback}</div>}
      </div>

      <div class="ex-right">
        <div class="marks pearl-options" ref={p.anchor}>
          <button
            type="button"
            class="mark-btn pearl-btn"
            data-wrong={wrong === 'yes' ? '' : undefined}
            data-last={wrong === 'no' && !decided ? '' : undefined}
            data-chosen={decided && right === 'yes' ? '' : undefined}
            disabled={wrong === 'yes' || (decided && right !== 'yes')}
            onClick={() => choose('yes')}
          >
            <span class="pearl-glyph">
              {/* The two dots are pearls, sitting over the letter they would change. */}
              <span class="pearl-dots" data-gone={flight || dotted ? '' : undefined}>
                <span class="pearl" ref={(el) => void (pearlEls.current[0] = el)} />
                <span class="pearl" ref={(el) => void (pearlEls.current[1] = el)} />
              </span>
              {vowel.toLowerCase()}
            </span>
            {T.pearlYes}
          </button>
          <button
            type="button"
            class="mark-btn pearl-btn"
            data-wrong={wrong === 'no' ? '' : undefined}
            data-last={wrong === 'yes' && !decided ? '' : undefined}
            data-chosen={decided && right === 'no' ? '' : undefined}
            disabled={wrong === 'no' || (decided && right !== 'no')}
            onClick={() => choose('no')}
          >
            <span class="pearl-glyph">{vowel.toLowerCase()}</span>
            {T.pearlNo}
          </button>
        </div>
      </div>

      {flight?.map((path, i) => (
        <span class="pearl pearl-flying" style={{ '--pearl-path': path, animationDelay: `${i * 70}ms` }} />
      ))}
    </>
  )
}
