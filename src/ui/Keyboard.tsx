import { useLayoutEffect, useRef, useState } from 'preact/hooks'
import { T } from '../strings.ts'
import { IconBackspace } from './art.tsx'

// German layout (QWERTZ), Ä Ö Ü ß always visible. No autocorrect, no system keyboard.
// Umlauts get their own row so letter keys stay wide enough for small fingers on a phone.
// A hardware keyboard (iPad keyboard case, desktop) types into the same answer.
const ROWS = [
  ['ä', 'ö', 'ü', 'ß'],
  ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['y', 'x', 'c', 'v', 'b', 'n', 'm'],
]
const UMLAUTS = new Set(['ä', 'ö', 'ü', 'ß'])
const LETTER = /^[a-zäöüß]$/i
const FLASH_MS = 120

interface Props {
  upper: boolean
  onKey: (ch: string) => void
  onBackspace: () => void
  onShift: () => void
  onDone: () => void
  canSubmit: boolean
}

export function Keyboard({ upper, onKey, onBackspace, onShift, onDone, canSubmit }: Props) {
  const show = (k: string) => (upper && k !== 'ß' ? k.toUpperCase() : k)
  // The key that was just hit (by touch or hardware) shows pressed for a moment.
  const [down, setDown] = useState<string | null>(null)
  const timer = useRef<number>(undefined)
  const flash = (k: string) => {
    setDown(k)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setDown(null), FLASH_MS)
  }

  const props = useRef({ onKey, onBackspace, onDone, canSubmit })
  props.current = { onKey, onBackspace, onDone, canSubmit }

  // Layout effect: listening from the first frame, so no early key is lost.
  useLayoutEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const p = props.current
      if (LETTER.test(e.key)) {
        e.preventDefault()
        flash(e.key.toLowerCase())
        p.onKey(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        flash('back')
        p.onBackspace()
      } else if (e.key === 'Enter' && p.canSubmit) {
        e.preventDefault()
        p.onDone()
      }
    }
    addEventListener('keydown', on)
    return () => {
      removeEventListener('keydown', on)
      clearTimeout(timer.current)
    }
  }, [])

  return (
    <div class="kb" role="group" aria-label="Tastatur">
      {ROWS.map((row, i) => (
        <div class="kb-row" data-umlauts={i === 0 ? '' : undefined}>
          {i === 3 && (
            <button
              type="button"
              class="key key-wide"
              aria-label="Großbuchstabe"
              aria-pressed={upper}
              data-umlaut={upper ? '' : undefined}
              onClick={onShift}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 4l8 9h-4.5v7h-7v-7H4z" fill={upper ? 'currentColor' : 'none'} />
              </svg>
            </button>
          )}
          {row.map((k) => (
            <button
              type="button"
              class="key"
              data-umlaut={UMLAUTS.has(k) ? '' : undefined}
              data-down={down === k ? '' : undefined}
              onClick={() => {
                flash(k)
                onKey(show(k))
              }}
            >
              {show(k)}
            </button>
          ))}
          {i === 3 && (
            <button
              type="button"
              class="key key-wide"
              aria-label="Löschen"
              data-down={down === 'back' ? '' : undefined}
              onClick={() => {
                flash('back')
                onBackspace()
              }}
            >
              <IconBackspace />
            </button>
          )}
        </div>
      ))}
      <button type="button" class="btn-gold kb-done" disabled={!canSubmit} onClick={onDone}>
        {T.done}
      </button>
    </div>
  )
}
