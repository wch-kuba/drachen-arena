import { IconBackspace } from './art.tsx'

// German layout (QWERTZ), Ä Ö Ü ß always visible. No autocorrect, no system keyboard.
// Umlauts get their own row so letter keys stay wide enough for small fingers on a phone.
const ROWS = [
  ['ä', 'ö', 'ü', 'ß'],
  ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['y', 'x', 'c', 'v', 'b', 'n', 'm'],
]
const UMLAUTS = new Set(['ä', 'ö', 'ü', 'ß'])

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
            <button type="button" class="key" data-umlaut={UMLAUTS.has(k) ? '' : undefined} onClick={() => onKey(show(k))}>
              {show(k)}
            </button>
          ))}
          {i === 3 && (
            <button type="button" class="key key-wide" aria-label="Löschen" onClick={onBackspace}>
              <IconBackspace />
            </button>
          )}
        </div>
      ))}
      <button type="button" class="btn-gold kb-done" disabled={!canSubmit} onClick={onDone}>
        Fertig
      </button>
    </div>
  )
}
